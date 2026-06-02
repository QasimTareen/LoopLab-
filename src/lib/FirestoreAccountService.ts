import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  Unsubscribe,
  writeBatch,
  QuerySnapshot,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './firebase';

/**
 * Interface for custom user accounts stored in Firestore
 * This is separate from Firebase Auth to support the checksum-based system
 */
export interface FirestoreUser {
  email: string;
  username: string;
  fullName: string;
  checksum: string;
  gender: 'male' | 'female' | 'other';
  createdAt: string;
  lastLoginAt: string;
  isActive: boolean;
}

/**
 * Interface for active session tracking
 */
export interface ActiveSession {
  userId: string;
  email: string;
  loginTime: string;
  lastActivityTime: string;
  deviceInfo?: string;
  sessionId: string;
}

/**
 * FirestoreAccountService
 * Handles all user account operations with Firestore as the source of truth
 * Replaces localStorage-based account management with cloud-based persistence
 */
export class FirestoreAccountService {
  private static readonly USERS_COLLECTION = 'looplab_users';
  private static readonly SESSIONS_COLLECTION = 'looplab_sessions';
  private static subscriptions: Map<string, Unsubscribe> = new Map();

  /**
   * Register a new user in Firestore
   * @param email User email (used as document ID)
   * @param fullName User's full name
   * @param username User's username
   * @param checksum Generated checksum for authentication
   * @param gender User's gender
   * @returns Promise resolving with the created user object
   */
  static async registerUser(
    email: string,
    fullName: string,
    username: string,
    checksum: string,
    gender: 'male' | 'female' | 'other'
  ): Promise<FirestoreUser> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      
      // Check if user already exists
      const existingUser = await this.getUserByEmail(cleanEmail);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const now = new Date().toISOString();
      const newUser: FirestoreUser = {
        email: cleanEmail,
        fullName,
        username,
        checksum,
        gender,
        createdAt: now,
        lastLoginAt: now,
        isActive: true,
      };

