/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useErp } from '../store/erpStore';
import {
  Bell,
  Search,
  Sun,
  Moon,
  Building,
  UserCheck,
  Check,
  ChevronDown,
  Lock
} from 'lucide-react';

interface HeaderProps {
  onOpenCommandPalette: () => void;
}

export default function Header({ onOpenCommandPalette }: HeaderProps) {
  const {
    branches,
    users,
    currentTenantId,
    currentBranchId,
    switchBranch,
    currentUser,
    switchUser,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    theme,
    setTheme
  } = useErp();

  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);

  // User switcher challenge states
  const [challengeUserId, setChallengeUserId] = useState<string | null>(null);
  const [challengePassword, setChallengePassword] = useState('');
  const [challengeError, setChallengeError] = useState('');

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onOpenCommandPalette();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [onOpenCommandPalette]);

  const handleUserClick = (u: any) => {
    if (u.id === currentUser.id) {
      setIsUserSwitcherOpen(false);
      return;
    }
    // SUPER_ADMIN doesn't require a password
    if (u.role === 'SUPER_ADMIN') {
      switchUser(u.id);
      setIsUserSwitcherOpen(false);
    } else {
      setChallengeUserId(u.id);
      setChallengePassword('');
      setChallengeError('');
      setIsUserSwitcherOpen(false);
    }
  };

  const handleVerifyUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeUserId) return;

    const targetUser = users.find(u => u.id === challengeUserId);
    if (!targetUser) return;

    if (targetUser.role === 'TRAINER') {
      const correctPassword = targetUser.password || 'trainer123';
      if (challengePassword === correctPassword) {
        switchUser(challengeUserId);
        setChallengeUserId(null);
        setChallengePassword('');
        setChallengeError('');
      } else {
        setChallengeError('Invalid trainer login password. Please try again.');
      }
    } else {
      const targetTenant = useErp().tenants.find(t => t.id === targetUser.organizationId);
      const correctPassword = targetTenant?.password || 'password123';
      if (challengePassword === correctPassword) {
        switchUser(challengeUserId);
        setChallengeUserId(null);
        setChallengePassword('');
        setChallengeError('');
      } else {
        setChallengeError('Invalid organization master password. Please try again.');
      }
    }
  };
  // Filter branches and users for current organization context
  const tenantBranches = branches.filter(b => b.organizationId === currentTenantId);
  const tenantUsers = users.filter(u => u.organizationId === currentTenantId || u.role === 'SUPER_ADMIN');

  const activeBranch = tenantBranches.find(b => b.id === currentBranchId) || tenantBranches[0];
  const unreadNotifs = notifications.filter(n => !n.isRead && n.organizationId === currentTenantId);

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      
      {/* Branch Selector (Left side) */}
      <div className="flex items-center gap-3 pl-10 md:pl-0">
        {activeBranch ? (
          <div className="relative">
            <button
              onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all cursor-pointer"
            >
              <Building className="w-3.5 h-3.5 text-zinc-400" />
              <span>{activeBranch.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {isBranchDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1.5 duration-150">
                <div className="p-1.5 space-y-0.5">
                  <p className="px-2.5 py-1 text-[10px] font-semibold text-zinc-400 tracking-wider uppercase">
                    Select Branch
                  </p>
                  {tenantBranches.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        switchBranch(b.id);
                        setIsBranchDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs font-medium transition-colors cursor-pointer ${
                        b.id === currentBranchId
                          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 hover:text-zinc-900'
                      }`}
                    >
                      <span className="truncate">{b.name}</span>
                      {b.id === currentBranchId && (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs font-medium text-zinc-400">Standard Branch</div>
        )}
      </div>

      {/* Global Controls & Tools (Right side) */}
      <div className="flex items-center gap-2.5">
        
        {/* Command Search Bar Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 w-52 text-left bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer"
        >
          <Search className="w-4 h-4 text-zinc-400 flex-shrink-0" />
          <span className="flex-grow truncate">Search dashboard...</span>
          <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-sm">
            ⌘K
          </kbd>
        </button>

        {/* Dynamic User Switcher Tool (Highlighting permissions) */}
        <div className="relative">
          <button
            onClick={() => setIsUserSwitcherOpen(!isUserSwitcherOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40 transition-all cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Acting: {currentUser.role.replace('_', ' ')}</span>
            <ChevronDown className="w-3.5 h-3.5 text-emerald-500" />
          </button>

          {isUserSwitcherOpen && (
            <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1.5 duration-150">
              <div className="p-1.5 max-h-80 overflow-y-auto space-y-0.5">
                <div className="p-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 mb-1 rounded-lg">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                    Evaluate Roles Engine
                  </p>
                  <p className="text-[9px] text-zinc-500 dark:text-zinc-400 leading-normal mt-0.5">
                    Click any mock user to switch role permissions instantly.
                  </p>
                </div>
                {tenantUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleUserClick(u)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition-colors cursor-pointer ${
                      u.id === currentUser.id
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 hover:text-zinc-900'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex-shrink-0">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-[9px] font-bold text-zinc-500 flex items-center justify-center h-full">{u.fullName[0]}</span>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="truncate text-[11px] font-medium leading-tight">{u.fullName}</p>
                      <p className="text-[8px] text-zinc-400 uppercase tracking-wider">{u.role.replace('_', ' ')}</p>
                    </div>
                    {u.id === currentUser.id && (
                      <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggler */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors cursor-pointer"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 border-2 border-white dark:border-zinc-950 animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-1.5 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1.5 duration-150">
              <div className="flex items-center justify-between p-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Notifications ({unreadNotifs.length})
                </span>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60 p-1">
                {notifications.filter(n => n.organizationId === currentTenantId).length > 0 ? (
                  notifications
                    .filter(n => n.organizationId === currentTenantId)
                    .map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                          !n.isRead ? 'bg-zinc-50/80 dark:bg-zinc-800/30' : 'hover:bg-zinc-50/40 dark:hover:bg-zinc-800/10'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <p className={`text-xs ${!n.isRead ? 'font-semibold text-zinc-950 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}>
                            {n.title}
                          </p>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${
                            n.type === 'ALERT' ? 'bg-rose-500' : n.type === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'
                          }`} />
                        </div>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-normal">
                          {n.content}
                        </p>
                        <p className="text-[8px] text-zinc-400 dark:text-zinc-500 mt-1 font-mono">
                          {new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))
                ) : (
                  <div className="py-8 text-center text-xs text-zinc-400">
                    No notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Account Login Password verification modal */}
      {challengeUserId && (() => {
        const targetUser = users.find(u => u.id === challengeUserId);
        if (!targetUser) return null;
        const isTrainer = targetUser.role === 'TRAINER';
        return (
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200 text-zinc-800 dark:text-zinc-200">
              <div className="flex flex-col items-center text-center space-y-3 pb-2">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-500">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    {isTrainer ? 'Trainer Authentication' : 'Organization Secure Log'}
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                    Swapping active session to <span className="font-semibold text-zinc-800 dark:text-zinc-200">{targetUser.fullName}</span>.
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerifyUser} className="space-y-4 pt-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    {isTrainer ? 'Enter Trainer Password' : 'Enter Organization Master Password'}
                  </label>
                  <input
                    type="password"
                    value={challengePassword}
                    onChange={(e) => setChallengePassword(e.target.value)}
                    required
                    autoFocus
                    placeholder="••••••••"
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  />
                  {challengeError && (
                    <p className="text-[10px] text-rose-500 font-semibold mt-1.5">
                      {challengeError}
                    </p>
                  )}
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-850/50 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60 text-left">
                  <p className="text-[9px] text-zinc-400 dark:text-zinc-500 leading-normal">
                    💡 <span className="font-semibold">Mock Reminder:</span><br />
                    {isTrainer ? (
                      <>
                        • Chloe Dupree (Trainer): <span className="font-mono font-semibold text-indigo-500">chloe123</span><br />
                        • Jonah Sterling (Trainer): <span className="font-mono font-semibold text-indigo-500">jonah123</span>
                      </>
                    ) : (
                      <>
                        • Vogue Academy Staff: <span className="font-mono font-semibold text-indigo-500">vogue123</span><br />
                        • Elite Salon Staff: <span className="font-mono font-semibold text-indigo-500">elite123</span><br />
                        • Alpha Barber Staff: <span className="font-mono font-semibold text-indigo-500">alpha123</span>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setChallengeUserId(null)}
                    className="flex-grow py-2 text-xs font-bold border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-grow py-2 text-xs font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                  >
                    Authenticate Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

    </header>
  );
}
