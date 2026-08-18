import { workflowApi } from '../api/workflowApi.js';

export const workflowService = {
  async fetchWorkflows() {
    return await workflowApi.getAll();
  },

  async saveWorkflow(formData) {
    return await workflowApi.save(formData);
  }
};
