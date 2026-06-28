/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useErp } from '../store/erpStore';
import { Student } from '../types';
import {
  Search,
  Plus,
  Mail,
  Phone,
  DollarSign,
  Award,
  BookOpen,
  ArrowLeft,
  CreditCard,
  FileText,
  Bookmark,
  Percent
} from 'lucide-react';

export default function Students() {
  const {
    students,
    trainers,
    addStudent,
    recordFeePayment,
    currentTenantId,
    currentBranchId,
    tenants
  } = useErp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Fee transaction state
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'CARD' | 'CASH' | 'TRANSFER' | 'MOBILE_MONEY'>('TRANSFER');

  // Registration state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newGuardian, setNewGuardian] = useState('');
  const [newGuardianPhone, setNewGuardianPhone] = useState('');
  const [newCourse, setNewCourse] = useState('Cosmetology 101');
  const [newTrainerId, setNewTrainerId] = useState('');
  const [newTotalFees, setNewTotalFees] = useState('6500');
  const [newPaidFees, setNewPaidFees] = useState('1500');

  const activeTenant = tenants.find(t => t.id === currentTenantId) || tenants[0];
  const tenantCurrency = activeTenant.currency || '$';

  // Filter students
  const tenantStudents = students.filter(s => s.organizationId === currentTenantId);
  const filteredStudents = tenantStudents.filter(s =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.assignedCourse.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tenantTrainers = trainers.filter(t => t.organizationId === currentTenantId);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newCourse) return;

    addStudent({
      fullName: newName,
      admissionNumber: `VBA-2026-${Math.floor(Math.random() * 800) + 100}`,
      email: newEmail,
      phone: newPhone || '+1 (555) 0180',
      guardianName: newGuardian || 'N/A',
      guardianPhone: newGuardianPhone || 'N/A',
      assignedCourse: newCourse,
      assignedTrainerId: newTrainerId || undefined,
      totalFees: Number(newTotalFees),
      feesPaid: Number(newPaidFees),
      status: 'ACTIVE',
      documents: [],
      academicProgress: [
        { subject: 'Theory Orientation', grade: 'A', date: new Date().toISOString().split('T')[0] }
      ]
    });

    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewGuardian('');
    setNewGuardianPhone('');
    setNewCourse('Cosmetology 101');
    setNewTrainerId('');
    setNewTotalFees('6500');
    setNewPaidFees('1500');
    setShowAddModal(false);
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !payAmount || isNaN(Number(payAmount))) return;

    recordFeePayment(selectedStudent.id, Number(payAmount), payMethod);
    
    // Refresh detailed panel after payment logic update
    const updated = students.find(s => s.id === selectedStudent.id);
    if (updated) {
      setSelectedStudent({
        ...updated,
        feesPaid: updated.feesPaid + Number(payAmount)
      });
    }

    setPayAmount('');
    setShowPayModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      {!selectedStudent ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-display text-zinc-900 dark:text-zinc-50">
              Student Admissions
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Manage student enrollment rosters, course syllabi, fee ledger sheets, and state board hours.
            </p>
          </div>
          <button
            onClick={() => {
              if (tenantTrainers.length > 0) {
                setNewTrainerId(tenantTrainers[0].id);
              }
              setShowAddModal(true);
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Admit Student</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedStudent(null)}
            className="p-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {selectedStudent.fullName}
            </h1>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              ID: {selectedStudent.admissionNumber} • Course: {selectedStudent.assignedCourse}
            </p>
          </div>
        </div>
      )}

      {/* Main Panel views */}
      {!selectedStudent ? (
        <div className="space-y-4">
          
          {/* Controls toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-xl shadow-xs">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Active Roster: {filteredStudents.length} Students
            </span>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search by name, ID, or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-400 uppercase font-bold tracking-wider text-[10px]">
                    <th className="p-4">Student Dossier</th>
                    <th className="p-4">Assigned Course</th>
                    <th className="p-4">Attendance Rate</th>
                    <th className="p-4">Outstanding Balance</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                  {filteredStudents.map((stud) => {
                    const balance = stud.totalFees - stud.feesPaid;
                    return (
                      <tr key={stud.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-zinc-900 dark:text-zinc-50">{stud.fullName}</p>
                          <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{stud.admissionNumber}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-zinc-800 dark:text-zinc-200">{stud.assignedCourse}</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">
                            Instructor: {tenantTrainers.find(t => t.id === stud.assignedTrainerId)?.fullName || 'N/A'}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <Percent className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="font-bold">{stud.attendanceRate}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className={`font-bold ${balance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {tenantCurrency}{balance.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">Paid: {tenantCurrency}{stud.feesPaid.toLocaleString()}</p>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider ${
                            stud.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                              : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
                          }`}>
                            {stud.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedStudent(stud)}
                            className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 hover:underline cursor-pointer"
                          >
                            Details & Bills
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        /* Student dossier expanded file detail */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-150">
          
          {/* Roster sidebar billing summaries */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Roster File metadata */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs space-y-4">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Admission Details</span>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-1">Guardian: {selectedStudent.guardianName}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Contact: {selectedStudent.guardianPhone}</p>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Student Contacts</span>
                <div className="space-y-1 mt-1 text-xs">
                  <p className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300"><Mail className="w-3.5 h-3.5 text-zinc-400" /> {selectedStudent.email}</p>
                  <p className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300"><Phone className="w-3.5 h-3.5 text-zinc-400" /> {selectedStudent.phone}</p>
                </div>
              </div>
            </div>

            {/* Financial tuition bill card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-zinc-400" />
                <span>Tuition Ledger Profile</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Program Cost:</span>
                  <span className="font-semibold">{tenantCurrency}{selectedStudent.totalFees.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Paid Installments:</span>
                  <span className="font-semibold text-emerald-500">{tenantCurrency}{selectedStudent.feesPaid.toLocaleString()}</span>
                </div>
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2 flex justify-between text-sm">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">Outstanding balance:</span>
                  <span className="font-extrabold text-amber-600">
                    {tenantCurrency}{(selectedStudent.totalFees - selectedStudent.feesPaid).toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedStudent.totalFees - selectedStudent.feesPaid > 0 && (
                <button
                  onClick={() => setShowPayModal(true)}
                  className="w-full py-2 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 font-bold text-xs text-white rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Log Tuition Payment</span>
                </button>
              )}
            </div>

          </div>

          {/* Academic progress, exams, and files logs (Right Side) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Academic Grade report */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-zinc-400" />
                <span>State Board Grading & Practical Exams</span>
              </h3>
              {selectedStudent.academicProgress && selectedStudent.academicProgress.length > 0 ? (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {selectedStudent.academicProgress.map((prog, idx) => (
                    <div key={idx} className="py-3 flex justify-between items-center text-xs">
                      <div className="flex gap-2.5 items-center">
                        <Bookmark className="w-4 h-4 text-indigo-500" />
                        <div>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200">{prog.subject}</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">Recorded: {prog.date}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 font-bold text-xs text-zinc-800 dark:text-zinc-200 rounded-md">
                        {prog.grade}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400 text-xs">
                  No academic test grades filed yet.
                </div>
              )}
            </div>

            {/* Document Verification checks */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-zinc-400" />
                <span>Onboarding Credentials Verified</span>
              </h3>
              {selectedStudent.documents && selectedStudent.documents.length > 0 ? (
                <div className="space-y-3.5 text-xs">
                  {selectedStudent.documents.map((doc, i) => (
                    <div key={i} className="flex justify-between items-center py-1.5">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-rose-500" />
                        <span className="font-medium">{doc.name}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">Logged {doc.date}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400 text-xs leading-normal">
                  No high-school transcripts or vaccination PDF records validated yet.<br />Drag files into settings to verify admissions credentials.
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Log Student Tuition Payment Modal */}
      {showPayModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1">
              Log Tuition Installment Payment
            </h3>
            <p className="text-[11px] text-zinc-400 mb-4">
              Log payments against student fees ledger. Outflows will reflect in cashbook.
            </p>

            <form onSubmit={handlePaySubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                  Payment Amount ({tenantCurrency})
                </label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  required
                  max={selectedStudent.totalFees - selectedStudent.feesPaid}
                  placeholder="1000"
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                />
                <p className="text-[10px] text-amber-600 mt-1 font-semibold">
                  Max allowable payment: {tenantCurrency}{(selectedStudent.totalFees - selectedStudent.feesPaid).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                  Payment Method
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                >
                  <option value="TRANSFER">Bank Wire Transfer</option>
                  <option value="CARD">Credit/Debit Card</option>
                  <option value="CASH">Cash Drawer</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="flex-grow py-2 text-xs font-bold border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-grow py-2 text-xs font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  Post Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Student Admission Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1">
              Admit New Student
            </h3>
            <p className="text-[11px] text-zinc-400 mb-4">
              Enter academic, guardian, and tuition parameters to execute VBA enrollment guidelines.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    placeholder="E.g., Alice Vance"
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
                    placeholder="alice@gmail.com"
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Student Phone
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+1 (555) 0188"
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Program Course
                  </label>
                  <select
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  >
                    <option value="Cosmetology 101">Cosmetology 101</option>
                    <option value="Hair Styling Foundations">Hair Styling Foundations</option>
                    <option value="Advanced Nail Art">Advanced Nail Art</option>
                    <option value="Men's Barbering Masterclass">Men's Barbering Masterclass</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Guardian Name
                  </label>
                  <input
                    type="text"
                    value={newGuardian}
                    onChange={(e) => setNewGuardian(e.target.value)}
                    placeholder="E.g., Mary Vance"
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Guardian Phone
                  </label>
                  <input
                    type="text"
                    value={newGuardianPhone}
                    onChange={(e) => setNewGuardianPhone(e.target.value)}
                    placeholder="+1 (555) 0189"
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Total Tuition Cost ({tenantCurrency})
                  </label>
                  <input
                    type="number"
                    value={newTotalFees}
                    onChange={(e) => setNewTotalFees(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    First Installment Payment ({tenantCurrency})
                  </label>
                  <input
                    type="number"
                    value={newPaidFees}
                    onChange={(e) => setNewPaidFees(e.target.value)}
                    required
                    max={newTotalFees}
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                  Assigned Instructor
                </label>
                <select
                  value={newTrainerId}
                  onChange={(e) => setNewTrainerId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                >
                  <option value="">No Trainer Assigned</option>
                  {tenantTrainers.map((t) => (
                    <option key={t.id} value={t.id}>{t.fullName}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-grow py-2 text-xs font-bold border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-grow py-2 text-xs font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  Admit Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
