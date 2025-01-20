import axiosClient from './AxiosClient';

const CompanyAPI = {
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
    getAll(includeAuthorization = false) {
        return axiosClient.get('/v1/companies');
    },
};

export default CompanyAPI;
