import { getActiveElement } from '@testing-library/user-event/dist/utils';
import axiosClient from './AxiosClient';

const MachineAPI = {
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
        return axiosClient.get(`/v1/machine/company/${companyId}`, { params });
    },
    getById(id) {
        return axiosClient.get(`/v1/machine/${id}`);
    },
    getByGuidelineId(id) {
        return axiosClient.get(`/v1/machine/guideline/${id}`);
    },
    getByGuidelineIdV2(id) {
        return axiosClient.get(`/v1/machine/guideline/machine/${id}`);
    },
    getMachineQRByMachineId(id) {
        return axiosClient.get(`/v1/machine-qr/machine/${id}`);
    },
    create(data) {
        return axiosClient.post('/v1/machine', data);
    },
    update(id, data) {
        return axiosClient.put(`/v1/machine/${id}`, data);
    },
    delete(id) {
        return axiosClient.delete(`/v1/machine/${id}`);
    },
};

export default MachineAPI;
