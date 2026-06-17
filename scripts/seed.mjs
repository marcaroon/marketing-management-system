import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, Timestamp } from "firebase/firestore";

// Parse environment variables since we are not in Next.js context
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const users = [
  {
    email: "admin@example.com",
    password: "password123",
    displayName: "Admin Master",
    phone: "081234567890",
    role: "admin",
    status: "active",
  },
  {
    email: "marketing@example.com",
    password: "password123",
    displayName: "Marketing Staff",
    phone: "081234567891",
    role: "marketing",
    status: "active",
  }
];

async function seedUsers() {
  console.log("Starting user seeding for Firebase Project:", firebaseConfig.projectId);
  
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("dummy")) {
    console.error("ERROR: Invalid API Key. Please ensure your .env.local has real Firebase configuration.");
    process.exit(1);
  }

  for (const user of users) {
    try {
      console.log(`\nCreating auth user: ${user.email}...`);
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      const uid = userCredential.user.uid;
      
      console.log(`Creating firestore document for UID: ${uid}...`);
      await setDoc(doc(db, "users", uid), {
        uid,
        email: user.email,
        displayName: user.displayName,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      console.log(`✅ Successfully created user ${user.email}`);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️ User ${user.email} already exists. Skipping...`);
      } else {
        console.error(`❌ Error creating user ${user.email}:`, error.message);
      }
    }
  }
  
  console.log("\n🎉 Seeding completed!");
  process.exit(0);
}

seedUsers();
