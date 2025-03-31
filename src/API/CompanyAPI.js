import axiosClient from './AxiosClient';

const CompanyAPI = {
    getAll(params) {
        return axiosClient.get('/v1/company/all', { params });
    },
    getByUserId(userId) {
        return axiosClient.get(`/v1/company/userId?userId=${userId}`);
    },
};

export default CompanyAPI;
