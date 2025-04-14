'use client';

import React, { useState, useRef } from 'react';
import { trackTextInput, trackAbandoned, trackHover } from '@/lib/shadowCapture';

const ShadowDemo: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const hoverTimerRef = useRef<{ [key: string]: number }>({});
  
  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    trackTextInput('demo-search', value, 'aborted_search');
  };
  
  // Handle search blur (user left the input)
  const handleSearchBlur = () => {
    if (searchInput) {
      trackAbandoned('demo-search', 'aborted_search');
      setSearchInput(''); // Clear the input
    }
  };
  
  // Handle message input changes
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessageInput(value);
    trackTextInput('demo-message', value, 'half_typed_message');
  };
  
  // Handle message blur
  const handleMessageBlur = () => {
    if (messageInput) {
      trackAbandoned('demo-message', 'half_typed_message');
      setMessageInput(''); // Clear the input
    }
  };
  
  // Track hover start
  const handleHoverStart = (content: string, id: string) => {
    hoverTimerRef.current[id] = Date.now();
  };
  
  // Track hover end
  const handleHoverEnd = (content: string, id: string) => {
    if (hoverTimerRef.current[id]) {
      const duration = (Date.now() - hoverTimerRef.current[id]) / 1000; // Convert to seconds
      trackHover(content, duration, 'hovered_link');
      delete hoverTimerRef.current[id];
    }
  };
  
  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Demo Inputs</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-5">
          Try typing something and then clicking away without submitting, or hover over the links below.
          Your "almost-actions" will be captured in the Shadow Feed.
        </p>
        
        <div className="space-y-5">
          {/* Search input */}
          <div>
            <label htmlFor="demo-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search (type something and click away)
            </label>
            <input
              id="demo-search"
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              onBlur={handleSearchBlur}
              placeholder="Type a search query..."
              className="w-full px-4 py-2 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
          
          {/* Message input */}
          <div>
            <label htmlFor="demo-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message (type something and click away)
            </label>
            <textarea
              id="demo-message"
              value={messageInput}
              onChange={handleMessageChange}
              onBlur={handleMessageBlur}
              placeholder="Type a message..."
              rows={3}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
          
          {/* Hover elements */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hover over these links:</p>
            
            <div className="flex flex-wrap gap-4">
              {[
                { id: 'link1', text: '10 signs of burnout', url: '#burnout' },
                { id: 'link2', text: 'How to disappear completely', url: '#disappear' },
                { id: 'link3', text: 'Starting over in a new city', url: '#newcity' },
                { id: 'link4', text: 'Dealing with imposter syndrome', url: '#imposter' }
              ].map(link => (
                <a
                  key={link.id}
                  href={link.url}
                  className="px-3 py-1.5 rounded-md text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
                  onMouseEnter={() => handleHoverStart(link.text, link.id)}
                  onMouseLeave={() => handleHoverEnd(link.text, link.id)}
                  onClick={(e) => e.preventDefault()}
                >
                  {link.text}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShadowDemo;