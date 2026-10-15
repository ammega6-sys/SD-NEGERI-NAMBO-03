import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, DailyAttendance, ClassRoom, AgeCategoryCount } from '../types';

export interface PdfReportOptions {
  title: string;
  subtitle?: string;
  period?: string;
  classesMap: Map<string, string>;
  students: Student[];
}

export function drawSchoolLetterhead(doc: jsPDF, title: string, subtitle?: string, period?: string) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Kop Surat Sekolah
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('PEMERINTAH KABUPATEN BOGOR', pageWidth / 2, 13, { align: 'center' });
  doc.text('DINAS PENDIDIKAN', pageWidth / 2, 18, { align: 'center' });
  
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('SEKOLAH DASAR NEGERI NAMBO 03', pageWidth / 2, 24, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('NPSN: 20200352  |  Kecamatan Klapanunggal, Kabupaten Bogor, Provinsi Jawa Barat 16710', pageWidth / 2, 29, { align: 'center' });
  doc.text('Website / Sistem: sdnambo03.sch.id  |  Email: info@sdnambo03.sch.id', pageWidth / 2, 33, { align: 'center' });

  // Garis Dobel Kop Surat
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.8);
  doc.line(14, 35.5, pageWidth - 14, 35.5);
  doc.setLineWidth(0.2);
  doc.line(14, 36.7, pageWidth - 14, 36.7);

  // Judul Laporan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(15, 23, 42);
  doc.text(title.toUpperCase(), pageWidth / 2, 43, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const sub = subtitle || `Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  const periodText = period ? ` | ${period}` : '';
  doc.text(`${sub}${periodText}`, pageWidth / 2, 48, { align: 'center' });

  return 52; // startY for content
}

export function drawSignatureBlock(doc: jsPDF, finalY: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let signY = finalY + 12;
  if (signY > pageHeight - 35) {
    doc.addPage();
    signY = 25;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.text(`Klapanunggal, ${todayStr}`, pageWidth - 70, signY);
  doc.text('Kepala SD Negeri Nambo 03,', pageWidth - 70, signY + 4.5);
  
  doc.setFont('helvetica', 'bold');
  doc.text('H. Dadan Hamdani, S.Pd., M.M.', pageWidth - 70, signY + 20);
  doc.setFont('helvetica', 'normal');
  doc.text('NIP. 197508022000031002', pageWidth - 70, signY + 24);
}

export function generateStudentsPdfReport({
  title,
  subtitle,
  period,
  classesMap,
  students
}: PdfReportOptions) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const startY = drawSchoolLetterhead(doc, title, subtitle, period);

  const tableRows = students.map((s, index) => [
    index + 1,
    s.nisn,
    s.nis,
    s.namaLengkap,
    s.jenisKelamin,
    classesMap.get(s.kelasId) || s.kelasId,
    s.agama,
    s.status === 'pindahan_masuk' 
      ? `Pindahan (${s.asalSekolah || '-'})` 
      : s.status === 'mutasi_keluar'
      ? `Mutasi Keluar (${s.tujuanMutasi || '-'})`
      : s.status === 'berhenti_do'
      ? 'Berhenti / DO'
      : 'Aktif',
    s.isPip ? `Ya (${s.nominalPip ? 'Rp ' + s.nominalPip.toLocaleString('id-ID') : 'Aktif'})` : 'Bukan',
    s.alamat
  ]);

  autoTable(doc, {
    startY,
    head: [['No', 'NISN', 'NIS', 'Nama Siswa', 'L/P', 'Kelas', 'Agama', 'Status Siswa', 'PIP', 'Alamat Domisili']],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      font: 'helvetica',
      textColor: [30, 41, 59],
      lineWidth: 0.1,
      lineColor: [226, 232, 240]
    },
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'center', cellWidth: 24, font: 'courier' },
      2: { halign: 'center', cellWidth: 16, font: 'courier' },
      3: { halign: 'left', cellWidth: 46 },
      4: { halign: 'center', cellWidth: 12 },
      5: { halign: 'center', cellWidth: 20 },
      6: { halign: 'center', cellWidth: 20 },
      7: { halign: 'left', cellWidth: 38 },
      8: { halign: 'center', cellWidth: 26 },
      9: { halign: 'left', cellWidth: 'auto' }
    },
    didDrawPage: (data) => {
      const str = `Halaman ${data.pageNumber} | Sistem Informasi SD Negeri Nambo 03 (NPSN: 20200352)`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(str, doc.internal.pageSize.getWidth() - 14, doc.internal.pageSize.getHeight() - 8, { align: 'right' });
    }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 150;
  drawSignatureBlock(doc, finalY);

  doc.save(`${title.replace(/[\s/]/g, '_')}_SDN_Nambo_03.pdf`);
}

/**
 * Generates Official Attendance PDF Report for a given date or class
 */
export function generateAttendancePdfReport({
  className,
  tanggal,
  guruName,
  attendanceList
}: {
  className: string;
  tanggal: string;
  guruName?: string;
  attendanceList: {
    no: number;
    nisn: string;
    nama: string;
    gender: string;
    status: 'H' | 'S' | 'I' | 'A';
    keterangan?: string;
  }[];
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const formattedDate = new Date(tanggal).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const startY = drawSchoolLetterhead(
    doc,
    `DAFTAR HADIR HARIAN SISWA - ${className.toUpperCase()}`,
    `Wali Kelas: ${guruName || 'Dewan Guru SDN Nambo 03'}`,
    `Hari/Tanggal: ${formattedDate}`
  );

  const statusMap = {
    H: 'Hadir (H)',
    S: 'Sakit (S)',
    I: 'Izin (I)',
    A: 'Alpa (A)'
  };

  const rows = attendanceList.map(item => [
    item.no,
    item.nisn,
    item.nama,
    item.gender,
    statusMap[item.status] || item.status,
    item.keterangan || '-'
  ]);

  autoTable(doc, {
    startY,
    head: [['No', 'NISN', 'Nama Siswa', 'L/P', 'Status Presensi', 'Keterangan']],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2.2 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255, halign: 'center' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { halign: 'center', cellWidth: 26, font: 'courier' },
      2: { halign: 'left', cellWidth: 'auto' },
      3: { halign: 'center', cellWidth: 14 },
      4: { halign: 'center', cellWidth: 32 },
      5: { halign: 'left', cellWidth: 44 }
    }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 180;

  // Add Summary counts
  const hadir = attendanceList.filter(a => a.status === 'H').length;
  const sakit = attendanceList.filter(a => a.status === 'S').length;
  const izin = attendanceList.filter(a => a.status === 'I').length;
  const alpa = attendanceList.filter(a => a.status === 'A').length;
  const total = attendanceList.length;
  const pct = total > 0 ? Math.round((hadir / total) * 100) : 0;

  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Rekapitulasi: Hadir: ${hadir} | Sakit: ${sakit} | Izin: ${izin} | Alpa: ${alpa} (Persentase Kehadiran: ${pct}%)`, 14, finalY + 6);

  drawSignatureBlock(doc, finalY + 4);

  doc.save(`Absensi_${className.replace(/\s+/g, '_')}_${tanggal}.pdf`);
}

