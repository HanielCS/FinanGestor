import { useState } from 'react';
import { Target, Trash2, Edit2, PlusCircle } from 'lucide-react';

/**
 * Componente para listar e gerenciar Metas Financeiras.
 * Permite criar novas metas, adicionar saldo, editar e excluir.
 */
export default function GoalsSection({ 
  goals = [], 
  onAddGoal, 
  onAddMoney, 
  onDeleteGoal, 
  onEditGoal 
}) {
  const [goalForm, setGoalForm] = useState({ title: '', targetAmount: '' });

  // Helper para formatar moeda
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(val));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!goalForm.title || !goalForm.targetAmount) return;
    
    onAddGoal(goalForm);
    setGoalForm({ title: '', targetAmount: '' });
  };

  return (
    <div className="card goals-card">
      <div className="card-header" style={{ marginBottom: '15px' }}>
        <h3><Target size={18} className="text-blue"/> Metas Financeiras</h3>
      </div>
      
      <div className="goals-list">
        {/* Estado Vazio */}
        {goals.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)', fontSize: '0.9rem' }}>
            Nenhuma meta definida ainda.
          </div>
        )}

        {/* Lista de Metas */}
        {goals.map(goal => {
          const current = Number(goal.currentAmount);
          const target = Number(goal.targetAmount);
          
          // Calcula porcentagem (evita divisão por zero e limita a 100%)
          const rawPercent = target > 0 ? (current / target) * 100 : 0;
          const percent = Math.min(rawPercent, 100);

          return (
            <div key={goal.id} className="goal-item">
              
              {/* Linha Superior: Título e Botões */}
              <div className="goal-info">
                <span style={{fontWeight: '600', color: 'var(--text)'}}>
                  {goal.title}
                </span>
                
                <div className="goal-actions">
                  <button 
                    onClick={() => onAddMoney(goal.id)}
                    className="btn-icon btn-add"
                    title="Investir (Adicionar valor)"
                  >
                    <PlusCircle size={16} />
                  </button>

                  <button 
                    onClick={() => onEditGoal(goal)}
                    className="btn-icon btn-edit"
                    title="Editar Meta"
                  >
                    <Edit2 size={16} />
                  </button>

                  <button 
                    onClick={() => onDeleteGoal(goal.id)}
                    className="btn-icon btn-delete"
                    title="Excluir Meta"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {/* Linha do Meio: Valores e Porcentagem */}
              <div style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '0.8rem', 
                marginBottom: '4px', 
                color: 'var(--muted)'
              }}>
                <span>{percent.toFixed(1)}% completo</span>
                <span>
                  {formatCurrency(current)} / {formatCurrency(target)}
                </span>
              </div>

              {/* Barra de Progresso */}
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${percent}%`,
                    backgroundColor: percent >= 100 ? 'var(--green)' : 'var(--primary)'
                  }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Formulário Rápido */}
      <form onSubmit={handleSubmit} className="mini-form">
        <input 
          type="text" 
          placeholder="Nova Meta (ex: Carro Novo)" 
          value={goalForm.title} 
          onChange={e => setGoalForm({...goalForm, title: e.target.value})}
          required
        />
        <input 
          type="number" 
          placeholder="Valor Alvo" 
          value={goalForm.targetAmount} 
          onChange={e => setGoalForm({...goalForm, targetAmount: e.target.value})}
          required
          min="1"
        />
        <button type="submit" title="Criar Meta" style={{minWidth: '40px'}}>+</button>
      </form>
    </div>
  );
}