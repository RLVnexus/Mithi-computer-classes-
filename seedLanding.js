import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCqIRlO4-kefm9e5wy0hoiFpBhf-scUlOA",
  authDomain: "mithi-computer-class-d7328.firebaseapp.com",
  projectId: "mithi-computer-class-d7328",
  storageBucket: "mithi-computer-class-d7328.firebasestorage.app",
  messagingSenderId: "653973127515",
  appId: "1:653973127515:web:6d628ceeb9046b7f4bda7e",
  measurementId: "G-XWGG5JSC4H"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  await addDoc(collection(db, 'heroSlides'), {
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80',
    title: 'Practical Learning Environment',
    subtitle: 'State of the art labs',
    order: 1,
    isActive: true,
    createdAt: Date.now()
  });

  await addDoc(collection(db, 'heroSlides'), {
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80',
    title: 'Expert Faculty',
    subtitle: 'Learn from industry professionals',
    order: 2,
    isActive: true,
    createdAt: Date.now()
  });
  
  await addDoc(collection(db, 'reviews'), {
    studentName: 'Rahul Kumar',
    courseName: 'Web Development',
    rating: 5,
    comment: 'The best computer class in Raniganj. The teachers are very helpful and the practical sessions are amazing.',
    isApproved: true,
    createdAt: Date.now()
  });
  
  await addDoc(collection(db, 'reviews'), {
    studentName: 'Sneha Singh',
    courseName: 'DCA / ADCA',
    rating: 4,
    comment: 'I learned everything from basics. Now I am very confident using computers and MS Office.',
    isApproved: true,
    createdAt: Date.now()
  });
  
  await addDoc(collection(db, 'reviews'), {
    studentName: 'Aman Verma',
    courseName: 'Graphic Design',
    rating: 5,
    comment: 'Great infrastructure and completely practical oriented classes. Highly recommended!',
    isApproved: true,
    createdAt: Date.now()
  });
  console.log("Seeding complete!");
}

seed().catch(console.error);
