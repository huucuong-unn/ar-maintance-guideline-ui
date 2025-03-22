import axiosClient from './AxiosClient';

const CompanyAPI = {
    getAll() {
        return axiosClient.get('/v1/company/all');
    },
    getByUserId(userId) {
        return axiosClient.get(`/v1/company/userId?userId=${userId}`);
    },
};

export default CompanyAPI;
