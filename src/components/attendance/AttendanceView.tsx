import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  UserCheck,
  UserX,
  Users,
  Search,
  Filter,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  School,
  Save,
  RotateCcw
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { AttendanceStatus, DailyAttendance, StudentAttendanceEntry } from '../../types';
import { exportAttendanceToExcel } from '../../utils/excelUtils';
import { generateAttendancePdfReport } from '../../utils/pdfUtils';
import { SchoolLogo } from '../common/SchoolLogo';

export const AttendanceView: React.FC = () => {
  const {
    students,
    classes,
    teachersStaff,
    classesMap,
    teachersMap,
    attendances,
    saveDailyAttendance,
    getAttendanceByDateAndClass
  } = useSchool();

  // Selected date and class
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'k-1a');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [dailyNotes, setDailyNotes] = useState<string>('');

  // Active students in selected class
  const classStudents = useMemo(() => {
    return students.filter(
      s => s.kelasId === selectedClassId && s.status !== 'mutasi_keluar' && s.status !== 'berhenti_do'
    );
  }, [students, selectedClassId]);

  // Current attendance entries in memory
  const [currentEntries, setCurrentEntries] = useState<Record<string, { status: AttendanceStatus; keterangan: string }>>({});

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Synchronize entries when date or class changes
  useEffect(() => {
    const existing = getAttendanceByDateAndClass(selectedDate, selectedClassId);
    const newMap: Record<string, { status: AttendanceStatus; keterangan: string }> = {};

    // Get current class wali kelas as default
    const currentClass = classes.find(c => c.id === selectedClassId);
    if (existing?.guruPengisiId) {
      setSelectedTeacherId(existing.guruPengisiId);
    } else if (currentClass?.waliKelasGuruId) {
      setSelectedTeacherId(currentClass.waliKelasGuruId);
    } else {
      const firstTeacher = teachersStaff.find(t => t.kategori === 'guru');
      if (firstTeacher) setSelectedTeacherId(firstTeacher.id);
    }

    if (existing) {
      setDailyNotes(existing.catatanHarian || '');
      existing.entries.forEach((entry: StudentAttendanceEntry) => {
        newMap[entry.studentId] = {
          status: entry.status,
          keterangan: entry.keterangan || ''
        };
      });
    } else {
      setDailyNotes('');
    }

    // Default missing students to 'H' (Hadir)
    classStudents.forEach(s => {
      if (!newMap[s.id]) {
        newMap[s.id] = { status: 'H', keterangan: '' };
      }
    });

    setCurrentEntries(newMap);
  }, [selectedDate, selectedClassId, attendances, classStudents]);

  // Update a student status
  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    setCurrentEntries(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { keterangan: '' }),
        status
      }
    }));
  };

  // Update a student note
  const handleSetKeterangan = (studentId: string, keterangan: string) => {
    setCurrentEntries(prev => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status || 'H',
        keterangan
      }
    }));
  };

  // Quick action: Set all to present
  const handleMarkAllPresent = () => {
    const next: Record<string, { status: AttendanceStatus; keterangan: string }> = {};
    classStudents.forEach(s => {
      next[s.id] = { status: 'H', keterangan: '' };
    });
    setCurrentEntries(next);
    notify('Semua siswa di kelas ini ditandai Hadir (H).');
  };

  // Save attendance
  const handleSaveAttendance = () => {
    const entries: StudentAttendanceEntry[] = classStudents.map(s => {
      const cur = currentEntries[s.id] || { status: 'H', keterangan: '' };
      return {
        studentId: s.id,
        status: cur.status,
        keterangan: cur.keterangan || undefined
      };
    });

    const record: DailyAttendance = {
      id: `${selectedClassId}_${selectedDate}`,
      tanggal: selectedDate,
      kelasId: selectedClassId,
      guruPengisiId: selectedTeacherId || undefined,
      entries,
      catatanHarian: dailyNotes,
      updatedAt: new Date().toISOString()
    };

    saveDailyAttendance(record);
    notify(`Presensi tanggal ${selectedDate} untuk ${classesMap.get(selectedClassId)} berhasil disimpan!`);
  };

  // Summary counts
  const hadirCount = classStudents.filter(s => (currentEntries[s.id]?.status || 'H') === 'H').length;
  const sakitCount = classStudents.filter(s => currentEntries[s.id]?.status === 'S').length;
  const izinCount = classStudents.filter(s => currentEntries[s.id]?.status === 'I').length;
  const alpaCount = classStudents.filter(s => currentEntries[s.id]?.status === 'A').length;
  const totalCount = classStudents.length;
  const kehadiranPct = totalCount > 0 ? Math.round((hadirCount / totalCount) * 100) : 0;

  // Prepared export list
  const exportList = classStudents.map((s, idx) => ({
    no: idx + 1,
    nisn: s.nisn,
    nama: s.namaLengkap,
    gender: s.jenisKelamin,
    status: currentEntries[s.id]?.status || 'H',
    keterangan: currentEntries[s.id]?.keterangan || ''
  }));

  const handleDownloadExcel = () => {
    exportAttendanceToExcel({
      className: classesMap.get(selectedClassId) || selectedClassId,
      tanggal: selectedDate,
      attendanceList: exportList
    });
    notify('Daftar presensi harian berhasil diekspor ke Excel (.xlsx).');
  };

  const handleDownloadPdf = () => {
    const guru = teachersStaff.find(t => t.id === selectedTeacherId);
    generateAttendancePdfReport({
      className: classesMap.get(selectedClassId) || selectedClassId,
      tanggal: selectedDate,
      guruName: guru ? `${guru.namaLengkap}${guru.gelar ? ', ' + guru.gelar : ''}` : undefined,
      attendanceList: exportList
    });
    notify('Daftar presensi harian berhasil dicetak ke PDF resmi.');
  };

  // Change date helpers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
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

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <SchoolLogo size="lg" showBorder={true} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  Fitur Presensi Harian Guru
                </span>
                <span className="text-xs text-slate-400">NPSN: 20200352</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Absensi & Kehadiran Harian Siswa
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Guru mengisi dan memverifikasi presensi harian siswa secara interaktif per kelas, dan mengunduh berkas laporan
              </p>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadExcel}
              className="px-3.5 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Excel (.xlsx)</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              className="px-3.5 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <FileText className="w-4 h-4" />
              <span>Download PDF Resmi</span>
            </button>
          </div>
        </div>

        {/* Controls: Date, Class, and Teacher Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          {/* Tanggal Presensi with prev/next */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Tanggal Presensi
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevDay}
                className="p-2 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100"
                title="Hari Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
              />
              <button
                type="button"
                onClick={handleNextDay}
                className="p-2 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100"
                title="Hari Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Pilih Kelas */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Rombongan Belajar (Kelas)
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-blue-900"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nama} ({c.ruang})
                </option>
              ))}
            </select>
          </div>

          {/* Guru Pengisi / Wali Kelas */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Guru Pengisi / Wali Kelas
            </label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
            >
              <option value="">-- Pilih Guru Pengisi --</option>
              {teachersStaff.filter(t => t.kategori === 'guru').map(g => (
                <option key={g.id} value={g.id}>
                  {g.namaLengkap}{g.gelar ? ', ' + g.gelar : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Mark All Present */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Tandai Semua Hadir (H)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200 text-center">
          <div className="text-xs text-slate-500 font-medium">Total Siswa</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">{totalCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">di {classesMap.get(selectedClassId)}</div>
        </div>

        <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 text-center">
          <div className="text-xs text-emerald-800 font-medium">Hadir (H)</div>
          <div className="text-2xl font-extrabold text-emerald-700 tabular-nums mt-1">{hadirCount}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">{kehadiranPct}% Kehadiran</div>
        </div>

        <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 text-center">
          <div className="text-xs text-blue-800 font-medium">Sakit (S)</div>
          <div className="text-2xl font-extrabold text-blue-700 tabular-nums mt-1">{sakitCount}</div>
          <div className="text-[10px] text-blue-600 mt-0.5">Surat / Pemberitahuan</div>
        </div>

        <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 text-center">
          <div className="text-xs text-amber-800 font-medium">Izin (I)</div>
          <div className="text-2xl font-extrabold text-amber-700 tabular-nums mt-1">{izinCount}</div>
          <div className="text-[10px] text-amber-600 mt-0.5">Keperluan Keluarga</div>
        </div>

        <div className="p-4 bg-rose-50/70 rounded-xl border border-rose-200 text-center col-span-2 sm:col-span-1">
          <div className="text-xs text-rose-800 font-medium">Alpa (A)</div>
          <div className="text-2xl font-extrabold text-rose-700 tabular-nums mt-1">{alpaCount}</div>
          <div className="text-[10px] text-rose-600 mt-0.5">Tanpa Keterangan</div>
        </div>
      </div>

      {/* Interactive Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Daftar Siswa {classesMap.get(selectedClassId)} ({totalCount} anak)
            </h2>
            <span className="text-[11px] text-slate-400">· Klik tombol status untuk mengubah</span>
          </div>

          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> H = Hadir
            </span>
            <span className="flex items-center gap-1 text-blue-700">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> S = Sakit
            </span>
            <span className="flex items-center gap-1 text-amber-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> I = Izin
            </span>
            <span className="flex items-center gap-1 text-rose-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> A = Alpa
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-3">NISN / NIS</th>
                <th className="py-3 px-4">Nama Lengkap Siswa</th>
                <th className="py-3 px-3 text-center">L/P</th>
                <th className="py-3 px-4 text-center">Status Presensi</th>
                <th className="py-3 px-4">Keterangan / Alasan (Opsional)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Belum ada siswa terdaftar di {classesMap.get(selectedClassId)}. Silakan tambahkan siswa melalui Menu Input Siswa.
                  </td>
                </tr>
              ) : (
                classStudents.map((student, idx) => {
                  const entry = currentEntries[student.id] || { status: 'H', keterangan: '' };
                  const currentStatus = entry.status;

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        currentStatus === 'A'
                          ? 'bg-rose-50/30'
                          : currentStatus === 'S'
                          ? 'bg-blue-50/20'
                          : currentStatus === 'I'
                          ? 'bg-amber-50/20'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-mono text-slate-500">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-3 font-mono">
                        <div className="font-semibold text-slate-900">{student.nisn}</div>
                        <div className="text-slate-400 text-[11px]">{student.nis}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{student.namaLengkap}</div>
                        {student.isPip && (
                          <span className="text-[10px] text-emerald-600 font-medium">Penerima PIP</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`font-semibold ${student.jenisKelamin === 'L' ? 'text-blue-700' : 'text-pink-600'}`}>
                          {student.jenisKelamin}
                        </span>
                      </td>

                      {/* Interactive Presensi Button Group */}
                      <td className="py-2.5 px-4 text-center">
                        <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl gap-1">
                          <button
                            type="button"
                            onClick={() => handleSetStatus(student.id, 'H')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                              currentStatus === 'H'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                            }`}
                            title="Hadir"
                          >
                            H
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStatus(student.id, 'S')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                              currentStatus === 'S'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                            }`}
                            title="Sakit"
                          >
                            S
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStatus(student.id, 'I')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                              currentStatus === 'I'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                            }`}
                            title="Izin"
                          >
                            I
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStatus(student.id, 'A')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                              currentStatus === 'A'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                            }`}
                            title="Alpa / Tanpa Keterangan"
                          >
                            A
                          </button>
                        </div>
                      </td>

                      {/* Input Keterangan */}
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          placeholder={
                            currentStatus === 'H'
                              ? 'Hadir normal'
                              : currentStatus === 'S'
                              ? 'Contoh: Sakit demam/surat dokter'
                              : currentStatus === 'I'
                              ? 'Contoh: Izin acara keluarga'
                              : 'Tanpa keterangan'
                          }
                          value={entry.keterangan || ''}
                          onChange={(e) => handleSetKeterangan(student.id, e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Classroom Daily Notes & Save Button */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-xl">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Catatan / Jurnal Harian Pembelajaran Kelas
            </label>
            <input
              type="text"
              placeholder="Contoh: Siswa aktif dalam materi matematika pecahan, 1 siswa izin berobat..."
              value={dailyNotes}
              onChange={(e) => setDailyNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveAttendance}
              className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Presensi Harian</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
