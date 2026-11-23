// Slot for planned-maintenance notices (NFR-AVA-01). Set VITE_MAINTENANCE_NOTICE at build time to show one,
// for example: "Saturday 02:00-03:00 Beirut time: bookings are paused for maintenance."
// A visitor can dismiss it for this visit.
import { useState } from 'react';

const notice = import.meta.env.VITE_MAINTENANCE_NOTICE;

export default function MaintenanceBanner() {
  const [open, setOpen] = useState(Boolean(notice));
  if (!open) return null;
  return (
    <div role="status" className="border-b border-warning-600/30 bg-warning-50 text-warning-700">
      <div className="container-page flex items-center gap-3 py-2 text-sm">
        <span aria-hidden="true" className="font-semibold">!</span>
        <p className="flex-1">{notice}</p>
        <button type="button" onClick={() => setOpen(false)} className="text-xs font-medium uppercase tracking-[0.18em] hover:underline">
          Dismiss
        </button>
      </div>
    </div>
  );
}
