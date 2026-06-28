/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { 
  Tenant, 
  Branch, 
  User, 
  Employee, 
  Trainer, 
  Student, 
  Task, 
  Transaction, 
  ActivityLog, 
  Notification, 
  SystemSupportTicket, 
  Attendance 
} from '../types';
import { 
  mockTenants, 
  mockBranches, 
  mockUsers, 
  mockEmployees, 
  mockTrainers, 
  mockStudents, 
  mockTasks, 
  mockTransactions, 
  mockActivities, 
  mockNotifications, 
  mockTickets 
} from '../data/mockData';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'database.json');

export interface DatabaseSchema {
  tenants: Tenant[];
  branches: Branch[];
  users: User[];
  employees: Employee[];
  trainers: Trainer[];
  students: Student[];
  tasks: Task[];
  transactions: Transaction[];
  activities: ActivityLog[];
  notifications: Notification[];
  tickets: SystemSupportTicket[];
  attendances: Attendance[];
}

// Initial attendances from erpStore.tsx
const initialAttendances: Attendance[] = [
  { id: 'att-pre1', organizationId: 'org-vogue', branchId: 'branch-vogue-dt', targetId: 'emp-1', targetName: 'Elena Smith', targetType: 'EMPLOYEE', date: '2026-06-28', status: 'PRESENT', checkIn: '08:58', checkOut: '17:00' },
  { id: 'att-pre2', organizationId: 'org-vogue', branchId: 'branch-vogue-dt', targetId: 'emp-2', targetName: 'David Kross', targetType: 'EMPLOYEE', date: '2026-06-28', status: 'PRESENT', checkIn: '09:05' },
  { id: 'att-pre3', organizationId: 'org-vogue', branchId: 'branch-vogue-dt', targetId: 'stud-1', targetName: 'Aria Thorne', targetType: 'STUDENT', date: '2026-06-28', status: 'PRESENT' },
];

