/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Tenant, Branch, User, Employee, Trainer, Student, Task, Transaction, ActivityLog, Notification, SystemSupportTicket } from '../types';

// Multi-tenant organizations
export const mockTenants: Tenant[] = [
  {
    id: 'org-vogue',
    name: 'Vogue Beauty Academy',
    currency: '$',
    timezone: 'America/New_York',
    language: 'English',
    businessType: 'Beauty School & Training Institute',
    subscriptionStatus: 'ACTIVE',
    createdAt: '2025-01-15T08:00:00Z',
    logoUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=80&fit=crop&q=80',
    password: 'vogue123',
  },
  {
    id: 'org-elite',
    name: 'Elite Salon & Wellness',
    currency: '£',
    timezone: 'Europe/London',
    language: 'English',
    businessType: 'Hair Salon & Spa Chain',
    subscriptionStatus: 'ACTIVE',
    createdAt: '2025-03-10T09:00:00Z',
    logoUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=80&fit=crop&q=80',
    password: 'elite123',
  },
  {
    id: 'org-alpha',
    name: 'Alpha Barber Institute',
    currency: '€',
    timezone: 'Europe/Berlin',
    language: 'German',
    businessType: 'Barber Shops & Training',
    subscriptionStatus: 'TRIAL',
    createdAt: '2026-05-01T10:00:00Z',
    logoUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=80&fit=crop&q=80',
    password: 'alpha123',
  }
];

// Branches for Vogue Beauty Academy
export const mockBranches: Branch[] = [
  {
    id: 'branch-vogue-dt',
    organizationId: 'org-vogue',
    name: 'Downtown Campus',
    location: '452 Broadway, Suite B, New York, NY 10013',
    phone: '+1 (212) 555-0190',
    email: 'broadway@vogueacademy.com',
  },
  {
    id: 'branch-vogue-ns',
    organizationId: 'org-vogue',
    name: 'Northside Training Center',
    location: '1890 Queens Blvd, Queens, NY 11375',
    phone: '+1 (718) 555-0241',
    email: 'north@vogueacademy.com',
  }
];

// Prepopulated Users representing roles
export const mockUsers: User[] = [
  {
    id: 'user-super',
    organizationId: 'org-vogue',
    email: 'admin@businessflow.com',
    fullName: 'Alexander Mercer',
    role: 'SUPER_ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&q=80',
    status: 'ACTIVE',
  },
  {
    id: 'user-vogue-owner',
    organizationId: 'org-vogue',
    email: 'evelyn@vogueacademy.com',
    fullName: 'Evelyn Harper',
    role: 'ORG_OWNER',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&fit=crop&q=80',
    status: 'ACTIVE',
  },
  {
    id: 'user-vogue-mgr',
    organizationId: 'org-vogue',
    branchId: 'branch-vogue-dt',
    email: 'marcus@vogueacademy.com',
    fullName: 'Marcus Vance',
    role: 'BRANCH_MANAGER',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&q=80',
    status: 'ACTIVE',
  },
  {
    id: 'user-vogue-hr',
    organizationId: 'org-vogue',
    email: 'sarah.lin@vogueacademy.com',
    fullName: 'Sarah Lin',
    role: 'HR_ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&fit=crop&q=80',
    status: 'ACTIVE',
  },
  {
    id: 'user-vogue-fin',
    organizationId: 'org-vogue',
    email: 'david@vogueacademy.com',
    fullName: 'David Kross',
    role: 'FINANCE_OFFICER',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&q=80',
    status: 'ACTIVE',
  },
  {
    id: 'user-vogue-trainer1',
    organizationId: 'org-vogue',
    branchId: 'branch-vogue-dt',
    email: 'chloe.d@vogueacademy.com',
    fullName: 'Chloe Dupree',
    role: 'TRAINER',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&fit=crop&q=80',
    status: 'ACTIVE',
    password: 'chloe123',
  },
  {
    id: 'user-vogue-trainer2',
    organizationId: 'org-vogue',
    branchId: 'branch-vogue-dt',
    email: 'jonah.s@vogueacademy.com',
    fullName: 'Jonah Sterling',
    role: 'TRAINER',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&fit=crop&q=80',
    status: 'ACTIVE',
    password: 'jonah123',
  },
  {
    id: 'user-vogue-emp',
    organizationId: 'org-vogue',
    branchId: 'branch-vogue-dt',
    email: 'elena.s@vogueacademy.com',
    fullName: 'Elena Smith',
    role: 'EMPLOYEE',
    avatarUrl: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=80&fit=crop&q=80',
    status: 'ACTIVE',
  },
  {
    id: 'user-vogue-stud',
    organizationId: 'org-vogue',
    branchId: 'branch-vogue-dt',
    email: 'aria.t@student.com',
    fullName: 'Aria Thorne',
    role: 'STUDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1614644147724-2d4785d69962?w=80&fit=crop&q=80',
    status: 'ACTIVE',
  }
];

