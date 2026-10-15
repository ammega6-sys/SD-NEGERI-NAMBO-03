import React from 'react';
import { Menu, X, Sparkles, RefreshCw } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { SchoolLogo } from '../common/SchoolLogo';

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { activeMenu, setActiveMenu, students, teachersStaff } = useSchool();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 md:gap-8 px-4 md:px-6 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Zone 1: Single text element wordmark + crest */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Buka menu navigasi"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <a 
          href="#dashboard" 
          onClick={(e) => { e.preventDefault(); setActiveMenu('dashboard'); }} 
          className="flex items-center gap-2.5 text-slate-900 group"
        >
          <SchoolLogo size="sm" className="group-hover:scale-105 transition-transform" />
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap block leading-tight">
              SD Negeri Nambo 03
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:block leading-none">
              Kec. Klapanunggal, Kab. Bogor
            </span>
          </div>
        </a>
      </div>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
        <button
          onClick={() => setActiveMenu('dashboard')}
          className={`hover:text-blue-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeMenu === 'dashboard' ? 'text-blue-900 border-blue-900 font-semibold' : 'border-transparent'
          }`}
        >
          Dashboard Utama
        </button>
        <button
          onClick={() => setActiveMenu('absensi')}
          className={`hover:text-blue-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeMenu === 'absensi' ? 'text-blue-900 border-blue-900 font-semibold' : 'border-transparent'
          }`}
        >
          Absensi Harian
        </button>
        <button
          onClick={() => setActiveMenu('rekap-umur')}
          className={`hover:text-blue-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeMenu === 'rekap-umur' ? 'text-blue-900 border-blue-900 font-semibold' : 'border-transparent'
          }`}
        >
          Rekapitulasi Umur
        </button>
        <button
          onClick={() => setActiveMenu('manajemen-kelas')}
          className={`hover:text-blue-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeMenu === 'manajemen-kelas' ? 'text-blue-900 border-blue-900 font-semibold' : 'border-transparent'
          }`}
        >
          Manajemen Kelas & Siswa
        </button>
        <button
          onClick={() => setActiveMenu('input-data')}
          className={`hover:text-blue-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeMenu === 'input-data' ? 'text-blue-900 border-blue-900 font-semibold' : 'border-transparent'
          }`}
        >
          Input Data
        </button>
        <button
          onClick={() => setActiveMenu('kepegawaian')}
          className={`hover:text-blue-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeMenu === 'kepegawaian' ? 'text-blue-900 border-blue-900 font-semibold' : 'border-transparent'
          }`}
        >
          Kepegawaian & Guru
        </button>
      </nav>

      {/* Zone 3: 1 primary action or status badge */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium px-2.5 py-1.5 bg-slate-100 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>TA 2026/2027</span>
          <span className="text-slate-300">·</span>
          <span className="font-mono tabular-nums text-slate-700">{students.length} Siswa</span>
        </div>

        <button
          onClick={() => setActiveMenu('input-data')}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs flex items-center gap-1.5"
        >
          <span>+ Tambah Data</span>
        </button>
      </div>
    </header>
  );
};
