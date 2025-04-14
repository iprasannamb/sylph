import { ShadowEntry } from '@/types/shadow';

// Maximum age of entries in milliseconds (72 hours)
const MAX_AGE = 72 * 60 * 60 * 1000;

// Storage key
const STORAGE_KEY = 'shadow_feed_entries';

// Generate a unique ID for each entry
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Add a new shadow entry
export const addShadowEntry = (entry: Omit<ShadowEntry, 'id' | 'timestamp'>): ShadowEntry => {
  const newEntry: ShadowEntry = {
    ...entry,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };

  // Get existing entries
  const existingEntries = getShadowEntries();
  
  // Add new entry
  const updatedEntries = [newEntry, ...existingEntries];
  
  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
  
  return newEntry;
};

// Get all shadow entries, filtering out expired ones
export const getShadowEntries = (): ShadowEntry[] => {
  try {
    const now = Date.now();
    const storedEntries = localStorage.getItem(STORAGE_KEY);
    
    if (!storedEntries) return [];
    
    const entries: ShadowEntry[] = JSON.parse(storedEntries);
    
    // Filter out expired entries
    const validEntries = entries.filter(entry => {
      const entryTime = new Date(entry.timestamp).getTime();
      return now - entryTime < MAX_AGE;
    });
    
    // If we filtered some entries, update storage
    if (validEntries.length !== entries.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validEntries));
    }
    
    return validEntries;
  } catch (error) {
    console.error('Error retrieving shadow entries:', error);
    return [];
  }
};

// Clear all shadow entries
export const clearAllShadowEntries = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// Toggle shadow recording
export const toggleShadowRecording = (enabled: boolean): void => {
  localStorage.setItem('shadow_recording_enabled', String(enabled));
};

// Check if shadow recording is enabled
export const isShadowRecordingEnabled = (): boolean => {
  return localStorage.getItem('shadow_recording_enabled') !== 'false';
};