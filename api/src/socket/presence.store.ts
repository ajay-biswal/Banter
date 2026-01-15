/**
 * User Presence Store
 * Tracks user online status and manages multi-device support
 * Designed to be easily replaceable with Redis in the future
 */

interface PresenceData {
  online: boolean;
  lastSeen: Date | null;
  socketCount: number; // For multi-device support
}

class PresenceStore {
  private store: Map<string, PresenceData>;

  constructor() {
    this.store = new Map<string, PresenceData>();
  }

  /**
   * Mark a user as connected (online)
   */
  userConnected(userId: string): void {
    const existingData = this.store.get(userId);
    if (existingData) {
      // User was already online, increment socket count
      this.store.set(userId, {
        online: true,
        lastSeen: null, // Last seen is only set when going offline
        socketCount: existingData.socketCount + 1
      });
    } else {
      // New connection for this user
      this.store.set(userId, {
        online: true,
        lastSeen: null,
        socketCount: 1
      });
    }
  }

  /**
   * Mark a user as disconnected (handle multi-device properly)
   */
  userDisconnected(userId: string): void {
    const existingData = this.store.get(userId);
    if (!existingData) {
      // User was not in the store, nothing to do
      return;
    }

    if (existingData.socketCount <= 1) {
      // Last socket disconnected, mark as offline
      this.store.set(userId, {
        online: false,
        lastSeen: new Date(),
        socketCount: 0
      });
    } else {
      // Still have other sockets connected, just decrement counter
      this.store.set(userId, {
        online: true,
        lastSeen: null,
        socketCount: existingData.socketCount - 1
      });
    }
  }

  /**
   * Check if a user is currently online
   */
  isUserOnline(userId: string): boolean {
    const data = this.store.get(userId);
    return !!data && data.online;
  }

  /**
   * Get the last seen timestamp for a user
   */
  getLastSeen(userId: string): Date | null {
    const data = this.store.get(userId);
    return data ? data.lastSeen : null;
  }

  /**
   * Get the current socket count for a user
   */
  getSocketCount(userId: string): number {
    const data = this.store.get(userId);
    return data ? data.socketCount : 0;
  }

  /**
   * Get all presence data for a user
   */
  getUserPresence(userId: string): { online: boolean; lastSeen: Date | null } | null {
    const data = this.store.get(userId);
    if (!data) {
      return null;
    }
    return {
      online: data.online,
      lastSeen: data.lastSeen
    };
  }

  /**
   * Get all online users
   */
  getOnlineUsers(): string[] {
    const onlineUsers: string[] = [];
    for (const [userId, data] of this.store.entries()) {
      if (data.online) {
        onlineUsers.push(userId);
      }
    }
    return onlineUsers;
  }

  /**
   * Remove a user from the store entirely (rarely used)
   */
  removeUser(userId: string): void {
    this.store.delete(userId);
  }
}

// Export a singleton instance
export const presenceStore = new PresenceStore();