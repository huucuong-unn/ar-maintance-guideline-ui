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

    createModel(data) {
        return axiosClient.post('/v1/model', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    getByCompany(companyId, params) {
        return axiosClient.get(`/v1/model/company/${companyId}`, { params });
    },
    getUnusedModelByCompany(companyId) {
        return axiosClient.get(`/v1/model/unused/company/${companyId}`);
    },

    getById(id) {
        return axiosClient.get(`/v1/model/${id}`);
    },
    updateModel(id, data) {
        return axiosClient.put(`/v1/model/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    deleteById(id) {
        return axiosClient.delete(`/v1/model/${id}`);
    },

    changeStatus(id) {
        return axiosClient.delete(`/v1/model/${id}`);
    },

    getByMachineTypeIdAndCompanyId(machineTypeId, companyId) {
        return axiosClient.get(`/v1/model/machine-type/${machineTypeId}/company/${companyId}`);
    },
};

export default ModelAPI;
