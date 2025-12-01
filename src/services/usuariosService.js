import api from "./api";

export const usuariosService = {
    getAll: async () => {
        const response = await api.get("/usuarios/");
        return response.data;
    },

    create: async (data) => {
        const response = await api.post("/usuarios/", data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.patch(`/usuarios/${id}/`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/usuarios/${id}/`);
        return response.data;
    },

    toggleActive: async (id) => {
        const response = await api.post(`/usuarios/${id}/toggle_active/`);
        return response.data;
    },

    // Obtener preferencia de tema del usuario actual
    getTheme: async () => {
        const response = await api.get("/usuarios/theme/");
        return response.data;
    },

    // Actualizar preferencia de tema del usuario actual
    updateTheme: async (tema) => {
        const response = await api.post("/usuarios/theme/", { tema_preferido: tema });
        return response.data;
    },
};
