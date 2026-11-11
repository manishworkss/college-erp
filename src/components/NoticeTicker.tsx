'use client';

import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

interface NoticeItem {
  id: string;
  title: string;
  category: string;
  publishedAt: string;
}

export default function NoticeTicker() {
  const [latestNotice, setLatestNotice] = useState<NoticeItem | null>(null);

  useEffect(() => {
    fetch('/api/notices')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
          setLatestNotice(json.data[0]);
        }
      })
      .catch(() => {
        // Fallback banner remains visible when database is empty or initializing
      });
  }, []);

  return (
    <div className="mb-8 bg-[#FFF8F0] border border-[#800000]/20 rounded-xl p-3 flex items-center gap-3 shadow-xs">
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#800000] text-white text-[11px] font-bold shrink-0">
        <Bell className="w-3.5 h-3.5 text-[#D4AF37]" />
        {latestNotice ? latestNotice.category : 'Notice'}
      </span>
      <p className="text-xs sm:text-sm text-slate-700 font-medium truncate">
        {latestNotice
          ? latestNotice.title
          : 'UG Semester 1 (Batch 2026–2030) Online Admission & CBCS Subject Selection is active.'}
      </p>
    </div>
  );
}

