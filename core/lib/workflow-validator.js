// Workflow Validator - Schema validation and sanitization for workflows
// Ensures workflow JSON files are well-formed and safe to execute

/**
 * Workflow Validator
 * Validates workflow structure and sanitizes inputs
 */
class WorkflowValidator {
  /**
   * Validate workflow structure and return a { valid, errors } result.
   * This is a compatibility wrapper for existing tests.
   * @param {Object} workflow - The workflow to validate
   * @returns {Object} - { valid: boolean, errors: Array }
   */
  static validate(workflow) {
    const result = this.validateAndSanitize(workflow);
    
    if (result && typeof result.success === 'boolean') {
      if (result.success) {
        // On success, normalize to an empty errors array
        return { valid: true, errors: [] };
      }
      
      // On failure, propagate the errors array if present
      return { valid: false, errors: result.errors || [] };
    }
    
    // Fallback: unexpected internal result format
    return {
      valid: false,
      errors: ['Unexpected validation result format']
    };
  }

  /**
   * Validate and sanitize a workflow
   * @param {Object} workflow - The workflow to validate
   * @returns {Object} - { success: boolean, workflow?: Object, errors?: Array }
   */
  static validateAndSanitize(workflow) {
    const errors = [];

    // Basic structure validation
    if (!workflow || typeof workflow !== 'object') {
      return { success: false, errors: ['Workflow must be an object'] };
    }

    // Required fields
    if (!workflow.id) errors.push('Missing required field: id');
    if (!workflow.name) errors.push('Missing required field: name');
    if (!workflow.version) errors.push('Missing required field: version');
    if (!workflow.platform) errors.push('Missing required field: platform');
    if (!Array.isArray(workflow.steps)) errors.push('Missing or invalid field: steps (must be array)');

    // Validate steps
    if (Array.isArray(workflow.steps)) {
      workflow.steps.forEach((step, index) => {
        if (!step.action) {
          errors.push(`Step ${index}: missing required field 'action'`);
        }
      });
    }

    // If there are errors, return them
    if (errors.length > 0) {
      return { success: false, errors };
    }

    // Return sanitized workflow
    return {
      success: true,
      workflow: {
        ...workflow,
        // Ensure safe defaults
        requires_authorization: workflow.requires_authorization || false,
        risk_level: workflow.risk_level || 'low',
        timeout: workflow.timeout || 300000 // 5 minutes default
      }
    };
  }
}

export default WorkflowValidator;
