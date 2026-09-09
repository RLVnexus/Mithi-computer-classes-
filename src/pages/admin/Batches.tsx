import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Batch, Course, Teacher } from '../../types';
import { exportToExcel } from '../../utils/exportToExcel';
import { Plus, Search, Edit, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminBatches() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', courseId: '', teacherId: '', startTime: '', endTime: '', room: '', capacity: 30
  });

  const fetchData = async () => {
    try {
      const bSnap = await getDocs(query(collection(db, 'batches'), orderBy('createdAt', 'desc')));
      setBatches(bSnap.docs.map(d => ({ id: d.id, ...d.data() } as Batch)));
      
      const cSnap = await getDocs(collection(db, 'courses'));
      setCourses(cSnap.docs.map(d => ({ id: d.id, ...d.data() } as Course)));
      
      const tSnap = await getDocs(collection(db, 'teachers'));
      setTeachers(tSnap.docs.map(d => ({ id: d.id, ...d.data() } as Teacher)));
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Creating batch...');
    try {
      const newId = doc(collection(db, 'batches')).id;
      const count = batches.length + 1;
      const batchId = `BATCH-${new Date().getFullYear()}-${count.toString().padStart(3, '0')}`;
      
      const newBatch: Batch = {
        id: newId,
        name: formData.name,
        batchId,
        courseId: formData.courseId,
        teacherId: formData.teacherId,
        startTime: formData.startTime,
        endTime: formData.endTime,
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        room: formData.room,
        capacity: Number(formData.capacity),
        status: 'active',
        createdAt: Date.now()
      };
      
      await setDoc(doc(db, 'batches', newId), newBatch);
      
      await setDoc(doc(collection(db, 'activityLogs')), {
        action: 'New Batch Created',
        description: `Batch ${newBatch.name} (${batchId}) added.`,
        createdAt: Date.now(),
        performedBy: 'Admin'
      });

      toast.success(`BATCH CREATED SUCCESSFULLY`, { id: loadingToast });
      setShowAddModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  const filteredBatches = batches.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.batchId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Batches Management</h1>
        <div className="flex gap-2">
          <button onClick={() => exportToExcel(batches, 'Batches', 'Batches')} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold text-sm transition-colors">
            <Download size={16} /> Export
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors">
            <Plus size={16} /> New Batch
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by ID or Name..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-4">Batch ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Course</th>
                <th className="p-4">Timing</th>
                <th className="p-4">Teacher</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center">Loading...</td></tr>
              ) : filteredBatches.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center">No batches found.</td></tr>
              ) : (
                filteredBatches.map((b) => (
                  <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-900">{b.batchId}</td>
                    <td className="p-4 font-semibold text-slate-800">{b.name}</td>
                    <td className="p-4">{courses.find(c => c.id === b.courseId)?.name || 'Unknown'}</td>
                    <td className="p-4">{b.startTime} - {b.endTime}</td>
                    <td className="p-4">{teachers.find(t => t.id === b.teacherId)?.name || 'Unassigned'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${b.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {b.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"><Edit size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-900">Create New Batch</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddBatch} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Batch Name</label>
                <input required type="text" className="w-full p-2 border rounded" placeholder="e.g. WEB-MORNING-01" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Course</label>
                <select required className="w-full p-2 border rounded" value={formData.courseId} onChange={e=>setFormData({...formData, courseId: e.target.value})}>
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Teacher</label>
                <select required className="w-full p-2 border rounded" value={formData.teacherId} onChange={e=>setFormData({...formData, teacherId: e.target.value})}>
                  <option value="">Select Teacher</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Start Time</label>
                  <input required type="time" className="w-full p-2 border rounded" value={formData.startTime} onChange={e=>setFormData({...formData, startTime: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">End Time</label>
                  <input required type="time" className="w-full p-2 border rounded" value={formData.endTime} onChange={e=>setFormData({...formData, endTime: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Room / Capacity</label>
                <div className="flex gap-4">
                  <input required type="text" placeholder="Room" className="w-full p-2 border rounded" value={formData.room} onChange={e=>setFormData({...formData, room: e.target.value})} />
                  <input required type="number" placeholder="Capacity" className="w-full p-2 border rounded" value={formData.capacity} onChange={e=>setFormData({...formData, capacity: Number(e.target.value)})} />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">Save Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
