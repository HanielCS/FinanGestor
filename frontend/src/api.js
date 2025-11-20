// frontend/src/api.js
import axios from 'axios';

/**
 * Cliente HTTP (Axios) para comunicação com o Backend.
 * * Configuração de BaseURL:
 * - Desenvolvimento: Usa 'http://localhost:3000'
 * - Produção (Vercel): Usa a variável VITE_API_URL (Link do Render)
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  
  // Tempo limite de 10 segundos para requisições
  timeout: 10000, 
});

export default api;