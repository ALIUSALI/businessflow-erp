/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useErp } from '../store/erpStore';
import { Transaction } from '../types';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Plus,
  Filter,
  Search,
  CheckCircle,
  FileText,
  CreditCard,
  User,
  Activity
} from 'lucide-react';

export default function Finance() {
  const {
    transactions,
    recordTransaction,
    currentTenantId,
    currentBranchId,
    tenants,
    currentUser
  } = useErp();

  const [activeTab, setActiveTab] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  
  // New transaction modal states
  const [showModal, setShowModal] = useState(false);
  const [newType, setNewType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [newCat, setNewCat] = useState('Salon Services');
  const [newAmount, setNewAmount] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newMethod, setNewMethod] = useState<'CASH' | 'CARD' | 'TRANSFER' | 'MOBILE_MONEY'>('CARD');

  const tenantCurrency = tenants.find(t => t.id === currentTenantId)?.currency || '$';

  // Filters
  const tenantTx = transactions.filter(t => t.organizationId === currentTenantId);
  const filteredTx = tenantTx.filter(tx => {
    const matchesTab = activeTab === 'ALL' || tx.type === activeTab;
    const matchesCat = categoryFilter === 'ALL' || tx.category === categoryFilter;
    return matchesTab && matchesCat;
  });

  // Financial aggregation
  const totalIncome = tenantTx.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const totalExpense = tenantTx.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  const netProfit = totalIncome - totalExpense;

  // Handle transaction recording
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmount || isNaN(Number(newAmount))) return;

    recordTransaction({
      type: newType,
      category: newCat,
      amount: Number(newAmount),
      description: newDesc || `${newCat} ledger logging`,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: newMethod
    });

    setNewAmount('');
    setNewDesc('');
    setShowModal(false);
  };

  // High-fidelity CSV export simulation (generates downloadable, formatted excel-readable file!)
  const handleExportCSV = () => {
    const headers = 'Transaction ID,Date,Type,Category,Description,Amount,Method,Recorded By\n';
    const rows = filteredTx
      .map(t => `"${t.id}","${t.date}","${t.type}","${t.category}","${t.description.replace(/"/g, '""')}",${t.amount},"${t.paymentMethod}","${t.recordedBy}"`)
      .join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `BusinessFlow_Cashbook_${currentTenantId}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-display text-zinc-900 dark:text-zinc-50">
            Financial Ledger
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Record tuition invoices, retail POS transactions, facility lease costs, and monitor profit summaries.
          </p>
        </div>
        
        {/* Actions bar */}
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Spreadsheet (CSV)</span>
          </button>
          <button
            onClick={() => {
              setNewType('INCOME');
              setNewCat('Salon Services');
              setShowModal(true);
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* Aggregate metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Inflows */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex justify-between items-center">
          <div>
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Total Income</span>
            <p className="text-xl font-extrabold text-emerald-600 mt-1">
              {tenantCurrency}{totalIncome.toLocaleString()}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Total Outflows */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex justify-between items-center">
          <div>
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Total Expenses</span>
            <p className="text-xl font-extrabold text-rose-600 mt-1">
              {tenantCurrency}{totalExpense.toLocaleString()}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* Aggregate Net Profit */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex justify-between items-center">
          <div>
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Net Cash Profit</span>
            <p className={`text-xl font-extrabold mt-1 ${netProfit >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
              {tenantCurrency}{netProfit.toLocaleString()}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600">
            <Activity className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Cashbook Ledger area */}
      <div className="space-y-4">
        
        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-xl shadow-xs">
          
          {/* Cashbook tabs */}
          <div className="flex gap-1.5 bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg w-full sm:w-auto">
            {(['ALL', 'INCOME', 'EXPENSE'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-grow sm:flex-grow-0 px-3 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800'
                }`}
              >
                {tab === 'ALL' ? 'Complete Ledger' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-700 dark:text-zinc-300 w-full sm:w-48 focus:outline-hidden"
            >
              <option value="ALL">All Categories</option>
              {activeTab !== 'EXPENSE' && (
                <>
                  <option value="Student Fees">Student Tuition Fees</option>
                  <option value="Salon Services">Salon Services</option>
                  <option value="Product Sales">Retail Product Sales</option>
                </>
              )}
              {activeTab !== 'INCOME' && (
                <>
                  <option value="Supplies">School & Salon Supplies</option>
                  <option value="Salaries">Payroll Salaries</option>
                  <option value="Rent">Facilities Rent</option>
                  <option value="Utilities">Utilities</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Transactions ledger spreadsheet sheet */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-400 uppercase font-bold tracking-wider text-[10px]">
                  <th className="p-4">Transaction Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Audited By</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                {filteredTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-zinc-900 dark:text-zinc-50">{tx.description}</p>
                      <span className="text-[9px] font-mono text-zinc-400 block mt-0.5">ID: {tx.id}</span>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-[9px] font-bold text-zinc-500 rounded-sm">
                        {tx.category}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-500 font-mono text-[10px]">{tx.date}</td>
                    <td className="p-4 text-zinc-500 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-zinc-400" /> {tx.recordedBy}
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] uppercase font-semibold text-zinc-400 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5" /> {tx.paymentMethod.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={`p-4 text-right font-extrabold ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{tenantCurrency}{tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}

                {filteredTx.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-zinc-400">
                      No transactional logs matched active parameters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Record transaction modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1">
              Log Financial Transaction
            </h3>
            <p className="text-[11px] text-zinc-400 mb-4">
              Submit receipts or outflows directly to the active branch audit sheets.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewType('INCOME');
                    setNewCat('Salon Services');
                  }}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    newType === 'INCOME'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40 font-extrabold'
                      : 'border-zinc-200 text-zinc-600 dark:border-zinc-800'
                  }`}
                >
                  Income (Inflow)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewType('EXPENSE');
                    setNewCat('Supplies');
                  }}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    newType === 'EXPENSE'
                      ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40 font-extrabold'
                      : 'border-zinc-200 text-zinc-600 dark:border-zinc-800'
                  }`}
                >
                  Expense (Outflow)
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                  Ledger Category
                </label>
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                >
                  {newType === 'INCOME' ? (
                    <>
                      <option value="Salon Services">Salon Services</option>
                      <option value="Product Sales">Retail Product Sales</option>
                      <option value="Student Fees">Student Tuition Fees</option>
                      <option value="Miscellaneous">Miscellaneous Inflow</option>
                    </>
                  ) : (
                    <>
                      <option value="Supplies">School & Salon Supplies</option>
                      <option value="Salaries">Payroll Wages</option>
                      <option value="Rent">Facilities Lease Rent</option>
                      <option value="Utilities">Power and Water Utilities</option>
                      <option value="Marketing">Marketing Campaigns</option>
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
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    required
                    placeholder="500"
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Method
                  </label>
                  <select
                    value={newMethod}
                    onChange={(e) => setNewMethod(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  >
                    <option value="CARD">Debit/Credit Card</option>
                    <option value="CASH">Cash Drawer</option>
                    <option value="TRANSFER">Bank Wire Transfer</option>
                    <option value="MOBILE_MONEY">Mobile Money</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Matrix dyes wholesale buy..."
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-grow py-2 text-xs font-bold border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-grow py-2 text-xs font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  Log Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
