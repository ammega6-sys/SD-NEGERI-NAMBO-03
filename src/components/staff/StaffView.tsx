import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Users,
  Clock,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  FileText,
  Award,
  BookOpen,
  Calendar,
  X,
  School,
  AlertCircle
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { TeacherStaff, TeachingHour, StaffRole, EmploymentStatus, Gender } from '../../types';
import { Pagination } from '../common/Pagination';
import { ConfirmModal } from '../common/ConfirmModal';
import { exportStaffToExcel, generateTeachersTemplateExcel, generateStaffTemplateExcel } from '../../utils/excelUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SchoolLogo } from '../common/SchoolLogo';

export const StaffView: React.FC = () => {
  const {
    teachersStaff,
    teachingHours,
    classes,
    classesMap,
    teachersMap,
    staffSubTab,
    setStaffSubTab,
    updateTeacherStaff,
    deleteTeacherStaff,
    toggleTeacherStaffStatus,
    addTeachingHour,
    updateTeachingHour,
    deleteTeachingHour,
    setActiveMenu,
    setInputSubTab
  } = useSchool();

  // Search & Filter state for Staff
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'guru' | 'kepegawaian'>('all');
  const [employmentFilter, setEmploymentFilter] = useState<string>('all');
  const [statusKerjaFilter, setStatusKerjaFilter] = useState<string>('all');

  // Pagination for Staff
  const [staffCurrentPage, setStaffCurrentPage] = useState(1);
  const [staffPageSize, setStaffPageSize] = useState(10);

  // Search for Teaching Hours
  const [thSearchTerm, setThSearchTerm] = useState('');
  const [thTeacherFilter, setThTeacherFilter] = useState<string>('all');

  // Modals state
  const [editingStaff, setEditingStaff] = useState<TeacherStaff | null>(null);
  const [deleteStaffId, setDeleteStaffId] = useState<string | null>(null);
  const [editingTeachingHour, setEditingTeachingHour] = useState<TeachingHour | null>(null);
  const [isNewTeachingHourModalOpen, setIsNewTeachingHourModalOpen] = useState(false);
  const [deleteThId, setDeleteThId] = useState<string | null>(null);

  // New teaching hour form
  const [newThGuruId, setNewThGuruId] = useState(teachersStaff.find(t => t.kategori === 'guru')?.id || '');
  const [newThMapel, setNewThMapel] = useState('Tematik Terpadu');
  const [newThKelasId, setNewThKelasId] = useState(classes[0]?.id || '');
  const [newThJtm, setNewThJtm] = useState<number>(24);
  const [newThTugasTambahan, setNewThTugasTambahan] = useState('Wali Kelas');
  const [newThJamTugas, setNewThJamTugas] = useState<number>(2);

  // Notification Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Filtered staff
  const filteredStaff = useMemo(() => {
    return teachersStaff.filter(s => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        s.namaLengkap.toLowerCase().includes(q) ||
        s.nip.includes(q) ||
        (s.nuptk && s.nuptk.includes(q)) ||
        s.jabatan.toLowerCase().includes(q) ||
        s.noHp.includes(q);

      const matchCat = categoryFilter === 'all' || s.kategori === categoryFilter;
      const matchEmp = employmentFilter === 'all' || s.statusKepegawaian === employmentFilter;
      const matchWork = statusKerjaFilter === 'all' || s.statusKerja === statusKerjaFilter;

      return matchSearch && matchCat && matchEmp && matchWork;
    });
  }, [teachersStaff, searchTerm, categoryFilter, employmentFilter, statusKerjaFilter]);

  // Paginated staff
  const totalStaffPages = Math.ceil(filteredStaff.length / staffPageSize) || 1;
  const paginatedStaff = useMemo(() => {
    const start = (staffCurrentPage - 1) * staffPageSize;
    return filteredStaff.slice(start, start + staffPageSize);
  }, [filteredStaff, staffCurrentPage, staffPageSize]);

  // Filtered Teaching Hours
  const filteredTeachingHours = useMemo(() => {
    return teachingHours.filter(th => {
      const guru = teachersStaff.find(t => t.id === th.guruId);
      const guruName = guru ? guru.namaLengkap.toLowerCase() : '';
      const mapelName = th.mataPelajaran.toLowerCase();
      const q = thSearchTerm.toLowerCase();

      const matchSearch = guruName.includes(q) || mapelName.includes(q);
      const matchGuru = thTeacherFilter === 'all' || th.guruId === thTeacherFilter;

      return matchSearch && matchGuru;
    });
  }, [teachingHours, teachersStaff, thSearchTerm, thTeacherFilter]);

  // Handle Edit Staff save
  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    updateTeacherStaff(editingStaff.id, editingStaff);
    notify(`Data pegawai ${editingStaff.namaLengkap} berhasil diperbarui.`);
    setEditingStaff(null);
  };

  // Handle Add Teaching Hour
  const handleSaveNewTeachingHour = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThGuruId || !newThKelasId) return;

    addTeachingHour({
      guruId: newThGuruId,
      mataPelajaran: newThMapel,
      kelasId: newThKelasId,
      jamTatapMuka: Number(newThJtm),
      tugasTambahan: newThTugasTambahan || undefined,
      jamTugasTambahan: Number(newThJamTugas) || 0,
      tahunAjaran: '2026/2027',
      semester: 'Ganjil'
    });

    notify('Alokasi beban mengajar guru berhasil ditambahkan.');
    setIsNewTeachingHourModalOpen(false);
  };

  // PDF Export for Teaching Hours Schedule
  const handleExportTeachingHoursPdf = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Kop Surat
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('PEMERINTAH KABUPATEN BOGOR', pageWidth / 2, 14, { align: 'center' });
    doc.text('DINAS PENDIDIKAN', pageWidth / 2, 19, { align: 'center' });
    doc.setFontSize(13);
    doc.text('SD NEGERI NAMBO 03', pageWidth / 2, 25, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('SK PEMBAGIAN TUGAS MENGAJAR DAN BEBAN KERJA GURU TA 2026/2027', pageWidth / 2, 30, { align: 'center' });

    doc.setLineWidth(0.6);
    doc.line(14, 33, pageWidth - 14, 33);

    const rows = filteredTeachingHours.map((th, idx) => {
      const guru = teachersStaff.find(t => t.id === th.guruId);
      const total = th.jamTatapMuka + (th.jamTugasTambahan || 0);
      return [
        idx + 1,
        guru ? `${guru.namaLengkap}${guru.gelar ? ', ' + guru.gelar : ''}` : '-',
        guru?.statusKepegawaian || '-',
        th.mataPelajaran,
        classesMap.get(th.kelasId) || th.kelasId,
        `${th.jamTatapMuka} JP`,
        th.tugasTambahan ? `${th.tugasTambahan} (+${th.jamTugasTambahan} JP)` : '-',
        `${total} JP`,
        total >= 24 ? 'Memenuhi (>=24 JP)' : 'Kurang (<24 JP)'
      ];
    });

    autoTable(doc, {
      startY: 38,
      head: [['No', 'Nama Guru', 'Status', 'Mata Pelajaran', 'Kelas', 'JTM', 'Tugas Tambahan', 'Total', 'Keterangan']],
      body: rows,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [30, 58, 138], textColor: 255 }
    });

    doc.save('SK_Beban_Mengajar_Guru_SDN_Nambo_03.pdf');
    notify('Dokumen SK Beban Mengajar Guru berhasil dicetak ke PDF.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Header and Sub-Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <SchoolLogo size="lg" showBorder={true} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800">
                  Kepegawaian & Guru
                </span>
                <span className="text-xs text-slate-400">NPSN: 20200352</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Menu Kepegawaian & Guru
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Pusat data pendidik dan tenaga kependidikan (TU), status keaktifan kerja, dan pembagian jam mengajar mingguan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveMenu('input-data');
                setInputSubTab(staffSubTab === 'data-pegawai' ? 'guru' : 'kepegawaian');
              }}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Pegawai</span>
            </button>
          </div>
        </div>

        {/* 2 Sub-tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStaffSubTab('data-pegawai')}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition-colors flex items-center gap-2 ${
              staffSubTab === 'data-pegawai'
                ? 'bg-blue-900 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. Data Kepegawaian & Guru ({teachersStaff.length})</span>
          </button>

          <button
            onClick={() => setStaffSubTab('jam-mengajar')}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition-colors flex items-center gap-2 ${
              staffSubTab === 'jam-mengajar'
                ? 'bg-blue-900 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>2. Data Jam Mengajar ({teachingHours.length} Alokasi)</span>
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* SUBTAB 1: DATA KEPEGAWAIAN & GURU */}
      {/* --------------------------------------------------------------------- */}
      {staffSubTab === 'data-pegawai' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs space-y-4">
          {/* Filters Bar */}
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari Guru atau Pegawai berdasarkan Nama, NIP, Jabatan, HP..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setStaffCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {/* Kategori */}
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value as any); setStaffCurrentPage(1); }}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700"
              >
                <option value="all">Semua Kategori</option>
                <option value="guru">Guru Saja</option>
                <option value="kepegawaian">Tenaga TU / Staf</option>
              </select>

              {/* Status Kepegawaian */}
              <select
                value={employmentFilter}
                onChange={(e) => { setEmploymentFilter(e.target.value); setStaffCurrentPage(1); }}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700"
              >
                <option value="all">Semua Status</option>
                <option value="PNS">PNS</option>
                <option value="PPPK">PPPK</option>
                <option value="Honorer">Honorer</option>
                <option value="PTT">PTT</option>
              </select>

              {/* Status Kerja */}
              <select
                value={statusKerjaFilter}
                onChange={(e) => { setStatusKerjaFilter(e.target.value); setStaffCurrentPage(1); }}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700"
              >
                <option value="all">Semua Keaktifan</option>
                <option value="aktif">Aktif Bekerja</option>
                <option value="cuti">Cuti</option>
                <option value="non_aktif">Non-Aktif</option>
                <option value="pensiun">Pensiun</option>
              </select>

              {/* Export */}
              <button
                onClick={() => {
                  exportStaffToExcel(filteredStaff);
                  notify(`Data ${filteredStaff.length} pegawai berhasil diekspor.`);
                }}
                className="px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Nama Lengkap & Gelar</th>
                  <th className="py-3 px-3">NIP / NUPTK</th>
                  <th className="py-3 px-3 text-center">L/P</th>
                  <th className="py-3 px-3">Kategori & Jabatan</th>
                  <th className="py-3 px-3">Status Pegawai</th>
                  <th className="py-3 px-3">Kontak / No HP</th>
                  <th className="py-3 px-3">Status Keaktifan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedStaff.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Tidak ditemukan pegawai yang cocok dengan kata kunci atau filter.
                    </td>
                  </tr>
                ) : (
                  paginatedStaff.map(staff => (
                    <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {staff.namaLengkap}{staff.gelar ? ', ' + staff.gelar : ''}
                        </div>
                        <div className="text-[11px] text-slate-400">{staff.pendidikanTerakhir}</div>
                      </td>

                      <td className="py-3 px-3 font-mono">
                        <div className="text-slate-800">{staff.nip}</div>
                        {staff.nuptk && (
                          <div className="text-[10px] text-slate-400">NUPTK: {staff.nuptk}</div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center font-semibold">
                        <span className={staff.jenisKelamin === 'L' ? 'text-blue-700' : 'text-pink-600'}>
                          {staff.jenisKelamin}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-900">{staff.jabatan}</div>
                        <div className="text-[11px] text-slate-500 capitalize">{staff.kategori}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          staff.statusKepegawaian === 'PNS'
                            ? 'bg-blue-100 text-blue-800'
                            : staff.statusKepegawaian === 'PPPK'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {staff.statusKepegawaian}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-mono text-slate-700">{staff.noHp}</div>
                        {staff.email && <div className="text-[10px] text-slate-400 truncate max-w-[130px]">{staff.email}</div>}
                      </td>

                      {/* Toggle Aktif / Non-Aktif button */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => {
                            toggleTeacherStaffStatus(staff.id);
                            notify(`Status keaktifan ${staff.namaLengkap} diubah.`);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                            staff.statusKerja === 'aktif'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          {staff.statusKerja === 'aktif' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span className="capitalize">{staff.statusKerja.replace('_', ' ')}</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingStaff({ ...staff })}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit Data Pegawai"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteStaffId(staff.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Hapus Pegawai"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={staffCurrentPage}
            totalPages={totalStaffPages}
            totalItems={filteredStaff.length}
            pageSize={staffPageSize}
            onPageChange={setStaffCurrentPage}
            onPageSizeChange={setStaffPageSize}
          />
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* SUBTAB 2: DATA JAM MENGAJAR */}
      {/* --------------------------------------------------------------------- */}
      {staffSubTab === 'jam-mengajar' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs space-y-4">
          {/* Header Action Bar */}
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama guru atau mata pelajaran..."
                  value={thSearchTerm}
                  onChange={(e) => setThSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <select
                value={thTeacherFilter}
                onChange={(e) => setThTeacherFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700"
              >
                <option value="all">Semua Guru</option>
                {teachersStaff.filter(t => t.kategori === 'guru').map(g => (
                  <option key={g.id} value={g.id}>{g.namaLengkap}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportTeachingHoursPdf}
                className="px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Cetak SK Beban Mengajar (PDF)</span>
              </button>

              <button
                onClick={() => setIsNewTeachingHourModalOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Alokasi Jam</span>
              </button>
            </div>
          </div>

          {/* Info Card on Sertifikasi */}
          <div className="mx-4 p-3.5 bg-blue-50 border border-blue-200/80 rounded-xl flex items-center justify-between text-xs text-blue-900">
            <div>
              <strong>Ketentuan Beban Kerja Guru (Juknis Kemendikbud):</strong> Guru wajib memenuhi beban kerja minimal <strong>24 Jam Tatap Muka (JTM)</strong> dan maksimal 40 JP per minggu untuk kelayakan Tunjangan Profesi Guru (TPG/Sertifikasi).
            </div>
          </div>

          {/* Teaching Hours Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Nama Guru</th>
                  <th className="py-3 px-3">Mata Pelajaran</th>
                  <th className="py-3 px-3">Kelas Diajar</th>
                  <th className="py-3 px-3 text-center">JTM / Minggu</th>
                  <th className="py-3 px-3">Tugas Tambahan</th>
                  <th className="py-3 px-3 text-center font-bold">Total Jam (JTM + Tugas)</th>
                  <th className="py-3 px-3 text-center">Kelayakan Sertifikasi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachingHours.map(th => {
                  const guru = teachersStaff.find(t => t.id === th.guruId);
                  const total = th.jamTatapMuka + (th.jamTugasTambahan || 0);
                  const isEligible = total >= 24;

                  return (
                    <tr key={th.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {guru ? `${guru.namaLengkap}${guru.gelar ? ', ' + guru.gelar : ''}` : '-'}
                        </div>
                        <div className="text-[11px] text-slate-400">{guru?.statusKepegawaian}</div>
                      </td>

                      <td className="py-3 px-3 font-medium text-slate-800">
                        {th.mataPelajaran}
                      </td>

                      <td className="py-3 px-3 font-medium text-blue-700">
                        {classesMap.get(th.kelasId) || th.kelasId}
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-semibold tabular-nums">
                        {th.jamTatapMuka} JP
                      </td>

                      <td className="py-3 px-3">
                        {th.tugasTambahan ? (
                          <div className="text-slate-700">
                            <span>{th.tugasTambahan}</span>
                            <span className="font-mono text-purple-700 font-semibold ml-1">
                              (+{th.jamTugasTambahan || 0} JP)
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-sm tabular-nums text-slate-900">
                        {total} JP
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          isEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isEligible ? 'Memenuhi' : 'Kurang (<24 JP)'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setDeleteThId(th.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Alokasi Jam"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: EDIT DATA PEGAWAI */}
      {/* --------------------------------------------------------------------- */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-sm font-bold text-slate-900">
                Edit Pegawai: {editingStaff.namaLengkap}
              </h3>
              <button onClick={() => setEditingStaff(null)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={editingStaff.namaLengkap}
                    onChange={(e) => setEditingStaff({ ...editingStaff, namaLengkap: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gelar</label>
                  <input
                    type="text"
                    value={editingStaff.gelar || ''}
                    onChange={(e) => setEditingStaff({ ...editingStaff, gelar: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP</label>
                  <input
                    type="text"
                    value={editingStaff.nip}
                    onChange={(e) => setEditingStaff({ ...editingStaff, nip: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jabatan</label>
                  <input
                    type="text"
                    value={editingStaff.jabatan}
                    onChange={(e) => setEditingStaff({ ...editingStaff, jabatan: e.target.value as StaffRole })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Kepegawaian</label>
                  <select
                    value={editingStaff.statusKepegawaian}
                    onChange={(e) => setEditingStaff({ ...editingStaff, statusKepegawaian: e.target.value as EmploymentStatus })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="PNS">PNS</option>
                    <option value="PPPK">PPPK</option>
                    <option value="Honorer">Honorer</option>
                    <option value="PTT">PTT</option>
                    <option value="GTT">GTT</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No HP</label>
                  <input
                    type="text"
                    value={editingStaff.noHp}
                    onChange={(e) => setEditingStaff({ ...editingStaff, noHp: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 border rounded-xl text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 text-white font-semibold rounded-xl"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: TAMBAH ALOKASI JAM MENGAJAR */}
      {/* --------------------------------------------------------------------- */}
      {isNewTeachingHourModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Tambah Alokasi Jam Mengajar Guru</h3>
            <form onSubmit={handleSaveNewTeachingHour} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Guru *</label>
                <select
                  value={newThGuruId}
                  onChange={(e) => setNewThGuruId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                >
                  {teachersStaff.filter(t => t.kategori === 'guru').map(g => (
                    <option key={g.id} value={g.id}>
                      {g.namaLengkap} ({g.jabatan})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran *</label>
                <input
                  type="text"
                  required
                  value={newThMapel}
                  onChange={(e) => setNewThMapel(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kelas yang Diajar *</label>
                <select
                  value={newThKelasId}
                  onChange={(e) => setNewThKelasId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.nama}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">JTM Mingguan (JP)</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={newThJtm}
                    onChange={(e) => setNewThJtm(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ekuivalen Tugas (JP)</label>
                  <input
                    type="number"
                    min={0}
                    max={12}
                    value={newThJamTugas}
                    onChange={(e) => setNewThJamTugas(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tugas Tambahan</label>
                <input
                  type="text"
                  placeholder="Contoh: Wali Kelas 3A (+2 JP)"
                  value={newThTugasTambahan}
                  onChange={(e) => setNewThTugasTambahan(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewTeachingHourModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 text-white font-semibold rounded-xl"
                >
                  Simpan Beban Mengajar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Staff Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteStaffId)}
        title="Hapus Data Pegawai"
        message="Apakah Anda yakin ingin menghapus data guru/pegawai ini? Jika guru bertindak sebagai wali kelas, status wali kelas akan menjadi kosong."
        confirmLabel="Hapus Pegawai"
        isDestructive={true}
        onConfirm={() => {
          if (deleteStaffId) {
            deleteTeacherStaff(deleteStaffId);
            notify('Data pegawai berhasil dihapus.');
            setDeleteStaffId(null);
          }
        }}
        onCancel={() => setDeleteStaffId(null)}
      />

      {/* Delete Teaching Hour Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deleteThId)}
        title="Hapus Alokasi Jam Mengajar"
        message="Hapus alokasi jadwal dan beban mengajar ini dari daftar guru?"
        confirmLabel="Hapus Jam"
        isDestructive={true}
        onConfirm={() => {
          if (deleteThId) {
            deleteTeachingHour(deleteThId);
            notify('Alokasi jam mengajar berhasil dihapus.');
            setDeleteThId(null);
          }
        }}
        onCancel={() => setDeleteThId(null)}
      />
    </div>
  );
};
