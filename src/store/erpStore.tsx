/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant, Branch, User, Employee, Trainer, Student, Task, Transaction, ActivityLog, Notification, SystemSupportTicket, UserRole, Attendance } from '../types';
import { mockTenants, mockBranches, mockUsers, mockEmployees, mockTrainers, mockStudents, mockTasks, mockTransactions, mockActivities, mockNotifications, mockTickets } from '../data/mockData';

interface ErpContextProps {
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
  
  currentTenantId: string;
  currentBranchId: string;
  currentUser: User;
  
  // App-level state
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toast: { message: string; type: 'success' | 'info' | 'error' | 'warning' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
  hideToast: () => void;
  
  // Auth & switches
  switchTenant: (tenantId: string) => void;
  switchBranch: (branchId: string) => void;
  switchUser: (userId: string) => void;
  registerOrganization: (orgData: { name: string; businessType: string; currency: string; ownerName: string; ownerEmail: string; password?: string }) => void;
  
  // Operations
  addEmployee: (emp: Omit<Employee, 'id' | 'organizationId' | 'branchId' | 'tasksAssigned'>) => void;
  archiveEmployee: (id: string) => void;
  updateEmployee: (emp: Employee) => void;
  
  addStudent: (stud: Omit<Student, 'id' | 'organizationId' | 'branchId' | 'attendanceRate'>) => void;
  recordFeePayment: (studentId: string, amount: number, paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'MOBILE_MONEY') => void;
  
  addTrainer: (trainer: Omit<Trainer, 'id' | 'organizationId' | 'branchId' | 'dailyReports' | 'timetable'>) => void;
  submitTrainerReport: (trainerId: string, content: string, count: number) => void;
  
  clockEmployee: (employeeId: string, status: 'PRESENT' | 'LATE' | 'ABSENT', checkIn?: string, checkOut?: string) => void;
  markStudentAttendance: (studentId: string, status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED') => void;
  
  createTask: (task: Omit<Task, 'id' | 'organizationId' | 'branchId' | 'creatorId' | 'creatorName' | 'comments'>) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  addTaskComment: (taskId: string, commentText: string) => void;
  
  recordTransaction: (tx: Omit<Transaction, 'id' | 'organizationId' | 'branchId' | 'recordedBy'>) => void;
  
  // Notifications / Activity
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  addActivity: (action: string, module: string) => void;
  
  // Super Admin functions
  toggleTenantSubscription: (tenantId: string) => void;
  updateTicketStatus: (ticketId: string, status: SystemSupportTicket['status']) => void;
}

const ErpContext = createContext<ErpContextProps | undefined>(undefined);

export function ErpProvider({ children }: { children: React.ReactNode }) {
  // Lists
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const local = localStorage.getItem('bf_tenants');
    const loaded = local ? JSON.parse(local) : mockTenants;
    return loaded.map((t: Tenant) => {
      if (!t.password) {
        if (t.id === 'org-vogue') t.password = 'vogue123';
        else if (t.id === 'org-elite') t.password = 'elite123';
        else if (t.id === 'org-alpha') t.password = 'alpha123';
        else t.password = 'password123';
      }
      return t;
    });
  });
  
  const [branches, setBranches] = useState<Branch[]>(() => {
    const local = localStorage.getItem('bf_branches');
    return local ? JSON.parse(local) : mockBranches;
  });
  
