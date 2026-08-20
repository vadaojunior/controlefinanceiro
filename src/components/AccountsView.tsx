import React from 'react';
import { Building2, Plus, Edit2, Trash2, CreditCard, AlertCircle } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import type { Account } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface AccountsViewProps {
  onOpenAddModal: () => void;
  onEditAccount: (acc: Account) => void;
  onDeleteAccount: (acc: Account) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  onOpenAddModal,
  onEditAccount,
  onDeleteAccount,
}) => {
  const { accounts, accountBalances, transactions } = useFinance();

  return (
    <div className="space-y-6">
      {/* Title & Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-emerald-500" />
            <span>Contas Bancárias & Carteiras</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gerencie saldos iniciais, contas de investimento e cartões de crédito
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md shadow-emerald-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Conta</span>
        </button>
      </div>

      {/* Accounts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {accounts.map((acc) => {
          const currentBalance = accountBalances.get(acc.id) ?? acc.initialBalance;
          const isNegative = currentBalance < 0;

          // Count transactions linked to this account
          const txCount = transactions.filter((t) => t.accountId === acc.id).length;

          return (
            <div
              key={acc.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group"
            >
              {/* Top Bar with Icon & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                    style={{ backgroundColor: acc.color || '#4F46E5' }}
                  >
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                      {acc.name}
                    </h3>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {acc.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEditAccount(acc)}
                    title="Editar Conta"
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteAccount(acc)}
                    title="Excluir Conta"
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Balance Details */}
              <div className="mt-5 space-y-1">
                <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Saldo Atual Computado
                </div>
                <div
                  className={`text-2xl font-bold tracking-tight ${
                    isNegative
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {formatCurrency(currentBalance)}
                </div>

                {isNegative && (
                  <div className="flex items-center space-x-1 text-[11px] text-rose-500 font-medium mt-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Atenção: Saldo Negativo</span>
                  </div>
                )}
              </div>

              {/* Footer info */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                <span>Saldo Inicial: {formatCurrency(acc.initialBalance)}</span>
                <span>{txCount} lançamentos</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
