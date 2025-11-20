import { History } from 'lucide-react';

// Exibe a tabela de transações recentes do usuário logado.
export default function TransactionHistory({ transactions = [] }) {

  // Helper para formatar moeda (R$)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value));
  };

  // Helper para formatar data (UTC Fix)
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  return (
    <div className="card history-card">
      <div className="card-header" style={{ marginBottom: '15px' }}>
        <h3><History size={18} className="text-muted"/> Histórico Recente</h3>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            
            {/* Estado Vazio */}
            {transactions.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>
                  Nenhuma transação recente.
                </td>
              </tr>
            )}

            {/* Lista de Transações */}
            {transactions.map(t => (
              <tr key={t.id}>
                <td className="text-muted">
                  {formatDate(t.date)}
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>{t.description}</div>
                  {t.notes && <small className="text-muted">{t.notes}</small>}
                </td>
                <td>
                  <span className="badge">{t.category}</span>
                </td>
                <td 
                  className={t.type === 'INCOME' ? 'text-green' : 'text-red'}
                  style={{ fontWeight: 500 }}
                >
                  {t.type === 'INCOME' ? '+' : '-'} {formatCurrency(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}