import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Course, Teacher, HeroSlide, Review } from '../../types';
import { BookOpen, Users, ImageIcon, Phone, PlayCircle, FileText, ChevronRight, Star } from 'lucide-react';
import { ThemeToggle } from '../../components/ThemeToggle';
import { CreatorCredit } from '../../components/CreatorCredit';
import { Loader } from '../../components/Loader';

const FALLBACK_SLIDES: HeroSlide[] = [
  { id: '1', imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80', title: 'Practical Learning Environment', subtitle: 'State of the art labs', order: 1, isActive: true, createdAt: 0 },
  { id: '2', imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80', title: 'Expert Faculty', subtitle: 'Learn from industry professionals', order: 2, isActive: true, createdAt: 0 }
];

export default function LandingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cSnap, tSnap, rSnap, sSnap] = await Promise.all([
          getDocs(query(collection(db, 'courses'), where('status', '==', 'active'))),
          getDocs(query(collection(db, 'teachers'), where('status', '==', 'active'))),
          getDocs(query(collection(db, 'reviews'), where('isApproved', '==', true))),
          getDocs(query(collection(db, 'heroSlides'), where('isActive', '==', true)))
        ]);

        setCourses(cSnap.docs.map(d => ({ id: d.id, ...d.data() } as Course)));
        setTeachers(tSnap.docs.map(d => ({ id: d.id, ...d.data() } as Teacher)));
        setReviews(rSnap.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
        
        const fetchedSlides = sSnap.docs.map(d => ({ id: d.id, ...d.data() } as HeroSlide));
        setSlides(fetchedSlides.sort((a, b) => a.order - b.order));
      } catch (error) {
        console.error("Error fetching landing data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeSlides = slides.length > 0 ? slides : FALLBACK_SLIDES;

  useEffect(() => {
    if (activeSlides.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [activeSlides.length]);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-sm z-50 transition-colors duration-300 border-b border-transparent dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xl">M</span>
              </div>
              <div>
                <h1 className="font-black text-xl text-slate-900 dark:text-white leading-none">MITHI</h1>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Computer Classes</p>
              </div>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#about" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</a>
              <a href="#courses" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Courses</a>
              <a href="#teachers" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Teachers</a>
              <a href="#reviews" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Reviews</a>
              <a href="#gallery" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Gallery</a>
              <a href="#contact" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-colors shadow-lg shadow-blue-200 dark:shadow-blue-900/50">
                Portal Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
            Best Computer Institute in Raniganj
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight">
            Master the Digital World with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">Mithi Classes</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
            Empowering students in Raniganj with top-tier computer education, modern facilities, expert teachers, and practical learning resources.
          </p>
          <div className="flex gap-4">
            <a href="#courses" className="bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 px-8 py-3.5 rounded-full font-bold transition-all flex items-center gap-2 shadow-xl shadow-slate-200 dark:shadow-slate-900">
              Explore Courses <ChevronRight size={18} />
            </a>
          </div>
        </div>
        <div className="flex-1 w-full relative">
          <div className="aspect-square md:aspect-[4/3] rounded-3xl bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-2xl relative">
            {activeSlides.map((slide, idx) => (
              <div 
                key={slide.id} 
                className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
              >
                <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <h3 className="font-bold text-2xl md:text-3xl tracking-tight mb-2">{slide.title}</h3>
                  <p className="text-slate-200 font-medium">{slide.subtitle}</p>
                </div>
              </div>
            ))}
            
            {/* Slider Dots */}
            {activeSlides.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {activeSlides.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-blue-500 w-6' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">About Mithi Computer Classes</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
            Located in the heart of Raniganj, Mithi Computer Classes is dedicated to providing high-quality digital education. From basic computer literacy to advanced programming, our mission is to equip students with the skills required to excel in the modern technological landscape.
          </p>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Featured Courses</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4 font-medium">Comprehensive curriculum designed for practical success</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.length > 0 ? courses.map((course) => (
              <div key={course.id} className="bg-white dark:bg-slate-950 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 dark:border-slate-800 transition-all group flex flex-col">
                <div className="aspect-video bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
                  {course.imageUrl ? (
                    <img src={course.imageUrl} alt={course.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-900">
                      <BookOpen size={48} />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-black/90 backdrop-blur rounded-full text-xs font-bold text-slate-900 dark:text-white shadow-sm">
                    {course.code}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{course.name}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-2 flex-1">{course.description}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-lg text-blue-600 dark:text-blue-400">₹{course.fee}</span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">{course.duration}</span>
                  </div>
                </div>
              </div>
            )) : (
              <p className="col-span-full text-center text-slate-500 py-10">Courses are being updated. Check back soon!</p>
            )}
          </div>
          <div className="text-center mt-12">
            <Link to="/login" className="inline-block bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-900 dark:hover:border-white hover:text-slate-900 dark:hover:text-white font-bold px-8 py-3 rounded-full transition-colors shadow-sm">
              Login to Access Course Materials
            </Link>
          </div>
        </div>
      </section>

      {/* Teachers Gallery Section */}
      <section id="teachers" className="py-20 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Meet Our Expert Faculty</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4 font-medium">Learn from experienced industry professionals</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {teachers.length > 0 ? teachers.map((teacher, i) => (
              <div key={teacher.id} className="text-center group">
                <div className="w-40 h-40 mx-auto rounded-full overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-900 shadow-lg group-hover:border-blue-100 dark:group-hover:border-blue-900 transition-colors flex items-center justify-center">
                   <img src={`https://i.pravatar.cc/300?img=${(i % 50) + 1}`} alt={teacher.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{teacher.name}</h3>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{teacher.subject}</p>
              </div>
            )) : (
              <p className="col-span-full text-center text-slate-500 py-10">Faculty profiles updating soon.</p>
            )}
          </div>
        </div>
      </section>
      
      {/* Reviews Section */}
      <section id="reviews" className="py-20 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Student Reviews</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4 font-medium">What our successful students say about us</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.length > 0 ? reviews.map(review => (
              <div key={review.id} className="bg-white dark:bg-slate-950 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 relative">
                <div className="flex items-center gap-1 mb-4 text-yellow-400">
                  {Array.from({length: review.rating}).map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                </div>
                <p className="text-slate-700 dark:text-slate-300 italic mb-6">"{review.comment}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold">
                    {review.studentName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{review.studentName}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{review.courseName}</p>
                  </div>
                </div>
              </div>
            )) : (
              <p className="col-span-full text-center text-slate-500 py-10">Reviews are being gathered.</p>
            )}
          </div>
        </div>
      </section>

      {/* Campus Gallery */}
      <section id="gallery" className="py-20 bg-slate-900 dark:bg-black text-white transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black">Institute Gallery</h2>
              <p className="text-slate-400 mt-2 font-medium">Glimpses of our computer labs and classrooms</p>
            </div>
            <ImageIcon className="text-slate-700 dark:text-slate-800" size={48} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden bg-slate-800">
              <img src="https://images.unsplash.com/photo-1571260899304-425dea57a228?auto=format&fit=crop&q=80" alt="Lab" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-800 aspect-square">
              <img src="https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80" alt="Class" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-800 aspect-square">
              <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80" alt="Code" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-800 aspect-square">
              <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80" alt="Students" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-800 aspect-square">
              <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80" alt="Study" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer & Contact */}
      <footer id="contact" className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-20 pb-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Contact Us</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8">Ready to start your journey? Reach out to us for admission inquiries or any other questions.</p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Phone size={18} />
                  </div>
                  <p className="font-bold">+91 6203646824</p>
                </div>
                <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <BookOpen size={18} />
                  </div>
                  <p className="font-bold">Mithi Computer Classes, Main Road, Raniganj</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-6">Send an Inquiry</h4>
              <form className="space-y-4">
                <div>
                  <input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <input type="tel" placeholder="Phone Number" className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <textarea placeholder="Message" rows={3} className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"></textarea>
                </div>
                <button type="button" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                  Submit Inquiry
                </button>
              </form>
            </div>
          </div>
          
          <div className="text-center pt-8 border-t border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center">
            <p className="mb-8">&copy; {new Date().getFullYear()} Mithi Computer Classes, Raniganj. All rights reserved.</p>
            <CreatorCredit />
          </div>
        </div>
      </footer>
    </div>
  );
}
