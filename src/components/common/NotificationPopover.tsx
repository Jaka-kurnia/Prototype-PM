import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Clock, 
  DollarSign, 
  Briefcase, 
  Trash2, 
  X, 
  ExternalLink,
  Layers
} from 'lucide-react';

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const { notifications, markNotificationAsRead, clearAllNotifications } = useApp();
  const [activeFilter, setActiveFilter] = useState<'all' | 'finance' | 'crm'>('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    markNotificationAsRead(notif.id);
    if (onNavigateTab) {
      if (notif.type === 'finance') {
        onNavigateTab('finance');
        onClose();
      } else if (notif.type === 'crm') {
        onNavigateTab('crm');
        onClose();
      }
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-zinc-200/90 shadow-2xl z-50 overflow-hidden font-sans text-zinc-900 animate-in fade-in duration-150">
      
      {/* Popover Header */}
      <div className="p-4 pb-3 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-zinc-900">
            Pusat Notifikasi Terpadu
          </h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white">
              {unreadCount} baru
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="p-1 text-zinc-400 hover:text-rose-600 rounded-md transition-colors"
              title="Bersihkan semua notifikasi"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs (All / Finance / CRM) */}
      <div className="flex border-b border-zinc-100 bg-zinc-50/70 p-1 gap-1 text-[11px] font-medium">
        <button
          onClick={() => setActiveFilter('all')}
          className={`flex-1 py-1 rounded-lg transition-all text-center ${
            activeFilter === 'all'
              ? 'bg-white text-zinc-900 shadow-2xs font-bold'
              : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          Semua ({notifications.length})
        </button>

        <button
          onClick={() => setActiveFilter('finance')}
          className={`flex-1 py-1 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
            activeFilter === 'finance'
              ? 'bg-white text-emerald-800 shadow-2xs font-bold'
              : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <DollarSign className="w-3 h-3 text-emerald-600" />
          <span>Finance ({notifications.filter((n) => n.type === 'finance').length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('crm')}
          className={`flex-1 py-1 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
            activeFilter === 'crm'
              ? 'bg-white text-blue-800 shadow-2xs font-bold'
              : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          <Briefcase className="w-3 h-3 text-blue-600" />
          <span>CRM ({notifications.filter((n) => n.type === 'crm').length})</span>
        </button>
      </div>

      {/* Notification List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 space-y-1">
            <Bell className="w-6 h-6 mx-auto text-zinc-300" />
            <p className="text-xs">Tidak ada notifikasi saat ini.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isFinance = notif.type === 'finance';
            const isCrm = notif.type === 'crm';

            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 hover:bg-zinc-50/80 transition-colors cursor-pointer text-xs space-y-1.5 relative ${
                  !notif.isRead ? 'bg-indigo-50/20' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isFinance
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : isCrm
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                  }`}>
                    {isFinance ? <DollarSign className="w-2.5 h-2.5" /> : <Briefcase className="w-2.5 h-2.5" />}
                    <span>{isFinance ? 'Finance' : isCrm ? 'CRM Pipeline' : 'Sistem'}</span>
                  </span>

                  <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{new Date(notif.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                </div>

                <div className={`font-semibold leading-snug ${!notif.isRead ? 'text-zinc-900 font-bold' : 'text-zinc-700'}`}>
                  {notif.title}
                </div>

                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  {notif.message}
                </p>

                <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-400">
                  <span className="text-indigo-600 hover:underline flex items-center gap-0.5">
                    <span>Lihat di modul {isFinance ? 'Finance' : 'CRM'}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>

                  {!notif.isRead ? (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" title="Belum dibaca" />
                  ) : (
                    <span className="text-zinc-400">Dibaca</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-zinc-50 border-t border-zinc-100 text-[10px] text-zinc-500 text-center">
        Setiap pembuatan invoice termin otomatis mengirim notifikasi ke Finance dan CRM.
      </div>
    </div>
  );
};