/**
 * Generates Monthly Age Breakdown PDF Report (Rekapitulasi Umur Siswa per Bulan)
 */
export function generateAgeRecapPdfReport({
  bulanLabel,
  classesBreakdown,
  summaryTotals
}: {
  bulanLabel: string;
  classesBreakdown: {
    className: string;
    counts: Record<string, { male: number; female: number; total: number }>;
    totalL: number;
    totalP: number;
    grandTotal: number;
  }[];
  summaryTotals: Record<string, { male: number; female: number; total: number }>;
}) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const startY = drawSchoolLetterhead(
    doc,
    'REKAPITULASI KEADAAN SISWA MENURUT UMUR & TINGKAT KELAS',
    'Format Administrasi Bulanan Dapodik SDN Nambo 03 (NPSN: 20200352)',
    `Keadaan Bulan: ${bulanLabel}`
  );

  const ageHeaders = ['< 6 th', '6 th', '7 th', '8 th', '9 th', '10 th', '11 th', '12 th', '> 12 th'];

  // Table header with two rows (nested)
  const headRows = [
    [
      { content: 'No', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      { content: 'Rombongan Belajar', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
      ...ageHeaders.map(age => ({ content: age, colSpan: 3, styles: { halign: 'center' } })),
      { content: 'Jumlah Total', colSpan: 3, styles: { halign: 'center' } }
    ],
    [
      // Subheaders L, P, Jml for each age group + Total
      ...ageHeaders.flatMap(() => ['L', 'P', 'J']),
      'L', 'P', 'Jml'
    ]
  ];

  const bodyRows = classesBreakdown.map((item, idx) => {
    const ageCells = ageHeaders.flatMap(age => {
      const data = item.counts[age] || { male: 0, female: 0, total: 0 };
      return [
        data.male || '-',
        data.female || '-',
        data.total > 0 ? data.total : '-'
      ];
    });

    return [
      idx + 1,
      item.className,
      ...ageCells,
      item.totalL,
      item.totalP,
      item.grandTotal
    ];
  });

  // Footer row: Grand totals
  const footerAgeCells = ageHeaders.flatMap(age => {
    const data = summaryTotals[age] || { male: 0, female: 0, total: 0 };
    return [data.male, data.female, data.total];
  });

  const totalAllL = Object.values(summaryTotals).reduce((sum, v) => sum + v.male, 0);
  const totalAllP = Object.values(summaryTotals).reduce((sum, v) => sum + v.female, 0);
  const totalAll = totalAllL + totalAllP;

  const footerRow = [
    { content: 'TOTAL', colSpan: 2, styles: { fontStyle: 'bold', halign: 'center' } },
    ...footerAgeCells,
    totalAllL,
    totalAllP,
    totalAll
  ];

  autoTable(doc, {
    startY,
    head: headRows as any,
    body: [...bodyRows, footerRow] as any,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      halign: 'center'
    },
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 26, halign: 'left' }
    }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 160;
  drawSignatureBlock(doc, finalY);

  doc.save(`Rekapitulasi_Umur_Siswa_SDN_Nambo_03_${bulanLabel.replace(/[\s/]/g, '_')}.pdf`);
}
