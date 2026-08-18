import { locationApi } from '../api/locationApi.js';

export const locationService = {
  async fetchLocations() {
    return await locationApi.getAll();
  },

  async saveLocation(formData, editId = null) {
    const payload = {
      name: formData.name.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      country: formData.country.trim(),
      timezone: formData.timezone,
      code: formData.code.trim().toUpperCase(),
      active: formData.active !== undefined ? Boolean(formData.active) : true
    };

    if (editId) {
      return await locationApi.update(editId, payload);
    }
    return await locationApi.create(payload);
  }
};
