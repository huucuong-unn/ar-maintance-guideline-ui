import { getActiveElement } from '@testing-library/user-event/dist/utils';
import axiosClient from './AxiosClient';

const MachineTypeAPI = {
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
    getByCompany(companyId, params) {
        return axiosClient.get(`/v1/machine-type/company/${companyId}`, { params });
    },
    getById(id) {
        return axiosClient.get(`/v1/machine-type/${id}`);
    },
    getByGuidelineCode(code) {
        return axiosClient.get(`/v1/machine-type/guideline/code/${code}`);
    },
    create(data) {
        return axiosClient.post('/v1/machine-type', data);
    },
    update(id, data) {
        return axiosClient.put(`/v1/machine-type/${id}`, data);
    },
    delete(id) {
        return axiosClient.delete(`/v1/machine-type/${id}`);
    },
};

export default MachineTypeAPI;
