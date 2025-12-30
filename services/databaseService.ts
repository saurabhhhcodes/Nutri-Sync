
import { AnalysisResult, UserProfile } from '../types';

/**
 * DATABASE SERVICE (PostgreSQL Simulation Layer)
 * In a production env, these methods call your API routes 
 * which interact with a real PostgreSQL database.
 */

export const dbService = {
  // Sync history to the cloud (Simulates Postgres INSERT/UPDATE)
  syncHistory: async (userId: string, history: AnalysisResult[]): Promise<boolean> => {
    console.log(`[DB] Syncing ${history.length} records to PostgreSQL for User: ${userId}`);
    
    // Simulate network latency for DB operation
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Mark items as synced
    const syncedHistory = history.map(item => ({ ...item, isSynced: true }));
    localStorage.setItem(`nutriSyncHistory_${userId}`, JSON.stringify(syncedHistory));
    return true;
  },

  // Update user profile (Simulates Postgres UPDATE)
  updateUser: async (profile: UserProfile): Promise<void> => {
    console.log(`[DB] Updating Profile in Postgres for: ${profile.email}`);
    localStorage.setItem('nutriSyncUser', JSON.stringify({
        ...profile,
        lastSyncedAt: Date.now()
    }));
  },

  // Fetch from "Remote" (Simulates Postgres SELECT)
  fetchHistory: async (userId: string): Promise<AnalysisResult[]> => {
    const data = localStorage.getItem(`nutriSyncHistory_${userId}`);
    return data ? JSON.parse(data) : [];
  }
};
