import { getActiveElement } from '@testing-library/user-event/dist/utils';
import axiosClient from './AxiosClient';

const MachineTypeAttributeAPI = {
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
    getByMachineType(machineTypeId) {
        return axiosClient.get(`/v1/machine-type-attribute/machine-type/${machineTypeId}`);
    },
    delete(id) {
        return axiosClient.delete(`/v1/machine-type-attribute/${id}`);
    },
};

export default MachineTypeAttributeAPI;
