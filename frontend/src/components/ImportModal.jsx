import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ImportModal({ isOpen, onClose, onImported, accounts = [] }) {
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [accountId, setAccountId] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    try {
      const { data } = await api.post('/transactions/import/preview', {
        content: text,
        filename: file.name,
      });
      setItems(data.items);
      addToast(`${data.count} lançamentos detectados no arquivo.`, 'info');
    } catch {
      addToast('Não foi possível ler o arquivo CSV/OFX.', 'error');
    }
  };

  const handleConfirm = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const { data } = await api.post('/transactions/import/confirm', {
        accountId: accountId ? Number(accountId) : null,
        items,
      });
      addToast(`${data.importedCount} transações importadas!`, 'success');
      setItems([]);
      onImported();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Erro na importação.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3>Importar Extrato (CSV ou OFX)</h3>
          <button className="btn btn-outline" style={{ padding: '0.3rem' }} onClick={onClose}>
            <X size={17} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Conta de Destino</label>
            <select className="select" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              <option value="">Sem conta vinculada</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
            <Upload size={17} /> Selecionar arquivo .CSV ou .OFX
            <input type="file" accept=".csv,.ofx,.txt" hidden onChange={handleFileChange} />
          </label>

          {items.length > 0 && (
            <>
              <div className="table-wrapper" style={{ maxHeight: 260 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Descrição</th>
                      <th>Tipo</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={idx}>
                        <td>{new Date(it.date).toLocaleDateString('pt-BR')}</td>
                        <td>{it.description}</td>
                        <td>
                          <span className={`badge ${it.type === 'INCOME' ? 'badge-income' : 'badge-expense'}`}>
                            {it.type === 'INCOME' ? 'Receita' : 'Despesa'}
                          </span>
                        </td>
                        <td>R$ {Number(it.amount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button className="btn btn-primary" disabled={loading} onClick={handleConfirm}>
                {loading ? 'Importando...' : `Confirmar Importação (${items.length} itens)`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
