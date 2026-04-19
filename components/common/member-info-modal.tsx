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
          СЭЗИС-ийн дэргэдэх Эдийн засагчдын клуб нь хичээлийн жилийн намар, хаврын улиралд нэгдсэн элсэлтийн журмаар шинэ гишүүдээ авдаг. Та тухайн элсэлтийн хугацаанд бүртгүүлснээр клубийн гишүүн болох боломжтой. Гишүүнчлэл нь эдийн засгийн бакалаврын хөтөлбөрийн оюутнуудад нээлттэй.
        </p>
      </div>
    </div>
  );
}
