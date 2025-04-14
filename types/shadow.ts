export type ShadowEntryType = 
  | 'aborted_search'
  | 'deleted_text'
  | 'hovered_link'
  | 'closed_tab'
  | 'half_typed_message'
  | 'unposted_note'
  | 'incomplete_form';

export interface ShadowEntry {
  id: string;
  type: ShadowEntryType;
  content: string;
  timestamp: string;
  emotionGuess?: string;
  confidence?: number;
  duration?: number;
  metadata?: Record<string, any>;
}