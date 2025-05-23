import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Importando o CSS global que contém as regras para ocultar o controle deslizante
import App from './App';
import reportWebVitals from './reportWebVitals';

// Carregar serviços globais
import './services/tableProcessingService';

// Inicializar o aplicativo imediatamente
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
