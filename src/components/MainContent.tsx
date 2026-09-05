import React, { useState, useRef, useEffect } from 'react';
import {
  Pencil,
  Sparkles,
  Send,
  Copy,
  Check,
  MessageSquarePlus,
  Zap,
  Globe,
  Lock,
  ExternalLink,
  Key,
} from 'lucide-react';
import Markdown from 'react-markdown';
import type { Analytics } from '@entity-builders/analytics';

interface MainContentProps {
  recipeName: string;
  instruction: string;
  onInstructionChange: (val: string) => void;
  prompt: string;
  onPromptChange: (val: string) => void;
  length: string;
  onLengthChange: (val: string) => void;
  tone: string;
  onToneChange: (val: string) => void;
  onSubmit: () => void;
  loading: boolean;
  response: string;
  onReset: () => void;
  messages?: Array<{ role: 'user' | 'model'; text: string }>;
  onStartChat: () => void;
  interactionMode: 'api' | 'embedded';
  onInteractionModeChange: (val: 'api' | 'embedded') => void;
  hasApiKey: boolean;
  onOpenSettings: () => void;
  tempChat: boolean;
  onTempChatChange: (val: boolean) => void;
  analytics: Analytics;
}

export const MainContent: React.FC<MainContentProps> = ({
  recipeName,
  instruction,
  onInstructionChange,
  prompt,
  onPromptChange,
  length,
  onLengthChange,
  tone,
  onToneChange,
  onSubmit,
  loading,
  response,
  onReset,
  messages = [],
  onStartChat,
  interactionMode,
  onInteractionModeChange,
  hasApiKey,
  onOpenSettings,
  tempChat,
  onTempChatChange,
  analytics,
}) => {
  const [showInstruction, setShowInstruction] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showApiOnboarding, setShowApiOnboarding] = useState(false);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const apiOnboardingRef = useRef<HTMLDivElement>(null);

  // Click-away to close API onboarding callout
  useEffect(() => {
    if (!showApiOnboarding) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        apiOnboardingRef.current &&
        !apiOnboardingRef.current.contains(e.target as Node)
      ) {
        setShowApiOnboarding(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showApiOnboarding]);

  // Auto-close onboarding when user enters a key
  useEffect(() => {
    if (hasApiKey) setShowApiOnboarding(false);
  }, [hasApiKey]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Auto-focus prompt input on mount
  useEffect(() => {
    if (promptInputRef.current) {
      promptInputRef.current.focus();
    }
  }, []);

  const handleCopy = async () => {
    // Get the text to copy: prefer response, fall back to last model message in chat
    let textToCopy = response;
    if (!textToCopy && messages.length > 0) {
      const lastModelMsg = [...messages]
        .reverse()
        .find((m) => m.role === 'model');
      textToCopy = lastModelMsg?.text || '';
    }
    if (!textToCopy) return;

    try {
      await window.ipcRenderer.invoke('clipboard:write', textToCopy);
      setIsCopied(true);
      analytics.track('response_copied', {
        response_length: textToCopy.length,
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className='flex-1 flex flex-col h-full bg-gray-50 overflow-hidden'>
      {/* Header */}
      <div className='px-8 py-6 flex justify-between items-center bg-white border-b border-gray-100'>
        <div className='flex items-center gap-3 min-w-0'>
          <h2 className='text-3xl font-bold text-gray-800 truncate'>
            {recipeName || 'Instructions'}
          </h2>
          <button
            onClick={() => setShowInstruction(!showInstruction)}
            className={`p-2 rounded-full transition-colors ${showInstruction ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-400'}`}
          >
            <Pencil size={18} />
          </button>
        </div>
        <div className='relative'>
          <div className='bg-gray-100 p-1 rounded-lg flex items-center'>
            <button
              onClick={() => {
                onInteractionModeChange('embedded');
                analytics.track('interaction_mode_changed', {
                  mode: 'embedded',
                });
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                interactionMode === 'embedded'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title='Embedded Mode (Web Wrapper)'
            >
              <Globe size={14} />
              <span>Web</span>
            </button>
            <button
              onClick={() => {
                if (hasApiKey) {
                  onInteractionModeChange('api');
                  analytics.track('interaction_mode_changed', { mode: 'api' });
                } else {
                  setShowApiOnboarding(true);
                }
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                interactionMode === 'api'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title={
                hasApiKey
                  ? 'API Mode (Direct API calls)'
                  : 'API Mode — requires API key'
              }
            >
              <Zap size={14} />
              <span>API</span>
              {!hasApiKey && <Lock size={12} className='text-gray-400' />}
            </button>
          </div>

          {/* API Onboarding Callout */}
          {showApiOnboarding && (
            <div
              ref={apiOnboardingRef}
              className='absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 animate-in fade-in slide-in-from-top-2 duration-200'
            >
              <div className='p-5'>
                <div className='flex items-center gap-2 mb-3'>
                  <div className='p-1.5 bg-purple-100 rounded-lg'>
                    <Key size={16} className='text-purple-600' />
                  </div>
                  <h4 className='font-semibold text-gray-900 text-sm'>
                    Unlock API Mode
                  </h4>
                </div>
                <p className='text-sm text-gray-600 mb-3 leading-relaxed'>
                  With a <strong>Gemini API key</strong> you get instant
                  responses directly in the app —{' '}
                  <em>faster, no browser needed</em>.
                </p>
                <p className='text-xs text-gray-500 mb-4'>
                  It's free to get started. Generate your key at Google AI
                  Studio:
                </p>
                <div className='space-y-2'>
                  <a
                    href='https://aistudio.google.com/apikey'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors'
                  >
                    <ExternalLink size={14} />
                    Get API Key
                  </a>
                  <button
                    onClick={() => {
                      setShowApiOnboarding(false);
                      onOpenSettings();
                    }}
                    className='flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg transition-colors'
                  >
                    Enter API Key in Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto p-8 pb-32'>
        <div className='flex flex-wrap gap-4 mb-8'>
          <div className='flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100'>
            <span className='font-semibold text-gray-700'>Length</span>
            <Sparkles size={16} className='text-purple-500' />
            <select
              value={length}
              onChange={(e) => {
                onLengthChange(e.target.value);
                analytics.track('length_changed', { length: e.target.value });
              }}
              className='bg-transparent border-none focus:ring-0 text-gray-600 font-medium cursor-pointer'
            >
              <option value='auto'>Auto</option>
              <option value='short'>Short</option>
              <option value='medium'>Medium</option>
              <option value='long'>Long</option>
            </select>
          </div>

          <div className='flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100'>
            <span className='font-semibold text-gray-700'>Tone</span>
            <Sparkles size={16} className='text-purple-500' />
            <select
              value={tone}
              onChange={(e) => {
                onToneChange(e.target.value);
                analytics.track('tone_changed', { tone: e.target.value });
              }}
              className='bg-transparent border-none focus:ring-0 text-gray-600 font-medium cursor-pointer'
            >
              <option value='auto'>Auto</option>
              <option value='professional'>Professional</option>
              <option value='casual'>Casual</option>
              <option value='enthusiastic'>Enthusiastic</option>
            </select>
          </div>
        </div>
        <div className='max-w-3xl mx-auto space-y-8'>
          {/* Instruction Display - Conditionally rendered */}
          {!response && messages.length === 0 && !loading && (
            <>
              {showInstruction && (
                <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-2'>
                  <div className='mb-4'>
                    <label className='block text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2'>
                      System Instruction
                    </label>
                    <textarea
                      value={instruction}
                      onChange={(e) => onInstructionChange(e.target.value)}
                      className='w-full text-lg font-medium text-gray-800 bg-transparent border-none focus:ring-0 resize-none h-auto'
                      rows={3}
                      placeholder='Enter system instructions here...'
                    />
                  </div>
                </div>
              )}

              {/* Prompt Input */}
              <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                <textarea
                  ref={promptInputRef}
                  value={prompt}
                  onChange={(e) => onPromptChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (prompt.trim() && !loading) onSubmit();
                    }
                  }}
                  placeholder='Add text or keywords here...'
                  className='w-full h-40 text-lg text-gray-600 placeholder-gray-300 bg-transparent border-none focus:ring-0 resize-none'
                />
              </div>

              {/* Controls & Submit */}
              <div className='flex flex-col gap-3 mt-8'>
                {interactionMode === 'embedded' && (
                  <label className='flex items-center gap-2 cursor-pointer self-start'>
                    <div className='relative'>
                      <input
                        type='checkbox'
                        checked={tempChat}
                        onChange={(e) => onTempChatChange(e.target.checked)}
                        className='sr-only peer'
                      />
                      <div className='w-8 h-[18px] bg-gray-300 rounded-full peer-checked:bg-blue-500 transition-colors'></div>
                      <div className='absolute top-[2px] left-[2px] w-[14px] h-[14px] bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-[14px]'></div>
                    </div>
                    <span className='text-xs text-gray-500'>
                      Temporary conversation
                    </span>
                  </label>
                )}
                <div className='flex justify-end'>
                  <button
                    onClick={onSubmit}
                    disabled={loading || !prompt}
                    className={`px-8 py-3 rounded-full font-bold text-white shadow-lg transition-all transform active:scale-95 flex items-center gap-2
                  ${
                    loading
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-black hover:bg-gray-800'
                  }`}
                  >
                    {loading ? 'Processing...' : 'Submit'}
                    {!loading && <Send size={18} />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Loading State (Initial) */}
          {loading && messages.length === 0 && (
            <div className='flex flex-col items-center justify-center h-64 space-y-4'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-black'></div>
              <p className='text-gray-500 font-medium'>
                Generating response...
              </p>
            </div>
          )}

          {/* Chat / Response Display */}
          {(response || messages.length > 0) && (
            <div className='bg-white p-0 rounded-2xl shadow-sm border border-gray-100 mt-0 animate-in fade-in slide-in-from-bottom-4 relative h-full flex flex-col overflow-hidden'>
              {/* Header inside response view */}
              <div className='flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50'>
                <h3 className='text-sm font-semibold text-gray-400 uppercase tracking-wider'>
                  Conversation
                </h3>
                <div className='flex gap-2'>
                  <button
                    onClick={onReset}
                    className='px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors'
                  >
                    New Chat
                  </button>
                  {/* Start Chat Button - Only valid if not already in chat mode */}
                  {messages.length === 0 && (
                    <button
                      onClick={onStartChat}
                      className='p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-blue-500 hover:text-blue-700'
                      title='Continue with Chat'
                    >
                      <MessageSquarePlus size={16} />
                    </button>
                  )}
                  <button
                    onClick={handleCopy}
                    className='p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600'
                    title='Copy last response'
                  >
                    {isCopied ? (
                      <Check size={16} className='text-green-500' />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div
                ref={chatContainerRef}
                className='flex-1 overflow-y-auto p-6 space-y-6'
              >
                {/* Messages History */}
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800 prose prose-sm max-w-none'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <div className='whitespace-pre-wrap'>{msg.text}</div>
                      ) : (
                        <Markdown>{msg.text}</Markdown>
                      )}
                    </div>
                  </div>
                ))}

                {/* Response / Error Display */}
                {response && (
                  <div
                    className={`rounded-2xl p-4 prose prose-sm max-w-none ${
                      response.startsWith('Error:')
                        ? 'bg-red-50 text-red-600 border border-red-100'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <Markdown>{response}</Markdown>
                  </div>
                )}

                {/* Loading Indicator inside chat */}
                {loading && (
                  <div className='flex justify-start'>
                    <div className='bg-gray-100 rounded-2xl p-4 flex items-center space-x-2'>
                      <div
                        className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                        style={{ animationDelay: '0ms' }}
                      ></div>
                      <div
                        className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                        style={{ animationDelay: '150ms' }}
                      ></div>
                      <div
                        className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                        style={{ animationDelay: '300ms' }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reply Input Area - Only show if in chat mode */}
              {messages.length > 0 && (
                <div className='p-4 border-t border-gray-100 bg-white'>
                  <div className='flex gap-2 relative'>
                    <textarea
                      value={prompt}
                      onChange={(e) => onPromptChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (prompt.trim() && !loading) onSubmit();
                        }
                      }}
                      placeholder='Reply...'
                      className='w-full p-3 pr-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none h-14 max-h-32 min-h-[56px] bg-gray-50'
                      style={{ height: 'auto', minHeight: '56px' }}
                    />
                    <button
                      onClick={onSubmit}
                      disabled={loading || !prompt.trim()}
                      className={`absolute right-2 top-2 bottom-2 p-2 rounded-lg transition-colors flex items-center justify-center
                        ${loading || !prompt.trim() ? 'text-gray-300' : 'text-blue-600 hover:bg-blue-50'}
                      `}
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
