import { getActiveElement } from '@testing-library/user-event/dist/utils';
import axiosClient from './AxiosClient';

const quiz = '/v1/quiz';
const question = '/v1/question';

const QuizAPI = {
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
    create(data, includeAuthorization = false) {
        return axiosClient.post(quiz, data);
    },

    getByCourseId(courseId, includeAuthorization = false) {
        return axiosClient.get(quiz + '/course/' + courseId);
    },
    createQuestionByQuizId(data, includeAuthorization = false) {
        return axiosClient.post(question, data);
    },
    getQuestionByQuizId(id, includeAuthorization = false) {
        return axiosClient.get(question + '/quiz/' + id);
    },
    updateQuiz(data, includeAuthorization = false) {
        const request = {
            courseId: data.courseId,
            title: data.title,
            description: data.description,
        };
        return axiosClient.put(quiz + '/' + data.quizId, request);
    },
    updateQuestion(data, includeAuthorization = false) {
        const request = {
            question: data.question,
            optionCreationRequests: data.optionCreationRequests,
        };
        return axiosClient.put(question + '/' + data.questionId, request);
    },
    deleteQuestion(questionId, includeAuthorization = false) {
        return axiosClient.delete(question + '/' + questionId);
    },
};

export default QuizAPI;
