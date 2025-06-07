import React, { useState, useEffect } from 'react';
import './App.css';

interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeConfusing: boolean;
}

interface PassphraseOptions {
  wordCount: number;
  separator: string;
  includeNumbers: boolean;
  capitalize: boolean;
}

interface PasswordTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  options: PasswordOptions;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
  duration: number;
}

interface HistoryItem {
  id: number;
  password: string;
  type: 'random' | 'passphrase';
  timestamp: Date;
  strength: { score: number; text: string; color: string };
}

const passwordTemplates: PasswordTemplate[] = [
  {
    id: 'banking',
    name: 'Banking & Finance',
    description: 'Maximum security for financial accounts',
    icon: '🏦',
    options: { length: 20, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: true, excludeConfusing: true }
  },
  {
    id: 'social',
    name: 'Social Media',
    description: 'Strong but memorable for daily use',
    icon: '📱',
    options: { length: 16, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: false, excludeConfusing: true }
  },
  {
    id: 'work',
    name: 'Work & Business',
    description: 'Professional accounts and systems',
    icon: '💼',
    options: { length: 18, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: true, excludeConfusing: true }
  },
  {
    id: 'gaming',
    name: 'Gaming',
    description: 'Gaming platforms and accounts',
    icon: '🎮',
    options: { length: 14, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: false, excludeConfusing: false }
  },
  {
    id: 'wifi',
    name: 'WiFi Network',
    description: 'Home and office network security',
    icon: '📶',
    options: { length: 24, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: false, excludeConfusing: true }
  },
  {
    id: 'email',
    name: 'Email Accounts',
    description: 'Email and communication platforms',
    icon: '📧',
    options: { length: 16, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: true, excludeConfusing: true }
  }
];

const wordList = [
  'apple', 'bridge', 'castle', 'dragon', 'eagle', 'forest', 'garden', 'harbor', 'island', 'jungle',
  'knight', 'lemon', 'mountain', 'nebula', 'ocean', 'palace', 'queen', 'river', 'sunset', 'tiger',
  'umbrella', 'valley', 'wizard', 'xylophone', 'yellow', 'zebra', 'anchor', 'balloon', 'crystal', 'diamond',
  'elephant', 'flame', 'galaxy', 'hammer', 'iceberg', 'jasmine', 'kitten', 'lighthouse', 'magnet', 'ninja',
  'orange', 'phoenix', 'quartz', 'rainbow', 'storm', 'thunder', 'unicorn', 'volcano', 'whisper', 'zephyr',
  'coffee', 'memory', 'pencil', 'shadow', 'window', 'puzzle', 'rocket', 'butter', 'circle', 'flower',
  'planet', 'copper', 'marble', 'silver', 'golden', 'purple', 'bright', 'frozen', 'gentle', 'hidden'
];

