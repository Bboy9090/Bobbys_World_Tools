/**
 * Utilities Page - Tool Execution & Macro Management
 * Hades Gate (Abyss Purple) themed
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { useDeviceStore } from '../stores/deviceStore';

interface Macro {
  id: number;
  name: string;
  description: string;
  commands: string[];
  created_at: string;
}

interface CustomTool {
  id: string;
  displayName: string;
  filePath: string;
  args?: string;
}

interface TerminalLine {
  type: 'stdout' | 'stderr' | 'info' | 'success' | 'error';
  text: string;
  timestamp: Date;
}

export function Utilities() {
  const [activeSection, setActiveSection] = useState<'macros' | 'tools'>('tools');
  const [macros, setMacros] = useState<Macro[]>([]);
  const [customTools, setCustomTools] = useState<CustomTool[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<TerminalLine[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentToolName, setCurrentToolName] = useState('');
  
  const [newMacroName, setNewMacroName] = useState('');
  const [newMacroDescription, setNewMacroDescription] = useState('');
  const [recordedCommands, setRecordedCommands] = useState<string[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  const [newToolName, setNewToolName] = useState('');
  const [newToolPath, setNewToolPath] = useState('');
  const [newToolArgs, setNewToolArgs] = useState('');
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const { devicesWithHistory } = useDeviceStore();

  const defaultTools: CustomTool[] = [
    { id: 'adb', displayName: 'ADB (Android Debug Bridge)', filePath: 'adb', args: 'devices' },
    { id: 'fastboot', displayName: 'Fastboot', filePath: 'fastboot', args: 'devices' },
    { id: 'ideviceinfo', displayName: 'ideviceinfo (iOS)', filePath: 'ideviceinfo', args: '' },
    { id: 'idevice_id', displayName: 'idevice_id (iOS)', filePath: 'idevice_id', args: '-l' },
  ];

  useEffect(() => {
    loadMacros();
    const savedTools = localStorage.getItem('pandora_custom_tools');
    if (savedTools) {
      setCustomTools(JSON.parse(savedTools));
    }
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  const loadMacros = async () => {
    const result = await apiService.getMacros();
    if (result.success && result.data) {
      setMacros(result.data);
    }
  };

  const addTerminalLine = useCallback((type: TerminalLine['type'], text: string) => {
    setTerminalOutput(prev => [...prev, { type, text, timestamp: new Date() }]);
  }, []);

  const executeToolWithStreaming = async (toolPath: string, args: string[] = [], displayName: string) => {
    setCurrentToolName(displayName);
    setTerminalOutput([]);
    setShowTerminal(true);
    setIsExecuting(true);

    addTerminalLine('info', `$ ${toolPath} ${args.join(' ')}`);
    addTerminalLine('info', '─'.repeat(50));

    try {
      const response = await apiService.executeTool(toolPath, args);
      const result = response as any;
      
      if (result.output) {
        const lines = String(result.output).split('\n');
        for (const line of lines) {
          if (line.trim()) {
            addTerminalLine('stdout', line);
          }
        }
      }
      
      if (result.error_message) {
        addTerminalLine('stderr', String(result.error_message));
      }

      addTerminalLine('info', '─'.repeat(50));
      
      if (result.status === 'Success') {
        addTerminalLine('success', `Process completed successfully`);
      } else if (result.status === 'ToolNotFound') {
        addTerminalLine('error', `Tool not found: ${toolPath}`);
        addTerminalLine('info', 'Make sure the tool is installed and in your PATH');
      } else if (result.status === 'Failed') {
        addTerminalLine('error', `Process failed`);
      } else {
        addTerminalLine('error', `Status: ${result.status || 'Unknown'}`);
      }

      if (result.requires_ticket && result.ticket_id) {
        addTerminalLine('info', `Repair ticket created: #${result.ticket_id}`);
      }
    } catch (err) {
      addTerminalLine('error', `Execution error: ${String(err)}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const executeMacroWithStreaming = async (macro: Macro) => {
    const device = devicesWithHistory[0];
    const serial = device?.serial;
    
    if (!serial) {
      setCurrentToolName(`Macro: ${macro.name}`);
      setTerminalOutput([]);
      setShowTerminal(true);
      addTerminalLine('error', 'No device connected');
      addTerminalLine('info', 'Connect an Android device via USB to run this macro.');
      addTerminalLine('info', 'Ensure USB debugging is enabled on your device.');
      return;
    }
    
    setCurrentToolName(`Macro: ${macro.name}`);
    setTerminalOutput([]);
    setShowTerminal(true);
    setIsExecuting(true);

    addTerminalLine('info', `Executing macro: ${macro.name}`);
    addTerminalLine('info', `Target device: ${device.model || device.manufacturer || serial}`);
    addTerminalLine('info', `Commands: ${macro.commands.length}`);
    addTerminalLine('info', '─'.repeat(50));

    try {
      const response = await apiService.executeMacro(macro.id, serial);
      const result = response as any;
      
      if (result.step_results) {
        for (const step of result.step_results) {
          addTerminalLine('info', `$ ${step.command}`);
          if (step.output) {
            const lines = String(step.output).split('\n');
            for (const line of lines) {
              if (line.trim()) {
                addTerminalLine(step.success ? 'stdout' : 'stderr', line);
              }
            }
          }
          addTerminalLine(step.success ? 'success' : 'error', 
            step.success ? 'Step completed' : 'Step failed');
        }
      }

      addTerminalLine('info', '─'.repeat(50));
      addTerminalLine(result.success ? 'success' : 'error',
        `Macro ${result.success ? 'completed' : 'failed'}: ${result.completed_steps || 0}/${result.total_steps || 0} steps`);

      if (result.requires_ticket && result.ticket_id) {
        addTerminalLine('info', `Repair ticket created: #${result.ticket_id}`);
      }
    } catch (err) {
      addTerminalLine('error', `Execution error: ${String(err)}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const addCommand = () => {
    if (currentCommand.trim()) {
      setRecordedCommands([...recordedCommands, currentCommand.trim()]);
      setCurrentCommand('');
    }
  };

  const removeCommand = (index: number) => {
    setRecordedCommands(recordedCommands.filter((_, i) => i !== index));
  };

  const saveMacro = async () => {
    if (!newMacroName.trim() || recordedCommands.length === 0) return;

    const result = await apiService.createMacro(newMacroName, newMacroDescription, recordedCommands);
    if (result.success) {
      await loadMacros();
      setNewMacroName('');
      setNewMacroDescription('');
      setRecordedCommands([]);
      setIsRecording(false);
    }
  };

  const deleteMacro = async (macroId: number) => {
    const result = await apiService.deleteMacro(macroId);
    if (result.success) {
      await loadMacros();
    }
  };

  const addCustomTool = () => {
    if (!newToolName.trim() || !newToolPath.trim()) return;

    const newTool: CustomTool = {
      id: `custom_${Date.now()}`,
      displayName: newToolName,
      filePath: newToolPath,
      args: newToolArgs
    };

    const updatedTools = [...customTools, newTool];
    setCustomTools(updatedTools);
    localStorage.setItem('pandora_custom_tools', JSON.stringify(updatedTools));
    
    setNewToolName('');
    setNewToolPath('');
    setNewToolArgs('');
  };

  const removeCustomTool = (toolId: string) => {
    const updatedTools = customTools.filter(t => t.id !== toolId);
    setCustomTools(updatedTools);
    localStorage.setItem('pandora_custom_tools', JSON.stringify(updatedTools));
  };

  const allTools = [...defaultTools, ...customTools];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-grimoire font-bold text-grimoire-abyss-purple mb-2">
            Utilities
          </h2>
          <p className="text-dark-muted font-tech">
            Tool execution and ADB macro management
          </p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-3 rounded-lg bg-grimoire-obsidian-light border border-grimoire-abyss-purple/30 
                     hover:border-grimoire-abyss-purple/60 transition-all duration-300 group"
          title="Configure Tools"
        >
          <svg className="w-6 h-6 text-grimoire-abyss-purple group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      <div className="flex gap-2 border-b border-grimoire-abyss-purple/20 pb-2">
        {[
          { id: 'tools', label: 'External Tool Runner' },
          { id: 'macros', label: 'Macro Recorder' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as typeof activeSection)}
            className={`px-4 py-2 rounded-t-lg font-tech font-medium transition-all duration-300
              ${activeSection === tab.id
                ? 'text-grimoire-abyss-purple bg-grimoire-obsidian-light border-b-2 border-grimoire-abyss-purple'
                : 'text-dark-muted hover:text-dark-text'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSection === 'tools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allTools.map((tool) => (
            <div
              key={tool.id}
              className="p-4 rounded-lg bg-gradient-to-br from-grimoire-abyss-purple/20 to-purple-500/10 
                         border border-grimoire-abyss-purple/30 hover:border-grimoire-abyss-purple/60 
                         transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-tech font-semibold text-grimoire-abyss-purple">
                    {tool.displayName}
                  </h3>
                  <p className="text-xs text-dark-muted font-mono mt-1">{tool.filePath}</p>
                </div>
                {tool.id.startsWith('custom_') && (
                  <button
                    onClick={() => removeCustomTool(tool.id)}
                    className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove tool"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                onClick={() => executeToolWithStreaming(tool.filePath, tool.args ? tool.args.split(' ') : [], tool.displayName)}
                className="w-full py-2 px-4 rounded-lg bg-grimoire-abyss-purple/20 border border-grimoire-abyss-purple/40
                           hover:bg-grimoire-abyss-purple/30 hover:border-grimoire-abyss-purple/60
                           text-grimoire-abyss-purple font-tech font-medium transition-all duration-300
                           flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Run
              </button>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'macros' && (
        <div className="space-y-6">
          {!isRecording ? (
            <button
              onClick={() => setIsRecording(true)}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-grimoire-abyss-purple to-purple-600
                         text-white font-tech font-semibold transition-all duration-300
                         hover:shadow-lg hover:shadow-grimoire-abyss-purple/30 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Record New Macro
            </button>
          ) : (
            <div className="p-6 rounded-lg bg-grimoire-obsidian-light border border-grimoire-abyss-purple/40 space-y-4">
              <div className="flex items-center gap-2 text-red-400 animate-pulse">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="font-tech font-semibold">Recording Macro</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-tech text-dark-muted mb-1">Macro Name</label>
                  <input
                    type="text"
                    value={newMacroName}
                    onChange={(e) => setNewMacroName(e.target.value)}
                    placeholder="e.g., Battery Diagnostics"
                    className="w-full px-4 py-2 rounded-lg bg-grimoire-obsidian border border-grimoire-abyss-purple/30
                               text-dark-text font-tech focus:border-grimoire-abyss-purple/60 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-tech text-dark-muted mb-1">Description</label>
                  <input
                    type="text"
                    value={newMacroDescription}
                    onChange={(e) => setNewMacroDescription(e.target.value)}
                    placeholder="e.g., Runs battery info and stats"
                    className="w-full px-4 py-2 rounded-lg bg-grimoire-obsidian border border-grimoire-abyss-purple/30
                               text-dark-text font-tech focus:border-grimoire-abyss-purple/60 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-tech text-dark-muted mb-1">Add ADB Command</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentCommand}
                    onChange={(e) => setCurrentCommand(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCommand()}
                    placeholder="e.g., shell dumpsys battery"
                    className="flex-1 px-4 py-2 rounded-lg bg-grimoire-obsidian border border-grimoire-abyss-purple/30
                               text-dark-text font-mono focus:border-grimoire-abyss-purple/60 focus:outline-none"
                  />
                  <button
                    onClick={addCommand}
                    className="px-4 py-2 rounded-lg bg-grimoire-abyss-purple/30 border border-grimoire-abyss-purple/50
                               text-grimoire-abyss-purple font-tech hover:bg-grimoire-abyss-purple/40 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {recordedCommands.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-tech text-dark-muted">Recorded Commands ({recordedCommands.length})</label>
                  <div className="p-3 rounded-lg bg-grimoire-obsidian border border-grimoire-abyss-purple/20 max-h-48 overflow-y-auto space-y-1">
                    {recordedCommands.map((cmd, i) => (
                      <div key={i} className="flex items-center justify-between px-2 py-1 rounded bg-grimoire-abyss-purple/10 group">
                        <span className="font-mono text-sm text-dark-text">
                          <span className="text-dark-muted mr-2">{i + 1}.</span>
                          adb {cmd}
                        </span>
                        <button
                          onClick={() => removeCommand(i)}
                          className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={saveMacro}
                  disabled={!newMacroName.trim() || recordedCommands.length === 0}
                  className="px-6 py-2 rounded-lg bg-green-600 text-white font-tech font-semibold
                             hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Macro
                </button>
                <button
                  onClick={() => {
                    setIsRecording(false);
                    setNewMacroName('');
                    setNewMacroDescription('');
                    setRecordedCommands([]);
                  }}
                  className="px-6 py-2 rounded-lg bg-grimoire-obsidian border border-red-500/50
                             text-red-400 font-tech hover:bg-red-500/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-tech font-semibold text-grimoire-abyss-purple">Saved Macros</h3>
            {macros.length === 0 ? (
              <div className="p-8 rounded-lg bg-grimoire-obsidian-light border border-grimoire-abyss-purple/20 text-center">
                <p className="text-dark-muted font-tech">No macros saved yet. Record your first macro above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {macros.map((macro) => (
                  <div
                    key={macro.id}
                    className="p-4 rounded-lg bg-gradient-to-br from-grimoire-abyss-purple/20 to-purple-500/10 
                               border border-grimoire-abyss-purple/30 hover:border-grimoire-abyss-purple/60 
                               transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-tech font-semibold text-grimoire-abyss-purple">{macro.name}</h4>
                        <p className="text-xs text-dark-muted">{macro.description}</p>
                      </div>
                      <button
                        onClick={() => deleteMacro(macro.id)}
                        className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete macro"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-xs text-dark-muted font-mono mb-3 bg-grimoire-obsidian/50 p-2 rounded max-h-20 overflow-y-auto">
                      {macro.commands.map((cmd, i) => (
                        <div key={i}>adb {cmd}</div>
                      ))}
                    </div>
                    <button
                      onClick={() => executeMacroWithStreaming(macro)}
                      className="w-full py-2 px-4 rounded-lg bg-grimoire-abyss-purple/20 border border-grimoire-abyss-purple/40
                                 hover:bg-grimoire-abyss-purple/30 hover:border-grimoire-abyss-purple/60
                                 text-grimoire-abyss-purple font-tech font-medium transition-all duration-300
                                 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Execute Macro {devicesWithHistory.length === 0 && '(No Device)'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-grimoire-obsidian border border-grimoire-abyss-purple/40 rounded-xl max-w-lg w-full 
                          shadow-2xl shadow-grimoire-abyss-purple/20 animate-fade-in-up">
            <div className="flex items-center justify-between p-4 border-b border-grimoire-abyss-purple/20">
              <h3 className="text-lg font-grimoire font-semibold text-grimoire-abyss-purple">
                Tool Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-dark-muted hover:text-dark-text transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <p className="text-sm text-dark-muted font-tech">
                Add custom tools to execute from the Utilities page. Enter the display name and the full path to the executable.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-tech text-dark-muted mb-1">Display Name</label>
                  <input
                    type="text"
                    value={newToolName}
                    onChange={(e) => setNewToolName(e.target.value)}
                    placeholder="e.g., My Custom Tool"
                    className="w-full px-4 py-2 rounded-lg bg-grimoire-obsidian-light border border-grimoire-abyss-purple/30
                               text-dark-text font-tech focus:border-grimoire-abyss-purple/60 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-tech text-dark-muted mb-1">Local File Path</label>
                  <input
                    type="text"
                    value={newToolPath}
                    onChange={(e) => setNewToolPath(e.target.value)}
                    placeholder="e.g., /usr/local/bin/mytool or C:\Tools\mytool.exe"
                    className="w-full px-4 py-2 rounded-lg bg-grimoire-obsidian-light border border-grimoire-abyss-purple/30
                               text-dark-text font-mono focus:border-grimoire-abyss-purple/60 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-tech text-dark-muted mb-1">Default Arguments (optional)</label>
                  <input
                    type="text"
                    value={newToolArgs}
                    onChange={(e) => setNewToolArgs(e.target.value)}
                    placeholder="e.g., --version"
                    className="w-full px-4 py-2 rounded-lg bg-grimoire-obsidian-light border border-grimoire-abyss-purple/30
                               text-dark-text font-mono focus:border-grimoire-abyss-purple/60 focus:outline-none"
                  />
                </div>
                <button
                  onClick={addCustomTool}
                  disabled={!newToolName.trim() || !newToolPath.trim()}
                  className="w-full py-2 px-4 rounded-lg bg-grimoire-abyss-purple text-white font-tech font-semibold
                             hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Tool
                </button>
              </div>

              {customTools.length > 0 && (
                <div className="pt-4 border-t border-grimoire-abyss-purple/20">
                  <h4 className="text-sm font-tech font-semibold text-grimoire-abyss-purple mb-2">Custom Tools ({customTools.length})</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {customTools.map((tool) => (
                      <div key={tool.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-grimoire-obsidian-light">
                        <div>
                          <span className="font-tech text-dark-text">{tool.displayName}</span>
                          <span className="text-xs text-dark-muted font-mono ml-2">{tool.filePath}</span>
                        </div>
                        <button
                          onClick={() => removeCustomTool(tool.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showTerminal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-grimoire-obsidian border border-grimoire-abyss-purple/40 rounded-xl w-full max-w-4xl h-[80vh]
                          shadow-2xl shadow-grimoire-abyss-purple/20 animate-fade-in-up flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-grimoire-abyss-purple/20">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isExecuting ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                <h3 className="font-mono text-grimoire-abyss-purple">
                  {currentToolName}
                </h3>
              </div>
              <button
                onClick={() => setShowTerminal(false)}
                disabled={isExecuting}
                className="text-dark-muted hover:text-dark-text transition-colors disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div 
              ref={terminalRef}
              className="flex-1 p-4 overflow-y-auto font-mono text-sm bg-black/50"
            >
              {terminalOutput.map((line, i) => (
                <div 
                  key={i} 
                  className={`py-0.5 ${
                    line.type === 'stdout' ? 'text-gray-200' :
                    line.type === 'stderr' ? 'text-red-400' :
                    line.type === 'info' ? 'text-grimoire-abyss-purple' :
                    line.type === 'success' ? 'text-green-400' :
                    'text-red-500'
                  }`}
                >
                  {line.text}
                </div>
              ))}
              {isExecuting && (
                <div className="flex items-center gap-2 text-grimoire-abyss-purple animate-pulse mt-2">
                  <span>Processing</span>
                  <span className="inline-block w-2 h-4 bg-grimoire-abyss-purple animate-blink"></span>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-grimoire-abyss-purple/20 flex justify-end">
              <button
                onClick={() => setShowTerminal(false)}
                disabled={isExecuting}
                className="px-6 py-2 rounded-lg bg-grimoire-abyss-purple/20 border border-grimoire-abyss-purple/40
                           text-grimoire-abyss-purple font-tech hover:bg-grimoire-abyss-purple/30 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExecuting ? 'Running...' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
