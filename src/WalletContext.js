import React, { createContext, useContext, useState, useEffect } from 'react';
import WalletAPI from '../src/API/WalletAPI'; // Adjust the import path as needed
import storageService from './components/StorageService/storageService';
import { host } from './Constant';
import { Client } from '@stomp/stompjs';
import { useRef } from 'react';
import SockJS from 'sockjs-client';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const [currentPoints, setCurrentPoints] = useState(0);
    const user = storageService.getItem('userInfo')?.user;
    const stompClientRef = useRef(null);
    const fetchWallet = async () => {
        try {
            const user = storageService.getItem('userInfo')?.user;

            console.log(user);

            const response = await WalletAPI.getWalletByUserId(user.id);
            setCurrentPoints(response.result.balance);
            console.log(currentPoints);
        } catch (error) {
            setCurrentPoints(0);
            console.error('Failed to fetch wallet:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchWallet();
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchWallet();
        }
    }, []);

    useEffect(() => {
        // Establish WebSocket connection
        const socket = new Client({
            //  webSocketFactory: () => new SockJS('https://armaintance.ngrok.pro/ws'),
            webSocketFactory: () => new SockJS(`${host}/ws`),
            onConnect: () => {
                console.log('WebSocket Connected');

                // Subscribe to the specific chat box topic
                const subscription = socket.subscribe(`/topic/wallet/100`, (message) => {
                    fetchWallet();
                });

                stompClientRef.current = socket;

                // Cleanup subscription on unmount
                return () => {
                    subscription.unsubscribe();
                };
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        // Activate the connection
        socket.activate();

        // Cleanup on component unmount
        return () => {
            if (socket) {
                socket.deactivate();
            }
        };
    }, [user]); // Add user

    return <WalletContext.Provider value={{ currentPoints, fetchWallet }}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
    return useContext(WalletContext);
};
