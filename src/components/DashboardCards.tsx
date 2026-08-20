import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CalendarCheck,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/formatters';

export const DashboardCards: React.FC = () => {
  const { financialSummary } = useFinance();

  const cards = [
    {
      title: 'Total de Receitas',
      amount: financialSummary.totalIncome,
      subtext: `+ ${formatCurrency(financialSummary.pendingIncome)} pendentes`,
      icon: TrendingUp,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      borderAccent: 'border-l-4 border-l-emerald-500',
      trendIcon: ArrowUpRight,
      trendColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Total de Despesas',
      amount: financialSummary.totalExpenses,
      subtext: `+ ${formatCurrency(financialSummary.pendingExpenses)} a pagar`,
      icon: TrendingDown,
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      borderAccent: 'border-l-4 border-l-rose-500',
      trendIcon: ArrowDownRight,
      trendColor: 'text-rose-600 dark:text-rose-400',
    },
    {
      title: 'Saldo Líquido (Mês)',
      amount: financialSummary.netBalance,
      subtext: financialSummary.netBalance >= 0 ? 'Resultado positivo no período' : 'Atenção aos gastos!',
      icon: DollarSign,
      iconBg: financialSummary.netBalance >= 0 ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      borderAccent: financialSummary.netBalance >= 0 ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-rose-500',
      trendIcon: financialSummary.netBalance >= 0 ? ArrowUpRight : ArrowDownRight,
      trendColor: financialSummary.netBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400',
    },
    {
      title: 'Previsão de Saldo',
      amount: financialSummary.projectedBalance,
      subtext: 'Considerando receitas e despesas pendentes',
      icon: CalendarCheck,
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      borderAccent: 'border-l-4 border-l-purple-500',
      trendIcon: ArrowUpRight,
      trendColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Patrimônio Total (Contas)',
      amount: financialSummary.totalNetWorth,
      subtext: 'Soma dos saldos atuais de todas as carteiras',
      icon: Landmark,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      borderAccent: 'border-l-4 border-l-amber-500',
      trendIcon: ArrowUpRight,
      trendColor: 'text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const TrendIcon = card.trendIcon;
        return (
          <div
            key={idx}
            className={`bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-all ${card.borderAccent}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {formatCurrency(card.amount)}
              </div>
              <div className="flex items-center space-x-1 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <TrendIcon className={`w-3 h-3 ${card.trendColor}`} />
                <span className="truncate">{card.subtext}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
