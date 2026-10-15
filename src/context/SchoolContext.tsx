import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Student,
  ClassRoom,
  Extracurricular,
  TeacherStaff,
  TeachingHour,
  StudentStatus,
  DailyAttendance,
  MonthlyClassAgeRecap
} from '../types';
import {
  INITIAL_CLASSES,
  INITIAL_EXTRACURRICULARS,
  INITIAL_STAFF,
  INITIAL_TEACHING_HOURS,
  INITIAL_STUDENTS
} from '../data/initialData';

interface DuplicateNisnState {
  isOpen: boolean;
  nisn: string;
  existingStudent?: Student;
  message?: string;
}

interface SchoolContextType {
  // Main data
  classes: ClassRoom[];
  extracurriculars: Extracurricular[];
  teachersStaff: TeacherStaff[];
  teachingHours: TeachingHour[];
  students: Student[];

  // Navigation
  activeMenu: 'dashboard' | 'absensi' | 'rekap-umur' | 'input-data' | 'manajemen-kelas' | 'kepegawaian';
  setActiveMenu: (menu: 'dashboard' | 'absensi' | 'rekap-umur' | 'input-data' | 'manajemen-kelas' | 'kepegawaian') => void;
  inputSubTab: 'kelas-ekskul' | 'siswa' | 'guru' | 'kepegawaian';
  setInputSubTab: (tab: 'kelas-ekskul' | 'siswa' | 'guru' | 'kepegawaian') => void;
  managementSubTab: 'aktif' | 'non-aktif' | 'pip' | 'agama' | 'ekskul' | 'wali-kelas' | 'laporan';
  setManagementSubTab: (tab: 'aktif' | 'non-aktif' | 'pip' | 'agama' | 'ekskul' | 'wali-kelas' | 'laporan') => void;
  staffSubTab: 'data-pegawai' | 'jam-mengajar';
  setStaffSubTab: (tab: 'data-pegawai' | 'jam-mengajar') => void;

  // Absensi & Rekap Umur State
  attendances: DailyAttendance[];
  monthlyAgeRecaps: MonthlyClassAgeRecap[];
  saveDailyAttendance: (record: DailyAttendance) => void;
  getAttendanceByDateAndClass: (tanggal: string, kelasId: string) => DailyAttendance | undefined;
  saveMonthlyAgeRecap: (recap: MonthlyClassAgeRecap) => void;
  getMonthlyAgeRecap: (bulan: string, kelasId: string) => MonthlyClassAgeRecap | undefined;

  // Duplicate NISN Modal state
  duplicateNisnModal: DuplicateNisnState | null;
  closeDuplicateNisnModal: () => void;
  showDuplicateNisnModal: (nisn: string, existingStudent?: Student, message?: string) => void;

  // Actions - Classes & Ekskul
  addClass: (newClass: Omit<ClassRoom, 'id'>) => void;
  updateClass: (id: string, updates: Partial<ClassRoom>) => void;
  addExtracurricular: (newEkskul: Omit<Extracurricular, 'id'>) => void;
  updateExtracurricular: (id: string, updates: Partial<Extracurricular>) => void;
  setWaliKelas: (kelasId: string, guruId: string) => void;
  setPembinaEkskul: (ekskulId: string, guruId: string) => void;

  // Actions - Students
  addStudent: (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; duplicate?: boolean; existing?: Student };
  importStudentsBatch: (studentsList: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>[]) => { addedCount: number; duplicateCount: number; duplicateNisns: string[] };
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  batchDeleteStudents: (ids: string[]) => void;
  batchMoveClass: (ids: string[], targetKelasId: string) => void;
  batchSetPip: (ids: string[], isPip: boolean, nominal?: number) => void;
  batchMutasiKeluar: (ids: string[], tanggal: string, tujuan: string, alasan: string) => void;
  updateStudentStatus: (id: string, status: StudentStatus, details?: { tanggalKeluar?: string; tujuanMutasi?: string; alasanKeluar?: string }) => void;
  toggleStudentPip: (id: string, isPip: boolean, nominal?: number, noKip?: string) => void;
  setStudentEkskul: (id: string, ekskulIds: string[]) => void;

