import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

// Componentes
import Navbar from '../components/Navbar'; // <--- Importado
import KPIs from '../components/KPIs';
import FinancialChart from '../components/FinancialChart';
import TransactionForm from '../components/TransactionForm';
import GoalsSection from '../components/GoalsSection';
import TransactionHistory from '../components/TransactionHistory';
import GlobalHistory from '../components/GlobalHistory';
import Modal from '../components/Modal';

export default function DashboardPage() {
  const { logout } = useContext(AuthContext);
  
  // Dados da API
  const [transactions, setTransactions] = useState([]);
  const [globalTransactions, setGlobalTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [indicators, setIndicators] = useState({ netMargin: '0%', roi: '0%' });

  // --- ESTADOS PARA CONTROLE DOS MODAIS ---
  const [activeModal, setActiveModal] = useState(null); 
  const [selectedGoal, setSelectedGoal] = useState(null);
  
  // Estados temporários
  const [tempAmount, setTempAmount] = useState('');
  const [tempTitle, setTempTitle] = useState('');
  const [tempTarget, setTempTarget] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [transRes, globalRes, dashRes, goalsRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/transactions/global'),
        api.get('/dashboard'),
        api.get('/goals')
      ]);
      setTransactions(transRes.data);
      setGlobalTransactions(globalRes.data);
      setSummary(dashRes.data.summary);
      setIndicators(dashRes.data.indicators);
      setGoals(goalsRes.data);
    } catch (error) {
      if (error.response?.status === 401) logout();
    }
  }

  // --- AÇÕES DE ABERTURA DOS MODAIS ---
  function openAddMoneyModal(goalId) {
    const goal = goals.find(g => g.id === goalId);
    setSelectedGoal(goal);
    setTempAmount(''); 
    setActiveModal('ADD_MONEY');
  }

  function openEditModal(goal) {
    setSelectedGoal(goal);
    setTempTitle(goal.title);        
    setTempTarget(goal.targetAmount);
    setActiveModal('EDIT');
  }

  function openDeleteModal(goalId) {
    const goal = goals.find(g => g.id === goalId);
    setSelectedGoal(goal);
    setActiveModal('DELETE');
  }

  function closeModal() {
    setActiveModal(null);
    setSelectedGoal(null);
  }

  // --- AÇÕES DE CONFIRMAÇÃO ---
  async function confirmAddMoney() {
    if (!tempAmount || parseFloat(tempAmount) <= 0) return alert("Valor inválido");
    try {
      await api.put(`/goals/${selectedGoal.id}/add`, { amount: parseFloat(tempAmount) });
      loadData();
      closeModal();
    } catch (error) { alert("Erro ao atualizar meta."); }
  }

  async function confirmEdit() {
    if (!tempTitle || !tempTarget) return alert("Preencha os campos");
    try {
      await api.put(`/goals/${selectedGoal.id}`, {
        title: tempTitle,
        targetAmount: parseFloat(tempTarget)
      });
      loadData();
      closeModal();
    } catch (error) { alert("Erro ao editar meta."); }
  }

  async function confirmDelete() {
    try {
      await api.delete(`/goals/${selectedGoal.id}`);
      loadData();
      closeModal();
    } catch (error) { alert("Erro ao excluir meta."); }
  }

  // Funções de criação normais
  async function handleSaveTransaction(formData) {
    try {
      await api.post('/transactions', { ...formData, amount: parseFloat(formData.amount) });
      loadData();
    } catch (error) { alert('Erro ao salvar transação'); }
  }

  async function handleAddGoal(goalData) {
    try {
      await api.post('/goals', { ...goalData, targetAmount: parseFloat(goalData.targetAmount) });
      loadData();
    } catch (error) { alert('Erro ao criar meta'); }
  }

  return (
    <>
      <Navbar />

      <div className="container">
        <div style={{marginBottom: '20px'}}>
           <h2>Resumo Geral</h2>
        </div>

        <KPIs summary={summary} indicators={indicators} />

        <div className="main-grid">
          <div className="left-column">
            <FinancialChart summary={summary} />
            <TransactionForm onSave={handleSaveTransaction} />
          </div>

          <div className="right-column">
            <GoalsSection 
              goals={goals} 
              onAddGoal={handleAddGoal} 
              onAddMoney={openAddMoneyModal} 
              onDeleteGoal={openDeleteModal} 
              onEditGoal={openEditModal}
            />
            <TransactionHistory transactions={transactions} />
          </div>
        </div>

        <GlobalHistory transactions={globalTransactions} />

        {/* --- MODAIS --- */}

        <Modal 
          isOpen={activeModal === 'ADD_MONEY'} 
          onClose={closeModal} 
          title={`Investir em: ${selectedGoal?.title}`}
        >
          <p>Quanto você deseja adicionar a esta meta?</p>
          <input 
            type="number" placeholder="Valor (R$)" 
            value={tempAmount} onChange={e => setTempAmount(e.target.value)}
            style={{width: '100%', marginTop: '10px'}} autoFocus
          />
          <div className="modal-actions">
            <button onClick={closeModal} className="btn-cancel">Cancelar</button>
            <button onClick={confirmAddMoney} className="btn-confirm">Confirmar</button>
          </div>
        </Modal>

        <Modal 
          isOpen={activeModal === 'EDIT'} 
          onClose={closeModal} 
          title="Editar Meta"
        >
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            <label>Nome da Meta</label>
            <input type="text" value={tempTitle} onChange={e => setTempTitle(e.target.value)} />
            <label>Valor Alvo (Meta)</label>
            <input type="number" value={tempTarget} onChange={e => setTempTarget(e.target.value)} />
          </div>
          <div className="modal-actions">
            <button onClick={closeModal} className="btn-cancel">Cancelar</button>
            <button onClick={confirmEdit} className="btn-confirm">Salvar</button>
          </div>
        </Modal>

        <Modal 
          isOpen={activeModal === 'DELETE'} 
          onClose={closeModal} 
          title="Excluir Meta"
        >
          <p>Tem certeza que deseja excluir a meta <strong>{selectedGoal?.title}</strong>?</p>
          <div className="modal-actions">
            <button onClick={closeModal} className="btn-cancel">Cancelar</button>
            <button onClick={confirmDelete} className="btn-danger">Excluir</button>
          </div>
        </Modal>

      </div>
    </>
  );
}