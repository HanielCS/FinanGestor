import { useCallback, useEffect, useState } from 'react';
import { Download, Upload, Trash2, RotateCcw, Edit3 } from 'lucide-react';
import Layout from '../components/Layout';
import TransactionForm from '../components/TransactionForm';
import ImportModal from '../components/ImportModal';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function TransactionsPage() {
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [meta, setMeta] = useState({ accounts: [], categories: [] });
  const [filters, setFilters] = useState({
    page: 1,
    search: '',
    type: '',
    categoryId: '',
    accountId: '',
    includeDeleted: 'false',
  });

  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  const loadData = useCallback(async () => {
    const [txRes, metaRes] = await Promise.all([
      api.get('/transactions', { params: filters }),
      api.get('/meta'),
    ]);
    setItems(txRes.data.items);
    setPagination(txRes.data.pagination);
    setMeta(metaRes.data);
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id) => {
    await api.delete(`/transactions/${id}`);
    addToast('Transação movida para a lixeira.', 'info');
    loadData();
  };

  const handleRestore = async (id) => {
    await api.patch(`/transactions/${id}/restore`);
    addToast('Transação restaurada!', 'success');
    loadData();
  };

  const handleExportCSV = async () => {
    const response = await api.get('/transactions/export/csv', {
      params: filters,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'finangestor-extrato.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <Layout
      title="Histórico de Transações"
      onQuickNewTransaction={() => {
        setEditingTx(null);
        setFormOpen(true);
      }}
    >
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-outline" onClick={() => setImportOpen(true)}>
              <Upload size={16} /> Importar CSV/OFX
            </button>
            <button className="btn btn-outline" onClick={handleExportCSV}>
              <Download size={16} /> Exportar CSV
            </button>
          </div>

          <button
            className="btn btn-outline"
            onClick={() =>
              setFilters((f) => ({
                ...f,
                page: 1,
                includeDeleted: f.includeDeleted === 'true' ? 'false' : 'true',
              }))
            }
          >
            {filters.includeDeleted === 'true' ? 'Ver Ativos' : 'Ver Lixeira (Excluídos)'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.65rem' }}>
          <input
            className="input"
            placeholder="Buscar descrição..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, page: 1, search: e.target.value })}
          />

          <select
            className="select"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, page: 1, type: e.target.value })}
          >
            <option value="">Todos os tipos</option>
            <option value="INCOME">Receitas</option>
            <option value="EXPENSE">Despesas</option>
          </select>

          <select
            className="select"
            value={filters.categoryId}
            onChange={(e) => setFilters({ ...filters, page: 1, categoryId: e.target.value })}
          >
            <option value="">Todas as categorias</option>
            {meta.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="select"
            value={filters.accountId}
            onChange={(e) => setFilters({ ...filters, page: 1, accountId: e.target.value })}
          >
            <option value="">Todas as contas</option>
            {meta.accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Conta</th>
                <th>Valor</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    Nenhuma transação encontrada para os filtros aplicados.
                  </td>
                </tr>
              ) : (
                items.map((t) => (
                  <tr key={t.id}>
                    <td>{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <strong>{t.description}</strong>
                      {t.isRecurring && <span className="badge badge-warning" style={{ marginLeft: 6 }}>Fixa</span>}
                    </td>
                    <td>{t.categoryRel?.name || t.category}</td>
                    <td>{t.account?.name || '—'}</td>
                    <td>
                      <span className={`badge ${t.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                        {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {filters.includeDeleted === 'true' ? (
                        <button className="btn btn-outline" onClick={() => handleRestore(t.id)} title="Restaurar">
                          <RotateCcw size={15} />
                        </button>
                      ) : (
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn-outline"
                            onClick={() => {
                              setEditingTx(t);
                              setFormOpen(true);
                            }}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button className="btn btn-danger" onClick={() => handleDelete(t.id)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <span style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>
            Total: {pagination.total} registros
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-outline"
              disabled={pagination.page <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            >
              Anterior
            </button>
            <span style={{ alignSelf: 'center', fontSize: '0.85rem' }}>
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              className="btn btn-outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            >
              Próxima
            </button>
          </div>
        </div>
      </div>

      <TransactionForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={loadData}
        initialData={editingTx}
      />

      <ImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={loadData}
        accounts={meta.accounts}
      />
    </Layout>
  );
}
