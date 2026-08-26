import React from 'react';
import { Bell, Sparkles, Award, Users, CheckCircle2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

interface NotificationPanelProps {
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const { notifications, markNotificationRead } = useApp();
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case 'adaptive':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'success':
        return <Award className="w-4 h-4 text-emerald-500" />;
      case 'info':
        return <Users className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-sm">Notifications & AI Signal Logs</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-sm">No new notifications</div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationRead(notif.id);
                if (notif.actionUrl) navigate(notif.actionUrl);
                onClose();
              }}
              className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                !notif.read ? 'bg-indigo-50/40' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-semibold text-slate-900 truncate">{notif.title}</h4>
                  <span className="text-[10px] text-slate-400 shrink-0">{notif.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
        <span className="text-[11px] font-medium text-indigo-600 hover:underline cursor-pointer">
          All notifications logged in real-time by PathFinder Adaptive AI Engine
        </span>
      </div>
    </div>
  );
};
