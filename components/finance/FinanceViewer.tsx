'use client';

import { ReactNode, useMemo } from 'react';
import {
  FinanceEntry,
  FinanceEntryType,
  FinanceStatus,
  FinanceSummary,
} from '@/lib/types';
import { Wallet } from 'lucide-react';

interface FinanceViewerProps {
  summary: FinanceSummary;
  entries: FinanceEntry[];
  contributionRows: Array<{ name: string; amount: number }>;
  loading: boolean;
  isFinanceEditor: boolean;
  onStatusChange: (entryId: string, status: FinanceStatus) => void;
  canManageEntry: (entry: FinanceEntry) => boolean;
  editor?: ReactNode;
  error?: string | null;
}

const typeLabels: Record<FinanceEntryType, string> = {
  [FinanceEntryType.BUDGET]: 'Төсөв',
  [FinanceEntryType.INCOME]: 'Орлого',
  [FinanceEntryType.EXPENSE]: 'Зардал',
};

const statusLabels: Record<FinanceStatus, string> = {
  [FinanceStatus.PENDING]: 'Хүлээгдэж байна',
  [FinanceStatus.APPROVED]: 'Батлагдсан',
  [FinanceStatus.PAID]: 'Төлөгдсөн',
  [FinanceStatus.CANCELLED]: 'Цуцлагдсан',
};

const statusColors: Record<FinanceStatus, string> = {
  [FinanceStatus.PENDING]: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  [FinanceStatus.APPROVED]: 'bg-blue-50 border-blue-200 text-blue-700',
  [FinanceStatus.PAID]: 'bg-green-50 border-green-200 text-green-700',
  [FinanceStatus.CANCELLED]: 'bg-red-50 border-red-200 text-red-700',
};

const formatMNT = (value: number) => {
  return new Intl.NumberFormat('mn-MN', {
    style: 'currency',
    currency: 'MNT',
    maximumFractionDigits: 0,
  }).format(value);
};

export function FinanceViewer({
  summary,
  entries,
  contributionRows,
  loading,
  isFinanceEditor,
  onStatusChange,
  canManageEntry,
  editor,
  error,
}: FinanceViewerProps) {
  const summaryCards = useMemo(
    () => [
      {
        label: 'Төсөв',
        value: summary.totalBudget,
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-700',
      },
      {
        label: 'Орлого',
        value: summary.totalIncome,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-700',
      },
      {
        label: 'Зардал',
        value: summary.totalExpense,
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-700',
      },
      {
        label: 'Үлдэгдэл',
        value: summary.balance,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700',
      },
    ],
    [summary]
  );

  return (
    <section className="premium-card p-6">
      <div className="mb-6 flex items-center gap-2">
        <Wallet className="h-5 w-5 text-brand" />
        <h2 className="text-lg font-bold text-gray-900">Санхүүгийн мэдээлэл</h2>
        {isFinanceEditor && <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">Засварлах эрхтэй</span>}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {editor && <div className="mb-6">{editor}</div>}

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-lg border px-3 py-3 ${card.bgColor} ${card.borderColor}`}
          >
            <p className={`text-xs font-medium ${card.textColor}`}>{card.label}</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{formatMNT(card.value)}</p>
          </div>
        ))}
      </div>
      <p className="mb-6 text-xs text-gray-500">Цуцлагдсан мөрүүд дүнгийн тооцоонд орохгүй.</p>

      {/* Contribution Table */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Хандивлагчид (Орлогоор)</h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="border-b border-gray-200 px-4 py-2 text-left font-semibold text-gray-700">Хүний нэр</th>
                <th className="border-b border-gray-200 px-4 py-2 text-right font-semibold text-gray-700">Дүн (MNT)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={2} className="px-4 py-4 text-center text-sm text-gray-500">
                    Уншиж байна...
                  </td>
                </tr>
              ) : contributionRows.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-4 text-center text-sm text-gray-500">
                    Хандивын мэдээлэл алга.
                  </td>
                </tr>
              ) : (
                contributionRows.map((row, idx) => (
                  <tr key={row.name} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border-b border-gray-100 px-4 py-2 font-medium text-gray-900">{row.name}</td>
                    <td className="border-b border-gray-100 px-4 py-2 text-right font-semibold text-brand">
                      {formatMNT(row.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Finance Entries Table */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Бүх санхүүгийн мөрүүд</h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">Зүйл</th>
                <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">Төрөл</th>
                <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">Дүн</th>
                <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">Эх үүсвэр</th>
                <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">Хариуцагч</th>
                <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-700">Төлөв</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-gray-500">
                    Уншиж байна...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-gray-500">
                    Одоогоор санхүүгийн мэдээлэл алга.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="border-b border-gray-100 px-3 py-2">
                      <div className="font-medium text-gray-900">{entry.title}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(entry.transactionDate).toLocaleDateString('mn-MN')}
                      </div>
                      {entry.notes && (
                        <div className="mt-1 text-xs text-gray-600 italic">{entry.notes}</div>
                      )}
                    </td>
                    <td className="border-b border-gray-100 px-3 py-2">
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                        {typeLabels[entry.type]}
                      </span>
                    </td>
                    <td className="border-b border-gray-100 px-3 py-2 font-semibold text-gray-900">
                      {formatMNT(Number(entry.amount))}
                    </td>
                    <td className="border-b border-gray-100 px-3 py-2 text-xs">
                      <div className="text-gray-900">{entry.source || '-'}</div>
                      <div className="text-gray-500">{entry.purpose || '-'}</div>
                    </td>
                    <td className="border-b border-gray-100 px-3 py-2 text-xs">
                      <div className="font-medium text-gray-900">{entry.manager?.name || entry.manager?.email || 'N/A'}</div>
                      <div className="text-gray-500">Ашигласан: {entry.usedBy || '-'}</div>
                    </td>
                    <td className="border-b border-gray-100 px-3 py-2">
                      {canManageEntry(entry) ? (
                        <select
                          value={entry.status}
                          onChange={(e) => onStatusChange(entry.id, e.target.value as FinanceStatus)}
                          className={`rounded-md border px-2 py-1 text-xs font-medium cursor-pointer ${statusColors[entry.status]}`}
                        >
                          {Object.values(FinanceStatus).map((value) => (
                            <option key={value} value={value}>
                              {statusLabels[value]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-block rounded-md border px-2 py-1 text-xs font-medium ${statusColors[entry.status]}`}>
                          {statusLabels[entry.status]}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
