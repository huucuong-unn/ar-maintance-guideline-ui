import axiosClient from './AxiosClient';

const ServicePriceAPI = {
    createServicePrice: async (servicePrice) => {
        try {
            const response = await axiosClient.post('/v1/service-prices', servicePrice);
            return response;
        } catch (error) {
            throw error;
        }
    },

    updateServicePrice: async (id, servicePriceDetails) => {
        try {
            const response = await axiosClient.put(`/v1/service-prices/${id}`, servicePriceDetails);
            return response;
        } catch (error) {
            throw error;
        }
    },

    getServicePriceById: async (id) => {
        try {
            const response = await axiosClient.get(`/v1/service-prices/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    getAllServicePrices: async () => {
        try {
            const response = await axiosClient.get('/v1/service-prices');
            return response;
        } catch (error) {
            throw error;
        }
    },

    deleteServicePriceById: async (id) => {
        try {
            const response = await axiosClient.delete(`/v1/service-prices/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },
};

export default ServicePriceAPI;
