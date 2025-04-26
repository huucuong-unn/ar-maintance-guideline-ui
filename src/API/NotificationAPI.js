import axiosClient from './AxiosClient';

const NotificationAPI = {
    /**
     * Create a new notification
     * @param {Object} notificationRequest - The notification request payload
     * @returns {Promise<Object>} - The created notification response
     */
    createNotification: async (notificationRequest) => {
        try {
            const response = await axiosClient.post('/v1/web/notifications', notificationRequest);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get all notifications by user ID
     * @param {string} userId - The UUID of the user
     * @returns {Promise<Array>} - List of notifications for the user
     */
    getAllNotificationsByUserId: async (userId) => {
        try {
            const response = await axiosClient.get(`/v1/web/notifications/user/${userId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Change the status of a notification
     * @param {string} id - The UUID of the notification
     * @param {string} status - The new status of the notification
     * @returns {Promise<Object>} - The updated notification response
     */
    changeNotificationStatus: async (id, status) => {
        try {
            const response = await axiosClient.put(`/v1/web/notifications/${id}/status`, null, {
                params: { status },
            });
            return response;
        } catch (error) {
            throw error;
        }
    },
};

export default NotificationAPI;