// Employees dataset for Vogue Beauty Academy (Downtown)
export const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    organizationId: 'org-vogue',
    branchId: 'branch-vogue-dt',
    fullName: 'Elena Smith',
    email: 'elena.s@vogueacademy.com',
    phone: '+1 (212) 555-0102',
    department: 'Administration',
    position: 'Front Desk Coordinator',
    salary: 3200,
    salaryType: 'MONTHLY',
    status: 'ACTIVE',
    hireDate: '2025-02-01',
    profilePhoto: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=80&fit=crop&q=80',
    tasksAssigned: 3,
    documents: [
      { name: 'I-9 Employment Eligibility.pdf', type: 'Identification', date: '2025-02-01' },
      { name: 'W-4 Tax Certificate.pdf', type: 'Tax Document', date: '2025-02-01' }
    ]
  },
  {
    id: 'emp-2',
    organizationId: 'org-vogue',
    branchId: 'branch-vogue-dt',
    fullName: 'David Kross',
    email: 'david@vogueacademy.com',
    phone: '+1 (212) 555-0118',
    department: 'Finance',
    position: 'Finance Officer',
    salary: 4500,
    salaryType: 'MONTHLY',
    status: 'ACTIVE',
    hireDate: '2025-01-20',
    profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&q=80',
    tasksAssigned: 1,
    documents: [
      { name: 'Employment Offer Letter.pdf', type: 'Contract', date: '2025-01-10' },
      { name: 'Direct Deposit Form.pdf', type: 'Financial', date: '2025-01-20' }
    ]
  },
  {
    id: 'emp-3',
    organizationId: 'org-vogue',
    branchId: 'branch-vogue-dt',
    fullName: 'Sarah Lin',
    email: 'sarah.lin@vogueacademy.com',
    phone: '+1 (212) 555-0125',
    department: 'Human Resources',
    position: 'HR Manager',
    salary: 4200,
    salaryType: 'MONTHLY',
    status: 'ACTIVE',
    hireDate: '2025-01-18',
    profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&fit=crop&q=80',
    tasksAssigned: 2,
    documents: [
      { name: 'NDA Agreement.pdf', type: 'Contract', date: '2025-01-18' }
    ]
  },
  {
    id: 'emp-4',
    organizationId: 'org-vogue',
    branchId: 'branch-vogue-dt',
    fullName: 'James Fletcher',
    email: 'james.f@vogueacademy.com',
    phone: '+1 (212) 555-0164',
    department: 'Facilities',
    position: 'Support Assistant',
    salary: 18,
    salaryType: 'HOURLY',
    status: 'LEAVE',
    hireDate: '2025-03-15',
    profilePhoto: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&fit=crop&q=80',
    tasksAssigned: 0,
    documents: []
  }
];

