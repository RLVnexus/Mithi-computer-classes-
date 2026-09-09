import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Teacher } from '../../types';
import { exportToExcel } from '../../utils/exportToExcel';
import { Plus, Search, User, Edit, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', subject: '', joiningDate: ''
  });

  const fetchTeachers = async () => {
    try {
      const q = query(collection(db, 'teachers'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setTeachers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Teacher)));
    } catch (error) {
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeachers(); }, []);

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Creating teacher...');
    try {
      const newId = doc(collection(db, 'teachers')).id;
      const count = teachers.length + 1;
      const teacherId = `TCH-${new Date().getFullYear()}-${count.toString().padStart(3, '0')}`;
      
      const newTeacher: Teacher = {
        id: newId,
        teacherId,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        subject: formData.subject,
        joiningDate: formData.joiningDate,
        courseIds: [],
        batchIds: [],
        status: 'active',
        createdAt: Date.now()
      };
      await setDoc(doc(db, 'teachers', newId), newTeacher);
      
      await setDoc(doc(collection(db, 'activityLogs')), {
        action: 'New Teacher Created',
        description: `Teacher ${newTeacher.name} (${teacherId}) added.`,
        createdAt: Date.now(),
        performedBy: 'Admin'
      });

      toast.success(`TEACHER CREATED SUCCESSFULLY`, { id: loadingToast });
      setShowAddModal(false);
      fetchTeachers();
    } catch (error: any) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.teacherId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Teachers Management</h1>
        <div className="flex gap-2">
          <button onClick={() => exportToExcel(teachers, 'Teachers', 'Teachers')} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold text-sm transition-colors">
            <Download size={16} /> Export
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors">
            <Plus size={16} /> Add Teacher
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
                <th className="p-4">Teacher ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Batches</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center">Loading...</td></tr>
              ) : filteredTeachers.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center">No teachers found.</td></tr>
              ) : (
                filteredTeachers.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-900">{t.teacherId}</td>
                    <td className="p-4 font-semibold text-slate-800">{t.name}</td>
                    <td className="p-4">{t.phone}</td>
                    <td className="p-4">{t.subject}</td>
                    <td className="p-4">{t.batchIds?.length || 0} Batches</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {t.status.toUpperCase()}
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
              <h2 className="text-xl font-bold text-slate-900">Add New Teacher</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddTeacher} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Full Name</label>
                <input required type="text" className="w-full p-2 border rounded" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Phone</label>
                <input required type="text" className="w-full p-2 border rounded" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input required type="email" className="w-full p-2 border rounded" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Subject</label>
                <input required type="text" className="w-full p-2 border rounded" value={formData.subject} onChange={e=>setFormData({...formData, subject: e.target.value})} />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">Save Teacher</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
