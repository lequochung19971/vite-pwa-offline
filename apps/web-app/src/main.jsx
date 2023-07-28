import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
// import { Provider } from 'react-redux';
// import { store } from './store.js';

// import 'vite-plugin-pwa';
// import { registerSW } from 'virtual:pwa-register';

// const updateSW = registerSW({
//   onOfflineReady() {
//     console.log('Offline');
//   },
// });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
