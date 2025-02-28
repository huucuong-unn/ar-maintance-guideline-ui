import { getActiveElement } from '@testing-library/user-event/dist/utils';
import axiosClient from './AxiosClient';

const instruction = '/v1/instruction';
const instructionDetail = '/v1/instruction-detail';

const InstructionAPI = {
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
    getByCourse(courseId) {
        return axiosClient.get(`/v1/instruction/course/${courseId}`);
    },
    getByCourseToSwap(courseId) {
        return axiosClient.get(`/v1/instruction/no-paging/course/${courseId}`);
    },
    getById(id) {
        return axiosClient.get(`/v1/instruction/${id}`);
    },
    create(data) {
        return axiosClient.post('/v1/instruction', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    createDetail(data, includeAuthorization = false) {
        return axiosClient.post(instructionDetail, data);
    },
    deleteById(id) {
        return axiosClient.delete(`/v1/instruction/${id}`);
    },
    swapOrder(instructionIdCurrent, instructionIdSwap) {
        return axiosClient.put(
            `/v1/instruction/swap-order?instructionIdCurrent=${instructionIdCurrent}&instructionIdSwap=${instructionIdSwap}`,
        );
    },
    update(id, data) {
        return axiosClient.put(`/v1/instruction/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

export default InstructionAPI;
