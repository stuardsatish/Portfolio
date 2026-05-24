import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  setDoc, 
  doc,
  query,
  orderBy
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
import { portfolioLinks } from "./components/utils/portfolioLinks";

const firebaseConfig = {
  apiKey: "AIzaSyA_i8C9oVqo3Z7AUJdxW-gDzBJ2yUlUv54",
  authDomain: "my-demo-project-52bfc.firebaseapp.com",
  projectId: "my-demo-project-52bfc",
  storageBucket: "my-demo-project-52bfc.firebasestorage.app",
  messagingSenderId: "201330298702",
  appId: "1:201330298702:web:3ae4d8bfc3c112e81e581f",
  measurementId: "G-L5YEN1WFZF"
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const storage = getStorage(app);

export interface PricingTier {
  label: string;
  price: string;
  description: string;
  delivery: string;
  revisions: string;
  features: { text: string; included: boolean }[];
}

export interface AboutGig {
  intro: string;
  emphasis: string;
  description: string;
  whatIsIncluded: string[];
  industries: string[];
  whyWorkWithMe: string[];
  outro: string;
}

export interface SellerInfo {
  name: string;
  badge: string;
  rating: number;
  reviewsCount: number;
  avatarLetter: string;
  hourlyRate: string;
}

export interface Project {
  index: number;
  title: string;
  link: string;
  img: string;
  video: string;
  seller?: SellerInfo;
  clientTag?: string;
  aboutGig?: AboutGig;
  pricingTiers?: PricingTier[];
  gallery?: string[];
}

// Function to fetch all projects from Firestore (sorted by index)
export async function getPortfolioLinksFromFirebase(): Promise<Project[]> {
  try {
    const q = query(collection(db, "portfolioLinks"), orderBy("index", "asc"));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return portfolioLinks as Project[];
    }
    
    const projects: Project[] = [];
    querySnapshot.forEach((doc) => {
      projects.push(doc.data() as Project);
    });
    return projects;
  } catch (error) {
    console.error("Error fetching portfolio links from Firebase:", error);
    return portfolioLinks as Project[];
  }
}

