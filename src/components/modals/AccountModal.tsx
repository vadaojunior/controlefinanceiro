import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import type { Account, AccountType } from '../../types/finance';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountToEdit?: Account | null;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  accountToEdit,
}) => {
  const { addAccount, editAccount } = useFinance();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('Corrente');
  const [initialBalance, setInitialBalance] = useState('0');
  const [color, setColor] = useState('#4F46E5');
  const [error, setError] = useState('');

  useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name);
      setType(accountToEdit.type);
      setInitialBalance(accountToEdit.initialBalance.toString());
      setColor(accountToEdit.color || '#4F46E5');
    } else {
      setName('');
      setType('Corrente');
      setInitialBalance('0');
      setColor('#4F46E5');
    }
    setError('');
  }, [accountToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Informe o nome da conta.');
      return;
    }
    const bal = parseFloat(initialBalance.replace(',', '.')) || 0;

    if (accountToEdit) {
      editAccount(accountToEdit.id, { name: name.trim(), type, initialBalance: bal, color });
    } else {
      addAccount({ name: name.trim(), type, initialBalance: bal, color });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            {accountToEdit ? 'Editar Conta' : 'Nova Conta / Carteira'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-xs text-rose-600 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nome da Conta *
            </label>
            <input
              type="text"
              placeholder="Ex: Banco Itaú, Nubank, XP..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tipo de Conta *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100"
              >
                <option value="Corrente">Conta Corrente</option>
                <option value="Poupança">Poupança</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Investimento">Investimentos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Saldo Inicial (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Cor de Identificação
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-9 h-9 rounded-xl border-none cursor-pointer bg-transparent"
              />
              <span className="text-xs font-mono text-slate-500">{color}</span>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
            >
              {accountToEdit ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
