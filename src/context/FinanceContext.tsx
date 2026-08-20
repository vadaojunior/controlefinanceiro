import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type {
  Member,
  Account,
  Category,
  Transaction,
  FilterState,
  FinancialSummary,
} from '../types/finance';
import {
  initialMembers,
  initialAccounts,
  initialCategories,
  initialTransactions,
} from '../data/mockData';

interface FinanceContextType {
  members: Member[];
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  filterState: FilterState;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;

  // Computed data
  filteredTransactions: Transaction[];
  financialSummary: FinancialSummary;
  accountBalances: Map<string, number>;

  // CRUD actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  editTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  toggleTransactionStatus: (id: string) => void;

  addAccount: (acc: Omit<Account, 'id'>) => void;
  editAccount: (id: string, acc: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  addMember: (mem: Omit<Member, 'id'>) => void;
  editMember: (id: string, mem: Partial<Member>) => void;
  deleteMember: (id: string) => void;

  addCategory: (cat: Omit<Category, 'id'>) => void;
  editCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  resetToDemoData: () => void;
  clearAllData: () => void;
}

const STORAGE_KEYS = {
  MEMBERS: 'cf_members_v1',
  ACCOUNTS: 'cf_accounts_v1',
  CATEGORIES: 'cf_categories_v1',
  TRANSACTIONS: 'cf_transactions_v1',
  THEME: 'cf_theme_v1',
};

const defaultFilterState: FilterState = {
  period: 'current_month',
  memberId: 'all',
  accountId: 'all',
  categoryId: 'all',
  status: 'all',
  type: 'all',
  searchQuery: '',
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme State
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const setDarkMode = (dark: boolean) => {
    setDarkModeState(dark);
    localStorage.setItem(STORAGE_KEYS.THEME, dark ? 'dark' : 'light');
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Main Entity States with LocalStorage Sync
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return saved ? JSON.parse(saved) : initialMembers;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return saved ? JSON.parse(saved) : initialAccounts;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [filterState, setFilterState] = useState<FilterState>(defaultFilterState);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  // Dynamic Account Balances Computation
  const accountBalances = useMemo(() => {
    const map = new Map<string, number>();

    accounts.forEach((acc) => {
      let balance = acc.initialBalance;
      transactions.forEach((tx) => {
        if (tx.accountId === acc.id && tx.status === 'Pago') {
          if (tx.type === 'Receita') {
            balance += tx.amount;
          } else {
            balance -= tx.amount;
          }
        }
      });
      map.set(acc.id, balance);
    });

    return map;
  }, [accounts, transactions]);

  // Filtered Transactions Logic
  const filteredTransactions = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    return transactions.filter((tx) => {
      // Period filter
      if (filterState.period === 'current_month') {
        const txDate = new Date(tx.date + 'T00:00:00');
        if (txDate.getFullYear() !== currentYear || txDate.getMonth() !== currentMonth) {
          return false;
        }
      } else if (filterState.period === 'last_month') {
        const txDate = new Date(tx.date + 'T00:00:00');
        const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
        if (
          txDate.getFullYear() !== lastMonthDate.getFullYear() ||
          txDate.getMonth() !== lastMonthDate.getMonth()
        ) {
          return false;
        }
      } else if (filterState.period === 'last_30_days') {
        const txDate = new Date(tx.date + 'T00:00:00');
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        if (txDate < thirtyDaysAgo || txDate > today) return false;
      } else if (filterState.period === 'custom') {
        if (filterState.startDate && tx.date < filterState.startDate) return false;
        if (filterState.endDate && tx.date > filterState.endDate) return false;
      }

      // Member filter
      if (filterState.memberId !== 'all' && tx.memberId !== filterState.memberId) {
        return false;
      }

      // Account filter
      if (filterState.accountId !== 'all' && tx.accountId !== filterState.accountId) {
        return false;
      }

      // Category filter
      if (filterState.categoryId !== 'all' && tx.categoryId !== filterState.categoryId) {
        return false;
      }

      // Status filter
      if (filterState.status !== 'all' && tx.status !== filterState.status) {
        return false;
      }

      // Type filter
      if (filterState.type !== 'all' && tx.type !== filterState.type) {
        return false;
      }

      // Search Query
      if (filterState.searchQuery.trim() !== '') {
        const query = filterState.searchQuery.toLowerCase();
        const descMatch = tx.description.toLowerCase().includes(query);
        const notesMatch = tx.notes?.toLowerCase().includes(query) || false;
        if (!descMatch && !notesMatch) return false;
      }

      return true;
    });
  }, [transactions, filterState]);

