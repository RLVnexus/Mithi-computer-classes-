import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { exportToExcel } from '../../utils/exportToExcel';
import { BarChart, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminReports() {
  const handleExportAttendance = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'attendance'), orderBy('date', 'desc')));
      const data = snap.docs.map(d => d.data());
      exportToExcel(data, 'Attendance_Report', 'Attendance');
      toast.success('Report Downloaded');
    } catch (e) { toast.error('Export failed'); }
  };

  const handleExportFees = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'students')));
      const data = snap.docs.map(d => {
        const student = d.data();
        return {
          'Student ID': student.studentId,
          'Name': student.name,
          'Total Fee': student.totalFee,
          'Paid': student.paid,
          'Remaining': student.remaining,
          'Status': student.remaining === 0 ? 'Paid' : 'Pending'
        };
      });
      exportToExcel(data, 'Fees_Report', 'Fees');
      toast.success('Report Downloaded');
    } catch (e) { toast.error('Export failed'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Institute Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <BarChart size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Attendance Report</h3>
              <p className="text-sm text-slate-500">Full attendance log of all students</p>
            </div>
          </div>
          <button onClick={handleExportAttendance} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold text-sm transition-colors">
            <Download size={16} /> Export Excel
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Fees Status Report</h3>
              <p className="text-sm text-slate-500">Paid and pending fees of students</p>
            </div>
          </div>
          <button onClick={handleExportFees} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold text-sm transition-colors">
            <Download size={16} /> Export Excel
          </button>
        </div>
      </div>
    </div>
  );
}
