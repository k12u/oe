import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { StorageProvider } from './storage/StorageContext';
import { ChromeLocalStorage } from './storage/ChromeLocalStorage';

const storage = new ChromeLocalStorage();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <StorageProvider storage={storage}>
            <App />
        </StorageProvider>
    </React.StrictMode>
);

