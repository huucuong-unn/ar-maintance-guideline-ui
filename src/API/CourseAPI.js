import axiosClient from './AxiosClient';

const CourseAPI = {
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
    getAll(data, includeAuthorization = false) {
        return axiosClient.get('/v1/course', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

export default CourseAPI;
