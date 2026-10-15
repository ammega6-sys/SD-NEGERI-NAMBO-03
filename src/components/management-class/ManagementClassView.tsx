import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckSquare,
  Square,
  Edit,
  Trash2,
  ArrowRightLeft,
  UserX,
  CreditCard,
  FileSpreadsheet,
  FileText,
  UserCheck,
  ChevronDown,
  Layers,
  Award,
  MoreVertical,
  CheckCircle2,
  Calendar,
  School,
  X,
  UserPlus
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { Student, StudentStatus, Religion, Gender, ClassRoom } from '../../types';
import { Pagination } from '../common/Pagination';
import { ConfirmModal } from '../common/ConfirmModal';
import { exportStudentsToExcel } from '../../utils/excelUtils';
import { generateStudentsPdfReport } from '../../utils/pdfUtils';
import { SchoolLogo } from '../common/SchoolLogo';

export const ManagementClassView: React.FC = () => {
  const {
    students,
    classes,
    extracurriculars,
    teachersStaff,
    classesMap,
    teachersMap,
    ekskulMap,
    managementSubTab,
    setManagementSubTab,
    updateStudent,
    deleteStudent,
    batchDeleteStudents,
    batchMoveClass,
    batchSetPip,
    batchMutasiKeluar,
    updateStudentStatus,
    toggleStudentPip,
    setStudentEkskul,
    setWaliKelas,
    setPembinaEkskul,
    updateClass
  } = useSchool();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<string>('all');
  const [selectedReligionFilter, setSelectedReligionFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Checkbox selection state
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Modals state
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [singleDeleteStudentId, setSingleDeleteStudentId] = useState<string | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [moveClassModalStudent, setMoveClassModalStudent] = useState<Student | null>(null);
  const [isBulkMoveClassModalOpen, setIsBulkMoveClassModalOpen] = useState(false);
  const [targetMoveClassId, setTargetMoveClassId] = useState<string>(classes[0]?.id || '');

  // Mutasi Keluar & DO modals
  const [mutasiModalStudent, setMutasiModalStudent] = useState<Student | null>(null);
  const [doModalStudent, setDoModalStudent] = useState<Student | null>(null);
  const [mutasiTujuan, setMutasiTujuan] = useState('');
  const [mutasiTanggal, setMutasiTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [mutasiAlasan, setMutasiAlasan] = useState('Pindah domisili orang tua');
  const [doTanggal, setDoTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [doAlasan, setDoAlasan] = useState('');

  // Manage Ekskul Modal
  const [managingEkskulStudent, setManagingEkskulStudent] = useState<Student | null>(null);

  // Edit Class Modal
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter students by active subtab
  const baseStudentsByTab = useMemo(() => {
    if (managementSubTab === 'aktif') {
      return students.filter(s => s.status === 'aktif' || s.status === 'pindahan_masuk');
    }
    if (managementSubTab === 'non-aktif') {
      return students.filter(s => s.status === 'mutasi_keluar' || s.status === 'berhenti_do' || s.status === 'lulus');
    }
    if (managementSubTab === 'pip') {
      return students.filter(s => s.isPip);
    }
    return students;
  }, [students, managementSubTab]);

  // Apply search and dropdown filters
  const filteredStudents = useMemo(() => {
    return baseStudentsByTab.filter(s => {
      // Search
      const searchLower = searchTerm.toLowerCase();
      const matchSearch =
        s.namaLengkap.toLowerCase().includes(searchLower) ||
        s.nisn.includes(searchLower) ||
        s.nis.includes(searchLower) ||
        s.nik.includes(searchLower) ||
        s.alamat.toLowerCase().includes(searchLower);

      // Class
      const matchClass = selectedClassFilter === 'all' || s.kelasId === selectedClassFilter;

      // Gender
      const matchGender = selectedGenderFilter === 'all' || s.jenisKelamin === selectedGenderFilter;

      // Religion
      const matchReligion = selectedReligionFilter === 'all' || s.agama === selectedReligionFilter;

      return matchSearch && matchClass && matchGender && matchReligion;
    });
  }, [baseStudentsByTab, searchTerm, selectedClassFilter, selectedGenderFilter, selectedReligionFilter]);

  // Paginated students
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Reset page on filter changes
  const handleFilterChange = (setter: (v: string) => void, val: string) => {
    setter(val);
    setCurrentPage(1);
    setSelectedStudentIds([]);
  };

  // Checkbox handlers
  const handleSelectAllOnPage = (checked: boolean) => {
    if (checked) {
      const pageIds = paginatedStudents.map(s => s.id);
      setSelectedStudentIds(prev => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = new Set(paginatedStudents.map(s => s.id));
      setSelectedStudentIds(prev => prev.filter(id => !pageIds.has(id)));
    }
  };

  const handleToggleStudent = (id: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const isAllPageSelected =
    paginatedStudents.length > 0 &&
    paginatedStudents.every(s => selectedStudentIds.includes(s.id));

  // --------------------------------------------------------------------------
  // ACTIONS
  // --------------------------------------------------------------------------
  const handleSaveStudentEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    updateStudent(editingStudent.id, editingStudent);
    notify(`Data siswa ${editingStudent.namaLengkap} berhasil diperbarui.`);
    setEditingStudent(null);
  };

  const handleConfirmSingleDelete = () => {
    if (singleDeleteStudentId) {
      deleteStudent(singleDeleteStudentId);
      notify('Data siswa berhasil dihapus dari sistem.');
      setSingleDeleteStudentId(null);
      setSelectedStudentIds(prev => prev.filter(id => id !== singleDeleteStudentId));
    }
  };

  const handleConfirmBulkDelete = () => {
    batchDeleteStudents(selectedStudentIds);
    notify(`${selectedStudentIds.length} siswa berhasil dihapus secara masal.`);
    setSelectedStudentIds([]);
    setIsBulkDeleteModalOpen(false);
  };

  const handleExecuteBulkMoveClass = () => {
    batchMoveClass(selectedStudentIds, targetMoveClassId);
    notify(`${selectedStudentIds.length} siswa berhasil dipindahkan ke ${classesMap.get(targetMoveClassId)}.`);
    setSelectedStudentIds([]);
    setIsBulkMoveClassModalOpen(false);
  };

  const handleConfirmMutasi = () => {
    if (!mutasiModalStudent) return;
    updateStudentStatus(mutasiModalStudent.id, 'mutasi_keluar', {
      tanggalKeluar: mutasiTanggal,
      tujuanMutasi: mutasiTujuan,
      alasanKeluar: mutasiAlasan
    });
    notify(`Status siswa ${mutasiModalStudent.namaLengkap} diubah menjadi Mutasi Keluar.`);
    setMutasiModalStudent(null);
  };

  const handleConfirmDo = () => {
    if (!doModalStudent) return;
    updateStudentStatus(doModalStudent.id, 'berhenti_do', {
      tanggalKeluar: doTanggal,
      alasanKeluar: doAlasan
    });
    notify(`Status siswa ${doModalStudent.namaLengkap} diubah menjadi Berhenti / DO.`);
    setDoModalStudent(null);
  };

  // --------------------------------------------------------------------------
  // TAB LAPORAN STATE
  // --------------------------------------------------------------------------
  const [reportBulan, setReportBulan] = useState<string>('2026-08');
  const [reportFilterStatuses, setReportFilterStatuses] = useState<StudentStatus[]>([
    'aktif',
    'pindahan_masuk'
  ]);
  const [reportFilterPipOnly, setReportFilterPipOnly] = useState<boolean>(false);
  const [reportSelectedClasses, setReportSelectedClasses] = useState<string[]>(classes.map(c => c.id));
  const [reportTitle, setReportTitle] = useState('Laporan Rekapitulasi Peserta Didik');

  const reportFilteredData = useMemo(() => {
    return students.filter(s => {
      const matchStatus = reportFilterStatuses.includes(s.status);
      const matchPip = !reportFilterPipOnly || s.isPip;
      const matchClass = reportSelectedClasses.includes(s.kelasId);
      return matchStatus && matchPip && matchClass;
    });
  }, [students, reportFilterStatuses, reportFilterPipOnly, reportSelectedClasses]);

  const handleExportReportExcel = () => {
    exportStudentsToExcel(reportFilteredData, classesMap, reportTitle.replace(/\s+/g, '_'));
    notify(`Laporan Excel berhasil diunduh (${reportFilteredData.length} siswa).`);
  };

  const handleExportReportPdf = () => {
    generateStudentsPdfReport({
      title: reportTitle,
      subtitle: `Laporan Resmi Dapodik SD Negeri Nambo 03`,
      period: `Bulan ${reportBulan}`,
      classesMap,
      students: reportFilteredData
    });
    notify(`Laporan PDF berhasil dicetak (${reportFilteredData.length} siswa).`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Main Header Card with 7 Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="pb-4 mb-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <SchoolLogo size="lg" showBorder={true} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  Manajemen Rombel & Siswa
                </span>
                <span className="text-xs text-slate-400">NPSN: 20200352</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Menu Manajemen Kelas & Siswa
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Integrasi penuh data siswa terdaftar, aksi mutasi/DO, penerima bantuan PIP, rekap agama, ekskul, dan cetak laporan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                exportStudentsToExcel(filteredStudents, classesMap, `Data_Siswa_${managementSubTab}`);
                notify(`Berhasil mengekspor data ${filteredStudents.length} siswa.`);
              }}
              className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={() => {
                generateStudentsPdfReport({
                  title: `Rekapitulasi Siswa ${managementSubTab.toUpperCase()}`,
                  classesMap,
                  students: filteredStudents
                });
                notify(`Berhasil membuat berkas PDF.`);
              }}
              className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>Cetak PDF</span>
            </button>
          </div>
        </div>

        {/* 7 Sub-tabs bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => { setManagementSubTab('aktif'); setSelectedStudentIds([]); setCurrentPage(1); }}
            className={`px-3.5 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              managementSubTab === 'aktif'
                ? 'bg-blue-900 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Siswa Aktif ({students.filter(s => s.status === 'aktif' || s.status === 'pindahan_masuk').length})</span>
          </button>

          <button
            onClick={() => { setManagementSubTab('non-aktif'); setSelectedStudentIds([]); setCurrentPage(1); }}
            className={`px-3.5 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              managementSubTab === 'non-aktif'
                ? 'bg-blue-900 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserX className="w-4 h-4 text-rose-400" />
            <span>Siswa Non-Aktif (DO/Mutasi)</span>
          </button>

          <button
            onClick={() => { setManagementSubTab('pip'); setSelectedStudentIds([]); setCurrentPage(1); }}
            className={`px-3.5 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              managementSubTab === 'pip'
                ? 'bg-blue-900 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4 text-amber-400" />
            <span>Siswa PIP ({students.filter(s => s.isPip).length})</span>
          </button>

          <button
            onClick={() => setManagementSubTab('agama')}
            className={`px-3.5 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              managementSubTab === 'agama'
                ? 'bg-blue-900 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Tab Agama</span>
          </button>

          <button
            onClick={() => setManagementSubTab('ekskul')}
            className={`px-3.5 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              managementSubTab === 'ekskul'
                ? 'bg-blue-900 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4 text-purple-400" />
            <span>Ekstrakurikuler</span>
          </button>

          <button
            onClick={() => setManagementSubTab('wali-kelas')}
            className={`px-3.5 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              managementSubTab === 'wali-kelas'
                ? 'bg-blue-900 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <School className="w-4 h-4" />
            <span>Wali Kelas & Rombel</span>
          </button>

          <button
            onClick={() => setManagementSubTab('laporan')}
            className={`px-3.5 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              managementSubTab === 'laporan'
                ? 'bg-blue-900 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Tab Laporan (PDF/Excel)</span>
          </button>
        </div>
      </div>

      {/* VIEW: TAB SISWA AKTIF, NON-AKTIF, & PIP */}
      {(managementSubTab === 'aktif' || managementSubTab === 'non-aktif' || managementSubTab === 'pip') && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
          {/* Filters Bar */}
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari berdasarkan Nama, NISN, NIS, NIK, atau Alamat..."
                value={searchTerm}
                onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {/* Kelas */}
              <select
                value={selectedClassFilter}
                onChange={(e) => handleFilterChange(setSelectedClassFilter, e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="all">Semua Kelas</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.nama}</option>
                ))}
              </select>

              {/* Gender */}
              <select
                value={selectedGenderFilter}
                onChange={(e) => handleFilterChange(setSelectedGenderFilter, e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="all">Semua Gender</option>
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>

              {/* Agama */}
              <select
                value={selectedReligionFilter}
                onChange={(e) => handleFilterChange(setSelectedReligionFilter, e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="all">Semua Agama</option>
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Khonghucu">Khonghucu</option>
              </select>
            </div>
          </div>

          {/* Bulk Selection Floating Action Bar */}
          {selectedStudentIds.length > 0 && (
            <div className="px-5 py-3 bg-blue-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-amber-300" />
                <span className="font-semibold tabular-nums">{selectedStudentIds.length} Siswa Terpilih</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Pindah Kelas Masal */}
                <button
                  onClick={() => setIsBulkMoveClassModalOpen(true)}
                  className="px-3 py-1.5 bg-blue-800 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Pindahkan Kelas</span>
                </button>

                {/* Set PIP Masal */}
                <button
                  onClick={() => {
                    batchSetPip(selectedStudentIds, true);
                    notify(`${selectedStudentIds.length} siswa diaktifkan status penerima PIP.`);
                    setSelectedStudentIds([]);
                  }}
                  className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Aktifkan PIP</span>
                </button>

                {/* Hapus Masal */}
                <button
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Terpilih</span>
                </button>

                <button
                  onClick={() => setSelectedStudentIds([])}
                  className="px-2 py-1 text-slate-300 hover:text-white"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllPageSelected}
                      onChange={(e) => handleSelectAllOnPage(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      title="Centang Semua di Halaman"
                    />
                  </th>
                  <th className="py-3 px-3">NISN / NIS</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-3 text-center">L/P</th>
                  <th className="py-3 px-3">Kelas</th>
                  <th className="py-3 px-3">Agama</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Bantuan PIP</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      Tidak ada data siswa yang sesuai dengan filter atau kata kunci pencarian.
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map(student => {
                    const isSelected = selectedStudentIds.includes(student.id);
                    return (
                      <tr
                        key={student.id}
                        className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}
                      >
                        {/* Checkbox 1 per 1 */}
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleStudent(student.id)}
                            className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>

                        {/* NISN / NIS */}
                        <td className="py-3 px-3 font-mono">
                          <div className="font-semibold text-slate-900">{student.nisn}</div>
                          <div className="text-slate-400 text-[11px]">{student.nis}</div>
                        </td>

                        {/* Nama Siswa */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{student.namaLengkap}</div>
                          <div className="text-slate-500 text-[11px] truncate max-w-xs">{student.alamat}</div>
                        </td>

                        {/* Gender */}
                        <td className="py-3 px-3 text-center">
                          <span className={`font-semibold ${student.jenisKelamin === 'L' ? 'text-blue-700' : 'text-pink-600'}`}>
                            {student.jenisKelamin}
                          </span>
                        </td>

                        {/* Kelas */}
                        <td className="py-3 px-3 font-medium text-slate-800">
                          {classesMap.get(student.kelasId) || student.kelasId}
                        </td>

                        {/* Agama */}
                        <td className="py-3 px-3 text-slate-600">
                          {student.agama}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          {student.status === 'aktif' && !student.isPindahan && (
                            <span className="text-emerald-700 font-medium text-xs">Aktif</span>
                          )}
                          {(student.status === 'pindahan_masuk' || student.isPindahan) && (
                            <div>
                              <span className="text-blue-700 font-medium text-xs">Pindahan Masuk</span>
                              {student.asalSekolah && (
                                <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                                  {student.asalSekolah}
                                </div>
                              )}
                            </div>
                          )}
                          {student.status === 'mutasi_keluar' && (
                            <div>
                              <span className="text-amber-700 font-medium text-xs">Mutasi Keluar</span>
                              {student.tujuanMutasi && (
                                <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                                  Ke: {student.tujuanMutasi}
                                </div>
                              )}
                            </div>
                          )}
                          {student.status === 'berhenti_do' && (
                            <div>
                              <span className="text-rose-700 font-medium text-xs">Berhenti / DO</span>
                              {student.alasanKeluar && (
                                <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                                  {student.alasanKeluar}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* PIP Toggle & Info */}
                        <td className="py-3 px-3">
                          <button
                            onClick={() => {
                              toggleStudentPip(student.id, !student.isPip);
                              notify(`Status PIP ${student.namaLengkap} diubah menjadi ${!student.isPip ? 'Aktif' : 'Non-Aktif'}`);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
                              student.isPip
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>{student.isPip ? 'Penerima PIP' : 'Bukan PIP'}</span>
                          </button>
                        </td>

                        {/* Actions per row */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Edit */}
                            <button
                              onClick={() => setEditingStudent({ ...student })}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Data Siswa"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Pindah Kelas */}
                            <button
                              onClick={() => setMoveClassModalStudent(student)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Pindahkan Kelas"
                            >
                              <ArrowRightLeft className="w-4 h-4" />
                            </button>

                            {/* Mutasi Keluar */}
                            <button
                              onClick={() => {
                                setMutasiModalStudent(student);
                                setMutasiTujuan(student.tujuanMutasi || '');
                              }}
                              className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Mutasi Keluar"
                            >
                              <UserX className="w-4 h-4" />
                            </button>

                            {/* Berhenti DO */}
                            <button
                              onClick={() => {
                                setDoModalStudent(student);
                                setDoAlasan(student.alasanKeluar || '');
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Tandai Berhenti / DO"
                            >
                              <UserX className="w-4 h-4" />
                            </button>

                            {/* Kelola Ekskul */}
                            <button
                              onClick={() => setManagingEkskulStudent(student)}
                              className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Kelola Ekstrakurikuler"
                            >
                              <Award className="w-4 h-4" />
                            </button>

                            {/* Hapus */}
                            <button
                              onClick={() => setSingleDeleteStudentId(student.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Siswa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredStudents.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* VIEW: TAB AGAMA */}
      {managementSubTab === 'agama' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Rekapitulasi Siswa Berdasarkan Agama</h2>
            <p className="text-xs text-slate-500">
              Distribusi data agama peserta didik per rombel untuk alokasi pengajar Pendidikan Agama & Budi Pekerti
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Nama Kelas</th>
                  <th className="py-3 px-3 text-center">Islam</th>
                  <th className="py-3 px-3 text-center">Kristen</th>
                  <th className="py-3 px-3 text-center">Katolik</th>
                  <th className="py-3 px-3 text-center">Hindu</th>
                  <th className="py-3 px-3 text-center">Buddha</th>
                  <th className="py-3 px-3 text-center">Khonghucu</th>
                  <th className="py-3 px-4 text-center font-bold">Total Siswa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classes.map(c => {
                  const classStudents = students.filter(s => s.kelasId === c.id);
                  const is = classStudents.filter(s => s.agama === 'Islam').length;
                  const kr = classStudents.filter(s => s.agama === 'Kristen').length;
                  const ka = classStudents.filter(s => s.agama === 'Katolik').length;
                  const hi = classStudents.filter(s => s.agama === 'Hindu').length;
                  const bu = classStudents.filter(s => s.agama === 'Buddha').length;
                  const kh = classStudents.filter(s => s.agama === 'Khonghucu').length;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">{c.nama}</td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums">{is}</td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums">{kr}</td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums">{ka}</td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums">{hi}</td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums">{bu}</td>
                      <td className="py-3 px-3 text-center font-mono tabular-nums">{kh}</td>
                      <td className="py-3 px-4 text-center font-bold font-mono tabular-nums text-blue-700 bg-blue-50/40">
                        {classStudents.length}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                  <td className="py-3 px-4">TOTAL SEKOLAH</td>
                  <td className="py-3 px-3 text-center font-mono tabular-nums">{students.filter(s => s.agama === 'Islam').length}</td>
                  <td className="py-3 px-3 text-center font-mono tabular-nums">{students.filter(s => s.agama === 'Kristen').length}</td>
                  <td className="py-3 px-3 text-center font-mono tabular-nums">{students.filter(s => s.agama === 'Katolik').length}</td>
                  <td className="py-3 px-3 text-center font-mono tabular-nums">{students.filter(s => s.agama === 'Hindu').length}</td>
                  <td className="py-3 px-3 text-center font-mono tabular-nums">{students.filter(s => s.agama === 'Buddha').length}</td>
                  <td className="py-3 px-3 text-center font-mono tabular-nums">{students.filter(s => s.agama === 'Khonghucu').length}</td>
                  <td className="py-3 px-4 text-center font-mono tabular-nums text-blue-900 font-extrabold">{students.length}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: TAB EKSTRAKURIKULER */}
      {managementSubTab === 'ekskul' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Manajemen Ekstrakurikuler Sekolah</h2>
              <p className="text-xs text-slate-500">
                Kelola pembina ekstrakurikuler (dari data guru) dan distribusi keanggotaan siswa
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {extracurriculars.map(ekskul => {
              const pembina = teachersStaff.find(t => t.id === ekskul.pembinaGuruId);
              const members = students.filter(s => s.ekskulIds?.includes(ekskul.id));

              return (
                <div key={ekskul.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{ekskul.nama}</h3>
                      <p className="text-xs text-slate-500">{ekskul.kategori} · {ekskul.kode}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                      {members.length} / {ekskul.kuota}
                    </span>
                  </div>

                  <div className="text-xs space-y-1.5 text-slate-600">
                    <div>
                      <span className="text-slate-400">Pembina:</span>{' '}
                      <strong className="text-slate-800">
                        {pembina ? `${pembina.namaLengkap}${pembina.gelar ? ', ' + pembina.gelar : ''}` : 'Belum Ditugaskan'}
                      </strong>
                    </div>
                    <div><span className="text-slate-400">Jadwal:</span> {ekskul.jadwalHari}</div>
                    <div><span className="text-slate-400">Lokasi:</span> {ekskul.tempat}</div>
                  </div>

                  {/* Assign Pembina select */}
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Ubah Pembina (Diambil dari Guru):
                    </label>
                    <select
                      value={ekskul.pembinaGuruId || ''}
                      onChange={(e) => {
                        setPembinaEkskul(ekskul.id, e.target.value);
                        notify(`Pembina ${ekskul.nama} berhasil diperbarui.`);
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    >
                      <option value="">-- Pilih Guru Pembina --</option>
                      {teachersStaff.filter(t => t.kategori === 'guru').map(g => (
                        <option key={g.id} value={g.id}>
                          {g.namaLengkap} ({g.jabatan})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: TAB PENGATURAN WALI KELAS */}
      {managementSubTab === 'wali-kelas' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Penetapan Wali Kelas & Rombongan Belajar</h2>
            <p className="text-xs text-slate-500">
              Data guru wali kelas diambil langsung dari data yang diinput pada Tab Input Guru
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Kode & Nama Rombel</th>
                  <th className="py-3 px-3">Tingkat / Fase</th>
                  <th className="py-3 px-3">Ruang Kelas</th>
                  <th className="py-3 px-3">Kuota</th>
                  <th className="py-3 px-3 text-center">Siswa Riil</th>
                  <th className="py-3 px-4">Wali Kelas Terpilih (Data Guru)</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classes.map(c => {
                  const currentCount = students.filter(s => s.kelasId === c.id && s.status !== 'mutasi_keluar' && s.status !== 'berhenti_do').length;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {c.nama} <span className="font-mono text-slate-400 font-normal">({c.kode})</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        Tingkat {c.tingkat} · {c.fase}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{c.ruang}</td>
                      <td className="py-3 px-3 font-mono tabular-nums text-slate-700">{c.kuota} anak</td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                          {currentCount} anak
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={c.waliKelasGuruId || ''}
                          onChange={(e) => {
                            setWaliKelas(c.id, e.target.value);
                            notify(`Wali kelas ${c.nama} berhasil ditetapkan.`);
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                        >
                          <option value="">-- Wali Kelas Kosong --</option>
                          {teachersStaff.filter(t => t.kategori === 'guru').map(g => (
                            <option key={g.id} value={g.id}>
                              {g.namaLengkap}{g.gelar ? ', ' + g.gelar : ''} ({g.statusKepegawaian})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setEditingClass(c)}
                          className="px-2.5 py-1 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          Ubah
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

      {/* VIEW: TAB LAPORAN TERPADU */}
      {managementSubTab === 'laporan' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Laporan Fleksibel Peserta Didik</h2>
              <p className="text-xs text-slate-500">
                Pilih filter gabungan, periode bulan, status siswa, atau kelas tertentu untuk diunduh ke PDF & Excel
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportReportExcel}
                className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors flex items-center gap-2 shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download Excel (.xlsx)</span>
              </button>
              <button
                onClick={handleExportReportPdf}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-colors flex items-center gap-2 shadow-xs"
              >
                <FileText className="w-4 h-4" />
                <span>Download PDF Resmi</span>
              </button>
            </div>
          </div>

          {/* Flexible Filter Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            {/* 1. Periode & Judul */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-800">1. Parameter & Periode</div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Judul Laporan</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Periode Bulan</label>
                <input
                  type="month"
                  value={reportBulan}
                  onChange={(e) => setReportBulan(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>
            </div>

            {/* 2. Status Siswa (Multiple checkboxes) */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-800">2. Kategori Status Siswa (Multi-pilihan)</div>
              <div className="space-y-1.5 text-xs text-slate-700 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reportFilterStatuses.includes('aktif')}
                    onChange={(e) => {
                      if (e.target.checked) setReportFilterStatuses(p => [...p, 'aktif']);
                      else setReportFilterStatuses(p => p.filter(x => x !== 'aktif'));
                    }}
                    className="rounded text-blue-600"
                  />
                  <span>Siswa Aktif Reguler</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reportFilterStatuses.includes('pindahan_masuk')}
                    onChange={(e) => {
                      if (e.target.checked) setReportFilterStatuses(p => [...p, 'pindahan_masuk']);
                      else setReportFilterStatuses(p => p.filter(x => x !== 'pindahan_masuk'));
                    }}
                    className="rounded text-blue-600"
                  />
                  <span>Siswa Baru Pindahan</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reportFilterStatuses.includes('mutasi_keluar')}
                    onChange={(e) => {
                      if (e.target.checked) setReportFilterStatuses(p => [...p, 'mutasi_keluar']);
                      else setReportFilterStatuses(p => p.filter(x => x !== 'mutasi_keluar'));
                    }}
                    className="rounded text-blue-600"
                  />
                  <span>Siswa Mutasi Keluar</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reportFilterStatuses.includes('berhenti_do')}
                    onChange={(e) => {
                      if (e.target.checked) setReportFilterStatuses(p => [...p, 'berhenti_do']);
                      else setReportFilterStatuses(p => p.filter(x => x !== 'berhenti_do'));
                    }}
                    className="rounded text-blue-600"
                  />
                  <span>Siswa Berhenti / DO</span>
                </label>
                <div className="pt-2 border-t border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer text-emerald-800 font-semibold">
                    <input
                      type="checkbox"
                      checked={reportFilterPipOnly}
                      onChange={(e) => setReportFilterPipOnly(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Khusus Penerima PIP Saja</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 3. Filter Kelas (Multi-pilihan Kelas) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>3. Pilihan Rombel Kelas</span>
                <button
                  type="button"
                  onClick={() => {
                    if (reportSelectedClasses.length === classes.length) setReportSelectedClasses([]);
                    else setReportSelectedClasses(classes.map(c => c.id));
                  }}
                  className="text-[10px] text-blue-600 hover:underline"
                >
                  {reportSelectedClasses.length === classes.length ? 'Batal Semua' : 'Pilih Semua'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-700">
                {classes.map(c => (
                  <label key={c.id} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reportSelectedClasses.includes(c.id)}
                      onChange={(e) => {
                        if (e.target.checked) setReportSelectedClasses(p => [...p, c.id]);
                        else setReportSelectedClasses(p => p.filter(x => x !== c.id));
                      }}
                      className="rounded text-blue-600"
                    />
                    <span>{c.nama}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Live Preview Count */}
          <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between text-xs text-blue-900">
            <div>
              <span>Hasil filter saat ini: </span>
              <strong className="text-base font-bold tabular-nums">{reportFilteredData.length}</strong>
              <span> siswa sesuai kriteria.</span>
            </div>
            <span className="text-slate-500">Kop Surat Resmi SDN Nambo 03 akan disematkan otomatis</span>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: EDIT DATA SISWA */}
      {/* --------------------------------------------------------------------- */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Edit Data Siswa ({editingStudent.nisn})</h3>
              <button onClick={() => setEditingStudent(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudentEdit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.namaLengkap}
                    onChange={(e) => setEditingStudent({ ...editingStudent, namaLengkap: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIS Sekolah</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.nis}
                    onChange={(e) => setEditingStudent({ ...editingStudent, nis: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kelas</label>
                  <select
                    value={editingStudent.kelasId}
                    onChange={(e) => setEditingStudent({ ...editingStudent, kelasId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Agama</label>
                  <select
                    value={editingStudent.agama}
                    onChange={(e) => setEditingStudent({ ...editingStudent, agama: e.target.value as Religion })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Khonghucu">Khonghucu</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={editingStudent.tempatLahir}
                    onChange={(e) => setEditingStudent({ ...editingStudent, tempatLahir: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={editingStudent.tanggalLahir}
                    onChange={(e) => setEditingStudent({ ...editingStudent, tanggalLahir: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tinggi Badan (cm)</label>
                  <input
                    type="number"
                    value={editingStudent.tinggiBadan || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, tinggiBadan: Number(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Berat Badan (kg)</label>
                  <input
                    type="number"
                    value={editingStudent.beratBadan || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, beratBadan: Number(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Alamat</label>
                  <input
                    type="text"
                    value={editingStudent.alamat}
                    onChange={(e) => setEditingStudent({ ...editingStudent, alamat: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 text-white rounded-xl hover:bg-blue-800"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: PINDAH KELAS TUNGGAL & MASAL */}
      {/* --------------------------------------------------------------------- */}
      {(moveClassModalStudent || isBulkMoveClassModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              {moveClassModalStudent
                ? `Pindahkan Kelas: ${moveClassModalStudent.namaLengkap}`
                : `Pindahkan ${selectedStudentIds.length} Siswa Terpilih`}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Kelas Tujuan:</label>
              <select
                value={targetMoveClassId}
                onChange={(e) => setTargetMoveClassId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-semibold text-blue-900"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.nama} ({c.ruang})</option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setMoveClassModalStudent(null);
                  setIsBulkMoveClassModalOpen(false);
                }}
                className="px-4 py-2 border rounded-xl text-xs text-slate-600"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (moveClassModalStudent) {
                    updateStudent(moveClassModalStudent.id, { kelasId: targetMoveClassId });
                    notify(`Siswa ${moveClassModalStudent.namaLengkap} berhasil dipindahkan ke ${classesMap.get(targetMoveClassId)}.`);
                    setMoveClassModalStudent(null);
                  } else {
                    handleExecuteBulkMoveClass();
                  }
                }}
                className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-semibold"
              >
                Konfirmasi Pindah Kelas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: MUTASI KELUAR */}
      {/* --------------------------------------------------------------------- */}
      {mutasiModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">
              Proses Mutasi Keluar: {mutasiModalStudent.namaLengkap}
            </h3>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sekolah Tujuan Mutasi *</label>
              <input
                type="text"
                required
                placeholder="Contoh: SDN Cibubur 03 Pagi"
                value={mutasiTujuan}
                onChange={(e) => setMutasiTujuan(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Keluar</label>
              <input
                type="date"
                value={mutasiTanggal}
                onChange={(e) => setMutasiTanggal(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alasan Kepindahan</label>
              <input
                type="text"
                value={mutasiAlasan}
                onChange={(e) => setMutasiAlasan(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div className="pt-3 border-t flex justify-end gap-3">
              <button onClick={() => setMutasiModalStudent(null)} className="px-4 py-2 border rounded-xl text-slate-600">
                Batal
              </button>
              <button onClick={handleConfirmMutasi} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl">
                Simpan Mutasi Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: BERHENTI / DO */}
      {/* --------------------------------------------------------------------- */}
      {doModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">
              Tandai Siswa Berhenti / DO: {doModalStudent.namaLengkap}
            </h3>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Berhenti</label>
              <input
                type="date"
                value={doTanggal}
                onChange={(e) => setDoTanggal(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Keterangan / Alasan Berhenti</label>
              <textarea
                rows={3}
                placeholder="Alasan putus sekolah / hasil home visit wali kelas..."
                value={doAlasan}
                onChange={(e) => setDoAlasan(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div className="pt-3 border-t flex justify-end gap-3">
              <button onClick={() => setDoModalStudent(null)} className="px-4 py-2 border rounded-xl text-slate-600">
                Batal
              </button>
              <button onClick={handleConfirmDo} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl">
                Simpan Status Berhenti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: KELOLA EKSTRAKURIKULER SISWA */}
      {/* --------------------------------------------------------------------- */}
      {managingEkskulStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">
              Pilihan Ekstrakurikuler: {managingEkskulStudent.namaLengkap}
            </h3>
            <p className="text-slate-500">Centang kegiatan ekstra kurikuler yang diikuti siswa ini:</p>

            <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-xl border">
              {extracurriculars.map(e => {
                const isEnrolled = (managingEkskulStudent.ekskulIds || []).includes(e.id);
                return (
                  <label key={e.id} className="flex items-center gap-2 p-1.5 hover:bg-white rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEnrolled}
                      onChange={(ev) => {
                        const current = managingEkskulStudent.ekskulIds || [];
                        const next = ev.target.checked
                          ? [...current, e.id]
                          : current.filter(id => id !== e.id);
                        setManagingEkskulStudent({ ...managingEkskulStudent, ekskulIds: next });
                      }}
                      className="rounded text-purple-600"
                    />
                    <div>
                      <span className="font-semibold text-slate-800">{e.nama}</span>
                      <span className="text-slate-400 block text-[11px]">{e.jadwalHari}</span>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="pt-3 border-t flex justify-end gap-3">
              <button onClick={() => setManagingEkskulStudent(null)} className="px-4 py-2 border rounded-xl text-slate-600">
                Batal
              </button>
              <button
                onClick={() => {
                  setStudentEkskul(managingEkskulStudent.id, managingEkskulStudent.ekskulIds || []);
                  notify(`Pilihan ekstrakurikuler ${managingEkskulStudent.namaLengkap} berhasil diperbarui.`);
                  setManagingEkskulStudent(null);
                }}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-xl"
              >
                Simpan Ekskul
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: EDIT DATA KELAS / ROMBEL */}
      {/* --------------------------------------------------------------------- */}
      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Ubah Data Rombel {editingClass.nama}</h3>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Kelas</label>
              <input
                type="text"
                value={editingClass.nama}
                onChange={(e) => setEditingClass({ ...editingClass, nama: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ruangan</label>
              <input
                type="text"
                value={editingClass.ruang}
                onChange={(e) => setEditingClass({ ...editingClass, ruang: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kapasitas / Kuota Siswa</label>
              <input
                type="number"
                value={editingClass.kuota}
                onChange={(e) => setEditingClass({ ...editingClass, kuota: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div className="pt-3 border-t flex justify-end gap-3">
              <button onClick={() => setEditingClass(null)} className="px-4 py-2 border rounded-xl text-slate-600">
                Batal
              </button>
              <button
                onClick={() => {
                  updateClass(editingClass.id, editingClass);
                  notify(`Data rombel ${editingClass.nama} berhasil diperbarui.`);
                  setEditingClass(null);
                }}
                className="px-4 py-2 bg-blue-900 text-white font-semibold rounded-xl"
              >
                Simpan Rombel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modals for Deletions */}
      <ConfirmModal
        isOpen={Boolean(singleDeleteStudentId)}
        title="Hapus Data Siswa"
        message="Apakah Anda yakin ingin menghapus data siswa ini secara permanen dari basis data sekolah?"
        confirmLabel="Hapus Data"
        isDestructive={true}
        onConfirm={handleConfirmSingleDelete}
        onCancel={() => setSingleDeleteStudentId(null)}
      />

      <ConfirmModal
        isOpen={isBulkDeleteModalOpen}
        title="Hapus Masal Data Siswa Terpilih"
        message={`Apakah Anda yakin ingin menghapus ${selectedStudentIds.length} data siswa terpilih sekaligus? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Masal"
        isDestructive={true}
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setIsBulkDeleteModalOpen(false)}
      />
    </div>
  );
};
