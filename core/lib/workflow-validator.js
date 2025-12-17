// Workflow Validator - Schema validation for workflow JSON files
// Ensures workflows have required fields and valid configurations

const VALID_PLATFORMS = ['android', 'ios', 'universal', 'windows', 'iot'];
const VALID_CATEGORIES = ['diagnostics', 'flash', 'bypass', 'recovery', 'backup', 'debug', 'maintenance'];
const VALID_RISK_LEVELS = ['low', 'medium', 'high', 'destructive'];
const VALID_STEP_TYPES = ['command', 'check', 'wait', 'prompt', 'log'];
const VALID_ON_FAILURE = ['abort', 'continue', 'retry'];

/**
 * Workflow schema validation
 */
class WorkflowValidator {
  /**
   * Validate a workflow object against the schema
   * @param {object} workflow - The workflow to validate
   * @returns {{ valid: boolean, errors: Array<{ field: string, message: string }> }}
   */
  static validate(workflow) {
    const errors = [];

    // Required top-level fields
    if (!workflow.id || typeof workflow.id !== 'string') {
      errors.push({ field: 'id', message: 'Workflow must have a valid string id' });
    }

    if (!workflow.name || typeof workflow.name !== 'string') {
      errors.push({ field: 'name', message: 'Workflow must have a valid string name' });
    }

    if (!workflow.description || typeof workflow.description !== 'string') {
      errors.push({ field: 'description', message: 'Workflow must have a valid string description' });
    }

    if (!workflow.platform || !VALID_PLATFORMS.includes(workflow.platform)) {
      errors.push({ 
        field: 'platform', 
        message: `Workflow must have a valid platform: ${VALID_PLATFORMS.join(', ')}` 
      });
    }

    if (!workflow.category || !VALID_CATEGORIES.includes(workflow.category)) {
      errors.push({ 
        field: 'category', 
        message: `Workflow must have a valid category: ${VALID_CATEGORIES.join(', ')}` 
      });
    }

    if (!workflow.risk_level || !VALID_RISK_LEVELS.includes(workflow.risk_level)) {
      errors.push({ 
        field: 'risk_level', 
        message: `Workflow must have a valid risk_level: ${VALID_RISK_LEVELS.join(', ')}` 
      });
    }

    // Steps validation
    if (!Array.isArray(workflow.steps)) {
      errors.push({ field: 'steps', message: 'Workflow must have a steps array' });
    } else {
      // Check for duplicate step IDs
      const stepIds = new Set();
      
      workflow.steps.forEach((step, index) => {
        const prefix = `steps[${index}]`;

        if (!step.id || typeof step.id !== 'string') {
          errors.push({ field: `${prefix}.id`, message: 'Step must have a valid string id' });
        } else if (stepIds.has(step.id)) {
          errors.push({ field: `${prefix}.id`, message: `Duplicate step id: ${step.id}` });
        } else {
          stepIds.add(step.id);
        }

        if (!step.name || typeof step.name !== 'string') {
          errors.push({ field: `${prefix}.name`, message: 'Step must have a valid string name' });
        }

        if (!step.type || !VALID_STEP_TYPES.includes(step.type)) {
          errors.push({ 
            field: `${prefix}.type`, 
            message: `Step must have a valid type: ${VALID_STEP_TYPES.join(', ')}` 
          });
        }

        if (!step.action || typeof step.action !== 'string') {
          errors.push({ field: `${prefix}.action`, message: 'Step must have a valid string action' });
        }

        if (!step.description || typeof step.description !== 'string') {
          errors.push({ field: `${prefix}.description`, message: 'Step must have a valid string description' });
        }

        if (!step.success_criteria || typeof step.success_criteria !== 'string') {
          errors.push({ field: `${prefix}.success_criteria`, message: 'Step must have a valid string success_criteria' });
        }

        if (!step.on_failure || !VALID_ON_FAILURE.includes(step.on_failure)) {
          errors.push({ 
            field: `${prefix}.on_failure`, 
            message: `Step must have a valid on_failure: ${VALID_ON_FAILURE.join(', ')}` 
          });
        }
      });
    }

    // Authorization validation
    if (workflow.requires_authorization && !workflow.authorization_prompt) {
      errors.push({ 
        field: 'authorization_prompt', 
        message: 'Workflow that requires authorization must have an authorization_prompt' 
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate and sanitize a workflow, adding default values
   * @param {object} workflow - The workflow to validate and sanitize
   * @returns {{ success: boolean, workflow?: object, errors?: Array }}
   */
  static validateAndSanitize(workflow) {
    const validation = this.validate(workflow);

    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    // Add default values
    const sanitized = {
      ...workflow,
      requires_authorization: workflow.requires_authorization ?? false,
      steps: workflow.steps.map(step => ({
        ...step,
        timeout: step.timeout ?? 30,
        retry_count: step.retry_count ?? 0,
        retry_delay: step.retry_delay ?? 1000
      }))
    };

    return { success: true, workflow: sanitized };
  }
}

export default WorkflowValidator;
