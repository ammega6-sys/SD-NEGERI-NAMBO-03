import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  Briefcase,
  Award,
  CreditCard,
  UserCheck,
  UserX,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Clock,
  BookOpen,
  PieChart as PieIcon,
  BarChart2
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { Religion } from '../../types';
import { SchoolLogo } from '../common/SchoolLogo';

export const DashboardView: React.FC = () => {
  const {
    students,
    classes,
    extracurriculars,
    teachersStaff,
    teachingHours,
    classesMap,
    setActiveMenu,
    setInputSubTab,
    setManagementSubTab,
    setStaffSubTab
  } = useSchool();

  const [activeChartTab, setActiveChartTab] = useState<'kelas' | 'agama' | 'status' | 'ekskul'>('kelas');

  // Key Calculations
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'aktif' || s.status === 'pindahan_masuk').length;
  const nonActiveStudents = students.filter(s => s.status === 'mutasi_keluar' || s.status === 'berhenti_do').length;
  const pipStudents = students.filter(s => s.isPip).length;
  const pindahanStudents = students.filter(s => s.status === 'pindahan_masuk' || s.isPindahan).length;
  const totalPipDisbursed = students.reduce((sum, s) => sum + (s.isPip ? (s.nominalPip || 450000) : 0), 0);

  // Gender counts
  const maleCount = students.filter(s => s.jenisKelamin === 'L').length;
  const femaleCount = students.filter(s => s.jenisKelamin === 'P').length;
  const malePct = totalStudents > 0 ? Math.round((maleCount / totalStudents) * 100) : 0;
  const femalePct = totalStudents > 0 ? (100 - malePct) : 0;

  // Staff stats
  const totalGuru = teachersStaff.filter(t => t.kategori === 'guru').length;
  const totalStaffTu = teachersStaff.filter(t => t.kategori === 'kepegawaian').length;
  const pnsCount = teachersStaff.filter(t => t.statusKepegawaian === 'PNS').length;
  const pppkCount = teachersStaff.filter(t => t.statusKepegawaian === 'PPPK').length;
  const honorerCount = teachersStaff.filter(t => t.statusKepegawaian === 'Honorer' || t.statusKepegawaian === 'GTT' || t.statusKepegawaian === 'PTT').length;

  // Teaching hours certification check (>= 24 JP)
  const teacherHoursSummary = teachersStaff
    .filter(t => t.kategori === 'guru')
    .map(guru => {
      const hours = teachingHours.filter(th => th.guruId === guru.id);
      const totalJTM = hours.reduce((acc, h) => acc + h.jamTatapMuka + (h.jamTugasTambahan || 0), 0);
      return { guru, totalJTM, qualified: totalJTM >= 24 };
    });
  const certifiedCount = teacherHoursSummary.filter(t => t.qualified).length;

  // Students per class breakdown
  const classBreakdown = classes.map(c => {
    const classStudents = students.filter(s => s.kelasId === c.id);
    const m = classStudents.filter(s => s.jenisKelamin === 'L').length;
    const f = classStudents.filter(s => s.jenisKelamin === 'P').length;
    const pip = classStudents.filter(s => s.isPip).length;
    return {
      class: c,
      total: classStudents.length,
      m,
      f,
      pip,
      pctOfCapacity: Math.round((classStudents.length / c.kuota) * 100)
    };
  });

  const maxStudentsInClass = Math.max(...classBreakdown.map(c => c.total), 1);

  // Religion breakdown
  const religionList: Religion[] = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Khonghucu'];
  const religionCounts = religionList.map(rel => {
    const count = students.filter(s => s.agama === rel).length;
    const pct = totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(1) : '0';
    return { name: rel, count, pct };
  });

  // Extracurriculars participation
  const ekskulBreakdown = extracurriculars.map(e => {
    const participants = students.filter(s => s.ekskulIds?.includes(e.id)).length;
    return {
      ekskul: e,
      count: participants,
      pct: totalStudents > 0 ? Math.round((participants / totalStudents) * 100) : 0
    };
  });

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="relative z-10 flex flex-col sm:flex-row items-start gap-6">
          <div className="p-1 bg-white/10 rounded-2xl backdrop-blur-xs border border-white/20 shrink-0 shadow-lg hidden sm:block">
            <SchoolLogo size="xl" />
          </div>

          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="sm:hidden">
                <SchoolLogo size="sm" />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-medium border border-blue-400/20">
                <span>NPSN: 20200352</span>
                <span aria-hidden="true">·</span>
                <span>SD Negeri Nambo 03</span>
                <span aria-hidden="true">·</span>
                <span>TA 2026/2027</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white text-balance">
              Dashboard Utama SD Negeri Nambo 03
            </h1>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Pusat monitoring komprehensif data siswa, absensi harian guru, rekapitulasi umur bulanan, rombel, penerima bantuan PIP, dan pembagian jam mengajar sekolah.
            </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveMenu('absensi')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center gap-2"
            >
              <span>+ Isi Absensi Harian</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveMenu('rekap-umur')}
              className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center gap-2"
            >
              <span>Rekapitulasi Umur Siswa</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setActiveMenu('input-data');
                setInputSubTab('siswa');
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center gap-2"
            >
              <span>+ Input Siswa Baru</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Decorative subtle background pattern */}
      <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
    </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Siswa */}
        <div 
          onClick={() => { setActiveMenu('manajemen-kelas'); setManagementSubTab('aktif'); }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-blue-300 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Siswa Terdaftar</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {totalStudents}
            </span>
            <span className="text-xs text-slate-500">anak</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="text-emerald-700 font-medium tabular-nums">{activeStudents} Aktif</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-700 font-medium tabular-nums">{pindahanStudents} Pindahan</span>
          </div>
        </div>

        {/* Stat 2: Penerima PIP */}
        <div 
          onClick={() => { setActiveMenu('manajemen-kelas'); setManagementSubTab('pip'); }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Penerima Bantuan PIP</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {pipStudents}
            </span>
            <span className="text-xs text-slate-500">siswa</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 font-mono tabular-nums truncate">
            Alokasi Rp {totalPipDisbursed.toLocaleString('id-ID')}
          </div>
        </div>

        {/* Stat 3: Guru & Tenaga Kependidikan */}
        <div 
          onClick={() => { setActiveMenu('kepegawaian'); setStaffSubTab('data-pegawai'); }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-purple-300 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Guru & Kepegawaian</span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {teachersStaff.length}
            </span>
            <span className="text-xs text-slate-500">orang</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span className="text-slate-700 font-medium tabular-nums">{totalGuru} Guru</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-700 font-medium tabular-nums">{totalStaffTu} TU / Staf</span>
          </div>
        </div>

        {/* Stat 4: Jam Mengajar Guru */}
        <div 
          onClick={() => { setActiveMenu('kepegawaian'); setStaffSubTab('jam-mengajar'); }}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-amber-300 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Kelayakan Beban Guru</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
              {certifiedCount} / {totalGuru}
            </span>
            <span className="text-xs text-slate-500">memenuhi</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Target standar $\ge 24$ JP linier
          </div>
        </div>
      </div>

      {/* Main Interactive Chart Sections with Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        {/* Section Header & Sub-controls */}
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Grafik Interaktif Data Sekolah SDN Nambo 03
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualisasi distribusi real-time seluruh elemen data peserta didik dan kelas
            </p>
          </div>

          {/* Functional filter control (interactive tab button) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveChartTab('kelas')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeChartTab === 'kelas'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Siswa per Kelas
            </button>
            <button
              onClick={() => setActiveChartTab('agama')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeChartTab === 'agama'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sebaran Agama
            </button>
            <button
              onClick={() => setActiveChartTab('status')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeChartTab === 'status'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Status Siswa & Gender
            </button>
            <button
              onClick={() => setActiveChartTab('ekskul')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeChartTab === 'ekskul'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Peminatan Ekskul
            </button>
          </div>
        </div>

        {/* Tab Content 1: Siswa per Kelas */}
        {activeChartTab === 'kelas' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Distribusi Rombongan Belajar (Rombel)</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-blue-600"></span> Laki-laki
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-pink-500"></span> Perempuan
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classBreakdown.map(item => {
                const wali = teachersStaff.find(t => t.id === item.class.waliKelasGuruId);
                return (
                  <div key={item.class.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-900">{item.class.nama}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {wali ? `Wali: ${wali.namaLengkap}` : <span className="text-rose-600 font-medium">Wali Kelas Kosong</span>}
                        </div>
                      </div>
                      <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        {item.total} / {item.class.kuota}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 w-full bg-slate-200 rounded-full h-3 overflow-hidden flex">
                      <div
                        style={{ width: `${item.total > 0 ? (item.m / item.total) * 100 : 0}%` }}
                        className="bg-blue-600 h-full"
                        title={`Laki-laki: ${item.m}`}
                      />
                      <div
                        style={{ width: `${item.total > 0 ? (item.f / item.total) * 100 : 0}%` }}
                        className="bg-pink-500 h-full"
                        title={`Perempuan: ${item.f}`}
                      />
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                      <span>L: <strong className="text-slate-800 tabular-nums">{item.m}</strong> · P: <strong className="text-slate-800 tabular-nums">{item.f}</strong></span>
                      <span>PIP: <strong className="text-emerald-700 tabular-nums">{item.pip} anak</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Content 2: Sebaran Agama */}
        {activeChartTab === 'agama' && (
          <div className="p-6">
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-sm font-bold text-slate-900">Rekapitulasi Agama Peserta Didik SDN Nambo 03</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Kebutuhan ketersediaan guru Pendidikan Agama & Budi Pekerti
                </p>
              </div>

              <div className="space-y-3">
                {religionCounts.map(rel => (
                  <div key={rel.name} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-800">{rel.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono tabular-nums text-slate-900 font-bold">{rel.count} siswa</span>
                        <span className="text-slate-400 tabular-nums">({rel.pct}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${rel.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 3: Status Siswa & Gender */}
        {activeChartTab === 'status' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gender ratio */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-blue-600" />
                  Rasio Gender Peserta Didik
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 font-medium">Laki-laki (L)</span>
                        <span className="font-mono font-bold text-blue-700 tabular-nums">{maleCount} anak ({malePct}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${malePct}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 font-medium">Perempuan (P)</span>
                        <span className="font-mono font-bold text-pink-600 tabular-nums">{femaleCount} anak ({femalePct}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div className="bg-pink-500 h-full rounded-full" style={{ width: `${femalePct}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-emerald-600" />
                  Status Keberadaan Siswa
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                    <span className="font-medium text-slate-700">Siswa Aktif Reguler</span>
                    <span className="font-mono font-bold text-emerald-700 tabular-nums">
                      {students.filter(s => s.status === 'aktif' && !s.isPindahan).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                    <span className="font-medium text-slate-700">Siswa Baru Pindahan</span>
                    <span className="font-mono font-bold text-blue-700 tabular-nums">
                      {students.filter(s => s.status === 'pindahan_masuk' || s.isPindahan).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                    <span className="font-medium text-slate-700">Mutasi Keluar Sekolah</span>
                    <span className="font-mono font-bold text-amber-700 tabular-nums">
                      {students.filter(s => s.status === 'mutasi_keluar').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                    <span className="font-medium text-slate-700">Berhenti Sekolah (Drop Out)</span>
                    <span className="font-mono font-bold text-rose-700 tabular-nums">
                      {students.filter(s => s.status === 'berhenti_do').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 4: Peminatan Ekskul */}
        {activeChartTab === 'ekskul' && (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ekskulBreakdown.map(item => {
                const pembina = teachersStaff.find(t => t.id === item.ekskul.pembinaGuruId);
                return (
                  <div key={item.ekskul.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-900">{item.ekskul.nama}</div>
                        <div className="text-xs text-slate-500">{item.ekskul.kategori}</div>
                      </div>
                      <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                        {item.count} siswa
                      </span>
                    </div>

                    <div className="mt-3 text-xs text-slate-600">
                      <div>Pembina: <strong className="text-slate-800">{pembina ? pembina.namaLengkap : '-'}</strong></div>
                      <div className="text-slate-500 mt-0.5">Jadwal: {item.ekskul.jadwalHari}</div>
                    </div>

                    <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-full rounded-full"
                        style={{ width: `${Math.min(item.pct * 2, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Staff & Teaching Load Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kepegawaian composition */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Komposisi Pegawai SDN Nambo 03</h3>
            <button
              onClick={() => { setActiveMenu('kepegawaian'); setStaffSubTab('data-pegawai'); }}
              className="text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              Lihat Semua →
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500">PNS</div>
              <div className="text-xl font-extrabold text-slate-900 tabular-nums">{pnsCount}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500">PPPK</div>
              <div className="text-xl font-extrabold text-blue-700 tabular-nums">{pppkCount}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500">Honorer / PTT</div>
              <div className="text-xl font-extrabold text-amber-700 tabular-nums">{honorerCount}</div>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Guru Kelas (Wali Kelas)</span>
              <span className="font-semibold text-slate-900 tabular-nums">11 Orang</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Guru Mapel (PAI & PJOK)</span>
              <span className="font-semibold text-slate-900 tabular-nums">2 Orang</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Tenaga Kependidikan (TU, Perpus, Satpam, Penjaga)</span>
              <span className="font-semibold text-slate-900 tabular-nums">6 Orang</span>
            </div>
          </div>
        </div>

        {/* Quick Actions and Help */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Panduan Pintar & Modul Sistem</h3>
          <p className="text-xs text-slate-500 mb-4">
            Pintasan tindakan cepat sesuai juknis pengelolaan Dapodik SDN Nambo 03
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setActiveMenu('absensi')}
              className="text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-colors"
            >
              <div className="font-semibold text-xs text-slate-900">Presensi Harian Siswa</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Isi kehadiran kelas harian & cetak berkas PDF/Excel</div>
            </button>

            <button
              onClick={() => setActiveMenu('rekap-umur')}
              className="text-left p-3 rounded-xl border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/40 transition-colors"
            >
              <div className="font-semibold text-xs text-slate-900">Rekapitulasi Umur Bulanan</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Format administrasi usia siswa per rombel & download</div>
            </button>

            <button
              onClick={() => {
                setActiveMenu('input-data');
                setInputSubTab('siswa');
              }}
              className="text-left p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-colors"
            >
              <div className="font-semibold text-xs text-slate-900">Input Siswa Baru</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Siswa reguler atau pindahan dengan validasi NISN unik</div>
            </button>

            <button
              onClick={() => {
                setActiveMenu('manajemen-kelas');
                setManagementSubTab('pip');
              }}
              className="text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition-colors"
            >
              <div className="font-semibold text-xs text-slate-900">Aktivasi Siswa PIP</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Pencairan dana & penetapan penerima KIP</div>
            </button>

            <button
              onClick={() => {
                setActiveMenu('manajemen-kelas');
                setManagementSubTab('wali-kelas');
              }}
              className="text-left p-3 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 transition-colors"
            >
              <div className="font-semibold text-xs text-slate-900">Penetapan Wali Kelas</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Tugaskan guru ke rombel dan pembina ekstrakurikuler</div>
            </button>

            <button
              onClick={() => {
                setActiveMenu('manajemen-kelas');
                setManagementSubTab('laporan');
              }}
              className="text-left p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 transition-colors"
            >
              <div className="font-semibold text-xs text-slate-900">Ekspor PDF & Excel</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Cetak kop surat resmi berfilter dinamis</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
