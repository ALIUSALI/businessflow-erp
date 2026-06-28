/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useErp } from '../store/erpStore';
import {
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface DashboardProps {
  setModule: (module: string) => void;
}

export default function Dashboard({ setModule }: DashboardProps) {
  const {
    employees,
    trainers,
    students,
    tasks,
    transactions,
    activities,
    currentTenantId,
    currentBranchId,
    tenants,
    recordTransaction
  } = useErp();

  // Quick transaction state
  const [showQuickTx, setShowQuickTx] = useState(false);
  const [txType, setTxType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [txCategory, setTxCategory] = useState('Salon Services');
  const [txAmount, setTxAmount] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txMethod, setTxMethod] = useState<'CASH' | 'CARD' | 'TRANSFER'>('CARD');

  const tenantCurrency = tenants.find(t => t.id === currentTenantId)?.currency || '$';

  // --- DERIVE METRICS FROM REAL DATA ---
  const activeEmployees = employees.filter(e => e.status === 'ACTIVE' && e.organizationId === currentTenantId);
  const activeStudents = students.filter(s => s.status === 'ACTIVE' && s.organizationId === currentTenantId);
  const activeTrainers = trainers.filter(t => t.organizationId === currentTenantId);
  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED' && t.organizationId === currentTenantId);

  // Filter transactions
  const tenantTx = transactions.filter(t => t.organizationId === currentTenantId);
  const todayStr = new Date().toISOString().split('T')[0];

  const todayIncome = tenantTx
    .filter(t => t.type === 'INCOME' && t.date === todayStr)
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyIncome = tenantTx
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = tenantTx
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyNet = monthlyIncome - monthlyExpense;

  // Aggregate monthly category data for charts
  const categoryChartData = [
    { name: 'Student Fees', value: tenantTx.filter(t => t.type === 'INCOME' && t.category === 'Student Fees').reduce((s, t) => s + t.amount, 0) },
    { name: 'Salon Services', value: tenantTx.filter(t => t.type === 'INCOME' && (t.category === 'Salon Services' || t.category === 'Services')).reduce((s, t) => s + t.amount, 0) },
    { name: 'Product Sales', value: tenantTx.filter(t => t.type === 'INCOME' && t.category === 'Product Sales').reduce((s, t) => s + t.amount, 0) },
    { name: 'Staff Salaries', value: tenantTx.filter(t => t.type === 'EXPENSE' && t.category === 'Salaries').reduce((s, t) => s + t.amount, 0) },
    { name: 'Operation Supplies', value: tenantTx.filter(t => t.type === 'EXPENSE' && t.category === 'Supplies').reduce((s, t) => s + t.amount, 0) },
  ].filter(c => c.value > 0);

  // Cashflow Trend data (7 Days list)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const trendChartData = last7Days.map(dateStr => {
    const dayIncome = tenantTx.filter(t => t.type === 'INCOME' && t.date === dateStr).reduce((s, t) => s + t.amount, 0);
    const dayExpense = tenantTx.filter(t => t.type === 'EXPENSE' && t.date === dateStr).reduce((s, t) => s + t.amount, 0);
    const label = new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
    return { date: label, Income: dayIncome, Expense: dayExpense, Profit: dayIncome - dayExpense };
  });

  const handleQuickTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || isNaN(Number(txAmount))) return;
    recordTransaction({
      type: txType,
      category: txCategory,
      amount: Number(txAmount),
      description: txDesc || `${txCategory} checkout`,
      date: todayStr,
      paymentMethod: txMethod as any
    });
    setTxAmount('');
    setTxDesc('');
    setShowQuickTx(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-display text-zinc-900 dark:text-zinc-50">
            Executive Dashboard
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real-time analytics and financial summaries for multi-branch campuses.
          </p>
        </div>
        
        {/* Quick Action Button */}
        <button
          onClick={() => {
            setTxType('INCOME');
            setShowQuickTx(true);
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record Transaction</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Income Today */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Today's Receipts</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold font-display text-zinc-900 dark:text-zinc-50">
              {tenantCurrency}{todayIncome.toLocaleString()}
            </p>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Synced and active</span>
            </div>
          </div>
        </div>

        {/* Monthly Net Sales */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Monthly Profit</span>
            <div className={`p-1.5 rounded-lg ${monthlyNet >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600'}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className={`text-2xl font-bold font-display ${monthlyNet >= 0 ? 'text-zinc-900 dark:text-zinc-50' : 'text-rose-600'}`}>
              {tenantCurrency}{monthlyNet.toLocaleString()}
            </p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
              In: {tenantCurrency}{monthlyIncome.toLocaleString()} | Out: {tenantCurrency}{monthlyExpense.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Total Roster counts */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Active Students</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold font-display text-zinc-900 dark:text-zinc-50">
              {activeStudents.length} Students
            </p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
              Under {activeTrainers.length} Assigned Trainers
            </p>
          </div>
        </div>

        {/* Pending tasks */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Operations</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold font-display text-zinc-900 dark:text-zinc-50">
              {pendingTasks.length} Pending Tasks
            </p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
              Active staff: {activeEmployees.length} on-duty
            </p>
          </div>
        </div>

      </div>

      {/* Primary Charts & Activity Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Area Chart (Left/Center) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Cashflow Trend</h3>
              <p className="text-[11px] text-zinc-400">7-Day historical revenue, operational costs, and net margins</p>
            </div>
            <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md">
              Daily Ledger
            </span>
          </div>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} unit={tenantCurrency} />
                <Tooltip formatter={(value) => [`${tenantCurrency}${value}`, '']} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Line type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Expense" stroke="#ef4444" strokeWidth={1.5} dot={{ r: 2 }} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="Profit" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-Time System Activity Feed (Right) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs flex flex-col h-[354px]">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Live Activities</h3>
            <p className="text-[11px] text-zinc-400">Real-time platform action tracking logs</p>
          </div>
          <div className="flex-grow overflow-y-auto space-y-3.5 pr-1">
            {activities.filter(a => a.organizationId === currentTenantId).length > 0 ? (
              activities
                .filter(a => a.organizationId === currentTenantId)
                .slice(0, 6)
                .map((act) => (
                  <div key={act.id} className="flex gap-2.5 text-xs items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-zinc-700 dark:text-zinc-300 leading-normal">
                        <strong className="text-zinc-950 dark:text-zinc-100">{act.userFullName}</strong> ({act.role.replace('_', ' ')}): {act.action}
                      </p>
                      <p className="text-[9px] text-zinc-400 font-mono mt-0.5">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {act.module}
                      </p>
                    </div>
                  </div>
                ))
            ) : (
              <div className="py-16 text-center text-xs text-zinc-400">
                No recent activity events.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Secondary Aggregation Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Revenue Categories breakdown Bar Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Revenue Categories</h3>
              <p className="text-[11px] text-zinc-400">Visual allocation of income streams vs operational costs</p>
            </div>
          </div>
          <div className="h-60 text-xs">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} unit={tenantCurrency} />
                  <Tooltip formatter={(value) => [`${tenantCurrency}${value}`, '']} />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="py-20 text-center text-zinc-400 text-xs">No transactions recorded yet to map.</div>
            )}
          </div>
        </div>

        {/* Course Roster Breakdown & Rapid Operational Shortcuts */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Quick Operations Panel</h3>
            <p className="text-[11px] text-zinc-400 mb-4">Direct operational links to expedite recurring business tasks</p>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-grow py-2">
            
            <button
              onClick={() => setModule('students')}
              className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-left transition-all cursor-pointer"
            >
              <Users className="w-5 h-5 text-blue-500 mb-2" />
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Admit Student</p>
              <p className="text-[9px] text-zinc-400 mt-0.5">Enroll new learners and assign curriculums</p>
            </button>

            <button
              onClick={() => setModule('attendance')}
              className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-left transition-all cursor-pointer"
            >
              <CheckCircle className="w-5 h-5 text-emerald-500 mb-2" />
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Mark Attendance</p>
              <p className="text-[9px] text-zinc-400 mt-0.5">Quick roll-call sheet for courses and staff</p>
            </button>

            <button
              onClick={() => setModule('finance')}
              className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-left transition-all cursor-pointer"
            >
              <DollarSign className="w-5 h-5 text-indigo-500 mb-2" />
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Record Expense</p>
              <p className="text-[9px] text-zinc-400 mt-0.5">Log utility, salary, and supply invoices</p>
            </button>

            <button
              onClick={() => setModule('tasks')}
              className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-left transition-all cursor-pointer"
            >
              <Clock className="w-5 h-5 text-purple-500 mb-2" />
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Create Task</p>
              <p className="text-[9px] text-zinc-400 mt-0.5">Delegate chores to departments and trainers</p>
            </button>

          </div>
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 text-center">
            Operating in NYC Downtown zone • Secure TLS sharding
          </div>
        </div>

      </div>

      {/* Record Transaction Quick-Modal Overlay */}
      {showQuickTx && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1">
              Record Financial Transaction
            </h3>
            <p className="text-[11px] text-zinc-400 mb-4">
              Add income or expenses directly to the branch ledger.
            </p>

            <form onSubmit={handleQuickTxSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTxType('INCOME');
                    setTxCategory('Salon Services');
                  }}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    txType === 'INCOME'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40'
                      : 'border-zinc-200 text-zinc-600 dark:border-zinc-800'
                  }`}
                >
                  Income (In)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTxType('EXPENSE');
                    setTxCategory('Supplies');
                  }}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    txType === 'EXPENSE'
                      ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40'
                      : 'border-zinc-200 text-zinc-600 dark:border-zinc-800'
                  }`}
                >
                  Expense (Out)
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                  Category
                </label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100"
                >
                  {txType === 'INCOME' ? (
                    <>
                      <option value="Salon Services">Salon Services & Styling</option>
                      <option value="Product Sales">Retail Sales</option>
                      <option value="Student Fees">Student Tuition Balance</option>
                      <option value="Miscellaneous">Miscellaneous Revenue</option>
                    </>
                  ) : (
                    <>
                      <option value="Supplies">School & Styling Supplies</option>
                      <option value="Salaries">Staff Salaries & Honorariums</option>
                      <option value="Rent">Facilities lease Rent</option>
                      <option value="Utilities">Energy and Water Utilities</option>
                      <option value="Marketing">Marketing campaigns</option>
                    </>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Amount ({tenantCurrency})
                  </label>
                  <input
                    type="number"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    required
                    placeholder="250"
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Payment Method
                  </label>
                  <select
                    value={txMethod}
                    onChange={(e) => setTxMethod(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100"
                  >
                    <option value="CARD">Card</option>
                    <option value="CASH">Cash</option>
                    <option value="TRANSFER">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  placeholder="Matrix Dye restock, etc."
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickTx(false)}
                  className="flex-grow py-2 text-xs font-bold border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-grow py-2 text-xs font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
