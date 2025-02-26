import { getActiveElement } from '@testing-library/user-event/dist/utils';
import axiosClient from './AxiosClient';

const InstructionDetailAPI = {
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
    getById(id) {
        return axiosClient.get(`/v1/instruction-detail/${id}`);
    },
    getByInstructionId(id) {
        return axiosClient.get(`/v1/instruction-detail/instruction/${id}`);
    },
    create(data) {
        return axiosClient.post('/v1/instruction-detail', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    update(id, data) {
        return axiosClient.put(`/v1/instruction-detail/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    swapOrder(instructionDetailIdCurrent, instructionDetailIdSwap) {
        return axiosClient.put(
            `/v1/instruction-detail/swap-order?instructionDetailIdCurrent=${instructionDetailIdCurrent}&instructionDetailIdSwap=${instructionDetailIdSwap}`,
        );
    },
    deleteByIddeleteById(id) {
        return axiosClient.delete(`/v1/instruction-detail/${id}`);
    },
};

export default InstructionDetailAPI;
