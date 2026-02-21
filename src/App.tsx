import { useState, useEffect } from 'react';
import './App.css';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { WelcomeModal } from './components/WelcomeModal';
import { AGENT_PRESETS } from './constants';
import { Settings, Download, X, RefreshCw } from 'lucide-react';
import { analytics } from './services/analytics';

function App() {
  const [apiKey, setApiKey] = useState(
    localStorage.getItem('gemini_api_key') || '',
  );
  const hasApiKey = apiKey.trim().length > 0;
  const [recipes, setRecipes] = useState<typeof AGENT_PRESETS>(() => {
    const saved = localStorage.getItem('saved_recipes');
    return saved ? JSON.parse(saved) : AGENT_PRESETS;
  });

  const [selectedRecipeId, setSelectedRecipeId] = useState(
    localStorage.getItem('last_selected_recipe_id') || 'simplifier',
  );
  const [systemInstruction, setSystemInstruction] = useState(
    recipes.find((p) => p.id === 'simplifier')?.instruction || '',
  );
  const [prompt, setPrompt] = useState('');
  const [lastPrompt, setLastPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('gemini-2.0-flash');
  const [length, setLength] = useState('auto');
  const [tone, setTone] = useState('auto');

  const [showSettings, setShowSettings] = useState(false);
  const [interactionMode, setInteractionMode] = useState<'api' | 'embedded'>(
    (localStorage.getItem('interaction_mode') as 'api' | 'embedded') ||
      'embedded',
  );
  const [tempChat, setTempChat] = useState(
    localStorage.getItem('temp_chat') !== 'false',
  );
  const [messages, setMessages] = useState<
    Array<{ role: 'user' | 'model'; text: string }>
  >([]);
  const [updateStatus, setUpdateStatus] = useState<
    'none' | 'checking' | 'available' | 'downloaded' | 'not-available' | 'error'
  >('none');
  const [appVersion, setAppVersion] = useState<string>('');
  const [updateDismissed, setUpdateDismissed] = useState(false);
  const [downloadedVersion, setDownloadedVersion] = useState<string>('');
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('onboarding_completed');
  });

  useEffect(() => {
    // Fetch app version from main process
    window.ipcRenderer.invoke('app:get-version').then((v: string) => {
      setAppVersion(v);
      // Register version as a global property for all future events
      analytics.setGlobalProperties({ app_version: v });
    });
  }, []);

  useEffect(() => {
    const dismissedVersion = localStorage.getItem('update_dismissed_version');

    const handleUpdateAvailable = () => {
      setUpdateStatus('available');
    };
    const handleUpdateDownloaded = (
      _event: unknown,
      info: { version?: string },
    ) => {
      const newVersion = info?.version;
      // If the user already dismissed this version, don't show again
      if (newVersion && newVersion === dismissedVersion) {
        setUpdateDismissed(true);
      } else {
        setUpdateDismissed(false);
      }
      setUpdateStatus('downloaded');
      if (newVersion) setDownloadedVersion(newVersion);
    };
    const handleUpdateNotAvailable = () => setUpdateStatus('not-available');
    const handleUpdateError = () => setUpdateStatus('error');

    window.ipcRenderer.on('update-available', handleUpdateAvailable);
    window.ipcRenderer.on('update-downloaded', handleUpdateDownloaded);
    window.ipcRenderer.on('update-not-available', handleUpdateNotAvailable);
    window.ipcRenderer.on('update-error', handleUpdateError);

    return () => {
      window.ipcRenderer.off('update-available', handleUpdateAvailable);
      window.ipcRenderer.off('update-downloaded', handleUpdateDownloaded);
      window.ipcRenderer.off('update-not-available', handleUpdateNotAvailable);
      window.ipcRenderer.off('update-error', handleUpdateError);
    };
  }, []);

  const handleCheckForUpdates = async () => {
    setUpdateStatus('checking');
    await window.ipcRenderer.invoke('app:check-for-updates');
  };

  const handleRestart = () => {
    window.ipcRenderer.send('restart-app');
  };

  const handleSelectRecipe = (id: string, instruction: string) => {
    setSelectedRecipeId(id);
    localStorage.setItem('last_selected_recipe_id', id);
    setSystemInstruction(instruction);
    setResponse('');
    setMessages([]);
    setLastPrompt('');
    const recipe = recipes.find((r) => r.id === id);
    analytics.track('recipe_selected', {
      recipe_id: id,
      recipe_name: recipe?.name,
      is_custom: !AGENT_PRESETS.some((p) => p.id === id),
    });
  };

  const handleDeleteRecipe = (id: string) => {
    const deletedRecipe = recipes.find((r) => r.id === id);
    const newRecipes = recipes.filter((r) => r.id !== id);
    setRecipes(newRecipes);
    localStorage.setItem('saved_recipes', JSON.stringify(newRecipes));
    analytics.track('recipe_deleted', {
      recipe_id: id,
      recipe_name: deletedRecipe?.name,
    });

    if (selectedRecipeId === id) {
      const nextRecipe = newRecipes[0];
      if (nextRecipe) {
        handleSelectRecipe(nextRecipe.id, nextRecipe.instruction);
      } else {
        setSelectedRecipeId('');
        setSystemInstruction('');
      }
    }
  };

  const handleAddRecipe = (name: string, instruction: string) => {
    const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const newRecipe = { id, name, instruction };
    const newRecipes = [...recipes, newRecipe];
    setRecipes(newRecipes);
    localStorage.setItem('saved_recipes', JSON.stringify(newRecipes));
    analytics.track('recipe_created', {
      name,
      instruction_length: instruction.length,
    });
    handleSelectRecipe(id, instruction);
  };

  const handleRenameRecipe = (id: string, newName: string) => {
    const newRecipes = recipes.map((r) =>
      r.id === id ? { ...r, name: newName } : r,
    );
    setRecipes(newRecipes);
    localStorage.setItem('saved_recipes', JSON.stringify(newRecipes));
    analytics.track('recipe_renamed', { recipe_id: id, new_name: newName });
  };

  const handleReorderRecipes = (
    reordered: Array<{ id: string; name: string; instruction: string }>,
  ) => {
    setRecipes(reordered);
    localStorage.setItem('saved_recipes', JSON.stringify(reordered));
    analytics.track('recipe_reordered', { recipe_count: reordered.length });
  };

  const handleGenerate = async () => {
    // Save API key
    localStorage.setItem('gemini_api_key', apiKey);
    localStorage.setItem('interaction_mode', interactionMode);

    if (interactionMode === 'api' && !apiKey) {
      setResponse('Error: API Key is required for API mode.');
      setShowSettings(true);
      return;
    }

    setLoading(true);
    if (messages.length === 0) setResponse('');

    // Track submission
    const startTime = Date.now();
    const isChat = messages.length > 0;
    analytics.track('prompt_submitted', {
      recipe_id: selectedRecipeId,
      model,
      mode: interactionMode,
      prompt_length: prompt.length,
      has_system_instruction: !!systemInstruction,
      is_chat: isChat,
      turn_number: isChat ? Math.floor(messages.length / 2) + 1 : 1,
      tone,
      length,
    });

    // Augment system instruction with length and tone if not auto
    let augmentedInstruction = systemInstruction;
    if (length !== 'auto') {
      augmentedInstruction += `\nKeep the response length: ${length}.`;
    }
    if (tone !== 'auto') {
      augmentedInstruction += `\nMaintain a ${tone} tone.`;
    }

    try {
      if (interactionMode === 'embedded') {
        const result = await window.ipcRenderer.invoke('gemini:open-wrapper', {
          systemInstruction: augmentedInstruction,
          prompt,
          tempChat,
        });

        if (result.error) {
          setResponse(`Error: ${result.error}`);
          analytics.track('prompt_failed', {
            recipe_id: selectedRecipeId,
            error_type: 'embedded_error',
          });
        } else {
          setResponse('Gemini Wrapper Opened. Prompt copied to clipboard.');
          analytics.track('gemini_wrapper_opened', { success: true });
        }
      } else {
        // API Mode
        if (messages.length > 0) {
          const newMessages = [
            ...messages,
            { role: 'user' as const, text: prompt },
          ];

          const historyForApi = messages.map((m) => ({
            role: m.role,
            parts: [{ text: m.text }],
          }));

          const result = await window.ipcRenderer.invoke('gemini:generate', {
            apiKey,
            modelName: model,
            systemInstruction: augmentedInstruction,
            prompt,
            history: historyForApi,
          });

          if (result.error) {
            setResponse(`Error: ${result.error}`);
            analytics.track('prompt_failed', {
              recipe_id: selectedRecipeId,
              error_type: 'api_chat_error',
            });
          } else {
            setMessages([
              ...newMessages,
              { role: 'model' as const, text: result.text },
            ]);
            setPrompt('');
            analytics.track('prompt_succeeded', {
              recipe_id: selectedRecipeId,
              response_length: result.text.length,
              duration_ms: Date.now() - startTime,
              is_chat: true,
            });
          }
        } else {
          // Single turn mode (first request or reset)
          setLastPrompt(prompt); // Store for potential chat start

          const result = await window.ipcRenderer.invoke('gemini:generate', {
            apiKey,
            modelName: model,
            systemInstruction: augmentedInstruction,
            prompt,
          });

          if (result.error) {
            setResponse(`Error: ${result.error}`);
            analytics.track('prompt_failed', {
              recipe_id: selectedRecipeId,
              error_type: 'api_error',
            });
          } else {
            setResponse(result.text);
            analytics.track('prompt_succeeded', {
              recipe_id: selectedRecipeId,
              response_length: result.text.length,
              duration_ms: Date.now() - startTime,
              is_chat: false,
            });
            // Do NOT populate messages yet. User must click "Start Chat".
          }
        }
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      setResponse(`Error: ${errorMessage}`);
      analytics.track('prompt_failed', {
        recipe_id: selectedRecipeId,
        error_type: 'exception',
        error_message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = () => {
    if (lastPrompt && response && messages.length === 0) {
      setMessages([
        { role: 'user', text: lastPrompt },
        { role: 'model', text: response },
      ]);
      setResponse('');
      analytics.track('chat_started', { recipe_id: selectedRecipeId });
    }
  };

  return (
    <div className='flex h-screen bg-white font-sans overflow-hidden'>
      {showWelcome && (
        <WelcomeModal
          onDismiss={() => {
            setShowWelcome(false);
            localStorage.setItem('onboarding_completed', 'true');
            analytics.track('onboarding_completed');
          }}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}
      <Sidebar
        analytics={analytics}
        recipes={recipes}
        selectedRecipeId={selectedRecipeId}
        onSelectRecipe={handleSelectRecipe}
        onDeleteRecipe={handleDeleteRecipe}
        onAddRecipe={handleAddRecipe}
        onRenameRecipe={handleRenameRecipe}
        onReorderRecipes={handleReorderRecipes}
        onOpenSettings={() => setShowSettings(true)}
        hasUpdateBadge={
          updateStatus === 'available' || updateStatus === 'downloaded'
        }
      />
      <MainContent
        recipeName={recipes.find((r) => r.id === selectedRecipeId)?.name || ''}
        instruction={systemInstruction}
        onInstructionChange={setSystemInstruction}
        prompt={prompt}
        onPromptChange={setPrompt}
        length={length}
        onLengthChange={setLength}
        tone={tone}
        onToneChange={setTone}
        onSubmit={handleGenerate}
        onReset={() => {
          analytics.track('session_reset', {
            had_chat: messages.length > 0,
            message_count: messages.length,
          });
          setResponse('');
          setMessages([]);
          setPrompt('');
          setLastPrompt('');
        }}
        onStartChat={handleStartChat}
        loading={loading}
        response={response}
        messages={messages}
        interactionMode={interactionMode}
        onInteractionModeChange={setInteractionMode}
        hasApiKey={hasApiKey}
        onOpenSettings={() => setShowSettings(true)}
        tempChat={tempChat}
        onTempChatChange={(val: boolean) => {
          setTempChat(val);
          localStorage.setItem('temp_chat', String(val));
          analytics.track('temp_chat_toggled', { enabled: val });
        }}
        analytics={analytics}
      />

      {/* Settings Modal */}
      {showSettings && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200'>
          <div className='bg-white rounded-2xl p-6 w-96 shadow-xl animate-in zoom-in-95 duration-200'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-xl font-bold text-gray-800 flex items-center gap-2'>
                <Settings size={20} /> Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className='text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition-colors'
              >
                ✖
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Gemini API Key
                </label>
                <input
                  type='password'
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onBlur={() => {
                    if (apiKey.trim()) {
                      analytics.track('api_key_configured', {
                        is_first_time: !localStorage.getItem('gemini_api_key'),
                      });
                    }
                  }}
                  className='w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white text-gray-900 caret-gray-900 placeholder:text-gray-400'
                  placeholder='Enter API Key'
                />
              </div>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Model
                </label>
                <select
                  value={model}
                  onChange={(e) => {
                    const newModel = e.target.value;
                    analytics.track('model_changed', {
                      from_model: model,
                      to_model: newModel,
                    });
                    setModel(newModel);
                  }}
                  className='w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white text-gray-900 transition-all'
                >
                  <option value='gemini-2.0-flash'>Gemini 2.0 Flash</option>
                  <option value='gemini-2.0-flash-lite'>
                    Gemini 2.0 Flash Lite
                  </option>
                  <option value='gemini-1.5-pro'>Gemini 1.5 Pro</option>
                </select>
              </div>
            </div>

            {/* Divider */}
            <div className='border-t border-gray-100 my-4'></div>

            {/* Version & Updates Section */}
            <div className='space-y-3'>
              <h4 className='text-sm font-semibold text-gray-700'>App Info</h4>
              <div className='flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3'>
                <div>
                  <p className='text-sm font-medium text-gray-800'>Version</p>
                  <p className='text-xs text-gray-500'>
                    v{appVersion || '...'}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  {updateStatus === 'checking' && (
                    <span className='text-xs text-blue-600 flex items-center gap-1'>
                      <RefreshCw size={14} className='animate-spin' />{' '}
                      Checking...
                    </span>
                  )}
                  {updateStatus === 'available' && (
                    <span className='text-xs text-orange-600 font-medium'>
                      ⬇ Downloading...
                    </span>
                  )}
                  {updateStatus === 'downloaded' && (
                    <span className='text-xs text-green-600 font-medium'>
                      ✓ Ready to install
                    </span>
                  )}
                  {updateStatus === 'not-available' && (
                    <span className='text-xs text-gray-500'>✓ Up to date</span>
                  )}
                  {updateStatus === 'error' && (
                    <span className='text-xs text-red-500'>✗ Check failed</span>
                  )}
                </div>
              </div>

              <div className='flex gap-2'>
                {updateStatus === 'downloaded' ? (
                  <button
                    onClick={handleRestart}
                    className='flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2'
                  >
                    <Download size={14} /> Restart & Update
                  </button>
                ) : (
                  <button
                    onClick={handleCheckForUpdates}
                    disabled={updateStatus === 'checking'}
                    className='flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2'
                  >
                    <RefreshCw
                      size={14}
                      className={
                        updateStatus === 'checking' ? 'animate-spin' : ''
                      }
                    />
                    Check for Updates
                  </button>
                )}
              </div>
            </div>

            <div className='mt-6 flex justify-end'>
              <button
                onClick={() => setShowSettings(false)}
                className='px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors'
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Update Notification */}
      {updateStatus !== 'none' &&
        !updateDismissed &&
        updateStatus !== 'not-available' &&
        updateStatus !== 'error' &&
        updateStatus !== 'checking' && (
          <div className='fixed bottom-4 right-4 bg-white p-4 rounded-xl shadow-2xl border border-gray-200 z-50 animate-in slide-in-from-bottom-5 duration-300 max-w-sm'>
            <div className='flex items-start gap-4'>
              <div className='p-2 bg-blue-50 text-blue-600 rounded-lg'>
                <Download size={24} />
              </div>
              <div className='flex-1'>
                <h4 className='font-semibold text-gray-900'>
                  {updateStatus === 'available'
                    ? 'Update Available'
                    : 'Update Ready'}
                </h4>
                <p className='text-sm text-gray-600 mt-1'>
                  {updateStatus === 'available'
                    ? 'A new version is downloading in the background.'
                    : 'A new version has been downloaded and is ready to install.'}
                </p>
                {updateStatus === 'downloaded' && (
                  <button
                    onClick={handleRestart}
                    className='mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors w-full'
                  >
                    Restart & Update
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setUpdateDismissed(true);
                  // Persist dismissal for this version so it survives restart
                  const ver = downloadedVersion || appVersion;
                  localStorage.setItem('update_dismissed_version', ver);
                }}
                className='text-gray-400 hover:text-gray-600'
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
    </div>
  );
}

export default App;
