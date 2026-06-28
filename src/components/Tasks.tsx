/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useErp } from '../store/erpStore';
import { Task } from '../types';
import {
  Plus,
  Clock,
  MessageSquare,
  Paperclip,
  CheckCircle,
  AlertTriangle,
  Users,
  Search,
  CheckSquare,
  Send,
  X
} from 'lucide-react';

export default function Tasks() {
  const {
    tasks,
    employees,
    trainers,
    createTask,
    updateTaskStatus,
    addTaskComment,
    currentTenantId
  } = useErp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Create task states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newAssigneeName, setNewAssigneeName] = useState('');

  // Comment state
  const [commentText, setCommentText] = useState('');

  // Filter tasks
  const tenantTasks = tasks.filter(t => t.organizationId === currentTenantId);
  const filteredTasks = tenantTasks.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.assigneeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group tasks by status
  const tasksByStatus = {
    PENDING: filteredTasks.filter(t => t.status === 'PENDING'),
    IN_PROGRESS: filteredTasks.filter(t => t.status === 'IN_PROGRESS'),
    COMPLETED: filteredTasks.filter(t => t.status === 'COMPLETED')
  };

  // Compile list of potential assignees (staff & trainers)
  const potentialAssignees = [
    ...employees.filter(e => e.organizationId === currentTenantId && e.status === 'ACTIVE').map(e => e.fullName),
    ...trainers.filter(t => t.organizationId === currentTenantId).map(t => t.fullName)
  ];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !newAssigneeName) return;

    createTask({
      title: newTaskTitle,
      description: newTaskDesc,
      status: 'PENDING',
      priority: newTaskPriority,
      dueDate: newTaskDueDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      assigneeName: newAssigneeName,
      assigneeId: `assign-${Date.now()}`,
      attachments: []
    });

    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskPriority('MEDIUM');
    setNewTaskDueDate('');
    setNewAssigneeName('');
    setShowAddModal(false);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !commentText.trim()) return;

    addTaskComment(selectedTask.id, commentText);
    
    // Refresh modal UI state
    const updated = tasks.find(t => t.id === selectedTask.id);
    if (updated) {
      setSelectedTask({
        ...updated,
        comments: [...updated.comments, { id: `${Date.now()}`, authorName: 'You', text: commentText, createdAt: new Date().toISOString() }]
      });
    }
    setCommentText('');
  };

  const moveTask = (taskId: string, nextStatus: Task['status']) => {
    updateTaskStatus(taskId, nextStatus);
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, status: nextStatus } : null);
    }
  };

  const priorityStyles = {
    LOW: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200/50',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40',
    HIGH: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40'
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-display text-zinc-900 dark:text-zinc-50">
            Operations Tasks
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Create, track, and collaborate on organizational and branch administrative tasks.
          </p>
        </div>
        <button
          onClick={() => {
            if (potentialAssignees.length > 0) {
              setNewAssigneeName(potentialAssignees[0]);
            }
            setShowAddModal(true);
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Assign Task</span>
        </button>
      </div>

      {/* Toolbar filter */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-xl shadow-xs">
        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
          Total Assigned Tasks: {filteredTasks.length}
        </span>
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100"
          />
        </div>
      </div>

      {/* Kanban Board Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Kanban Column Builder */}
        {(['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map((status) => {
          const statusLabel = status.replace('_', ' ');
          const list = tasksByStatus[status] || [];
          return (
            <div key={status} className="space-y-3.5">
              
              {/* Column Header */}
              <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-3 border border-zinc-200/80 dark:border-zinc-850 rounded-xl">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{statusLabel}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold text-zinc-500 bg-zinc-200/60 dark:bg-zinc-800 rounded-sm">
                  {list.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="space-y-3 min-h-[350px] overflow-y-auto pr-0.5">
                {list.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs hover:shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-sm uppercase tracking-wider ${priorityStyles[task.priority]}`}>
                        {task.priority}
                      </span>
                      <span className="text-[9px] text-zinc-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {task.dueDate}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-zinc-700 dark:group-hover:text-white leading-snug">
                      {task.title}
                    </h4>

                    <p className="text-[10px] text-zinc-400 mt-1.5 leading-normal truncate">
                      {task.description}
                    </p>

                    <div className="border-t border-zinc-100 dark:border-zinc-800/60 mt-3 pt-2.5 flex justify-between items-center text-[10px] text-zinc-500">
                      <span className="flex items-center gap-1.5 font-semibold text-zinc-600 dark:text-zinc-400">
                        <Users className="w-3.5 h-3.5 text-zinc-400" /> {task.assigneeName}
                      </span>

                      <div className="flex items-center gap-2">
                        {task.comments.length > 0 && (
                          <span className="flex items-center gap-0.5 text-zinc-400">
                            <MessageSquare className="w-3 h-3" /> {task.comments.length}
                          </span>
                        )}
                        {task.attachments.length > 0 && (
                          <span className="flex items-center gap-0.5 text-zinc-400">
                            <Paperclip className="w-3 h-3" /> {task.attachments.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {list.length === 0 && (
                  <div className="py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center text-[11px] text-zinc-400">
                    Empty Column
                  </div>
                )}
              </div>

            </div>
          );
        })}

      </div>

      {/* Task Expansion / Comments sheet overlay */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <span className={`px-2 py-0.5 text-[9px] font-bold border rounded-sm uppercase tracking-wider ${priorityStyles[selectedTask.priority]}`}>
                  {selectedTask.priority} Priority
                </span>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mt-2">
                  {selectedTask.title}
                </h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">Assigned to: <strong>{selectedTask.assigneeName}</strong></p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs max-h-96 overflow-y-auto pr-1">
              <div>
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Description</span>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mt-1">{selectedTask.description}</p>
              </div>

              {/* Status workflow triggers */}
              <div>
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Transition Status</span>
                <div className="flex gap-1.5 mt-1.5">
                  <button
                    onClick={() => moveTask(selectedTask.id, 'PENDING')}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer ${
                      selectedTask.status === 'PENDING'
                        ? 'bg-zinc-100 text-zinc-900 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 font-extrabold'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-zinc-500'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => moveTask(selectedTask.id, 'IN_PROGRESS')}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer ${
                      selectedTask.status === 'IN_PROGRESS'
                        ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/25 dark:text-amber-400 font-extrabold'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-zinc-500'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => moveTask(selectedTask.id, 'COMPLETED')}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer ${
                      selectedTask.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/25 dark:text-emerald-400 font-extrabold'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-zinc-500'
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>

              {/* Comments Roster */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">Collaboration Thread</span>
                <div className="space-y-3.5 max-h-44 overflow-y-auto mb-3 pr-1">
                  {selectedTask.comments && selectedTask.comments.length > 0 ? (
                    selectedTask.comments.map((com, idx) => (
                      <div key={idx} className="bg-zinc-50 dark:bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-150 dark:border-zinc-800">
                        <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                          <span className="font-bold">{com.authorName}</span>
                          <span>{new Date(com.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-zinc-700 dark:text-zinc-350 leading-relaxed text-[11px]">{com.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-zinc-400 italic">No comments posted yet.</p>
                  )}
                </div>

                {/* Post Comment form */}
                <form onSubmit={handleCommentSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    required
                    placeholder="Type comments or state-board guidelines..."
                    className="flex-grow text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 rounded-lg focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded-lg hover:opacity-90 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1">
              Assign Operational Task
            </h3>
            <p className="text-[11px] text-zinc-400 mb-4">
              Delegate responsibilities across tutors and staff coordinators.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                  placeholder="E.g., Review Salon autoclave safety checklist"
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                  Task Description
                </label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  rows={3}
                  placeholder="Detail step-by-step duties, target metrics, or regulatory guidelines."
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Assignee Member
                  </label>
                  <select
                    value={newAssigneeName}
                    onChange={(e) => setNewAssigneeName(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  >
                    {potentialAssignees.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                    Priority Tier
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
