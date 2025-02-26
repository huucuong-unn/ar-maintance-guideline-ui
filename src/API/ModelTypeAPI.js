import { host } from '~/Constant';
import axiosClient from './AxiosClient';

const ModelTypeAPI = {
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
    getAllToSelect() {
        return axiosClient.get(`/v1/model-types`);
    },
};

export default ModelTypeAPI;
