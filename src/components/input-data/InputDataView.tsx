import React, { useState, useRef } from 'react';
import {
  FilePlus,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Users,
  School,
  GraduationCap,
  Briefcase,
  Layers,
  ArrowRight,
  UserPlus,
  Building,
  Info
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import {
  Religion,
  Gender,
  StudentStatus,
  EmploymentStatus,
  StaffRole
} from '../../types';
import {
  generateClassesTemplateExcel,
  generateStudentsTemplateExcel,
  generateTeachersTemplateExcel,
  generateStaffTemplateExcel,
  parseExcelFile
} from '../../utils/excelUtils';
import { SchoolLogo } from '../common/SchoolLogo';

export const InputDataView: React.FC = () => {
  const {
    inputSubTab,
    setInputSubTab,
    classes,
    addClass,
    extracurriculars,
    addExtracurricular,
    teachersStaff,
    addTeacherStaff,
    addStudent,
    importStudentsBatch,
    showDuplicateNisnModal
  } = useSchool();

  // Local UI status
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [activeInputMode, setActiveInputMode] = useState<'manual' | 'import'>('manual');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // ----------------------------------------------------
  // FORM STATE: TAB 1 - KELAS & EKSKUL
  // ----------------------------------------------------
  const [classFormType, setClassFormType] = useState<'utama' | 'ekskul'>('utama');
  const [classKode, setClassKode] = useState('');
  const [classNama, setClassNama] = useState('');
  const [classTingkat, setClassTingkat] = useState<number>(1);
  const [classFase, setClassFase] = useState<'Fase A' | 'Fase B' | 'Fase C'>('Fase A');
  const [classRuang, setClassRuang] = useState('');
  const [classKuota, setClassKuota] = useState<number>(28);
  const [classWaliId, setClassWaliId] = useState('');

  // Ekskul specific fields
  const [ekskulKategori, setEkskulKategori] = useState('Olahraga');
  const [ekskulJadwal, setEkskulJadwal] = useState('Jumat, 14.00 - 15.30');

  const handleClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (classFormType === 'utama') {
      if (!classKode || !classNama) return;
      addClass({
        kode: classKode,
        nama: classNama,
        tingkat: Number(classTingkat),
        fase: classFase,
        ruang: classRuang || `Ruang ${classNama}`,
        kuota: Number(classKuota),
        waliKelasGuruId: classWaliId || undefined
      });
      showNotification(`Kelas "${classNama}" berhasil ditambahkan ke rombongan belajar.`);
    } else {
      if (!classKode || !classNama) return;
      addExtracurricular({
        kode: classKode,
        nama: classNama,
        kategori: ekskulKategori,
        jadwalHari: ekskulJadwal,
        tempat: classRuang || 'Lapangan/Aula Sekolah',
        kuota: Number(classKuota),
        pembinaGuruId: classWaliId || undefined
      });
      showNotification(`Ekstrakurikuler "${classNama}" berhasil didaftarkan.`);
    }
    // reset form
    setClassKode('');
    setClassNama('');
    setClassRuang('');
  };

  // ----------------------------------------------------
  // FORM STATE: TAB 2 - SISWA
  // ----------------------------------------------------
  const [studentFormMode, setStudentFormMode] = useState<'reguler' | 'pindahan'>('reguler');
  const [sNisn, setSNisn] = useState('');
  const [sNis, setSNis] = useState('');
  const [sNama, setSNama] = useState('');
  const [sTempatLahir, setSTempatLahir] = useState('');
  const [sTanggalLahir, setSTanggalLahir] = useState('');
  const [sAgama, setSAgama] = useState<Religion>('Islam');
  const [sJenisKelamin, setSJenisKelamin] = useState<Gender>('L');
  const [sNik, setSNik] = useState('');
  const [sAlamat, setSAlamat] = useState('');
  const [sTinggi, setSTinggi] = useState<string>('');
  const [sBerat, setSBerat] = useState<string>('');
  const [sKelasId, setSKelasId] = useState<string>(classes[0]?.id || '');

  // Specific for transfer student
  const [sAsalSekolah, setSAsalSekolah] = useState('');
  const [sTanggalPindah, setSTanggalPindah] = useState('');
  const [sNoSuratPindah, setSNoSuratPindah] = useState('');
  const [sAlasanPindah, setSAlasanPindah] = useState('');

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sNisn || !sNis || !sNama || !sTanggalLahir || !sKelasId) {
      alert('Mohon lengkapi NISN, NIS, Nama Lengkap, Tanggal Lahir, dan Kelas!');
      return;
    }

    const isPindahan = studentFormMode === 'pindahan';

    const result = addStudent({
      nisn: sNisn.trim(),
      nis: sNis.trim(),
      namaLengkap: sNama.trim(),
      tempatLahir: sTempatLahir.trim() || 'Bogor',
      tanggalLahir: sTanggalLahir,
      agama: sAgama,
      jenisKelamin: sJenisKelamin,
      nik: sNik.trim() || `320108${sTanggalLahir.replace(/-/g, '').slice(2)}0001`,
      alamat: sAlamat.trim() || 'Desa Nambo, Klapanunggal',
      tinggiBadan: sTinggi ? Number(sTinggi) : undefined,
      beratBadan: sBerat ? Number(sBerat) : undefined,
      kelasId: sKelasId,
      status: isPindahan ? 'pindahan_masuk' : 'aktif',
      isPindahan,
      asalSekolah: isPindahan ? sAsalSekolah : undefined,
      tanggalPindah: isPindahan ? sTanggalPindah : undefined,
      noSuratPindah: isPindahan ? sNoSuratPindah : undefined,
      alasanPindah: isPindahan ? sAlasanPindah : undefined,
      isPip: false
    });

    if (result.success) {
      showNotification(`Siswa "${sNama}" (NISN: ${sNisn}) berhasil didaftarkan!`);
      // Reset
      setSNisn('');
      setSNis('');
      setSNama('');
      setSTempatLahir('');
      setSTanggalLahir('');
      setSNik('');
      setSAlamat('');
      setSTinggi('');
      setSBerat('');
      setSAsalSekolah('');
      setSTanggalPindah('');
      setSNoSuratPindah('');
      setSAlasanPindah('');
    }
  };

  // ----------------------------------------------------
  // FORM STATE: TAB 3 - GURU
  // ----------------------------------------------------
  const [gNip, setGNip] = useState('');
  const [gNuptk, setGNuptk] = useState('');
  const [gNama, setGNama] = useState('');
  const [gGelar, setGGelar] = useState('S.Pd.');
  const [gJenisKelamin, setGJenisKelamin] = useState<Gender>('L');
  const [gJabatan, setGJabatan] = useState<StaffRole>('Guru Kelas');
  const [gStatusPegawai, setGStatusPegawai] = useState<EmploymentStatus>('PNS');
  const [gPendidikan, setGPendidikan] = useState('S1 PGSD');
  const [gNoHp, setGNoHp] = useState('');
  const [gEmail, setGEmail] = useState('');
  const [gAlamat, setGAlamat] = useState('');
  const [gTmt, setGTmt] = useState('2024-01-01');

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gNama) return;
    addTeacherStaff({
      nip: gNip || '-',
      nuptk: gNuptk || undefined,
      namaLengkap: gNama,
      gelar: gGelar || undefined,
      jenisKelamin: gJenisKelamin,
      kategori: 'guru',
      jabatan: gJabatan,
      statusKepegawaian: gStatusPegawai,
      pendidikanTerakhir: gPendidikan,
      noHp: gNoHp || '081234567890',
      email: gEmail || undefined,
      alamat: gAlamat || 'Klapanunggal, Bogor',
      statusKerja: 'aktif',
      tmtKerja: gTmt
    });
    showNotification(`Guru "${gNama}, ${gGelar}" berhasil didaftarkan.`);
    setGNip('');
    setGNuptk('');
    setGNama('');
    setGNoHp('');
    setGEmail('');
  };

  // ----------------------------------------------------
  // FORM STATE: TAB 4 - KEPEGAWAIAN (TU)
  // ----------------------------------------------------
  const [sNipTu, setSNipTu] = useState('');
  const [sNamaTu, setSNamaTu] = useState('');
  const [sGelarTu, setSGelarTu] = useState('');
  const [sJenisKelaminTu, setSJenisKelaminTu] = useState<Gender>('L');
  const [sJabatanTu, setSJabatanTu] = useState<StaffRole>('Tenaga Administrasi (TU)');
  const [sStatusPegawaiTu, setSStatusPegawaiTu] = useState<EmploymentStatus>('Honorer');
  const [sPendidikanTu, setSPendidikanTu] = useState('D3 Administrasi Perkantoran');
  const [sNoHpTu, setSNoHpTu] = useState('');
  const [sEmailTu, setSEmailTu] = useState('');
  const [sAlamatTu, setSAlamatTu] = useState('');
  const [sTmtTu, setSTmtTu] = useState('2024-01-01');

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sNamaTu) return;
    addTeacherStaff({
      nip: sNipTu || '-',
      namaLengkap: sNamaTu,
      gelar: sGelarTu || undefined,
      jenisKelamin: sJenisKelaminTu,
      kategori: 'kepegawaian',
      jabatan: sJabatanTu,
      statusKepegawaian: sStatusPegawaiTu,
      pendidikanTerakhir: sPendidikanTu,
      noHp: sNoHpTu || '081234567890',
      email: sEmailTu || undefined,
      alamat: sAlamatTu || 'Klapanunggal, Bogor',
      statusKerja: 'aktif',
      tmtKerja: sTmtTu
    });
    showNotification(`Pegawai TU "${sNamaTu}" berhasil didaftarkan.`);
    setSNipTu('');
    setSNamaTu('');
    setSGelarTu('');
    setSNoHpTu('');
    setSEmailTu('');
  };

  // ----------------------------------------------------
  // IMPORT EXCEL HANDLER
  // ----------------------------------------------------
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportSummary(null);

    try {
      const rows = await parseExcelFile(file);
      if (rows.length === 0) {
        alert('File Excel kosong atau format tidak sesuai.');
        setIsImporting(false);
        return;
      }

      if (inputSubTab === 'siswa') {
        // Map parsed rows to student objects
        const mappedStudents = rows.map(r => {
          const rawNisn = String(r['NISN (Wajib & Unik)'] || r['NISN'] || '').trim();
          const rawNis = String(r['NIS'] || '').trim();
          const nama = String(r['Nama Lengkap'] || '').trim();
          const rawKelas = String(r['Kode Kelas'] || r['Kode Kelas Tujuan'] || r['Kelas'] || '').trim();
          
          // Match class ID from name or code
          const matchedClass = classes.find(c => 
            c.nama.toLowerCase() === rawKelas.toLowerCase() || 
            c.kode.toLowerCase() === rawKelas.toLowerCase()
          ) || classes[0];

          const isPindahan = Boolean(r['Asal Sekolah'] || r['Kode Kelas Tujuan']);

          return {
            nisn: rawNisn,
            nis: rawNis || rawNisn.slice(-5),
            namaLengkap: nama,
            tempatLahir: String(r['Tempat Lahir'] || 'Bogor'),
            tanggalLahir: String(r['Tanggal Lahir (YYYY-MM-DD)'] || r['Tanggal Lahir'] || '2018-01-01'),
            agama: (r['Agama'] || 'Islam') as Religion,
            jenisKelamin: (r['Jenis Kelamin (L/P)'] === 'P' ? 'P' : 'L') as Gender,
            nik: String(r['NIK'] || ''),
            alamat: String(r['Alamat'] || 'Desa Nambo, Klapanunggal'),
            tinggiBadan: r['Tinggi Badan (cm)'] ? Number(r['Tinggi Badan (cm)']) : undefined,
            beratBadan: r['Berat Badan (kg)'] ? Number(r['Berat Badan (kg)']) : undefined,
            kelasId: matchedClass?.id || 'k-1a',
            status: isPindahan ? 'pindahan_masuk' as StudentStatus : 'aktif' as StudentStatus,
            isPindahan,
            asalSekolah: r['Asal Sekolah'] ? String(r['Asal Sekolah']) : undefined,
            tanggalPindah: r['Tanggal Pindah (YYYY-MM-DD)'] ? String(r['Tanggal Pindah (YYYY-MM-DD)']) : undefined,
            noSuratPindah: r['Nomor Surat Pindah'] ? String(r['Nomor Surat Pindah']) : undefined,
            alasanPindah: r['Alasan Pindah'] ? String(r['Alasan Pindah']) : undefined,
            isPip: false
          };
        }).filter(s => s.nisn && s.namaLengkap);

        const result = importStudentsBatch(mappedStudents);
        setImportSummary(
          `Hasil Impor: ${result.addedCount} siswa berhasil ditambahkan.${
            result.duplicateCount > 0 ? ` ${result.duplicateCount} siswa dilewati karena NISN duplikat.` : ''
          }`
        );
        showNotification(`${result.addedCount} data siswa berhasil diimpor.`);
      } else if (inputSubTab === 'kelas-ekskul') {
        let count = 0;
        for (const r of rows) {
          const tipe = String(r['Tipe (utama / ekskul)'] || 'utama').toLowerCase();
          const kode = String(r['Kode'] || '');
          const nama = String(r['Nama Kelas / Ekskul'] || '');
          if (!nama) continue;

          if (tipe.includes('ekskul')) {
            addExtracurricular({
              kode: kode || `EKS-${Date.now().toString().slice(-3)}`,
              nama,
              kategori: 'Peminatan',
              jadwalHari: String(r['Keterangan / Jadwal'] || 'Jumat, 14.00'),
              tempat: String(r['Ruang / Tempat'] || 'Lapangan'),
              kuota: Number(r['Kuota'] || 30)
            });
          } else {
            addClass({
              kode: kode || `K${nama.replace(/[^0-9A-Z]/gi, '')}`,
              nama,
              tingkat: Number(r['Tingkat (1-6 / kosong untuk ekskul)'] || 1),
              fase: (r['Fase (Fase A / Fase B / Fase C)'] || 'Fase A') as any,
              ruang: String(r['Ruang / Tempat'] || `Ruang ${nama}`),
              kuota: Number(r['Kuota'] || 28)
            });
          }
          count++;
        }
        setImportSummary(`Berhasil mengimpor ${count} rombel & ekstrakurikuler dari Excel.`);
        showNotification(`${count} data kelas & ekskul berhasil diimpor.`);
      } else if (inputSubTab === 'guru' || inputSubTab === 'kepegawaian') {
        let count = 0;
        const isGuruTab = inputSubTab === 'guru';
        for (const r of rows) {
          const nama = String(r['Nama Lengkap'] || '');
          if (!nama) continue;
          addTeacherStaff({
            nip: String(r['NIP (Isi - jika honorer)'] || r['NIP (Isi - jika non-PNS)'] || '-'),
            nuptk: r['NUPTK'] ? String(r['NUPTK']) : undefined,
            namaLengkap: nama,
            gelar: r['Gelar'] ? String(r['Gelar']) : undefined,
            jenisKelamin: r['Jenis Kelamin (L/P)'] === 'P' ? 'P' : 'L',
            kategori: isGuruTab ? 'guru' : 'kepegawaian',
            jabatan: (r['Jabatan'] || (isGuruTab ? 'Guru Kelas' : 'Tenaga Administrasi (TU)')) as StaffRole,
            statusKepegawaian: (r['Status Kepegawaian (PNS/PPPK/Honorer/GTT)'] || r['Status Kepegawaian (PNS/PPPK/Honorer/PTT)'] || 'Honorer') as EmploymentStatus,
            pendidikanTerakhir: String(r['Pendidikan Terakhir'] || 'S1'),
            noHp: String(r['No HP (WhatsApp)'] || '08123456789'),
            email: r['Email'] ? String(r['Email']) : undefined,
            alamat: String(r['Alamat'] || 'Klapanunggal, Bogor'),
            statusKerja: 'aktif',
            tmtKerja: String(r['TMT Kerja (YYYY-MM-DD)'] || '2024-01-01')
          });
          count++;
        }
        setImportSummary(`Berhasil mengimpor ${count} data ${isGuruTab ? 'guru' : 'staf kepegawaian'}.`);
        showNotification(`${count} data pendidik/pegawai berhasil diimpor.`);
      }
    } catch (err: any) {
      alert(`Gagal memproses file Excel: ${err?.message || 'Format tidak valid'}`);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Teachers list for dropdown
  const guruList = teachersStaff.filter(t => t.kategori === 'guru');

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-900 text-white rounded-xl shadow-lg border border-emerald-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{successToast}</span>
        </div>
      )}

      {/* Header & Sub-Tab Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <SchoolLogo size="lg" showBorder={true} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800">
                  Formulir & Import Data
                </span>
                <span className="text-xs text-slate-400">NPSN: 20200352</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Menu Input Data Terpadu
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Input manual formulir Dapodik dan sistem import template Excel (.xlsx) dengan 10 data dummy
              </p>
            </div>
          </div>

          {/* Mode Switch: Manual Form vs Import Excel */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0">
            <button
              onClick={() => setActiveInputMode('manual')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeInputMode === 'manual'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Formulir Manual
            </button>
            <button
              onClick={() => setActiveInputMode('import')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeInputMode === 'import'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* 4 Tabs: Kelas & Ekskul, Siswa, Guru, Kepegawaian */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto pb-1">
          <button
            onClick={() => setInputSubTab('kelas-ekskul')}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              inputSubTab === 'kelas-ekskul'
                ? 'bg-blue-900 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <School className="w-4 h-4" />
            <span>1. Tab Kelas & Ekskul</span>
          </button>

          <button
            onClick={() => setInputSubTab('siswa')}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              inputSubTab === 'siswa'
                ? 'bg-blue-900 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>2. Tab Input Siswa</span>
          </button>

          <button
            onClick={() => setInputSubTab('guru')}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              inputSubTab === 'guru'
                ? 'bg-blue-900 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>3. Tab Input Guru</span>
          </button>

          <button
            onClick={() => setInputSubTab('kepegawaian')}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              inputSubTab === 'kepegawaian'
                ? 'bg-blue-900 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>4. Tab Input Kepegawaian (TU)</span>
          </button>
        </div>
      </div>

      {/* IMPORT EXCEL PANEL */}
      {activeInputMode === 'import' && (
        <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                Sistem Import File Excel (.xlsx)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Format file resmi Excel dengan 10 data dummy realistis siap diunggah.
              </p>
            </div>

            {/* Template Download Buttons according to active tab */}
            <div className="flex flex-wrap items-center gap-2">
              {inputSubTab === 'kelas-ekskul' && (
                <button
                  onClick={generateClassesTemplateExcel}
                  className="px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Template Kelas & Ekskul (.xlsx)</span>
                </button>
              )}

              {inputSubTab === 'siswa' && (
                <>
                  <button
                    onClick={() => generateStudentsTemplateExcel(false)}
                    className="px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Template Siswa Reguler (.xlsx)</span>
                  </button>
                  <button
                    onClick={() => generateStudentsTemplateExcel(true)}
                    className="px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Template Siswa Pindahan (.xlsx)</span>
                  </button>
                </>
              )}

              {inputSubTab === 'guru' && (
                <button
                  onClick={generateTeachersTemplateExcel}
                  className="px-3 py-2 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Template Guru (.xlsx)</span>
                </button>
              )}

              {inputSubTab === 'kepegawaian' && (
                <button
                  onClick={generateStaffTemplateExcel}
                  className="px-3 py-2 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Template Pegawai TU (.xlsx)</span>
                </button>
              )}
            </div>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-blue-50/20 transition-colors">
            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-900">
              Pilih atau Tarik File Excel (.xlsx / .xls) ke Sini
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              File akan diverifikasi otomatis. Untuk siswa, NISN akan diperiksa agar tidak terjadi duplikasi ID di database sekolah.
            </p>

            <div className="mt-4">
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs transition-colors">
                <span>Pilih Berkas Excel</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {importSummary && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{importSummary}</span>
            </div>
          )}
        </div>
      )}

      {/* MANUAL FORM: TAB 1 - KELAS & EKSKUL */}
      {activeInputMode === 'manual' && inputSubTab === 'kelas-ekskul' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Input Data Kelas & Ekstrakurikuler</h2>
              <p className="text-xs text-slate-500">Tersedia 2 kategori: Rombongan Belajar Utama dan Ekstrakurikuler Sekolah</p>
            </div>

            {/* Type Switch */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setClassFormType('utama')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  classFormType === 'utama' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                Kelas Utama (Rombel)
              </button>
              <button
                type="button"
                onClick={() => setClassFormType('ekskul')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  classFormType === 'ekskul' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                Ekstrakurikuler
              </button>
            </div>
          </div>

          <form onSubmit={handleClassSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kode {classFormType === 'utama' ? 'Kelas' : 'Ekskul'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={classFormType === 'utama' ? 'Contoh: K1A' : 'Contoh: EKS-01'}
                  value={classKode}
                  onChange={(e) => setClassKode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama {classFormType === 'utama' ? 'Kelas' : 'Ekstrakurikuler'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={classFormType === 'utama' ? 'Contoh: Kelas 1C' : 'Contoh: Silat Tapak Suci'}
                  value={classNama}
                  onChange={(e) => setClassNama(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {classFormType === 'utama' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tingkat Kelas</label>
                    <select
                      value={classTingkat}
                      onChange={(e) => setClassTingkat(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    >
                      <option value={1}>Kelas 1 (Satu)</option>
                      <option value={2}>Kelas 2 (Dua)</option>
                      <option value={3}>Kelas 3 (Tiga)</option>
                      <option value={4}>Kelas 4 (Empat)</option>
                      <option value={5}>Kelas 5 (Lima)</option>
                      <option value={6}>Kelas 6 (Enam)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Fase Kurikulum Merdeka</label>
                    <select
                      value={classFase}
                      onChange={(e) => setClassFase(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    >
                      <option value="Fase A">Fase A (Kelas 1 - 2)</option>
                      <option value="Fase B">Fase B (Kelas 3 - 4)</option>
                      <option value="Fase C">Fase C (Kelas 5 - 6)</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Kegiatan</label>
                    <select
                      value={ekskulKategori}
                      onChange={(e) => setEkskulKategori(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    >
                      <option value="Wajib / Kepanduan">Wajib / Kepanduan</option>
                      <option value="Olahraga">Olahraga</option>
                      <option value="Bela Diri">Bela Diri</option>
                      <option value="Seni & Budaya">Seni & Budaya</option>
                      <option value="Keagamaan">Keagamaan</option>
                      <option value="Kesehatan & PMR">Kesehatan & PMR</option>
                      <option value="Akademik & Sains">Akademik & Sains</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Jadwal Pelaksanaan</label>
                    <input
                      type="text"
                      placeholder="Contoh: Jumat, 14.00 - 15.30"
                      value={ekskulJadwal}
                      onChange={(e) => setEkskulJadwal(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ruangan / Tempat</label>
                <input
                  type="text"
                  placeholder="Contoh: Gedung A - R105"
                  value={classRuang}
                  onChange={(e) => setClassRuang(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kapasitas / Kuota Siswa</label>
                <input
                  type="number"
                  min={5}
                  max={150}
                  value={classKuota}
                  onChange={(e) => setClassKuota(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {classFormType === 'utama' ? 'Wali Kelas' : 'Guru Pembina'} (Diambil dari Data Guru)
                </label>
                <select
                  value={classWaliId}
                  onChange={(e) => setClassWaliId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="">-- Belum Ditentukan (Kosong) --</option>
                  {guruList.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.namaLengkap}{g.gelar ? ', ' + g.gelar : ''} ({g.jabatan})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                + Simpan {classFormType === 'utama' ? 'Kelas Rombel' : 'Ekstrakurikuler'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MANUAL FORM: TAB 2 - SISWA */}
      {activeInputMode === 'manual' && inputSubTab === 'siswa' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
          {/* Header & Regular vs Transfer Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-700" />
                Formulir Pendaftaran Siswa
              </h2>
              <p className="text-xs text-slate-500">
                Pendaftaran siswa baru. NISN bertindak sebagai ID unik nasional.
              </p>
            </div>

            {/* Pilihan Siswa Baru Pindahan vs Reguler */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setStudentFormMode('reguler')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  studentFormMode === 'reguler'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Siswa Baru Reguler
              </button>
              <button
                type="button"
                onClick={() => setStudentFormMode('pindahan')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  studentFormMode === 'pindahan'
                    ? 'bg-amber-500 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Siswa Baru Pindahan</span>
                <span className="text-[10px] bg-black/20 px-1 py-0.2 rounded">Khusus</span>
              </button>
            </div>
          </div>

          {/* Form Context Notice */}
          <div className="flex items-start gap-2.5 p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900">
            <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Aturan Pengisian:</strong> NISN bersifat unik & mutlak. Jika nomor NISN sudah terdaftar, sistem akan otomatis menolak dan memunculkan pop-up pemberitahuan. Ekskul dikelola di menu <em>Manajemen Kelas</em>. Penghapusan data siswa juga hanya diperbolehkan melalui menu <em>Manajemen Kelas</em> demi keamanan data.
            </div>
          </div>

          <form onSubmit={handleStudentSubmit} className="space-y-4">
            {/* Conditional Transfer Section */}
            {studentFormMode === 'pindahan' && (
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-amber-700" />
                  Informasi Khusus Siswa Baru Pindahan
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Asal Sekolah *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: SDN Cibubur 01 Pagi"
                      value={sAsalSekolah}
                      onChange={(e) => setSAsalSekolah(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Pindah Masuk *</label>
                    <input
                      type="date"
                      required
                      value={sTanggalPindah}
                      onChange={(e) => setSTanggalPindah(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Surat Pindah</label>
                    <input
                      type="text"
                      placeholder="Contoh: 421.2/091/SDN-01/2026"
                      value={sNoSuratPindah}
                      onChange={(e) => setSNoSuratPindah(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Alasan Pindah</label>
                    <input
                      type="text"
                      placeholder="Contoh: Mengikuti domisili orang tua"
                      value={sAlasanPindah}
                      onChange={(e) => setSAlasanPindah(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Standard Student Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* NISN (ID unik) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NISN (Wajib & ID Unik) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="10 digit nomor NISN unik"
                  value={sNisn}
                  onChange={(e) => setSNisn(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 font-semibold"
                />
              </div>

              {/* NIS */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">NIS Sekolah *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 26055"
                  value={sNis}
                  onChange={(e) => setSNis(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap sesuai akta kelahiran"
                  value={sNama}
                  onChange={(e) => setSNama(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Tempat Lahir */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tempat Lahir</label>
                <input
                  type="text"
                  placeholder="Contoh: Bogor"
                  value={sTempatLahir}
                  onChange={(e) => setSTempatLahir(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Lahir *</label>
                <input
                  type="date"
                  required
                  value={sTanggalLahir}
                  onChange={(e) => setSTanggalLahir(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin *</label>
                <select
                  value={sJenisKelamin}
                  onChange={(e) => setSJenisKelamin(e.target.value as Gender)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>

              {/* Agama */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Agama *</label>
                <select
                  value={sAgama}
                  onChange={(e) => setSAgama(e.target.value as Religion)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="Islam">Islam</option>
                  <option value="Kristen">Kristen Protestan</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Khonghucu">Khonghucu</option>
                </select>
              </div>

              {/* NIK */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">NIK (Nomor Induk Kependudukan)</label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="16 digit NIK KK siswa"
                  value={sNik}
                  onChange={(e) => setSNik(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Kelas Tujuan / Penempatan (diambil dari daftar kelas) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {studentFormMode === 'pindahan' ? 'Kelas Tujuan Pindah *' : 'Penempatan Rombel Kelas *'}
                </label>
                <select
                  required
                  value={sKelasId}
                  onChange={(e) => setSKelasId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nama} (Kuota: {c.kuota} anak - {c.ruang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Alamat */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Tempat Tinggal</label>
                <input
                  type="text"
                  placeholder="Contoh: Kp. Nambo RT 02/03 Desa Nambo Kec. Klapanunggal"
                  value={sAlamat}
                  onChange={(e) => setSAlamat(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Tinggi Badan (Optional) */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Tinggi Badan (cm) <span className="text-slate-400 font-normal">Optional</span>
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 120"
                  value={sTinggi}
                  onChange={(e) => setSTinggi(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Berat Badan (Optional) */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Berat Badan (kg) <span className="text-slate-400 font-normal">Optional</span>
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 22"
                  value={sBerat}
                  onChange={(e) => setSBerat(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs text-slate-500 italic">
                * Pastikan data sesuai dokumen akta kelahiran / kartu keluarga.
              </span>

              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>+ Simpan Data Siswa</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MANUAL FORM: TAB 3 - GURU */}
      {activeInputMode === 'manual' && inputSubTab === 'guru' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
          <div className="pb-4 mb-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Input Data Guru & Tenaga Pendidik</h2>
            <p className="text-xs text-slate-500">Pendaftaran guru kelas, guru mata pelajaran, dan wali kelas</p>
          </div>

          <form onSubmit={handleTeacherSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">NIP (Isi '-' jika Honorer)</label>
                <input
                  type="text"
                  placeholder="18 digit NIP atau tanda '-'"
                  value={gNip}
                  onChange={(e) => setGNip(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">NUPTK</label>
                <input
                  type="text"
                  placeholder="16 digit NUPTK"
                  value={gNuptk}
                  onChange={(e) => setGNuptk(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Guru *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama tanpa gelar"
                  value={gNama}
                  onChange={(e) => setGNama(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gelar Akademik</label>
                <input
                  type="text"
                  placeholder="Contoh: S.Pd.SD / S.Pd., M.M."
                  value={gGelar}
                  onChange={(e) => setGGelar(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                <select
                  value={gJenisKelamin}
                  onChange={(e) => setGJenisKelamin(e.target.value as Gender)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jabatan / Mapel Utama</label>
                <select
                  value={gJabatan}
                  onChange={(e) => setGJabatan(e.target.value as StaffRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="Guru Kelas">Guru Kelas (Tematik)</option>
                  <option value="Guru PAI">Guru Pendidikan Agama Islam (PAI)</option>
                  <option value="Guru PJOK">Guru PJOK (Olahraga)</option>
                  <option value="Guru Bahasa Sunda">Guru Bahasa Sunda (Mulok)</option>
                  <option value="Guru Bahasa Inggris">Guru Bahasa Inggris</option>
                  <option value="Kepala Sekolah">Kepala Sekolah</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status Kepegawaian</label>
                <select
                  value={gStatusPegawai}
                  onChange={(e) => setGStatusPegawai(e.target.value as EmploymentStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="PNS">PNS (Pegawai Negeri Sipil)</option>
                  <option value="PPPK">PPPK</option>
                  <option value="Honorer">Guru Honorer Daerah</option>
                  <option value="GTT">GTT (Guru Tidak Tetap)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pendidikan Terakhir</label>
                <input
                  type="text"
                  placeholder="Contoh: S1 PGSD Universitas Pakuan"
                  value={gPendidikan}
                  onChange={(e) => setGPendidikan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp / HP</label>
                <input
                  type="text"
                  placeholder="08xxxxxxxxxx"
                  value={gNoHp}
                  onChange={(e) => setGNoHp(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Belajar.id / Pribadi</label>
                <input
                  type="email"
                  placeholder="nama@guru.sd.belajar.id"
                  value={gEmail}
                  onChange={(e) => setGEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">TMT Kerja</label>
                <input
                  type="date"
                  value={gTmt}
                  onChange={(e) => setGTmt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                + Simpan Data Guru
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MANUAL FORM: TAB 4 - KEPEGAWAIAN (TU / STAF) */}
      {activeInputMode === 'manual' && inputSubTab === 'kepegawaian' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs">
          <div className="pb-4 mb-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Input Data Kepegawaian (Selain Guru)</h2>
            <p className="text-xs text-slate-500">Pendaftaran staf Tata Usaha, Operator Dapodik, Perpustakaan, Satpam, dan Penjaga Sekolah</p>
          </div>

          <form onSubmit={handleStaffSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">NIP / NIK Pegawai</label>
                <input
                  type="text"
                  placeholder="NIP atau NIK KTP"
                  value={sNipTu}
                  onChange={(e) => setSNipTu(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama pegawai"
                  value={sNamaTu}
                  onChange={(e) => setSNamaTu(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gelar (Jika ada)</label>
                <input
                  type="text"
                  placeholder="Contoh: A.Md. / S.Kom."
                  value={sGelarTu}
                  onChange={(e) => setSGelarTu(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                <select
                  value={sJenisKelaminTu}
                  onChange={(e) => setSJenisKelaminTu(e.target.value as Gender)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tugas / Jabatan *</label>
                <select
                  value={sJabatanTu}
                  onChange={(e) => setSJabatanTu(e.target.value as StaffRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                >
                  <option value="Tenaga Administrasi (TU)">Tenaga Administrasi (TU)</option>
                  <option value="Operator Dapodik">Operator Sekolah / Dapodik</option>
                  <option value="Petugas Perpustakaan">Petugas Perpustakaan</option>
                  <option value="Penjaga Sekolah">Penjaga Sekolah</option>
                  <option value="Petugas Kebersihan">Petugas Kebersihan</option>
                  <option value="Satpam/Keamanan">Satpam / Petugas Keamanan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status Kepegawaian</label>
                <select
                  value={sStatusPegawaiTu}
                  onChange={(e) => setSStatusPegawaiTu(e.target.value as EmploymentStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="Honorer">Honorer Sekolah</option>
                  <option value="PTT">PTT (Pegawai Tidak Tetap)</option>
                  <option value="PPPK">PPPK</option>
                  <option value="PNS">PNS</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pendidikan Terakhir</label>
                <input
                  type="text"
                  placeholder="Contoh: SMA / D3 / S1"
                  value={sPendidikanTu}
                  onChange={(e) => setSPendidikanTu(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">No. HP (WhatsApp)</label>
                <input
                  type="text"
                  placeholder="08xxxxxxxxxx"
                  value={sNoHpTu}
                  onChange={(e) => setSNoHpTu(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">TMT Kerja</label>
                <input
                  type="date"
                  value={sTmtTu}
                  onChange={(e) => setSTmtTu(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                + Simpan Pegawai TU
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
