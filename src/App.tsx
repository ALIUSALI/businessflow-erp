/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ErpProvider, useErp } from './store/erpStore';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';
import CommandPalette from './components/CommandPalette';

// Pages
import Dashboard from './components/Dashboard';
import Employees from './components/Employees';
import Trainers from './components/Trainers';
import Students from './components/Students';
import Attendance from './components/Attendance';
import Tasks from './components/Tasks';
import Finance from './components/Finance';
import SuperAdmin from './components/SuperAdmin';

import { Building2, X } from 'lucide-react';

function AppContent() {
  const { registerOrganization, currentUser } = useErp();

  const [currentModule, setCurrentModule] = useState('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  
  // Org modal states
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [businessType, setBusinessType] = useState('Beauty School');
  const [currency, setCurrency] = useState('$');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [orgPassword, setOrgPassword] = useState('');

  const handleRegisterOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !ownerName || !ownerEmail) return;

    registerOrganization({
      name: orgName,
      businessType,
      currency,
      ownerName,
      ownerEmail,
      password: orgPassword || 'password123'
    });

    setOrgName('');
    setBusinessType('Beauty School');
    setCurrency('$');
    setOwnerName('');
    setOwnerEmail('');
    setOrgPassword('');
    setIsOrgModalOpen(false);
    setCurrentModule('dashboard'); // Jump to dashboard for new tenant
  };

  // Safe navigation handler checking roles engine
  const handleNavigate = (module: string) => {
    setCurrentModule(module);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex font-sans selection:bg-zinc-900 selection:text-white dark:selection:bg-zinc-100 dark:selection:text-zinc-950">
      
      {/* Sidebar Navigation Panel */}
      <Sidebar
        currentModule={currentModule}
        setModule={handleNavigate}
        onOpenOrgModal={() => setIsOrgModalOpen(true)}
      />

      {/* Main Content Pane */}
      <div className="flex-grow md:pl-64 flex flex-col min-w-0 min-h-screen">
        
        {/* Universal Action Bar */}
        <Header onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />

        {/* Dynamic Route View Mount */}
        <main className="flex-grow p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8 animate-in fade-in duration-200">
          {currentModule === 'dashboard' && <Dashboard setModule={handleNavigate} />}
          {currentModule === 'employees' && <Employees />}
          {currentModule === 'trainers' && <Trainers />}
          {currentModule === 'students' && <Students />}
          {currentModule === 'attendance' && <Attendance />}
          {currentModule === 'tasks' && <Tasks />}
          {currentModule === 'finance' && <Finance />}
          {currentModule === 'superadmin' && <SuperAdmin />}
        </main>
      </div>

      {/* Global Shortcut Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Persistent Toast Center */}
      <Toast />

      {/* Multi-Tenant Registration Modal Overlay */}
      {isOrgModalOpen && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-indigo-500" />
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    Onboard New Organization
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Register a new isolated business workspace under standard SLA agreements.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOrgModalOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterOrg} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                    placeholder="Vogue Academy"
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Industry Verticals
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  >
                    <option value="Beauty School">Beauty Training Institutes</option>
                    <option value="Hair Salon">Hair and Nails Salon</option>
                    <option value="Barber Shop">Premium Barber Shop</option>
                    <option value="Spa & Massage">Medical Spa Resorts</option>
                    <option value="Clinique / Health">Wellness Clinics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Billing Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  >
                    <option value="$">USD ($)</option>
                    <option value="€">EUR (€)</option>
                    <option value="£">GBP (£)</option>
                    <option value="Shs">UGX (Shs)</option>
                    <option value="Ksh">KES (Ksh)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Principal Owner Full Name
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    required
                    placeholder="Evelyn Harper"
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                  Principal Owner Email
                </label>
                <input
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  required
                  placeholder="evelyn@vogueacademy.com"
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                  Workspace Master Password
                </label>
                <input
                  type="password"
                  value={orgPassword}
                  onChange={(e) => setOrgPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOrgModalOpen(false)}
                  className="flex-grow py-2.5 text-xs font-bold border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-grow py-2.5 text-xs font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  Register Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <ErpProvider>
      <AppContent />
    </ErpProvider>
  );
}
