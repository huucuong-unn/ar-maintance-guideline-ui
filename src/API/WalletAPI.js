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

    getWalletHistoryByUserId: async (userId) => {
        try {
            const response = await axiosClient.get(`/v1/wallets/history/user/${userId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },
};

export default WalletAPI;
