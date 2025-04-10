import axiosClient from './AxiosClient';
const PointRequestAPI = {
    getAllPointRequestsByCompanyId(companyId, params) {
        return axiosClient.get(`/v1/point-request/company/${companyId}`, { params });
    },

    getAllPointRequests() {
        return axiosClient.get(`/v1/point-request`);
    },

    createRequest(data) {
        return axiosClient.post('/v1/point-request', data);
    },

    updateRequestStatus(requestId, payload) {
        return axiosClient.put(`/v1/point-request/${requestId}`, payload);
    },
};

export default PointRequestAPI;
