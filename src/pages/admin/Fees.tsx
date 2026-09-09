import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FeePayment, Student } from '../../types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { exportToExcel } from '../../utils/exportToExcel';
import { CreditCard, Download, Search, Plus } from 'lucide-react';

export default function AdminFees() {
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  const [formData, setFormData] = useState({
    amount: 0, paymentMethod: 'Cash', notes: '', date: format(new Date(), 'yyyy-MM-dd')
  });

  const fetchData = async () => {
    try {
      const sSnap = await getDocs(query(collection(db, 'students')));
      setStudents(sSnap.docs.map(d => ({ id: d.id, ...d.data() } as Student)));
      
      const pSnap = await getDocs(query(collection(db, 'payments'), orderBy('createdAt', 'desc')));
      setPayments(pSnap.docs.map(d => ({ id: d.id, ...d.data() } as FeePayment)));
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    
    const loadingToast = toast.loading('Processing payment...');
    try {
      const paymentId = `PAY-${Date.now()}`;
      const newId = doc(collection(db, 'payments')).id;
      
      const newPayment: FeePayment = {
        id: newId,
        paymentId,
        studentId: selectedStudent.studentId,
        studentUid: selectedStudent.id,
        studentName: selectedStudent.name,
        courseId: selectedStudent.courseId,
        amount: Number(formData.amount),
        date: formData.date,
        paymentMethod: formData.paymentMethod as any,
        receiptNumber: `REC-${Date.now()}`,
        receivedBy: 'Admin',
        notes: formData.notes,
        createdAt: Date.now()
      };
      
      await setDoc(doc(db, 'payments', newId), newPayment);
      
      // Update student remaining balance
      const newPaid = selectedStudent.paid + newPayment.amount;
      const newRemaining = selectedStudent.totalFee - newPaid;
      
      await updateDoc(doc(db, 'students', selectedStudent.id), {
        paid: newPaid,
        remaining: newRemaining
      });

      await setDoc(doc(collection(db, 'activityLogs')), {
        action: 'Fee Payment Added',
        description: `₹${newPayment.amount} received from ${selectedStudent.name}.`,
        createdAt: Date.now(),
        performedBy: 'Admin'
      });

      toast.success(`PAYMENT ADDED SUCCESSFULLY`, { id: loadingToast });
      setShowPaymentModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  const pendingStudents = students.filter(s => s.remaining > 0 && 
    (s.name.toLowerCase().includes(search.toLowerCase()) || 
     s.studentId.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Fees & Payments</h1>
        <button onClick={() => exportToExcel(payments, 'Payments', 'Payments')} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold text-sm transition-colors">
          <Download size={16} /> Export Payments
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Fees Students */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-lg text-slate-900">Pending Fees</h2>
            <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text"
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100 sticky top-0">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Remaining</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="p-4 text-center">Loading...</td></tr>
                ) : pendingStudents.length === 0 ? (
                  <tr><td colSpan={3} className="p-4 text-center">No pending fees.</td></tr>
                ) : (
                  pendingStudents.map(s => (
                    <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.studentId}</p>
                      </td>
                      <td className="p-3 font-bold text-red-600">₹{s.remaining}</td>
                      <td className="p-3">
                        <button 
                          onClick={() => { setSelectedStudent(s); setShowPaymentModal(true); }}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold rounded text-xs transition-colors"
                        >
                          Collect Fee
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-bold text-lg text-slate-900">Recent Payments</h2>
          </div>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100 sticky top-0">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Student</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Method</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr>
                ) : payments.length === 0 ? (
                  <tr><td colSpan={4} className="p-4 text-center">No recent payments.</td></tr>
                ) : (
                  payments.slice(0, 15).map(p => (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="p-3 whitespace-nowrap">{p.date}</td>
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{p.studentName}</p>
                        <p className="text-xs text-slate-500">{p.studentId}</p>
                      </td>
                      <td className="p-3 font-bold text-green-600">₹{p.amount}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">{p.paymentMethod}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showPaymentModal && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-900">Collect Fee</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6 bg-slate-50 border-b border-slate-100">
              <p className="font-semibold text-slate-900">{selectedStudent.name} ({selectedStudent.studentId})</p>
              <p className="text-sm text-red-600 font-bold mt-1">Pending Balance: ₹{selectedStudent.remaining}</p>
            </div>
            <form onSubmit={handleAddPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Payment Amount (₹)</label>
                <input required type="number" max={selectedStudent.remaining} className="w-full p-2.5 border rounded-lg bg-slate-50 text-lg font-bold" value={formData.amount} onChange={e=>setFormData({...formData, amount: Number(e.target.value)})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Date</label>
                  <input required type="date" className="w-full p-2.5 border rounded-lg bg-slate-50" value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Method</label>
                  <select required className="w-full p-2.5 border rounded-lg bg-slate-50" value={formData.paymentMethod} onChange={e=>setFormData({...formData, paymentMethod: e.target.value})}>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Notes (Optional)</label>
                <input type="text" className="w-full p-2.5 border rounded-lg bg-slate-50" placeholder="Transaction ID, etc." value={formData.notes} onChange={e=>setFormData({...formData, notes: e.target.value})} />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">Submit Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
