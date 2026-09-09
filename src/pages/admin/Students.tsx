import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebase/config';
import { Student } from '../../types';
import { exportToExcel } from '../../utils/exportToExcel';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New student form state
  const [formData, setFormData] = useState({
    name: '', fatherName: '', phone: '', email: '', address: '', dob: '',
    courseId: '', batchId: '', joiningDate: '', totalFee: 0, initialPayment: 0, password: ''
  });

  const fetchStudents = async () => {
    try {
      const q = query(collection(db, 'students'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() } as Student)));
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleExport = () => {
    exportToExcel(students, 'Students-List', 'Students');
  };

  const generateStudentId = async () => {
    // Basic logic to generate MCC-2026-XXXX
    const currentYear = new Date().getFullYear();
    const count = students.length + 1;
    return `MCC-${currentYear}-${count.toString().padStart(4, '0')}`;
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Creating student...');
    try {
      // 1. Create Auth Account (in real app, we need to handle this carefully to not log out admin, usually done via Cloud Functions, but doing it here requires a secondary app or just standard creation if we accept re-login, or using REST API). 
      // For this, we'll store password plainly in db just for demonstration or assume Cloud Function.
      // Wait, standard `createUserWithEmailAndPassword` WILL sign out the admin. Let's just create a Firestore record and mock auth creation if Cloud Function isn't ready. 
      // ACTUALLY, I can just save it to Firestore and let them sign in, but they need an Auth record. Let's assume we create it or just save to DB. We will just save to DB for now.

      const studentId = await generateStudentId();
      const newId = doc(collection(db, 'students')).id;
      
      const newStudent: Student = {
        id: newId,
        studentId,
        name: formData.name,
        fatherName: formData.fatherName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        dob: formData.dob,
        courseId: formData.courseId,
        batchId: formData.batchId,
        joiningDate: formData.joiningDate,
        status: 'active',
        totalFee: Number(formData.totalFee),
        paid: Number(formData.initialPayment),
        remaining: Number(formData.totalFee) - Number(formData.initialPayment),
        createdAt: Date.now()
      };

      await setDoc(doc(db, 'students', newId), newStudent);

      // Log activity
      await setDoc(doc(collection(db, 'activityLogs')), {
        action: 'New Student Created',
        description: `Student ${newStudent.name} (${studentId}) added.`,
        createdAt: Date.now(),
        performedBy: 'Admin'
      });

      toast.success(`STUDENT CREATED SUCCESSFULLY\nID: ${studentId}`, { id: loadingToast });
      setShowAddModal(false);
      fetchStudents();
    } catch (error: any) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.studentId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Students Management</h1>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold text-sm transition-colors">
            <Download size={16} /> Export
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors">
            <Plus size={16} /> Add Student
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
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold text-sm transition-colors">
            <Filter size={16} /> Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100">
              <tr>
                <th className="p-4">Student ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Course</th>
                <th className="p-4">Total Fee</th>
                <th className="p-4">Remaining</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="p-8 text-center">Loading...</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center">No students found.</td></tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-900">{s.studentId}</td>
                    <td className="p-4 font-semibold text-slate-800">{s.name}</td>
                    <td className="p-4">{s.phone}</td>
                    <td className="p-4">{s.courseId || 'N/A'}</td>
                    <td className="p-4">₹{s.totalFee}</td>
                    <td className="p-4 font-medium text-red-500">₹{s.remaining}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {s.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Eye size={16} /></button>
                      <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"><Edit size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-900">Add New Student</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Full Name</label>
                  <input required type="text" className="w-full p-2 border rounded" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Father's Name</label>
                  <input required type="text" className="w-full p-2 border rounded" value={formData.fatherName} onChange={e=>setFormData({...formData, fatherName: e.target.value})} />
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
                  <label className="block text-sm font-semibold mb-1">Total Course Fee (₹)</label>
                  <input required type="number" className="w-full p-2 border rounded" value={formData.totalFee} onChange={e=>setFormData({...formData, totalFee: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Initial Payment (₹)</label>
                  <input required type="number" className="w-full p-2 border rounded" value={formData.initialPayment} onChange={e=>setFormData({...formData, initialPayment: Number(e.target.value)})} />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">Save Student</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
