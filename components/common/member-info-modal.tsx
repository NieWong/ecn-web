'use client';

import { X } from 'lucide-react';

interface MemberInfoModalProps {
  open: boolean;
  onClose: () => void;
}

export function MemberInfoModal({ open, onClose }: MemberInfoModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-xl font-bold text-gray-900">Гишүүн элсэлт</h3>
        <p className="mt-4 text-sm leading-relaxed text-gray-700">
          The Economics Club under the University of Finance and Economics accepts new members through a unified recruitment process conducted in both the fall and spring semesters of each academic year. You can register during this recruitment period to become a member. Membership is only available to students enrolled in the undergraduate economics program.
        </p>
      </div>
    </div>
  );
}
