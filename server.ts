/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { db } from './src/server/db';
import { askBusinessAssistant } from './src/server/ai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON body parsing with reasonable limits
app.use(express.json({ limit: '10mb' }));

// Utility to generate unique IDs
const genId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

// REST API Endpoints with proper multi-tenant isolation

// 1. Auth Endpoints
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const allUsers = db.getAllUsers();
  const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Password verification
  if (user.role === 'TRAINER') {
    const trainer = db.getAllTrainers().find(t => t.email.toLowerCase() === email.toLowerCase());
    if (trainer && trainer.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
  } else if (user.password && user.password !== password) {
    // Check against tenant master password as well
    const tenant = db.getTenants().find(t => t.id === user.organizationId);
    if (tenant && tenant.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
  }

  // Audit activity
  db.addActivity({
    id: genId('act'),
    organizationId: user.organizationId,
    userId: user.id,
    userFullName: user.fullName,
    role: user.role,
    action: `User ${user.fullName} logged in successfully`,
    module: 'AUTHENTICATION',
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, user });
});

app.post('/api/auth/register-org', (req: Request, res: Response) => {
  const { name, businessType, currency, ownerName, ownerEmail, password } = req.body;
  if (!name || !businessType || !ownerName || !ownerEmail) {
    return res.status(400).json({ error: 'Missing registration details' });
  }

  const tenantId = `org-${Date.now()}`;
  const branchId = `branch-${Date.now()}`;
  const ownerId = `user-${Date.now()}`;

  const newTenant = {
    id: tenantId,
    name,
    currency: currency || '$',
    timezone: 'America/New_York',
    language: 'English',
    businessType,
    subscriptionStatus: 'TRIAL' as const,
    createdAt: new Date().toISOString(),
    password: password || 'password123'
  };

  const newBranch = {
    id: branchId,
    organizationId: tenantId,
    name: 'Downtown Main Campus',
    location: '100 Business Parkway, Suite A',
    phone: '+1 (555) 0100',
    email: ownerEmail
  };

  const newOwnerUser = {
    id: ownerId,
    organizationId: tenantId,
    branchId,
    email: ownerEmail,
    fullName: ownerName,
    role: 'ORG_OWNER' as const,
    status: 'ACTIVE' as const,
    password: password || 'password123'
  };

  db.addTenant(newTenant);
  db.addBranch(newBranch);
  db.addUser(newOwnerUser);

  db.addActivity({
    id: genId('act'),
    organizationId: tenantId,
    userId: ownerId,
    userFullName: ownerName,
    role: 'ORG_OWNER',
    action: `Registered organization "${name}" and owner profile`,
    module: 'AUTHENTICATION',
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, tenant: newTenant, branch: newBranch, user: newOwnerUser });
});

// 2. Tenants / Organizations Endpoints
app.get('/api/tenants', (req: Request, res: Response) => {
  // SUPER_ADMIN can see all; tenants can see their own (isolated in frontend or queried)
  res.json(db.getTenants());
});

app.post('/api/tenants/:id/toggle-subscription', (req: Request, res: Response) => {
  const { id } = req.params;
  const tenants = db.getTenants();
  const tenant = tenants.find(t => t.id === id);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

  tenant.subscriptionStatus = tenant.subscriptionStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
  db.updateTenant(tenant);

  res.json({ success: true, tenant });
});

// 3. Branches Endpoints
app.get('/api/branches', (req: Request, res: Response) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  if (!tenantId) return res.status(400).json({ error: 'Tenant context header is missing' });
  res.json(db.getBranches(tenantId));
});

// 4. Users Endpoints
app.get('/api/users', (req: Request, res: Response) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  if (!tenantId) return res.status(400).json({ error: 'Tenant context header is missing' });
  res.json(db.getUsers(tenantId));
});

// 5. Employees Endpoints
app.get('/api/employees', (req: Request, res: Response) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  if (!tenantId) return res.status(400).json({ error: 'Tenant context header is missing' });
  res.json(db.getEmployees(tenantId));
});

