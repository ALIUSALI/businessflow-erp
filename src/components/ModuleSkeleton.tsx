/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

interface ModuleSkeletonProps {
  module: string;
  key?: React.Key;
}

export default function ModuleSkeleton({ module }: ModuleSkeletonProps) {
  // Container transition with slide-up and fade-in
  const containerVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  const pulseClass = "animate-pulse bg-zinc-200 dark:bg-zinc-800/80 rounded-lg";

  const renderContent = () => {
    switch (module) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Page Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className={`${pulseClass} h-8 w-64`} />
                <div className={`${pulseClass} h-4 w-96 max-w-full`} />
              </div>
              <div className="flex gap-3 shrink-0">
                <div className={`${pulseClass} h-10 w-32`} />
                <div className={`${pulseClass} h-10 w-24`} />
              </div>
            </div>

            {/* Metrics Cards Grid (4 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div className={`${pulseClass} h-4 w-24`} />
                    <div className={`${pulseClass} h-8 w-8 rounded-full`} />
                  </div>
                  <div className="space-y-2">
                    <div className={`${pulseClass} h-8 w-28`} />
                    <div className={`${pulseClass} h-3.5 w-40 max-w-full`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Main Graphs & Detailed Panels Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Large Chart */}
              <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <div className={`${pulseClass} h-5 w-48`} />
                  <div className={`${pulseClass} h-8 w-28`} />
                </div>
                <div className={`${pulseClass} h-64 w-full`} />
              </div>

              {/* Right Column - Secondary sub-panel (Class Timetable) */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <div className={`${pulseClass} h-5 w-32`} />
                  <div className={`${pulseClass} h-4 w-16`} />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`${pulseClass} h-10 w-10 rounded-full shrink-0`} />
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className={`${pulseClass} h-3.5 w-32 max-w-full`} />
                        <div className={`${pulseClass} h-3 w-48 max-w-full`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Panel - Recent Activities list */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-6 rounded-2xl space-y-4">
              <div className={`${pulseClass} h-5 w-40 mb-2`} />
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`${pulseClass} h-9 w-9 rounded-lg shrink-0`} />
                      <div className="space-y-1.5 min-w-0">
                        <div className={`${pulseClass} h-3.5 w-56 max-w-full`} />
                        <div className={`${pulseClass} h-3 w-28 max-w-full`} />
                      </div>
                    </div>
                    <div className={`${pulseClass} h-4 w-16 shrink-0`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'employees':
      case 'students':
      case 'trainers':
        return (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className={`${pulseClass} h-8 w-48`} />
                <div className={`${pulseClass} h-4 w-80 max-w-full`} />
              </div>
              <div className={`${pulseClass} h-10 w-36 shrink-0`} />
            </div>

            {/* Tabs Filter Bar & Search Input Row */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-xl">
              {/* Tab options mockup */}
              <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-lg self-start">
                <div className={`${pulseClass} h-8 w-24`} />
                <div className={`${pulseClass} h-8 w-24`} />
                <div className={`${pulseClass} h-8 w-24`} />
              </div>
              {/* Search input mockup */}
              <div className="flex gap-2 flex-grow md:max-w-md">
                <div className={`${pulseClass} h-10 w-full`} />
                <div className={`${pulseClass} h-10 w-28 shrink-0`} />
              </div>
            </div>

            {/* Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className={`${pulseClass} h-12 w-12 rounded-full shrink-0`} />
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className={`${pulseClass} h-4 w-32 max-w-full`} />
                      <div className={`${pulseClass} h-3.5 w-24 max-w-full`} />
                      <div className={`${pulseClass} h-3 w-40 max-w-full`} />
                    </div>
                  </div>
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex justify-between gap-2">
                    <div className={`${pulseClass} h-6 w-20 rounded-md`} />
                    <div className={`${pulseClass} h-6 w-24 rounded-md`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'attendance':
        return (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className={`${pulseClass} h-8 w-56`} />
                <div className={`${pulseClass} h-4 w-72 max-w-full`} />
              </div>
              <div className="flex gap-3 shrink-0">
                <div className={`${pulseClass} h-10 w-28`} />
                <div className={`${pulseClass} h-10 w-36`} />
              </div>
            </div>

            {/* Filter Panel */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-4 rounded-xl flex flex-wrap gap-4 items-center">
              <div className={`${pulseClass} h-9 w-32`} />
              <div className={`${pulseClass} h-9 w-40`} />
              <div className={`${pulseClass} h-9 w-48`} />
            </div>

            {/* Table Mockup */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/60">
                <div className={`${pulseClass} h-4 w-32`} />
                <div className="flex gap-16 pr-8">
                  <div className={`${pulseClass} h-4 w-12`} />
                  <div className={`${pulseClass} h-4 w-12`} />
                  <div className={`${pulseClass} h-4 w-12`} />
                </div>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`${pulseClass} h-8 w-8 rounded-full shrink-0`} />
                      <div className="space-y-1.5">
                        <div className={`${pulseClass} h-3.5 w-40 max-w-full`} />
                        <div className={`${pulseClass} h-3 w-20 max-w-full`} />
                      </div>
                    </div>
                    <div className="flex gap-16 pr-8">
                      <div className={`${pulseClass} h-5 w-5 rounded-full shrink-0`} />
                      <div className={`${pulseClass} h-5 w-5 rounded-full shrink-0`} />
                      <div className={`${pulseClass} h-5 w-5 rounded-full shrink-0`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'tasks':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className={`${pulseClass} h-8 w-44`} />
                <div className={`${pulseClass} h-4 w-64 max-w-full`} />
              </div>
              <div className={`${pulseClass} h-10 w-32 shrink-0`} />
            </div>

            {/* Task Board Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['To Do', 'In Progress', 'Completed'].map((col, idx) => (
                <div key={idx} className="bg-zinc-100/50 dark:bg-zinc-900/40 border border-zinc-150 dark:border-zinc-800 p-4 rounded-2xl space-y-4 min-h-[450px]">
                  {/* Column Header */}
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-200/50 dark:border-zinc-800/50">
                    <div className="flex items-center gap-2">
                      <div className={`${pulseClass} h-4 w-20`} />
                      <div className={`${pulseClass} h-5 w-5 rounded-full`} />
                    </div>
                    <div className={`${pulseClass} h-4 w-4`} />
                  </div>
                  {/* Task Cards */}
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-4 rounded-xl space-y-3 shadow-xs">
                      <div className="flex justify-between">
                        <div className={`${pulseClass} h-5 w-16 rounded-md`} />
                        <div className={`${pulseClass} h-4 w-12`} />
                      </div>
                      <div className={`${pulseClass} h-4 w-full`} />
                      <div className={`${pulseClass} h-3.5 w-3/4`} />
                      <div className="pt-2 flex justify-between items-center border-t border-zinc-100 dark:border-zinc-850">
                        <div className="flex items-center gap-1.5">
                          <div className={`${pulseClass} h-5 w-5 rounded-full`} />
                          <div className={`${pulseClass} h-3 w-16`} />
                        </div>
                        <div className={`${pulseClass} h-4 w-10`} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );

      case 'finance':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className={`${pulseClass} h-8 w-48`} />
                <div className={`${pulseClass} h-4 w-72 max-w-full`} />
              </div>
              <div className={`${pulseClass} h-10 w-44 shrink-0`} />
            </div>

            {/* Stat Cards Grid (3 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-6 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div className={`${pulseClass} h-4 w-24`} />
                    <div className={`${pulseClass} h-8 w-8 rounded-full`} />
                  </div>
                  <div className={`${pulseClass} h-8 w-40 max-w-full`} />
                </div>
              ))}
            </div>

            {/* Split layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Transactions List */}
              <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <div className={`${pulseClass} h-5 w-36`} />
                  <div className={`${pulseClass} h-8 w-24`} />
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center p-3 border border-zinc-100 dark:border-zinc-800/80 rounded-xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`${pulseClass} h-8 w-8 rounded-lg shrink-0`} />
                        <div className="space-y-1 min-w-0">
                          <div className={`${pulseClass} h-3.5 w-32 max-w-full`} />
                          <div className={`${pulseClass} h-3 w-16 max-w-full`} />
                        </div>
                      </div>
                      <div className="text-right space-y-1 shrink-0">
                        <div className={`${pulseClass} h-4 w-16 ml-auto`} />
                        <div className={`${pulseClass} h-3 w-20`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Finance Graph placeholder */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-6 rounded-2xl space-y-4">
                <div className={`${pulseClass} h-5 w-28`} />
                <div className={`${pulseClass} h-48 w-full`} />
                <div className="flex justify-between">
                  <div className={`${pulseClass} h-3 w-10`} />
                  <div className={`${pulseClass} h-3 w-10`} />
                  <div className={`${pulseClass} h-3 w-10`} />
                </div>
              </div>
            </div>
          </div>
        );

      case 'superadmin':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className={`${pulseClass} h-8 w-60`} />
              <div className={`${pulseClass} h-4 w-80 max-w-full`} />
            </div>

            {/* Quick KPI stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-4 rounded-xl space-y-2">
                  <div className={`${pulseClass} h-3.5 w-20`} />
                  <div className={`${pulseClass} h-6 w-24`} />
                </div>
              ))}
            </div>

            {/* Large Table */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl overflow-hidden p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className={`${pulseClass} h-5 w-44`} />
                <div className={`${pulseClass} h-8 w-32`} />
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`${pulseClass} h-9 w-9 rounded-lg shrink-0`} />
                      <div className="space-y-1.5 min-w-0">
                        <div className={`${pulseClass} h-3.5 w-32 max-w-full`} />
                        <div className={`${pulseClass} h-3 w-48 max-w-full`} />
                      </div>
                    </div>
                    <div className="flex gap-4 shrink-0">
                      <div className={`${pulseClass} h-6 w-16 rounded-full`} />
                      <div className={`${pulseClass} h-6 w-20 rounded-full`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className={`${pulseClass} h-8 w-40`} />
                <div className={`${pulseClass} h-4 w-60 max-w-full`} />
              </div>
              <div className={`${pulseClass} h-10 w-28`} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-6 rounded-2xl space-y-4">
                  <div className={`${pulseClass} h-4 w-20`} />
                  <div className={`${pulseClass} h-24 w-full`} />
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      {renderContent()}
    </motion.div>
  );
}
