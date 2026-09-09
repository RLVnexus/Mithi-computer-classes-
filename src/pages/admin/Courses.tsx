import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Course } from '../../types';
import { exportToExcel } from '../../utils/exportToExcel';
import { Plus, Search, BookOpen, Edit, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', code: '', description: '', duration: '', fee: 0
  });

  const fetchCourses = async () => {
    try {
      const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Course)));
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Creating course...');
    try {
      const newId = doc(collection(db, 'courses')).id;
      const newCourse: Course = {
        id: newId,
        name: formData.name,
        code: formData.code,
        description: formData.description,
        duration: formData.duration,
        fee: Number(formData.fee),
        status: 'active',
        createdAt: Date.now()
      };
      await setDoc(doc(db, 'courses', newId), newCourse);
      
      await setDoc(doc(collection(db, 'activityLogs')), {
        action: 'New Course Created',
        description: `Course ${newCourse.name} (${newCourse.code}) added.`,
        createdAt: Date.now(),
        performedBy: 'Admin'
      });

      toast.success(`COURSE CREATED SUCCESSFULLY`, { id: loadingToast });
      setShowAddModal(false);
      fetchCourses();
    } catch (error: any) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Courses Management</h1>
        <div className="flex gap-2">
          <button onClick={() => exportToExcel(courses, 'Courses', 'Courses')} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold text-sm transition-colors">
            <Download size={16} /> Export
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors">
            <Plus size={16} /> New Course
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="p-4 text-slate-500">Loading courses...</p>
        ) : filteredCourses.length === 0 ? (
          <p className="p-4 text-slate-500">No courses found.</p>
        ) : (
          filteredCourses.map((c) => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen size={24} />
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {c.status.toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{c.name}</h3>
              <p className="text-sm font-semibold text-blue-600 mb-4">{c.code}</p>
              <p className="text-sm text-slate-600 mb-6 flex-1 line-clamp-2">{c.description}</p>
              
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-auto">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Fee</p>
                  <p className="font-bold text-slate-900">₹{c.fee}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Duration</p>
                  <p className="font-bold text-slate-900">{c.duration}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-900">Add New Course</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Course Name</label>
                <input required type="text" className="w-full p-2 border rounded" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Course Code</label>
                <input required type="text" className="w-full p-2 border rounded" value={formData.code} onChange={e=>setFormData({...formData, code: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Duration</label>
                <input required type="text" className="w-full p-2 border rounded" placeholder="e.g. 6 Months" value={formData.duration} onChange={e=>setFormData({...formData, duration: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Course Fee (₹)</label>
                <input required type="number" className="w-full p-2 border rounded" value={formData.fee} onChange={e=>setFormData({...formData, fee: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Description</label>
                <textarea className="w-full p-2 border rounded" rows={3} value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">Save Course</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
