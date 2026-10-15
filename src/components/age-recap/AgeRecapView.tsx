import React, { useState, useMemo } from 'react';
import {
  Calendar,
  FileSpreadsheet,
  FileText,
  Users,
  CheckCircle2,
  Info,
  ChevronDown,
  Building,
  Save,
  Filter
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { exportAgeRecapToExcel } from '../../utils/excelUtils';
import { generateAgeRecapPdfReport } from '../../utils/pdfUtils';
import { SchoolLogo } from '../common/SchoolLogo';
import { Student } from '../../types';

// Standard Indonesian Elementary School Age Categories
const AGE_CATEGORIES = [
  '< 6 th',
  '6 th',
  '7 th',
  '8 th',
  '9 th',
  '10 th',
  '11 th',
  '12 th',
  '> 12 th'
];

/**
 * Calculates student age in full years on a reference month/year
 */
function getAgeCategory(birthDateStr: string, referenceMonthStr: string): string {
  if (!birthDateStr) return '7 th';
  const birth = new Date(birthDateStr);
  const [refYear, refMonth] = referenceMonthStr.split('-').map(Number);
  
  // Reference date: end of the selected month
  const ref = new Date(refYear, refMonth, 0);

  let years = ref.getFullYear() - birth.getFullYear();
  const m = ref.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) {
    years--;
  }

  if (years < 6) return '< 6 th';
  if (years === 6) return '6 th';
  if (years === 7) return '7 th';
  if (years === 8) return '8 th';
  if (years === 9) return '9 th';
  if (years === 10) return '10 th';
  if (years === 11) return '11 th';
  if (years === 12) return '12 th';
  return '> 12 th';
}

