import React, { useState } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { AgeRecapView } from './components/age-recap/AgeRecapView';
import { InputDataView } from './components/input-data/InputDataView';
import { ManagementClassView } from './components/management-class/ManagementClassView';
import { StaffView } from './components/staff/StaffView';
import { DuplicateNisnModal } from './components/common/DuplicateNisnModal';
import {
  LayoutDashboard,
  CalendarCheck,
  BookOpen,
  FilePlus,
  GraduationCap,
  Briefcase
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { activeMenu, setActiveMenu } = useSchool();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-12">
          {activeMenu === 'dashboard' && <DashboardView />}
          {activeMenu === 'absensi' && <AttendanceView />}
          {activeMenu === 'rekap-umur' && <AgeRecapView />}
          {activeMenu === 'input-data' && <InputDataView />}
          {activeMenu === 'manajemen-kelas' && <ManagementClassView />}
          {activeMenu === 'kepegawaian' && <StaffView />}
        </main>
      </div>

      {/* Global Duplicate NISN Pop-up Alert Modal */}
      <DuplicateNisnModal />

      {/* Mobile-first Bottom Bar Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveMenu('dashboard')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-semibold transition-colors ${
            activeMenu === 'dashboard' ? 'text-blue-900' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveMenu('absensi')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-semibold transition-colors ${
            activeMenu === 'absensi' ? 'text-blue-900' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <CalendarCheck className="w-4 h-4 text-emerald-600" />
          <span>Absensi</span>
        </button>

        <button
          onClick={() => setActiveMenu('rekap-umur')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-semibold transition-colors ${
            activeMenu === 'rekap-umur' ? 'text-blue-900' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-cyan-600" />
          <span>Rekap Umur</span>
        </button>

        <button
          onClick={() => setActiveMenu('manajemen-kelas')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-semibold transition-colors ${
            activeMenu === 'manajemen-kelas' ? 'text-blue-900' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Kelas</span>
        </button>

        <button
          onClick={() => setActiveMenu('input-data')}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg text-[10px] font-semibold transition-colors ${
            activeMenu === 'input-data' ? 'text-blue-900' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FilePlus className="w-4 h-4" />
          <span>Input</span>
        </button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <SchoolProvider>
      <MainLayout />
    </SchoolProvider>
  );
}
