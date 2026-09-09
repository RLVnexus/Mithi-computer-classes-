import React, { useState } from 'react';
import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Attendance, Student } from '../../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { CheckCircle2, User as UserIcon } from 'lucide-react';

export default function AdminAttendance() {
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const { currentUser } = useAuth();
  
  const searchStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) return;
    
    setLoading(true);
    setStudent(null);
    try {
      const q = query(collection(db, 'students'), where('studentId', '==', studentId.trim().toUpperCase()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        toast.error('Student not found');
      } else {
        setStudent({ id: snap.docs[0].id, ...snap.docs[0].data() } as Student);
      }
    } catch (error) {
      toast.error('Error searching student');
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (status: 'present' | 'absent' | 'late') => {
    if (!student || !currentUser) return;
    const loadingToast = toast.loading('Marking attendance...');
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const time = format(new Date(), 'hh:mm a');
      const attendanceId = `${student.studentId}_${today}`;
      const docRef = doc(db, 'attendance', attendanceId);
      
      const existsSnap = await getDoc(docRef);
      if (existsSnap.exists()) {
        toast.error('Attendance Already Marked Today.', { id: loadingToast });
        return;
      }

      const newAttendance: Attendance = {
        id: attendanceId,
        studentId: student.studentId,
        studentUid: student.id,
        studentName: student.name,
        courseId: student.courseId,
        batchId: student.batchId,
        date: today,
        time,
        status,
        markedByAdmin: true,
        adminUid: currentUser.uid,
        createdAt: Date.now()
      };

      await setDoc(docRef, newAttendance);
      
      await setDoc(doc(collection(db, 'activityLogs')), {
        action: 'Attendance Marked',
        description: `Marked ${status} for ${student.name} (${student.studentId}).`,
        createdAt: Date.now(),
        performedBy: 'Admin'
      });

      toast.success(
        <div className="flex flex-col gap-1">
          <p className="font-bold flex items-center gap-2"><CheckCircle2 className="text-green-500" size={18}/> ATTENDANCE MARKED</p>
          <p className="text-sm">{student.name} ({student.studentId})</p>
          <p className="text-xs text-slate-500">{format(new Date(), 'dd MMMM yyyy, hh:mm a')}</p>
        </div>, 
        { id: loadingToast, duration: 4000 }
      );
      
      // Reset for next student to be extremely fast for classroom use
      setStudentId('');
      setStudent(null);
    } catch (error: any) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 mt-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-slate-900 leading-tight">
          MITHI COMPUTER CLASSES
        </h1>
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mt-2">Daily Attendance System</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <form onSubmit={searchStudent} className="mb-8">
          <label className="block text-center text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">
            ENTER STUDENT ID
          </label>
          <div className="flex gap-4">
            <input 
              type="text" 
              autoFocus
              className="flex-1 text-center text-2xl font-bold p-4 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-blue-500 uppercase transition-colors"
              placeholder="MCC-2026-0001"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
            <button 
              type="submit"
              disabled={loading || !studentId}
              className="bg-slate-900 text-white font-bold px-8 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              FIND
            </button>
          </div>
        </form>

        {student && (
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                <UserIcon size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{student.name}</h3>
                <p className="text-lg font-semibold text-blue-600">{student.studentId}</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600">
                    Course: {student.courseId || 'N/A'}
                  </span>
                  <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600">
                    Batch: {student.batchId || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button onClick={() => markAttendance('present')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-lg transition-colors">
                MARK PRESENT
              </button>
              <button onClick={() => markAttendance('absent')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl text-lg transition-colors">
                MARK ABSENT
              </button>
              <button onClick={() => markAttendance('late')} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl text-lg transition-colors">
                MARK LATE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
