import { DollarSign, PieChart, TrendingUp } from 'lucide-react';

/**
 * Exibe os cartões de indicadores principais (Cards do topo).
 * Mostra Saldo, Margem e ROI com formatação visual de cores.
 */
export default function KPIs({ 
  summary = { balance: 0 }, 
  indicators = { netMargin: '0%', roi: '0%' } 
}) {
  
  const balance = Number(summary.balance);
  
  // Remove o símbolo de % para verificar se é negativo
  const roiValue = parseFloat(indicators.roi?.replace('%', '') || 0);

  // Helper para formatar moeda (BRL)
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  return (
    <div className="kpi-section">
      <h2>Indicadores Financeiros</h2>
      
      <div className="summary-grid">
        
        {/* Card 1: Saldo Líquido */}
        <div className="card">
          <h3><DollarSign size={18} className="text-blue"/> Saldo Líquido</h3>
          <div className={`value ${balance >= 0 ? 'text-blue' : 'text-red'}`}>
            {formatCurrency(balance)}
          </div>
        </div>

        {/* Card 2: Margem Líquida */}
        <div className="card">
          <h3><PieChart size={18} className="text-muted"/> Margem Líquida</h3>
          <div className="value" style={{ color: 'var(--text)' }}>
            {indicators.netMargin || '0%'}
          </div>
        </div>

        {/* Card 3: ROI */}
        <div className="card">
          <h3><TrendingUp size={18} className="text-green"/> ROI (Investimentos)</h3>
          <div className={`value ${roiValue >= 0 ? 'text-green' : 'text-red'}`}>
            {indicators.roi || '0%'}
          </div>
        </div>

      </div>
    </div>
  );
}