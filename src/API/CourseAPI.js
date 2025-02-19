import { host } from '~/Constant';
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
        return axiosClient.post('/v1/course', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    createLesson(data, includeAuthorization = false) {
        return axiosClient.post('/v1/lesson-detail', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
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
    readVideo(videoUrl) {
        return axiosClient
            .get(`/v1/files/${videoUrl}`, {
                responseType: 'blob', // Important for video files
            })
            .then((response) => {
                if (!(response instanceof Blob)) {
                    throw new Error(`API did not return a valid video Blob.`);
                }
                return response;
            })
            .catch((error) => {
                console.error('Axios error fetching video:', error);
                throw error;
            });
    },
    getImageUrl(image) {
        return `${host}/api/v1/files/${image}`;
    },
};

export default CourseAPI;
