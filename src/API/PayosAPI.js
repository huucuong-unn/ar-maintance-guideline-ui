import axiosClient from './AxiosClient';
const PayosAPI = {
    addAuthorizationHeader(config, includeAuthorization) {
        if (includeAuthorization) {
            const token = JSON.parse(localStorage.getItem('accessToken'));
            config.headers = {
                Authorization: `Bearer ${token}`,
                ...config.headers,
            };
        }
        return config;
    },

    goCheckout(data, includeAuthorization = false) {
        return axiosClient.post('/v1/order-transaction', data);
    },

    getSubscriptions() {
        return axiosClient.get('/v1/subscription');
    },
};

export default PayosAPI;
