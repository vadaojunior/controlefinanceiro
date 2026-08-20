import React, { useState } from 'react';
import { Grid, Plus, Edit2, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import type { Category, TransactionType } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface CategoriesViewProps {
  onOpenAddModal: () => void;
  onEditCategory: (cat: Category) => void;
  onDeleteCategory: (cat: Category) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  onOpenAddModal,
  onEditCategory,
  onDeleteCategory,
}) => {
  const { categories, transactions } = useFinance();
  const [activeTypeTab, setActiveTypeTab] = useState<TransactionType | 'all'>('all');

  const filteredCategories = categories.filter((cat) => {
    if (activeTypeTab === 'all') return true;
    return cat.type === activeTypeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
            <Grid className="w-5 h-5 text-amber-500" />
            <span>Categorias de Receitas e Despesas</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Organize seus lançamentos financeiros por categorias personalizadas
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Type Tab Filter */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => setActiveTypeTab('all')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                activeTypeTab === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setActiveTypeTab('Receita')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all flex items-center space-x-1 ${
                activeTypeTab === 'Receita'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-emerald-600 dark:text-slate-400'
              }`}
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
              <span>Receitas</span>
            </button>
            <button
              onClick={() => setActiveTypeTab('Despesa')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all flex items-center space-x-1 ${
                activeTypeTab === 'Despesa'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-rose-600 dark:text-slate-400'
              }`}
            >
              <ArrowDownCircle className="w-3.5 h-3.5" />
              <span>Despesas</span>
            </button>
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-md shadow-amber-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Categoria</span>
          </button>
        </div>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCategories.map((cat) => {
          // Calculate sum of transactions in this category
          const catTx = transactions.filter((t) => t.categoryId === cat.id && t.status === 'Pago');
          const totalAmount = catTx.reduce((acc, t) => acc + t.amount, 0);

          return (
            <div
              key={cat.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.type === 'Receita' ? (
                      <ArrowUpCircle className="w-5 h-5" />
                    ) : (
                      <ArrowDownCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                      {cat.name}
                    </h4>
                    <span
                      className={`inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full mt-0.5 ${
                        cat.type === 'Receita'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {cat.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onEditCategory(cat)}
                    title="Editar Categoria"
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteCategory(cat)}
                    title="Excluir Categoria"
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Total Movimentado</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
