export type MemberRole = 'Titular' | 'Cônjuge' | 'Dependente' | 'Outro';

export interface Member {
  id: string;
  name: string;
  role: MemberRole;
  color: string;
  avatarUrl?: string;
}

export type AccountType = 'Corrente' | 'Poupança' | 'Cartão de Crédito' | 'Investimento';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  color?: string;
  accountNumber?: string;
}

export type TransactionType = 'Receita' | 'Despesa';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}

export type TransactionStatus = 'Pago' | 'Pendente';
export type RecurrenceType = 'Única' | 'Mensal' | 'Parcelada';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string; // ISO format: YYYY-MM-DD
  categoryId: string;
  accountId: string;
  memberId: string;
  status: TransactionStatus;
  recurrence: RecurrenceType;
  installments?: {
    current: number;
    total: number;
  };
  notes?: string;
}

export type PeriodFilter = 'current_month' | 'last_month' | 'last_30_days' | 'last_90_days' | 'year_to_date' | 'all' | 'custom';

export interface FilterState {
  period: PeriodFilter;
  startDate?: string;
  endDate?: string;
  memberId: string; // 'all' or specific ID
  accountId: string; // 'all' or specific ID
  categoryId: string; // 'all' or specific ID
  status: 'all' | 'Pago' | 'Pendente';
  type: 'all' | 'Receita' | 'Despesa';
  searchQuery: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  pendingIncome: number;
  pendingExpenses: number;
  projectedBalance: number;
  totalNetWorth: number; // Sum of computed balances across all accounts
}