  // Financial Summary computation
  const financialSummary = useMemo<FinancialSummary>(() => {
    let totalIncome = 0;
    let totalExpenses = 0;
    let pendingIncome = 0;
    let pendingExpenses = 0;

    filteredTransactions.forEach((tx) => {
      if (tx.type === 'Receita') {
        if (tx.status === 'Pago') {
          totalIncome += tx.amount;
        } else {
          pendingIncome += tx.amount;
        }
      } else {
        if (tx.status === 'Pago') {
          totalExpenses += tx.amount;
        } else {
          pendingExpenses += tx.amount;
        }
      }
    });

    const netBalance = totalIncome - totalExpenses;
    const projectedBalance = netBalance + pendingIncome - pendingExpenses;

    let totalNetWorth = 0;
    accountBalances.forEach((bal) => {
      totalNetWorth += bal;
    });

    return {
      totalIncome,
      totalExpenses,
      netBalance,
      pendingIncome,
      pendingExpenses,
      projectedBalance,
      totalNetWorth,
    };
  }, [filteredTransactions, accountBalances]);

  // CRUD Operations
  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const editTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((tx) => (tx.id === id ? { ...tx, ...updated } : tx)));
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const toggleTransactionStatus = (id: string) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === id) {
          return {
            ...tx,
            status: tx.status === 'Pago' ? 'Pendente' : 'Pago',
          };
        }
        return tx;
      })
    );
  };

  const addAccount = (acc: Omit<Account, 'id'>) => {
    const newAcc: Account = {
      ...acc,
      id: 'acc-' + Date.now(),
    };
    setAccounts((prev) => [...prev, newAcc]);
  };

  const editAccount = (id: string, updated: Partial<Account>) => {
    setAccounts((prev) => prev.map((acc) => (acc.id === id ? { ...acc, ...updated } : acc)));
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
  };

  const addMember = (mem: Omit<Member, 'id'>) => {
    const newMem: Member = {
      ...mem,
      id: 'mem-' + Date.now(),
    };
    setMembers((prev) => [...prev, newMem]);
  };

  const editMember = (id: string, updated: Partial<Member>) => {
    setMembers((prev) => prev.map((mem) => (mem.id === id ? { ...mem, ...updated } : mem)));
  };

  const deleteMember = (id: string) => {
    setMembers((prev) => prev.filter((mem) => mem.id !== id));
  };

  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: 'cat-' + Date.now(),
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const editCategory = (id: string, updated: Partial<Category>) => {
    setCategories((prev) => prev.map((cat) => (cat.id === id ? { ...cat, ...updated } : cat)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  const resetToDemoData = () => {
    setMembers(initialMembers);
    setAccounts(initialAccounts);
    setCategories(initialCategories);
    setTransactions(initialTransactions);
    setFilterState(defaultFilterState);
  };

  // Clear all sample data for fresh real usage
  const clearAllData = () => {
    setTransactions([]);
    setMembers([
      { id: 'mem-1', name: 'Titular', role: 'Titular', color: '#4F46E5' }
    ]);
    setAccounts([
      { id: 'acc-1', name: 'Minha Conta', type: 'Corrente', initialBalance: 0, color: '#003399' }
    ]);
    setCategories(initialCategories); // Keep clean standard category choices
    setFilterState(defaultFilterState);
  };

  return (
    <FinanceContext.Provider
      value={{
        members,
        accounts,
        categories,
        transactions,
        filterState,
        darkMode,
        setDarkMode,
        setFilterState,
        filteredTransactions,
        financialSummary,
        accountBalances,
        addTransaction,
        editTransaction,
        deleteTransaction,
        toggleTransactionStatus,
        addAccount,
        editAccount,
        deleteAccount,
        addMember,
        editMember,
        deleteMember,
        addCategory,
        editCategory,
        deleteCategory,
        resetToDemoData,
        clearAllData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
