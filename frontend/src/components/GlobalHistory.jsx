import { Users } from 'lucide-react';

/**
 * Exibe uma tabela com as últimas transações de TODOS os usuários do sistema.
 */
export default function GlobalHistory({ transactions = [] }) {

  // Helper para formatar dinheiro (R$)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value));
  };

  // Helper para formatar data (Corrigindo Timezone UTC)
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  return (
    <div className="card" style={{ marginTop: '30px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: '#f3f4f6', padding: '8px', borderRadius: '8px' }}>
          <Users size={20} color="#4b5563"/>
        </div>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Histórico Global (Todos os Usuários)</h3>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Data</th>
              <th>Descrição</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {/* Caso não haja transações */}
            {transactions.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>
                  Nenhuma transação registrada no sistema.
                </td>
              </tr>
            )}

            {/* Lista de Transações */}
            {transactions.map(t => (
              <tr key={t.id}>
                <td>
                    {/* Nome do usuário em destaque */}
                    <strong style={{ color: 'var(--text)' }}>
                      {t.user?.name || 'Desconhecido'}
                    </strong>
                </td>
                <td className="text-muted">
                  {formatDate(t.date)}
                </td>
                <td>{t.description}</td>
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