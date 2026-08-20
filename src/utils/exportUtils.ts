import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Transaction, Account, Category, Member, FinancialSummary, FilterState } from '../types/finance';
import { formatCurrency, formatDate } from './formatters';

export const exportToCSV = (
  transactions: Transaction[],
  accounts: Account[],
  categories: Category[],
  members: Member[],
  _filterState: FilterState
) => {
  const accountMap = new Map(accounts.map((a) => [a.id, a.name]));
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const memberMap = new Map(members.map((m) => [m.id, m.name]));

  const headers = [
    'Data',
    'Descrição',
    'Tipo',
    'Categoria',
    'Conta / Carteira',
    'Membro Responsável',
    'Valor (R$)',
    'Status',
    'Recorrência',
  ];

  const rows = transactions.map((tx) => [
    formatDate(tx.date),
    `"${tx.description.replace(/"/g, '""')}"`,
    tx.type,
    `"${categoryMap.get(tx.categoryId) || 'Sem Categoria'}"`,
    `"${accountMap.get(tx.accountId) || 'Sem Conta'}"`,
    `"${memberMap.get(tx.memberId) || 'Sem Membro'}"`,
    tx.amount.toFixed(2).replace('.', ','),
    tx.status,
    tx.recurrence + (tx.installments ? ` (${tx.installments.current}/${tx.installments.total})` : ''),
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (
  transactions: Transaction[],
  accounts: Account[],
  categories: Category[],
  members: Member[],
  summary: FinancialSummary,
  _filterState: FilterState
) => {
  const doc = new jsPDF();
  const accountMap = new Map(accounts.map((a) => [a.id, a.name]));
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const memberMap = new Map(members.map((m) => [m.id, m.name]));

  // Header Banner
  doc.setFillColor(30, 41, 59); // Dark slate background
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório Financeiro Familiar', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`, 14, 25);

  // Summary Metrics Section
  let startY = 40;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo do Período Filtrado', 14, startY);

  // Draw 3 Summary Cards
  const cardWidth = 58;
  const cardHeight = 22;
  const cardY = startY + 4;

  // Receitas Card
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(34, 197, 94);
  doc.roundedRect(14, cardY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(22, 101, 52);
  doc.text('TOTAL RECEITAS', 18, cardY + 7);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(summary.totalIncome), 18, cardY + 16);

  // Despesas Card
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(239, 68, 68);
  doc.roundedRect(76, cardY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(153, 27, 27);
  doc.text('TOTAL DESPESAS', 80, cardY + 7);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(summary.totalExpenses), 80, cardY + 16);

  // Saldo Líquido Card
  const netBg = summary.netBalance >= 0 ? [239, 246, 255] : [255, 241, 242];
  const netBorder = summary.netBalance >= 0 ? [59, 130, 246] : [244, 63, 94];
  const netText = summary.netBalance >= 0 ? [30, 58, 138] : [159, 18, 57];
  doc.setFillColor(netBg[0], netBg[1], netBg[2]);
  doc.setDrawColor(netBorder[0], netBorder[1], netBorder[2]);
  doc.roundedRect(138, cardY, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(netText[0], netText[1], netText[2]);
  doc.text('SALDO LÍQUIDO', 142, cardY + 7);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(summary.netBalance), 142, cardY + 16);

  // Table Data
  const tableData = transactions.map((tx) => [
    formatDate(tx.date),
    tx.description,
    categoryMap.get(tx.categoryId) || '-',
    accountMap.get(tx.accountId) || '-',
    memberMap.get(tx.memberId) || '-',
    tx.type,
    tx.status,
    formatCurrency(tx.amount),
  ]);

  autoTable(doc, {
    startY: cardY + cardHeight + 10,
    head: [['Data', 'Descrição', 'Categoria', 'Conta', 'Membro', 'Tipo', 'Status', 'Valor']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 42 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 18 },
      6: { cellWidth: 18 },
      7: { cellWidth: 22, halign: 'right' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        if (data.cell.raw === 'Receita') {
          data.cell.styles.textColor = [16, 185, 129];
        } else {
          data.cell.styles.textColor = [239, 68, 68];
        }
      }
      if (data.section === 'body' && data.column.index === 6) {
        if (data.cell.raw === 'Pago') {
          data.cell.styles.textColor = [16, 185, 129];
        } else {
          data.cell.styles.textColor = [245, 158, 11];
        }
      }
    },
  });

  doc.save(`relatorio_financeiro_${new Date().toISOString().split('T')[0]}.pdf`);
};
