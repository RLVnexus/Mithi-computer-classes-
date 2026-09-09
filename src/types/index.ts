export type Role = 'admin' | 'student';

export interface User {
  uid: string;
  email: string;
  role: Role;
  name: string;
  createdAt: number;
}

export interface Student {
  id: string; // Firestore doc ID
  studentId: string; // e.g., MCC-2026-0001
  name: string;
  fatherName: string;
  phone: string;
  email: string;
  address: string;
  dob: string;
  courseId: string;
  batchId: string;
  joiningDate: string;
  status: 'active' | 'disabled';
  photoUrl?: string;
  totalFee: number;
  paid: number;
  remaining: number;
  uid?: string; // Firebase Auth UID
  createdAt: number;
}

export interface Teacher {
  id: string;
  teacherId: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  joiningDate: string;
  courseIds: string[];
  batchIds: string[];
  status: 'active' | 'disabled';
  createdAt: number;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  duration: string;
  fee: number;
  imageUrl?: string;
  status: 'active' | 'archived';
  createdAt: number;
}

export interface Batch {
  id: string;
  name: string;
  batchId: string;
  courseId: string;
  teacherId: string;
  startTime: string;
  endTime: string;
  days: string[];
  room: string;
  capacity: number;
  status: 'active' | 'archived';
  createdAt: number;
}

export interface Attendance {
  id: string;
  studentId: string; // the MCC-2026-0001
  studentUid: string; // Firestore doc id of student
  studentName: string;
  courseId: string;
  batchId: string;
  date: string; // YYYY-MM-DD
  time: string;
  status: 'present' | 'absent' | 'late';
  markedByAdmin: boolean;
  adminUid: string;
  createdAt: number;
}

export interface FeePayment {
  id: string;
  paymentId: string;
  studentId: string;
  studentUid: string;
  studentName: string;
  courseId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Other';
  receiptNumber: string;
  receivedBy: string;
  notes: string;
  createdAt: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  subject: string;
  chapter: string;
  title: string;
  description: string;
  videoUrl?: string;
  pdfUrl?: string;
  notes?: string;
  homework?: string;
  duration?: string;
  status: 'published' | 'draft';
  order: number;
  createdAt: number;
}

export interface ClassLog {
  id: string;
  courseId: string;
  batchId: string;
  date: string;
  topic: string;
  chapter: string;
  lessonId?: string;
  whatLearned: string;
  homework: string;
  notes: string;
  videoUrl?: string;
  pdfUrl?: string;
  createdAt: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  performedBy: string;
  performedByUid: string;
  targetId: string;
  createdAt: number;
}

export interface HeroSlide {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  order: number;
  isActive: boolean;
  createdAt: number;
}

export interface Review {
  id: string;
  studentName: string;
  courseName: string;
  rating: number; // 1 to 5
  comment: string;
  imageUrl?: string;
  isApproved: boolean;
  createdAt: number;
}

export interface Notification {

  id: string;
  title: string;
  message: string;
  targetType: 'all' | 'course' | 'batch' | 'student';
  targetId?: string; // Course ID, Batch ID, or Student ID
  createdAt: number;
  createdBy: string;
}
