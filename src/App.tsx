import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { DashboardCards } from './components/DashboardCards';
import { ChartsSection } from './components/ChartsSection';
import { TransactionList } from './components/TransactionList';
import { AccountsView } from './components/AccountsView';
import { MembersView } from './components/MembersView';
import { CategoriesView } from './components/CategoriesView';

import { TransactionModal } from './components/modals/TransactionModal';
import { AccountModal } from './components/modals/AccountModal';
import { MemberModal } from './components/modals/MemberModal';
import { CategoryModal } from './components/modals/CategoryModal';
import { DeleteConfirmModal } from './components/modals/DeleteConfirmModal';

import type { Transaction, Account, Member, Category } from './types/finance';

const MainAppContent: React.FC = () => {
  const {
    deleteTransaction,
    deleteAccount,
    deleteMember,
    deleteCategory,
    transactions,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modal States
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txToEdit, setTxToEdit] = useState<Transaction | null>(null);

  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [accToEdit, setAccToEdit] = useState<Account | null>(null);

  const [isMemModalOpen, setIsMemModalOpen] = useState(false);
  const [memToEdit, setMemToEdit] = useState<Member | null>(null);

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catToEdit, setCatToEdit] = useState<Category | null>(null);

  // Delete Confirm State
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    warningText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Action Handlers
  const handleOpenNewTransaction = () => {
    setTxToEdit(null);
    setIsTxModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setTxToEdit(tx);
    setIsTxModalOpen(true);
  };

  const handleDeleteTransaction = (tx: Transaction) => {
    setDeleteDialog({
      isOpen: true,
      title: 'Excluir Transação',
      description: `Tem certeza que deseja remover "${tx.description}"?`,
      warningText: 'Essa ação removerá o lançamento do histórico e atualizará o saldo da conta.',
      onConfirm: () => deleteTransaction(tx.id),
    });
  };

  const handleEditAccount = (acc: Account) => {
    setAccToEdit(acc);
    setIsAccModalOpen(true);
  };

  const handleDeleteAccount = (acc: Account) => {
    const linkedTxCount = transactions.filter((t) => t.accountId === acc.id).length;
    setDeleteDialog({
      isOpen: true,
      title: `Excluir Conta "${acc.name}"`,
      description: 'Deseja realmente remover esta conta bancária?',
      warningText:
        linkedTxCount > 0
          ? `Esta conta possui ${linkedTxCount} transações associadas. A exclusão afetará os relatórios e histórico!`
          : undefined,
      onConfirm: () => deleteAccount(acc.id),
    });
  };

  const handleEditMember = (mem: Member) => {
    setMemToEdit(mem);
    setIsMemModalOpen(true);
  };

  const handleDeleteMember = (mem: Member) => {
    const linkedTxCount = transactions.filter((t) => t.memberId === mem.id).length;
    setDeleteDialog({
      isOpen: true,
      title: `Excluir Membro "${mem.name}"`,
      description: 'Deseja remover este membro da família?',
      warningText:
        linkedTxCount > 0
          ? `Este integrante possui ${linkedTxCount} transações registradas em seu nome.`
          : undefined,
      onConfirm: () => deleteMember(mem.id),
    });
  };

  const handleEditCategory = (cat: Category) => {
    setCatToEdit(cat);
    setIsCatModalOpen(true);
  };

  const handleDeleteCategory = (cat: Category) => {
    const linkedTxCount = transactions.filter((t) => t.categoryId === cat.id).length;
    setDeleteDialog({
      isOpen: true,
      title: `Excluir Categoria "${cat.name}"`,
      description: 'Deseja remover esta categoria?',
      warningText:
        linkedTxCount > 0
          ? `Existem ${linkedTxCount} lançamentos vinculados a esta categoria.`
          : undefined,
      onConfirm: () => deleteCategory(cat.id),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenTransactionModal={handleOpenNewTransaction}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Global Filter Bar */}
        <FilterBar />

        {/* View Switcher */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Metric Summary Cards */}
            <DashboardCards />

            {/* Interactive Charts */}
            <ChartsSection />

            {/* Recent / Filtered Transactions Quick View */}
            <TransactionList
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </div>
        )}

        {activeTab === 'transactions' && (
          <TransactionList
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'accounts' && (
          <AccountsView
            onOpenAddModal={() => {
              setAccToEdit(null);
              setIsAccModalOpen(true);
            }}
            onEditAccount={handleEditAccount}
            onDeleteAccount={handleDeleteAccount}
          />
        )}

        {activeTab === 'members' && (
          <MembersView
            onOpenAddModal={() => {
              setMemToEdit(null);
              setIsMemModalOpen(true);
            }}
            onEditMember={handleEditMember}
            onDeleteMember={handleDeleteMember}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesView
            onOpenAddModal={() => {
              setCatToEdit(null);
              setIsCatModalOpen(true);
            }}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          Sistema de Controle Financeiro Pessoal & Familiar &bull; BRL (R$) &bull; Todos os direitos reservados.
        </p>
      </footer>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        transactionToEdit={txToEdit}
      />

      <AccountModal
        isOpen={isAccModalOpen}
        onClose={() => setIsAccModalOpen(false)}
        accountToEdit={accToEdit}
      />

      <MemberModal
        isOpen={isMemModalOpen}
        onClose={() => setIsMemModalOpen(false)}
        memberToEdit={memToEdit}
      />

      <CategoryModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        categoryToEdit={catToEdit}
      />

      <DeleteConfirmModal
        isOpen={deleteDialog.isOpen}
        title={deleteDialog.title}
        description={deleteDialog.description}
        warningText={deleteDialog.warningText}
        onClose={() => setDeleteDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={deleteDialog.onConfirm}
      />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainAppContent />
    </FinanceProvider>
  );
}
