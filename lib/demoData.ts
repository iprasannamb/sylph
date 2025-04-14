import { ShadowEntry } from '@/types/shadow';
import { addShadowEntry, getShadowEntries } from './shadowStorage';

// Demo shadow entries
const demoEntries: Omit<ShadowEntry, 'id' | 'timestamp'>[] = [
  {
    type: 'aborted_search',
    content: 'how to disappear without hurting anyone',
    emotionGuess: 'overwhelm',
    confidence: 0.7
  },
  {
    type: 'hovered_link',
    content: '10 signs of burnout',
    duration: 6.7,
    confidence: 0.5
  },
  {
    type: 'deleted_text',
    content: "I'm so done with pretending",
    confidence: 0.8
  },
  {
    type: 'half_typed_message',
    content: "I need to take some time off to",
    confidence: 0.6,
    emotionGuess: 'fatigue'
  },
  {
    type: 'closed_tab',
    content: "Career change at 35 - success stories",
    confidence: 0.4
  }
];

// Initialize demo data if the feed is empty
export const initializeDemoData = () => {
  if (typeof window === 'undefined') return;
  
  // Only add demo data if there are no entries yet
  const existingEntries = getShadowEntries();
  if (existingEntries.length === 0) {
    // Add entries with timestamps spread over the last few hours
    demoEntries.forEach((entry, index) => {
      const hoursAgo = Math.random() * 12; // Random time in the last 12 hours
      const timestamp = new Date(Date.now() - (hoursAgo * 60 * 60 * 1000));
      
      addShadowEntry({
        ...entry,
        timestamp: timestamp.toISOString() as string
      });
    });
  }
};