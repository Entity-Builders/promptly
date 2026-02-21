import React from 'react';
import {
  Globe,
  Zap,
  ExternalLink,
  Sparkles,
  Languages,
  FileText,
  Mail,
} from 'lucide-react';

interface WelcomeModalProps {
  onDismiss: () => void;
  onOpenSettings: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  onDismiss,
  onOpenSettings,
}) => {
  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300'>
      <div className='bg-white rounded-3xl p-8 w-[480px] shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='text-center mb-6'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-4 shadow-lg'>
            <Sparkles size={32} className='text-white' />
          </div>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>
            Welcome to Promptly
          </h2>
          <p className='text-gray-500 text-sm'>
            Your AI-powered text toolkit. Pick a recipe, paste your text, get
            instant results.
          </p>
        </div>

        {/* What Promptly Does */}
        <div className='space-y-3 mb-6'>
          <h3 className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>
            What you can do
          </h3>
          <div className='grid grid-cols-3 gap-2'>
            <div className='bg-gray-50 rounded-xl p-3 border border-gray-100 text-center'>
              <div className='flex items-center justify-center mb-2'>
                <div className='p-1.5 bg-blue-100 rounded-lg'>
                  <Languages size={16} className='text-blue-600' />
                </div>
              </div>
              <span className='text-xs font-medium text-gray-700'>
                Translate
              </span>
              <p className='text-[10px] text-gray-400 mt-0.5'>
                ES → EN instantly
              </p>
            </div>
            <div className='bg-gray-50 rounded-xl p-3 border border-gray-100 text-center'>
              <div className='flex items-center justify-center mb-2'>
                <div className='p-1.5 bg-purple-100 rounded-lg'>
                  <FileText size={16} className='text-purple-600' />
                </div>
              </div>
              <span className='text-xs font-medium text-gray-700'>Format</span>
              <p className='text-[10px] text-gray-400 mt-0.5'>
                PRs, docs, notes
              </p>
            </div>
            <div className='bg-gray-50 rounded-xl p-3 border border-gray-100 text-center'>
              <div className='flex items-center justify-center mb-2'>
                <div className='p-1.5 bg-green-100 rounded-lg'>
                  <Mail size={16} className='text-green-600' />
                </div>
              </div>
              <span className='text-xs font-medium text-gray-700'>Write</span>
              <p className='text-[10px] text-gray-400 mt-0.5'>
                Emails, posts, more
              </p>
            </div>
          </div>
        </div>

        {/* Two Modes */}
        <div className='space-y-3 mb-6'>
          <h3 className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>
            Two ways to use Gemini
          </h3>
          <div className='grid grid-cols-2 gap-3'>
            {/* Web Mode */}
            <div className='bg-gray-50 rounded-xl p-4 border border-gray-100'>
              <div className='flex items-center gap-2 mb-2'>
                <div className='p-1.5 bg-blue-100 rounded-lg'>
                  <Globe size={16} className='text-blue-600' />
                </div>
                <span className='font-semibold text-gray-800 text-sm'>
                  Web Mode
                </span>
              </div>
              <p className='text-xs text-gray-500 leading-relaxed'>
                Opens Gemini in a browser window. No API key needed — perfect to
                start.
              </p>
            </div>
            {/* API Mode */}
            <div className='bg-gray-50 rounded-xl p-4 border border-gray-100'>
              <div className='flex items-center gap-2 mb-2'>
                <div className='p-1.5 bg-purple-100 rounded-lg'>
                  <Zap size={16} className='text-purple-600' />
                </div>
                <span className='font-semibold text-gray-800 text-sm'>
                  API Mode
                </span>
              </div>
              <p className='text-xs text-gray-500 leading-relaxed'>
                Direct API calls for instant responses. Needs a free Gemini API
                key.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className='bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-6 border border-purple-100/50'>
          <h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3'>
            How it works
          </h3>
          <ul className='space-y-2 text-sm text-gray-600'>
            <li className='flex items-start gap-2'>
              <span className='text-purple-500 font-bold mt-0.5'>1.</span>
              <span>
                Pick a <strong>Recipe</strong> from the sidebar (translator,
                summarizer, etc.)
              </span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-purple-500 font-bold mt-0.5'>2.</span>
              <span>
                Paste your text and hit send — the recipe transforms it
                instantly
              </span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-purple-500 font-bold mt-0.5'>3.</span>
              <span>
                Create your own <strong>custom recipes</strong> with the{' '}
                <strong>+</strong> button
              </span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className='space-y-2'>
          <button
            onClick={onDismiss}
            className='w-full px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors text-sm'
          >
            Get Started
          </button>
          <div className='flex gap-2'>
            <a
              href='https://aistudio.google.com/apikey'
              target='_blank'
              rel='noopener noreferrer'
              className='flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors'
            >
              <ExternalLink size={14} />
              Get Free API Key
            </a>
            <button
              onClick={() => {
                onDismiss();
                onOpenSettings();
              }}
              className='flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors'
            >
              Open Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
