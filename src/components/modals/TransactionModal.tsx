import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import type { Transaction, TransactionType, TransactionStatus, RecurrenceType } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transactionToEdit,
}) => {
  const {
    accounts,
    categories,
    members,
    addTransaction,
    editTransaction,
    accountBalances,
  } = useFinance();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('Despesa');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [status, setStatus] = useState<TransactionStatus>('Pago');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('Única');
  const [currentInstallment, setCurrentInstallment] = useState('1');
  const [totalInstallments, setTotalInstallments] = useState('12');

  const [errorMsg, setErrorMsg] = useState('');

  // Populate form on edit or reset on create
  useEffect(() => {
    if (transactionToEdit) {
      setDescription(transactionToEdit.description);
      setAmount(transactionToEdit.amount.toString());
      setType(transactionToEdit.type);
      setDate(transactionToEdit.date);
      setAccountId(transactionToEdit.accountId);
      setCategoryId(transactionToEdit.categoryId);
      setMemberId(transactionToEdit.memberId);
      setStatus(transactionToEdit.status);
      setRecurrence(transactionToEdit.recurrence);
      if (transactionToEdit.installments) {
        setCurrentInstallment(transactionToEdit.installments.current.toString());
        setTotalInstallments(transactionToEdit.installments.total.toString());
      }
    } else {
      setDescription('');
      setAmount('');
      setType('Despesa');
      setDate(new Date().toISOString().split('T')[0]);
      setAccountId(accounts[0]?.id || '');
      setMemberId(members[0]?.id || '');
      setStatus('Pago');
      setRecurrence('Única');
      setCurrentInstallment('1');
      setTotalInstallments('12');

      const firstCat = categories.find((c) => c.type === 'Despesa');
      setCategoryId(firstCat?.id || '');
    }
    setErrorMsg('');
  }, [transactionToEdit, isOpen, accounts, members, categories]);

  // Update default category when type changes
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const availableCategories = categories.filter((c) => c.type === newType);
    if (availableCategories.length > 0 && !availableCategories.some((c) => c.id === categoryId)) {
      setCategoryId(availableCategories[0].id);
    }
  };

  if (!isOpen) return null;

  const numAmount = parseFloat(amount.replace(',', '.')) || 0;
  const selectedAccountBalance = accountId ? accountBalances.get(accountId) ?? 0 : 0;
  const willBeNegative =
    type === 'Despesa' && status === 'Pago' && selectedAccountBalance - numAmount < 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Por favor, informe a descrição.');
      return;
    }
    if (numAmount <= 0) {
      setErrorMsg('Informe um valor numérico maior que zero.');
      return;
    }
    if (!accountId) {
      setErrorMsg('Selecione uma conta ou carteira.');
      return;
    }
    if (!categoryId) {
      setErrorMsg('Selecione uma categoria.');
      return;
    }
    if (!memberId) {
      setErrorMsg('Selecione o membro responsável.');
      return;
    }

    const payload: Omit<Transaction, 'id'> = {
      description: description.trim(),
      amount: numAmount,
      type,
      date,
      accountId,
      categoryId,
      memberId,
      status,
      recurrence,
      installments:
        recurrence === 'Parcelada'
          ? {
              current: parseInt(currentInstallment) || 1,
              total: parseInt(totalInstallments) || 1,
            }
          : undefined,
    };

    if (transactionToEdit) {
      editTransaction(transactionToEdit.id, payload);
    } else {
      addTransaction(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            {transactionToEdit ? 'Editar Transação' : 'Nova Transação'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle Buttons */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('Receita')}
              className={`py-2 rounded-lg font-semibold text-xs transition-all ${
                type === 'Receita'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              🟢 Receita (Entrada)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('Despesa')}
              className={`py-2 rounded-lg font-semibold text-xs transition-all ${
                type === 'Despesa'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              🔴 Despesa (Saída)
            </button>
          </div>

          {/* Description & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Descrição *
              </label>
              <input
                type="text"
                placeholder="Ex: Mercado Carrefour, Salário..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Will balance be negative warning */}
          {willBeNegative && (
            <div className="flex items-center space-x-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-amber-700 dark:text-amber-300 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Aviso: Este lançamento deixará o saldo da conta em{' '}
                <strong>{formatCurrency(selectedAccountBalance - numAmount)}</strong>.
              </span>
            </div>
          )}

          {/* Account, Category, Member */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Conta / Carteira *
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Categoria *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100"
              >
                {categories
                  .filter((c) => c.type === type)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Membro Responsável *
              </label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100"
              >
                {members.map((mem) => (
                  <option key={mem.id} value={mem.id}>
                    {mem.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date, Status, Recurrence */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Data *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TransactionStatus)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 font-semibold"
              >
                <option value="Pago">Pago / Recebido</option>
                <option value="Pendente">Pendente</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Recorrência
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100"
              >
                <option value="Única">Única</option>
                <option value="Mensal">Mensal</option>
                <option value="Parcelada">Parcelada</option>
              </select>
            </div>
          </div>

          {/* Installments details if Parcelada */}
          {recurrence === 'Parcelada' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Parcela Atual
                </label>
                <input
                  type="number"
                  min="1"
                  value={currentInstallment}
                  onChange={(e) => setCurrentInstallment(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Total de Parcelas
                </label>
                <input
                  type="number"
                  min="1"
                  value={totalInstallments}
                  onChange={(e) => setTotalInstallments(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5"
                />
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all"
            >
              {transactionToEdit ? 'Salvar Alterações' : 'Cadastrar Transação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
