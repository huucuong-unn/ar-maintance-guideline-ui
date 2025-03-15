import axiosClient from './AxiosClient';
const AssignGuidelineAPI = {
    getAssignGuidelinesByGuidelineId(guidelineId) {
        return axiosClient.get(`/v1/assign-guideline/${guidelineId}`);
    },

    createAssignGuideline(data) {
        return axiosClient.post('/v1/assign-guideline', data);
    },
};

export default AssignGuidelineAPI;
