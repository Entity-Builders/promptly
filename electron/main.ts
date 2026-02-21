import { app, BrowserWindow, ipcMain, clipboard } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

log.transports.file.level = 'info';
autoUpdater.logger = log;
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Injected at build time by vite.config.ts
declare const __GH_TOKEN__: string;

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

let win: BrowserWindow | null;
let isQuitting = false;

app.on('before-quit', () => {
  isQuitting = true;
});

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });

  // Hide instead of close on macOS so the app can be re-opened from dock
  win.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      win?.hide();
    }
  });

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win) {
    win.show();
  } else {
    createWindow();
  }
});

app.whenReady().then(() => {
  ipcMain.handle(
    'gemini:generate',
    async (
      _event,
      { apiKey, modelName, systemInstruction, prompt, history },
    ) => {
      try {
        if (!apiKey) {
          throw new Error('API Key is required');
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const modelCallback = {
          model: modelName || 'gemini-2.0-flash-001',
          systemInstruction: systemInstruction
            ? { role: 'system', parts: [{ text: systemInstruction }] }
            : undefined,
        };

        const model = genAI.getGenerativeModel(modelCallback);

        let result;
        if (history && history.length > 0) {
          const chat = model.startChat({
            history: history,
          });
          result = await chat.sendMessage(prompt);
        } else {
          result = await model.generateContent(prompt);
        }

        const response = await result.response;
        return { text: response.text() };
      } catch (error: unknown) {
        console.error('Gemini API Error:', error);
        return {
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
  );

  let geminiWin: BrowserWindow | null = null;

  function createGeminiWindow() {
    if (geminiWin) return;

    geminiWin = new BrowserWindow({
      width: 1200,
      height: 800,
      show: false, // Start hidden
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    geminiWin.loadURL('https://gemini.google.com');

    // Prevent closing, just hide
    geminiWin.on('close', (e) => {
      if (isQuitting) {
        geminiWin = null;
      } else {
        e.preventDefault();
        geminiWin?.hide();
      }
    });
  }

  // isQuitting is now at module scope so both windows share it

  ipcMain.handle(
    'gemini:open-wrapper',
    async (_event, { systemInstruction, prompt, tempChat = true }) => {
      try {
        if (!geminiWin) {
          createGeminiWindow();
        }

        const fullPrompt = `${
          systemInstruction
            ? `System Instructions:\n${systemInstruction}\n\n`
            : ''
        }User Prompt:\n${prompt}`;

        // Copy to clipboard for easy pasting
        clipboard.writeText(fullPrompt);

        // Show window and focus
        geminiWin?.show();
        geminiWin?.focus();

        const encodedPrompt = JSON.stringify(fullPrompt);
        const injectionCode = `
          (function() {
            const prompt = ${encodedPrompt};
            const MAX_RETRIES = 50;
            let retries = 0;

            function inject() {
                // 1. Handle Temporary Chat Toggle
                const shouldTempChat = ${JSON.stringify(tempChat)};
                const tempChatBtn = document.querySelector('button[aria-label="Temporary chat"]');
                if (tempChatBtn && shouldTempChat) {
                    const isActive = tempChatBtn.classList.contains('temp-chat-on') || 
                                     tempChatBtn.getAttribute('aria-pressed') === 'true';
                    
                    if (!isActive) {
                        tempChatBtn.click();
                        setTimeout(typePrompt, 500);
                        return;
                    }
                }

                typePrompt();
            }

            function typePrompt() {
                const input = document.querySelector('div[aria-label="Enter a prompt for Gemini"]') || 
                              document.querySelector('rich-textarea div[contenteditable="true"]');
                
                if (input) {
                    input.focus();
                    document.execCommand('insertText', false, prompt);
                    
                    // Auto-submit
                    setTimeout(() => {
                        const sendBtn = document.querySelector('button[aria-label="Send message"]');
                        if (sendBtn) {
                            sendBtn.click();
                        }
                    }, 800);
                } else if (retries < MAX_RETRIES) {
                    retries++;
                    setTimeout(inject, 500);
                }
            }
            
            // If page is already loaded, run immediate, else wait.
            // Since window is persistent, it likely is loaded.
            if (document.readyState === 'complete') {
              inject();
            } else {
              window.addEventListener('load', inject);
              // Also try instant inject in case listener is too late
              inject(); 
            }
          })();
        `;

        geminiWin?.webContents
          .executeJavaScript(injectionCode)
          .catch((e) => console.error('Injection failed:', e));

        return { success: true };
      } catch (error: unknown) {
        console.error('Gemini Wrapper Error:', error);
        return {
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
  );

  // IPC: Copy text to clipboard
  ipcMain.handle('clipboard:write', (_event, text: string) => {
    clipboard.writeText(text);
    return { success: true };
  });

  // IPC: Get app version
  ipcMain.handle('app:get-version', () => {
    return app.getVersion();
  });

  // IPC: Manually check for updates
  ipcMain.handle('app:check-for-updates', async () => {
    try {
      await autoUpdater.checkForUpdatesAndNotify();
      return { success: true };
    } catch (error: unknown) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  createWindow();
  // Pre-load Gemini
  createGeminiWindow();

  // Configure updater for private GitHub repo
  // __GH_TOKEN__ is injected at build time via vite.config.ts define
  const ghToken = typeof __GH_TOKEN__ !== 'undefined' ? __GH_TOKEN__ : '';
  if (ghToken) {
    log.info('Configuring auto-updater with GitHub token for private repo');
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'juanobrach',
      repo: 'entity-builders',
      private: true,
      token: ghToken,
    });
  } else {
    log.warn('No GH_TOKEN found — auto-updates from private repo will fail');
  }

  // Check for updates on launch
  autoUpdater.checkForUpdatesAndNotify();
});

// Update logic
autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  log.info('Update available.', info);
  win?.webContents.send('update-available');
});

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available.', info);
  win?.webContents.send('update-not-available');
});

autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater. ' + err);
  win?.webContents.send('update-error', err?.message || 'Unknown error');
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = 'Download speed: ' + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message =
    log_message +
    ' (' +
    progressObj.transferred +
    '/' +
    progressObj.total +
    ')';
  log.info(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded', info);
  win?.webContents.send('update-downloaded', info);
});

ipcMain.on('restart-app', () => {
  isQuitting = true;
  autoUpdater.quitAndInstall();
});
