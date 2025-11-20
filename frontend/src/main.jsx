import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// 1. Base e Configurações
import './styles/settings.css'  // Variáveis de cores e fontes
import './styles/global.css'    // Resets do navegador e tipografia

// 2. Estrutura
import './styles/layout.css'    // Container e Grid principal
import './styles/auth.css'      // Layout específico de Login/Registro

// 3. Componentes Globais
import './styles/navbar.css'    // Barra de navegação
import './styles/modal.css'     // Janelas modais
import './styles/cards.css'     // Cartões e KPIs
import './styles/forms.css'     // Inputs e Botões

// 4. Componentes Específicos
import './styles/charts.css'    // Gráficos
import './styles/goals.css'     // Lista de Metas
import './styles/tables.css'    // Tabelas de Histórico

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)