// Trainers assigned to courses
export const mockTrainers: Trainer[] = [
  {
    id: 'trainer-1',
    organizationId: 'org-vogue',
    branchId: 'branch-vogue-dt',
    fullName: 'Chloe Dupree',
    email: 'chloe.d@vogueacademy.com',
    phone: '+1 (212) 555-0144',
    specialization: 'Cosmetology & Skin Care',
    assignedCourses: ['Cosmetology 101', 'Esthetics Basics', 'Advanced Nail Art'],
    status: 'ACTIVE',
    timetable: [
      { day: 'Monday', time: '09:00 - 12:00', course: 'Cosmetology 101', room: 'Theory Room A' },
      { day: 'Wednesday', time: '13:00 - 16:00', course: 'Esthetics Basics', room: 'Practical Spa Room' },
      { day: 'Thursday', time: '10:00 - 13:00', course: 'Advanced Nail Art', room: 'Nail Lab' }
    ],
    dailyReports: [
      { id: 'rep-1', date: '2026-06-25', content: 'Completed basic skin exfoliation techniques. Students were highly engaged and finished the practical mock exam successfully.', studentsCount: 8 },
      { id: 'rep-2', date: '2026-06-26', content: 'Nail extensions demo finished. Individual assessments are ongoing.', studentsCount: 6 }
    ],
    password: 'chloe123'
  },
  {
    id: 'trainer-2',
    organizationId: 'org-vogue',
    branchId: 'branch-vogue-dt',
    fullName: 'Jonah Sterling',
    email: 'jonah.s@vogueacademy.com',
    phone: '+1 (212) 555-0152',
    specialization: 'Hair Design & Barbering',
    assignedCourses: ['Hair Styling Foundations', 'Men\'s Barbering Masterclass'],
    status: 'ACTIVE',
    timetable: [
      { day: 'Tuesday', time: '10:00 - 13:00', course: 'Hair Styling Foundations', room: 'Styling Floor B' },
      { day: 'Friday', time: '14:00 - 17:00', course: 'Men\'s Barbering Masterclass', room: 'Barber Corner' }
    ],
    dailyReports: [
      { id: 'rep-3', date: '2026-06-26', content: 'Covered straight razor safety rules and line-up details. Handled full razor shaves safely on silicone practice mannequins.', studentsCount: 11 }
    ],
    password: 'jonah123'
  }
];

// Students directory
export const mockStudents: Student[] = [
  {
    id: 'stud-1',
    organizationId: 'org-vogue',
    branchId: 'branch-vogue-dt',
    fullName: 'Aria Thorne',
    admissionNumber: 'VBA-2026-0045',
    email: 'aria.t@student.com',
    phone: '+1 (212) 555-0433',
    guardianName: 'Raymond Thorne',
    guardianPhone: '+1 (212) 555-0431',
    assignedCourse: 'Hair Styling Foundations',
    assignedTrainerId: 'trainer-2',
    totalFees: 6200,
    feesPaid: 4500,
    status: 'ACTIVE',
    attendanceRate: 94,
    documents: [
      { name: 'High School Diploma.pdf', date: '2026-01-05' },
      { name: 'Enrollment Agreement VBA.pdf', date: '2026-01-06' }
    ],
    academicProgress: [
      { subject: 'Coloring Techniques', grade: 'A', date: '2026-05-15' },
      { subject: 'Symmetry & Sectioning', grade: 'B+', date: '2026-06-10' }
    ]
  },
  {
    id: 'stud-2',
    organizationId: 'org-vogue',
    branchId: 'branch-vogue-dt',
    fullName: 'Lucas Graham',
    admissionNumber: 'VBA-2026-0051',
    email: 'lucas.g@student.com',
    phone: '+1 (212) 555-0482',
    guardianName: 'Martha Graham',
    guardianPhone: '+1 (212) 555-0480',
    assignedCourse: 'Cosmetology 101',
    assignedTrainerId: 'trainer-1',
    totalFees: 7500,
    feesPaid: 7500,
    status: 'ACTIVE',
    attendanceRate: 98,
    documents: [
      { name: 'Vaccination Records.pdf', date: '2026-01-02' }
    ],
    academicProgress: [
      { subject: 'Sanitization & Safety', grade: 'A+', date: '2026-04-10' },
      { subject: 'Skincare Fundamentals', grade: 'A', date: '2026-06-02' }
    ]
  },
  {
    id: 'stud-3',
    organizationId: 'org-vogue',
    branchId: 'branch-vogue-dt',
    fullName: 'Sophia Reed',
    admissionNumber: 'VBA-2026-0059',
    email: 'sophia.r@student.com',
    phone: '+1 (212) 555-0511',
    guardianName: 'Geoffrey Reed',
    guardianPhone: '+1 (212) 555-0510',
    assignedCourse: 'Advanced Nail Art',
    assignedTrainerId: 'trainer-1',
    totalFees: 3800,
    feesPaid: 1500,
    status: 'ACTIVE',
    attendanceRate: 88,
    documents: [],
    academicProgress: [
      { subject: 'Manicure Fundamentals', grade: 'B', date: '2026-05-20' }
    ]
  },
  {
    id: 'stud-4',
    organizationId: 'org-vogue',
    branchId: 'branch-vogue-dt',
    fullName: 'Mason Cole',
    admissionNumber: 'VBA-2025-0102',
    email: 'mason.c@student.com',
    phone: '+1 (212) 555-0677',
    guardianName: 'Alice Cole',
    guardianPhone: '+1 (212) 555-0676',
    assignedCourse: 'Men\'s Barbering Masterclass',
    assignedTrainerId: 'trainer-2',
    totalFees: 5400,
    feesPaid: 5400,
    status: 'GRADUATED',
    attendanceRate: 97,
    documents: [
      { name: 'Certificate of Barbering VBA.pdf', date: '2026-05-30' }
    ],
    academicProgress: [
      { subject: 'Straight Razor Mastery', grade: 'A+', date: '2026-05-15' }
    ]
  }
];

