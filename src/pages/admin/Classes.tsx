import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Course, Batch, ClassLog } from '../../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { BookOpen, Calendar } from 'lucide-react';

export default function AdminClasses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [logs, setLogs] = useState<ClassLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    courseId: '', batchId: '', date: format(new Date(), 'yyyy-MM-dd'),
    topic: '', chapter: '', whatLearned: '', homework: '', notes: '', videoUrl: '', pdfUrl: ''
  });

  const fetchData = async () => {
    try {
      const cSnap = await getDocs(collection(db, 'courses'));
      setCourses(cSnap.docs.map(d => ({ id: d.id, ...d.data() } as Course)));
      
      const bSnap = await getDocs(collection(db, 'batches'));
      setBatches(bSnap.docs.map(d => ({ id: d.id, ...d.data() } as Batch)));
      
      const lSnap = await getDocs(query(collection(db, 'classLogs'), orderBy('createdAt', 'desc')));
      setLogs(lSnap.docs.map(d => ({ id: d.id, ...d.data() } as ClassLog)));
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Publishing lesson...');
    try {
      const newId = doc(collection(db, 'classLogs')).id;
      const newLog: ClassLog = {
        id: newId,
        ...formData,
        createdAt: Date.now()
      };
      
      await setDoc(doc(db, 'classLogs', newId), newLog);
      
      await setDoc(doc(collection(db, 'activityLogs')), {
        action: 'Lesson Published',
        description: `Topic ${formData.topic} published for ${formData.date}.`,
        createdAt: Date.now(),
        performedBy: 'Admin'
      });

      toast.success('LESSON PUBLISHED SUCCESSFULLY', { id: loadingToast });
      setFormData({...formData, topic: '', chapter: '', whatLearned: '', homework: '', notes: '', videoUrl: '', pdfUrl: ''});
      fetchData();
    } catch (error: any) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Today's Classes & Learning Logs</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Log Form */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><BookOpen size={20}/> Publish Lesson</h2>
          <form onSubmit={handlePublish} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Course</label>
              <select required className="w-full p-2.5 border rounded-lg bg-slate-50" value={formData.courseId} onChange={e=>setFormData({...formData, courseId: e.target.value})}>
                <option value="">Select Course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Batch</label>
              <select required className="w-full p-2.5 border rounded-lg bg-slate-50" value={formData.batchId} onChange={e=>setFormData({...formData, batchId: e.target.value})}>
                <option value="">Select Batch</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Date</label>
              <input required type="date" className="w-full p-2.5 border rounded-lg bg-slate-50" value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Chapter</label>
              <input required type="text" className="w-full p-2.5 border rounded-lg bg-slate-50" value={formData.chapter} onChange={e=>setFormData({...formData, chapter: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Today's Topic</label>
              <input required type="text" className="w-full p-2.5 border rounded-lg bg-slate-50" value={formData.topic} onChange={e=>setFormData({...formData, topic: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">What Students Learned</label>
              <textarea required className="w-full p-2.5 border rounded-lg bg-slate-50 h-24" placeholder="- Topic 1&#10;- Topic 2" value={formData.whatLearned} onChange={e=>setFormData({...formData, whatLearned: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Homework</label>
              <textarea className="w-full p-2.5 border rounded-lg bg-slate-50" value={formData.homework} onChange={e=>setFormData({...formData, homework: e.target.value})} />
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
              PUBLISH TODAY'S LESSON
            </button>
          </form>
        </div>

        {/* Recent Logs List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Calendar size={20}/> Recent Class Logs</h2>
          <div className="space-y-4">
            {loading ? (
              <p className="text-slate-500">Loading...</p>
            ) : logs.length === 0 ? (
              <p className="text-slate-500">No class logs published yet.</p>
            ) : (
              logs.map(log => (
                <div key={log.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-900">{log.topic}</h3>
                    <span className="text-sm font-semibold text-slate-500">{log.date}</span>
                  </div>
                  <p className="text-sm text-blue-600 font-semibold mb-3">{log.chapter}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase mb-1">Learned</p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{log.whatLearned}</p>
                    </div>
                    {log.homework && (
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Homework</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{log.homework}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
