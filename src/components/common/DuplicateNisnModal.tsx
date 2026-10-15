import React from 'react';
import { AlertTriangle, X, User, School, Calendar } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

export const DuplicateNisnModal: React.FC = () => {
  const { duplicateNisnModal, closeDuplicateNisnModal, classesMap } = useSchool();

  if (!duplicateNisnModal || !duplicateNisnModal.isOpen) return null;

  const { nisn, existingStudent, message } = duplicateNisnModal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-rose-100 overflow-hidden"
        role="alertdialog"
        aria-labelledby="duplicate-nisn-title"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 bg-rose-50/70 border-b border-rose-100 flex items-start gap-4">
          <div className="p-3 bg-rose-100 text-rose-700 rounded-xl shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 id="duplicate-nisn-title" className="text-base font-bold text-slate-900 leading-snug">
              Peringatan: NISN Sudah Terdaftar
            </h3>
            <p className="text-xs text-rose-600 mt-0.5 font-medium">
              Duplikasi ID NISN Tidak Diperbolehkan
            </p>
          </div>
          <button
            onClick={closeDuplicateNisnModal}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Tutup notifikasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            {message || `NISN `}
            {!message && <strong className="font-mono text-slate-900 font-semibold">{nisn}</strong>}
            {!message && ` sudah tercatat dalam sistem Dapodik SD Negeri Nambo 03. Setiap siswa wajib memiliki NISN unik.`}
          </p>

          {existingStudent && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2 text-slate-700">
              <div className="font-semibold text-slate-900 pb-1 border-b border-slate-200 flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-500" />
                Data Siswa Pemilik NISN Terdaftar:
              </div>
              <div className="grid grid-cols-3 gap-1 pt-1">
                <span className="text-slate-500">Nama:</span>
                <span className="col-span-2 font-medium text-slate-900">{existingStudent.namaLengkap}</span>

                <span className="text-slate-500">NISN / NIS:</span>
                <span className="col-span-2 font-mono">{existingStudent.nisn} / {existingStudent.nis}</span>

                <span className="text-slate-500">Kelas:</span>
                <span className="col-span-2 font-medium text-blue-700">
                  {classesMap.get(existingStudent.kelasId) || existingStudent.kelasId}
                </span>

                <span className="text-slate-500">Status:</span>
                <span className="col-span-2 capitalize font-medium">{existingStudent.status.replace('_', ' ')}</span>
              </div>
            </div>
          )}

          <div className="text-xs text-slate-500 bg-amber-50 p-3 rounded-lg border border-amber-200/60 text-amber-800">
            💡 Solusi: Silakan periksa kembali berkas ijazah/akta lahir siswa atau lakukan pencarian siswa di Menu <strong>Manajemen Kelas</strong> untuk mengedit datanya.
          </div>
        </div>

        {/* Action */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={closeDuplicateNisnModal}
            className="px-5 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
