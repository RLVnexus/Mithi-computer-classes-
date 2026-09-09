import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRoleRedirect = async (user: any) => {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const role = userDoc.data().role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'student') navigate('/student');
      else {
        toast.error('Invalid role setup');
        await auth.signOut();
      }
    } else {
      // If user doesn't exist in DB (e.g., first time Google Login), create as student
      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName || 'Student',
        email: user.email,
        role: 'student',
        createdAt: Date.now()
      });
      // Auto-create a student record too
      const studentId = `STU${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      await setDoc(doc(db, 'students', user.uid), { // using uid as doc id for simplicity
        uid: user.uid,
        studentId: studentId,
        name: user.displayName || 'Student',
        email: user.email,
        phone: '',
        parentName: '',
        parentPhone: '',
        address: '',
        courseId: '',
        batchId: '',
        totalFees: 0,
        paid: 0,
        remaining: 0,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active',
        createdAt: Date.now()
      });
      navigate('/student');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await handleRoleRedirect(userCredential.user);
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await handleRoleRedirect(result.user);
    } catch (error: any) {
      toast.error(error.message || 'Google Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <Toaster />
      
      {/* Back to Home Link */}
      <Link to="/" className="mb-6 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
        &larr; Back to Home
      </Link>

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-slate-900 leading-tight">
            MITHI <br/><span className="text-blue-600">COMPUTER CLASSES</span>
          </h1>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mt-2">Portal Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-70"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center space-x-2">
          <div className="h-px w-full bg-slate-200"></div>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">OR</span>
          <div className="h-px w-full bg-slate-200"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="mt-6 w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-70"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </button>

        <p className="mt-8 text-center text-sm font-semibold text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-800 transition-colors">
            Create Student Account
          </Link>
        </p>
      </div>
    </div>
  );
}
