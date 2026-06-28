/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ORG_OWNER'
  | 'BRANCH_MANAGER'
  | 'HR_ADMIN'
  | 'FINANCE_OFFICER'
  | 'TRAINER'
  | 'EMPLOYEE'
  | 'STUDENT';

export interface Tenant {
  id: string;
  name: string;
  logoUrl?: string;
  currency: string;
  timezone: string;
  language: string;
  businessType: string;
  subscriptionStatus: 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'EXPIRED';
  createdAt: string;
  password?: string;
}

export interface Branch {
  id: string;
  organizationId: string;
  name: string;
  location: string;
  phone: string;
  email: string;
}

export interface User {
  id: string;
  organizationId: string;
  branchId?: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'INVITED';
  password?: string;
}

export interface Employee {
  id: string;
  organizationId: string;
  branchId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  salary: number;
  salaryType: 'MONTHLY' | 'HOURLY';
  status: 'ACTIVE' | 'ARCHIVED' | 'LEAVE';
  hireDate: string;
  profilePhoto?: string;
  documents: Array<{ name: string; type: string; url?: string; date: string }>;
  tasksAssigned: number;
}

export interface Trainer {
  id: string;
  organizationId: string;
  branchId: string;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  assignedCourses: string[]; // e.g., ["Cosmetology 101", "Hair Styling Foundations"]
  status: 'ACTIVE' | 'ARCHIVED';
  timetable: Array<{ day: string; time: string; course: string; room: string }>;
  dailyReports: Array<{ id: string; date: string; content: string; studentsCount: number }>;
  password?: string;
}

export interface Student {
  id: string;
  organizationId: string;
  branchId: string;
  fullName: string;
  admissionNumber: string;
  email: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  assignedCourse: string;
  assignedTrainerId?: string;
  totalFees: number;
  feesPaid: number;
  status: 'ACTIVE' | 'GRADUATED' | 'SUSPENDED';
  attendanceRate: number; // percentage
  documents: Array<{ name: string; url?: string; date: string }>;
  academicProgress: Array<{ subject: string; grade: string; date: string }>;
}

export interface Attendance {
  id: string;
  organizationId: string;
  branchId: string;
  targetId: string; // Employee ID or Student ID
  targetName: string;
  targetType: 'EMPLOYEE' | 'STUDENT';
  date: string; // YYYY-MM-DD
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
  checkIn?: string; // HH:MM
  checkOut?: string; // HH:MM
}

export interface Task {
  id: string;
  organizationId: string;
  branchId: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string;
  assigneeId: string;
  assigneeName: string;
  creatorId: string;
  creatorName: string;
  comments: TaskComment[];
  attachments: string[]; // array of filenames
}

export interface TaskComment {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  organizationId: string;
  branchId: string;
  type: 'INCOME' | 'EXPENSE';
  category: string; // e.g., "Student Fees", "Supplies", "Salaries"
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'MOBILE_MONEY';
  recordedBy: string;
}

export interface ActivityLog {
  id: string;
  organizationId: string;
  userId: string;
  userFullName: string;
  role: UserRole;
  action: string;
  module: string; // e.g., "AUTHENTICATION", "FINANCE", "STUDENTS"
  timestamp: string;
}

export interface Notification {
  id: string;
  organizationId: string;
  title: string;
  content: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  date: string;
  isRead: boolean;
}

export interface SuperAdminAnalytics {
  totalOrganizations: number;
  totalUsers: number;
  activeLicenses: number;
  trialLicenses: number;
  platformMonthlyRevenue: number;
  systemHealth: 'HEALTHY' | 'DEGRADED' | 'MAINTENANCE';
}

export interface SystemSupportTicket {
  id: string;
  tenantName: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
}
