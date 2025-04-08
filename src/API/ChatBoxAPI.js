import axiosClient from './AxiosClient';

const ChatBoxAPI = {
    /**
     * Add a message to a chat box.
     * @param {Object} chatMessageRequest - The request payload containing chat message details.
     * @returns {Promise<Object>} - The response containing the added chat message.
     */
    addMessageToChatBox: async (chatMessageRequest) => {
        try {
            const response = await axiosClient.post('/v1/chat-boxes', chatMessageRequest);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get all messages from a specific chat box.
     * @param {string} chatBoxId - The ID of the chat box.
     * @returns {Promise<Array>} - The response containing the list of chat messages.
     */
    getChatBoxMessages: async (chatBoxId) => {
        try {
            const response = await axiosClient.get(`/v1/chat-boxes/${chatBoxId}/messages`);
            return response;
        } catch (error) {
            throw error;
        }
    },
};

export default ChatBoxAPI;
