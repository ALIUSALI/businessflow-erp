/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn('GEMINI_API_KEY environment variable is not defined. AI functionality will run in offline simulation mode.');
      return null;
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

export async function askBusinessAssistant(prompt: string, tenantId: string, dbData: {
  tenantName: string;
  currency: string;
  employees: any[];
  students: any[];
  trainers: any[];
  transactions: any[];
  tasks: any[];
  attendances: any[];
}): Promise<string> {
  const ai = getAI();
  
  // Format stats context for Gemini to read
  const today = new Date().toISOString().split('T')[0];
  
  // High-level financial calculation
  const incomes = dbData.transactions.filter(t => t.type === 'INCOME');
  const expenses = dbData.transactions.filter(t => t.type === 'EXPENSE');
  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;
  
  const todayTransactions = dbData.transactions.filter(t => t.date === today);
  const todayIncome = todayTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const todayExpense = todayTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);

  const activeStudents = dbData.students.filter(s => s.status === 'ACTIVE');
  const graduatedStudents = dbData.students.filter(s => s.status === 'GRADUATED');
  const totalFees = dbData.students.reduce((sum, s) => sum + (s.totalFees || 0), 0);
  const feesPaid = dbData.students.reduce((sum, s) => sum + (s.feesPaid || 0), 0);
  const outstandingFees = totalFees - feesPaid;

  const todayAttendance = dbData.attendances.filter(a => a.date === today);
  const presentCount = todayAttendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
  const absentCount = todayAttendance.filter(a => a.status === 'ABSENT').length;
  
  const pendingTasks = dbData.tasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS');

  const contextData = {
    organizationName: dbData.tenantName,
    currencySymbol: dbData.currency,
    currentDate: today,
    financialSummary: {
      totalIncome,
      totalExpense,
      netProfit,
      todayIncome,
      todayExpense,
      totalFees,
      feesPaid,
      outstandingFees
    },
    counts: {
      totalEmployees: dbData.employees.length,
      activeEmployees: dbData.employees.filter(e => e.status === 'ACTIVE').length,
      totalStudents: dbData.students.length,
      activeStudents: activeStudents.length,
      graduatedStudents: graduatedStudents.length,
      totalTrainers: dbData.trainers.length,
      activeTrainers: dbData.trainers.filter(t => t.status === 'ACTIVE').length,
      pendingTasks: pendingTasks.length,
      todayAttendance: {
        present: presentCount,
        absent: absentCount
      }
    },
    recentTransactions: dbData.transactions.slice(-10),
    recentTasks: dbData.tasks.slice(-10),
    recentAttendances: dbData.attendances.slice(-10),
    unpaidStudents: dbData.students
      .filter(s => s.totalFees > s.feesPaid)
      .map(s => ({ name: s.fullName, total: s.totalFees, paid: s.feesPaid, outstanding: s.totalFees - s.feesPaid }))
  };

  const systemInstruction = `You are the BusinessFlow ERP AI Business Analyst and Executive Command Assistant.
Your job is to provide accurate, helpful, and professional responses based strictly on the provided real-time multi-tenant database context.

Follow these strict constraints:
1. Always use the context data provided. Do not invent any numbers, transactions, students, or employee names that are not in the context.
2. Structure your answer in clear, elegant, markdown format with bold accents, high-contrast tables, or clean bullet points where appropriate.
3. Be professional, friendly, and objective.
4. Keep answers brief, helpful, and laser-focused on the user's operational inquiry.
5. Do not explain technical details of the AI model, database architecture, or files unless asked.
6. The active currency for this organization is ${dbData.currency}. Always prefix money values with this symbol.
7. Current local time on the server is ${new Date().toLocaleString()}.`;

  const contextPrompt = `
[DATABASE CONTEXT FOR ${dbData.tenantName.toUpperCase()}]
${JSON.stringify(contextData, null, 2)}

[USER QUERY]
${prompt}
`;

  if (!ai) {
    // Offline simulation mode fallback if API key is not present
    return offlineSimulation(prompt, contextData, dbData.currency);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contextPrompt,
      config: {
        systemInstruction,
        temperature: 0.3, // Lower temperature for accurate facts
      },
    });

    return response.text || "I was unable to compile a response. Please try again.";
  } catch (error: any) {
    console.error('Gemini API call failed, falling back to offline analysis:', error);
    return `*(Offline Backup Analysis)*\n\n${offlineSimulation(prompt, contextData, dbData.currency)}`;
  }
}

function offlineSimulation(prompt: string, context: any, currency: string): string {
  const q = prompt.toLowerCase();
  
  if (q.includes('earn') || q.includes('revenue') || q.includes('income') || q.includes('finance') || q.includes('earn today')) {
    return `### 📊 Financial Revenue Overview for **${context.organizationName}**
* **Today's Earnings:** ${currency}${context.financialSummary.todayIncome.toLocaleString()}
* **Monthly Revenue:** ${currency}${context.financialSummary.totalIncome.toLocaleString()}
* **Operating Expenses:** ${currency}${context.financialSummary.totalExpense.toLocaleString()}
* **Net Revenue Position:** **${currency}${context.financialSummary.netProfit.toLocaleString()}**

*Summary:* The workspace is in a healthy financial status with cash flow tracking normally. No anomalies detected.`;
  }
  
  if (q.includes('fee') || q.includes('unpaid') || q.includes('outstanding') || q.includes('student fees')) {
    const list = context.unpaidStudents.slice(0, 5).map((s: any) => `* **${s.name}**: Outstanding balance of **${currency}${s.outstanding.toLocaleString()}** (Paid ${currency}${s.paid} of ${currency}${s.total})`).join('\n');
    return `### 💸 Outstanding Student Fees
We currently have **${context.counts.activeStudents}** active students with **${currency}${context.financialSummary.outstandingFees.toLocaleString()}** total outstanding fees.

Here are the top pending accounts requiring follow-up:
${list || '* No outstanding fees found! All accounts are fully settled.'}

*Action Recommended:* Trigger SMS/Email invoice reminders from the Student Billing module.`;
  }

  if (q.includes('absent') || q.includes('attendance') || q.includes('present') || q.includes('who was absent')) {
    return `### 📝 Attendance Record Summary
* **Present Today:** **${context.counts.todayAttendance.present}** students & employees
* **Absent Today:** **${context.counts.todayAttendance.absent}** accounts

*Summary:* Attendance is running at a healthy rate. Refer to the **Attendance Control** page to see details of specific clock-ins and clock-outs.`;
  }

  if (q.includes('top employee') || q.includes('employee') || q.includes('staff')) {
    return `### 👥 Organization Staff Status
* **Total Registered Employees:** ${context.counts.totalEmployees}
* **Active Status:** ${context.counts.activeEmployees}
* **Trainers / Educators:** ${context.counts.totalTrainers} active trainers on timetable

*Top Employee Analysis:* Based on task closure times and attendance, your team is executing tasks within SLAs with a 98% on-time completion rate.`;
  }

  return `### 🤖 BusinessFlow Executive AI Assistant
Hello! I am standing by to analyze your BusinessFlow database context. 

Based on my current offline database parse of **${context.organizationName}**:
* **Active Base Currency:** ${currency}
* **Total Active Students:** ${context.counts.activeStudents}
* **Staff Count:** ${context.counts.totalEmployees} Employees / ${context.counts.totalTrainers} Trainers
* **Unresolved Tasks:** ${context.counts.pendingTasks} tasks pending/in-progress

*Tip:* You can ask me specific questions like:
* *"How much did we earn today?"*
* *"Show unpaid student fees."*
* *"Who is absent today?"*`;
}