  // Actions - Staff & Teachers
  addTeacherStaff: (staff: Omit<TeacherStaff, 'id' | 'createdAt'>) => void;
  updateTeacherStaff: (id: string, updates: Partial<TeacherStaff>) => void;
  deleteTeacherStaff: (id: string) => void;
  toggleTeacherStaffStatus: (id: string) => void;

  // Actions - Teaching Hours
  addTeachingHour: (th: Omit<TeachingHour, 'id'>) => void;
  updateTeachingHour: (id: string, updates: Partial<TeachingHour>) => void;
  deleteTeachingHour: (id: string) => void;

  // Helper Mappings
  classesMap: Map<string, string>; // classId -> className
  teachersMap: Map<string, string>; // guruId -> teacherName
  ekskulMap: Map<string, string>; // ekskulId -> ekskulName

  // Reset
  resetToDefaultData: () => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation states
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'absensi' | 'rekap-umur' | 'input-data' | 'manajemen-kelas' | 'kepegawaian'>('dashboard');
  const [inputSubTab, setInputSubTab] = useState<'kelas-ekskul' | 'siswa' | 'guru' | 'kepegawaian'>('kelas-ekskul');
  const [managementSubTab, setManagementSubTab] = useState<'aktif' | 'non-aktif' | 'pip' | 'agama' | 'ekskul' | 'wali-kelas' | 'laporan'>('aktif');
  const [staffSubTab, setStaffSubTab] = useState<'data-pegawai' | 'jam-mengajar'>('data-pegawai');

  // Duplicate NISN notification modal
  const [duplicateNisnModal, setDuplicateNisnModal] = useState<DuplicateNisnState | null>(null);

