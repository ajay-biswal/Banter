import { createClient } from 'redis';
/**
 * Redis-based Presence Store Implementation
 * Tracks user online status using Redis for horizontal scaling
 * Implements the PresenceStore interface to maintain compatibility
 */
export class RedisPresenceStore {
    client;
    initialized = false;
    constructor(redisUrl = 'redis://localhost:6379') {
        this.client = createClient({ url: redisUrl });
        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });
        this.client.on('connect', () => {
            console.log('Redis Client Connected');
        });
    }
    async connect() {
        if (!this.initialized) {
            await this.client.connect();
            this.initialized = true;
        }
    }
    /**
     * Mark a user as connected (online)
     * Increments the socket count for this user
     */
    async userConnected(userId) {
        if (!this.initialized) {
            await this.connect();
        }
        // Use Redis INCR to atomically increment the socket count
        const key = `presence:user:${userId}:socketCount`;
        await this.client.incr(key);
        // Also update the online status to true
        await this.client.set(`presence:user:${userId}:online`, 'true');
        // Remove the last seen timestamp since user is now online
        await this.client.del(`presence:user:${userId}:lastSeen`);
    }
    /**
     * Mark a user as disconnected (handle multi-device properly)
     * Decrements the socket count and marks offline only when count reaches 0
     */
    async userDisconnected(userId) {
        if (!this.initialized) {
            await this.connect();
        }
        // Use Redis DECR to atomically decrement the socket count
        const key = `presence:user:${userId}:socketCount`;
        const newCount = await this.client.decr(key);
        if (newCount <= 0) {
            // All sockets disconnected, mark as offline
            await this.client.set(`presence:user:${userId}:online`, 'false');
            await this.client.set(`presence:user:${userId}:lastSeen`, new Date().toISOString());
            // Reset the socket count to 0 in case it went negative
            await this.client.set(key, '0');
        }
        else if (newCount < 0) {
            // Handle edge case where count might go negative, reset to 0
            await this.client.set(key, '0');
        }
    }
    /**
     * Check if a user is currently online
     */
    async isUserOnline(userId) {
        if (!this.initialized) {
            await this.connect();
        }
        const value = await this.client.get(`presence:user:${userId}:online`);
        return value === 'true';
    }
    /**
     * Get the last seen timestamp for a user
     */
    async getLastSeen(userId) {
        if (!this.initialized) {
            await this.connect();
        }
        const value = await this.client.get(`presence:user:${userId}:lastSeen`);
        if (!value) {
            return null;
        }
        try {
            return new Date(value);
        }
        catch (error) {
            console.error(`Error parsing last seen date for user ${userId}:`, error);
            return null;
        }
    }
    /**
     * Get the current socket count for a user
     */
    async getSocketCount(userId) {
        if (!this.initialized) {
            await this.connect();
        }
        const value = await this.client.get(`presence:user:${userId}:socketCount`);
        if (!value) {
            return 0;
        }
        const count = parseInt(value, 10);
        return isNaN(count) ? 0 : count;
    }
    /**
     * Get the Redis client (for testing or direct access if needed)
     */
    getClient() {
        return this.client;
    }
    /**
     * Close the Redis connection
     */
    async disconnect() {
        if (this.initialized) {
            await this.client.quit();
            this.initialized = false;
        }
    }
}
//# sourceMappingURL=presence.redis.js.map