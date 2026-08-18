import { mappingApi } from '../api/mappingApi.js';

export const mappingService = {
  async fetchMappings() {
    return await mappingApi.getAll();
  },

  async updateMapping(employeeId, { teamLeadId, managerId }) {
    return await mappingApi.update(employeeId, {
      teamLeadId: teamLeadId || null,
      managerId: managerId || null
    });
  }
};
