import axiosClient from './AxiosClient';

const DashboardAPI = {
    getDashboardAdmin() {
        return axiosClient.get('/v1/dashboard/admin');
    },
    getDashboardCompany(companyId) {
        return axiosClient.get('/v1/dashboard/company/' + companyId);
    },
};

export default DashboardAPI;
