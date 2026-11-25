import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function FinancialChart({ monthlySeries = [], expensesByCategory = [] }) {
  return (
    <div className="grid-2">
      <div className="card">
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Fluxo de Caixa (Últimos 6 Meses)</h3>
        <div style={{ width: '100%', height: 270 }}>
          <ResponsiveContainer>
            <BarChart data={monthlySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-color)',
                  borderRadius: 10,
                }}
              />
              <Legend />
              <Bar dataKey="receitas" name="Receitas" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Despesas por Categoria</h3>
        {expensesByCategory.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Nenhuma despesa registrada neste período.
          </p>
        ) : (
          <div style={{ width: '100%', height: 270 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={3}
                >
                  {expensesByCategory.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) =>
                    Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  }
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