// Tasks for task-boards
export const mockTasks: Task[] = [
  {
    id: 'task-1',
    organizationId: 'org-vogue',
    branchId: 'branch-vogue-dt',
    title: 'Revise Cosmetology Final Practical Exam Criteria',
    description: 'Update the final practical grading rubrics according to the new 2026 state board health regulations.',
    status: 'PENDING',
    priority: 'HIGH',
    dueDate: '2026-07-02',
    assigneeId: 'trainer-1',
    assigneeName: 'Chloe Dupree',
    creatorId: 'user-vogue-mgr',
    creatorName: 'Marcus Vance',
    comments: [
      { id: 'com-1', authorName: 'Marcus Vance', text: 'Chloe, please make sure the sterilization criteria include the new UV autoclave guidelines.', createdAt: '2026-06-27T10:00:00Z' }
    ],
    attachments: ['StateBoardRegs2026.pdf']
  },
  {
    id: 'task-2',
    organizationId: 'org-vogue',
    branchId: 'branch-vogue-dt',
    title: 'Monthly Salon Supply Inventory Audit',
    description: 'Count stock levels of dyes, developers, student kits, manicures gels, and chemical wave solutions.',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    dueDate: '2026-06-30',
    assigneeId: 'emp-1',
    assigneeName: 'Elena Smith',
    creatorId: 'user-vogue-mgr',
    creatorName: 'Marcus Vance',
    comments: [
      { id: 'com-2', authorName: 'Elena Smith', text: 'I started counting Room B shelves. 40 units of developer are in transit.', createdAt: '2026-06-28T09:15:00Z' }
    ],
    attachments: []
  },
  {
    id: 'task-3',
    organizationId: 'org-vogue',
    branchId: 'branch-vogue-dt',
    title: 'Collect Outstanding Fee Reminders',
    description: 'Reach out to students with a balance over $2,000 before the end-of-term practical tests.',
    status: 'PENDING',
    priority: 'HIGH',
    dueDate: '2026-07-05',
    assigneeId: 'emp-2',
    assigneeName: 'David Kross',
    creatorId: 'user-vogue-owner',
    creatorName: 'Evelyn Harper',
    comments: [],
    attachments: []
  },
  {
    id: 'task-4',
    organizationId: 'org-vogue',
    branchId: 'branch-vogue-dt',
    title: 'Post Autumn Roster Course Catalogs',
    description: 'Publish course catalogs for the September Cosmetology, Hair Styling, and Advanced Barber classes online and on posters.',
    status: 'COMPLETED',
    priority: 'LOW',
    dueDate: '2026-06-20',
    assigneeId: 'user-vogue-hr',
    assigneeName: 'Sarah Lin',
    creatorId: 'user-vogue-owner',
    creatorName: 'Evelyn Harper',
    comments: [
      { id: 'com-3', authorName: 'Sarah Lin', text: 'Flyers printed and website updated.', createdAt: '2026-06-19T14:22:00Z' }
    ],
    attachments: ['AutumnCourseCatalog_Vogue.pdf']
  }
];

