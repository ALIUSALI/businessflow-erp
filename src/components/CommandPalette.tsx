/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Search, Compass, Calendar, Users, DollarSign, Settings, Bell, CheckSquare, Shield, Sun, Moon } from 'lucide-react';
import { useErp } from '../store/erpStore';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (module: string) => void;
}

export default function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const { theme, setTheme, currentUser } = useErp();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { id: 'dash', name: 'Go to Executive Dashboard', icon: <Compass className="w-4 h-4" />, action: () => onNavigate('dashboard') },
    { id: 'emp', name: 'Manage Employees & Onboarding', icon: <Users className="w-4 h-4" />, action: () => onNavigate('employees'), permission: ['SUPER_ADMIN', 'ORG_OWNER', 'BRANCH_MANAGER', 'HR_ADMIN'] },
    { id: 'train', name: 'Trainer Schedules & Curriculum', icon: <Calendar className="w-4 h-4" />, action: () => onNavigate('trainers'), permission: ['SUPER_ADMIN', 'ORG_OWNER', 'BRANCH_MANAGER', 'TRAINER'] },
    { id: 'stud', name: 'Student Roster & Fees Balance', icon: <Users className="w-4 h-4" />, action: () => onNavigate('students'), permission: ['SUPER_ADMIN', 'ORG_OWNER', 'BRANCH_MANAGER', 'HR_ADMIN', 'FINANCE_OFFICER'] },
    { id: 'att', name: 'Employee & Student Attendance', icon: <CheckSquare className="w-4 h-4" />, action: () => onNavigate('attendance') },
    { id: 'task', name: 'Operational Task Boards', icon: <CheckSquare className="w-4 h-4" />, action: () => onNavigate('tasks') },
    { id: 'fin', name: 'Financial Cashbook & Revenue Ledger', icon: <DollarSign className="w-4 h-4" />, action: () => onNavigate('finance'), permission: ['SUPER_ADMIN', 'ORG_OWNER', 'FINANCE_OFFICER'] },
    { id: 'super', name: 'Super Admin Portal Systems', icon: <Shield className="w-4 h-4" />, action: () => onNavigate('superadmin'), permission: ['SUPER_ADMIN'] },
    { id: 'theme-toggle', name: `Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`, icon: theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />, action: () => setTheme(theme === 'light' ? 'dark' : 'light') },
  ];

  const filteredCommands = commands.filter(cmd => {
    const matchesQuery = cmd.name.toLowerCase().includes(query.toLowerCase());
    if (cmd.permission) {
      return matchesQuery && cmd.permission.includes(currentUser.role);
    }
    return matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Search Input Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
          <Search className="w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Type a command or module search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden"
            autoFocus
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-xs">
            ESC
          </kbd>
        </div>

        {/* Command List Area */}
        <div className="max-h-72 overflow-y-auto p-2">
          {filteredCommands.length > 0 ? (
            <div className="space-y-0.5">
              {filteredCommands.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-950 dark:hover:text-zinc-50 transition-all cursor-pointer"
                >
                  <span className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-950">
                    {cmd.icon}
                  </span>
                  <span className="flex-grow">{cmd.name}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Jump</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-zinc-400">
              No results found matching "{query}"
            </div>
          )}
        </div>

        {/* Action Help Footer */}
        <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center text-[10px] text-zinc-400">
          <span>Use <strong>Enter</strong> to jump or click to navigate</span>
          <span>BusinessFlow Core</span>
        </div>
      </div>
      
      {/* Background click dismiss */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
