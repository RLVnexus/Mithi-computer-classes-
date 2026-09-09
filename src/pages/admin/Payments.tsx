import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FeePayment } from '../../types';
import { exportToExcel } from '../../utils/exportToExcel';
import { Search, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPayments() {
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPayments = async () => {
    try {
      const pSnap = await getDocs(query(collection(db, 'payments'), orderBy('createdAt', 'desc')));
      setPayments(pSnap.docs.map(d => ({ id: d.id, ...d.data() } as FeePayment)));
    } catch (error) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const filteredPayments = payments.filter(p => 
    p.studentName.toLowerCase().includes(search.toLowerCase()) || 
    p.receiptNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Payment History</h1>
        <button onClick={() => exportToExcel(payments, 'Payment-History', 'Payments')} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold text-sm transition-colors">
          <Download size={16} /> Export to Excel
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by Student or Receipt..."
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
                <th className="p-4">Receipt No.</th>
                <th className="p-4">Date</th>
                <th className="p-4">Student</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Method</th>
                <th className="p-4">Notes</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center">Loading...</td></tr>
              ) : filteredPayments.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center">No payments found.</td></tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-900">{p.receiptNumber}</td>
                    <td className="p-4">{p.date}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{p.studentName}</p>
                      <p className="text-xs text-slate-500">{p.studentId}</p>
                    </td>
                    <td className="p-4 font-bold text-green-600">₹{p.amount}</td>
                    <td className="p-4">{p.paymentMethod}</td>
                    <td className="p-4 text-xs text-slate-500 max-w-[150px] truncate">{p.notes || '-'}</td>
                    <td className="p-4 flex gap-2">
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Download Receipt"><FileText size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
