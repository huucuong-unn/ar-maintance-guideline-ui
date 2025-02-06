import axiosClient from './AxiosClient';
const EnrollmentAPI = {
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
    createEnrollment(data, includeAuthorization = false) {
        return axiosClient.post('/v1/enrollment', data);
    },
};
export default EnrollmentAPI;
