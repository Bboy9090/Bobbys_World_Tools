import React, { useEffect, useState, useCallback } from 'react';
import { useWorkflowStore } from '../../stores/workflowStore';
import type { 
  WorkflowListItem, 
  Platform 
} from '../../types/workflows';
import { CATEGORY_LABELS, PLATFORM_LABELS, STATE_LABELS } from '../../types/workflows';
import './WorkflowRunner.css';

interface WorkflowRunnerProps {
  deviceId?: string;
  deviceInfo?: Record<string, string>;
  platform?: Platform;
  onComplete?: (success: boolean, workflowId: string) => void;
}

export const WorkflowRunner: React.FC<WorkflowRunnerProps> = ({
  deviceId,
  deviceInfo = {},
  platform,
  onComplete,
}) => {
  const {
    workflows,
    currentWorkflow,
    currentExecution,
    probeResult,
    userPrompt,
    isLoading,
    error,
    fetchWorkflows,
    fetchWorkflowDetail,
    startExecution,
    getExecutionProgress,
    cancelExecution,
    provideUserInput,
    probeDevice,
    clearError,
  } = useWorkflowStore();

  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [showMegaOnly, setShowMegaOnly] = useState(false);
  const [showClassicOnly, setShowClassicOnly] = useState(false);

  useEffect(() => {
    fetchWorkflows(platform);
  }, [platform, fetchWorkflows]);

  useEffect(() => {
    if (executionId) {
      const interval = setInterval(() => {
        getExecutionProgress(executionId);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [executionId, getExecutionProgress]);

  useEffect(() => {
    if (currentExecution?.state === 'completed' || currentExecution?.state === 'failed') {
      onComplete?.(currentExecution.state === 'completed', currentWorkflow?.id || '');
    }
  }, [currentExecution?.state, currentWorkflow?.id, onComplete]);

  const handleProbeDevice = useCallback(async () => {
    if (deviceId) {
      await probeDevice(deviceId, deviceInfo);
    }
  }, [deviceId, deviceInfo, probeDevice]);

  const handleSelectWorkflow = async (workflowId: string) => {
    setSelectedWorkflowId(workflowId);
    await fetchWorkflowDetail(workflowId);
  };

  const handleStartExecution = async () => {
    if (!selectedWorkflowId || !deviceId) return;
    
    try {
      const id = await startExecution(selectedWorkflowId, deviceId, deviceInfo);
      setExecutionId(id);
    } catch (err) {
      console.error('Failed to start execution:', err);
    }
  };

  const handleUserChoice = async (choice: string) => {
    if (!executionId || !userPrompt) return;
    await provideUserInput(executionId, userPrompt.stepId, choice);
  };

  const handleCancel = async () => {
    if (executionId) {
      await cancelExecution(executionId);
      setExecutionId(null);
    }
  };

  const filteredWorkflows = workflows.filter((w) => {
    if (showMegaOnly && !w.isMega) return false;
    if (showClassicOnly && w.isMega) return false;
    return true;
  });

  const groupedWorkflows = filteredWorkflows.reduce((acc, workflow) => {
    const category = workflow.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(workflow);
    return acc;
  }, {} as Record<string, WorkflowListItem[]>);

  return (
    <div className="workflow-runner">
      {error && (
        <div className="workflow-error" onClick={clearError}>
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button className="dismiss-btn">×</button>
        </div>
      )}

      {!executionId ? (
        <div className="workflow-selection">
          <div className="workflow-header">
            <h2 className="section-title">Select Workflow</h2>
            <div className="workflow-filters">
              <button
                className={`filter-btn ${!showMegaOnly && !showClassicOnly ? 'active' : ''}`}
                onClick={() => { setShowMegaOnly(false); setShowClassicOnly(false); }}
              >
                All
              </button>
              <button
                className={`filter-btn mega ${showMegaOnly ? 'active' : ''}`}
                onClick={() => { setShowMegaOnly(true); setShowClassicOnly(false); }}
              >
                🚀 MEGA
              </button>
              <button
                className={`filter-btn classic ${showClassicOnly ? 'active' : ''}`}
                onClick={() => { setShowMegaOnly(false); setShowClassicOnly(true); }}
              >
                📋 Classic
              </button>
            </div>
          </div>

          {deviceId && (
            <button className="probe-btn" onClick={handleProbeDevice} disabled={isLoading}>
              {isLoading ? 'Scanning...' : '🔍 Probe Device for Recommendations'}
            </button>
          )}

          {probeResult && (
            <div className="probe-results">
              <h3>Device Analysis</h3>
              <div className="probe-info">
                <span className="probe-label">Platform:</span>
                <span>{PLATFORM_LABELS[probeResult.platform]}</span>
              </div>
              {probeResult.manufacturer && (
                <div className="probe-info">
                  <span className="probe-label">Manufacturer:</span>
                  <span>{probeResult.manufacturer}</span>
                </div>
              )}
              {probeResult.chipset && (
                <div className="probe-info">
                  <span className="probe-label">Chipset:</span>
                  <span>{probeResult.chipset}</span>
                </div>
              )}
              <div className="attack-surfaces">
                <h4>Available Attack Surfaces</h4>
                {probeResult.availableAttackSurfaces.map((surface) => (
                  <div 
                    key={surface.id} 
                    className={`attack-surface ${surface.available ? 'available' : 'unavailable'}`}
                  >
                    <span className="surface-name">{surface.name}</span>
                    <span className="surface-confidence">
                      {Math.round(surface.confidence * 100)}% confidence
                    </span>
                  </div>
                ))}
              </div>
              {probeResult.recommendedWorkflows.length > 0 && (
                <div className="recommendations">
                  <h4>Recommended Workflows</h4>
                  {probeResult.recommendedWorkflows.slice(0, 3).map((rec) => (
                    <div
                      key={rec.workflowId}
                      className="recommendation"
                      onClick={() => handleSelectWorkflow(rec.workflowId)}
                    >
                      <span className="rec-name">{rec.workflowName}</span>
                      <span className="rec-rate">
                        {Math.round(rec.estimatedSuccessRate * 100)}% success
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="workflow-categories">
            {Object.entries(groupedWorkflows).map(([category, categoryWorkflows]) => (
              <div key={category} className="workflow-category">
                <h3 className="category-title">
                  {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category}
                  <span className="category-count">{categoryWorkflows.length}</span>
                </h3>
                <div className="workflow-list">
                  {categoryWorkflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className={`workflow-card ${selectedWorkflowId === workflow.id ? 'selected' : ''} ${workflow.isMega ? 'mega' : ''}`}
                      onClick={() => handleSelectWorkflow(workflow.id)}
                    >
                      <div className="workflow-card-header">
                        <span className="workflow-name">{workflow.name}</span>
                        {workflow.isMega && <span className="mega-badge">MEGA</span>}
                      </div>
                      <p className="workflow-desc">{workflow.description}</p>
                      <div className="workflow-meta">
                        <span className="success-rate">
                          {Math.round(workflow.successRateEstimate * 100)}% success
                        </span>
                        <span className="duration">
                          ~{Math.round(workflow.estimatedDurationSecs / 60)}min
                        </span>
                        <span className="platform-badge">
                          {PLATFORM_LABELS[workflow.platform]}
                        </span>
                      </div>
                      <div className="workflow-tags">
                        {workflow.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {currentWorkflow && (
            <div className="workflow-detail-panel">
              <h3>{currentWorkflow.name}</h3>
              <p>{currentWorkflow.description}</p>
              
              <div className="detail-section">
                <h4>Steps ({currentWorkflow.steps.length})</h4>
                <div className="steps-preview">
                  {currentWorkflow.steps.map((step, index) => (
                    <div key={step.id} className="step-preview">
                      <span className="step-number">{index + 1}</span>
                      <span className="step-name">{step.name}</span>
                      <span className="step-type">{step.actionType}</span>
                    </div>
                  ))}
                </div>
              </div>

              {currentWorkflow.requiredTools.length > 0 && (
                <div className="detail-section">
                  <h4>Required Tools</h4>
                  <div className="tools-list">
                    {currentWorkflow.requiredTools.map((tool) => (
                      <span key={tool} className="tool-badge">{tool}</span>
                    ))}
                  </div>
                </div>
              )}

              <button
                className="start-btn"
                onClick={handleStartExecution}
                disabled={!deviceId || isLoading}
              >
                {isLoading ? 'Starting...' : '▶ Start Workflow'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="workflow-execution">
          <div className="execution-header">
            <h2>{currentExecution?.workflowName || 'Executing...'}</h2>
            <button className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>

          {currentExecution && (
            <>
              <div className="progress-section">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${currentExecution.progressPercent}%` }}
                  />
                </div>
                <div className="progress-info">
                  <span className="progress-text">
                    Step {currentExecution.currentStepIndex + 1} of {currentExecution.totalSteps}
                  </span>
                  <span className="progress-state">
                    {STATE_LABELS[currentExecution.state]}
                  </span>
                  <span className="progress-time">
                    {Math.floor(currentExecution.elapsedSecs / 60)}m {currentExecution.elapsedSecs % 60}s
                  </span>
                </div>
              </div>

              <div className="current-step">
                <h3>Current Step</h3>
                <p className="step-name">{currentExecution.currentStep || 'Initializing...'}</p>
              </div>

              {userPrompt && (
                <div className="user-prompt">
                  <h3>Input Required</h3>
                  <p className="prompt-message">{userPrompt.message}</p>
                  <div className="prompt-options">
                    {userPrompt.options.map((option) => (
                      <button
                        key={option}
                        className="prompt-option"
                        onClick={() => handleUserChoice(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="step-results">
                <h3>Step History</h3>
                <div className="results-list">
                  {currentExecution.stepResults.map((result) => (
                    <div
                      key={result.stepId}
                      className={`step-result ${result.state}`}
                    >
                      <span className="result-icon">
                        {result.state === 'completed' && '✓'}
                        {result.state === 'failed' && '✗'}
                        {result.state === 'running' && '⟳'}
                        {result.state === 'skipped' && '–'}
                        {result.state === 'pending' && '○'}
                      </span>
                      <span className="result-name">{result.stepName}</span>
                      <span className="result-time">{result.durationMs}ms</span>
                      {result.error && (
                        <span className="result-error">{result.error}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkflowRunner;
