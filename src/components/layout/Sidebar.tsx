import React from 'react';
import {
  LayoutDashboard,
  FilePlus,
  Users,
  Briefcase,
  GraduationCap,
  Layers,
  Award,
  BookOpen,
  Calendar,
  FileText,
  Clock,
  RotateCcw,
  School,
  X
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { SchoolLogo } from '../common/SchoolLogo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    activeMenu,
    setActiveMenu,
    inputSubTab,
    setInputSubTab,
    managementSubTab,
    setManagementSubTab,
    staffSubTab,
    setStaffSubTab,
    students,
    teachersStaff,
    classes,
    resetToDefaultData
  } = useSchool();

  const handleNav = (menu: 'dashboard' | 'absensi' | 'rekap-umur' | 'input-data' | 'manajemen-kelas' | 'kepegawaian') => {
    setActiveMenu(menu);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SchoolLogo size="md" showBorder={true} />
            <div>
              <div className="text-sm font-bold tracking-tight text-white leading-tight">
                SDN NAMBO 03
              </div>
              <div className="text-[11px] text-slate-400">
                NPSN: 20200352 · Klapanunggal
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
            aria-label="Tutup navigasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Menus */}
          <div>
            <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Menu Utama
            </div>
            <nav className="space-y-1">
              {/* 1. Dashboard */}
              <button
                onClick={() => handleNav('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  activeMenu === 'dashboard'
                    ? 'bg-blue-700 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-blue-400" />
                <span>Dashboard Utama</span>
              </button>

              {/* 2. Absensi Harian Guru */}
              <button
                onClick={() => handleNav('absensi')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  activeMenu === 'absensi'
                    ? 'bg-blue-700 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Absensi Harian Guru</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
                  Harian
                </span>
              </button>

              {/* 3. Rekapitulasi Umur Siswa */}
              <button
                onClick={() => handleNav('rekap-umur')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  activeMenu === 'rekap-umur'
                    ? 'bg-blue-700 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Rekapitulasi Umur Siswa</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300">
                  Bulanan
                </span>
              </button>

              {/* 2. Input Data */}
              <button
                onClick={() => handleNav('input-data')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  activeMenu === 'input-data'
                    ? 'bg-blue-700 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FilePlus className="w-4 h-4 text-amber-400" />
                  <span>Input / Menu Data</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300">
                  4 Tab
                </span>
              </button>

              {/* Sub-tabs for Input Data when active */}
              {activeMenu === 'input-data' && (
                <div className="ml-7 pl-3 border-l border-slate-700/60 my-1 space-y-1 py-1">
                  <button
                    onClick={() => { setInputSubTab('kelas-ekskul'); }}
                    className={`block w-full text-left py-1.5 px-2 rounded-lg text-xs transition-colors ${
                      inputSubTab === 'kelas-ekskul' ? 'text-amber-300 font-semibold bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    • Tab Kelas & Ekskul
                  </button>
                  <button
                    onClick={() => { setInputSubTab('siswa'); }}
                    className={`block w-full text-left py-1.5 px-2 rounded-lg text-xs transition-colors ${
                      inputSubTab === 'siswa' ? 'text-amber-300 font-semibold bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    • Tab Input Siswa
                  </button>
                  <button
                    onClick={() => { setInputSubTab('guru'); }}
                    className={`block w-full text-left py-1.5 px-2 rounded-lg text-xs transition-colors ${
                      inputSubTab === 'guru' ? 'text-amber-300 font-semibold bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    • Tab Input Guru
                  </button>
                  <button
                    onClick={() => { setInputSubTab('kepegawaian'); }}
                    className={`block w-full text-left py-1.5 px-2 rounded-lg text-xs transition-colors ${
                      inputSubTab === 'kepegawaian' ? 'text-amber-300 font-semibold bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    • Tab Input Kepegawaian (TU)
                  </button>
                </div>
              )}

              {/* 3. Manajemen Kelas */}
              <button
                onClick={() => handleNav('manajemen-kelas')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  activeMenu === 'manajemen-kelas'
                    ? 'bg-blue-700 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>Manajemen Kelas & Siswa</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300">
                  7 Tab
                </span>
              </button>

              {/* Sub-tabs for Manajemen Kelas when active */}
              {activeMenu === 'manajemen-kelas' && (
                <div className="ml-7 pl-3 border-l border-slate-700/60 my-1 space-y-1 py-1">
                  <button
                    onClick={() => setManagementSubTab('aktif')}
                    className={`block w-full text-left py-1 px-2 rounded text-xs transition-colors ${
                      managementSubTab === 'aktif' ? 'text-emerald-300 font-semibold bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    • Siswa Aktif
                  </button>
                  <button
                    onClick={() => setManagementSubTab('non-aktif')}
                    className={`block w-full text-left py-1 px-2 rounded text-xs transition-colors ${
                      managementSubTab === 'non-aktif' ? 'text-emerald-300 font-semibold bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    • Siswa Non-Aktif (DO/Mutasi)
                  </button>
                  <button
                    onClick={() => setManagementSubTab('pip')}
                    className={`block w-full text-left py-1 px-2 rounded text-xs transition-colors ${
                      managementSubTab === 'pip' ? 'text-emerald-300 font-semibold bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    • Siswa PIP
                  </button>
                  <button
                    onClick={() => setManagementSubTab('agama')}
                    className={`block w-full text-left py-1 px-2 rounded text-xs transition-colors ${
                      managementSubTab === 'agama' ? 'text-emerald-300 font-semibold bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    • Rekapitulasi Agama
                  </button>
                  <button
                    onClick={() => setManagementSubTab('ekskul')}
                    className={`block w-full text-left py-1 px-2 rounded text-xs transition-colors ${
                      managementSubTab === 'ekskul' ? 'text-emerald-300 font-semibold bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    • Ekstrakurikuler
                  </button>
                  <button
                    onClick={() => setManagementSubTab('wali-kelas')}
                    className={`block w-full text-left py-1 px-2 rounded text-xs transition-colors ${
                      managementSubTab === 'wali-kelas' ? 'text-emerald-300 font-semibold bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    • Pengaturan Wali Kelas
                  </button>
                  <button
                    onClick={() => setManagementSubTab('laporan')}
                    className={`block w-full text-left py-1 px-2 rounded text-xs transition-colors ${
                      managementSubTab === 'laporan' ? 'text-emerald-300 font-semibold bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    • Laporan Terpadu (PDF/Excel)
                  </button>
                </div>
              )}

              {/* 4. Kepegawaian */}
              <button
                onClick={() => handleNav('kepegawaian')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  activeMenu === 'kepegawaian'
                    ? 'bg-blue-700 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  <span>Kepegawaian & Guru</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300">
                  2 Tab
                </span>
              </button>

              {/* Sub-tabs for Kepegawaian when active */}
              {activeMenu === 'kepegawaian' && (
                <div className="ml-7 pl-3 border-l border-slate-700/60 my-1 space-y-1 py-1">
                  <button
                    onClick={() => setStaffSubTab('data-pegawai')}
                    className={`block w-full text-left py-1 px-2 rounded text-xs transition-colors ${
                      staffSubTab === 'data-pegawai' ? 'text-purple-300 font-semibold bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    • Data Guru & Pegawai
                  </button>
                  <button
                    onClick={() => setStaffSubTab('jam-mengajar')}
                    className={`block w-full text-left py-1 px-2 rounded text-xs transition-colors ${
                      staffSubTab === 'jam-mengajar' ? 'text-purple-300 font-semibold bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    • Data Jam Mengajar
                  </button>
                </div>
              )}
            </nav>
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 space-y-2">
            <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
              <span>Ringkasan Data</span>
              <span className="text-emerald-400 text-[10px]">Sinkron</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-900/80 p-2 rounded-lg">
                <div className="text-slate-400">Total Siswa</div>
                <div className="text-base font-bold text-white tabular-nums">{students.length}</div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg">
                <div className="text-slate-400">Rombel</div>
                <div className="text-base font-bold text-white tabular-nums">{classes.length}</div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg">
                <div className="text-slate-400">Guru</div>
                <div className="text-base font-bold text-white tabular-nums">
                  {teachersStaff.filter(t => t.kategori === 'guru').length}
                </div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg">
                <div className="text-slate-400">Tenaga TU</div>
                <div className="text-base font-bold text-white tabular-nums">
                  {teachersStaff.filter(t => t.kategori === 'kepegawaian').length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info & Reset button */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Dapodik SDN Nambo 03</span>
          <button
            onClick={() => {
              if (window.confirm('Reset data kembali ke data contoh bawaan sekolah?')) {
                resetToDefaultData();
              }
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors p-1 rounded"
            title="Kembalikan data ke awal (demo)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </aside>
    </>
  );
};
