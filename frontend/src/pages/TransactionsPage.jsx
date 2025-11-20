import { useState, useEffect } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { Edit2, Trash2 } from 'lucide-react';

/**
 * Página de Gerenciamento de Transações.
 * Permite listar, editar e excluir lançamentos financeiros do usuário.
 */
export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  
  // Estados para controle dos Modais
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Formulário de Edição
  const [editForm, setEditForm] = useState({
    description: '', amount: '', type: '', category: '', date: '', notes: ''
  });

  useEffect(() => { loadTransactions(); }, []);

  async function loadTransactions() {
    try {
      const response = await api.get('/transactions');
      setTransactions(response.data);
    } catch (error) { 
      console.error("Erro ao carregar transações", error);
    }
  }

  // Helpers de Formatação
  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

  // --- ABRIR MODAIS ---
  function openEdit(t) {
    setSelectedTransaction(t);
    setEditForm({
      description: t.description,
      amount: t.amount,
      type: t.type,
      category: t.category,
      date: t.date.split('T')[0],
      notes: t.notes || ''
    });
    setEditModalOpen(true);
  }

  function openDelete(t) {
    setSelectedTransaction(t);
    setDeleteModalOpen(true);
  }

  // --- AÇÕES NO BANCO ---
  async function handleUpdate() {
    try {
      await api.put(`/transactions/${selectedTransaction.id}`, {
        ...editForm,
        amount: parseFloat(editForm.amount),
        date: new Date(editForm.date).toISOString()
      });
      setEditModalOpen(false);
      loadTransactions();
    } catch (error) {
      alert(error.response?.data?.error || "Erro ao atualizar transação");
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/transactions/${selectedTransaction.id}`);
      setDeleteModalOpen(false);
      loadTransactions();
    } catch (error) {
      alert(error.response?.data?.error || "Erro ao excluir transação");
    }
  }

  return (
    <>
      <Navbar />
      
      <div className="container">
        <div style={{marginBottom: '20px'}}>
          <h2>Gerenciar Transações</h2>
          <p style={{color: 'var(--muted)'}}>Edite ou remova seus lançamentos passados.</p>
        </div>

        <div className="card">
          <div className="table-container" style={{maxHeight: '600px'}}>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Valor</th>
                  <th style={{textAlign: 'center'}}>Ações</th>
                </tr>
              </thead>
              <tbody>
                
                {/* Estado Vazio */}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center', padding: '30px', color: 'var(--muted)'}}>
                      Nenhuma transação encontrada.
                    </td>
                  </tr>
                )}

                {/* Lista */}
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td className="text-muted">{formatDate(t.date)}</td>
                    <td>
                      <strong>{t.description}</strong>
                      {t.notes && <div style={{fontSize: '0.85rem', color: 'var(--muted)', marginTop: '2px'}}>{t.notes}</div>}
                    </td>
                    <td><span className="badge">{t.category}</span></td>
                    <td 
                      className={t.type === 'INCOME' ? 'text-green' : 'text-red'}
                      style={{ fontWeight: 500 }}
                    >
                      {t.type === 'INCOME' ? '+' : '-'} {formatCurrency(t.amount)}
                    </td>
                    <td style={{textAlign: 'center'}}>
                      <div style={{display: 'flex', justifyContent: 'center', gap: '8px'}}>
                        <button className="btn-icon btn-edit" onClick={() => openEdit(t)} title="Editar">
                            <Edit2 size={16}/>
                        </button>
                        <button className="btn-icon btn-delete" onClick={() => openDelete(t)} title="Excluir">
                            <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- MODAL DE EDIÇÃO --- */}
      <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Editar Transação">
        <div className="form-card" style={{marginTop: '0'}}>
          
          <div className="form-row">
            <div className="input-group flex-2">
              <label>Descrição</label>
              <input type="text" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Data</label>
              <input type="date" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Valor (R$)</label>
              <input type="number" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} step="0.01" />
            </div>
            <div className="input-group">
              <label>Tipo</label>
              <select value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})}>
                 <option value="INCOME">Receita</option>
                 <option value="EXPENSE">Despesa</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Categoria</label>
            <select value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
              <optgroup label="Entradas">
               <option value="SALARIO">Salário</option>
               <option value="ALUGUEL_REC">Aluguel (Recebido)</option>
               <option value="VENDA">Venda</option>
               <option value="INVESTIMENTO">Investimento</option>
              </optgroup>
              <optgroup label="Saídas">
               <option value="ALUGUEL">Aluguel (Pago)</option>
               <option value="FIXA">Despesa Fixa</option>
               <option value="VARIAVEL">Despesa Variável</option>
               <option value="EXTRA">Extra</option>
               <option value="PESSOAL">Pessoal</option>
               <option value="IMPOSTO">Imposto</option>
              </optgroup>
            </select>
          </div>

          <div className="input-group">
            <label>Notas</label>
            <input type="text" value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} />
          </div>

        </div>
        <div className="modal-actions">
          <button onClick={() => setEditModalOpen(false)} className="btn-cancel">Cancelar</button>
          <button onClick={handleUpdate} className="btn-confirm">Salvar Alterações</button>
        </div>
      </Modal>

      {/* --- MODAL DE EXCLUSÃO --- */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Excluir Transação">
        <p>Tem certeza que deseja excluir <strong>{selectedTransaction?.description}</strong>?</p>
        <p className="text-red" style={{fontSize: '0.9rem'}}>O valor será removido do saldo e dos cálculos.</p>
        <div className="modal-actions">
            <button onClick={() => setDeleteModalOpen(false)} className="btn-cancel">Cancelar</button>
            <button onClick={handleDelete} className="btn-danger">Excluir Definitivamente</button>
        </div>
      </Modal>
    </>
  );
}