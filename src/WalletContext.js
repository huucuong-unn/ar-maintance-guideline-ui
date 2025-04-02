import React, { createContext, useContext, useState, useEffect } from 'react';
import WalletAPI from '../src/API/WalletAPI'; // Adjust the import path as needed
import storageService from './components/StorageService/storageService';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const [currentPoints, setCurrentPoints] = useState(0);
    const user = storageService.getItem('userInfo')?.user;

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

    return <WalletContext.Provider value={{ currentPoints, fetchWallet }}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
    return useContext(WalletContext);
};