// Financial Ledger ledger records
export const mockTransactions: Transaction[] = [
  // Income
  { id: 'tx-1', organizationId: 'org-vogue', branchId: 'branch-vogue-dt', type: 'INCOME', category: 'Student Fees', amount: 3500, description: 'Tuition deposit - Aria Thorne', date: '2026-06-25', paymentMethod: 'TRANSFER', recordedBy: 'David Kross' },
  { id: 'tx-2', organizationId: 'org-vogue', branchId: 'branch-vogue-dt', type: 'INCOME', category: 'Student Fees', amount: 5400, description: 'Full Tuition Payment - Mason Cole', date: '2026-06-26', paymentMethod: 'CARD', recordedBy: 'David Kross' },
  { id: 'tx-3', organizationId: 'org-vogue', branchId: 'branch-vogue-dt', type: 'INCOME', category: 'Salon Services', amount: 180, description: 'Full balayage, cut & treatment package - Walk-in customer', date: '2026-06-27', paymentMethod: 'CARD', recordedBy: 'Elena Smith' },
  { id: 'tx-4', organizationId: 'org-vogue', branchId: 'branch-vogue-dt', type: 'INCOME', category: 'Product Sales', amount: 85, description: 'L\'Oréal shampoo bulk pack and styling serum', date: '2026-06-27', paymentMethod: 'CASH', recordedBy: 'Elena Smith' },
  { id: 'tx-5', organizationId: 'org-vogue', branchId: 'branch-vogue-dt', type: 'INCOME', category: 'Student Fees', amount: 1500, description: 'Tuition Installment - Sophia Reed', date: '2026-06-28', paymentMethod: 'MOBILE_MONEY', recordedBy: 'David Kross' },
  
  // Expenses
  { id: 'tx-6', organizationId: 'org-vogue', branchId: 'branch-vogue-dt', type: 'EXPENSE', category: 'Supplies', amount: 620, description: 'Matrix Hair Dyes and Developer Stock restock', date: '2026-06-24', paymentMethod: 'CARD', recordedBy: 'David Kross' },
  { id: 'tx-7', organizationId: 'org-vogue', branchId: 'branch-vogue-dt', type: 'EXPENSE', category: 'Rent', amount: 2800, description: 'Downtown Salon Space Rent - Monthly lease', date: '2026-06-01', paymentMethod: 'TRANSFER', recordedBy: 'David Kross' },
  { id: 'tx-8', organizationId: 'org-vogue', branchId: 'branch-vogue-dt', type: 'EXPENSE', category: 'Salaries', amount: 3200, description: 'Elena Smith salary - June payroll', date: '2026-06-25', paymentMethod: 'TRANSFER', recordedBy: 'David Kross' },
  { id: 'tx-9', organizationId: 'org-vogue', branchId: 'branch-vogue-dt', type: 'EXPENSE', category: 'Salaries', amount: 4500, description: 'David Kross salary - June payroll', date: '2026-06-25', paymentMethod: 'TRANSFER', recordedBy: 'David Kross' },
  { id: 'tx-10', organizationId: 'org-vogue', branchId: 'branch-vogue-dt', type: 'EXPENSE', category: 'Utilities', amount: 410, description: 'ConEd Power & Water Bills - Downtown campus', date: '2026-06-15', paymentMethod: 'TRANSFER', recordedBy: 'David Kross' },
  { id: 'tx-11', organizationId: 'org-vogue', branchId: 'branch-vogue-dt', type: 'EXPENSE', category: 'Supplies', amount: 150, description: 'Disposable gloves, capes and sanitizers', date: '2026-06-28', paymentMethod: 'CASH', recordedBy: 'Elena Smith' }
];