  // Data persistence with localStorage
  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    try {
      const saved = localStorage.getItem('sdn_nambo03_classes');
      return saved ? JSON.parse(saved) : INITIAL_CLASSES;
    } catch {
      return INITIAL_CLASSES;
    }
  });

  const [extracurriculars, setExtracurriculars] = useState<Extracurricular[]>(() => {
    try {
      const saved = localStorage.getItem('sdn_nambo03_ekskul');
      return saved ? JSON.parse(saved) : INITIAL_EXTRACURRICULARS;
    } catch {
      return INITIAL_EXTRACURRICULARS;
    }
  });

  const [teachersStaff, setTeachersStaff] = useState<TeacherStaff[]>(() => {
    try {
      const saved = localStorage.getItem('sdn_nambo03_staff');
      return saved ? JSON.parse(saved) : INITIAL_STAFF;
    } catch {
      return INITIAL_STAFF;
    }
  });

  const [teachingHours, setTeachingHours] = useState<TeachingHour[]>(() => {
    try {
      const saved = localStorage.getItem('sdn_nambo03_teaching_hours');
      return saved ? JSON.parse(saved) : INITIAL_TEACHING_HOURS;
    } catch {
      return INITIAL_TEACHING_HOURS;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('sdn_nambo03_students');
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [attendances, setAttendances] = useState<DailyAttendance[]>(() => {
    try {
      const saved = localStorage.getItem('sdn_nambo03_attendance');
      if (saved) return JSON.parse(saved);
      // Seed default sample attendance for today
      const todayStr = new Date().toISOString().split('T')[0];
      return [
        {
          id: `k-1a_${todayStr}`,
          tanggal: todayStr,
          kelasId: 'k-1a',
          guruPengisiId: 'g-001',
          catatanHarian: 'Pembelajaran tema 3 berjalan lancar dan tertib.',
          updatedAt: todayStr,
          entries: [
            { studentId: '0165432101', status: 'H' },
            { studentId: '0165432102', status: 'H' },
            { studentId: '0165432103', status: 'S', keterangan: 'Sakit flu (surat dokter)' },
            { studentId: '0165432104', status: 'H' }
          ]
        },
        {
          id: `k-2a_${todayStr}`,
          tanggal: todayStr,
          kelasId: 'k-2a',
          guruPengisiId: 'g-003',
          catatanHarian: 'Semua siswa hadir lengkap.',
          updatedAt: todayStr,
          entries: [
            { studentId: '0154321007', status: 'H' },
            { studentId: '0154321008', status: 'H' }
          ]
        }
      ];
    } catch {
      return [];
    }
  });

  const [monthlyAgeRecaps, setMonthlyAgeRecaps] = useState<MonthlyClassAgeRecap[]>(() => {
    try {
      const saved = localStorage.getItem('sdn_nambo03_age_recaps');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('sdn_nambo03_attendance', JSON.stringify(attendances));
    } catch (e) {
      console.error(e);
    }
  }, [attendances]);

  useEffect(() => {
    try {
      localStorage.setItem('sdn_nambo03_age_recaps', JSON.stringify(monthlyAgeRecaps));
    } catch (e) {
      console.error(e);
    }
  }, [monthlyAgeRecaps]);

  const saveDailyAttendance = (record: DailyAttendance) => {
    setAttendances(prev => {
      const idx = prev.findIndex(a => a.id === record.id || (a.tanggal === record.tanggal && a.kelasId === record.kelasId));
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...record, updatedAt: new Date().toISOString() };
        return copy;
      }
      return [{ ...record, updatedAt: new Date().toISOString() }, ...prev];
    });
  };

  const getAttendanceByDateAndClass = (tanggal: string, kelasId: string): DailyAttendance | undefined => {
    return attendances.find(a => a.tanggal === tanggal && a.kelasId === kelasId);
  };

  const saveMonthlyAgeRecap = (recap: MonthlyClassAgeRecap) => {
    setMonthlyAgeRecaps(prev => {
      const idx = prev.findIndex(r => r.bulan === recap.bulan && r.kelasId === recap.kelasId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...recap, updatedAt: new Date().toISOString() };
        return copy;
      }
      return [{ ...recap, updatedAt: new Date().toISOString() }, ...prev];
    });
  };

  const getMonthlyAgeRecap = (bulan: string, kelasId: string): MonthlyClassAgeRecap | undefined => {
    return monthlyAgeRecaps.find(r => r.bulan === bulan && r.kelasId === kelasId);
  };

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('sdn_nambo03_classes', JSON.stringify(classes));
    } catch (e) {
      console.error(e);
    }
  }, [classes]);

  useEffect(() => {
    try {
      localStorage.setItem('sdn_nambo03_ekskul', JSON.stringify(extracurriculars));
    } catch (e) {
      console.error(e);
    }
  }, [extracurriculars]);

  useEffect(() => {
    try {
      localStorage.setItem('sdn_nambo03_staff', JSON.stringify(teachersStaff));
    } catch (e) {
      console.error(e);
    }
  }, [teachersStaff]);

  useEffect(() => {
    try {
      localStorage.setItem('sdn_nambo03_teaching_hours', JSON.stringify(teachingHours));
    } catch (e) {
      console.error(e);
    }
  }, [teachingHours]);

  useEffect(() => {
    try {
      localStorage.setItem('sdn_nambo03_students', JSON.stringify(students));
    } catch (e) {
      console.error(e);
    }
  }, [students]);

  // Helper Maps
  const classesMap = new Map<string, string>();
  classes.forEach(c => classesMap.set(c.id, c.nama));

  const teachersMap = new Map<string, string>();
  teachersStaff.forEach(t => teachersMap.set(t.id, `${t.namaLengkap}${t.gelar ? ', ' + t.gelar : ''}`));

  const ekskulMap = new Map<string, string>();
  extracurriculars.forEach(e => ekskulMap.set(e.id, e.nama));

  // Modal handlers
  const closeDuplicateNisnModal = () => setDuplicateNisnModal(null);
  const showDuplicateNisnModal = (nisn: string, existingStudent?: Student, message?: string) => {
    setDuplicateNisnModal({
      isOpen: true,
      nisn,
      existingStudent,
      message
    });
  };

  // Class & Ekskul handlers
  const addClass = (newClass: Omit<ClassRoom, 'id'>) => {
    const id = `k-${newClass.kode.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`;
    setClasses(prev => [...prev, { ...newClass, id }]);
  };

  const updateClass = (id: string, updates: Partial<ClassRoom>) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addExtracurricular = (newEkskul: Omit<Extracurricular, 'id'>) => {
    const id = `e-${Date.now().toString().slice(-4)}`;
    setExtracurriculars(prev => [...prev, { ...newEkskul, id }]);
  };

  const updateExtracurricular = (id: string, updates: Partial<Extracurricular>) => {
    setExtracurriculars(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const setWaliKelas = (kelasId: string, guruId: string) => {
    setClasses(prev => prev.map(c => c.id === kelasId ? { ...c, waliKelasGuruId: guruId } : c));
  };

  const setPembinaEkskul = (ekskulId: string, guruId: string) => {
    setExtracurriculars(prev => prev.map(e => e.id === ekskulId ? { ...e, pembinaGuruId: guruId } : e));
  };

  // Student Actions
  const addStudent = (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    const cleanNisn = studentData.nisn.trim();
    // Check if NISN already exists
    const existing = students.find(s => s.nisn.trim() === cleanNisn);
    if (existing) {
      showDuplicateNisnModal(
        cleanNisn,
        existing,
        `Siswa dengan NISN "${cleanNisn}" sudah terdaftar atas nama ${existing.namaLengkap} di ${classesMap.get(existing.kelasId) || existing.kelasId}. Data baru ditolak karena NISN harus unik!`
      );
      return { success: false, duplicate: true, existing };
    }

    const now = new Date().toISOString().split('T')[0];
    const newStudent: Student = {
      ...studentData,
      id: cleanNisn,
      nisn: cleanNisn,
      createdAt: now,
      updatedAt: now
    };

    setStudents(prev => [newStudent, ...prev]);
    return { success: true };
  };

  const importStudentsBatch = (studentsList: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    const existingNisns = new Set(students.map(s => s.nisn.trim()));
    const batchSeenNisns = new Set<string>();
    const duplicateNisns: string[] = [];
    const validToAdd: Student[] = [];
    const now = new Date().toISOString().split('T')[0];

    for (const item of studentsList) {
      const cleanNisn = item.nisn.trim();
      if (!cleanNisn) continue;

      if (existingNisns.has(cleanNisn) || batchSeenNisns.has(cleanNisn)) {
        duplicateNisns.push(cleanNisn);
      } else {
        batchSeenNisns.add(cleanNisn);
        validToAdd.push({
          ...item,
          id: cleanNisn,
          nisn: cleanNisn,
          createdAt: now,
          updatedAt: now
        });
      }
    }

    if (validToAdd.length > 0) {
      setStudents(prev => [...validToAdd, ...prev]);
    }

    if (duplicateNisns.length > 0) {
      showDuplicateNisnModal(
        duplicateNisns.join(', '),
        undefined,
        `Terdapat ${duplicateNisns.length} NISN yang duplikat dalam file impor atau sudah terdaftar di sistem: [${duplicateNisns.slice(0, 5).join(', ')}${duplicateNisns.length > 5 ? '...' : ''}]. Baris tersebut dilewati, sedangkan ${validToAdd.length} siswa lainnya berhasil diimpor!`
      );
    }

    return {
      addedCount: validToAdd.length,
      duplicateCount: duplicateNisns.length,
      duplicateNisns
    };
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    const now = new Date().toISOString().split('T')[0];
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates, updatedAt: now } : s));
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const batchDeleteStudents = (ids: string[]) => {
    const idSet = new Set(ids);
    setStudents(prev => prev.filter(s => !idSet.has(s.id)));
  };

  const batchMoveClass = (ids: string[], targetKelasId: string) => {
    const idSet = new Set(ids);
    const now = new Date().toISOString().split('T')[0];
    setStudents(prev => prev.map(s => idSet.has(s.id) ? { ...s, kelasId: targetKelasId, updatedAt: now } : s));
  };

  const batchSetPip = (ids: string[], isPip: boolean, nominal: number = 450000) => {
    const idSet = new Set(ids);
    const now = new Date().toISOString().split('T')[0];
    setStudents(prev => prev.map(s => {
      if (idSet.has(s.id)) {
        return {
          ...s,
          isPip,
          nominalPip: isPip ? (nominal || 450000) : 0,
          tahapPip: isPip ? 'Tahap 1 2026' : undefined,
          updatedAt: now
        };
      }
      return s;
    }));
  };

  const batchMutasiKeluar = (ids: string[], tanggal: string, tujuan: string, alasan: string) => {
    const idSet = new Set(ids);
    const now = new Date().toISOString().split('T')[0];
    setStudents(prev => prev.map(s => {
      if (idSet.has(s.id)) {
        return {
          ...s,
          status: 'mutasi_keluar' as StudentStatus,
          tanggalKeluar: tanggal,
          tujuanMutasi: tujuan,
          alasanKeluar: alasan,
          updatedAt: now
        };
      }
      return s;
    }));
  };

  const updateStudentStatus = (id: string, status: StudentStatus, details?: { tanggalKeluar?: string; tujuanMutasi?: string; alasanKeluar?: string }) => {
    const now = new Date().toISOString().split('T')[0];
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status,
          ...(details || {}),
          updatedAt: now
        };
      }
      return s;
    }));
  };

  const toggleStudentPip = (id: string, isPip: boolean, nominal?: number, noKip?: string) => {
    const now = new Date().toISOString().split('T')[0];
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          isPip,
          nominalPip: isPip ? (nominal || 450000) : 0,
          noKip: isPip ? (noKip || s.noKip || `KIP-2026-${s.nis}`) : undefined,
          tahapPip: isPip ? 'Tahap 1 2026' : undefined,
          updatedAt: now
        };
      }
      return s;
    }));
  };

  const setStudentEkskul = (id: string, ekskulIds: string[]) => {
    const now = new Date().toISOString().split('T')[0];
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ekskulIds, updatedAt: now } : s));
  };

  // Staff & Teachers actions
  const addTeacherStaff = (staff: Omit<TeacherStaff, 'id' | 'createdAt'>) => {
    const prefix = staff.kategori === 'guru' ? 'g' : 's';
    const id = `${prefix}-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString().split('T')[0];
    setTeachersStaff(prev => [...prev, { ...staff, id, createdAt: now }]);
  };

  const updateTeacherStaff = (id: string, updates: Partial<TeacherStaff>) => {
    setTeachersStaff(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteTeacherStaff = (id: string) => {
    setTeachersStaff(prev => prev.filter(s => s.id !== id));
  };

  const toggleTeacherStaffStatus = (id: string) => {
    setTeachersStaff(prev => prev.map(s => {
      if (s.id === id) {
        const nextStatus = s.statusKerja === 'aktif' ? 'non_aktif' : 'aktif';
        return { ...s, statusKerja: nextStatus };
      }
      return s;
    }));
  };

  // Teaching Hours actions
  const addTeachingHour = (th: Omit<TeachingHour, 'id'>) => {
    const id = `th-${Date.now().toString().slice(-4)}`;
    setTeachingHours(prev => [...prev, { ...th, id }]);
  };

  const updateTeachingHour = (id: string, updates: Partial<TeachingHour>) => {
    setTeachingHours(prev => prev.map(th => th.id === id ? { ...th, ...updates } : th));
  };

  const deleteTeachingHour = (id: string) => {
    setTeachingHours(prev => prev.filter(th => th.id !== id));
  };

  // Reset function
  const resetToDefaultData = () => {
    setClasses(INITIAL_CLASSES);
    setExtracurriculars(INITIAL_EXTRACURRICULARS);
    setTeachersStaff(INITIAL_STAFF);
    setTeachingHours(INITIAL_TEACHING_HOURS);
    setStudents(INITIAL_STUDENTS);
    localStorage.clear();
  };

  return (
    <SchoolContext.Provider
      value={{
        classes,
        extracurriculars,
        teachersStaff,
        teachingHours,
        students,
        activeMenu,
        setActiveMenu,
        inputSubTab,
        setInputSubTab,
        managementSubTab,
        setManagementSubTab,
        staffSubTab,
        setStaffSubTab,
        duplicateNisnModal,
        closeDuplicateNisnModal,
        showDuplicateNisnModal,
        addClass,
        updateClass,
        addExtracurricular,
        updateExtracurricular,
        setWaliKelas,
        setPembinaEkskul,
        addStudent,
        importStudentsBatch,
        updateStudent,
        deleteStudent,
        batchDeleteStudents,
        batchMoveClass,
        batchSetPip,
        batchMutasiKeluar,
        updateStudentStatus,
        toggleStudentPip,
        setStudentEkskul,
        addTeacherStaff,
        updateTeacherStaff,
        deleteTeacherStaff,
        toggleTeacherStaffStatus,
        addTeachingHour,
        updateTeachingHour,
        deleteTeachingHour,
        classesMap,
        teachersMap,
        ekskulMap,
        attendances,
        monthlyAgeRecaps,
        saveDailyAttendance,
        getAttendanceByDateAndClass,
        saveMonthlyAgeRecap,
        getMonthlyAgeRecap,
        resetToDefaultData
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
