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
};

export default InstructionAPI;
