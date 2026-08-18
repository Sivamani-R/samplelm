import { leaveCategoryApi } from '../api/leaveCategoryApi.js';

export const leaveCategoryService = {
  async fetchCategories() {
    return await leaveCategoryApi.getAll();
  },

  async saveCategory(formData, editId = null) {
    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      paid: Boolean(formData.paid),
      allowFullDay: Boolean(formData.allowFullDay),
      allowHalfDay: Boolean(formData.allowHalfDay),
      allowHourly: Boolean(formData.allowHourly),
      active: Boolean(formData.active),
      description: formData.description?.trim() || ''
    };

    if (editId) {
      return await leaveCategoryApi.update(editId, payload);
    }
    return await leaveCategoryApi.create(payload);
  }
};
