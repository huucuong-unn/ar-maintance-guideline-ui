import axiosClient from './AxiosClient';

const PaymentAPI = {
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
    getPayments(params) {
        const url = `/v1/order-transaction/all`;
        return axiosClient.get(url, { params });
    },

    getPaymentsByCompanyId(id, params) {
        const url = `/v1/order-transaction/company/${id}`;
        return axiosClient.get(url, { params });
    },
    getPaymentsDashboard() {
        const url = `v1/payment/dashboard`;
        return axiosClient.get(url);
    },
    getCurrentPlanByCompanyId(id) {
        const url = `/v1/subscription/company/${id}`;
        return axiosClient.get(url);
    },
};

export default PaymentAPI;
