import React from 'react';
import { Users, Plus, Edit2, Trash2, UserCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import type { Member } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface MembersViewProps {
  onOpenAddModal: () => void;
  onEditMember: (mem: Member) => void;
  onDeleteMember: (mem: Member) => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  onOpenAddModal,
  onEditMember,
  onDeleteMember,
}) => {
  const { members, transactions } = useFinance();

  return (
    <div className="space-y-6">
      {/* Title & Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <span>Membros da Família</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cadastre dependentes, cônjuge e titulares para acompanhamento individualizado
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Membro</span>
        </button>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {members.map((mem) => {
          // Calculate member's income & expenses
          const memTx = transactions.filter((t) => t.memberId === mem.id && t.status === 'Pago');
          const totalInc = memTx
            .filter((t) => t.type === 'Receita')
            .reduce((acc, t) => acc + t.amount, 0);
          const totalExp = memTx
            .filter((t) => t.type === 'Despesa')
            .reduce((acc, t) => acc + t.amount, 0);

          return (
            <div
              key={mem.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-sm uppercase"
                      style={{ backgroundColor: mem.color }}
                    >
                      {mem.name.substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                        {mem.name}
                      </h3>
                      <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                        <UserCheck className="w-3 h-3" />
                        <span>{mem.role}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onEditMember(mem)}
                      title="Editar Membro"
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteMember(mem)}
                      title="Excluir Membro"
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Member stats */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/10">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Receitas</span>
                    </span>
                    <span className="block mt-1 font-bold text-slate-800 dark:text-slate-100">
                      {formatCurrency(totalInc)}
                    </span>
                  </div>

                  <div className="bg-rose-500/5 dark:bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/10">
                    <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 flex items-center space-x-1">
                      <TrendingDown className="w-3 h-3" />
                      <span>Despesas</span>
                    </span>
                    <span className="block mt-1 font-bold text-slate-800 dark:text-slate-100">
                      {formatCurrency(totalExp)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                <span>Saldo Individual: {formatCurrency(totalInc - totalExp)}</span>
                <span>{memTx.length} transações</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
