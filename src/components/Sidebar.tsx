/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useErp } from '../store/erpStore';
import {
  Compass,
  Users,
  GraduationCap,
  CalendarCheck,
  CheckSquare,
  DollarSign,
  Shield,
  ChevronsUpDown,
  Menu,
  X,
  PlusCircle,
  Building,
  Lock
} from 'lucide-react';

interface SidebarProps {
  currentModule: string;
  setModule: (module: string) => void;
  onOpenOrgModal: () => void;
}

export default function Sidebar({ currentModule, setModule, onOpenOrgModal }: SidebarProps) {
  const {
    tenants,
    currentTenantId,
    switchTenant,
    currentUser
  } = useErp();

  const [isTenantDropdownOpen, setIsTenantDropdownOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Tenant password challenge states
  const [challengeTenantId, setChallengeTenantId] = useState<string | null>(null);
  const [challengePassword, setChallengePassword] = useState('');
  const [challengeError, setChallengeError] = useState('');

  // Get current active tenant details
  const activeTenant = tenants.find(t => t.id === currentTenantId) || tenants[0];

  // Define sidebar items with roles restrictions
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <Compass className="w-5 h-5" />, roles: [] },
    { id: 'employees', name: 'Employees', icon: <Users className="w-5 h-5" />, roles: ['SUPER_ADMIN', 'ORG_OWNER', 'BRANCH_MANAGER', 'HR_ADMIN'] },
    { id: 'trainers', name: 'Trainers Desk', icon: <GraduationCap className="w-5 h-5" />, roles: ['SUPER_ADMIN', 'ORG_OWNER', 'BRANCH_MANAGER', 'TRAINER'] },
    { id: 'students', name: 'Students', icon: <GraduationCap className="w-5 h-5" />, roles: ['SUPER_ADMIN', 'ORG_OWNER', 'BRANCH_MANAGER', 'HR_ADMIN', 'FINANCE_OFFICER'] },
    { id: 'attendance', name: 'Attendance', icon: <CalendarCheck className="w-5 h-5" />, roles: [] },
    { id: 'tasks', name: 'Tasks Board', icon: <CheckSquare className="w-5 h-5" />, roles: [] },
    { id: 'finance', name: 'Finance Ledger', icon: <DollarSign className="w-5 h-5" />, roles: ['SUPER_ADMIN', 'ORG_OWNER', 'FINANCE_OFFICER'] },
    { id: 'superadmin', name: 'Super Admin', icon: <Shield className="w-5 h-5" />, roles: ['SUPER_ADMIN'] }
  ];

  const allowedMenuItems = menuItems.filter(item => {
    if (item.roles.length === 0) return true;
    return item.roles.includes(currentUser.role);
  });

  const handleTenantSwitch = (id: string) => {
    if (id === currentTenantId) {
      setIsTenantDropdownOpen(false);
      return;
    }
    setChallengeTenantId(id);
    setChallengePassword('');
    setChallengeError('');
    setIsTenantDropdownOpen(false);
  };

  const handleVerifyTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeTenantId) return;

    const targetTenant = tenants.find(t => t.id === challengeTenantId);
    if (!targetTenant) return;

    const correctPassword = targetTenant.password || 'password123';
    if (challengePassword === correctPassword) {
      switchTenant(challengeTenantId);
      setChallengeTenantId(null);
      setChallengePassword('');
      setChallengeError('');
    } else {
      setChallengeError('Invalid master workspace password. Please try again.');
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-3 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs text-zinc-700 dark:text-zinc-300 focus:outline-hidden hover:bg-zinc-50 dark:hover:bg-zinc-800"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Layout */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col transform transition-transform duration-300 md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand/Organization Switcher */}
        <div className="relative p-4 border-b border-zinc-100 dark:border-zinc-900">
          <button
            onClick={() => setIsTenantDropdownOpen(!isTenantDropdownOpen)}
            className="w-full flex items-center justify-between gap-2.5 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 text-left transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex-shrink-0 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                {activeTenant.logoUrl ? (
                  <img src={activeTenant.logoUrl} alt={activeTenant.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Building className="w-4 h-4 text-zinc-500" />
                )}
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                  {activeTenant.name}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium truncate">
                  {activeTenant.businessType}
                </p>
              </div>
            </div>
            <ChevronsUpDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
          </button>

          {/* Org Switcher Popover Dropdown */}
          {isTenantDropdownOpen && (
            <div className="absolute left-4 right-4 top-[70px] z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1.5 duration-150">
              <div className="p-1.5 max-h-56 overflow-y-auto space-y-0.5">
                {tenants.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTenantSwitch(t.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition-colors cursor-pointer ${
                      t.id === currentTenantId
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 hover:text-zinc-900'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                      {t.logoUrl ? (
                        <img src={t.logoUrl} alt={t.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <Building className="w-3 h-3 text-zinc-400" />
                      )}
                    </div>
                    <span className="truncate flex-grow">{t.name}</span>
                    {t.id === currentTenantId && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </button>
                ))}
              </div>
              <div className="p-1.5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30">
                <button
                  onClick={() => {
                    onOpenOrgModal();
                    setIsTenantDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Register New Tenant
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Nav items */}
        <div className="flex-grow overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 mb-2 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase">
            Platform Modules
          </p>
          {allowedMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setModule(item.id);
                setIsMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all cursor-pointer ${
                currentModule === item.id
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-950 dark:hover:text-zinc-50'
              }`}
            >
              <span className={`transition-colors ${currentModule === item.id ? 'text-inherit' : 'text-zinc-400 dark:text-zinc-500'}`}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>

        {/* User Identity / Scope Info footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20 text-center">
          <div className="flex items-center gap-2.5 text-left p-1 rounded-lg">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-xs font-semibold text-zinc-500">{currentUser.fullName[0]}</span>
              )}
            </div>
            <div className="min-w-0 flex-grow">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {currentUser.fullName}
              </p>
              <span className="inline-block px-1.5 py-0.5 bg-zinc-200/80 dark:bg-zinc-800 text-[9px] font-semibold text-zinc-600 dark:text-zinc-400 rounded-sm uppercase tracking-wide">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile background overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/20 dark:bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Workspace Password challenge modal */}
      {challengeTenantId && (() => {
        const targetTenant = tenants.find(t => t.id === challengeTenantId);
        if (!targetTenant) return null;
        return (
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center space-y-3 pb-2">
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-500">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    Workspace Security Lock
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                    Entering <span className="font-semibold text-zinc-800 dark:text-zinc-200">{targetTenant.name}</span> context. Please authenticate.
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerifyTenant} className="space-y-4 pt-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Organization Master Password
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

                <div className="bg-zinc-50 dark:bg-zinc-850/50 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
                  <p className="text-[9px] text-zinc-400 dark:text-zinc-500 leading-normal">
                    💡 <span className="font-semibold">Mock Reminder:</span> Default passwords are <span className="font-semibold text-indigo-500 font-mono">vogue123</span> for Vogue, <span className="font-semibold text-indigo-500 font-mono">elite123</span> for Elite, and <span className="font-semibold text-indigo-500 font-mono">alpha123</span> for Alpha.
                  </p>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setChallengeTenantId(null)}
                    className="flex-grow py-2 text-xs font-bold border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-grow py-2 text-xs font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                  >
                    Authorize Switch
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </>
  );
}
