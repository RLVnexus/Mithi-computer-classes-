import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { AdminLayout } from '../components/layouts/AdminLayout';
import { StudentLayout } from '../components/layouts/StudentLayout';

// Pages
import LandingPage from '../pages/public/LandingPage';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminStudents from '../pages/admin/Students';
import AdminCourses from '../pages/admin/Courses';
import AdminTeachers from '../pages/admin/Teachers';
import AdminBatches from '../pages/admin/Batches';
import AdminAttendance from '../pages/admin/Attendance';
import AdminClasses from '../pages/admin/Classes';
import AdminFees from '../pages/admin/Fees';
import AdminPayments from '../pages/admin/Payments';
import AdminReports from '../pages/admin/Reports';

// Placeholder Student Pages
import StudentDashboard from '../pages/student/Dashboard';
import StudentNotes from '../pages/student/Notes';
import StudentNotifications from '../pages/student/Notifications';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      
      <Route element={<PublicRoute><Outlet /></PublicRoute>}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout><Outlet /></AdminLayout>}>
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="teachers" element={<AdminTeachers />} />
          <Route path="batches" element={<AdminBatches />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="classes" element={<AdminClasses />} />
          <Route path="fees" element={<AdminFees />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>
      </Route>

      {/* Student Routes */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/student" element={<StudentLayout><Outlet /></StudentLayout>}>
          <Route index element={<StudentDashboard />} />
          <Route path="notes" element={<StudentNotes />} />
          <Route path="notifications" element={<StudentNotifications />} />
          {/* Mapping other sidebar links back to dashboard for unified view */}
          <Route path="attendance" element={<StudentDashboard />} />
          <Route path="fees" element={<StudentDashboard />} />
          <Route path="profile" element={<StudentDashboard />} />
        </Route>
      </Route>

      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};
