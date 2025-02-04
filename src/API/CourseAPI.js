import axiosClient from './AxiosClient';

const CourseAPI = {
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
    getAll(data, includeAuthorization = false) {
        return axiosClient.get('/v1/course', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    getById(id, includeAuthorization = false) {
        return axiosClient.get('/v1/course/' + id);
    },
    update(data, includeAuthorization = false) {
        return axiosClient.put('/v1/course/' + data.courseId, data);
    },
    getSections(courseId, includeAuthorization = false) {
        return axiosClient.get('/v1/lesson/course/' + courseId);
    },
    create(data, includeAuthorization = false) {
        return axiosClient.post('/v1/course', data);
    },
    createLesson(data, includeAuthorization = false) {
        return axiosClient.post('/v1/lesson-detail', data);
    },
    createSection(data, includeAuthorization = false) {
        return axiosClient.post('/v1/lesson', data);
    },
    deleteSection(id, includeAuthorization = false) {
        return axiosClient.delete('/v1/lesson/' + id);
    },
    getByCompanyId(companyId, includeAuthorization = false) {
        return axiosClient.get('/v1/course/company/' + companyId);
    },
};

export default CourseAPI;