      // Use email as the document ID for easy lookups
      await setDoc(doc(db, this.USERS_COLLECTION, cleanEmail), newUser);
      return newUser;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${this.USERS_COLLECTION}/{email}`);
    }
  }

  /**
   * Get a user by email address
   * @param email User email
   * @returns Promise resolving with user object or null if not found
   */
  static async getUserByEmail(email: string): Promise<FirestoreUser | null> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const userDoc = await getDoc(doc(db, this.USERS_COLLECTION, cleanEmail));
      
      if (userDoc.exists()) {
        return userDoc.data() as FirestoreUser;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${this.USERS_COLLECTION}/${email}`);
    }
  }

  /**
   * Verify user credentials (email + checksum)
   * @param email User email
   * @param checksum User checksum
   * @returns Promise resolving with user object or null if credentials don't match
   */
  static async verifyUser(email: string, checksum: string): Promise<FirestoreUser | null> {
    try {
      const user = await this.getUserByEmail(email);
      
      if (!user) {
        return null;
      }

      if (user.checksum === checksum.trim() && user.isActive) {
        // Update last login time on successful verification
        await this.updateLastLogin(email);
        return user;
      }

      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${this.USERS_COLLECTION}/${email}`);
    }
  }

  /**
   * Get all registered users
   * @returns Promise resolving with array of all users
   */
  static async getAllUsers(): Promise<FirestoreUser[]> {
    try {
      const snapshot = await getDocs(collection(db, this.USERS_COLLECTION));
      return snapshot.docs.map(doc => doc.data() as FirestoreUser);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, this.USERS_COLLECTION);
    }
  }

  /**
   * Update user information
   * @param email User email
   * @param updates Partial user object with fields to update
   * @returns Promise resolving with updated user object
   */
  static async updateUser(
    email: string,
    updates: Partial<FirestoreUser>
  ): Promise<FirestoreUser | null> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      await updateDoc(doc(db, this.USERS_COLLECTION, cleanEmail), {
        ...updates,
        lastLoginAt: new Date().toISOString(),
      });
      return this.getUserByEmail(cleanEmail);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${this.USERS_COLLECTION}/${email}`);
    }
  }

  /**
   * Delete a user account
   * @param email User email
   * @returns Promise resolving when user is deleted
   */
  static async deleteUser(email: string): Promise<void> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      
      // Delete user document
      await deleteDoc(doc(db, this.USERS_COLLECTION, cleanEmail));
      
      // Delete all sessions for this user
      const sessionQuery = query(
        collection(db, this.SESSIONS_COLLECTION),
        where('email', '==', cleanEmail)
      );
      const sessionDocs = await getDocs(sessionQuery);
      
      const batch = writeBatch(db);
      sessionDocs.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${this.USERS_COLLECTION}/${email}`);
    }
  }

  /**
   * Update last login timestamp for a user
   * @param email User email
   */
  static async updateLastLogin(email: string): Promise<void> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      await updateDoc(doc(db, this.USERS_COLLECTION, cleanEmail), {
        lastLoginAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${this.USERS_COLLECTION}/${email}/lastLogin`);
    }
  }

  /**
   * Create an active session record
   * @param email User email
   * @param deviceInfo Optional device information
   * @returns Promise resolving with the session object
   */
  static async createSession(
    email: string,
    deviceInfo?: string
  ): Promise<ActiveSession> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const sessionId = `${cleanEmail}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const session: ActiveSession = {
        userId: cleanEmail,
        email: cleanEmail,
        loginTime: now,
        lastActivityTime: now,
        deviceInfo,
        sessionId,
      };

      await setDoc(doc(db, this.SESSIONS_COLLECTION, sessionId), session);
      return session;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${this.SESSIONS_COLLECTION}/{sessionId}`);
    }
  }

  /**
   * Get all active sessions
   * @returns Promise resolving with array of active sessions
   */
  static async getActiveSessions(): Promise<ActiveSession[]> {
    try {
      const snapshot = await getDocs(collection(db, this.SESSIONS_COLLECTION));
      return snapshot.docs.map(doc => doc.data() as ActiveSession);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, this.SESSIONS_COLLECTION);
    }
  }

  /**
   * Get active sessions for a specific user
   * @param email User email
   * @returns Promise resolving with user's active sessions
   */
  static async getUserSessions(email: string): Promise<ActiveSession[]> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const sessionQuery = query(
        collection(db, this.SESSIONS_COLLECTION),
        where('email', '==', cleanEmail)
      );
      const snapshot = await getDocs(sessionQuery);
      return snapshot.docs.map(doc => doc.data() as ActiveSession);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `${this.SESSIONS_COLLECTION}?email=${email}`);
    }
  }

  /**
   * End an active session
   * @param sessionId Session ID to delete
   * @returns Promise resolving when session is ended
   */
  static async endSession(sessionId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.SESSIONS_COLLECTION, sessionId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${this.SESSIONS_COLLECTION}/${sessionId}`);
    }
  }

  /**
   * Subscribe to all users in real-time
   * Useful for admin dashboards
   * @param callback Function called whenever users collection changes
   * @returns Unsubscribe function to stop listening
   */
  static subscribeToAllUsers(
    callback: (users: FirestoreUser[]) => void
  ): Unsubscribe {
    const unsubscribe = onSnapshot(
      collection(db, this.USERS_COLLECTION),
      (snapshot: QuerySnapshot) => {
        const users = snapshot.docs.map(doc => doc.data() as FirestoreUser);
        callback(users);
      },
      (error) => {
        console.error('Error subscribing to users:', error);
      }
    );

    // Store subscription for cleanup
    const subscriptionId = `users_${Date.now()}`;
    this.subscriptions.set(subscriptionId, unsubscribe);

    return unsubscribe;
  }

  /**
   * Subscribe to a specific user in real-time
   * Useful for monitoring user changes across devices
   * @param email User email to watch
   * @param callback Function called when user data changes
   * @returns Unsubscribe function to stop listening
   */
  static subscribeToUser(
    email: string,
    callback: (user: FirestoreUser | null) => void
  ): Unsubscribe {
    const cleanEmail = email.trim().toLowerCase();
    
    const unsubscribe = onSnapshot(
      doc(db, this.USERS_COLLECTION, cleanEmail),
      (snapshot: DocumentSnapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data() as FirestoreUser);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error(`Error subscribing to user ${email}:`, error);
      }
    );

    // Store subscription for cleanup
    const subscriptionId = `user_${cleanEmail}_${Date.now()}`;
    this.subscriptions.set(subscriptionId, unsubscribe);

    return unsubscribe;
  }

  /**
   * Subscribe to all active sessions in real-time
   * Useful for admin dashboard to see who's logged in
   * @param callback Function called whenever sessions change
   * @returns Unsubscribe function to stop listening
   */
  static subscribeToActiveSessions(
    callback: (sessions: ActiveSession[]) => void
  ): Unsubscribe {
    const unsubscribe = onSnapshot(
      collection(db, this.SESSIONS_COLLECTION),
      (snapshot: QuerySnapshot) => {
        const sessions = snapshot.docs.map(doc => doc.data() as ActiveSession);
        callback(sessions);
      },
      (error) => {
        console.error('Error subscribing to sessions:', error);
      }
    );

    // Store subscription for cleanup
    const subscriptionId = `sessions_${Date.now()}`;
    this.subscriptions.set(subscriptionId, unsubscribe);

    return unsubscribe;
  }

  /**
   * Check if a user exists by email
   * @param email User email
   * @returns Promise resolving with boolean
   */
  static async userExists(email: string): Promise<boolean> {
    try {
      const user = await this.getUserByEmail(email);
      return user !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get total number of registered users
   * @returns Promise resolving with user count
   */
  static async getUserCount(): Promise<number> {
    try {
      const users = await this.getAllUsers();
      return users.length;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `${this.USERS_COLLECTION}/count`);
      return 0;
    }
  }

  /**
   * Migrate users from localStorage to Firestore
   * Call this once during app initialization if migrating from localStorage
   * @param localStorageKey Key where users are stored in localStorage
   * @returns Promise resolving with number of migrated users
   */
  static async migrateFromLocalStorage(localStorageKey: string): Promise<number> {
    try {
      const savedData = localStorage.getItem(localStorageKey);
      if (!savedData) {
        console.log('No data to migrate from localStorage');
        return 0;
      }

      const usersObj = JSON.parse(savedData);
      let migratedCount = 0;

      for (const [email, userData] of Object.entries(usersObj)) {
        const user = userData as any;
        try {
          await this.registerUser(
            email,
            user.fullName || 'Unknown',
            user.username || 'unknown',
            user.checksum,
            user.gender || 'other'
          );
          migratedCount++;
        } catch (err) {
          console.warn(`Failed to migrate user ${email}:`, err);
        }
      }

      console.log(`Successfully migrated ${migratedCount} users from localStorage to Firestore`);
      return migratedCount;
    } catch (error) {
      console.error('Migration error:', error);
      return 0;
    }
  }

  /**
   * Clear all subscriptions
   * Call this during app cleanup/unmount
   */
  static clearAllSubscriptions(): void {
    this.subscriptions.forEach(unsubscribe => {
      unsubscribe();
    });
    this.subscriptions.clear();
  }

  /**
   * Deactivate a user (soft delete)
   * @param email User email
   */
  static async deactivateUser(email: string): Promise<void> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      await updateDoc(doc(db, this.USERS_COLLECTION, cleanEmail), {
        isActive: false,
        lastLoginAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${this.USERS_COLLECTION}/${email}/deactivate`);
    }
  }

  /**
   * Reactivate a deactivated user
   * @param email User email
   */
  static async reactivateUser(email: string): Promise<void> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      await updateDoc(doc(db, this.USERS_COLLECTION, cleanEmail), {
        isActive: true,
        lastLoginAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${this.USERS_COLLECTION}/${email}/reactivate`);
    }
  }
}

export default FirestoreAccountService;