export const AgeRecapView: React.FC = () => {
  const {
    students,
    classes,
    teachersStaff,
    classesMap,
    monthlyAgeRecaps,
    saveMonthlyAgeRecap
  } = useSchool();

  // Selected Month (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [selectedClassDetailId, setSelectedClassDetailId] = useState<string>('all');
  const [teacherNotes, setTeacherNotes] = useState<string>('Data umur sesuai akta kelahiran pada Dapodik.');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Human readable month title
  const monthLabel = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }, [selectedMonth]);

  // Active students only (exclude mutasi / DO)
  const activeStudents = useMemo(() => {
    return students.filter(s => s.status !== 'mutasi_keluar' && s.status !== 'berhenti_do');
  }, [students]);

  // Calculate age breakdown per class
  const classesBreakdown = useMemo(() => {
    return classes.map(c => {
      const classStudents = activeStudents.filter(s => s.kelasId === c.id);

      // Counts per age category
      const counts: Record<string, { male: number; female: number; total: number }> = {};
      AGE_CATEGORIES.forEach(age => {
        counts[age] = { male: 0, female: 0, total: 0 };
      });

      let totalL = 0;
      let totalP = 0;

      classStudents.forEach(s => {
        const cat = getAgeCategory(s.tanggalLahir, selectedMonth);
        if (!counts[cat]) {
          counts[cat] = { male: 0, female: 0, total: 0 };
        }
        if (s.jenisKelamin === 'L') {
          counts[cat].male++;
          totalL++;
        } else {
          counts[cat].female++;
          totalP++;
        }
        counts[cat].total++;
      });

      return {
        classId: c.id,
        className: c.nama,
        counts,
        totalL,
        totalP,
        grandTotal: totalL + totalP
      };
    });
  }, [classes, activeStudents, selectedMonth]);

  // Summary Totals across all classes
  const summaryTotals = useMemo(() => {
    const totals: Record<string, { male: number; female: number; total: number }> = {};
    AGE_CATEGORIES.forEach(age => {
      totals[age] = { male: 0, female: 0, total: 0 };
    });

    classesBreakdown.forEach(item => {
      AGE_CATEGORIES.forEach(age => {
        totals[age].male += item.counts[age]?.male || 0;
        totals[age].female += item.counts[age]?.female || 0;
        totals[age].total += item.counts[age]?.total || 0;
      });
    });

    return totals;
  }, [classesBreakdown]);

  // Detailed students list for the selected class
  const detailStudents = useMemo(() => {
    if (selectedClassDetailId === 'all') return activeStudents;
    return activeStudents.filter(s => s.kelasId === selectedClassDetailId);
  }, [activeStudents, selectedClassDetailId]);

  // Save monthly verification
  const handleSaveVerification = () => {
    saveMonthlyAgeRecap({
      kelasId: selectedClassDetailId === 'all' ? 'semua' : selectedClassDetailId,
      bulan: selectedMonth,
      catatan: teacherNotes,
      ageCounts: {},
      updatedAt: new Date().toISOString()
    });
    notify(`Rekapitulasi umur keadaan ${monthLabel} berhasil disimpan dan diverifikasi.`);
  };

  // Downloads
  const handleDownloadExcel = () => {
    exportAgeRecapToExcel({
      bulanLabel: monthLabel,
      classesBreakdown
    });
    notify(`Rekapitulasi umur keadaan ${monthLabel} berhasil diekspor ke Excel (.xlsx).`);
  };

  const handleDownloadPdf = () => {
    generateAgeRecapPdfReport({
      bulanLabel: monthLabel,
      classesBreakdown,
      summaryTotals
    });
    notify(`Rekapitulasi umur keadaan ${monthLabel} berhasil dicetak ke PDF resmi.`);
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

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <SchoolLogo size="lg" showBorder={true} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-cyan-100 text-cyan-800">
                  Format Administrasi Bulanan Guru
                </span>
                <span className="text-xs text-slate-400">NPSN: 20200352</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Rekapitulasi Umur Siswa per Bulan
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribusi keadaan umur siswa menurut kelompok umur, jenis kelamin (L/P), dan rombongan belajar setiap bulan
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

        {/* Month Selector & Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Pilih Keadaan Bulan
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-blue-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Filter Rombel Detail Siswa
            </label>
            <select
              value={selectedClassDetailId}
              onChange={(e) => setSelectedClassDetailId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700"
            >
              <option value="all">Semua Rombel (Total Sekolah)</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.nama}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleSaveVerification}
              className="w-full py-2 px-4 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Verifikasi Bulan Ini</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info notice */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center gap-3 text-xs text-blue-900">
        <Info className="w-4 h-4 text-blue-700 shrink-0" />
        <div>
          Kalkulasi umur dihitung secara dinamis dari tanggal lahir siswa per tanggal akhir bulan <strong>{monthLabel}</strong>. Guru kelas dapat langsung mengunduh cetakan resmi untuk lampiran buku administrasi kelas.
        </div>
      </div>

      {/* Main Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Matriks Distribusi Umur Siswa Keadaan {monthLabel} (NPSN: 20200352)
          </h2>
          <span className="text-[11px] font-semibold text-blue-700 font-mono">
            Total {activeStudents.length} Siswa Aktif
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              {/* Row 1 Header */}
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                <th rowSpan={2} className="py-3 px-3 text-left w-28 border-r border-slate-200">
                  Rombel
                </th>
                {AGE_CATEGORIES.map(age => (
                  <th key={age} colSpan={3} className="py-2 px-2 border-r border-slate-200">
                    {age}
                  </th>
                ))}
                <th colSpan={3} className="py-2 px-3 bg-blue-50/80 text-blue-900">
                  Jumlah Siswa
                </th>
              </tr>
              {/* Row 2 Subheader (L, P, Total) */}
              <tr className="bg-slate-50 text-[11px] text-slate-600 font-semibold border-b border-slate-200">
                {AGE_CATEGORIES.map(age => (
                  <React.Fragment key={`${age}-sub`}>
                    <th className="py-1 px-1.5 text-blue-700">L</th>
                    <th className="py-1 px-1.5 text-pink-600">P</th>
                    <th className="py-1 px-1.5 font-bold border-r border-slate-200">Jml</th>
                  </React.Fragment>
                ))}
                <th className="py-1 px-2 text-blue-700 bg-blue-50/40">L</th>
                <th className="py-1 px-2 text-pink-600 bg-blue-50/40">P</th>
                <th className="py-1 px-2 font-bold bg-blue-50/80 text-blue-900">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classesBreakdown.map((row) => (
                <tr key={row.classId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 text-left font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                    {row.className}
                  </td>
                  {AGE_CATEGORIES.map(age => {
                    const c = row.counts[age] || { male: 0, female: 0, total: 0 };
                    return (
                      <React.Fragment key={`${row.classId}-${age}`}>
                        <td className="py-2 px-1 text-slate-700 tabular-nums font-mono">
                          {c.male || '-'}
                        </td>
                        <td className="py-2 px-1 text-slate-700 tabular-nums font-mono">
                          {c.female || '-'}
                        </td>
                        <td className="py-2 px-1 font-semibold text-slate-900 border-r border-slate-200 tabular-nums font-mono">
                          {c.total > 0 ? c.total : '-'}
                        </td>
                      </React.Fragment>
                    );
                  })}
                  {/* Totals per class */}
                  <td className="py-2 px-2 font-semibold text-blue-800 bg-blue-50/20 tabular-nums font-mono">
                    {row.totalL}
                  </td>
                  <td className="py-2 px-2 font-semibold text-pink-700 bg-blue-50/20 tabular-nums font-mono">
                    {row.totalP}
                  </td>
                  <td className="py-2 px-2 font-extrabold text-blue-900 bg-blue-50/60 tabular-nums font-mono">
                    {row.grandTotal}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Footer Summary Row */}
            <tfoot>
              <tr className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-300">
                <td className="py-3 px-3 text-left font-extrabold border-r border-slate-300">
                  TOTAL SEKOLAH
                </td>
                {AGE_CATEGORIES.map(age => {
                  const s = summaryTotals[age] || { male: 0, female: 0, total: 0 };
                  return (
                    <React.Fragment key={`tot-${age}`}>
                      <td className="py-2 px-1 text-blue-800 tabular-nums font-mono">
                        {s.male}
                      </td>
                      <td className="py-2 px-1 text-pink-700 tabular-nums font-mono">
                        {s.female}
                      </td>
                      <td className="py-2 px-1 font-bold text-slate-900 border-r border-slate-300 tabular-nums font-mono">
                        {s.total}
                      </td>
                    </React.Fragment>
                  );
                })}
                <td className="py-3 px-2 font-extrabold text-blue-800 bg-blue-100 tabular-nums font-mono">
                  {Object.values(summaryTotals).reduce((sum, v) => sum + v.male, 0)}
                </td>
                <td className="py-3 px-2 font-extrabold text-pink-700 bg-blue-100 tabular-nums font-mono">
                  {Object.values(summaryTotals).reduce((sum, v) => sum + v.female, 0)}
                </td>
                <td className="py-3 px-2 font-black text-blue-950 bg-blue-200 tabular-nums font-mono">
                  {activeStudents.length}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Detailed Student Age Breakdown List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Rincian Tanggal Lahir & Usia Siswa ({detailStudents.length} anak)
            </h3>
            <p className="text-xs text-slate-500">
              Verifikasi per siswa untuk {selectedClassDetailId === 'all' ? 'Seluruh Siswa Sekolah' : classesMap.get(selectedClassDetailId)}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="sticky top-0 bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3">NISN</th>
                <th className="py-2.5 px-4">Nama Lengkap</th>
                <th className="py-2.5 px-3">Kelas</th>
                <th className="py-2.5 px-3 text-center">L/P</th>
                <th className="py-2.5 px-3">Tanggal Lahir</th>
                <th className="py-2.5 px-3 font-semibold text-center">Kategori Umur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {detailStudents.map((s, idx) => {
                const cat = getAgeCategory(s.tanggalLahir, selectedMonth);
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2 px-3 font-mono text-slate-800">{s.nisn}</td>
                    <td className="py-2 px-4 font-semibold text-slate-900">{s.namaLengkap}</td>
                    <td className="py-2 px-3 text-blue-700">{classesMap.get(s.kelasId) || s.kelasId}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={s.jenisKelamin === 'L' ? 'text-blue-700 font-semibold' : 'text-pink-600 font-semibold'}>
                        {s.jenisKelamin}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-700">{s.tanggalLahir}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-semibold font-mono text-[11px]">
                        {cat}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