// Automatic seeder function with rich detailed data schema
export async function seedPortfolioLinks() {
  try {
    const querySnapshot = await getDocs(collection(db, "portfolioLinks"));
    
    let needsSeeding = false;
    if (querySnapshot.empty) {
      needsSeeding = true;
    } else {
      const firstDoc = querySnapshot.docs[0].data();
      if (!firstDoc.pricingTiers) {
        needsSeeding = true;
        console.log("🔄 [Firebase] Rich pricing detail schema upgrade detected...");
      }
    }

    if (!needsSeeding) {
      console.log("🔥 [Firebase] Portfolio links already up to date in Firestore.");
      return;
    }

    console.log("🚀 [Firebase] Starting rich database seeding to Firestore & Storage...");

    for (let i = 0; i < portfolioLinks.length; i++) {
      const item = portfolioLinks[i];
      let storageVideoUrl = item.video || "";
      let storageImgUrl = item.img || "";

      // 1. Upload Video to Firebase Storage
      if (item.video && item.video.startsWith("/")) {
        try {
          console.log(`[Firebase] Uploading video for ${item.title}...`);
          const response = await fetch(item.video);
          if (response.ok) {
            const blob = await response.blob();
            const videoRef = ref(storage, `portfolio/video-${i}.mp4`);
            await uploadBytes(videoRef, blob);
            storageVideoUrl = await getDownloadURL(videoRef);
          }
        } catch (e) {
          console.error(`[Firebase] Failed to upload local video for ${item.title}:`, e);
        }
      }

      // 2. Upload Image to Firebase Storage
      const imgPath = item.img || "/images/placeholder.webp";
      if (imgPath.startsWith("/")) {
        try {
          console.log(`[Firebase] Uploading image for ${item.title}...`);
          const response = await fetch(imgPath);
          if (response.ok) {
            const blob = await response.blob();
            const imgRef = ref(storage, `portfolio/image-${i}.webp`);
            await uploadBytes(imgRef, blob);
            storageImgUrl = await getDownloadURL(imgRef);
          }
        } catch (e) {
          console.error(`[Firebase] Failed to upload local image for ${item.title}:`, e);
        }
      }

      // ── Generate rich details dynamically for each individual project ──
      const seller: SellerInfo = {
        name: "Junald A.",
        badge: "Fiverr's Choice",
        rating: 5.0,
        reviewsCount: 206 + i * 14,
        avatarLetter: "J",
        hourlyRate: `US$${18 + i * 2}/hour`
      };

      const clientTag = i % 2 === 0 ? "🍁 Baby Boomers Cleaning" : "🚀 TechStart Solutions";

      const aboutGig: AboutGig = {
        intro: `Looking for a skilled ${item.title} developer to design or redesign your website with a modern, clean, and high-performing layout?`,
        emphasis: "You're in the right place.",
        description: `I help businesses and individuals create responsive, fast, and easy-to-manage ${item.title} websites from simple business/landing sites to advanced custom online platforms. Every site I build is optimized for speed, SEO, and user experience, so your visitors stay longer and convert better.`,
        whatIsIncluded: [
          `Custom ${item.title} website development`,
          `Redesign and revamp of existing sites`,
          `Fully responsive for all devices`,
          `Speed and performance optimization`,
          `Premium design & customization`,
          `Database / CMS setup and configuration`
        ],
        industries: [
          "Business & Corporate service",
          "Real Estate & Service-based companies",
          "Cleaning, Roofing & Local services",
          "Fitness, Sports & Health brands",
          "Education, Courses & LMS platforms",
          "eCommerce & online stores",
          "Travel, Events, Wedding & Portfolio"
        ],
        whyWorkWithMe: [
          "Clear and direct communication",
          "On-time delivery guaranteed",
          "Unlimited adjustments and revisions",
          "30 days post-delivery support"
        ],
        outro: "Ready to build a new site or redesign your current one? Message me and let's create a website that truly represents your brand."
      };

      const pricingTiers: PricingTier[] = [
        {
          label: "Basic",
          price: `US$${80 + i * 15}`,
          description: `One Page fully functional & responsive ${item.title} website design with Admin Panel | Landing Page`,
          delivery: "3-day delivery",
          revisions: "2 Revisions",
          features: [
            { text: "1 page", included: true },
            { text: "Functional website", included: true },
            { text: "Responsive design", included: true },
            { text: "Content upload", included: false },
            { text: "4 plugins/extensions", included: true }
          ]
        },
        {
          label: "Standard",
          price: `US$${150 + i * 30}`,
          description: `Up to 5 pages, fully responsive ${item.title} website with custom animations and CMS integration`,
          delivery: "5-day delivery",
          revisions: "5 Revisions",
          features: [
            { text: "Up to 5 pages", included: true },
            { text: "Functional website", included: true },
            { text: "Responsive design", included: true },
            { text: "Content upload", included: true },
            { text: "8 plugins/extensions", included: true }
          ]
        },
        {
          label: "Premium",
          price: `US$${300 + i * 50}`,
          description: `Full custom ${item.title} website with advanced features, SEO, and priority support`,
          delivery: "10-day delivery",
          revisions: "Unlimited",
          features: [
            { text: "Unlimited pages", included: true },
            { text: "Functional website", included: true },
            { text: "Responsive design", included: true },
            { text: "Content upload", included: true },
            { text: "Unlimited plugins", included: true }
          ]
        }
      ];

      // 3. Save complete structured Project Document to Firestore
      const projectDoc: Project = {
        index: i,
        title: item.title,
        link: item.link,
        img: storageImgUrl || imgPath,
        video: storageVideoUrl || item.video,
        seller,
        clientTag,
        aboutGig,
        pricingTiers
      };

      await setDoc(doc(db, "portfolioLinks", `project-${i}`), projectDoc);
      console.log(`[Firebase] Saved rich project-${i} document to Firestore:`, projectDoc);
    }

    console.log("✨ [Firebase] Rich seeding completed successfully!");
  } catch (error) {
    console.error("❌ [Firebase] Rich seeding failed:", error);
  }
}

// Auto-seed in the background when app boots up
if (typeof window !== 'undefined') {
  setTimeout(() => {
    seedPortfolioLinks();
  }, 2000);
}

export { app, analytics, db, storage };
