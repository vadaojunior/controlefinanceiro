import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const ChartsSection: React.FC = () => {
  const { filteredTransactions, categories, members, darkMode } = useFinance();

  const textColor = darkMode ? '#94A3B8' : '#475569';
  const gridColor = darkMode ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.6)';

  // --- 1. Receitas vs Despesas por Mês/Período ---
  const monthlyDataMap = new Map<string, { income: number; expense: number }>();

  // Sort filtered transactions chronologically
  const sortedTx = [...filteredTransactions].sort((a, b) => a.date.localeCompare(b.date));

  sortedTx.forEach((tx) => {
    const monthKey = tx.date.substring(0, 7); // YYYY-MM
    if (!monthlyDataMap.has(monthKey)) {
      monthlyDataMap.set(monthKey, { income: 0, expense: 0 });
    }
    const current = monthlyDataMap.get(monthKey)!;
    if (tx.status === 'Pago') {
      if (tx.type === 'Receita') current.income += tx.amount;
      else current.expense += tx.amount;
    }
  });

  const monthLabels = Array.from(monthlyDataMap.keys()).map((key) => {
    const [year, month] = key.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
  });

  const incomeDataset = Array.from(monthlyDataMap.values()).map((v) => v.income);
  const expenseDataset = Array.from(monthlyDataMap.values()).map((v) => v.expense);

  const compareChartData = {
    labels: monthLabels.length > 0 ? monthLabels : ['Atual'],
    datasets: [
      {
        label: 'Receitas (R$)',
        data: incomeDataset.length > 0 ? incomeDataset : [0],
        backgroundColor: 'rgba(16, 185, 129, 0.85)',
        borderRadius: 6,
      },
      {
        label: 'Despesas (R$)',
        data: expenseDataset.length > 0 ? expenseDataset : [0],
        backgroundColor: 'rgba(239, 68, 68, 0.85)',
        borderRadius: 6,
      },
    ],
  };

  const compareChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: textColor, font: { family: 'Inter', size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${formatCurrency(context.raw)}`,
        },
      },
    },
    scales: {
      x: { ticks: { color: textColor }, grid: { color: gridColor } },
      y: { ticks: { color: textColor }, grid: { color: gridColor } },
    },
  };

  // --- 2. Despesas por Categoria (Doughnut Chart) ---
  const categoryExpenseMap = new Map<string, number>();
  filteredTransactions.forEach((tx) => {
    if (tx.type === 'Despesa' && tx.status === 'Pago') {
      categoryExpenseMap.set(
        tx.categoryId,
        (categoryExpenseMap.get(tx.categoryId) || 0) + tx.amount
      );
    }
  });

  const catLabels: string[] = [];
  const catValues: number[] = [];
  const catColors: string[] = [];

  categories
    .filter((c) => c.type === 'Despesa')
    .forEach((cat) => {
      const val = categoryExpenseMap.get(cat.id) || 0;
      if (val > 0) {
        catLabels.push(cat.name);
        catValues.push(val);
        catColors.push(cat.color);
      }
    });

  const doughnutData = {
    labels: catLabels.length > 0 ? catLabels : ['Sem dados'],
    datasets: [
      {
        data: catValues.length > 0 ? catValues : [1],
        backgroundColor: catColors.length > 0 ? catColors : ['#CBD5E1'],
        borderWidth: 2,
        borderColor: darkMode ? '#0F172A' : '#FFFFFF',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: { color: textColor, font: { family: 'Inter', size: 11 } },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${formatCurrency(context.raw)}`,
        },
      },
    },
    cutout: '68%',
  };

  // --- 3. Gastos por Membro da Família (Bar Chart) ---
  const memberExpenseMap = new Map<string, number>();
  filteredTransactions.forEach((tx) => {
    if (tx.type === 'Despesa' && tx.status === 'Pago') {
      memberExpenseMap.set(tx.memberId, (memberExpenseMap.get(tx.memberId) || 0) + tx.amount);
    }
  });

  const memberNames: string[] = [];
  const memberValues: number[] = [];
  const memberColors: string[] = [];

  members.forEach((mem) => {
    memberNames.push(mem.name);
    memberValues.push(memberExpenseMap.get(mem.id) || 0);
    memberColors.push(mem.color);
  });

  const memberChartData = {
    labels: memberNames,
    datasets: [
      {
        label: 'Gastos (R$)',
        data: memberValues,
        backgroundColor: memberColors,
        borderRadius: 8,
      },
    ],
  };

  const memberChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => `Gasto: ${formatCurrency(context.raw)}`,
        },
      },
    },
    scales: {
      x: { ticks: { color: textColor }, grid: { color: gridColor } },
      y: { ticks: { color: textColor }, grid: { color: gridColor } },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Receitas vs Despesas (2 cols wide) */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              Comparativo Mensal (Receitas vs Despesas)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evolução financeira consolidada por período
            </p>
          </div>
        </div>
        <div className="h-64 sm:h-72 w-full">
          <Bar data={compareChartData} options={compareChartOptions} />
        </div>
      </div>

      {/* Despesas por Categoria */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
            Despesas por Categoria
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Distribuição de onde o dinheiro está sendo gasto
          </p>
        </div>
        <div className="h-64 sm:h-72 w-full flex items-center justify-center">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>

      {/* Gastos por Membro da Família */}
      <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              Distribuição de Gastos por Membro da Família
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visão individual das despesas quitadas de cada integrante
            </p>
          </div>
        </div>
        <div className="h-56 sm:h-64 w-full">
          <Bar data={memberChartData} options={memberChartOptions} />
        </div>
      </div>
    </div>
  );
};
