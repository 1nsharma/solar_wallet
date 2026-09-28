import React, { useState } from 'react';
import {
  Bell, X, Check, AlertTriangle, Zap, Sun, ShieldCheck,
  TrendingDown, CheckCircle2, Clock, Trash2, ExternalLink
} from 'lucide-react';
import { sounds } from '../utils/audio';
import type { Language } from '../utils/i18n';
import type { Screen } from '../App';

export interface AppNotification {
  id: string;
  type: 'alert' | 'solar' | 'wallet' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionScreen?: Screen;
  actionLabel?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  isDark: boolean;
  onNavigate: (screen: Screen) => void;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-1',
    type: 'solar',
    title: '☀️ Daytime Peak Solar Tariff Active',
    message: 'Current unit rate is slashed to ₹6.50/kWh (36% cheaper than DISCOM grid tariff of ₹10.20/kWh). Optimal time to run heavy appliances.',
    time: '5 mins ago',
    read: false,
    actionScreen: 'consumer',
    actionLabel: 'View Live Rate',
  },
  {
    id: 'n-2',
    type: 'wallet',
    title: '⚡ Micro-Prepaid Auto-Deduction',
    message: '0.33 kWh consumed between 14:00 - 14:30. ₹2.15 deducted from Flat 101 wallet. Current balance: ₹345.50.',
    time: '35 mins ago',
    read: false,
    actionScreen: 'wallet',
    actionLabel: 'View Wallet',
  },
  {
    id: 'n-3',
    type: 'alert',
    title: '🛡️ PZEM Relay Safe-Current Limit OK',
    message: 'Grid load tested at 1.8kW. Automatic overload protection threshold calibrated at 3.2kW (NABL Class 1.0 verified).',
    time: '2 hours ago',
    read: true,
    actionScreen: 'telemetry',
    actionLabel: 'IoT Telemetry',
  },
  {
    id: 'n-4',
    type: 'system',
    title: '📜 Section 43A Non-Commercial Audit Signed',
    message: 'Microgrid peer-to-peer sharing certificate auto-renewed for Rooftop Array 5kW. Valid under Indian Electricity Act 2003.',
    time: '5 hours ago',
    read: true,
    actionScreen: 'setup',
    actionLabel: 'Legal Audit',
  },
];

export default function NotificationCenter({
  isOpen,
  onClose,
  lang,
  isDark,
  onNavigate,
}: Props) {
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'alert' | 'solar' | 'wallet'>('all');

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    sounds.playClick();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    sounds.playClick();
    setNotifications([]);
  };

  const handleNotificationClick = (n: AppNotification) => {
    sounds.playClick();
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
    if (n.actionScreen) {
      onNavigate(n.actionScreen);
      onClose();
    }
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => { sounds.playClick(); onClose(); }}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className={`w-screen max-w-md ${
          isDark ? 'bg-slate-900 border-l border-slate-800 text-white' : 'bg-white border-l border-slate-200 text-slate-900'
        } shadow-2xl flex flex-col animate-in`}>
          
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base tracking-tight">
                  {lang === 'hi' ? 'सूचनाएं एवं ग्रिड अलर्ट' : 'Notifications & Alerts'}
                </h3>
                <p className="text-xs text-slate-400">
                  {unreadCount > 0
                    ? `${unreadCount} ${lang === 'hi' ? 'अपठित अलर्ट' : 'unread notifications'}`
                    : lang === 'hi' ? 'सभी अलर्ट पढ़े जा चुके हैं' : 'All caught up!'}
                </p>
              </div>
            </div>

            <button
              onClick={() => { sounds.playClick(); onClose(); }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Row & Filter Pills */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex gap-1.5 overflow-x-auto">
                {(['all', 'solar', 'wallet', 'alert'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => { sounds.playClick(); setFilter(tab); }}
                    className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all ${
                      filter === tab
                        ? 'bg-emerald-600 text-white shadow-md'
                        : isDark
                        ? 'bg-slate-800 text-slate-400 hover:text-white'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    title="Mark all as read"
                    className="p-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{lang === 'hi' ? 'सभी पढ़े' : 'Read all'}</span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    title="Clear all"
                    className="p-1.5 text-xs text-rose-400 hover:text-rose-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-sm font-bold text-slate-400">
                  {lang === 'hi' ? 'कोई नई सूचना नहीं है' : 'No notifications in this category'}
                </p>
                <p className="text-xs text-slate-500">
                  {lang === 'hi' ? 'सिस्टम सामान्य रूप से चल रहा है।' : 'Solar microgrid is running smoothly.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer card-hover relative ${
                    !notification.read
                      ? isDark
                        ? 'bg-slate-800/80 border-emerald-500/40 shadow-lg'
                        : 'bg-emerald-50/70 border-emerald-300 shadow-md'
                      : isDark
                      ? 'bg-slate-900/60 border-slate-800/80 opacity-75'
                      : 'bg-white border-slate-200 opacity-75'
                  }`}
                >
                  {!notification.read && (
                    <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  )}

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-800/80 text-emerald-400 shrink-0 mt-0.5">
                      {notification.type === 'alert' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                      {notification.type === 'solar' && <Sun className="w-4 h-4 text-amber-400" />}
                      {notification.type === 'wallet' && <Zap className="w-4 h-4 text-emerald-400" />}
                      {notification.type === 'system' && <ShieldCheck className="w-4 h-4 text-cyan-400" />}
                    </div>

                    <div className="space-y-1 pr-4">
                      <h4 className="text-xs font-bold leading-snug">
                        {notification.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {notification.time}
                        </span>

                        {notification.actionLabel && (
                          <span className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                            {notification.actionLabel}
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-[11px] text-slate-500 font-mono">
              SOLARSYNC IOT NOTIFICATION AGENT • MQTT 1883
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
