import * as XLSX from 'xlsx';
import { Student, ClassRoom, TeacherStaff, Religion, Gender, EmploymentStatus, StaffRole } from '../types';

/**
 * Downloads a binary buffer as an Excel file
 */
export function downloadWorkbook(workbook: XLSX.WorkBook, fileName: string) {
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Template 1: Template Excel Kelas & Ekskul (10 dummy data)
 */
export function generateClassesTemplateExcel() {
  const data = [
    {
      'Tipe (utama / ekskul)': 'utama',
      'Kode': 'K1A',
      'Nama Kelas / Ekskul': 'Kelas 1A',
      'Tingkat (1-6 / kosong untuk ekskul)': 1,
      'Fase (Fase A / Fase B / Fase C)': 'Fase A',
      'Ruang / Tempat': 'Gedung A - R101',
      'Kuota': 28,
      'Keterangan / Jadwal': 'Kelas tatap muka pagi'
    },
    {
      'Tipe (utama / ekskul)': 'utama',
      'Kode': 'K1B',
      'Nama Kelas / Ekskul': 'Kelas 1B',
      'Tingkat (1-6 / kosong untuk ekskul)': 1,
      'Fase (Fase A / Fase B / Fase C)': 'Fase A',
      'Ruang / Tempat': 'Gedung A - R102',
      'Kuota': 28,
      'Keterangan / Jadwal': 'Kelas tatap muka pagi'
    },
    {
      'Tipe (utama / ekskul)': 'utama',
      'Kode': 'K2A',
      'Nama Kelas / Ekskul': 'Kelas 2A',
      'Tingkat (1-6 / kosong untuk ekskul)': 2,
      'Fase (Fase A / Fase B / Fase C)': 'Fase A',
      'Ruang / Tempat': 'Gedung A - R103',
      'Kuota': 28,
      'Keterangan / Jadwal': 'Kelas tatap muka pagi'
    },
    {
      'Tipe (utama / ekskul)': 'utama',
      'Kode': 'K2B',
      'Nama Kelas / Ekskul': 'Kelas 2B',
      'Tingkat (1-6 / kosong untuk ekskul)': 2,
      'Fase (Fase A / Fase B / Fase C)': 'Fase A',
      'Ruang / Tempat': 'Gedung A - R104',
      'Kuota': 28,
      'Keterangan / Jadwal': 'Kelas tatap muka pagi'
    },
    {
      'Tipe (utama / ekskul)': 'utama',
      'Kode': 'K3A',
      'Nama Kelas / Ekskul': 'Kelas 3A',
      'Tingkat (1-6 / kosong untuk ekskul)': 3,
      'Fase (Fase A / Fase B / Fase C)': 'Fase B',
      'Ruang / Tempat': 'Gedung B - R201',
      'Kuota': 30,
      'Keterangan / Jadwal': 'Kelas tatap muka pagi'
    },
    {
      'Tipe (utama / ekskul)': 'ekskul',
      'Kode': 'EKS-01',
      'Nama Kelas / Ekskul': 'Pramuka Penggalang & Siaga',
      'Tingkat (1-6 / kosong untuk ekskul)': '',
      'Fase (Fase A / Fase B / Fase C)': '',
      'Ruang / Tempat': 'Lapangan Utama SDN Nambo 03',
      'Kuota': 120,
      'Keterangan / Jadwal': 'Jumat, 13.30 - 15.30'
    },
    {
      'Tipe (utama / ekskul)': 'ekskul',
      'Kode': 'EKS-02',
      'Nama Kelas / Ekskul': 'Pencak Silat Tapak Suci',
      'Tingkat (1-6 / kosong untuk ekskul)': '',
      'Fase (Fase A / Fase B / Fase C)': '',
      'Ruang / Tempat': 'Aula Serbaguna',
      'Kuota': 40,
      'Keterangan / Jadwal': 'Sabtu, 08.00 - 10.00'
    },
    {
      'Tipe (utama / ekskul)': 'ekskul',
      'Kode': 'EKS-03',
      'Nama Kelas / Ekskul': 'Tari Tradisional Sunda',
      'Tingkat (1-6 / kosong untuk ekskul)': '',
      'Fase (Fase A / Fase B / Fase C)': '',
      'Ruang / Tempat': 'Ruang Kesenian',
      'Kuota': 30,
      'Keterangan / Jadwal': 'Kamis, 14.00 - 15.30'
    },
    {
      'Tipe (utama / ekskul)': 'ekskul',
      'Kode': 'EKS-04',
      'Nama Kelas / Ekskul': 'Futsal Junior Nambo',
      'Tingkat (1-6 / kosong untuk ekskul)': '',
      'Fase (Fase A / Fase B / Fase C)': '',
      'Ruang / Tempat': 'Lapangan Olahraga',
      'Kuota': 35,
      'Keterangan / Jadwal': 'Rabu, 15.30 - 17.00'
    },
    {
      'Tipe (utama / ekskul)': 'ekskul',
      'Kode': 'EKS-05',
      'Nama Kelas / Ekskul': 'Sains Club & Robotika Dasar',
      'Tingkat (1-6 / kosong untuk ekskul)': '',
      'Fase (Fase A / Fase B / Fase C)': '',
      'Ruang / Tempat': 'Laboratorium Komputer',
      'Kuota': 25,
      'Keterangan / Jadwal': 'Rabu, 14.00 - 15.30'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template_Kelas_Ekskul');
  downloadWorkbook(wb, 'Template_Input_Kelas_Ekskul_SDN_Nambo_03.xlsx');
}

/**
 * Template 2: Template Excel Siswa Reguler (10 dummy data)
 */
export function generateStudentsTemplateExcel(isPindahan: boolean = false) {
  const dummyRegular = [
    {
      'NISN (Wajib & Unik)': '0165991001',
      'NIS': '26101',
      'Nama Lengkap': 'Arya Satria Yudha',
      'Tempat Lahir': 'Bogor',
      'Tanggal Lahir (YYYY-MM-DD)': '2019-02-14',
      'Agama': 'Islam',
      'Jenis Kelamin (L/P)': 'L',
      'NIK': '3201081402190001',
      'Alamat': 'Kp. Nambo RT 01/01 Klapanunggal',
      'Kode Kelas': 'Kelas 1A',
      'Tinggi Badan (cm)': 118,
      'Berat Badan (kg)': 21
    },
    {
      'NISN (Wajib & Unik)': '0165991002',
      'NIS': '26102',
      'Nama Lengkap': 'Alya Zahra Salsabila',
      'Tempat Lahir': 'Bogor',
      'Tanggal Lahir (YYYY-MM-DD)': '2019-04-18',
      'Agama': 'Islam',
      'Jenis Kelamin (L/P)': 'P',
      'NIK': '3201085804190002',
      'Alamat': 'Jl. Mayor Oking No. 15',
      'Kode Kelas': 'Kelas 1A',
      'Tinggi Badan (cm)': 116,
      'Berat Badan (kg)': 19
    },
    {
      'NISN (Wajib & Unik)': '0165991003',
      'NIS': '26103',
      'Nama Lengkap': 'Gabriel Alexander Siregar',
      'Tempat Lahir': 'Medan',
      'Tanggal Lahir (YYYY-MM-DD)': '2019-07-22',
      'Agama': 'Kristen',
      'Jenis Kelamin (L/P)': 'L',
      'NIK': '3201082207190003',
      'Alamat': 'Perum Kahuripan Indah Blok F2',
      'Kode Kelas': 'Kelas 1A',
      'Tinggi Badan (cm)': 120,
      'Berat Badan (kg)': 22
    },
    {
      'NISN (Wajib & Unik)': '0165991004',
      'NIS': '26104',
      'Nama Lengkap': 'Bella Novita Anggraini',
      'Tempat Lahir': 'Cirebon',
      'Tanggal Lahir (YYYY-MM-DD)': '2019-11-05',
      'Agama': 'Islam',
      'Jenis Kelamin (L/P)': 'P',
      'NIK': '3201084511190004',
      'Alamat': 'Kp. Babakan RT 03/02',
      'Kode Kelas': 'Kelas 1B',
      'Tinggi Badan (cm)': 117,
      'Berat Badan (kg)': 20
    },
    {
      'NISN (Wajib & Unik)': '0165991005',
      'NIS': '26105',
      'Nama Lengkap': 'Daffa Izzan Maulana',
      'Tempat Lahir': 'Bogor',
      'Tanggal Lahir (YYYY-MM-DD)': '2019-01-30',
      'Agama': 'Islam',
      'Jenis Kelamin (L/P)': 'L',
      'NIK': '3201083001190005',
      'Alamat': 'Kp. Cikikil RT 01/03',
      'Kode Kelas': 'Kelas 1B',
      'Tinggi Badan (cm)': 119,
      'Berat Badan (kg)': 21
    },
    {
      'NISN (Wajib & Unik)': '0165991006',
      'NIS': '26106',
      'Nama Lengkap': 'Maria Theresa Oktavia',
      'Tempat Lahir': 'Jakarta',
      'Tanggal Lahir (YYYY-MM-DD)': '2019-10-12',
      'Agama': 'Katolik',
      'Jenis Kelamin (L/P)': 'P',
      'NIK': '3201085210190006',
      'Alamat': 'Perum Grand Kahuripan Cluster Merapi',
      'Kode Kelas': 'Kelas 1B',
      'Tinggi Badan (cm)': 115,
      'Berat Badan (kg)': 18
    },
    {
      'NISN (Wajib & Unik)': '0165991007',
      'NIS': '26107',
      'Nama Lengkap': 'I Wayan Gede Dharma',
      'Tempat Lahir': 'Bogor',
      'Tanggal Lahir (YYYY-MM-DD)': '2019-08-08',
      'Agama': 'Hindu',
      'Jenis Kelamin (L/P)': 'L',
      'NIK': '3201080808190007',
      'Alamat': 'Perum Klapanunggal Asri Blok A8',
      'Kode Kelas': 'Kelas 2A',
      'Tinggi Badan (cm)': 122,
      'Berat Badan (kg)': 23
    },
    {
      'NISN (Wajib & Unik)': '0165991008',
      'NIS': '26108',
      'Nama Lengkap': 'Fauziah Hanum',
      'Tempat Lahir': 'Bogor',
      'Tanggal Lahir (YYYY-MM-DD)': '2019-03-27',
      'Agama': 'Islam',
      'Jenis Kelamin (L/P)': 'P',
      'NIK': '3201086703190008',
      'Alamat': 'Desa Nambo RT 02/01',
      'Kode Kelas': 'Kelas 2A',
      'Tinggi Badan (cm)': 121,
      'Berat Badan (kg)': 22
    },
    {
      'NISN (Wajib & Unik)': '0165991009',
      'NIS': '26109',
      'Nama Lengkap': 'Hansen Wijaya',
      'Tempat Lahir': 'Tangerang',
      'Tanggal Lahir (YYYY-MM-DD)': '2019-09-19',
      'Agama': 'Buddha',
      'Jenis Kelamin (L/P)': 'L',
      'NIK': '3201081909190009',
      'Alamat': 'Pertokoan Nambo Square No. 3',
      'Kode Kelas': 'Kelas 2B',
      'Tinggi Badan (cm)': 124,
      'Berat Badan (kg)': 24
    },
    {
      'NISN (Wajib & Unik)': '0165991010',
      'NIS': '26110',
      'Nama Lengkap': 'Nabila Syahrani',
      'Tempat Lahir': 'Bandung',
      'Tanggal Lahir (YYYY-MM-DD)': '2019-12-01',
      'Agama': 'Islam',
      'Jenis Kelamin (L/P)': 'P',
      'NIK': '3201084112190010',
      'Alamat': 'Kp. Lulut RT 03/01',
      'Kode Kelas': 'Kelas 2B',
      'Tinggi Badan (cm)': 120,
      'Berat Badan (kg)': 21
    }
  ];

  const dummyPindahan = [
    {
      'NISN (Wajib & Unik)': '0159981001',
      'NIS': '26201',
      'Nama Lengkap': 'Raihan Dwi Febrian',
      'Tempat Lahir': 'Bekasi',
      'Tanggal Lahir (YYYY-MM-DD)': '2018-02-10',
      'Agama': 'Islam',
      'Jenis Kelamin (L/P)': 'L',
      'NIK': '3201081002180011',
      'Alamat': 'Desa Nambo RT 01/02',
      'Kode Kelas Tujuan': 'Kelas 2A',
      'Asal Sekolah': 'SDN Aren Jaya 04 Bekasi Timur',
      'Tanggal Pindah (YYYY-MM-DD)': '2026-08-01',
      'Nomor Surat Pindah': '421.2/089/SDN-AJ4/2026',
      'Alasan Pindah': 'Mengikuti orang tua pindah kerja ke Klapanunggal',
      'Tinggi Badan (cm)': 125,
      'Berat Badan (kg)': 26
    },
    {
      'NISN (Wajib & Unik)': '0159981002',
      'NIS': '26202',
      'Nama Lengkap': 'Tiara Kusuma Dewi',
      'Tempat Lahir': 'Jakarta Selatan',
      'Tanggal Lahir (YYYY-MM-DD)': '2018-05-14',
      'Agama': 'Islam',
      'Jenis Kelamin (L/P)': 'P',
      'NIK': '3201085405180012',
      'Alamat': 'Perum Puri Klapanunggal B2',
      'Kode Kelas Tujuan': 'Kelas 2B',
      'Asal Sekolah': 'SDN Pasar Minggu 01 Pagi',
      'Tanggal Pindah (YYYY-MM-DD)': '2026-08-03',
      'Nomor Surat Pindah': '421.1/120/SDN-PM1/2026',
      'Alasan Pindah': 'Pindah domisili keluarga ke rumah pribadi',
      'Tinggi Badan (cm)': 123,
      'Berat Badan (kg)': 24
    },
    {
      'NISN (Wajib & Unik)': '0149981003',
      'NIS': '26203',
      'Nama Lengkap': 'Samuel Christian Hutapea',
      'Tempat Lahir': 'Medan',
      'Tanggal Lahir (YYYY-MM-DD)': '2017-09-08',
      'Agama': 'Kristen',
      'Jenis Kelamin (L/P)': 'L',
      'NIK': '3201080809170013',
      'Alamat': 'Grand Kahuripan Cluster Semeru C12',
      'Kode Kelas Tujuan': 'Kelas 3A',
      'Asal Sekolah': 'SD Swasta Methodist 2 Medan',
      'Tanggal Pindah (YYYY-MM-DD)': '2026-08-10',
      'Nomor Surat Pindah': '422/33/SD-MTH/VIII/2026',
      'Alasan Pindah': 'Penugasan dinas orang tua di PT Indocement Citeureup',
      'Tinggi Badan (cm)': 131,
      'Berat Badan (kg)': 30
    },
    {
      'NISN (Wajib & Unik)': '0149981004',
      'NIS': '26204',
      'Nama Lengkap': 'Putri Ayu Wandira',
      'Tempat Lahir': 'Sukabumi',
      'Tanggal Lahir (YYYY-MM-DD)': '2017-12-25',
      'Agama': 'Islam',
      'Jenis Kelamin (L/P)': 'P',
      'NIK': '3201086512170014',
      'Alamat': 'Kp. Babakan RT 04/01',
      'Kode Kelas Tujuan': 'Kelas 3B',
      'Asal Sekolah': 'SD Negeri 1 Cibadak Sukabumi',
      'Tanggal Pindah (YYYY-MM-DD)': '2026-08-15',
      'Nomor Surat Pindah': '421/045/SDN-1/CBD/2026',
      'Alasan Pindah': 'Tinggal bersama kakek dan nenek',
      'Tinggi Badan (cm)': 129,
      'Berat Badan (kg)': 28
    },
    {
      'NISN (Wajib & Unik)': '0139981005',
      'NIS': '26205',
      'Nama Lengkap': 'Gilang Ramadhan',
      'Tempat Lahir': 'Bogor',
      'Tanggal Lahir (YYYY-MM-DD)': '2016-06-18',
      'Agama': 'Islam',
      'Jenis Kelamin (L/P)': 'L',
      'NIK': '3201081806160015',
      'Alamat': 'Kp. Nambo RT 03/02',
      'Kode Kelas Tujuan': 'Kelas 4A',
      'Asal Sekolah': 'SDN Leuwinutug 02 Citeureup',
      'Tanggal Pindah (YYYY-MM-DD)': '2026-08-18',
      'Nomor Surat Pindah': '421.2/112/LWN-02/2026',
      'Alasan Pindah': 'Jarak rumah lebih dekat ke SDN Nambo 03',
      'Tinggi Badan (cm)': 136,
      'Berat Badan (kg)': 33
    },
    {
      'NISN (Wajib & Unik)': '0139981006',
      'NIS': '26206',
      'Nama Lengkap': 'Niken Salindri',
      'Tempat Lahir': 'Kediri',
      'Tanggal Lahir (YYYY-MM-DD)': '2016-10-04',
      'Agama': 'Islam',
      'Jenis Kelamin (L/P)': 'P',
      'NIK': '3201084410160016',
      'Alamat': 'Desa Lulut RT 02/03',
      'Kode Kelas Tujuan': 'Kelas 4B',
      'Asal Sekolah': 'SDN Pare 01 Kediri Jawa Timur',
      'Tanggal Pindah (YYYY-MM-DD)': '2026-08-20',
      'Nomor Surat Pindah': '421/78/SD-PARE/2026',
      'Alasan Pindah': 'Keluarga pindah domisili',
      'Tinggi Badan (cm)': 134,
      'Berat Badan (kg)': 32
    },
    {
      'NISN (Wajib & Unik)': '0129981007',
      'NIS': '26207',
      'Nama Lengkap': 'Alvin Jonathan Lim',
      'Tempat Lahir': 'Pontianak',
      'Tanggal Lahir (YYYY-MM-DD)': '2015-03-12',
      'Agama': 'Buddha',
      'Jenis Kelamin (L/P)': 'L',
      'NIK': '3201081203150017',
      'Alamat': 'Jl. Narogong KM 23 No. 8',
      'Kode Kelas Tujuan': 'Kelas 5A',
      'Asal Sekolah': 'SD Swasta Karya Mulia Pontianak',
      'Tanggal Pindah (YYYY-MM-DD)': '2026-08-22',
      'Nomor Surat Pindah': '098/KM-SD/VIII/2026',
      'Alasan Pindah': 'Orang tua ekspansi usaha ke Klapanunggal',
      'Tinggi Badan (cm)': 143,
      'Berat Badan (kg)': 37
    },
    {
      'NISN (Wajib & Unik)': '0129981008',
      'NIS': '26208',
      'Nama Lengkap': 'Syafira Azzahra',
      'Tempat Lahir': 'Padang',
      'Tanggal Lahir (YYYY-MM-DD)': '2015-08-29',
      'Agama': 'Islam',
      'Jenis Kelamin (L/P)': 'P',
      'NIK': '3201086908150018',
      'Alamat': 'Kp. Cikikil RT 03/01',
      'Kode Kelas Tujuan': 'Kelas 5B',
      'Asal Sekolah': 'SD Negeri 05 Padang Barat',
      'Tanggal Pindah (YYYY-MM-DD)': '2026-08-25',
      'Nomor Surat Pindah': '421.2/103/SDN05-PDG/2026',
      'Alasan Pindah': 'Ikut mutasi dinas orang tua',
      'Tinggi Badan (cm)': 141,
      'Berat Badan (kg)': 36
    },
    {
      'NISN (Wajib & Unik)': '0119981009',
      'NIS': '26209',
      'Nama Lengkap': 'Kadek Surya Kencana',
      'Tempat Lahir': 'Denpasar',
      'Tanggal Lahir (YYYY-MM-DD)': '2014-04-15',
      'Agama': 'Hindu',
      'Jenis Kelamin (L/P)': 'L',
      'NIK': '3201081504140019',
      'Alamat': 'Perum Grand Kahuripan Blok D4',
      'Kode Kelas Tujuan': 'Kelas 6A',
      'Asal Sekolah': 'SD Negeri 3 Sanur Denpasar',
      'Tanggal Pindah (YYYY-MM-DD)': '2026-09-01',
      'Nomor Surat Pindah': '421/081/SDN3-SNR/2026',
      'Alasan Pindah': 'Ikut kepindahan orang tua tugas dinas',
      'Tinggi Badan (cm)': 150,
      'Berat Badan (kg)': 43
    },
    {
      'NISN (Wajib & Unik)': '0119981010',
      'NIS': '26210',
      'Nama Lengkap': 'Melinda Anggraini',
      'Tempat Lahir': 'Semarang',
      'Tanggal Lahir (YYYY-MM-DD)': '2014-11-20',
      'Agama': 'Islam',
      'Jenis Kelamin (L/P)': 'P',
      'NIK': '3201086011140020',
      'Alamat': 'Desa Nambo RT 04/01',
      'Kode Kelas Tujuan': 'Kelas 6A',
      'Asal Sekolah': 'SDN Banyumanik 02 Semarang',
      'Tanggal Pindah (YYYY-MM-DD)': '2026-09-02',
      'Nomor Surat Pindah': '421.2/099/BYM2/2026',
      'Alasan Pindah': 'Orang tua bertugas di Klapanunggal',
      'Tinggi Badan (cm)': 149,
      'Berat Badan (kg)': 42
    }
  ];

  const data = isPindahan ? dummyPindahan : dummyRegular;
  const sheetName = isPindahan ? 'Template_Siswa_Pindahan' : 'Template_Siswa_Reguler';
  const fileName = isPindahan 
    ? 'Template_Input_Siswa_Pindahan_SDN_Nambo_03.xlsx' 
    : 'Template_Input_Siswa_Reguler_SDN_Nambo_03.xlsx';

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  downloadWorkbook(wb, fileName);
}

/**
 * Template 3: Template Excel Guru (10 dummy data)
 */
export function generateTeachersTemplateExcel() {
  const data = [
    {
      'NIP (Isi - jika honorer)': '198305102009011005',
      'NUPTK': '3456758660110023',
      'Nama Lengkap': 'Asep Saepullah',
      'Gelar': 'S.Pd.',
      'Jenis Kelamin (L/P)': 'L',
      'Jabatan': 'Guru Kelas',
      'Status Kepegawaian (PNS/PPPK/Honorer/GTT)': 'PNS',
      'Pendidikan Terakhir': 'S1 PGSD Unpak Bogor',
      'No HP (WhatsApp)': '081298765430',
      'Email': 'asep.saepullah@sdnambo03.sch.id',
      'Alamat': 'Jl. Raya Klapanunggal RT 02/03',
      'TMT Kerja (YYYY-MM-DD)': '2009-01-01'
    },
    {
      'NIP (Isi - jika honorer)': '198711152014022003',
      'NUPTK': '8901763664100088',
      'Nama Lengkap': 'Ratna Juwita',
      'Gelar': 'S.Pd.SD',
      'Jenis Kelamin (L/P)': 'P',
      'Jabatan': 'Guru Kelas',
      'Status Kepegawaian (PNS/PPPK/Honorer/GTT)': 'PNS',
      'Pendidikan Terakhir': 'S1 PGSD Universitas Terbuka',
      'No HP (WhatsApp)': '085712349988',
      'Email': 'ratna.juwita@sdnambo03.sch.id',
      'Alamat': 'Perum Puri Harmoni Blok D3',
      'TMT Kerja (YYYY-MM-DD)': '2014-02-01'
    },
    {
      'NIP (Isi - jika honorer)': '199104082022211004',
      'NUPTK': '1238768670130142',
      'Nama Lengkap': 'Ferry Ardiansyah',
      'Gelar': 'S.Pd.',
      'Jenis Kelamin (L/P)': 'L',
      'Jabatan': 'Guru PJOK',
      'Status Kepegawaian (PNS/PPPK/Honorer/GTT)': 'PPPK',
      'Pendidikan Terakhir': 'S1 PJKR UNJ',
      'No HP (WhatsApp)': '081389012399',
      'Email': 'ferry.pjok@sdnambo03.sch.id',
      'Alamat': 'Kp. Lulut RT 04/01',
      'TMT Kerja (YYYY-MM-DD)': '2022-07-01'
    },
    {
      'NIP (Isi - jika honorer)': '199308192023212009',
      'NUPTK': '9087765667220031',
      'Nama Lengkap': 'Nur Aini',
      'Gelar': 'S.Pd.I',
      'Jenis Kelamin (L/P)': 'P',
      'Jabatan': 'Guru PAI',
      'Status Kepegawaian (PNS/PPPK/Honorer/GTT)': 'PPPK',
      'Pendidikan Terakhir': 'S1 PAI UIN Syarif Hidayatullah',
      'No HP (WhatsApp)': '085698765400',
      'Email': 'nuraini.pai@sdnambo03.sch.id',
      'Alamat': 'Desa Nambo RT 03/02',
      'TMT Kerja (YYYY-MM-DD)': '2023-08-01'
    },
    {
      'NIP (Isi - jika honorer)': '-',
      'NUPTK': '5678769671230045',
      'Nama Lengkap': 'Indra Gunawan',
      'Gelar': 'S.Pd.',
      'Jenis Kelamin (L/P)': 'L',
      'Jabatan': 'Guru Kelas',
      'Status Kepegawaian (PNS/PPPK/Honorer/GTT)': 'Honorer',
      'Pendidikan Terakhir': 'S1 PGSD STKIP Kusumanegara',
      'No HP (WhatsApp)': '087812345611',
      'Email': 'indra.gunawan@sdnambo03.sch.id',
      'Alamat': 'Kp. Babakan RT 02/03',
      'TMT Kerja (YYYY-MM-DD)': '2019-07-15'
    },
    {
      'NIP (Isi - jika honorer)': '-',
      'NUPTK': '7890764666200054',
      'Nama Lengkap': 'Siti Maryam',
      'Gelar': 'S.Pd.',
      'Jenis Kelamin (L/P)': 'P',
      'Jabatan': 'Guru Bahasa Sunda',
      'Status Kepegawaian (PNS/PPPK/Honorer/GTT)': 'Honorer',
      'Pendidikan Terakhir': 'S1 Pendidikan Bahasa Daerah UPI',
      'No HP (WhatsApp)': '081312345622',
      'Email': 'siti.maryam@sdnambo03.sch.id',
      'Alamat': 'Kp. Nambo Ilir RT 01/01',
      'TMT Kerja (YYYY-MM-DD)': '2020-01-10'
    },
    {
      'NIP (Isi - jika honorer)': '198502212010011009',
      'NUPTK': '2345770673230089',
      'Nama Lengkap': 'Danang Suhendar',
      'Gelar': 'S.Pd.',
      'Jenis Kelamin (L/P)': 'L',
      'Jabatan': 'Guru Kelas',
      'Status Kepegawaian (PNS/PPPK/Honorer/GTT)': 'PNS',
      'Pendidikan Terakhir': 'S1 PGSD Universitas Pakuan',
      'No HP (WhatsApp)': '085811223333',
      'Email': 'danang.suhendar@sdnambo03.sch.id',
      'Alamat': 'Perum Kahuripan Klapanunggal',
      'TMT Kerja (YYYY-MM-DD)': '2010-01-01'
    },
    {
      'NIP (Isi - jika honorer)': '198909152022212007',
      'NUPTK': '6789759661100067',
      'Nama Lengkap': 'Mega Utami',
      'Gelar': 'S.Pd.',
      'Jenis Kelamin (L/P)': 'P',
      'Jabatan': 'Guru Kelas',
      'Status Kepegawaian (PNS/PPPK/Honorer/GTT)': 'PPPK',
      'Pendidikan Terakhir': 'S1 PGSD Universitas Djuanda',
      'No HP (WhatsApp)': '081234567844',
      'Email': 'mega.utami@sdnambo03.sch.id',
      'Alamat': 'Jl. Mayor Oking No. 89',
      'TMT Kerja (YYYY-MM-DD)': '2022-07-01'
    },
    {
      'NIP (Isi - jika honorer)': '-',
      'NUPTK': '1928374650192837',
      'Nama Lengkap': 'Rian Hidayat',
      'Gelar': 'S.Pd.',
      'Jenis Kelamin (L/P)': 'L',
      'Jabatan': 'Guru Bahasa Inggris',
      'Status Kepegawaian (PNS/PPPK/Honorer/GTT)': 'Honorer',
      'Pendidikan Terakhir': 'S1 Pendidikan Bahasa Inggris Unindra',
      'No HP (WhatsApp)': '087799887755',
      'Email': 'rian.english@sdnambo03.sch.id',
      'Alamat': 'Kp. Lulut RT 01/04',
      'TMT Kerja (YYYY-MM-DD)': '2021-08-01'
    },
    {
      'NIP (Isi - jika honorer)': '197806122003122002',
      'NUPTK': '9012753655100078',
      'Nama Lengkap': 'Hj. Neneng Hasanah',
      'Gelar': 'S.Pd., M.Pd.',
      'Jenis Kelamin (L/P)': 'P',
      'Jabatan': 'Guru Kelas',
      'Status Kepegawaian (PNS/PPPK/Honorer/GTT)': 'PNS',
      'Pendidikan Terakhir': 'S2 Kurikulum Pendidikan Unpak',
      'No HP (WhatsApp)': '081122334466',
      'Email': 'neneng.hasanah@sdnambo03.sch.id',
      'Alamat': 'Perumahan Grand Kahuripan Blok A1',
      'TMT Kerja (YYYY-MM-DD)': '2003-12-01'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template_Guru');
  downloadWorkbook(wb, 'Template_Input_Guru_SDN_Nambo_03.xlsx');
}

/**
 * Template 4: Template Excel Kepegawaian Non-Guru (10 dummy data)
 */
export function generateStaffTemplateExcel() {
  const data = [
    {
      'NIP (Isi - jika non-PNS)': '198402122010011008',
      'Nama Lengkap': 'Agus Sulistyo',
      'Gelar': 'A.Md.',
      'Jenis Kelamin (L/P)': 'L',
      'Jabatan': 'Tenaga Administrasi (TU)',
      'Status Kepegawaian (PNS/PPPK/Honorer/PTT)': 'PNS',
      'Pendidikan Terakhir': 'D3 Manajemen Informatika IPB',
      'No HP (WhatsApp)': '081288991122',
      'Email': 'agus.tu@sdnambo03.sch.id',
      'Alamat': 'Jl. Raya Nambo No. 44',
      'TMT Kerja (YYYY-MM-DD)': '2010-01-01'
    },
    {
      'NIP (Isi - jika non-PNS)': '-',
      'Nama Lengkap': 'Rudi Hermawan',
      'Gelar': 'S.Kom.',
      'Jenis Kelamin (L/P)': 'L',
      'Jabatan': 'Operator Dapodik',
      'Status Kepegawaian (PNS/PPPK/Honorer/PTT)': 'Honorer',
      'Pendidikan Terakhir': 'S1 Teknik Informatika Univ Gunadarma',
      'No HP (WhatsApp)': '085711223344',
      'Email': 'dapodik.nambo03@gmail.com',
      'Alamat': 'Perum Kahuripan Blok G8',
      'TMT Kerja (YYYY-MM-DD)': '2017-02-15'
    },
    {
      'NIP (Isi - jika non-PNS)': '-',
      'Nama Lengkap': 'Lia Yulianti',
      'Gelar': 'A.P.',
      'Jenis Kelamin (L/P)': 'P',
      'Jabatan': 'Petugas Perpustakaan',
      'Status Kepegawaian (PNS/PPPK/Honorer/PTT)': 'Honorer',
      'Pendidikan Terakhir': 'D3 Perpustakaan UI',
      'No HP (WhatsApp)': '087899001122',
      'Email': 'perpustakaan@sdnambo03.sch.id',
      'Alamat': 'Kp. Babakan RT 01/01',
      'TMT Kerja (YYYY-MM-DD)': '2019-09-01'
    },
    {
      'NIP (Isi - jika non-PNS)': '-',
      'Nama Lengkap': 'Wawan Setiawan',
      'Gelar': '',
      'Jenis Kelamin (L/P)': 'L',
      'Jabatan': 'Penjaga Sekolah',
      'Status Kepegawaian (PNS/PPPK/Honorer/PTT)': 'PTT',
      'Pendidikan Terakhir': 'SMA Negeri 1 Cileungsi',
      'No HP (WhatsApp)': '081377889900',
      'Email': '',
      'Alamat': 'Kp. Nambo RT 03/01',
      'TMT Kerja (YYYY-MM-DD)': '2016-04-10'
    },
    {
      'NIP (Isi - jika non-PNS)': '-',
      'Nama Lengkap': 'Siti Halimah',
      'Gelar': '',
      'Jenis Kelamin (L/P)': 'P',
      'Jabatan': 'Petugas Kebersihan',
      'Status Kepegawaian (PNS/PPPK/Honorer/PTT)': 'PTT',
      'Pendidikan Terakhir': 'SMPN 1 Klapanunggal',
      'No HP (WhatsApp)': '085866778899',
      'Email': '',
      'Alamat': 'Desa Lulut RT 05/02',
      'TMT Kerja (YYYY-MM-DD)': '2018-08-01'
    },
    {
      'NIP (Isi - jika non-PNS)': '-',
      'Nama Lengkap': 'Mamat Sudrajat',
      'Gelar': '',
      'Jenis Kelamin (L/P)': 'L',
      'Jabatan': 'Satpam/Keamanan',
      'Status Kepegawaian (PNS/PPPK/Honorer/PTT)': 'PTT',
      'Pendidikan Terakhir': 'SMA PGRI 1 Bogor',
      'No HP (WhatsApp)': '081299887766',
      'Email': '',
      'Alamat': 'Kp. Cikikil RT 02/04',
      'TMT Kerja (YYYY-MM-DD)': '2017-10-01'
    },
    {
      'NIP (Isi - jika non-PNS)': '-',
      'Nama Lengkap': 'Dedi Suhendi',
      'Gelar': 'A.Md.',
      'Jenis Kelamin (L/P)': 'L',
      'Jabatan': 'Tenaga Administrasi (TU)',
      'Status Kepegawaian (PNS/PPPK/Honorer/PTT)': 'Honorer',
      'Pendidikan Terakhir': 'D3 Akuntansi Bina Sarana',
      'No HP (WhatsApp)': '087855667788',
      'Email': 'dedi.tu@sdnambo03.sch.id',
      'Alamat': 'Jl. Narogong KM 21 RT 02/01',
      'TMT Kerja (YYYY-MM-DD)': '2021-03-01'
    },
    {
      'NIP (Isi - jika non-PNS)': '-',
      'Nama Lengkap': 'Ujang Kosasih',
      'Gelar': '',
      'Jenis Kelamin (L/P)': 'L',
      'Jabatan': 'Satpam/Keamanan',
      'Status Kepegawaian (PNS/PPPK/Honorer/PTT)': 'PTT',
      'Pendidikan Terakhir': 'SMK Karya Nugraha',
      'No HP (WhatsApp)': '081344556677',
      'Email': '',
      'Alamat': 'Desa Nambo RT 02/03',
      'TMT Kerja (YYYY-MM-DD)': '2020-11-15'
    },
    {
      'NIP (Isi - jika non-PNS)': '-',
      'Nama Lengkap': 'Kokom Komalasari',
      'Gelar': '',
      'Jenis Kelamin (L/P)': 'P',
      'Jabatan': 'Petugas Kebersihan',
      'Status Kepegawaian (PNS/PPPK/Honorer/PTT)': 'PTT',
      'Pendidikan Terakhir': 'SMP Terbuka Klapanunggal',
      'No HP (WhatsApp)': '085733445566',
      'Email': '',
      'Alamat': 'Kp. Babakan RT 03/03',
      'TMT Kerja (YYYY-MM-DD)': '2022-01-05'
    },
    {
      'NIP (Isi - jika non-PNS)': '-',
      'Nama Lengkap': 'Herman Santoso',
      'Gelar': '',
      'Jenis Kelamin (L/P)': 'L',
      'Jabatan': 'Penjaga Sekolah',
      'Status Kepegawaian (PNS/PPPK/Honorer/PTT)': 'PTT',
      'Pendidikan Terakhir': 'SMA Bina Bangsa',
      'No HP (WhatsApp)': '081222334455',
      'Email': '',
      'Alamat': 'Jl. Raya Klapanunggal RT 01/02',
      'TMT Kerja (YYYY-MM-DD)': '2019-05-10'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template_Kepegawaian');
  downloadWorkbook(wb, 'Template_Input_Kepegawaian_SDN_Nambo_03.xlsx');
}

/**
 * Parses an uploaded Excel file (.xlsx or .xls) into JSON rows
 */
export async function parseExcelFile(file: File): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Exports current students table to Excel (.xlsx)
 */
export function exportStudentsToExcel(students: Student[], classesMap: Map<string, string>, fileName: string = 'Laporan_Data_Siswa_SDN_Nambo_03') {
  const data = students.map((s, idx) => ({
    'No': idx + 1,
    'NISN': s.nisn,
    'NIS': s.nis,
    'Nama Lengkap': s.namaLengkap,
    'Jenis Kelamin': s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
    'Kelas': classesMap.get(s.kelasId) || s.kelasId,
    'Agama': s.agama,
    'Tempat Lahir': s.tempatLahir,
    'Tanggal Lahir': s.tanggalLahir,
    'NIK': s.nik,
    'Alamat': s.alamat,
    'Status': s.status.toUpperCase(),
    'Penerima PIP': s.isPip ? 'Ya (Aktif)' : 'Bukan',
    'Nominal PIP (Rp)': s.nominalPip || 0,
    'Siswa Pindahan': s.isPindahan ? 'Ya' : 'Tidak',
    'Asal Sekolah': s.asalSekolah || '-',
    'Tanggal Pindah': s.tanggalPindah || '-',
    'Tinggi (cm)': s.tinggiBadan || '-',
    'Berat (kg)': s.beratBadan || '-'
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data_Siswa');
  downloadWorkbook(wb, `${fileName}.xlsx`);
}

/**
 * Exports current teachers & staff to Excel (.xlsx)
 */
export function exportStaffToExcel(staffList: TeacherStaff[], fileName: string = 'Data_Kepegawaian_SDN_Nambo_03') {
  const data = staffList.map((s, idx) => ({
    'No': idx + 1,
    'NIP': s.nip,
    'NUPTK': s.nuptk || '-',
    'Nama Lengkap': s.namaLengkap,
    'Gelar': s.gelar || '-',
    'Jenis Kelamin': s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
    'Kategori': s.kategori.toUpperCase(),
    'Jabatan': s.jabatan,
    'Status Kepegawaian': s.statusKepegawaian,
    'Pendidikan Terakhir': s.pendidikanTerakhir,
    'No HP': s.noHp,
    'Email': s.email || '-',
    'Status Kerja': s.statusKerja.toUpperCase(),
    'TMT Kerja': s.tmtKerja
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data_Kepegawaian');
  downloadWorkbook(wb, `${fileName}.xlsx`);
}

/**
 * Exports daily/monthly attendance list to Excel (.xlsx)
 */
export function exportAttendanceToExcel({
  className,
  tanggal,
  attendanceList
}: {
  className: string;
  tanggal: string;
  attendanceList: {
    no: number;
    nisn: string;
    nama: string;
    gender: string;
    status: 'H' | 'S' | 'I' | 'A';
    keterangan?: string;
  }[];
}) {
  const statusMap = {
    H: 'Hadir',
    S: 'Sakit',
    I: 'Izin',
    A: 'Alpa'
  };

  const data = attendanceList.map(item => ({
    'No': item.no,
    'NISN': item.nisn,
    'Nama Siswa': item.nama,
    'Jenis Kelamin': item.gender === 'L' ? 'Laki-laki' : 'Perempuan',
    'Status Presensi': statusMap[item.status] || item.status,
    'Kode Presensi': item.status,
    'Keterangan': item.keterangan || '-'
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Presensi_Harian');
  downloadWorkbook(wb, `Presensi_${className.replace(/\s+/g, '_')}_${tanggal}.xlsx`);
}

/**
 * Exports Monthly Age Breakdown to Excel (.xlsx)
 */
export function exportAgeRecapToExcel({
  bulanLabel,
  classesBreakdown
}: {
  bulanLabel: string;
  classesBreakdown: {
    className: string;
    counts: Record<string, { male: number; female: number; total: number }>;
    totalL: number;
    totalP: number;
    grandTotal: number;
  }[];
}) {
  const data = classesBreakdown.map((item, idx) => ({
    'No': idx + 1,
    'Kelas': item.className,
    '< 6 Th (L)': item.counts['< 6 th']?.male || 0,
    '< 6 Th (P)': item.counts['< 6 th']?.female || 0,
    '6 Th (L)': item.counts['6 th']?.male || 0,
    '6 Th (P)': item.counts['6 th']?.female || 0,
    '7 Th (L)': item.counts['7 th']?.male || 0,
    '7 Th (P)': item.counts['7 th']?.female || 0,
    '8 Th (L)': item.counts['8 th']?.male || 0,
    '8 Th (P)': item.counts['8 th']?.female || 0,
    '9 Th (L)': item.counts['9 th']?.male || 0,
    '9 Th (P)': item.counts['9 th']?.female || 0,
    '10 Th (L)': item.counts['10 th']?.male || 0,
    '10 Th (P)': item.counts['10 th']?.female || 0,
    '11 Th (L)': item.counts['11 th']?.male || 0,
    '11 Th (P)': item.counts['11 th']?.female || 0,
    '12 Th (L)': item.counts['12 th']?.male || 0,
    '12 Th (P)': item.counts['12 th']?.female || 0,
    '> 12 Th (L)': item.counts['> 12 th']?.male || 0,
    '> 12 Th (P)': item.counts['> 12 th']?.female || 0,
    'Total Laki-laki': item.totalL,
    'Total Perempuan': item.totalP,
    'Grand Total Siswa': item.grandTotal
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekapitulasi_Umur');
  downloadWorkbook(wb, `Rekapitulasi_Umur_SDN_Nambo_03_${bulanLabel.replace(/[\s/]/g, '_')}.xlsx`);
}