function App() {
  const [password, setPassword] = useState('');
  const [passwords, setPasswords] = useState<string[]>([]);
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeConfusing: false,
  });
  const [passphraseOptions, setPassphraseOptions] = useState<PassphraseOptions>({
    wordCount: 4,
    separator: '-',
    includeNumbers: true,
    capitalize: true,
  });
  const [multiCount, setMultiCount] = useState(1);
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [passwordHistory, setPasswordHistory] = useState<HistoryItem[]>([]);
  const [generationType, setGenerationType] = useState<'random' | 'passphrase'>('random');
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const showToast = (message: string, type: 'success' | 'error', duration: number = 3000) => {
    const id = Date.now();
    const newToast: Toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const generatePassword = (opts: PasswordOptions): string => {
    let charset = '';
    
    if (opts.includeLowercase) {
      charset += opts.excludeConfusing ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
    }
    if (opts.includeUppercase) {
      charset += opts.excludeConfusing ? 'ABCDEFGHJKMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }
    if (opts.includeNumbers) {
      charset += opts.excludeConfusing ? '23456789' : '0123456789';
    }
    if (opts.includeSymbols) {
      charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    }

    if (charset === '') {
      return 'Please select at least one character type';
    }

    let password = '';
    for (let i = 0; i < opts.length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
  };

  const generatePassphrase = (opts: PassphraseOptions): string => {
    const selectedWords = [];
    const usedIndices = new Set();
    
    // Select random words
    while (selectedWords.length < opts.wordCount) {
      const randomIndex = Math.floor(Math.random() * wordList.length);
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        let word = wordList[randomIndex];
        
        if (opts.capitalize) {
          word = word.charAt(0).toUpperCase() + word.slice(1);
        }
        
        selectedWords.push(word);
      }
    }
    
    let passphrase = selectedWords.join(opts.separator);
    
    // Add numbers if requested
    if (opts.includeNumbers) {
      const randomNum = Math.floor(Math.random() * 9999) + 1;
      passphrase += opts.separator + randomNum;
    }
    
    return passphrase;
  };

  const calculateStrength = (password: string): { score: number; text: string; color: string } => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score, text: 'Weak', color: '#ff4757' };
    if (score <= 4) return { score, text: 'Medium', color: '#ffa502' };
    if (score <= 5) return { score, text: 'Strong', color: '#2ed573' };
    return { score, text: 'Very Strong', color: '#5f27cd' };
  };

  const addToHistory = (newPassword: string, type: 'random' | 'passphrase') => {
    const historyItem: HistoryItem = {
      id: Date.now(),
      password: newPassword,
      type,
      timestamp: new Date(),
      strength: calculateStrength(newPassword)
    };
    
    setPasswordHistory(prev => [historyItem, ...prev.slice(0, 49)]); // Keep last 50
  };

  const applyTemplate = (template: PasswordTemplate) => {
    setOptions(template.options);
    setGenerationType('random');
    setShowTemplates(false);
    showToast(`✅ Applied ${template.name} template`, 'success', 2000);
  };

  const handleGenerate = () => {
    let newPassword: string;
    
    if (generationType === 'passphrase') {
      newPassword = generatePassphrase(passphraseOptions);
    } else {
      newPassword = generatePassword(options);
    }
    
    if (multiCount === 1) {
      setPassword(newPassword);
      setPasswords([newPassword]);
      addToHistory(newPassword, generationType);
    } else {
      const newPasswords = Array.from({ length: multiCount }, () => 
        generationType === 'passphrase' ? generatePassphrase(passphraseOptions) : generatePassword(options)
      );
      setPasswords(newPasswords);
      setPassword(newPasswords[0]);
      // Add all to history
      newPasswords.forEach(pwd => addToHistory(pwd, generationType));
    }
    setCopied(false);
  };

  const copyToClipboard = async (text: string, source: string = 'main') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast(`✅ Password copied successfully!`, 'success', 2000);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy password:', err);
      
      // Fallback method for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          setCopied(true);
          showToast(`✅ Password copied successfully!`, 'success', 2000);
          setTimeout(() => setCopied(false), 2000);
        } else {
          throw new Error('Fallback copy failed');
        }
      } catch (fallbackErr) {
        showToast(`❌ Failed to copy password. Please copy manually.`, 'error', 4000);
      }
    }
  };

  const updateOption = (key: keyof PasswordOptions, value: boolean | number) => {
    const newOptions = { ...options, [key]: value };
    setOptions(newOptions);
  };

  const updatePassphraseOption = (key: keyof PassphraseOptions, value: boolean | number | string) => {
    const newOptions = { ...passphraseOptions, [key]: value };
    setPassphraseOptions(newOptions);
  };

  const clearHistory = () => {
    setPasswordHistory([]);
    showToast('🗑️ Password history cleared', 'success', 2000);
  };

  useEffect(() => {
    handleGenerate();
  }, [options, passphraseOptions, generationType]); // eslint-disable-line react-hooks/exhaustive-deps

  const strength = calculateStrength(password);
  const isValidOptions = generationType === 'passphrase' || 
                        (options.includeUppercase || options.includeLowercase || 
                         options.includeNumbers || options.includeSymbols);

  return (
    <div className="App">
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            onClick={() => removeToast(toast.id)}
          >
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="container">
        <header className="header">
          <h1>🔐 Password Generator</h1>
          <p>Create strong, secure passwords and passphrases to protect your accounts</p>
          
          {/* Action Buttons */}
          <div className="header-actions">
            <button 
              className="action-btn" 
              onClick={() => setShowTemplates(!showTemplates)}
            >
              📋 Templates
            </button>
            <button 
              className="action-btn" 
              onClick={() => setShowHistory(!showHistory)}
            >
              📜 History ({passwordHistory.length})
            </button>
          </div>
        </header>

        {/* Templates Panel */}
        {showTemplates && (
          <div className="templates-panel">
            <h3>🎯 Password Templates</h3>
            <div className="templates-grid">
              {passwordTemplates.map((template) => (
                <div
                  key={template.id}
                  className="template-card"
                  onClick={() => applyTemplate(template)}
                >
                  <div className="template-icon">{template.icon}</div>
                  <div className="template-info">
                    <h4>{template.name}</h4>
                    <p>{template.description}</p>
                    <div className="template-specs">
                      {template.options.length} chars • {template.options.includeSymbols ? 'Symbols' : 'No Symbols'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Panel */}
        {showHistory && (
          <div className="history-panel">
            <div className="history-header">
              <h3>📜 Password History</h3>
              {passwordHistory.length > 0 && (
                <button className="clear-history-btn" onClick={clearHistory}>
                  🗑️ Clear All
                </button>
              )}
            </div>
            <div className="history-list">
              {passwordHistory.length === 0 ? (
                <div className="history-empty">
                  <p>No passwords generated yet. Start creating some!</p>
                </div>
              ) : (
                passwordHistory.map((item) => (
                  <div key={item.id} className="history-item">
                    <div className="history-password">
                      <span className="password-text">{item.password}</span>
                      <div className="history-meta">
                        <span className={`history-type ${item.type}`}>
                          {item.type === 'passphrase' ? '📝' : '🔤'} {item.type}
                        </span>
                        <span className="history-strength" style={{ color: item.strength.color }}>
                          {item.strength.text}
                        </span>
                        <span className="history-time">
                          {item.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <button 
                      className="copy-small-btn"
                      onClick={() => copyToClipboard(item.password, 'history')}
                    >
                      📋
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Generation Type Selector */}
        <div className="generation-type">
          <div className="type-selector">
            <button 
              className={`type-btn ${generationType === 'random' ? 'active' : ''}`}
              onClick={() => setGenerationType('random')}
            >
              🔤 Random Password
            </button>
            <button 
              className={`type-btn ${generationType === 'passphrase' ? 'active' : ''}`}
              onClick={() => setGenerationType('passphrase')}
            >
              📝 Passphrase
            </button>
          </div>
        </div>

        <div className="password-section">
          <div className="password-display">
            <div className="password-field">
              <input 
                type="text" 
                value={password} 
                readOnly 
                className="password-input"
                placeholder="Generated password will appear here..."
              />
              <button 
                className={`copy-btn ${copied ? 'copied' : ''}`}
                onClick={() => copyToClipboard(password)}
                disabled={!password || !isValidOptions}
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
              <button 
                className="generate-btn"
                onClick={handleGenerate}
                disabled={!isValidOptions}
              >
                🔄 Generate
              </button>
            </div>
            
            {password && isValidOptions && (
              <div className="strength-indicator">
                <div className="strength-bar">
                  <div 
                    className="strength-fill" 
                    style={{ 
                      width: `${(strength.score / 7) * 100}%`,
                      backgroundColor: strength.color 
                    }}
                  />
                </div>
                <span className="strength-text" style={{ color: strength.color }}>
                  {strength.text} Password
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Options Section - Dynamic based on generation type */}
        <div className="options-section">
          {generationType === 'random' ? (
            <>
              <div className="length-section">
                <label className="option-label">
                  Password Length: <span className="length-value">{options.length}</span>
                </label>
                <div className="slider-container">
                  <div 
                    className="slider-progress"
                    style={{
                      width: `${((options.length - 8) / (50 - 8)) * 100}%`
                    }}
                  />
                  <input
                    type="range"
                    min="8"
                    max="50"
                    value={options.length}
                    onChange={(e) => updateOption('length', parseInt(e.target.value))}
                    className="length-slider"
                  />
                  <div 
                    className="slider-thumb-value"
                    style={{
                      left: `${((options.length - 8) / (50 - 8)) * 100}%`
                    }}
                  >
                    {options.length}
                  </div>
                </div>
                <div className="length-indicators">
                  <span>8</span>
                  <span>50</span>
                </div>
              </div>

              <div className="character-options">
                <h3>Character Types</h3>
                <div className="option-grid">
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={options.includeLowercase}
                      onChange={(e) => updateOption('includeLowercase', e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Lowercase letters (a-z)
                  </label>

                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={options.includeUppercase}
                      onChange={(e) => updateOption('includeUppercase', e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Uppercase letters (A-Z)
                  </label>

                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={options.includeNumbers}
                      onChange={(e) => updateOption('includeNumbers', e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Numbers (0-9)
                  </label>

                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={options.includeSymbols}
                      onChange={(e) => updateOption('includeSymbols', e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Symbols (!@#$%^&*)
                  </label>

                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={options.excludeConfusing}
                      onChange={(e) => updateOption('excludeConfusing', e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Exclude confusing characters (0, O, l, 1)
                  </label>
                </div>
              </div>
            </>
          ) : (
            <div className="passphrase-options">
              <h3>📝 Passphrase Settings</h3>
              
              <div className="passphrase-controls">
                <div className="control-group">
                  <label className="option-label">
                    Number of Words: <span className="length-value">{passphraseOptions.wordCount}</span>
                  </label>
                  <div className="slider-container">
                    <div 
                      className="slider-progress"
                      style={{
                        width: `${((passphraseOptions.wordCount - 3) / (8 - 3)) * 100}%`
                      }}
                    />
                    <input
                      type="range"
                      min="3"
                      max="8"
                      value={passphraseOptions.wordCount}
                      onChange={(e) => updatePassphraseOption('wordCount', parseInt(e.target.value))}
                      className="length-slider"
                    />
                    <div 
                      className="slider-thumb-value"
                      style={{
                        left: `${((passphraseOptions.wordCount - 3) / (8 - 3)) * 100}%`
                      }}
                    >
                      {passphraseOptions.wordCount}
                    </div>
                  </div>
                  <div className="length-indicators">
                    <span>3</span>
                    <span>8</span>
                  </div>
                </div>

                <div className="control-group">
                  <label className="option-label">Word Separator:</label>
                  <select 
                    value={passphraseOptions.separator} 
                    onChange={(e) => updatePassphraseOption('separator', e.target.value)}
                    className="separator-select"
                  >
                    <option value="-">Dash (-)</option>
                    <option value="_">Underscore (_)</option>
                    <option value=".">Dot (.)</option>
                    <option value=" ">Space ( )</option>
                    <option value="">No Separator</option>
                  </select>
                </div>
              </div>

              <div className="passphrase-checkboxes">
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={passphraseOptions.capitalize}
                    onChange={(e) => updatePassphraseOption('capitalize', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Capitalize First Letters
                </label>

                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={passphraseOptions.includeNumbers}
                    onChange={(e) => updatePassphraseOption('includeNumbers', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Include Numbers
                </label>
              </div>
            </div>
          )}

          <div className="multi-password-section">
            <label className="option-label">
              Generate Multiple Passwords:
            </label>
            <select 
              value={multiCount} 
              onChange={(e) => setMultiCount(parseInt(e.target.value))}
              className="multi-select"
            >
              <option value={1}>1 Password</option>
              <option value={5}>5 Passwords</option>
              <option value={10}>10 Passwords</option>
              <option value={25}>25 Passwords</option>
            </select>
          </div>
        </div>

        {passwords.length > 1 && (
          <div className="multiple-passwords">
            <h3>Generated {generationType === 'passphrase' ? 'Passphrases' : 'Passwords'} ({passwords.length})</h3>
            <div className="password-list">
              {passwords.map((pwd, index) => (
                <div key={index} className="password-item">
                  <span className="password-text">{pwd}</span>
                  <button 
                    className="copy-small-btn"
                    onClick={() => copyToClipboard(pwd, 'list')}
                  >
                    📋
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="security-tips">
          <h3>🛡️ Password Security Tips</h3>
          <div className="tips-grid">
            <div className="tip">
              <strong>Use Unique Passwords:</strong> Never reuse passwords across multiple accounts
            </div>
            <div className="tip">
              <strong>Enable 2FA:</strong> Add two-factor authentication for extra security
            </div>
            <div className="tip">
              <strong>Use a Password Manager:</strong> Store passwords securely with a trusted manager
            </div>
            <div className="tip">
              <strong>Regular Updates:</strong> Change passwords regularly, especially for important accounts
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