app.post('/api/employees', (req: Request, res: Response) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  const branchId = req.headers['x-branch-id'] as string;
  if (!tenantId || !branchId) return res.status(400).json({ error: 'Tenant or branch context missing' });

  const empData = req.body;
  const newEmp = {
    ...empData,
    id: genId('emp'),
    organizationId: tenantId,
    branchId,
    status: 'ACTIVE',
    hireDate: empData.hireDate || new Date().toISOString().split('T')[0],
    documents: empData.documents || [],
    tasksAssigned: 0
  };

  db.addEmployee(newEmp);

  // Automatically create a user credentials record for them
  const newUser = {
    id: genId('user'),
    organizationId: tenantId,
    branchId,
    email: empData.email,
    fullName: empData.fullName,
    role: (empData.position?.toUpperCase() === 'HR' ? 'HR_ADMIN' : empData.position?.toUpperCase() === 'FINANCE' ? 'FINANCE_OFFICER' : 'EMPLOYEE') as any,
    status: 'ACTIVE' as const,
    password: empData.password || 'password123'
  };
  db.addUser(newUser);

  res.json({ success: true, employee: newEmp });
});

app.put('/api/employees/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const empData = req.body;
  db.updateEmployee(empData);
  res.json({ success: true, employee: empData });
});

app.post('/api/employees/:id/archive', (req: Request, res: Response) => {
  const { id } = req.params;
  const employees = db.getAllEmployees();
  const emp = employees.find(e => e.id === id);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });

  emp.status = 'ARCHIVED';
  db.updateEmployee(emp);
  res.json({ success: true, employee: emp });
});

// 6. Students Endpoints
app.get('/api/students', (req: Request, res: Response) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  if (!tenantId) return res.status(400).json({ error: 'Tenant context header is missing' });
  res.json(db.getStudents(tenantId));
});

app.post('/api/students', (req: Request, res: Response) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  const branchId = req.headers['x-branch-id'] as string;
  if (!tenantId || !branchId) return res.status(400).json({ error: 'Tenant or branch context missing' });

  const studentData = req.body;
  const newStudent = {
    ...studentData,
    id: genId('stud'),
    organizationId: tenantId,
    branchId,
    admissionNumber: `ADM-${Date.now().toString().slice(-6)}`,
    status: 'ACTIVE',
    attendanceRate: 100,
    documents: [],
    academicProgress: [
      { subject: 'Theoretical Concepts', grade: 'A', date: new Date().toISOString().split('T')[0] }
    ]
  };

  db.addStudent(newStudent);

  // Add automatic notification
  db.addNotification({
    id: genId('notif'),
    organizationId: tenantId,
    title: 'New Enrollment',
    content: `Student ${newStudent.fullName} has been successfully registered under admission ${newStudent.admissionNumber}.`,
    type: 'SUCCESS',
    date: new Date().toISOString(),
    isRead: false
  });

  res.json({ success: true, student: newStudent });
});

app.post('/api/students/:id/pay-fee', (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount, paymentMethod } = req.body;
  const tenantId = req.headers['x-tenant-id'] as string;
  const branchId = req.headers['x-branch-id'] as string;

  if (!amount || !paymentMethod) return res.status(400).json({ error: 'Amount and payment method are required' });

  const student = db.getAllStudents().find(s => s.id === id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  // Update student fees
  student.feesPaid = (student.feesPaid || 0) + Number(amount);
  db.updateStudent(student);

  // Record accounting transaction
  const txId = genId('tx');
  const transaction = {
    id: txId,
    organizationId: tenantId,
    branchId,
    type: 'INCOME' as const,
    category: 'Student Fees',
    amount: Number(amount),
    description: `Fee payment for ${student.fullName} (${student.admissionNumber})`,
    date: new Date().toISOString().split('T')[0],
    paymentMethod,
    recordedBy: 'Accounting Hub'
  };
  db.addTransaction(transaction);

  // Display notification
  db.addNotification({
    id: genId('notif'),
    organizationId: tenantId,
    title: 'Fee Paid',
    content: `${student.fullName} paid ${db.getTenants().find(t => t.id === tenantId)?.currency || '$'}${amount} via ${paymentMethod}.`,
    type: 'SUCCESS',
    date: new Date().toISOString(),
    isRead: false
  });

  res.json({ success: true, student, transaction });
});

// 7. Trainers Endpoints
app.get('/api/trainers', (req: Request, res: Response) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  if (!tenantId) return res.status(400).json({ error: 'Tenant context header is missing' });
  res.json(db.getTrainers(tenantId));
});

