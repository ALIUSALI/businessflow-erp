/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useErp } from '../store/erpStore';
import {
  CalendarDays,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  BookmarkCheck,
  ChevronRight
} from 'lucide-react';

export default function Attendance() {
  const {
    employees,
    students,
    attendances,
    clockEmployee,
    markStudentAttendance,
    currentTenantId,
    currentBranchId
  } = useErp();

  const [attendanceType, setAttendanceType] = useState<'EMPLOYEES' | 'STUDENTS'>('EMPLOYEES');
  const [selectedCourse, setSelectedCourse] = useState('Cosmetology 101');

  const todayStr = new Date().toISOString().split('T')[0];

  // Filters
  const branchEmployees = employees.filter(e => e.organizationId === currentTenantId && e.branchId === currentBranchId && e.status === 'ACTIVE');
  const branchStudents = students.filter(s => s.organizationId === currentTenantId && s.branchId === currentBranchId && s.status === 'ACTIVE');
  const courseStudents = branchStudents.filter(s => s.assignedCourse === selectedCourse);

  // Derive counts
  const branchAttendances = attendances.filter(a => a.organizationId === currentTenantId && a.branchId === currentBranchId && a.date === todayStr);

  const empPresentCount = branchEmployees.filter(e => {
    const record = branchAttendances.find(a => a.targetId === e.id && a.targetType === 'EMPLOYEE');
    return record?.status === 'PRESENT' || record?.status === 'LATE';
  }).length;

  const studPresentCount = courseStudents.filter(s => {
    const record = branchAttendances.find(a => a.targetId === s.id && a.targetType === 'STUDENT');
    return record?.status === 'PRESENT' || record?.status === 'LATE' || record?.status === 'EXCUSED';
  }).length;

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-display text-zinc-900 dark:text-zinc-50">
            Attendance Console
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Log employee workhour clocks and manage students course roll-call rosters.
          </p>
        </div>
        <div className="text-xs font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700/60 font-mono">
          Today: {todayStr}
        </div>
      </div>

      {/* Switcher Controls bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl shadow-xs">
        <div className="flex gap-1.5 bg-zinc-100 dark:bg-zinc-800/60 p-1 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setAttendanceType('EMPLOYEES')}
            className={`flex-grow sm:flex-grow-0 px-4 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              attendanceType === 'EMPLOYEES'
                ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Employee Clocks
          </button>
          <button
            onClick={() => setAttendanceType('STUDENTS')}
            className={`flex-grow sm:flex-grow-0 px-4 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              attendanceType === 'STUDENTS'
                ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Student Roll-Calls
          </button>
        </div>

        {attendanceType === 'STUDENTS' && (
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden w-full sm:w-56"
          >
            <option value="Cosmetology 101">Cosmetology 101</option>
            <option value="Hair Styling Foundations">Hair Styling Foundations</option>
            <option value="Advanced Nail Art">Advanced Nail Art</option>
            <option value="Men's Barbering Masterclass">Men's Barbering Masterclass</option>
          </select>
        )}
      </div>

      {/* Primary Console Area */}
      {attendanceType === 'EMPLOYEES' ? (
        <div className="space-y-4">
          
          {/* Employee stats banner */}
          <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-500" />
              <span className="font-semibold text-indigo-800 dark:text-indigo-400">On Duty Today:</span>
            </div>
            <span className="font-extrabold text-indigo-700 dark:text-indigo-300">
              {empPresentCount} / {branchEmployees.length} Clocked In
            </span>
          </div>

          {/* Employee Clocks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branchEmployees.map((emp) => {
              const record = branchAttendances.find(a => a.targetId === emp.id && a.targetType === 'EMPLOYEE');
              return (
                <div
                  key={emp.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/85 p-4 rounded-2xl shadow-xs flex justify-between items-center group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center flex-shrink-0">
                      {emp.profilePhoto ? (
                        <img src={emp.profilePhoto} alt={emp.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-xs font-bold text-zinc-500">{emp.fullName[0]}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-950 dark:text-zinc-50">{emp.fullName}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{emp.position}</p>
                      {record && (
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-zinc-400 font-mono">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-zinc-400" /> In: {record.checkIn}</span>
                          {record.checkOut && <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-zinc-400" /> Out: {record.checkOut}</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick CheckIn togglers */}
                  <div className="flex gap-1.5">
                    {!record ? (
                      <>
                        <button
                          onClick={() => clockEmployee(emp.id, 'PRESENT')}
                          className="px-2.5 py-1 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 rounded-lg hover:bg-emerald-100 cursor-pointer"
                        >
                          Clock In
                        </button>
                        <button
                          onClick={() => clockEmployee(emp.id, 'LATE')}
                          className="px-2.5 py-1 text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 rounded-lg hover:bg-amber-100 cursor-pointer"
                        >
                          Late
                        </button>
                      </>
                    ) : !record.checkOut ? (
                      <button
                        onClick={() => clockEmployee(emp.id, 'PRESENT', record.checkIn, new Date().toTimeString().split(' ')[0].substring(0, 5))}
                        className="px-2.5 py-1 text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 rounded-lg hover:bg-rose-100 cursor-pointer"
                      >
                        Clock Out
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-bold bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded-md">
                        <CheckCircle className="w-3.5 h-3.5 text-zinc-400" /> Completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      ) : (
        /* Students Daily roll-call Sheet view */
        <div className="space-y-4">
          
          {/* Class Attendance Summary Bar */}
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-blue-800 dark:text-blue-400">Class present count:</span>
            </div>
            <span className="font-extrabold text-blue-700 dark:text-blue-300">
              {studPresentCount} / {courseStudents.length} Students Active
            </span>
          </div>

          {/* Students list */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
            {courseStudents.length > 0 ? (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {courseStudents.map((stud) => {
                  const record = branchAttendances.find(a => a.targetId === stud.id && a.targetType === 'STUDENT');
                  return (
                    <div
                      key={stud.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-950 dark:text-zinc-50">{stud.fullName}</p>
                          <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Enrollment ID: {stud.admissionNumber}</p>
                        </div>
                      </div>

                      {/* State board toggling pills */}
                      <div className="flex gap-1.5 flex-wrap">
                        <button
                          onClick={() => markStudentAttendance(stud.id, 'PRESENT')}
                          className={`px-3 py-1 text-[10px] font-bold rounded-lg border cursor-pointer ${
                            record?.status === 'PRESENT'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40 font-extrabold'
                              : 'border-zinc-200 text-zinc-500 dark:border-zinc-800 hover:bg-zinc-50'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => markStudentAttendance(stud.id, 'LATE')}
                          className={`px-3 py-1 text-[10px] font-bold rounded-lg border cursor-pointer ${
                            record?.status === 'LATE'
                              ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40 font-extrabold'
                              : 'border-zinc-200 text-zinc-500 dark:border-zinc-800 hover:bg-zinc-50'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          onClick={() => markStudentAttendance(stud.id, 'ABSENT')}
                          className={`px-3 py-1 text-[10px] font-bold rounded-lg border cursor-pointer ${
                            record?.status === 'ABSENT'
                              ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40 font-extrabold'
                              : 'border-zinc-200 text-zinc-500 dark:border-zinc-800 hover:bg-zinc-50'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => markStudentAttendance(stud.id, 'EXCUSED')}
                          className={`px-3 py-1 text-[10px] font-bold rounded-lg border cursor-pointer ${
                            record?.status === 'EXCUSED'
                              ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/40 font-extrabold'
                              : 'border-zinc-200 text-zinc-500 dark:border-zinc-800 hover:bg-zinc-50'
                          }`}
                        >
                          Excused
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center text-zinc-400">
                No students enrolled in {selectedCourse} for this branch.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
