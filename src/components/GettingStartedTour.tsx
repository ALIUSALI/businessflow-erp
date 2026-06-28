/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Sparkles, 
  Search, 
  UserCheck, 
  CheckCircle2, 
  Building 
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetId: string | null;
  placement: 'bottom' | 'top' | 'left' | 'right' | 'center';
  badge: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to your ERP Workspace! 🚀',
    description: 'Your new multi-tenant BusinessFlow workspace is fully provisioned and ready. Let\'s do a quick 60-second interactive tour of your new control deck!',
    targetId: null,
    placement: 'center',
    badge: 'Onboarding 1/6'
  },
  {
    id: 'step-brand',
    title: 'Workspace Tenant Switcher 🏢',
    description: 'This shows your active organization. You can register multiple organizations or switch between existing tenants with secure workspace password protection.',
    targetId: 'tour-brand-switcher',
    placement: 'bottom',
    badge: 'Onboarding 2/6'
  },
  {
    id: 'step-nav',
    title: 'Manage Platform Modules 📊',
    description: 'Your navigation command center! Tap to instantly swap between Employees, Trainers desks, Student registers, Attendance sheets, and Finance ledgers.',
    targetId: 'tour-nav-list',
    placement: 'right',
    badge: 'Onboarding 3/6'
  },
  {
    id: 'step-role',
    title: 'Evaluate acting Role Permissions 👥',
    description: 'A robust workspace simulator! Swap between Super Admin, Org Owner, and Branch Manager role perspectives to instantly evaluate views and security permissions.',
    targetId: 'tour-role-switcher',
    placement: 'bottom',
    badge: 'Onboarding 4/6'
  },
  {
    id: 'step-search',
    title: 'Universal Command Search ⌘K',
    description: 'Search everything in your active workspace instantly. Open the Command Palette from here or by pressing Ctrl+K / Cmd+K to search all employee logs and trigger quick actions.',
    targetId: 'tour-command-palette',
    placement: 'bottom',
    badge: 'Onboarding 5/6'
  },
  {
    id: 'step-ai',
    title: 'AI Companion Assistant 🤖',
    description: 'Have a complex query? Open your live Gemini AI Assistant to ask about total revenues, absence trends, student balances, or pending branch tasks.',
    targetId: 'ai-assistant-trigger',
    placement: 'top',
    badge: 'Onboarding 6/6'
  }
];

interface GettingStartedTourProps {
  onClose: () => void;
}

export default function GettingStartedTour({ onClose }: GettingStartedTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [isCelebrated, setIsCelebrated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const step = TOUR_STEPS[currentStepIndex];

  // Recalculate target element position coordinates
  const updateCoords = () => {
    if (!step || !step.targetId) {
      setCoords(null);
      return;
    }

    const element = document.getElementById(step.targetId);
    if (element) {
      const rect = element.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
      
      // Smoothly scroll to the target element if it's out of view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // Element not currently visible/rendered (e.g., hidden in mobile sidebar)
      setCoords(null);
    }
  };

  useEffect(() => {
    updateCoords();
    // Re-check coords on window resize or scroll
    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords);
    
    // Add a slight delayed check in case layout renders late
    const timer = setTimeout(updateCoords, 200);

    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords);
      clearTimeout(timer);
    };
  }, [currentStepIndex, step?.targetId]);

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsCelebrated(true);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  // Compute popover positioning classes based on target element bounding box & placement instruction
  const getPopoverStyle = () => {
    if (!coords || !step.targetId) {
      // Return centered style if no target coordinates are found
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 50,
      };
    }

    const margin = 12;
    const popoverWidth = 320;
    
    let top = 0;
    let left = 0;

    switch (step.placement) {
      case 'bottom':
        top = coords.top + coords.height + margin;
        left = coords.left + coords.width / 2 - popoverWidth / 2;
        break;
      case 'top':
        top = coords.top - margin - 220; // estimate height
        left = coords.left + coords.width / 2 - popoverWidth / 2;
        break;
      case 'left':
        top = coords.top + coords.height / 2 - 100;
        left = coords.left - popoverWidth - margin;
        break;
      case 'right':
        top = coords.top + coords.height / 2 - 100;
        left = coords.left + coords.width + margin;
        break;
      default:
        top = coords.top + coords.height + margin;
        left = coords.left + coords.width / 2 - popoverWidth / 2;
    }

    // Viewport bounds protection
    const pad = 16;
    if (left < pad) left = pad;
    if (left + popoverWidth > window.innerWidth - pad) {
      left = window.innerWidth - popoverWidth - pad;
    }
    if (top < pad) top = pad;

    return {
      position: 'absolute' as const,
      top: `${top}px`,
      left: `${left}px`,
      width: `${popoverWidth}px`,
      zIndex: 50,
    };
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" ref={containerRef}>
      {/* Dim overlay backdrop */}
      <div 
        className="fixed inset-0 bg-zinc-950/40 dark:bg-zinc-950/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={handleSkip}
      />

      <AnimatePresence mode="wait">
        {!isCelebrated ? (
          <div className="absolute inset-0 pointer-events-none">
            {/* Real-time Spotlight Pulse around target coordinates */}
            {coords && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  top: coords.top - 6,
                  left: coords.left - 6,
                  width: coords.width + 12,
                  height: coords.height + 12,
                }}
                className="rounded-xl border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse pointer-events-none z-50 bg-emerald-500/5"
              />
            )}

            {/* Interactive Tooltip Card */}
            <motion.div
              key={currentStepIndex}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={getPopoverStyle()}
              className="pointer-events-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-5 space-y-4"
            >
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-mono text-[9px] font-bold rounded-sm uppercase tracking-wider">
                  {step.badge}
                </span>
                <button 
                  onClick={handleSkip} 
                  className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Title & Body */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                  {step.title}
                </h4>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                <button
                  onClick={handleSkip}
                  className="text-[10px] font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  Skip Tour
                </button>

                <div className="flex items-center gap-2">
                  {currentStepIndex > 0 && (
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      Back
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold bg-zinc-950 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-lg transition-colors cursor-pointer"
                  >
                    {currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          /* Final Celebratory Modal Card */
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-sm rounded-3xl shadow-2xl p-6 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-500 mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50 uppercase tracking-wide">
                  You are all set! 🎉
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
                  Your tenant workspace is configured and ready. Invite staff members, register student accounts, or record finance entries to get started.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Let's Go!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