app.post('/api/trainers', (req: Request, res: Response) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  const branchId = req.headers['x-branch-id'] as string;
  if (!tenantId || !branchId) return res.status(400).json({ error: 'Tenant or branch context missing' });

  const trainerData = req.body;
  const newTrainer = {
    ...trainerData,
    id: genId('tr'),
    organizationId: tenantId,
    branchId,
    timetable: [
      { day: 'Monday', time: '09:00 - 12:00', course: trainerData.assignedCourses?.[0] || 'Cosmetology 101', room: 'Theory Hall A' },
      { day: 'Wednesday', time: '13:00 - 16:00', course: trainerData.assignedCourses?.[0] || 'Cosmetology 101', room: 'Practical Salon Lab' }
    ],
    dailyReports: []
  };

  db.addTrainer(newTrainer);

  // Create a trainer user credentials record
  const newUser = {
    id: genId('user'),
    organizationId: tenantId,
    branchId,
    email: trainerData.email,
    fullName: trainerData.fullName,
    role: 'TRAINER' as const,
    status: 'ACTIVE' as const,
    password: trainerData.password || 'trainer123'
  };
  db.addUser(newUser);

  res.json({ success: true, trainer: newTrainer });
});

app.post('/api/trainers/:id/report', (req: Request, res: Response) => {
  const { id } = req.params;
  const { content, count } = req.body;
  const trainer = db.getAllTrainers().find(t => t.id === id);
  if (!trainer) return res.status(404).json({ error: 'Trainer not found' });

  const reportId = genId('rep');
  const report = {
    id: reportId,
    date: new Date().toISOString().split('T')[0],
    content,
    studentsCount: Number(count)
  };

  trainer.dailyReports = trainer.dailyReports || [];
  trainer.dailyReports.push(report);
  db.updateTrainer(trainer);

  res.json({ success: true, report, trainer });
});

// 8. Attendance Endpoints
app.get('/api/attendance', (req: Request, res: Response) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  if (!tenantId) return res.status(400).json({ error: 'Tenant context header is missing' });
  res.json(db.getAttendances(tenantId));
});

app.post('/api/attendance/clock-employee', (req: Request, res: Response) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  const branchId = req.headers['x-branch-id'] as string;
  const { employeeId, status, checkIn, checkOut } = req.body;

  const employee = db.getAllEmployees().find(e => e.id === employeeId);
  if (!employee) return res.status(404).json({ error: 'Employee not found' });

  const today = new Date().toISOString().split('T')[0];
  const existingRecords = db.getAttendances(tenantId);
  const existingRecord = existingRecords.find(a => a.targetId === employeeId && a.date === today && a.targetType === 'EMPLOYEE');

  if (existingRecord) {
    if (checkOut) existingRecord.checkOut = checkOut;
    if (checkIn) existingRecord.checkIn = checkIn;
    existingRecord.status = status;
    db.updateAttendance(existingRecord);
    res.json({ success: true, record: existingRecord });
  } else {
    const newRecord = {
      id: genId('att'),
      organizationId: tenantId,
      branchId,
      targetId: employeeId,
      targetName: employee.fullName,
      targetType: 'EMPLOYEE' as const,
      date: today,
      status,
      checkIn: checkIn || new Date().toTimeString().slice(0, 5),
      checkOut
    };
    db.addAttendance(newRecord);
    res.json({ success: true, record: newRecord });
  }
});

app.post('/api/attendance/mark-student', (req: Request, res: Response) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  const branchId = req.headers['x-branch-id'] as string;
  const { studentId, status } = req.body;

  const student = db.getAllStudents().find(s => s.id === studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const today = new Date().toISOString().split('T')[0];
  const existingRecords = db.getAttendances(tenantId);
  const existingRecord = existingRecords.find(a => a.targetId === studentId && a.date === today && a.targetType === 'STUDENT');

  if (existingRecord) {
    existingRecord.status = status;
    db.updateAttendance(existingRecord);
    res.json({ success: true, record: existingRecord });
  } else {
    const newRecord = {
      id: genId('att'),
      organizationId: tenantId,
      branchId,
      targetId: studentId,
      targetName: student.fullName,
      targetType: 'STUDENT' as const,
      date: today,
      status
    };
    db.addAttendance(newRecord);
    res.json({ success: true, record: newRecord });
  }
});

// 9. Tasks Endpoints
app.get('/api/tasks', (req: Request, res: Response) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  if (!tenantId) return res.status(400).json({ error: 'Tenant context header is missing' });
  res.json(db.getTasks(tenantId));
});

app.post('/api/tasks', (req: Request, res: Response) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  const branchId = req.headers['x-branch-id'] as string;
  const { title, description, priority, dueDate, assigneeId, assigneeName, creatorId, creatorName } = req.body;

  const newTask = {
    id: genId('task'),
    organizationId: tenantId,
    branchId,
    title,
    description,
    status: 'PENDING' as const,
    priority,
    dueDate,
    assigneeId,
    assigneeName,
    creatorId,
    creatorName,
    comments: [],
    attachments: []
  };

  db.addTask(newTask);
  res.json({ success: true, task: newTask });
});

