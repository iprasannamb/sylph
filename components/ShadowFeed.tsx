'use client';

import React, { useEffect, useState } from 'react';
// TODO: Install framer-motion package using: npm install framer-motion
// or: yarn add framer-motion
import { motion, AnimatePresence } from 'framer-motion';
import { ShadowEntry } from '@/types/shadow';
import { getShadowEntries, clearAllShadowEntries, toggleShadowRecording, isShadowRecordingEnabled } from '@/lib/shadowStorage';
import { initializeCapture } from '@/lib/shadowCapture';
import { initializeDemoData } from '@/lib/demoData';

// Format the timestamp to a readable format
const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Get emoji for entry type
const getEmojiForType = (type: string): string => {
  const emojiMap: Record<string, string> = {
    'aborted_search': '🔍',
    'deleted_text': '✂️',
    'hovered_link': '👆',
    'closed_tab': '🚪',
    'half_typed_message': '💬',
    'unposted_note': '📝',
    'incomplete_form': '📋'
  };
  
  return emojiMap[type] || '👻';
};

// Format entry content for display
const formatEntryContent = (entry: ShadowEntry): string => {
  const time = formatTime(entry.timestamp);
  const emoji = getEmojiForType(entry.type);
  
  switch (entry.type) {
    case 'aborted_search':
      return `${emoji} ${time} – You searched for "${entry.content}" but didn't press Enter.`;
    case 'deleted_text':
      return `${emoji} ${time} – You wrote "${entry.content}" but deleted it.`;
    case 'hovered_link':
      return `${emoji} ${time} – You hovered on "${entry.content}" for ${entry.duration?.toFixed(1) || '?'} seconds.`;
    case 'closed_tab':
      return `${emoji} ${time} – You closed "${entry.content}" after viewing it.`;
    case 'half_typed_message':
      return `${emoji} ${time} – You typed "${entry.content}" but didn't send it.`;
    default:
      return `${emoji} ${time} – ${entry.content}`;
  }
};

const ShadowFeed: React.FC = () => {
  const [entries, setEntries] = useState<ShadowEntry[]>([]);
  const [isRecording, setIsRecording] = useState(true);
  
  // Load entries and initialize capture
  useEffect(() => {
    // Initialize capture listeners
    initializeCapture();
    
    // Initialize demo data
    initializeDemoData();
    
    // Load initial entries
    setEntries(getShadowEntries());
    
    // Check recording status
    setIsRecording(isShadowRecordingEnabled());
    
    // Set up interval to refresh entries
    const interval = setInterval(() => {
      setEntries(getShadowEntries());
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Toggle shadow recording
  const handleToggleRecording = () => {
    const newState = !isRecording;
    setIsRecording(newState);
    toggleShadowRecording(newState);
  };
  
  // Clear all entries
  const handleClearEntries = () => {
    if (confirm('Are you sure you want to clear all shadow entries? This cannot be undone.')) {
      clearAllShadowEntries();
      setEntries([]);
    }
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleToggleRecording}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700' 
                : 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700'
            } text-white transition-colors`}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
          <button
            onClick={handleClearEntries}
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Your shadow feed is empty</p>
            <p className="text-sm mt-1 text-gray-400 dark:text-gray-500">Your almost-actions will appear here</p>
          </div>
        ) : (
          <AnimatePresence>
            {entries.map((entry) => {
              // Calculate age factor (0-1) where 1 is fresh and 0 is old
              const entryAge = Date.now() - new Date(entry.timestamp).getTime();
              const maxAge = 72 * 60 * 60 * 1000; // 72 hours in ms
              const ageFactor = Math.max(0, 1 - entryAge / maxAge);
              
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 0.5 + (ageFactor * 0.5), // Fade based on age
                    y: 0,
                    filter: `blur(${(1 - ageFactor) * 1.5}px)` // Blur older entries
                  }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                  style={{
                    boxShadow: `0 0 ${8 * ageFactor}px rgba(${isRecording ? '59, 130, 246' : '107, 114, 128'},${0.1 * ageFactor})`,
                  }}
                >
                  <p className="text-gray-800 dark:text-gray-200">{formatEntryContent(entry)}</p>
                  {entry.emotionGuess && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Mood: {entry.emotionGuess}</p>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ShadowFeed;