import { Server } from 'socket.io';
import { authenticateSocket } from './auth.socket.js';
import { setupChatHandlers } from './chat.socket.js';
import { Conversation } from '../models/conversation.model.js';
import { InMemoryPresenceStore } from './presence/presence.inmemory.js';
import { RedisPresenceStore } from './presence/presence.redis.js';
import { createAdapter } from '@socket.io/redis-adapter';
import { env } from '../config/env.js';
let presenceStore;
// Initialize presence store based on environment configuration
if (env.SOCKET_REDIS_ENABLED === 'true' || env.SOCKET_REDIS_ENABLED === true) {
    console.log('Initializing RedisPresenceStore...');
    const redisPresenceStore = new RedisPresenceStore(env.REDIS_URL);
    presenceStore = redisPresenceStore;
}
else {
    console.log('Initializing InMemoryPresenceStore...');
    presenceStore = new InMemoryPresenceStore();
}
export const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || '*', // Allow configured client origin
            methods: ['GET', 'POST'],
            credentials: true
        }
    });
    // Conditionally attach Redis adapter if enabled
    if (env.SOCKET_REDIS_ENABLED === 'true' || env.SOCKET_REDIS_ENABLED === true) {
        console.log('Attaching Redis adapter...');
        const pubClient = presenceStore.getClient();
        const subClient = pubClient.duplicate();
        Promise.all([pubClient.connect(), subClient.connect()])
            .then(() => {
            io.adapter(createAdapter(pubClient, subClient));
            console.log('Redis adapter attached successfully');
        })
            .catch((error) => {
            console.error('Failed to connect Redis clients for adapter:', error);
        });
    }
    io.use(async (socket, next) => {
        try {
            // Authenticate the socket connection
            const userData = await authenticateSocket(socket);
            socket.data.user = userData;
            next();
        }
        catch (error) {
            console.error('Socket authentication error:', error.message);
            next(new Error(`Authentication error: ${error.message}`));
        }
    });
    io.on('connection', (socket) => {
        const userId = socket.data.user.sub;
        console.log(`User connected: ${userId}`);
        const emitPresence = (target, presenceUserId, status, lastSeen) => {
            io.to(target).emit('presence:update', {
                userId: presenceUserId,
                status,
                lastSeen
            });
            io.to(target).emit(status === 'online' ? 'user:online' : 'user:offline', presenceUserId);
        };
        const notifyConversationParticipants = async (status, lastSeen) => {
            const conversations = await Conversation.find({ participants: { $in: [userId] } }).select('participants');
            const participantIds = new Set();
            for (const conversation of conversations) {
                for (const participant of conversation.participants) {
                    const participantId = participant._id.toString();
                    if (participantId !== userId) {
                        participantIds.add(participantId);
                    }
                }
            }
            participantIds.forEach((participantId) => {
                emitPresence(`user:${participantId}`, userId, status, lastSeen);
            });
        };
        // Mark user as connected in presence store
        if (presenceStore instanceof RedisPresenceStore) {
            presenceStore.userConnected(userId).catch(err => console.error(`Error marking user ${userId} as connected:`, err));
        }
        else {
            presenceStore.userConnected(userId);
        }
        // Join user-specific room
        socket.join(`user:${userId}`);
        // Emit presence update to this user and known chat participants.
        emitPresence(`user:${userId}`, userId, 'online');
        notifyConversationParticipants('online').catch(err => {
            console.error(`Error notifying participants that user ${userId} is online:`, err);
        });
        // Setup chat event handlers
        setupChatHandlers(io, socket);
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${userId}`);
            // Mark user as disconnected in presence store
            if (presenceStore instanceof RedisPresenceStore) {
                presenceStore.userDisconnected(userId).catch(err => console.error(`Error marking user ${userId} as disconnected:`, err));
            }
            else {
                presenceStore.userDisconnected(userId);
            }
            // Check if user is still online (multi-device support)
            const checkOnlineStatus = async () => {
                if (presenceStore instanceof RedisPresenceStore) {
                    return await presenceStore.isUserOnline(userId);
                }
                else {
                    return presenceStore.isUserOnline(userId);
                }
            };
            checkOnlineStatus().then(isStillOnline => {
                if (!isStillOnline) {
                    // User is truly offline, emit presence update
                    const getLastSeen = async () => {
                        if (presenceStore instanceof RedisPresenceStore) {
                            return await presenceStore.getLastSeen(userId);
                        }
                        else {
                            return presenceStore.getLastSeen(userId);
                        }
                    };
                    getLastSeen().then(lastSeen => {
                        // Emit to user's room and their conversations
                        emitPresence(`user:${userId}`, userId, 'offline', lastSeen ? lastSeen.toISOString() : null);
                        notifyConversationParticipants('offline', lastSeen ? lastSeen.toISOString() : null).catch(err => {
                            console.error(`Error notifying participants that user ${userId} is offline:`, err);
                        });
                    }).catch(err => {
                        console.error(`Error getting last seen for user ${userId}:`, err);
                    });
                }
            }).catch(err => {
                console.error(`Error checking online status for user ${userId}:`, err);
            });
            // Leave user-specific room
            socket.leave(`user:${userId}`);
        });
        // Handle joining a conversation room
        const joinConversation = async (conversationId) => {
            socket.join(`conversation:${conversationId}`);
            console.log(`User ${userId} joined conversation: ${conversationId}`);
            // Emit initial presence info for other participants in the conversation
            try {
                // Get conversation participants
                const conv = await Conversation.findById(conversationId).populate('participants', '_id');
                if (conv) {
                    // Emit presence info for each participant to the joining user
                    for (const participant of conv.participants) {
                        const participantId = participant._id.toString();
                        if (participantId !== userId) {
                            // Send presence info for this participant to the joining user
                            const getParticipantPresence = async () => {
                                if (presenceStore instanceof RedisPresenceStore) {
                                    const isOnline = await presenceStore.isUserOnline(participantId);
                                    const lastSeen = isOnline ? null : await presenceStore.getLastSeen(participantId);
                                    return { online: isOnline, lastSeen };
                                }
                                else {
                                    return presenceStore.getUserPresence(participantId);
                                }
                            };
                            const participantPresence = await getParticipantPresence();
                            if (participantPresence) {
                                socket.emit('presence:update', {
                                    userId: participantId,
                                    status: participantPresence.online ? 'online' : 'offline',
                                    lastSeen: participantPresence.online ? null : participantPresence.lastSeen?.toISOString()
                                });
                                socket.emit(participantPresence.online ? 'user:online' : 'user:offline', participantId);
                            }
                        }
                    }
                    // Notify other participants in the conversation that this user joined
                    // and is online
                    for (const participant of conv.participants) {
                        const participantId = participant._id.toString();
                        if (participantId !== userId) {
                            // Check if this participant is online
                            const checkParticipantOnline = async () => {
                                if (presenceStore instanceof RedisPresenceStore) {
                                    return await presenceStore.isUserOnline(participantId);
                                }
                                else {
                                    return presenceStore.isUserOnline(participantId);
                                }
                            };
                            checkParticipantOnline().then(isOnline => {
                                if (isOnline) {
                                    // Send presence update to the other participant
                                    emitPresence(`user:${participantId}`, userId, 'online');
                                }
                            }).catch(err => {
                                console.error(`Error checking online status for participant ${participantId}:`, err);
                            });
                        }
                    }
                }
            }
            catch (error) {
                console.error('Error emitting initial presence info:', error);
            }
        };
        socket.on('conversation:join', joinConversation);
        socket.on('join:conversation', joinConversation);
        // Handle leaving a conversation room
        socket.on('conversation:leave', (conversationId) => {
            socket.leave(`conversation:${conversationId}`);
            console.log(`User ${userId} left conversation: ${conversationId}`);
        });
    });
    return io;
};
//# sourceMappingURL=index.js.map