  const [users, setUsers] = useState<User[]>(() => {
    const local = localStorage.getItem('bf_users');
    const loaded = local ? JSON.parse(local) : mockUsers;
    return loaded.map((u: User) => {
      if (!u.password) {
        if (u.id === 'user-vogue-trainer1') u.password = 'chloe123';
        else if (u.id === 'user-vogue-trainer2') u.password = 'jonah123';
        else if (u.role === 'TRAINER') u.password = 'trainer123';
      }
      return u;
    });
  });
  
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const local = localStorage.getItem('bf_employees');
    return local ? JSON.parse(local) : mockEmployees;
  });
  
  const [trainers, setTrainers] = useState<Trainer[]>(() => {
    const local = localStorage.getItem('bf_trainers');
    const loaded = local ? JSON.parse(local) : mockTrainers;
    return loaded.map((t: Trainer) => {
      if (!t.password) {
        if (t.id === 'trainer-1') t.password = 'chloe123';
        else if (t.id === 'trainer-2') t.password = 'jonah123';
        else t.password = 'trainer123';
      }
      return t;
    });
  });
  
  const [students, setStudents] = useState<Student[]>(() => {
    const local = localStorage.getItem('bf_students');
    return local ? JSON.parse(local) : mockStudents;
  });
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    const local = localStorage.getItem('bf_tasks');
    return local ? JSON.parse(local) : mockTasks;
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const local = localStorage.getItem('bf_transactions');
    return local ? JSON.parse(local) : mockTransactions;
  });
  
  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    const local = localStorage.getItem('bf_activities');
    return local ? JSON.parse(local) : mockActivities;
  });
  
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const local = localStorage.getItem('bf_notifications');
    return local ? JSON.parse(local) : mockNotifications;
  });
  
  const [tickets, setTickets] = useState<SystemSupportTicket[]>(() => {
    const local = localStorage.getItem('bf_tickets');
    return local ? JSON.parse(local) : mockTickets;
  });

  const [attendances, setAttendances] = useState<Attendance[]>(() => {
    const local = localStorage.getItem('bf_attendances');
    return local ? JSON.parse(local) : [
      { id: 'att-pre1', organizationId: 'org-vogue', branchId: 'branch-vogue-dt', targetId: 'emp-1', targetName: 'Elena Smith', targetType: 'EMPLOYEE', date: '2026-06-28', status: 'PRESENT', checkIn: '08:58', checkOut: '17:00' },
      { id: 'att-pre2', organizationId: 'org-vogue', branchId: 'branch-vogue-dt', targetId: 'emp-2', targetName: 'David Kross', targetType: 'EMPLOYEE', date: '2026-06-28', status: 'PRESENT', checkIn: '09:05' },
      { id: 'att-pre3', organizationId: 'org-vogue', branchId: 'branch-vogue-dt', targetId: 'stud-1', targetName: 'Aria Thorne', targetType: 'STUDENT', date: '2026-06-28', status: 'PRESENT' },
      { id: 'att-pre4', organizationId: 'org-vogue', branchId: 'branch-vogue-dt', targetId: 'stud-2', targetName: 'Lucas Graham', targetType: 'STUDENT', date: '2026-06-28', status: 'LATE' }
    ];
  });

  // Switches
  const [currentTenantId, setCurrentTenantId] = useState<string>(() => {
    return localStorage.getItem('bf_curr_tenant_id') || 'org-vogue';
  });
  
  const [currentBranchId, setCurrentBranchId] = useState<string>(() => {
    return localStorage.getItem('bf_curr_branch_id') || 'branch-vogue-dt';
  });
  
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('bf_curr_user_id') || 'user-vogue-owner';
  });

  // Theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('bf_theme') as 'light' | 'dark') || 'light';
  });

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' | 'warning' } | null>(null);

  // Sync back to localstorage
  useEffect(() => { localStorage.setItem('bf_tenants', JSON.stringify(tenants)); }, [tenants]);
  useEffect(() => { localStorage.setItem('bf_branches', JSON.stringify(branches)); }, [branches]);
  useEffect(() => { localStorage.setItem('bf_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('bf_employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('bf_trainers', JSON.stringify(trainers)); }, [trainers]);
  useEffect(() => { localStorage.setItem('bf_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('bf_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('bf_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('bf_activities', JSON.stringify(activities)); }, [activities]);
  useEffect(() => { localStorage.setItem('bf_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('bf_tickets', JSON.stringify(tickets)); }, [tickets]);
  useEffect(() => { localStorage.setItem('bf_attendances', JSON.stringify(attendances)); }, [attendances]);
  useEffect(() => { localStorage.setItem('bf_curr_tenant_id', currentTenantId); }, [currentTenantId]);
  useEffect(() => { localStorage.setItem('bf_curr_branch_id', currentBranchId); }, [currentBranchId]);
  useEffect(() => { localStorage.setItem('bf_curr_user_id', currentUserId); }, [currentUserId]);
  useEffect(() => {
    localStorage.setItem('bf_theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Find active logged in user
  const currentUser = users.find(u => u.id === currentUserId) || users[1]; // Evelyn Harper default if not found

  // Helper Toast trigger
  const showToast = (message: string, type: 'success' | 'info' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
  };
  const hideToast = () => setToast(null);

  // Generic activity logging helper
  const addActivity = (action: string, module: string) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      organizationId: currentTenantId,
      userId: currentUser.id,
      userFullName: currentUser.fullName,
      role: currentUser.role,
      action,
      module,
      timestamp: new Date().toISOString(),
    };
    setActivities(prev => [newLog, ...prev]);
  };

  // Add notification helper
  const pushNotification = (title: string, content: string, type: Notification['type'] = 'INFO') => {
    const newNotif: Notification = {
      id: `not-${Date.now()}`,
      organizationId: currentTenantId,
      title,
      content,
      type,
      date: new Date().toISOString(),
      isRead: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Action switches
  const switchTenant = (tenantId: string) => {
    setCurrentTenantId(tenantId);
    // Find branches of this tenant and set the first one as active
    const tenantBranches = branches.filter(b => b.organizationId === tenantId);
    if (tenantBranches.length > 0) {
      setCurrentBranchId(tenantBranches[0].id);
    }
    // Switch to org owner for this tenant
    const owner = users.find(u => u.organizationId === tenantId && (u.role === 'ORG_OWNER' || u.role === 'SUPER_ADMIN'));
    if (owner) {
      setCurrentUserId(owner.id);
    }
    showToast(`Switched workspace context successfully`, 'info');
  };

  const switchBranch = (branchId: string) => {
    setCurrentBranchId(branchId);
    showToast(`Switched active branch`, 'info');
  };

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    const target = users.find(u => u.id === userId);
    if (target) {
      showToast(`Logged in as ${target.fullName} (${target.role})`, 'success');
      // If switching user, sync their branch and org
      setCurrentTenantId(target.organizationId);
      if (target.branchId) {
        setCurrentBranchId(target.branchId);
      }
    }
  };

  // 1. Auth & Org Creation
  const registerOrganization = (orgData: { name: string; businessType: string; currency: string; ownerName: string; ownerEmail: string; password?: string }) => {
    const tenantId = `org-${Date.now()}`;
    const branchId = `branch-${Date.now()}`;
    const ownerId = `user-${Date.now()}`;
    
    const newTenant: Tenant = {
      id: tenantId,
      name: orgData.name,
      currency: orgData.currency,
      timezone: 'America/New_York',
      language: 'English',
      businessType: orgData.businessType,
      subscriptionStatus: 'TRIAL',
      createdAt: new Date().toISOString(),
      password: orgData.password || 'password123'
    };

    const newBranch: Branch = {
      id: branchId,
      organizationId: tenantId,
      name: 'Main Branch',
      location: '100 Business Parkway',
      phone: '+1 (555) 0100',
      email: orgData.ownerEmail
    };

    const newOwner: User = {
      id: ownerId,
      organizationId: tenantId,
      branchId: branchId,
      fullName: orgData.ownerName,
      email: orgData.ownerEmail,
      role: 'ORG_OWNER',
      status: 'ACTIVE',
      password: orgData.password || 'password123'
    };

    setTenants(prev => [...prev, newTenant]);
    setBranches(prev => [...prev, newBranch]);
    setUsers(prev => [...prev, newOwner]);
    
    setCurrentTenantId(tenantId);
    setCurrentBranchId(branchId);
    setCurrentUserId(ownerId);

    showToast(`Registered organization: ${orgData.name}`, 'success');
    addActivity(`Registered organization ${orgData.name} and initialized standard Main Branch.`, 'ORGANIZATION');
    pushNotification('Welcome to BusinessFlow ERP', 'You successfully initialized your SaaS multi-tenant workspace.', 'SUCCESS');
  };

  // 2. Employees Module
  const addEmployee = (emp: Omit<Employee, 'id' | 'organizationId' | 'branchId' | 'tasksAssigned'>) => {
    const newEmp: Employee = {
      ...emp,
      id: `emp-${Date.now()}`,
      organizationId: currentTenantId,
      branchId: currentBranchId,
      tasksAssigned: 0
    };
    
    // Also create a basic system user account for the employee so we can log in as them!
    const newEmpUser: User = {
      id: `user-${newEmp.id}`,
      organizationId: currentTenantId,
      branchId: currentBranchId,
      email: emp.email,
      fullName: emp.fullName,
      role: 'EMPLOYEE',
      status: 'ACTIVE'
    };

    setEmployees(prev => [...prev, newEmp]);
    setUsers(prev => [...prev, newEmpUser]);
    showToast(`Added employee ${emp.fullName}`, 'success');
    addActivity(`Hired employee ${emp.fullName} in ${emp.department} department.`, 'EMPLOYEES');
    pushNotification('New Employee Onboarded', `${emp.fullName} joined as ${emp.position}. System credentials generated.`, 'INFO');
  };

  const archiveEmployee = (id: string) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: 'ARCHIVED' } : e));
    const target = employees.find(e => e.id === id);
    if (target) {
      showToast(`Archived employee records`, 'warning');
      addActivity(`Archived employment records for ${target.fullName}.`, 'EMPLOYEES');
    }
  };

  const updateEmployee = (emp: Employee) => {
    setEmployees(prev => prev.map(e => e.id === emp.id ? emp : e));
    showToast(`Updated profile for ${emp.fullName}`, 'success');
    addActivity(`Updated employment files for ${emp.fullName}.`, 'EMPLOYEES');
  };

  // 3. Students Module
  const addStudent = (stud: Omit<Student, 'id' | 'organizationId' | 'branchId' | 'attendanceRate'>) => {
    const newStud: Student = {
      ...stud,
      id: `stud-${Date.now()}`,
      organizationId: currentTenantId,
      branchId: currentBranchId,
      attendanceRate: 100
    };

    // Auto create a basic user record for logging in as student
    const newStudUser: User = {
      id: `user-${newStud.id}`,
      organizationId: currentTenantId,
      branchId: currentBranchId,
      email: stud.email,
      fullName: stud.fullName,
      role: 'STUDENT',
      status: 'ACTIVE'
    };

    setStudents(prev => [...prev, newStud]);
    setUsers(prev => [...prev, newStudUser]);
    showToast(`Admitted student ${stud.fullName}`, 'success');
    addActivity(`Enrolled student ${stud.fullName} with admission ID ${stud.admissionNumber}.`, 'STUDENTS');
    pushNotification('New Student Enrolled', `${stud.fullName} enrolled in course ${stud.assignedCourse}.`, 'SUCCESS');
    
    // Record initial ledger transaction for total fees (Outstanding) or setup initial entry
    if (stud.feesPaid > 0) {
      const tx: Transaction = {
        id: `tx-f-${Date.now()}`,
        organizationId: currentTenantId,
        branchId: currentBranchId,
        type: 'INCOME',
        category: 'Student Fees',
        amount: stud.feesPaid,
        description: `Admission tuition installment - ${stud.fullName}`,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'TRANSFER',
        recordedBy: currentUser.fullName
      };
      setTransactions(prev => [tx, ...prev]);
    }
  };

  const recordFeePayment = (studentId: string, amount: number, paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'MOBILE_MONEY') => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const feesPaid = s.feesPaid + amount;
        return { ...s, feesPaid };
      }
      return s;
    }));

    const target = students.find(s => s.id === studentId);
    if (target) {
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        organizationId: currentTenantId,
        branchId: currentBranchId,
        type: 'INCOME',
        category: 'Student Fees',
        amount: amount,
        description: `Tuition installment - ${target.fullName}`,
        date: new Date().toISOString().split('T')[0],
        paymentMethod,
        recordedBy: currentUser.fullName
      };

      setTransactions(prev => [newTx, ...prev]);
      showToast(`Recorded payment of ${tenants.find(t=>t.id===currentTenantId)?.currency || '$'}${amount}`, 'success');
      addActivity(`Processed tuition payment of ${amount} for ${target.fullName}.`, 'FINANCE');
      pushNotification('Tuition Receipt Logged', `Logged payment of ${amount} from ${target.fullName}.`, 'SUCCESS');
    }
  };

  // 4. Trainers Module
  const addTrainer = (trainer: Omit<Trainer, 'id' | 'organizationId' | 'branchId' | 'dailyReports' | 'timetable'>) => {
    const newTrainer: Trainer = {
      ...trainer,
      id: `trainer-${Date.now()}`,
      organizationId: currentTenantId,
      branchId: currentBranchId,
      dailyReports: [],
      timetable: [
        { day: 'Monday', time: '10:00 - 13:00', course: trainer.assignedCourses[0] || 'Intro Course', room: 'Main Lecture Hall' }
      ]
    };

    // Also create a basic user record for trainer login
    const newTrainerUser: User = {
      id: `user-${newTrainer.id}`,
      organizationId: currentTenantId,
      branchId: currentBranchId,
      email: trainer.email,
      fullName: trainer.fullName,
      role: 'TRAINER',
      status: 'ACTIVE',
      password: trainer.password || 'trainer123'
    };

    setTrainers(prev => [...prev, newTrainer]);
    setUsers(prev => [...prev, newTrainerUser]);
    showToast(`Added trainer ${trainer.fullName}`, 'success');
    addActivity(`Onboarded trainer ${trainer.fullName} - specialized in ${trainer.specialization}.`, 'TRAINERS');
  };

  const submitTrainerReport = (trainerId: string, content: string, count: number) => {
    setTrainers(prev => prev.map(t => {
      if (t.id === trainerId) {
        return {
          ...t,
          dailyReports: [
            { id: `rep-${Date.now()}`, date: new Date().toISOString().split('T')[0], content, studentsCount: count },
            ...t.dailyReports
          ]
        };
      }
      return t;
    }));

    const target = trainers.find(t => t.id === trainerId);
    if (target) {
      showToast(`Daily training report submitted`, 'success');
      addActivity(`Trainer ${target.fullName} submitted daily class summary for ${count} students.`, 'TRAINERS');
      pushNotification('Trainer Class Report', `${target.fullName} submitted report: ${content.substring(0, 40)}...`, 'INFO');
    }
  };

  // 5. Attendance Module
  const clockEmployee = (employeeId: string, status: 'PRESENT' | 'LATE' | 'ABSENT', checkIn?: string, checkOut?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const target = employees.find(e => e.id === employeeId);
    
    if (!target) return;

    setAttendances(prev => {
      const existsIdx = prev.findIndex(a => a.targetId === employeeId && a.date === today && a.targetType === 'EMPLOYEE');
      if (existsIdx >= 0) {
        const copy = [...prev];
        copy[existsIdx] = {
          ...copy[existsIdx],
          status,
          ...(checkIn && { checkIn }),
          ...(checkOut && { checkOut })
        };
        return copy;
      } else {
        return [
          ...prev,
          {
            id: `att-${Date.now()}`,
            organizationId: currentTenantId,
            branchId: currentBranchId,
            targetId: employeeId,
            targetName: target.fullName,
            targetType: 'EMPLOYEE',
            date: today,
            status,
            checkIn: checkIn || new Date().toTimeString().split(' ')[0].substring(0, 5),
            checkOut
          }
        ];
      }
    });

    showToast(`Attendance checked for ${target.fullName}`, 'success');
    addActivity(`Recorded employee attendance for ${target.fullName} as ${status}.`, 'ATTENDANCE');
  };

  const markStudentAttendance = (studentId: string, status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED') => {
    const today = new Date().toISOString().split('T')[0];
    const target = students.find(s => s.id === studentId);
    if (!target) return;

    setAttendances(prev => {
      const existsIdx = prev.findIndex(a => a.targetId === studentId && a.date === today && a.targetType === 'STUDENT');
      if (existsIdx >= 0) {
        const copy = [...prev];
        copy[existsIdx] = { ...copy[existsIdx], status };
        return copy;
      } else {
        return [
          ...prev,
          {
            id: `att-${Date.now()}`,
            organizationId: currentTenantId,
            branchId: currentBranchId,
            targetId: studentId,
            targetName: target.fullName,
            targetType: 'STUDENT',
            date: today,
            status
          }
        ];
      }
    });

    // Dynamically recalculate student attendanceRate
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        // Mock a slight variation based on mark
        let attendanceRate = s.attendanceRate;
        if (status === 'PRESENT') {
          attendanceRate = Math.min(100, s.attendanceRate + 1);
        } else if (status === 'ABSENT') {
          attendanceRate = Math.max(0, s.attendanceRate - 3);
        }
        return { ...s, attendanceRate };
      }
      return s;
    }));

    showToast(`Marked ${target.fullName} as ${status}`, 'success');
    addActivity(`Recorded student attendance for ${target.fullName} as ${status}.`, 'ATTENDANCE');
  };

  // 6. Tasks Module
  const createTask = (task: Omit<Task, 'id' | 'organizationId' | 'branchId' | 'creatorId' | 'creatorName' | 'comments'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      organizationId: currentTenantId,
      branchId: currentBranchId,
      creatorId: currentUser.id,
      creatorName: currentUser.fullName,
      comments: []
    };

    setTasks(prev => [...prev, newTask]);
    showToast(`Assigned task: ${task.title}`, 'success');
    addActivity(`Created operational task: "${task.title}" assigned to ${task.assigneeName}.`, 'TASKS');
    
    // Notify assignee
    const assigneeUser = users.find(u => u.fullName === task.assigneeName);
    if (assigneeUser) {
      pushNotification('New Task Assigned', `Marcus assigned you: "${task.title}"`, 'INFO');
    }
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    const target = tasks.find(t => t.id === taskId);
    if (target) {
      showToast(`Task status updated to ${status.replace('_', ' ')}`, 'success');
      addActivity(`Updated task "${target.title}" status to ${status}.`, 'TASKS');
      pushNotification('Task Status Changed', `Task "${target.title}" is now ${status.replace('_', ' ')}`, 'INFO');
    }
  };

  const addTaskComment = (taskId: string, commentText: string) => {
    const newComment = {
      id: `com-${Date.now()}`,
      authorName: currentUser.fullName,
      text: commentText,
      createdAt: new Date().toISOString()
    };

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          comments: [...t.comments, newComment]
        };
      }
      return t;
    }));

    showToast(`Comment added to task`, 'success');
    addActivity(`Commented on task: "${tasks.find(t => t.id === taskId)?.title}".`, 'TASKS');
  };

  // 7. Finance Transactions Ledger
  const recordTransaction = (tx: Omit<Transaction, 'id' | 'organizationId' | 'branchId' | 'recordedBy'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      organizationId: currentTenantId,
      branchId: currentBranchId,
      recordedBy: currentUser.fullName
    };

    setTransactions(prev => [newTx, ...prev]);
    showToast(`Logged ${tx.type.toLowerCase()} of $${tx.amount}`, 'success');
    addActivity(`Recorded ${tx.type} under category "${tx.category}" - $${tx.amount}.`, 'FINANCE');
    pushNotification('Ledger Transaction Logged', `New ${tx.type.toLowerCase()} of ${tx.amount} logged under ${tx.category}.`, 'INFO');
  };

  // 8. Notifications / General Settings
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast(`Marked all notifications as read`, 'info');
  };

  // 9. Super Admin Portal licensing
  const toggleTenantSubscription = (tenantId: string) => {
    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        const nextStatus = t.subscriptionStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        showToast(`Subscription status for ${t.name} updated to ${nextStatus}`, 'warning');
        return { ...t, subscriptionStatus: nextStatus };
      }
      return t;
    }));
  };

  const updateTicketStatus = (ticketId: string, status: SystemSupportTicket['status']) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
    showToast(`Support ticket updated to ${status}`, 'success');
  };

  return (
    <ErpContext.Provider
      value={{
        tenants,
        branches,
        users,
        employees,
        trainers,
        students,
        tasks,
        transactions,
        activities,
        notifications,
        tickets,
        attendances,
        
        currentTenantId,
        currentBranchId,
        currentUser,
        
        theme,
        setTheme,
        toast,
        showToast,
        hideToast,
        
        switchTenant,
        switchBranch,
        switchUser,
        registerOrganization,
        
        addEmployee,
        archiveEmployee,
        updateEmployee,
        
        addStudent,
        recordFeePayment,
        
        addTrainer,
        submitTrainerReport,
        
        clockEmployee,
        markStudentAttendance,
        
        createTask,
        updateTaskStatus,
        addTaskComment,
        
        recordTransaction,
        
        markNotificationRead,
        clearAllNotifications,
        addActivity,
        
        toggleTenantSubscription,
        updateTicketStatus
      }}
    >
      {children}
    </ErpContext.Provider>
  );
}

export function useErp() {
  const context = useContext(ErpContext);
  if (!context) {
    throw new Error('useErp must be used within an ErpProvider');
  }
  return context;
}
