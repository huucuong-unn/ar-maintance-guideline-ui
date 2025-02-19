import { host } from '~/Constant';
import axiosClient from './AxiosClient';

const ModelAPI = {
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

    createModel(data, includeAuthorization = false) {
        return axiosClient.post('/v1/model', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

export default ModelAPI;
