import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * Componente visual para comparar Entradas vs Saídas.
 * Utiliza a biblioteca 'recharts' para renderizar um gráfico de barras.
 */
export default function FinancialChart({ summary }) {
  const chartData = [
    { name: 'Entradas', valor: Number(summary.income) },
    { name: 'Saídas', valor: Number(summary.expense) },
  ];

  // Paleta de cores (Sincronizada com styles/settings.css)
  const colors = {
    entradas: '#10b981', // Verde
    saidas: '#ef4444'    // Vermelho
  };

  // Formata o valor monetário no Tooltip (ao passar o mouse)
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="card chart-card">
      <h3>Fluxo de Caixa</h3>
      
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis hide={false} />
          
          <Tooltip 
            cursor={{ fill: 'transparent' }} 
            formatter={(value) => [formatCurrency(value), 'Valor']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          />
          
          <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.name === 'Entradas' ? colors.entradas : colors.saidas} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}