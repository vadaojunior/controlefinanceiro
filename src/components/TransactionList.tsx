import React from 'react';
import {
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  Inbox,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import type { Transaction } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';

interface TransactionListProps {
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (tx: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const {
    filteredTransactions,
    accounts,
    categories,
    members,
    filterState,
    financialSummary,
    toggleTransactionStatus,
  } = useFinance();

  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const memberMap = new Map(members.map((m) => [m.id, m]));

  const handleCSV = () => {
    exportToCSV(filteredTransactions, accounts, categories, members, filterState);
  };

  const handlePDF = () => {
    exportToPDF(filteredTransactions, accounts, categories, members, financialSummary, filterState);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
      {/* Header and Export buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center space-x-2">
            <span>Listagem de Transações</span>
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs px-2 py-0.5 rounded-full font-semibold">
              {filteredTransactions.length} exibidas
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gerencie entradas, saídas, pendências e comprovantes
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handlePDF}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      {filteredTransactions.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-2">
            <Inbox className="w-8 h-8" />
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Nenhuma transação encontrada
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
            Tente ajustar os filtros acima ou cadastre uma nova receita ou despesa.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3">Data</th>
                <th className="py-3 px-3">Descrição</th>
                <th className="py-3 px-3">Categoria</th>
                <th className="py-3 px-3">Conta</th>
                <th className="py-3 px-3">Membro</th>
                <th className="py-3 px-3">Recorrência</th>
                <th className="py-3 px-3 text-right">Valor</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredTransactions.map((tx) => {
                const category = categoryMap.get(tx.categoryId);
                const account = accountMap.get(tx.accountId);
                const member = memberMap.get(tx.memberId);
                const isPaid = tx.status === 'Pago';

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3 px-3 font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>

                    {/* Description & Type Icon */}
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-100">
                      <div className="flex items-center space-x-2">
                        {tx.type === 'Receita' ? (
                          <ArrowUpCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <ArrowDownCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <span>{tx.description}</span>
                      </div>
                    </td>

                    {/* Category Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {category ? (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                          style={{
                            backgroundColor: `${category.color}15`,
                            color: category.color,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full mr-1.5"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Account */}
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap font-medium">
                      {account ? account.name : '-'}
                    </td>

                    {/* Member */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {member ? (
                        <div className="flex items-center space-x-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: member.color }}
                          />
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {member.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Recurrence */}
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {tx.recurrence}
                      {tx.installments && (
                        <span className="ml-1 text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                          {tx.installments.current}/{tx.installments.total}
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td
                      className={`py-3 px-3 text-right font-bold whitespace-nowrap ${
                        tx.type === 'Receita'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {tx.type === 'Receita' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </td>

                    {/* Status Quick Toggle Badge */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => toggleTransactionStatus(tx.id)}
                        title="Clique para alternar entre Pago e Pendente"
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all shadow-xs cursor-pointer active:scale-95 ${
                          isPaid
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25'
                        }`}
                      >
                        {isPaid ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Pago</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span>Pendente</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          title="Editar Transação"
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(tx)}
                          title="Excluir Transação"
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
