/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useErp } from '../store/erpStore';
import { Employee } from '../types';
import {
  Search,
  Plus,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  FileText,
  UserCheck,
  Archive,
  ArrowLeft,
  Briefcase
} from 'lucide-react';

export default function Employees() {
  const {
    employees,
    addEmployee,
    archiveEmployee,
    currentTenantId,
    currentBranchId,
    tenants
  } = useErp();

  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'LEAVE' | 'ARCHIVED'>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  
  // Registration form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDept, setNewDept] = useState('Administration');
  const [newPos, setNewPos] = useState('');
  const [newSalary, setNewSalary] = useState('');
  const [newSalaryType, setNewSalaryType] = useState<'MONTHLY' | 'HOURLY'>('MONTHLY');
  const [newHireDate, setNewHireDate] = useState(new Date().toISOString().split('T')[0]);

  const tenantCurrency = tenants.find(t => t.id === currentTenantId)?.currency || '$';

  // Filter employees
  const tenantEmployees = employees.filter(e => e.organizationId === currentTenantId);
  const filteredEmployees = tenantEmployees.filter(emp => {
    const matchesStatus = emp.status === activeTab;
    const matchesSearch = emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || emp.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;
    return matchesStatus && matchesSearch && matchesDept;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPos || !newSalary) return;

    addEmployee({
      fullName: newName,
      email: newEmail,
      phone: newPhone || '+1 (555) 0100',
      department: newDept,
      position: newPos,
      salary: Number(newSalary),
      salaryType: newSalaryType,
      status: 'ACTIVE',
      hireDate: newHireDate,
      profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&fit=crop&q=80', // placeholder
      documents: []
    });

    // Reset Form
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewDept('Administration');
    setNewPos('');
    setNewSalary('');
    setNewSalaryType('MONTHLY');
    setNewHireDate(new Date().toISOString().split('T')[0]);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      {!selectedEmp ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-display text-zinc-900 dark:text-zinc-50">
              Staff & Onboarding
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Onboard administrators, accountants, HR staff, and coordinate salary portfolios.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Employee</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedEmp(null)}
            className="p-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {selectedEmp.fullName}
            </h1>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {selectedEmp.position} • {selectedEmp.department}
            </p>
          </div>
        </div>
      )}

      {/* Main Content Pane */}
      {!selectedEmp ? (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 p-3 rounded-xl shadow-xs">
            {/* Tabs */}
            <div className="flex gap-1.5 bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg">
              {(['ACTIVE', 'LEAVE', 'ARCHIVED'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                    activeTab === tab
                      ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800'
                  }`}
                >
                  {tab.charAt(0) + tab.slice(1).toLowerCase()} ({tenantEmployees.filter(e => e.status === tab).length})
                </button>
              ))}
            </div>

            {/* Right filter controls */}
            <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100"
                />
              </div>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-700 dark:text-zinc-300"
              >
                <option value="ALL">All Departments</option>
                <option value="Administration">Administration</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Facilities">Facilities</option>
              </select>
            </div>
          </div>

          {/* Roster Grid */}
          {filteredEmployees.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between hover:shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center flex-shrink-0">
                      {emp.profilePhoto ? (
                        <img src={emp.profilePhoto} alt={emp.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-sm font-semibold text-zinc-500">{emp.fullName[0]}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-950 dark:text-zinc-50 group-hover:text-zinc-800 dark:group-hover:text-white truncate">
                        {emp.fullName}
                      </p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium truncate">
                        {emp.position}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[8px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 rounded-sm uppercase tracking-wide">
                        {emp.department}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 dark:border-zinc-800/60 mt-4 pt-3 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0 text-zinc-400" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0 text-zinc-400" />
                      <span>{emp.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/60 mt-3 pt-2.5">
                    <button
                      onClick={() => setSelectedEmp(emp)}
                      className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100 hover:underline cursor-pointer"
                    >
                      View Profile File
                    </button>
                    {emp.status !== 'ARCHIVED' && (
                      <button
                        onClick={() => archiveEmployee(emp.id)}
                        className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Archive className="w-3 h-3" />
                        <span>Archive</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 rounded-2xl">
              <Briefcase className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">No employees found</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Adjust filters or onboard a new employee above.</p>
            </div>
          )}

        </div>
      ) : (
        /* Employee File details detail screen */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Personal detail card (Left) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs space-y-5 h-fit">
            <div className="text-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-2 border-zinc-200 dark:border-zinc-700 mx-auto flex items-center justify-center">
                {selectedEmp.profilePhoto ? (
                  <img src={selectedEmp.profilePhoto} alt={selectedEmp.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-lg font-bold text-zinc-500">{selectedEmp.fullName[0]}</span>
                )}
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mt-3">{selectedEmp.fullName}</h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">{selectedEmp.position} • {selectedEmp.department}</p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Salary wage:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                  {tenantCurrency}{selectedEmp.salary.toLocaleString()} / {selectedEmp.salaryType.toLowerCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Hired date:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-100">{selectedEmp.hireDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Phone:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-100">{selectedEmp.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Email:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-100 truncate max-w-[160px]">{selectedEmp.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Staff status:</span>
                <span className="font-semibold text-emerald-500 uppercase tracking-wide text-[10px]">
                  {selectedEmp.status}
                </span>
              </div>
            </div>
          </div>

          {/* Verification documents & checklist (Right/Center) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Document Checkpoints */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-3 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-zinc-400" />
                <span>Verified HR Documents</span>
              </h3>
              {selectedEmp.documents && selectedEmp.documents.length > 0 ? (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {selectedEmp.documents.map((doc, idx) => (
                    <div key={idx} className="py-3 flex justify-between items-center text-xs">
                      <div className="flex gap-2.5 items-center">
                        <FileText className="w-4 h-4 text-rose-500" />
                        <div>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200">{doc.name}</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">{doc.type}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">Uploaded {doc.date}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center bg-zinc-50 dark:bg-zinc-900/30 border border-dashed border-zinc-200 dark:border-zinc-800/80 rounded-xl text-zinc-400 text-xs leading-normal">
                  No verified credentials on file yet.<br />Drag and drop PDF credentials in settings to verify.
                </div>
              )}
            </div>

            {/* Operational Activities Timeline */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-zinc-400" />
                <span>Job Checklist & Duty parameters</span>
              </h3>
              <ul className="space-y-3.5 text-xs">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <p className="text-zinc-700 dark:text-zinc-300">Synchronized on NYC Downtown active directory credentials.</p>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <p className="text-zinc-700 dark:text-zinc-300">Enrolled on state-compliant administrative safety workshops.</p>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <p className="text-zinc-700 dark:text-zinc-300">Pending upload: Signed employment agreement file.</p>
                </li>
              </ul>
            </div>

          </div>

        </div>
      )}

      {/* Onboard Employee Drawer Form Overlay */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1">
              Onboard New Staff Member
            </h3>
            <p className="text-[11px] text-zinc-400 mb-4">
              Enter professional, organizational, and wage data. System login access is automatically provisioned.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    placeholder="Jane Doe"
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    placeholder="jane@vogueacademy.com"
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+1 (555) 0122"
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Hire Date
                  </label>
                  <input
                    type="date"
                    value={newHireDate}
                    onChange={(e) => setNewHireDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Department
                  </label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  >
                    <option value="Administration">Administration</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                    <option value="Facilities">Facilities</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Job Position
                  </label>
                  <input
                    type="text"
                    value={newPos}
                    onChange={(e) => setNewPos(e.target.value)}
                    required
                    placeholder="Admissions Advisor"
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Salary Wage Rate
                  </label>
                  <input
                    type="number"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    required
                    placeholder="3500"
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Wage Frequency
                  </label>
                  <select
                    value={newSalaryType}
                    onChange={(e) => setNewSalaryType(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="HOURLY">Hourly</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-grow py-2 text-xs font-bold border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-grow py-2 text-xs font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  Onboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
