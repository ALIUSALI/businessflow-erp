/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useErp } from '../store/erpStore';
import {
  ShieldAlert,
  Server,
  Activity,
  DollarSign,
  Building,
  Users,
  CheckCircle,
  AlertTriangle,
  Flame,
  Wrench,
  Check
} from 'lucide-react';

export default function SuperAdmin() {
  const {
    tenants,
    users,
    tickets,
    toggleTenantSubscription,
    updateTicketStatus
  } = useErp();

  // Aggregate global stats
  const totalOrgs = tenants.length;
  const totalUsers = users.length;
  const activeLicenses = tenants.filter(t => t.subscriptionStatus === 'ACTIVE').length;
  const mrrTotal = tenants.filter(t => t.subscriptionStatus === 'ACTIVE').length * 249; // $249/mo license

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-display text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-500" />
            <span>Super Admin Portal</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Global SaaS licensing dashboards, tenant sharding controls, and system health telemetry.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-3.5 py-1.5 border border-emerald-200 dark:border-emerald-900/40 rounded-xl font-bold font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Platform Status: Healthy</span>
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Global MRR */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Platform MRR</span>
            <p className="text-xl font-extrabold text-indigo-600 mt-1">
              ${mrrTotal.toLocaleString()}
            </p>
          </div>
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg text-indigo-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Total Tenants */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Active Tenants</span>
            <p className="text-xl font-extrabold text-zinc-800 dark:text-zinc-100 mt-1">
              {activeLicenses} / {totalOrgs} Orgs
            </p>
          </div>
          <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-zinc-500">
            <Building className="w-5 h-5" />
          </div>
        </div>

        {/* Global Users */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">SaaS Registered Users</span>
            <p className="text-xl font-extrabold text-zinc-800 dark:text-zinc-100 mt-1">
              {totalUsers} Active
            </p>
          </div>
          <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-zinc-500">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Database Latency */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">API Latency</span>
            <p className="text-xl font-extrabold text-emerald-600 mt-1 font-mono">
              9.2 ms
            </p>
          </div>
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg text-emerald-600">
            <Server className="w-5 h-5" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tenants management (Left 2/3) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Global Tenant Shards</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-400 uppercase font-bold tracking-wider text-[10px]">
                    <th className="p-4">Organization Name</th>
                    <th className="p-4">Business Type</th>
                    <th className="p-4">Billing Status</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                  {tenants.map((t) => (
                    <tr key={t.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                      <td className="p-4 font-bold text-zinc-900 dark:text-zinc-50">{t.name}</td>
                      <td className="p-4 text-zinc-500">{t.businessType}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wide ${
                          t.subscriptionStatus === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : t.subscriptionStatus === 'TRIAL'
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                        }`}>
                          {t.subscriptionStatus}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleTenantSubscription(t.id)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                            t.subscriptionStatus === 'ACTIVE'
                              ? 'border-rose-200 text-rose-600 bg-rose-50/20 dark:border-rose-900/30 dark:text-rose-400 hover:bg-rose-100'
                              : 'border-emerald-200 text-emerald-600 bg-emerald-50/20 dark:border-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100'
                          }`}
                        >
                          {t.subscriptionStatus === 'ACTIVE' ? 'Suspend Plan' : 'Activate Plan'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Support ticketing queue (Right 1/3) */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-4">
            <div className="pb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">System Support Tickets</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Assigned sharded client queue</p>
            </div>

            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-0.5">
              {tickets.map((tix) => (
                <div key={tix.id} className="p-3 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-150 dark:border-zinc-850 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="font-semibold text-zinc-400">{tix.tenantName}</span>
                    <span className={`px-2 py-0.5 rounded-sm font-bold uppercase ${
                      tix.priority === 'HIGH' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
                    }`}>
                      {tix.priority}
                    </span>
                  </div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100 leading-normal">{tix.subject}</p>
                  <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px]">
                    <span className="text-zinc-400">Status: <strong className="text-zinc-600 dark:text-zinc-300">{tix.status.replace('_', ' ')}</strong></span>
                    {tix.status !== 'RESOLVED' && (
                      <button
                        onClick={() => updateTicketStatus(tix.id, 'RESOLVED')}
                        className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
