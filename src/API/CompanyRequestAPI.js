import axiosClient from './AxiosClient';
const CompanyRequestAPI = {
    getAllCompanyRequestsByCompanyId(companyId) {
        return axiosClient.get(`/v1/company-request/${companyId}`);
    },

    getAllCompanyRequests() {
        return axiosClient.get(`/v1/company-request`);
    },

    createRequest(data) {
        return axiosClient.post('/v1/company-request', data);
    },

    getMachineByCompanyId(params) {
        return axiosClient.get(`/v1/machine/company/${params.companyId}?
            page=${params.page}&size=${params.size}`);
    },

    updateRequestStatus(requestId, payload) {
        return axiosClient.put(`/v1/company-request/${requestId}`, payload);
    },
};

export default CompanyRequestAPI;
