import axiosClient from './AxiosClient';
const CompanyRequestAPI = {
    getAllCompanyRequestsByCompanyId(companyId, status, params) {
        return axiosClient.get(`/v1/company-request/${companyId}?status=${status}`, { params });
    },

    getAllCompanyRequests(params) {
        return axiosClient.get(`/v1/company-request`, { params });
    },

    createRequest(data) {
        return axiosClient.post('/v1/company-request', data);
    },

    getMachineByCompanyId(params) {
        return axiosClient.get(`/v1/machine/company/${params.companyId}?
            page=${params.page}&size=${params.size}`);
    },

    getModelTypeByCompanyId(params) {
        return axiosClient.get(`/v1/machine-type/company/${params.companyId}?
            page=${params.page}&size=${params.size}`);
    },

    updateRequestStatus(requestId, payload) {
        return axiosClient.put(`/v1/company-request/${requestId}`, payload);
    },
};

export default CompanyRequestAPI;
