import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Users, UserCheck, UserX, Percent, BookOpen, Clock, 
  CreditCard, TrendingUp, Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    todayPresent: 0,
    todayAbsent: 0,
    todayAttendancePercent: 0,
    totalCourses: 0,
    totalBatches: 0,
    totalTeachers: 0,
    todayFeeCollection: 0,
    totalPendingFees: 0,
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        
        // Fetch Students
        const studentsSnap = await getDocs(collection(db, 'students'));
        let active = 0;
        let pendingFees = 0;
        studentsSnap.forEach(doc => {
          const data = doc.data();
          if (data.status === 'active') active++;
          pendingFees += data.remaining || 0;
        });

        // Fetch Courses, Batches, Teachers
        const coursesSnap = await getDocs(collection(db, 'courses'));
        const batchesSnap = await getDocs(collection(db, 'batches'));
        const teachersSnap = await getDocs(collection(db, 'teachers'));

        // Fetch Today's Attendance
        const attendanceQuery = query(collection(db, 'attendance'), where('date', '==', today));
        const attendanceSnap = await getDocs(attendanceQuery);
        let present = 0;
        let absent = 0;
        attendanceSnap.forEach(doc => {
          if (doc.data().status === 'present') present++;
          if (doc.data().status === 'absent') absent++;
        });
        const totalMarked = present + absent;
        const percent = totalMarked > 0 ? Math.round((present / totalMarked) * 100) : 0;

        // Fetch Today's Payments
        const paymentsQuery = query(collection(db, 'payments'), where('date', '==', today));
        const paymentsSnap = await getDocs(paymentsQuery);
        let todayFees = 0;
        paymentsSnap.forEach(doc => {
          todayFees += doc.data().amount || 0;
        });

        setStats({
          totalStudents: studentsSnap.size,
          activeStudents: active,
          todayPresent: present,
          todayAbsent: absent,
          todayAttendancePercent: percent,
          totalCourses: coursesSnap.size,
          totalBatches: batchesSnap.size,
          totalTeachers: teachersSnap.size,
          todayFeeCollection: todayFees,
          totalPendingFees: pendingFees,
        });

        // Fetch Recent Activities
        const activitiesSnap = await getDocs(collection(db, 'activityLogs'));
        const activities = activitiesSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a: any, b: any) => b.createdAt - a.createdAt)
          .slice(0, 5);
        
        setRecentActivities(activities);

      } catch (error) {
        console.error("Error fetching dashboard data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'bg-blue-500' },
    { title: 'Active Students', value: stats.activeStudents, icon: UserCheck, color: 'bg-green-500' },
    { title: "Today's Present", value: stats.todayPresent, icon: UserCheck, color: 'bg-emerald-500' },
    { title: "Today's Absent", value: stats.todayAbsent, icon: UserX, color: 'bg-red-500' },
    { title: 'Attendance %', value: `${stats.todayAttendancePercent}%`, icon: Percent, color: 'bg-indigo-500' },
    { title: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: 'bg-purple-500' },
    { title: 'Total Batches', value: stats.totalBatches, icon: Clock, color: 'bg-orange-500' },
    { title: 'Total Teachers', value: stats.totalTeachers, icon: Users, color: 'bg-teal-500' },
    { title: "Today's Collection", value: `₹${stats.todayFeeCollection}`, icon: CreditCard, color: 'bg-green-600' },
    { title: 'Pending Fees', value: `₹${stats.totalPendingFees}`, icon: TrendingUp, color: 'bg-red-600' },
  ];

  if (loading) return <div className="p-8">Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="text-sm text-slate-500">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-4 border border-slate-100 flex items-center gap-4">
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-white shrink-0`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{stat.title}</p>
                <p className="text-xl font-bold text-slate-900 leading-tight">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts placeholder */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Weekly Attendance</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: 'Mon', present: 40, absent: 5 }, { name: 'Tue', present: 38, absent: 7 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip />
                <Bar dataKey="present" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Recent Activities</h2>
            <Activity className="text-slate-400" size={20} />
          </div>
          <div className="space-y-4">
            {recentActivities.length > 0 ? recentActivities.map((activity: any) => (
              <div key={activity.id} className="flex gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0"></div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{activity.action}</p>
                  <p className="text-xs text-slate-500">{activity.description}</p>
                  <p className="text-xs text-slate-400 mt-1">{format(new Date(activity.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-500">No recent activities.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
