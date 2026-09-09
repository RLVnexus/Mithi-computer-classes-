import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Student, Course, Batch, Attendance, ClassLog } from '../../types';
import { BookOpen, CheckSquare, MonitorPlay, TrendingUp, CreditCard, CalendarCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [recentLogs, setRecentLogs] = useState<ClassLog[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const fetchStudentData = async () => {
    if (!currentUser) return;
    try {
      const sSnap = await getDocs(query(collection(db, 'students'), where('uid', '==', currentUser.uid)));
      if (!sSnap.empty) {
        const studentData = { id: sSnap.docs[0].id, ...sSnap.docs[0].data() } as Student;
        setStudent(studentData);
        
        if (studentData.courseId) {
          const cSnap = await getDocs(query(collection(db, 'courses'), where('__name__', '==', studentData.courseId)));
          if (!cSnap.empty) setCourse({ id: cSnap.docs[0].id, ...cSnap.docs[0].data() } as Course);
          
          const lSnap = await getDocs(query(collection(db, 'classLogs'), where('courseId', '==', studentData.courseId)));
          setRecentLogs(lSnap.docs.map(d => ({ id: d.id, ...d.data() } as ClassLog)).slice(0, 5));
        }
        
        if (studentData.batchId) {
          const bSnap = await getDocs(query(collection(db, 'batches'), where('__name__', '==', studentData.batchId)));
          if (!bSnap.empty) setBatch({ id: bSnap.docs[0].id, ...bSnap.docs[0].data() } as Batch);
        }

        const aSnap = await getDocs(query(collection(db, 'attendance'), where('studentId', '==', studentData.studentId)));
        setAttendances(aSnap.docs.map(d => ({ id: d.id, ...d.data() } as Attendance)).sort((a, b) => b.date.localeCompare(a.date)));
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [currentUser]);

  const markAttendance = async () => {
    if (!student) return;
    setMarking(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const docId = `${student.studentId}_${today}`;
      
      const attendanceRef = doc(db, 'attendance', docId);
      await setDoc(attendanceRef, {
        studentId: student.studentId,
        studentName: student.name,
        date: today,
        status: 'present',
        markedAt: Date.now(),
        markedBy: 'student'
      });
      
      toast.success("Attendance marked for today!");
      fetchStudentData(); // refresh attendance list
    } catch (error: any) {
      toast.error("Failed to mark attendance.");
    } finally {
      setMarking(false);
    }
  };

  if (loading) return <div className="p-8">Loading your dashboard...</div>;
  if (!student) return <div className="p-8 text-red-500">Student profile not found. Please contact admin.</div>;

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const isPresentToday = attendances.some(a => a.date === todayStr && a.status === 'present');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome, {student.name}</h1>
          <p className="text-sm font-semibold text-blue-600">{student.studentId}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {student.status.toUpperCase()}
          </span>
          <button 
            onClick={markAttendance}
            disabled={isPresentToday || marking}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              isPresentToday ? 'bg-green-100 text-green-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <CalendarCheck size={16} />
            {isPresentToday ? 'Present Today' : marking ? 'Marking...' : 'Mark Attendance'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3">
            <BookOpen size={20} />
          </div>
          <p className="text-xs text-slate-500 font-semibold uppercase">My Course</p>
          <p className="text-lg font-bold text-slate-900 leading-tight">{course?.name || 'Not Assigned'}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-3">
            <TrendingUp size={20} />
          </div>
          <p className="text-xs text-slate-500 font-semibold uppercase">Progress</p>
          <p className="text-lg font-bold text-slate-900 leading-tight">In Progress</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-3">
            <CheckSquare size={20} />
          </div>
          <p className="text-xs text-slate-500 font-semibold uppercase">Total Present</p>
          <p className="text-lg font-bold text-slate-900 leading-tight">{attendances.filter(a => a.status === 'present').length} Days</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-3">
            <CreditCard size={20} />
          </div>
          <p className="text-xs text-slate-500 font-semibold uppercase">Pending Fees</p>
          <p className="text-lg font-bold text-slate-900 leading-tight">₹{student.remaining}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MonitorPlay size={20} /> Today's Learning
          </h2>
          <div className="space-y-4">
            {recentLogs.length > 0 ? recentLogs.map((log) => (
              <div key={log.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <p className="text-xs text-slate-500 mb-1">{log.date}</p>
                <h3 className="font-bold text-slate-900">{log.topic}</h3>
                <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">{log.whatLearned}</p>
              </div>
            )) : (
              <p className="text-sm text-slate-500">No lessons published yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Course Details</h2>
            {course && batch ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Batch</p>
                  <p className="font-bold text-slate-900">{batch.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Timing</p>
                  <p className="font-bold text-slate-900">{batch.startTime} - {batch.endTime}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Course Description</p>
                  <p className="text-sm text-slate-700">{course.description}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No active course or batch assignments.</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Attendance History</h2>
            <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
              {attendances.length > 0 ? attendances.map(a => (
                <div key={a.id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-semibold text-slate-700">{a.date}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${a.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {a.status.toUpperCase()}
                  </span>
                </div>
              )) : (
                <p className="text-sm text-slate-500">No attendance records found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

