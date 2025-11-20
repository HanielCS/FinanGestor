import { useState } from 'react';
import { Plus } from 'lucide-react';

/**
 * Formulário para lançamento rápido de novas transações.
 * Mantém o estado da Data e Categoria após salvar para facilitar lançamentos em sequência.
 */
export default function TransactionForm({ onSave }) {
  // Inicializa a data com o dia atual no formato correto para input (YYYY-MM-DD)
  const [form, setForm] = useState({
    description: '',
    amount: '',
    type: 'INCOME',
    category: 'SALARIO',
    date: new Date().toLocaleDateString('en-CA'),
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!form.description || !form.amount) return;
    
    // Envia para o componente pai (DashboardPage)
    onSave(form);

    // Limpa apenas os campos variáveis, mantendo Data e Categoria 
    // para agilizar o próximo lançamento
    setForm({ 
      ...form, 
      description: '', 
      amount: '', 
      notes: '' 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form-card">
      <h3>Nova Transação</h3>
      
      {/* Linha 1: Descrição e Data */}
      <div className="form-row">
        <input 
          type="text" 
          placeholder="Descrição (Ex: Almoço, Freela)" 
          value={form.description} 
          onChange={e => setForm({...form, description: e.target.value})} 
          className="flex-2"
          required
        />
        <input 
          type="date" 
          value={form.date} 
          onChange={e => setForm({...form, date: e.target.value})} 
          required
        />
      </div>

      {/* Linha 2: Valor e Tipo */}
      <div className="form-row">
        <input 
          type="number" 
          placeholder="Valor (R$)" 
          value={form.amount} 
          onChange={e => setForm({...form, amount: e.target.value})} 
          step="0.01" // Permite centavos
          min="0.01"
          required
        />
        <select 
          value={form.type} 
          onChange={e => setForm({...form, type: e.target.value})}
        >
          <option value="INCOME">Receita (+)</option>
          <option value="EXPENSE">Despesa (-)</option>
        </select>
      </div>

      {/* Linha 3: Categoria e Botão Salvar */}
      <div className="form-row">
        <select 
          value={form.category} 
          onChange={e => setForm({...form, category: e.target.value})} 
          className="flex-2"
        >
          <optgroup label="Entradas">
            <option value="SALARIO">Salários</option>
            <option value="ALUGUEL_REC">Aluguéis (Recebidos)</option>
            <option value="INVESTIMENTO">Rendimentos/Investimentos</option>
            <option value="VENDA">Vendas</option>
          </optgroup>
          <optgroup label="Saídas">
            <option value="FIXA">Despesas Fixas</option>
            <option value="VARIAVEL">Despesas Variáveis</option>
            <option value="EXTRA">Despesas Extras</option>
            <option value="PESSOAL">Contas Pessoais</option>
            <option value="IMPOSTO">Multas e Impostos</option>
          </optgroup>
        </select>
        
        <button type="submit" title="Adicionar Transação" style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
          <Plus size={18} /> Salvar
        </button>
      </div>

      {/* Linha 4: Notas (Opcional) */}
      <input 
        type="text" 
        placeholder="Notas ou Comentários (Opcional)" 
        value={form.notes} 
        onChange={e => setForm({...form, notes: e.target.value})} 
      />
    </form>
  );
}