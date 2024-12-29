import React, { createContext, useContext } from 'react';
import { StorageInterface } from './StorageInterface';
import { ChromeLocalStorage } from './ChromeLocalStorage';

const StorageContext = createContext<StorageInterface>(new ChromeLocalStorage());

export const StorageProvider: React.FC<{
  storage: StorageInterface;
  children: React.ReactNode;
}> = ({ storage, children }) => {
  return (
    <StorageContext.Provider value={storage}>
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => useContext(StorageContext); 