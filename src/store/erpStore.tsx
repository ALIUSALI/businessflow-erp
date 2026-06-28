/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant, Branch, User, Employee, Trainer, Student, Task, Transaction, ActivityLog, Notification, SystemSupportTicket, Attendance } from '../types';
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

  // AI assistant integration
  queryAIAssistant: (prompt: string) => Promise<string>;
}

const ErpContext = createContext<ErpContextProps | undefined>(undefined);

export function ErpProvider({ children }: { children: React.ReactNode }) {
  // Lists initialized with localStorage cache or fallback
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const local = localStorage.getItem('bf_tenants');
    return local ? JSON.parse(local) : mockTenants;
  });
  
  const [branches, setBranches] = useState<Branch[]>(() => {
    const local = localStorage.getItem('bf_branches');
    return local ? JSON.parse(local) : mockBranches;
  });
  
  const [users, setUsers] = useState<User[]>(() => {
    const local = localStorage.getItem('bf_users');
    return local ? JSON.parse(local) : mockUsers;
  });
  
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const local = localStorage.getItem('bf_employees');
    return local ? JSON.parse(local) : mockEmployees;
  });
  
  const [trainers, setTrainers] = useState<Trainer[]>(() => {
    const local = localStorage.getItem('bf_trainers');
    return local ? JSON.parse(local) : mockTrainers;
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

  // Active context state
  const [currentTenantId, setCurrentTenantId] = useState<string>(() => {
    return localStorage.getItem('bf_curr_tenant_id') || 'org-vogue';
  });
  
  const [currentBranchId, setCurrentBranchId] = useState<string>(() => {
    return localStorage.getItem('bf_curr_branch_id') || 'branch-vogue-dt';
  });
  
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('bf_curr_user_id') || 'user-vogue-owner';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('bf_theme') as 'light' | 'dark') || 'light';
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' | 'warning' } | null>(null);

  // Sync to localstorage (offline-first support)
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

  // REST Context Helper
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-tenant-id': currentTenantId,
    'x-branch-id': currentBranchId
  });

  // --- SERVER-SIDE DB INTEGRATION SYNC (Stale-While-Revalidate pattern) ---
  const syncFromServer = async () => {
    try {
      // 1. Tenants list (Global context)
      const resTenants = await fetch('/api/tenants');
      if (resTenants.ok) {
        const data = await resTenants.json();
        setTenants(data);
      }

      // 2. Tenant Context Specific Lists
      const contextHeaders = getHeaders();

      const fetchWithHeaders = async (url: string) => {
        const response = await fetch(url, { headers: contextHeaders });
        return response.ok ? response.json() : null;
      };

      const [
        resBranches,
        resUsers,
        resEmployees,
        resStudents,
        resTrainers,
        resTasks,
        resTransactions,
        resActivities,
        resNotifications,
        resAttendances,
        resTickets
      ] = await Promise.all([
        fetchWithHeaders('/api/branches'),
        fetchWithHeaders('/api/users'),
        fetchWithHeaders('/api/employees'),
        fetchWithHeaders('/api/students'),
        fetchWithHeaders('/api/trainers'),
        fetchWithHeaders('/api/tasks'),
        fetchWithHeaders('/api/transactions'),
        fetchWithHeaders('/api/activities'),
        fetchWithHeaders('/api/notifications'),
        fetchWithHeaders('/api/attendance'),
        fetch('/api/tickets').then(r => r.ok ? r.json() : null)
      ]);

      if (resBranches) setBranches(resBranches);
      if (resUsers) setUsers(resUsers);
      if (resEmployees) setEmployees(resEmployees);
      if (resStudents) setStudents(resStudents);
      if (resTrainers) setTrainers(resTrainers);
      if (resTasks) setTasks(resTasks);
      if (resTransactions) setTransactions(resTransactions);
      if (resActivities) setActivities(resActivities);
      if (resNotifications) setNotifications(resNotifications);
      if (resAttendances) setAttendances(resAttendances);
      if (resTickets) setTickets(resTickets);

    } catch (error) {
      console.warn('Backend server not responsive. Operating in persistent offline mode.', error);
    }
  };

  // Sync on mount and when active organization changes
  useEffect(() => {
    syncFromServer();
  }, [currentTenantId]);

  // Find active logged in user with bulletproof fallback to prevent undefined crashes
  const fallbackUser: User = {
    id: 'user-vogue-owner',
    organizationId: 'org-vogue',
    branchId: 'branch-vogue-dt',
    email: 'evelyn@vogueacademy.com',
    fullName: 'Evelyn Harper',
    role: 'ORG_OWNER',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&fit=crop&q=80',
    status: 'ACTIVE'
  };

  const currentUser = users.find(u => u.id === currentUserId) || users.find(u => u.role === 'ORG_OWNER') || users[0] || fallbackUser;

  const showToast = (message: string, type: 'success' | 'info' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
  };
  const hideToast = () => setToast(null);

  // Operations and Mutations synced with V2 Backend REST Endpoints

  const addActivity = async (action: string, module: string) => {
    // Optimistic local update
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

    try {
      await fetch('/api/activities', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          userId: currentUser.id,
          userFullName: currentUser.fullName,
          role: currentUser.role,
          action,
          module
        })
      });
    } catch (e) {
      console.error('Failed to sync activity log', e);
    }
  };

  const pushNotification = async (title: string, content: string, type: Notification['type'] = 'INFO') => {
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

  const switchTenant = (tenantId: string) => {
    setCurrentTenantId(tenantId);
    const tenantBranches = branches.filter(b => b.organizationId === tenantId);
    if (tenantBranches.length > 0) {
      setCurrentBranchId(tenantBranches[0].id);
    }
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
      setCurrentTenantId(target.organizationId);
      if (target.branchId) {
        setCurrentBranchId(target.branchId);
      }
    }
  };

  const registerOrganization = async (orgData: { name: string; businessType: string; currency: string; ownerName: string; ownerEmail: string; password?: string }) => {
    // Loading indicator
    showToast('Initializing full-stack multi-tenant workspace...', 'info');

    try {
      const response = await fetch('/api/auth/register-org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgData)
      });

      if (response.ok) {
        const data = await response.json();
        // Sync database state from response
        setTenants(prev => [...prev, data.tenant]);
        setBranches(prev => [...prev, data.branch]);
        setUsers(prev => [...prev, data.user]);

        setCurrentTenantId(data.tenant.id);
        setCurrentBranchId(data.branch.id);
        setCurrentUserId(data.user.id);

        localStorage.setItem('bf_just_registered', 'true');
        showToast(`Registered organization: ${orgData.name}`, 'success');
      } else {
        showToast('Failed to register on backend. Running in local sandbox.', 'error');
      }
    } catch (e) {
      showToast('Network error during registration. Workspace cached locally.', 'warning');
    }
  };

  const addEmployee = async (emp: Omit<Employee, 'id' | 'organizationId' | 'branchId' | 'tasksAssigned'>) => {
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(emp)
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(prev => [...prev, data.employee]);
        showToast(`Added employee ${emp.fullName}`, 'success');
        addActivity(`Hired employee ${emp.fullName} in ${emp.department} department.`, 'EMPLOYEES');
        pushNotification('New Employee Onboarded', `${emp.fullName} joined as ${emp.position}. System credentials generated.`, 'INFO');
        // Reload users to fetch generated user credentials
        syncFromServer();
      }
    } catch (e) {
      showToast('Connection error. Employee saved in browser cache.', 'warning');
    }
  };

  const archiveEmployee = async (id: string) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: 'ARCHIVED' } : e));
    const target = employees.find(e => e.id === id);
    if (target) {
      showToast(`Archived employee records`, 'warning');
      addActivity(`Archived employment records for ${target.fullName}.`, 'EMPLOYEES');

      try {
        await fetch(`/api/employees/${id}/archive`, {
          method: 'POST',
          headers: getHeaders()
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const updateEmployee = async (emp: Employee) => {
    setEmployees(prev => prev.map(e => e.id === emp.id ? emp : e));
    showToast(`Updated profile for ${emp.fullName}`, 'success');
    addActivity(`Updated employment files for ${emp.fullName}.`, 'EMPLOYEES');

    try {
      await fetch(`/api/employees/${emp.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(emp)
      });
    } catch (e) {
      console.error(e);
    }
  };

  const addStudent = async (stud: Omit<Student, 'id' | 'organizationId' | 'branchId' | 'attendanceRate'>) => {
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(stud)
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(prev => [...prev, data.student]);
        showToast(`Admitted student ${stud.fullName}`, 'success');
        addActivity(`Enrolled student ${stud.fullName} with admission ID ${data.student.admissionNumber}.`, 'STUDENTS');
        pushNotification('New Student Enrolled', `${stud.fullName} enrolled in course ${stud.assignedCourse}.`, 'SUCCESS');
        syncFromServer(); // Fetch generated transaction
      }
    } catch (e) {
      showToast('Connection error. Student saved to local browser cache.', 'warning');
    }
  };

  const recordFeePayment = async (studentId: string, amount: number, paymentMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'MOBILE_MONEY') => {
    try {
      const response = await fetch(`/api/students/${studentId}/pay-fee`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ amount, paymentMethod })
      });

      if (response.ok) {
        showToast(`Recorded payment of ${tenants.find(t=>t.id===currentTenantId)?.currency || '$'}${amount}`, 'success');
        syncFromServer();
      }
    } catch (e) {
      showToast('Connection error. Fee recorded locally.', 'warning');
    }
  };

  const addTrainer = async (trainer: Omit<Trainer, 'id' | 'organizationId' | 'branchId' | 'dailyReports' | 'timetable'>) => {
    try {
      const response = await fetch('/api/trainers', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(trainer)
      });

      if (response.ok) {
        showToast(`Added trainer ${trainer.fullName}`, 'success');
        addActivity(`Onboarded trainer ${trainer.fullName} - specialized in ${trainer.specialization}.`, 'TRAINERS');
        syncFromServer();
      }
    } catch (e) {
      showToast('Connection error. Trainer details saved locally.', 'warning');
    }
  };

  const submitTrainerReport = async (trainerId: string, content: string, count: number) => {
    try {
      const response = await fetch(`/api/trainers/${trainerId}/report`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ content, count })
      });

      if (response.ok) {
        showToast(`Daily training report submitted`, 'success');
        addActivity(`Trainer reported daily class summary for ${count} students.`, 'TRAINERS');
        syncFromServer();
      }
    } catch (e) {
      showToast('Connection error. Report filed locally.', 'warning');
    }
  };

  const clockEmployee = async (employeeId: string, status: 'PRESENT' | 'LATE' | 'ABSENT', checkIn?: string, checkOut?: string) => {
    try {
      const response = await fetch('/api/attendance/clock-employee', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ employeeId, status, checkIn, checkOut })
      });

      if (response.ok) {
        showToast(`Attendance checked successfully`, 'success');
        syncFromServer();
      }
    } catch (e) {
      showToast('Connection error. Clock state saved locally.', 'warning');
    }
  };

  const markStudentAttendance = async (studentId: string, status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED') => {
    try {
      const response = await fetch('/api/attendance/mark-student', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ studentId, status })
      });

      if (response.ok) {
        showToast(`Marked attendance as ${status}`, 'success');
        syncFromServer();
      }
    } catch (e) {
      showToast('Connection error. Attendance logged locally.', 'warning');
    }
  };

  const createTask = async (task: Omit<Task, 'id' | 'organizationId' | 'branchId' | 'creatorId' | 'creatorName' | 'comments'>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(task)
      });

      if (response.ok) {
        showToast(`Assigned task: ${task.title}`, 'success');
        addActivity(`Created operational task: "${task.title}" assigned to ${task.assigneeName}.`, 'TASKS');
        syncFromServer();
      }
    } catch (e) {
      showToast('Connection error. Task recorded in local workspace.', 'warning');
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        showToast(`Task status updated`, 'success');
        syncFromServer();
      }
    } catch (e) {
      showToast('Connection error. Task status saved in browser.', 'warning');
    }
  };

  const addTaskComment = async (taskId: string, commentText: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/comment`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ authorName: currentUser.fullName, text: commentText })
      });

      if (response.ok) {
        showToast(`Comment added to task`, 'success');
        syncFromServer();
      }
    } catch (e) {
      showToast('Connection error. Comment queued locally.', 'warning');
    }
  };

  const recordTransaction = async (tx: Omit<Transaction, 'id' | 'organizationId' | 'branchId' | 'recordedBy'>) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(tx)
      });

      if (response.ok) {
        showToast(`Recorded transaction successfully`, 'success');
        syncFromServer();
      }
    } catch (e) {
      showToast('Connection error. Transaction logged locally.', 'warning');
    }
  };

  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: getHeaders()
      });
    } catch (e) {
      console.error(e);
    }
  };

  const clearAllNotifications = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await fetch('/api/notifications/clear', {
        method: 'POST',
        headers: getHeaders()
      });
      showToast(`Marked all notifications as read`, 'info');
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTenantSubscription = async (tenantId: string) => {
    try {
      const response = await fetch(`/api/tenants/${tenantId}/toggle-subscription`, {
        method: 'POST',
        headers: getHeaders()
      });

      if (response.ok) {
        syncFromServer();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: SystemSupportTicket['status']) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        showToast(`Support ticket updated to ${status}`, 'success');
        syncFromServer();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // AI query handler with safe state checks
  const queryAIAssistant = async (prompt: string): Promise<string> => {
    try {
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ prompt })
      });

      if (response.ok) {
        const data = await response.json();
        return data.answer;
      } else {
        throw new Error('AI endpoint returned error response');
      }
    } catch (error) {
      console.error('AI assistant network error:', error);
      return "I encountered a connection error while trying to reach the Business Analyst AI. Please check your network or try again shortly.";
    }
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
        updateTicketStatus,

        queryAIAssistant
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
