import axiosClient from './AxiosClient';
const CompanyRequestAPI = {
    getAllCompanyRequestsByCompanyId(companyId, status, params) {
        return axiosClient.get(`/v1/company-request/${companyId}?status=${status}`, { params });
    },

    getAllCompanyRequests(params) {
        return axiosClient.get(`/v1/company-request`, { params });
    },

    getAllCompanyRequestsForAdmin(params) {
        return axiosClient.get(`/v1/company-request/admin`, { params });
    },

    getCompanyRequestById(id) {
        return axiosClient.get(`/v1/company-request/one/${id}`);
    },

    createRequest(data) {
        return axiosClient.post('/v1/company-request', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
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
    //==

    deleteRequestRevision: async (id) => {
        try {
            const response = await axiosClient.delete(`/v1/request-revisions/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get all revisions for a specific company request.
     * @param {string} companyRequestId - The ID of the company request.
     * @returns {Promise<Array>} - The response containing the list of revisions.
     */
    getRequestRevisionAllByCompanyRequestId: async (companyRequestId) => {
        try {
            const response = await axiosClient.get(`/v1/request-revisions/company-request/${companyRequestId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    createRequestRevision: async (request) => {
        try {
            const response = await axiosClient.post('/v1/request-revisions', request, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update an existing request revision.
     * @param {string} id - The ID of the revision to update.
     * @param {Object} request - The request payload containing updated revision details.
     * @returns {Promise<Object>} - The response containing the updated revision.
     */
    updateRequestRevision: async (id, request) => {
        try {
            const response = await axiosClient.put(`/v1/request-revisions/${id}`, request, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response;
        } catch (error) {
            throw error;
        }
    },
};

export default CompanyRequestAPI;
