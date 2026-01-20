/**
 * Presence Store Interface
 * Defines the contract for presence tracking implementations
 * This interface enables easy swapping between in-memory and Redis implementations
 */

export interface PresenceStore {
  /**
   * Mark a user as connected (online)
   * @param userId - The user ID to mark as connected
   */
  userConnected(userId: string): void | Promise<void>;

  /**
   * Mark a user as disconnected
   * Handles multi-device properly - only marks offline when all sockets disconnect
   * @param userId - The user ID to mark as disconnected
   */
  userDisconnected(userId: string): void | Promise<void>;

  /**
   * Check if a user is currently online
   * @param userId - The user ID to check
   * @returns boolean indicating if user is online
   */
  isUserOnline(userId: string): boolean | Promise<boolean>;

  /**
   * Get the last seen timestamp for a user
   * @param userId - The user ID to check
   * @returns Date when user was last seen, or null if never seen or currently online
   */
  getLastSeen(userId: string): Date | null | Promise<Date | null>;

  /**
   * Get the current socket count for a user (for multi-device support)
   * @param userId - The user ID to check
   * @returns number of active sockets for this user
   */
  getSocketCount(userId: string): number | Promise<number>;
}