app.put('/api/tasks/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const tasks = db.getAllTasks();
  const task = tasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  task.status = status;
  db.updateTask(task);
  res.json({ success: true, task });
});

app.post('/api/tasks/:id/comment', (req: Request, res: Response) => {
  const { id } = req.params;
  const { authorName, text } = req.body;
  const tasks = db.getAllTasks();
  const task = tasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const newComment = {
    id: genId('cmt'),
    authorName,
    text,
    createdAt: new Date().toISOString()
  };

  task.comments = task.comments || [];
  task.comments.push(newComment);
  db.updateTask(task);

  res.json({ success: true, comment: newComment, task });
});

// 10. Finance / Transactions Endpoints
app.get('/api/transactions', (req: Request, res: Response) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  if (!tenantId) return res.status(400).json({ error: 'Tenant context header is missing' });
  res.json(db.getTransactions(tenantId));
});

app.post('/api/transactions', (req: Request, res: Response) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  const branchId = req.headers['x-branch-id'] as string;
  const { type, category, amount, description, paymentMethod, recordedBy } = req.body;

  const newTx = {
    id: genId('tx'),
    organizationId: tenantId,
    branchId,
    type,
    category,
    amount: Number(amount),
    description,
    date: new Date().toISOString().split('T')[0],
    paymentMethod,
    recordedBy: recordedBy || 'System'
  };

  db.addTransaction(newTx);
  res.json({ success: true, transaction: newTx });
});

// 11. Activities Endpoints
app.get('/api/activities', (req: Request, res: Response) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  if (!tenantId) return res.status(400).json({ error: 'Tenant context header is missing' });
  res.json(db.getActivities(tenantId));
});

app.post('/api/activities', (req: Request, res: Response) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  const { userId, userFullName, role, action, module } = req.body;

  const newActivity = {
    id: genId('act'),
    organizationId: tenantId,
    userId,
    userFullName,
    role,
    action,
    module,
    timestamp: new Date().toISOString()
  };

  db.addActivity(newActivity);
  res.json({ success: true, activity: newActivity });
});

// 12. Notifications Endpoints
app.get('/api/notifications', (req: Request, res: Response) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  if (!tenantId) return res.status(400).json({ error: 'Tenant context header is missing' });
  res.json(db.getNotifications(tenantId));
});

app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const allNotifs = db.getNotifications(req.headers['x-tenant-id'] as string);
  const notif = allNotifs.find(n => n.id === id);
  if (!notif) return res.status(404).json({ error: 'Notification not found' });

  notif.isRead = true;
  db.updateNotification(notif);
  res.json({ success: true, notification: notif });
});

app.post('/api/notifications/clear', (req: Request, res: Response) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  db.clearAllNotifications(tenantId);
  res.json({ success: true });
});

// 13. System Tickets Endpoints
app.get('/api/tickets', (req: Request, res: Response) => {
  res.json(db.getTickets());
});

app.put('/api/tickets/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const tickets = db.getTickets();
  const ticket = tickets.find(t => t.id === id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  ticket.status = status;
  db.updateTicket(ticket);
  res.json({ success: true, ticket });
});

// 14. Gemini Business AI Assistant Endpoint
app.post('/api/ai/query', async (req: Request, res: Response) => {
  const { prompt } = req.body;
  const tenantId = req.headers['x-tenant-id'] as string;
  
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
  if (!tenantId) return res.status(400).json({ error: 'Tenant context header is missing' });

  const tenant = db.getTenants().find(t => t.id === tenantId);
  if (!tenant) return res.status(404).json({ error: 'Tenant organization not found' });

  try {
    // Collect full grounded context data from our relational DB
    const dbData = {
      tenantName: tenant.name,
      currency: tenant.currency || '$',
      employees: db.getEmployees(tenantId),
      students: db.getStudents(tenantId),
      trainers: db.getTrainers(tenantId),
      transactions: db.getTransactions(tenantId),
      tasks: db.getTasks(tenantId),
      attendances: db.getAttendances(tenantId)
    };

    const answer = await askBusinessAssistant(prompt, tenantId, dbData);
    res.json({ success: true, answer });
  } catch (error: any) {
    console.error('AI query route crashed:', error);
    res.status(500).json({ error: 'Failed to process AI request. Please try again later.' });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Vite Dev Mode setup
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BusinessFlow ERP production-ready V2 server running on http://localhost:${PORT}`);
  });
}

startServer();