class Database {
  private data!: DatabaseSchema;

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        // Build initial database state with default passwords
        this.data = {
          tenants: mockTenants.map(t => ({
            ...t,
            password: t.password || (t.id === 'org-vogue' ? 'vogue123' : t.id === 'org-elite' ? 'elite123' : t.id === 'org-alpha' ? 'alpha123' : 'password123'),
          })),
          branches: mockBranches,
          users: mockUsers.map(u => ({
            ...u,
            password: u.password || (u.id === 'user-vogue-trainer1' ? 'chloe123' : u.id === 'user-vogue-trainer2' ? 'jonah123' : u.role === 'TRAINER' ? 'trainer123' : 'password123'),
          })),
          employees: mockEmployees,
          trainers: mockTrainers.map(t => ({
            ...t,
            password: t.password || (t.id === 'trainer-1' ? 'chloe123' : t.id === 'trainer-2' ? 'jonah123' : 'trainer123'),
          })),
          students: mockStudents,
          tasks: mockTasks,
          transactions: mockTransactions,
          activities: mockActivities,
          notifications: mockNotifications,
          tickets: mockTickets,
          attendances: initialAttendances,
        };
        this.save();
      }
    } catch (error) {
      console.error('Failed to initialize or read database file:', error);
      // Fallback
      this.data = {
        tenants: [], branches: [], users: [], employees: [], trainers: [],
        students: [], tasks: [], transactions: [], activities: [], notifications: [],
        tickets: [], attendances: []
      };
    }
  }

  public save() {
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to write database file:', error);
    }
  }

  // --- QUERY ENGINE ---

  // Tenant Operations
  public getTenants(): Tenant[] {
    return this.data.tenants;
  }

  public addTenant(tenant: Tenant) {
    this.data.tenants.push(tenant);
    this.save();
  }

  public updateTenant(tenant: Tenant) {
    this.data.tenants = this.data.tenants.map(t => t.id === tenant.id ? tenant : t);
    this.save();
  }

  // Branch Operations
  public getBranches(organizationId: string): Branch[] {
    return this.data.branches.filter(b => b.organizationId === organizationId);
  }

  public getAllBranches(): Branch[] {
    return this.data.branches;
  }

  public addBranch(branch: Branch) {
    this.data.branches.push(branch);
    this.save();
  }

  // User Operations
  public getUsers(organizationId: string): User[] {
    return this.data.users.filter(u => u.organizationId === organizationId || u.role === 'SUPER_ADMIN');
  }

  public getAllUsers(): User[] {
    return this.data.users;
  }

  public addUser(user: User) {
    this.data.users.push(user);
    this.save();
  }

  public updateUser(user: User) {
    this.data.users = this.data.users.map(u => u.id === user.id ? user : u);
    this.save();
  }

  // Employee Operations
  public getEmployees(organizationId: string): Employee[] {
    return this.data.employees.filter(e => e.organizationId === organizationId);
  }

  public getAllEmployees(): Employee[] {
    return this.data.employees;
  }

  public addEmployee(employee: Employee) {
    this.data.employees.push(employee);
    this.save();
  }

  public updateEmployee(employee: Employee) {
    this.data.employees = this.data.employees.map(e => e.id === employee.id ? employee : e);
    this.save();
  }

  // Trainer Operations
  public getTrainers(organizationId: string): Trainer[] {
    return this.data.trainers.filter(t => t.organizationId === organizationId);
  }

  public getAllTrainers(): Trainer[] {
    return this.data.trainers;
  }

  public addTrainer(trainer: Trainer) {
    this.data.trainers.push(trainer);
    this.save();
  }

  public updateTrainer(trainer: Trainer) {
    this.data.trainers = this.data.trainers.map(t => t.id === trainer.id ? trainer : t);
    this.save();
  }

  // Student Operations
  public getStudents(organizationId: string): Student[] {
    return this.data.students.filter(s => s.organizationId === organizationId);
  }

  public getAllStudents(): Student[] {
    return this.data.students;
  }

  public addStudent(student: Student) {
    this.data.students.push(student);
    this.save();
  }

  public updateStudent(student: Student) {
    this.data.students = this.data.students.map(s => s.id === student.id ? student : s);
    this.save();
  }

  // Task Operations
  public getTasks(organizationId: string): Task[] {
    return this.data.tasks.filter(t => t.organizationId === organizationId);
  }

  public getAllTasks(): Task[] {
    return this.data.tasks;
  }

  public addTask(task: Task) {
    this.data.tasks.push(task);
    this.save();
  }

  public updateTask(task: Task) {
    this.data.tasks = this.data.tasks.map(t => t.id === task.id ? task : t);
    this.save();
  }

  // Transaction Operations
  public getTransactions(organizationId: string): Transaction[] {
    return this.data.transactions.filter(t => t.organizationId === organizationId);
  }

  public getAllTransactions(): Transaction[] {
    return this.data.transactions;
  }

  public addTransaction(tx: Transaction) {
    this.data.transactions.push(tx);
    this.save();
  }

  // Attendance Operations
  public getAttendances(organizationId: string): Attendance[] {
    return this.data.attendances.filter(a => a.organizationId === organizationId);
  }

  public getAllAttendances(): Attendance[] {
    return this.data.attendances;
  }

  public addAttendance(attendance: Attendance) {
    this.data.attendances.push(attendance);
    this.save();
  }

  public updateAttendance(attendance: Attendance) {
    this.data.attendances = this.data.attendances.map(a => a.id === attendance.id ? attendance : a);
    this.save();
  }

  // Activities Operations
  public getActivities(organizationId: string): ActivityLog[] {
    return this.data.activities.filter(a => a.organizationId === organizationId);
  }

  public addActivity(activity: ActivityLog) {
    this.data.activities.unshift(activity); // Insert at beginning (newest first)
    if (this.data.activities.length > 200) {
      this.data.activities.pop(); // Keep manageable size
    }
    this.save();
  }

  // Notifications Operations
  public getNotifications(organizationId: string): Notification[] {
    return this.data.notifications.filter(n => n.organizationId === organizationId);
  }

  public addNotification(notification: Notification) {
    this.data.notifications.unshift(notification);
    this.save();
  }

  public updateNotification(notification: Notification) {
    this.data.notifications = this.data.notifications.map(n => n.id === notification.id ? notification : n);
    this.save();
  }

  public clearAllNotifications(organizationId: string) {
    this.data.notifications = this.data.notifications.filter(n => n.organizationId !== organizationId);
    this.save();
  }

  // Tickets Operations
  public getTickets(): SystemSupportTicket[] {
    return this.data.tickets;
  }

  public addTicket(ticket: SystemSupportTicket) {
    this.data.tickets.push(ticket);
    this.save();
  }

  public updateTicket(ticket: SystemSupportTicket) {
    this.data.tickets = this.data.tickets.map(t => t.id === ticket.id ? ticket : t);
    this.save();
  }
}

export const db = new Database();
