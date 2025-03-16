import axiosClient from './AxiosClient';
const CompanyRequestAPI = {
    getAllCompanyRequestsByCompanyId(companyId) {
        return axiosClient.get(`/v1/company-request/${companyId}`);
    },

    createRequest(data) {
        return axiosClient.post('/v1/company-request', data);
    },

    getMachineByCompanyId(params) {
        return axiosClient.get(`/v1/machine/company/${params.companyId}?
            page=${params.page}&size=${params.size}`);
    },
};

export default CompanyRequestAPI;
