import axiosClient from './AxiosClient';

const WalletAPI = {
    getWalletByUserId: async (userId) => {
        try {
            const response = await axiosClient.get(`/v1/wallets/user/${userId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    getWalletHistoryByUserId: async (userId, params) => {
        try {
            const response = await axiosClient.get(`/v1/wallets/history/user/${userId}`, { params });
            return response;
        } catch (error) {
            throw error;
        }
    },

    allocationPoint: async (companyId, limitPoint) => {
        try {
            const response = await axiosClient.post(`/v1/wallets/user/allocation/${companyId}/${limitPoint}`);
            return response;
        } catch (error) {
            throw error;
        }
    },
};

export default WalletAPI;
