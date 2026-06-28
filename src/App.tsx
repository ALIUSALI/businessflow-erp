/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ErpProvider, useErp } from './store/erpStore';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';
import CommandPalette from './components/CommandPalette';
import AiAssistant from './components/AiAssistant';
import ModuleSkeleton from './components/ModuleSkeleton';
import GettingStartedTour from './components/GettingStartedTour';
import { AnimatePresence } from 'motion/react';

// Pages
import Dashboard from './components/Dashboard';
import Employees from './components/Employees';
import Trainers from './components/Trainers';
import Students from './components/Students';
import Attendance from './components/Attendance';
import Tasks from './components/Tasks';
import Finance from './components/Finance';
import SuperAdmin from './components/SuperAdmin';

import { Building2, X, Check, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';

// Helper to auto-detect currency based on browser locale
const detectCurrencyFromLocale = (): { symbol: string; label: string } => {
  try {
    const languages = [
      ...(navigator.languages || []),
      navigator.language
    ].filter(Boolean).map(lang => lang.toLowerCase());

    for (const lang of languages) {
      // Uganda (UGX -> Shs)
      if (lang.includes('ug') || lang.includes('lg')) {
        return { symbol: 'Shs', label: 'UGX (Shs)' };
      }
      // Kenya (KES -> Ksh)
      if (lang.includes('ke') || lang.includes('sw')) {
        return { symbol: 'Ksh', label: 'KES (Ksh)' };
      }
      // United Kingdom / Great Britain (GBP -> £)
      if (lang.includes('gb') || lang.includes('en-gb')) {
        return { symbol: '£', label: 'GBP (£)' };
      }
      // Eurozone countries (EUR -> €)
      const euroCountriesAndLangs = [
        'de', 'fr', 'es', 'it', 'nl', 'be', 'at', 'ie', 'fi', 'pt', 'gr', 'sk', 'si', 'ee', 'lv', 'lt', 'cy', 'mt', 'lu',
        '-de', '-fr', '-es', '-it', '-nl', '-be', '-at', '-ie', '-fi', '-pt', '-gr', '-sk', '-si', '-ee', '-lv', '-lt', '-cy', '-mt', '-lu'
      ];
      if (euroCountriesAndLangs.some(item => lang.includes(item))) {
        return { symbol: '€', label: 'EUR (€)' };
      }
    }
  } catch (e) {
    console.warn('Currency auto-detection failed:', e);
  }
  return { symbol: '$', label: 'USD ($)' };
};

// Tailored onboarding presets matching each vertical
const VERTICAL_PRESETS: Record<string, {
  defaultOrgName: string;
  defaultOwnerName: string;
  defaultOwnerEmail: string;
  features: {
    terminology: string;
    deskName: string;
    onboardingItems: string[];
    attendanceStyle: string;
  };
}> = {
  'Beauty School': {
    defaultOrgName: 'Vogue Beauty Academy',
    defaultOwnerName: 'Evelyn Harper',
    defaultOwnerEmail: 'evelyn@vogueacademy.com',
    features: {
      terminology: 'Students & Enrollments',
      deskName: 'Educators & Instructors Desk',
      onboardingItems: ['Esthetician Certificate', 'Cosmetology 101', 'Advanced Hair Styling'],
      attendanceStyle: 'Classroom Register Sheets'
    }
  },
  'Hair Salon': {
    defaultOrgName: 'Glow & Co. Salon',
    defaultOwnerName: 'Clara Vance',
    defaultOwnerEmail: 'clara@glowcosalon.com',
    features: {
      terminology: 'Clients & Bookings',
      deskName: 'Stylists & Technicians Desk',
      onboardingItems: ['Master Haircut & Blowout', 'Balayage Artistry', 'Nail Polish & Gel'],
      attendanceStyle: 'Shift-based Stylist Rosters'
    }
  },
  'Barber Shop': {
    defaultOrgName: 'The Grooming Lounge',
    defaultOwnerName: 'Marcus Sterling',
    defaultOwnerEmail: 'marcus@groominglounge.com',
    features: {
      terminology: 'Patrons & Appointments',
      deskName: 'Barbers & Stylists Desk',
      onboardingItems: ['Classic Hot Towel Shave', 'Beard Grooming & Oil', 'Fade & Sculpt'],
      attendanceStyle: 'Daily Chair Schedules'
    }
  },
  'Spa & Massage': {
    defaultOrgName: 'Serene Oasis Wellness Spa',
    defaultOwnerName: 'Isabella Rios',
    defaultOwnerEmail: 'isabella@sereneoasis.com',
    features: {
      terminology: 'Guests & Appointments',
      deskName: 'Therapists & Estheticians Desk',
      onboardingItems: ['Aromatherapy Massage', 'Hydrating Facial Treatment', 'Hot Stone Therapy'],
      attendanceStyle: 'Therapist Booking Blocks'
    }
  },
  'Clinique / Health': {
    defaultOrgName: 'Apex Health Wellness Clinic',
    defaultOwnerName: 'Dr. Arthur Pendelton',
    defaultOwnerEmail: 'arthur@apexhealth.com',
    features: {
      terminology: 'Patients & Consultations',
      deskName: 'Practitioners & Specialists Desk',
      onboardingItems: ['Initial Health Consultation', 'Physiotherapy Session', 'Acupuncture & Alignment'],
      attendanceStyle: 'Patient Care Shifts'
    }
  }
};

function AppContent() {
  const { registerOrganization, currentUser, showToast } = useErp();

  const [currentModule, setCurrentModule] = useState('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  
  // Org modal states
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [businessType, setBusinessType] = useState('Beauty School');
  const [currency, setCurrency] = useState('$');
  const [autoDetectedInfo, setAutoDetectedInfo] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [orgPassword, setOrgPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const orgNameInputRef = useRef<HTMLInputElement>(null);

  // Initialize and apply initial presets
  useEffect(() => {
    if (isOrgModalOpen) {
      const detected = detectCurrencyFromLocale();
      setCurrency(detected.symbol);
      setAutoDetectedInfo(detected.label);
      
      const initialPreset = VERTICAL_PRESETS['Beauty School'];
      setOrgName(initialPreset.defaultOrgName);
      setOwnerName(initialPreset.defaultOwnerName);
      setOwnerEmail(initialPreset.defaultOwnerEmail);
      setBusinessType('Beauty School');
      
      const timer = setTimeout(() => {
        orgNameInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAutoDetectedInfo(null);
    }
  }, [isOrgModalOpen]);

  // Handler for dynamic changes in the industry vertical selector
  const handleBusinessTypeChange = (type: string) => {
    const previousPreset = VERTICAL_PRESETS[businessType];
    const newPreset = VERTICAL_PRESETS[type];
    
    setBusinessType(type);
    
    if (newPreset) {
      // Auto-prefill or update fields if they were left as previous preset default or empty
      if (!orgName || (previousPreset && orgName === previousPreset.defaultOrgName)) {
        setOrgName(newPreset.defaultOrgName);
      }
      if (!ownerName || (previousPreset && ownerName === previousPreset.defaultOwnerName)) {
        setOwnerName(newPreset.defaultOwnerName);
      }
      if (!ownerEmail || (previousPreset && ownerEmail === previousPreset.defaultOwnerEmail)) {
        setOwnerEmail(newPreset.defaultOwnerEmail);
      }
    }
  };

  const [isModuleLoading, setIsModuleLoading] = useState(true);
  const [isTourActive, setIsTourActive] = useState(false);

  // Trigger smooth skeleton loading states on initial load and module transition
  useEffect(() => {
    setIsModuleLoading(true);
    const timer = setTimeout(() => {
      setIsModuleLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [currentModule]);

  // Check if user has just registered an organization to trigger the guide tour
  useEffect(() => {
    if (localStorage.getItem('bf_just_registered') === 'true') {
      localStorage.removeItem('bf_just_registered');
      setCurrentModule('dashboard');
      const timer = setTimeout(() => {
        setIsTourActive(true);
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  // Live password strength calculations
  const isMinLength = orgPassword.length >= 12;
  const hasNumber = /\d/.test(orgPassword);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(orgPassword);
  const isPasswordValid = isMinLength && hasNumber && hasSpecialChar;

  const handleRegisterOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !ownerName || !ownerEmail) return;

    if (!isPasswordValid) {
      showToast('Password does not meet enterprise security requirements (min 12 characters, numbers, and special characters).', 'error');
      return;
    }

    registerOrganization({
      name: orgName,
      businessType,
      currency,
      ownerName,
      ownerEmail,
      password: orgPassword
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

        {/* Dynamic Route View Mount with Skeleton Loader transition */}
        <main className="flex-grow p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8 min-h-[500px]">
          <AnimatePresence mode="wait">
            {isModuleLoading ? (
              <ModuleSkeleton key="skeleton" module={currentModule} />
            ) : (
              <div key="module-view" className="animate-in fade-in duration-200">
                {currentModule === 'dashboard' && <Dashboard setModule={handleNavigate} />}
                {currentModule === 'employees' && <Employees />}
                {currentModule === 'trainers' && <Trainers />}
                {currentModule === 'students' && <Students />}
                {currentModule === 'attendance' && <Attendance />}
                {currentModule === 'tasks' && <Tasks />}
                {currentModule === 'finance' && <Finance />}
                {currentModule === 'superadmin' && <SuperAdmin />}
              </div>
            )}
          </AnimatePresence>
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

      {/* Floating Premium AI Business Assistant Overlay */}
      <AiAssistant />

      {/* Getting Started Interactive Tour */}
      {isTourActive && (
        <GettingStartedTour onClose={() => setIsTourActive(false)} />
      )}

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
                    ref={orgNameInputRef}
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
                    onChange={(e) => handleBusinessTypeChange(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden bg-white dark:bg-zinc-900"
                  >
                    <option value="Beauty School">Beauty Training Institutes</option>
                    <option value="Hair Salon">Hair and Nails Salon</option>
                    <option value="Barber Shop">Premium Barber Shop</option>
                    <option value="Spa & Massage">Medical Spa Resorts</option>
                    <option value="Clinique / Health">Wellness Clinics</option>
                  </select>
                </div>
              </div>

              {/* Tailored Workspace Presets Card */}
              {VERTICAL_PRESETS[businessType] && (
                <div className="p-3.5 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-950/60 bg-indigo-50/20 dark:bg-indigo-950/10 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse shrink-0" />
                    <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                      Tailored {businessType} Presets Applied
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
                    <div>
                      <span className="text-zinc-400 dark:text-zinc-500 block font-medium">Terminology</span>
                      <span className="text-zinc-700 dark:text-zinc-300 font-semibold">
                        {VERTICAL_PRESETS[businessType].features.terminology}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 dark:text-zinc-500 block font-medium">Core Workspace Desk</span>
                      <span className="text-zinc-700 dark:text-zinc-300 font-semibold text-ellipsis overflow-hidden whitespace-nowrap block">
                        {VERTICAL_PRESETS[businessType].features.deskName}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-zinc-400 dark:text-zinc-500 block font-medium mb-0.5">Pre-loaded Setup Items</span>
                      <div className="flex flex-wrap gap-1">
                        {VERTICAL_PRESETS[businessType].features.onboardingItems.map((item, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[9px] text-zinc-600 dark:text-zinc-400 rounded-sm font-medium">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-zinc-400 dark:text-zinc-500 block font-medium">Attendance & Schedule Tracking</span>
                      <span className="text-zinc-700 dark:text-zinc-300 font-semibold">
                        {VERTICAL_PRESETS[businessType].features.attendanceStyle}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1 flex items-center justify-between">
                    <span>Billing Currency</span>
                    {autoDetectedInfo && (
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium normal-case animate-in fade-in duration-200">
                        Auto-detected ({autoDetectedInfo})
                      </span>
                    )}
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => {
                      setCurrency(e.target.value);
                      setAutoDetectedInfo(null);
                    }}
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
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={orgPassword}
                    onChange={(e) => setOrgPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className={`w-full text-xs p-2.5 pr-10 rounded-lg border bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden transition-all ${
                      orgPassword.length === 0
                        ? 'border-zinc-200 dark:border-zinc-800'
                        : isPasswordValid
                        ? 'border-emerald-500/50 dark:border-emerald-500/30'
                        : 'border-rose-500/50 dark:border-rose-500/30'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 transition-colors focus:outline-hidden cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                
                {/* Enterprise Complexity Validator Indicators */}
                <div className="mt-2 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/80 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-zinc-400" /> Security Requirements
                  </p>
                  
                  <div className="flex items-center gap-2">
                    {isMinLength ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 animate-in zoom-in" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-zinc-300 dark:border-zinc-700 shrink-0" />
                    )}
                    <span className={`text-[11px] ${isMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-zinc-500 dark:text-zinc-400'}`}>
                      At least 12 characters (current: {orgPassword.length})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasNumber ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 animate-in zoom-in" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-zinc-300 dark:border-zinc-700 shrink-0" />
                    )}
                    <span className={`text-[11px] ${hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-zinc-500 dark:text-zinc-400'}`}>
                      Include numbers (0-9)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasSpecialChar ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 animate-in zoom-in" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-zinc-300 dark:border-zinc-700 shrink-0" />
                    )}
                    <span className={`text-[11px] ${hasSpecialChar ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-zinc-500 dark:text-zinc-400'}`}>
                      Include special characters (symbols)
                    </span>
                  </div>
                </div>
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
