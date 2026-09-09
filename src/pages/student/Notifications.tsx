import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Bell } from 'lucide-react';
import { format } from 'date-fns';
import { Notification } from '../../types';

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const nSnap = await getDocs(query(collection(db, 'notifications'))); // Ideally filtered by student course/batch or global
        const notifs = nSnap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
        // Add some dummy if empty
        if (notifs.length === 0) {
          setNotifications([
            { id: '1', title: 'Holiday Tomorrow', message: 'The institute will remain closed tomorrow due to local festival.', targetType: 'all', createdBy: 'admin', createdAt: Date.now() - 86400000 },
            { id: '2', title: 'Fee Reminder', message: 'Please clear your pending dues before the 10th of this month.', targetType: 'all', createdBy: 'admin', createdAt: Date.now() - 172800000 },
          ]);
        } else {
          setNotifications(notifs.sort((a, b) => b.createdAt - a.createdAt));
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  if (loading) return <div className="p-8">Loading notifications...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Bell className="text-blue-600 dark:text-blue-400" /> Notifications
        </h1>
        <p className="text-slate-600 dark:text-slate-400">Stay updated with the latest announcements from the institute.</p>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? notifications.map((notif) => (
          <div key={notif.id} className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-5">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">{notif.title}</h3>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">
                {format(notif.createdAt, 'MMM dd, yyyy')}
              </span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{notif.message}</p>
          </div>
        )) : (
          <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-12 text-center text-slate-500">
            No new notifications.
          </div>
        )}
      </div>
    </div>
  );
}
