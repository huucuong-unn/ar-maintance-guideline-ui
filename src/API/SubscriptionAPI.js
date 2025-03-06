import axiosClient from './AxiosClient';
const SubscriptionAPI = {
    getByUserId(id) {
        return axiosClient.get(`/v1/subscription/user/${id}`);
    },

    createSubscription(data) {
        return axiosClient.post('/v1/subscription', data);
    },

    deleteSubscription(id) {
        return axiosClient.delete(`/v1/subscription/${id}`);
    },

    updateSubscription(data) {
        return axiosClient.put(`/v1/subscription/${data.id}`, data);
    },
};

export default SubscriptionAPI;
