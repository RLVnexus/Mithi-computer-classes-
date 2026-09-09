import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { FileText, Download } from 'lucide-react';
import { Student } from '../../types';

export default function StudentNotes() {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!currentUser) return;
      try {
        const sSnap = await getDocs(query(collection(db, 'students'), where('uid', '==', currentUser.uid)));
        if (!sSnap.empty) {
          const studentData = sSnap.docs[0].data() as Student;
          if (studentData.courseId) {
            // Mocking notes for the course since we don't have a 'notes' collection yet
            setNotes([
              { id: '1', title: 'Chapter 1: Introduction to Computer', type: 'PDF', size: '2.4 MB', date: '2023-10-01' },
              { id: '2', title: 'Chapter 2: Operating Systems', type: 'PDF', size: '3.1 MB', date: '2023-10-05' },
              { id: '3', title: 'MS Word Shortcut Keys', type: 'PDF', size: '1.2 MB', date: '2023-10-10' },
              { id: '4', title: 'Excel Formulas Cheat Sheet', type: 'Excel', size: '4.5 MB', date: '2023-10-15' },
            ]);
          }
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [currentUser]);

  if (loading) return <div className="p-8">Loading study materials...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Study Notes & Materials</h1>
        <p className="text-slate-600 dark:text-slate-400">Download resources and notes uploaded by your teachers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.length > 0 ? notes.map((note) => (
          <div key={note.id} className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 flex flex-col transition-all hover:shadow-md">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                <FileText size={24} />
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                {note.type}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight mb-2 flex-1">{note.title}</h3>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {note.size} • {note.date}
              </div>
              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors" title="Download">
                <Download size={20} />
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-12 text-center text-slate-500">
            No study materials available for your course yet.
          </div>
        )}
      </div>
    </div>
  );
}
