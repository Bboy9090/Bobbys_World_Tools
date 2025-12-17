// Workflow Validator - Validates and sanitizes workflow definitions
// Ensures workflow JSON structures are safe and correct

class WorkflowValidator {
  /**
   * Validate and sanitize workflow structure
   */
  static validateAndSanitize(workflow) {
    const errors = [];

    // Check required fields
    if (!workflow.id) {
      errors.push('Workflow must have an id');
    }
    if (!workflow.name) {
      errors.push('Workflow must have a name');
    }
    if (!workflow.platform) {
      errors.push('Workflow must have a platform');
    }
    if (!workflow.steps || !Array.isArray(workflow.steps)) {
      errors.push('Workflow must have a steps array');
    }

    // Validate steps
    if (workflow.steps && Array.isArray(workflow.steps)) {
      workflow.steps.forEach((step, index) => {
        if (!step.id) {
          errors.push(`Step ${index} must have an id`);
        }
        if (!step.name) {
          errors.push(`Step ${index} must have a name`);
        }
        if (!step.type) {
          errors.push(`Step ${index} must have a type`);
        }
        if (!step.on_failure) {
          errors.push(`Step ${index} must have an on_failure strategy`);
        }
      });
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, workflow };
  }

  /**
   * Validate workflow authorization requirements
   */
  static validateAuthorization(workflow, authorization) {
    if (workflow.requires_authorization && !authorization) {
      return {
        success: false,
        error: 'Authorization required',
        authorizationPrompt: workflow.authorization_prompt
      };
    }

    return { success: true };
  }
}

export default WorkflowValidator;
