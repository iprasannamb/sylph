import { addShadowEntry, isShadowRecordingEnabled } from './shadowStorage';
import { ShadowEntryType } from '@/types/shadow';

// Cache for tracking input states
interface InputCache {
  [key: string]: {
    value: string;
    timestamp: number;
  };
}

const inputCache: InputCache = {};

// Track text input changes
export const trackTextInput = (
  elementId: string,
  currentValue: string,
  inputType: ShadowEntryType = 'half_typed_message'
) => {
  if (!isShadowRecordingEnabled()) return;
  
  const now = Date.now();
  
  // If we have a previous value for this input
  if (inputCache[elementId]) {
    const { value: previousValue, timestamp } = inputCache[elementId];
    
    // If the user deleted significant text (more than 10 chars)
    if (
      previousValue.length > currentValue.length &&
      previousValue.length - currentValue.length > 10
    ) {
      const deletedContent = previousValue.substring(currentValue.length);
      
      addShadowEntry({
        type: 'deleted_text',
        content: deletedContent,
        confidence: Math.min(deletedContent.length / 50, 0.9), // Higher confidence for longer text
        metadata: {
          elementId,
          timeTaken: now - timestamp
        }
      });
    }
  }
  
  // Update the cache
  inputCache[elementId] = {
    value: currentValue,
    timestamp: now
  };
};

// Track when user abandons a search or message
export const trackAbandoned = (
  elementId: string,
  type: ShadowEntryType = 'aborted_search'
) => {
  if (!isShadowRecordingEnabled()) return;
  
  const cached = inputCache[elementId];
  if (!cached || !cached.value) return;
  
  // If there's significant content that wasn't submitted
  if (cached.value.length > 3) {
    addShadowEntry({
      type,
      content: cached.value,
      confidence: Math.min(cached.value.length / 30, 0.8),
    });
  }
  
  // Clear the cache for this element
  delete inputCache[elementId];
};

// Track link or element hovering
export const trackHover = (
  content: string,
  duration: number,
  type: ShadowEntryType = 'hovered_link'
) => {
  if (!isShadowRecordingEnabled() || duration < 3) return; // Ignore brief hovers
  
  addShadowEntry({
    type,
    content,
    duration,
    confidence: Math.min(duration / 15, 0.7), // Higher confidence for longer hovers
  });
};

// Track tab closing
export const trackTabClose = (url: string, title: string) => {
  if (!isShadowRecordingEnabled()) return;
  
  addShadowEntry({
    type: 'closed_tab',
    content: title || url,
    metadata: { url }
  });
};

// Initialize global listeners
export const initializeCapture = () => {
  if (typeof window === 'undefined') return;
  
  // Track tab closing
  window.addEventListener('beforeunload', () => {
    trackTabClose(window.location.href, document.title);
  });
  
  // More global listeners could be added here
};