import React from 'react';
import {
  Filter,
  Calendar,
  User,
  CreditCard,
  Tag,
  Search,
  CheckCircle2,
  Clock,
  X,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import type { PeriodFilter } from '../types/finance';

export const FilterBar: React.FC = () => {
  const { members, accounts, categories, filterState, setFilterState } = useFinance();

  const handlePeriodChange = (period: PeriodFilter) => {
    setFilterState((prev) => ({ ...prev, period }));
  };

  const isFiltered =
    filterState.period !== 'current_month' ||
    filterState.memberId !== 'all' ||
    filterState.accountId !== 'all' ||
    filterState.categoryId !== 'all' ||
    filterState.status !== 'all' ||
    filterState.type !== 'all' ||
    filterState.searchQuery !== '';

  const clearFilters = () => {
    setFilterState({
      period: 'current_month',
      memberId: 'all',
      accountId: 'all',
      categoryId: 'all',
      status: 'all',
      type: 'all',
      searchQuery: '',
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3.5 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-200 font-semibold text-sm">
          <Filter className="w-4 h-4 text-emerald-500" />
          <span>Filtros Avançados & Orçamento Familiar</span>
        </div>

        <div className="flex items-center space-x-2">
          {isFiltered && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
          )}

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por descrição..."
              value={filterState.searchQuery}
              onChange={(e) =>
                setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))
              }
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 placeholder-slate-400 w-48 sm:w-60 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Filter Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Period Selector */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-emerald-500" />
            <span>Período</span>
          </label>
          <select
            value={filterState.period}
            onChange={(e) => handlePeriodChange(e.target.value as PeriodFilter)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="current_month">Mês Atual</option>
            <option value="last_month">Mês Anterior</option>
            <option value="last_30_days">Últimos 30 Dias</option>
            <option value="all">Todos os Tempos</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>

        {/* Custom Date Range if 'custom' is selected */}
        {filterState.period === 'custom' && (
          <div className="col-span-1 sm:col-span-2 flex items-center space-x-2">
            <input
              type="date"
              value={filterState.startDate || ''}
              onChange={(e) => setFilterState((prev) => ({ ...prev, startDate: e.target.value }))}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-700 dark:text-slate-200"
            />
            <span className="text-xs text-slate-400">até</span>
            <input
              type="date"
              value={filterState.endDate || ''}
              onChange={(e) => setFilterState((prev) => ({ ...prev, endDate: e.target.value }))}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-700 dark:text-slate-200"
            />
          </div>
        )}

        {/* Family Member Filter */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center space-x-1">
            <User className="w-3 h-3 text-indigo-500" />
            <span>Membro da Família</span>
          </label>
          <select
            value={filterState.memberId}
            onChange={(e) => setFilterState((prev) => ({ ...prev, memberId: e.target.value }))}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">👨‍👩‍👧‍👦 Toda a Família (Consolidado)</option>
            {members.map((mem) => (
              <option key={mem.id} value={mem.id}>
                👤 {mem.name} ({mem.role})
              </option>
            ))}
          </select>
        </div>

        {/* Account / Wallet Filter */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center space-x-1">
            <CreditCard className="w-3 h-3 text-purple-500" />
            <span>Conta / Carteira</span>
          </label>
          <select
            value={filterState.accountId}
            onChange={(e) => setFilterState((prev) => ({ ...prev, accountId: e.target.value }))}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">💳 Todas as Contas</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.type})
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center space-x-1">
            <Tag className="w-3 h-3 text-amber-500" />
            <span>Categoria</span>
          </label>
          <select
            value={filterState.categoryId}
            onChange={(e) => setFilterState((prev) => ({ ...prev, categoryId: e.target.value }))}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">🏷️ Todas as Categorias</option>
            <optgroup label="Receitas">
              {categories
                .filter((c) => c.type === 'Receita')
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    🟢 {cat.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Despesas">
              {categories
                .filter((c) => c.type === 'Despesa')
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    🔴 {cat.name}
                  </option>
                ))}
            </optgroup>
          </select>
        </div>

        {/* Status Pills */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-teal-500" />
            <span>Status</span>
          </label>
          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => setFilterState((prev) => ({ ...prev, status: 'all' }))}
              className={`flex-1 py-1 text-[11px] font-medium rounded-md transition-all ${
                filterState.status === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterState((prev) => ({ ...prev, status: 'Pago' }))}
              className={`flex-1 py-1 text-[11px] font-medium rounded-md transition-all flex items-center justify-center space-x-0.5 ${
                filterState.status === 'Pago'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Pago</span>
            </button>
            <button
              onClick={() => setFilterState((prev) => ({ ...prev, status: 'Pendente' }))}
              className={`flex-1 py-1 text-[11px] font-medium rounded-md transition-all flex items-center justify-center space-x-0.5 ${
                filterState.status === 'Pendente'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-amber-600'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Pend.</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
