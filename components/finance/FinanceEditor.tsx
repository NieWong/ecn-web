'use client';

import { useState } from 'react';
import { CreateFinanceEntryRequest, FinanceEntryType, FinanceStatus, User } from '@/lib/types';
import { Plus, X } from 'lucide-react';

interface FinanceEditorProps {
  onSubmit: (entry: CreateFinanceEntryRequest) => Promise<void>;
  managers: User[];
  isAdmin: boolean;
  error: string | null;
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

type FormState = Omit<CreateFinanceEntryRequest, 'amount'> & { amount: string };

const createEmptyForm = (): FormState => ({
  title: '',
  type: FinanceEntryType.BUDGET,
  amount: '',
  source: '',
  purpose: '',
  usedBy: '',
  status: FinanceStatus.PENDING,
  transactionDate: new Date().toISOString().slice(0, 10),
  managerId: null,
  notes: '',
});

export function FinanceEditor({
  onSubmit,
  managers,
  isAdmin,
  error,
}: FinanceEditorProps) {
  const [form, setForm] = useState<FormState>(createEmptyForm());
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);

      await onSubmit({
        ...form,
        amount: Number(form.amount.trim()),
        managerId: form.managerId || null,
        source: form.source || null,
        purpose: form.purpose || null,
        usedBy: form.usedBy || null,
        notes: form.notes || null,
      });

      setForm(createEmptyForm());
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const inputClasses = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-transparent transition-all';

  return (
    <div className="rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-50/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Санхүүгийн мөр нэмэх</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
            showForm
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-brand text-white hover:bg-brand-dark'
          }`}
        >
          {showForm ? (
            <>
              <X className="h-4 w-4" />
              Хэвлэх
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Нэмэх
            </>
          )}
        </button>
      </div>

      {error && !showForm && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAddEntry} className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Title */}
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Зүйл (жишээ: Хандив)"
              className={inputClasses}
              required
            />

            {/* Amount */}
            <input
              type="text"
              inputMode="numeric"
              value={form.amount}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
              placeholder="Дүн (MNT)"
              className={inputClasses}
              required
            />

            {/* Type */}
            <select
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as FinanceEntryType }))}
              className={inputClasses}
            >
              {Object.values(FinanceEntryType).map((value) => (
                <option key={value} value={value}>
                  {typeLabels[value]}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as FinanceStatus }))}
              className={inputClasses}
            >
              {Object.values(FinanceStatus).map((value) => (
                <option key={value} value={value}>
                  {statusLabels[value]}
                </option>
              ))}
            </select>

            {/* Transaction Date */}
            <input
              type="date"
              value={form.transactionDate}
              onChange={(e) => setForm((prev) => ({ ...prev, transactionDate: e.target.value }))}
              className={inputClasses}
              required
            />

            {/* Manager (Admin only) */}
            {isAdmin && (
              <select
                value={form.managerId || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, managerId: e.target.value || null }))}
                className={inputClasses}
              >
                <option value="">Менежер сонгоогүй</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name || manager.email}
                  </option>
                ))}
              </select>
            )}

            {/* Source */}
            <input
              value={form.source || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))}
              placeholder="Орлогын эх үүсвэр"
              className={inputClasses}
            />

            {/* Purpose */}
            <input
              value={form.purpose || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, purpose: e.target.value }))}
              placeholder="Юунд зарцуулалтай"
              className={inputClasses}
            />

            {/* Used By */}
            <input
              value={form.usedBy || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, usedBy: e.target.value }))}
              placeholder="Хэн ашигласан"
              className={inputClasses}
            />
          </div>

          {/* Notes */}
          <textarea
            value={form.notes || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Сануулга / Тэмдэглэл (сонголтой)"
            className={`${inputClasses} resize-none h-16`}
          />

          {/* Submit Button */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Хадгалж байна...' : 'Нэмэх'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Болих
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