// Activity Feed logs
export const mockActivities: ActivityLog[] = [
  { id: 'act-1', organizationId: 'org-vogue', userId: 'user-vogue-owner', userFullName: 'Evelyn Harper', role: 'ORG_OWNER', action: 'Authorized June payroll for academic and administrative staff.', module: 'FINANCE', timestamp: '2026-06-25T11:30:00Z' },
  { id: 'act-2', organizationId: 'org-vogue', userId: 'user-vogue-fin', userFullName: 'David Kross', role: 'FINANCE_OFFICER', action: 'Recorded tuition fee payment of $5,400 for Mason Cole.', module: 'FINANCE', timestamp: '2026-06-26T09:40:00Z' },
  { id: 'act-3', organizationId: 'org-vogue', userId: 'user-vogue-trainer1', userFullName: 'Chloe Dupree', role: 'TRAINER', action: 'Submitted daily class report for Cosmetology 101.', module: 'TRAINER_DESK', timestamp: '2026-06-26T16:15:00Z' },
  { id: 'act-4', organizationId: 'org-vogue', userId: 'user-vogue-mgr', userFullName: 'Marcus Vance', role: 'BRANCH_MANAGER', action: 'Assigned "Revise Cosmetology Final Practical Exam Criteria" task to Chloe Dupree.', module: 'TASKS', timestamp: '2026-06-27T10:05:00Z' },
  { id: 'act-5', organizationId: 'org-vogue', userId: 'user-vogue-emp', userFullName: 'Elena Smith', role: 'EMPLOYEE', action: 'Clocked in at front desk console - 08:58 AM', module: 'ATTENDANCE', timestamp: '2026-06-28T08:58:00Z' }
];

// In-app notices
export const mockNotifications: Notification[] = [
  { id: 'not-1', organizationId: 'org-vogue', title: 'New Daily Report Submitted', content: 'Chloe Dupree submitted the report for Esthetics Basics.', type: 'SUCCESS', date: '2026-06-26T16:16:00Z', isRead: false },
  { id: 'not-2', organizationId: 'org-vogue', title: 'Outstanding Balance Alert', content: 'Sophia Reed has outstanding fees of $2,300.', type: 'WARNING', date: '2026-06-27T08:00:00Z', isRead: false },
  { id: 'not-3', organizationId: 'org-vogue', title: 'New Task Assigned', content: 'You have been assigned the task: Revision of grading parameters.', type: 'INFO', date: '2026-06-27T10:05:00Z', isRead: true },
  { id: 'not-4', organizationId: 'org-vogue', title: 'System Health Check Report', content: 'All platform shards are running within normal parameters (latency <12ms).', type: 'SUCCESS', date: '2026-06-28T01:00:00Z', isRead: true }
];

// Support tickets for the super admin portal
export const mockTickets: SystemSupportTicket[] = [
  { id: 'tix-1', tenantName: 'Vogue Beauty Academy', subject: 'Inquiry regarding multi-currency support on billing plans', status: 'OPEN', priority: 'MEDIUM', createdAt: '2026-06-27' },
  { id: 'tix-2', tenantName: 'Elite Salon & Wellness', subject: 'Error exporting high-res client reports to Excel format', status: 'IN_PROGRESS', priority: 'HIGH', createdAt: '2026-06-26' },
  { id: 'tix-3', tenantName: 'Alpha Barber Institute', subject: 'Requesting extra 10GB storage tier increase', status: 'RESOLVED', priority: 'LOW', createdAt: '2026-06-24' }
];
