import axiosClient from './AxiosClient';

const PointOptionsAPI = {
    createPointOptions: async (pointOptions) => {
        try {
            const response = await axiosClient.post('/v1/point-options', pointOptions);
            return response;
        } catch (error) {
            throw error;
        }
    },

    updatePointOptions: async (id, pointOptionsDetails) => {
        try {
            const response = await axiosClient.put(`/v1/point-options/${id}`, pointOptionsDetails);
            return response;
        } catch (error) {
            throw error;
        }
    },

    getAllPointOptions: async () => {
        try {
            const response = await axiosClient.get('/v1/point-options');
            return response;
        } catch (error) {
            throw error;
        }
    },

    deletePointOptions: async (id) => {
        try {
            const response = await axiosClient.delete(`/v1/point-options/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },
};

export default PointOptionsAPI;
