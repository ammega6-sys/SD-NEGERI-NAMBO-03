export type Gender = 'L' | 'P';

export type Religion = 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Khonghucu';

export type StudentStatus = 'aktif' | 'pindahan_masuk' | 'mutasi_keluar' | 'berhenti_do' | 'lulus';

export type EmploymentStatus = 'PNS' | 'PPPK' | 'Honorer' | 'GTT' | 'PTT';

export type StaffRole = 
  | 'Kepala Sekolah'
  | 'Guru Kelas'
  | 'Guru PAI'
  | 'Guru PJOK'
  | 'Guru Bahasa Sunda'
  | 'Guru Bahasa Inggris'
  | 'Tenaga Administrasi (TU)'
  | 'Operator Dapodik'
  | 'Petugas Perpustakaan'
  | 'Penjaga Sekolah'
  | 'Petugas Kebersihan'
  | 'Satpam/Keamanan';

export interface Student {
  id: string; // matches NISN
  nisn: string;
  nis: string;
  namaLengkap: string;
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD
  agama: Religion;
  jenisKelamin: Gender;
  nik: string;
  alamat: string;
  tinggiBadan?: number; // cm (optional)
  beratBadan?: number; // kg (optional)
  kelasId: string; // References ClassRoom.id
  status: StudentStatus;
  
  // Specific for transfer student ("Siswa Baru Pindahan")
  isPindahan?: boolean;
  asalSekolah?: string;
  tanggalPindah?: string;
  noSuratPindah?: string;
  alasanPindah?: string;

  // Mutasi keluar / DO details
  tanggalKeluar?: string;
  tujuanMutasi?: string;
  alasanKeluar?: string;

  // PIP (Program Indonesia Pintar)
  isPip: boolean;
  noKip?: string;
  tahapPip?: string;
  nominalPip?: number;

  // Extracurriculars assigned (managed in Manajemen Kelas)
  ekskulIds?: string[];

  createdAt: string;
  updatedAt: string;
}

export type ClassType = 'utama' | 'ekskul';

export interface ClassRoom {
  id: string; // e.g. "k-1a", "k-2b"
  kode: string;
  nama: string; // e.g. "Kelas 1A", "Kelas 2B"
  tingkat: number; // 1 to 6
  fase: 'Fase A' | 'Fase B' | 'Fase C';
  waliKelasGuruId?: string; // Teacher id
  kuota: number;
  ruang: string;
}

export interface Extracurricular {
  id: string;
  kode: string;
  nama: string; // e.g. "Pramuka", "Silat Tapak Suci", "Tari Tradisional Sunda", "Futsal"
  kategori: string;
  pembinaGuruId?: string; // Teacher or Staff id
  jadwalHari: string; // e.g. "Jumat 14.00 - 16.00"
  tempat: string;
  kuota: number;
  keterangan?: string;
}

export interface TeacherStaff {
  id: string; // NIP or generated code
  nip: string; // '-' if honorer without NIP
  nuptk?: string;
  namaLengkap: string;
  gelar?: string;
  jenisKelamin: Gender;
  kategori: 'guru' | 'kepegawaian'; // guru vs TU/staff
  jabatan: StaffRole;
  statusKepegawaian: EmploymentStatus;
  pendidikanTerakhir: string;
  noHp: string;
  email?: string;
  alamat?: string;
  statusKerja: 'aktif' | 'cuti' | 'non_aktif' | 'pensiun';
  tmtKerja: string; // Terhitung Mulai Tanggal
  createdAt: string;
}

export interface TeachingHour {
  id: string;
  guruId: string;
  mataPelajaran: string;
  kelasId: string;
  jamTatapMuka: number; // JTM per minggu (e.g. 4 JP)
  tugasTambahan?: string; // e.g. "Wali Kelas 3A (+2 JP)", "Pembina Pramuka (+2 JP)"
  jamTugasTambahan?: number;
  tahunAjaran: string; // e.g. "2026/2027"
  semester: 'Ganjil' | 'Genap';
}

export interface ReportFilterOptions {
  bulan?: string; // YYYY-MM
  tahunAjaran?: string;
  statusList: StudentStatus[];
  isPipOnly?: boolean;
  kelasIdList: string[];
  agamaList: Religion[];
  jenisKelaminList: Gender[];
  format: 'pdf' | 'excel';
  judulLaporan?: string;
}

export type AttendanceStatus = 'H' | 'S' | 'I' | 'A';

export interface StudentAttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
  keterangan?: string;
}

export interface DailyAttendance {
  id: string; // e.g. "k-1a_2026-10-15"
  tanggal: string; // YYYY-MM-DD
  kelasId: string;
  guruPengisiId?: string;
  entries: StudentAttendanceEntry[];
  catatanHarian?: string;
  updatedAt: string;
}

export interface AgeCategoryCount {
  ageLabel: string; // "< 6 Tahun", "6 Tahun", "7 Tahun", "8 Tahun", "9 Tahun", "10 Tahun", "11 Tahun", "12 Tahun", "> 12 Tahun"
  maleCount: number;
  femaleCount: number;
  totalCount: number;
}

export interface MonthlyClassAgeRecap {
  kelasId: string;
  bulan: string; // YYYY-MM
  catatan?: string;
  verifiedByGuruId?: string;
  ageCounts: Record<string, { male: number; female: number }>;
  updatedAt: string;
}

