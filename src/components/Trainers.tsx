/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useErp } from '../store/erpStore';
import { Trainer } from '../types';
import {
  Search,
  Plus,
  BookOpen,
  Calendar,
  FileText,
  Briefcase,
  UserCheck,
  Check,
  Award,
  Clock
} from 'lucide-react';

export default function Trainers() {
  const {
    trainers,
    addTrainer,
    submitTrainerReport,
    currentTenantId,
    currentUser
  } = useErp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  
  // Submit Report form states
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportTrainerId, setReportTrainerId] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [reportCount, setReportCount] = useState('10');

  // Add Trainer States
  const [showAddTrainer, setShowAddTrainer] = useState(false);
  const [trainerName, setTrainerName] = useState('');
  const [trainerEmail, setTrainerEmail] = useState('');
  const [trainerPhone, setTrainerPhone] = useState('');
  const [trainerSpec, setTrainerSpec] = useState('Cosmetology & Hair Styling');
  const [trainerCourse, setTrainerCourse] = useState('');
  const [trainerPassword, setTrainerPassword] = useState('');

  // Filter trainers
  const tenantTrainers = trainers.filter(t => t.organizationId === currentTenantId);
  const filteredTrainers = tenantTrainers.filter(t =>
    t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTrainer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainerName || !trainerEmail || !trainerSpec) return;

    addTrainer({
      fullName: trainerName,
      email: trainerEmail,
      phone: trainerPhone || '+1 (555) 0199',
      specialization: trainerSpec,
      assignedCourses: trainerCourse ? [trainerCourse] : ['Cosmetology 101'],
      status: 'ACTIVE',
      password: trainerPassword || 'trainer123'
    });

    setTrainerName('');
    setTrainerEmail('');
    setTrainerPhone('');
    setTrainerSpec('Cosmetology & Hair Styling');
    setTrainerCourse('');
    setTrainerPassword('');
    setShowAddTrainer(false);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTrainerId || !reportContent || !reportCount) return;

    submitTrainerReport(reportTrainerId, reportContent, Number(reportCount));
    setReportContent('');
    setReportCount('10');
    setShowReportForm(false);
  };

  // If logged in user is a TRAINER, pre-select them for faster workspace flow!
  const isTrainerUser = currentUser.role === 'TRAINER';
  const loggedInTrainer = tenantTrainers.find(t => t.email === currentUser.email);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-display text-zinc-900 dark:text-zinc-50">
            Trainers & Instructors
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Coordinate educators, verify course timetables, and compile daily training reports.
          </p>
        </div>
        <div className="flex gap-2">
          {/* Trainer Quick Report */}
          <button
            onClick={() => {
              if (isTrainerUser && loggedInTrainer) {
                setReportTrainerId(loggedInTrainer.id);
              } else if (tenantTrainers.length > 0) {
                setReportTrainerId(tenantTrainers[0].id);
              }
              setShowReportForm(true);
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Submit Daily Class Report</span>
          </button>

          {currentUser.role !== 'TRAINER' && (
            <button
              onClick={() => setShowAddTrainer(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Instructor</span>
            </button>
          )}
        </div>
      </div>

      {/* Main split dashboard pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Instructors List (Left Side) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-2xl shadow-xs space-y-3.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search instructors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-1.5 max-h-[450px] overflow-y-auto">
              {filteredTrainers.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTrainer(t)}
                  className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedTrainer?.id === t.id
                      ? 'bg-zinc-100 border-zinc-300 dark:bg-zinc-850 dark:border-zinc-700 text-zinc-950 dark:text-zinc-50 font-semibold'
                      : 'border-zinc-100 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  <p className="text-xs font-bold truncate">{t.fullName}</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 truncate">{t.specialization}</p>
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {t.assignedCourses.map((c, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-zinc-200/60 dark:bg-zinc-800 text-[8px] text-zinc-600 dark:text-zinc-400 rounded-sm">
                        {c}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Instructor Profile Schedule (Right Side) */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTrainer ? (
            <div className="space-y-6">
              
              {/* Profile Card */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                    <Award className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{selectedTrainer.fullName}</h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{selectedTrainer.specialization}</p>
                    <p className="text-[9px] text-zinc-500 mt-1">{selectedTrainer.email} • {selectedTrainer.phone}</p>
                    {selectedTrainer.password && (
                      <p className="text-[9px] text-zinc-500 mt-1.5 bg-zinc-50 dark:bg-zinc-800/40 px-2 py-1 rounded-lg inline-flex items-center gap-1 border border-zinc-150 dark:border-zinc-800">
                        <span>Account Password:</span>
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{selectedTrainer.password}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-850 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center">
                  <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-50">{selectedTrainer.dailyReports.length}</p>
                  <p className="text-[8px] uppercase font-bold tracking-wider text-zinc-400 mt-0.5">Submitted Reports</p>
                </div>
              </div>

              {/* Weekly Timetable Timetable */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  <span>Instructor Course Timetable</span>
                </h3>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {selectedTrainer.timetable.map((slot, i) => (
                    <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 rounded-sm w-20 text-center">
                          {slot.day}
                        </span>
                        <p className="font-semibold text-zinc-800 dark:text-zinc-200">{slot.course}</p>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-zinc-400 font-mono">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {slot.time}</span>
                        <span>{slot.room}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Training Reports historical log */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  <span>Submitted Class Reports</span>
                </h3>
                {selectedTrainer.dailyReports && selectedTrainer.dailyReports.length > 0 ? (
                  <div className="space-y-4">
                    {selectedTrainer.dailyReports.map((rep, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/30 text-xs leading-normal">
                        <div className="flex justify-between items-center mb-1.5 text-[10px] text-zinc-400">
                          <span className="font-semibold">Log Date: {rep.date}</span>
                          <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-sm font-bold">
                            {rep.studentsCount} Students Active
                          </span>
                        </div>
                        <p className="text-zinc-700 dark:text-zinc-300">{rep.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400 rounded-xl leading-normal">
                    No classroom activity reports filed yet.<br />Instructors can file reports using the button above.
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="py-28 text-center bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <BookOpen className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Select an Instructor</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Choose a faculty member on the left to review schedules and course logs.</p>
            </div>
          )}
        </div>

      </div>

      {/* Submit Daily Class Report Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1">
              Submit Daily Classroom Report
            </h3>
            <p className="text-[11px] text-zinc-400 mb-4">
              Record safety audits, topics discussed, and attendance head counts.
            </p>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                  Reporting Instructor
                </label>
                <select
                  value={reportTrainerId}
                  onChange={(e) => setReportTrainerId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                >
                  {tenantTrainers.map((t) => (
                    <option key={t.id} value={t.id}>{t.fullName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Date of Class
                  </label>
                  <input
                    type="text"
                    value={new Date().toISOString().split('T')[0]}
                    disabled
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 text-zinc-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Student Headcount
                  </label>
                  <input
                    type="number"
                    value={reportCount}
                    onChange={(e) => setReportCount(e.target.value)}
                    required
                    min="1"
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                  Instruction summary & State Board Compliance Notes
                </label>
                <textarea
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  required
                  rows={4}
                  placeholder="Demoed thermal styling today. Covered straight razor sanitization procedures. Students completed practical sectioning mock assessments safely."
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="flex-grow py-2 text-xs font-bold border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-grow py-2 text-xs font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  Submit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Instructor Modal */}
      {showAddTrainer && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1">
              Add New Instructor Profile
            </h3>
            <p className="text-[11px] text-zinc-400 mb-4">
              Enter specialized training qualifications and course catalog listings.
            </p>

            <form onSubmit={handleAddTrainer} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                  Full Instructor Name
                </label>
                <input
                  type="text"
                  value={trainerName}
                  onChange={(e) => setTrainerName(e.target.value)}
                  required
                  placeholder="Mr. Marcus Vance"
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={trainerEmail}
                  onChange={(e) => setTrainerEmail(e.target.value)}
                  required
                  placeholder="marcus@vogueacademy.com"
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={trainerSpec}
                    onChange={(e) => setTrainerSpec(e.target.value)}
                    required
                    placeholder="Esthetics & Skin Care"
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Assigned Course
                  </label>
                  <input
                    type="text"
                    value={trainerCourse}
                    onChange={(e) => setTrainerCourse(e.target.value)}
                    placeholder="Esthetics Basics"
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                  Trainer Login Password
                </label>
                <input
                  type="password"
                  value={trainerPassword}
                  onChange={(e) => setTrainerPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddTrainer(false)}
                  className="flex-grow py-2 text-xs font-bold border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-grow py-2 text-xs font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  Add Instructor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
