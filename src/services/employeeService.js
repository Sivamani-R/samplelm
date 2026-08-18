import { employeeApi } from '../api/employeeApi.js';

export const employeeService = {
  async fetchEmployees() {
    return await employeeApi.getAll();
  },

  async fetchTeamLeads() {
    return await employeeApi.getTeamLeads();
  },

  async fetchManagers() {
    return await employeeApi.getManagers();
  },

  async registerEmployee(formData) {
    // Normalizes and sanitizes payload
    const payload = {
      employeeId: formData.employeeId.trim().toUpperCase(),
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      department: formData.department,
      designation: formData.designation.trim(),
      locationId: formData.locationId,
      joiningDate: formData.joiningDate,
      employmentType: formData.employmentType,
      role: formData.role,
      teamLeadId: formData.teamLeadId || null,
      managerId: formData.managerId || null
    };

    return await employeeApi.create(payload);
  }
};
