import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TiLocationArrow } from "react-icons/ti";
import { useState, useEffect } from "react";
import { FiCheck, FiX, FiClock, FiRefreshCw, FiArrowRight } from "react-icons/fi";
import { useParams, Link } from "react-router-dom";
import { getPortfolioLinksFromFirebase, Project, storage } from "../firebase";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import "./styles/WorkDetail.css";

gsap.registerPlugin(ScrollTrigger);

const WorkDetail = () => {
  const { id } = useParams<{ id: string }>();
  const index = parseInt(id || "0", 10);
  const [project, setProject] = useState<Project | null>(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);

  const [fetchedVideo, setFetchedVideo] = useState<string | null>(null);
  const [fetchedThumbnail, setFetchedThumbnail] = useState<string | undefined>(undefined);
  const [fetchedGallery, setFetchedGallery] = useState<string[]>([]);

  useEffect(() => {
    document.body.style.overflow = "auto";
    document.body.style.overflowY = "auto";
    getPortfolioLinksFromFirebase().then((data) => {
      if (data && data[index]) {
        setProject(data[index]);
      }
      setDbLoading(false);
    });
  }, [index]);

  useEffect(() => {
    const fetchStorageMedia = async () => {
      try {
        const projectRef = ref(storage, `portfolio/project-${index}`);
        const projectList = await listAll(projectRef);

        let videoUrl: string | null = null;
        let thumbnailUrl: string | undefined = undefined;

        for (const item of projectList.items) {
          const name = item.name.toLowerCase();
          if (name.endsWith('.mp4') || name.endsWith('.webm') || name.endsWith('.mov')) {
            videoUrl = await getDownloadURL(item);
          } else if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.webp')) {
            thumbnailUrl = await getDownloadURL(item);
          }
        }

        if (videoUrl) setFetchedVideo(videoUrl);
        if (thumbnailUrl) setFetchedThumbnail(thumbnailUrl);

        try {
          const galleryRef = ref(storage, `portfolio/project-${index}/gallery`);
          const galleryList = await listAll(galleryRef);
          const galleryUrls = await Promise.all(
            galleryList.items.map(item => getDownloadURL(item))
          );
          setFetchedGallery(galleryUrls);
        } catch (galleryErr) {
          console.error("Error fetching gallery from storage:", galleryErr);
        }

      } catch (err) {
        console.error("Error fetching from storage:", err);
      }
    };
    fetchStorageMedia();
  }, [index]);

  const handleVideoLoad = () => {
    setVideoLoading(false);
  };

  const handleVideoError = () => {
    setVideoLoading(false);
    console.error("Failed to load video.");
  };

  useGSAP(() => {
    if (!project) return;
    gsap.set("#video-frame", {
      clipPath: "polygon(14% 0, 72% 0, 88% 90%, 0 95%)",
      borderRadius: "0% 0% 40% 10%",
    });
    gsap.from("#video-frame", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      borderRadius: "0% 0% 0% 0%",
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: "#video-frame",
        start: "center center",
        end: "bottom center",
        scrub: true,
      },
    });
  }, [project]);

  if (dbLoading) {
    return (
      <div className="loading-screen" style={{ backgroundColor: '#000', color: '#fff' }}>
        <div className="three-body">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="loading-screen" style={{ backgroundColor: '#000', color: '#fff' }}>
        <h2>Project not found</h2>
        <Link to="/" style={{ color: '#3b82f6', textDecoration: 'underline', marginLeft: '1rem' }}>Back to Home</Link>
      </div>
    );
  }

  const videoSrc = fetchedVideo || project.video || `/video/hero-${(index % 3) + 1}.mp4`;

  return (
    <div className="work-detail-container">
      {/* <Link to="/" className="back-btn">
        &larr; Back
      </Link> */}

      {videoLoading && (
        <div className="loading-screen">
          <div className="three-body">
            Loading Video...
          </div>
        </div>
      )}

      <div id="video-frame" className="video-frame">
        <video
          src={videoSrc}
          poster={fetchedThumbnail}
          autoPlay
          loop
          muted
          playsInline
          className="video-bg"
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
        />

        {/* <h1 className="hero-heading-bg special-font">
          {project.title}
        </h1> */}

        {/* <div className="hero-content">
          <div className="hero-content-inner">
            <h1 className="hero-heading-fg special-font">
              {project.title}
            </h1>

            <p className="hero-desc font-robert-regular">
              Soft inside. Bold in flavor. <br /> A bite worth craving.
            </p>

            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="visit-btn"
            >
              <TiLocationArrow /> Visit Project
            </a>
          </div>
        </div> */}
      </div>

      <h1 className="hero-heading-base special-font">
        {project.title}
      </h1>

      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", margin: "2rem 0" }}>
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="visit-btn"
        >
          <TiLocationArrow /> Visit Project
        </a>
        {project.youtubeLink && (
          <a
            href={project.youtubeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="visit-btn"
            style={{ backgroundColor: "#ff0000", color: "#fff" }}
          >
            <TiLocationArrow /> View Full Video
          </a>
        )}
      </div>

      {/* ── Pricing Panel ─────────────────────────────────────────── */}
      <PricingPanel project={project} />

      {/* Dynamic Project Showcase Gallery */}
      {fetchedGallery.length > 0 && (
        <div className="project-detail-gallery">
          <h3 className="gallery-section-title">📷 Project Showcase & Deliverables</h3>
          <div className="detail-gallery-grid">
            {fetchedGallery.map((url, idx) => (
              <div key={idx} className="detail-gallery-item">
                <img
                  src={url}
                  alt={`${project.title} screenshot ${idx + 1}`}
                  onClick={() => window.open(url, '_blank')}
                  title="Click to view full size"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Pricing Panel Component ───────────────────────────────────────────────
// const defaultSeller = {
//   name: "Junald A.",
//   badge: "Fiverr's Choice",
//   rating: 5.0,
//   reviewsCount: 206,
//   avatarLetter: "J",
//   hourlyRate: "US$18/hour"
// };

const defaultAboutGig = {
  intro: "Looking for a skilled developer to design or redesign your website with a modern, clean, and high-performing layout?",
  emphasis: "You're in the right place.",
  description: "I help businesses and individuals create responsive, fast, and easy-to-manage websites from simple business sites to advanced eCommerce stores. Every site I build is optimized for speed, SEO, and user experience.",
  whatIsIncluded: [
    "Custom website development",
    "Redesign and revamp of existing sites",
    "Fully responsive for all devices",
    "Speed and performance optimization",
    "Premium design & customization",
    "Database / CMS setup and configuration"
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
    "Clear communication",
    "On-time delivery",
    "Unlimited revisions",
    "Post-delivery support"
  ],
  outro: "Ready to build a new site or redesign your current one? Message me and let's create a website that truly represents your brand."
};

const defaultPricingTiers = [
  {
    label: "Basic",
    price: "US$80",
    description: "One Page fully functional & responsive website design with Admin Panel | Landing Page",
    delivery: "3-day delivery",
    revisions: "2 Revisions",
    features: [
      { text: "1 page", included: true },
      { text: "Functional website", included: true },
      { text: "Responsive design", included: true },
      { text: "Content upload", included: false },
      { text: "4 plugins/extensions", included: true },
    ],
  },
  {
    label: "Standard",
    price: "US$150",
    description: "Up to 5 pages, fully responsive with custom animations and CMS integration",
    delivery: "5-day delivery",
    revisions: "5 Revisions",
    features: [
      { text: "Up to 5 pages", included: true },
      { text: "Functional website", included: true },
      { text: "Responsive design", included: true },
      { text: "Content upload", included: true },
      { text: "8 plugins/extensions", included: true },
    ],
  },
  {
    label: "Premium",
    price: "US$300",
    description: "Full custom website with advanced features, SEO, and priority support",
    delivery: "10-day delivery",
    revisions: "Unlimited",
    features: [
      { text: "Unlimited pages", included: true },
      { text: "Functional website", included: true },
      { text: "Responsive design", included: true },
      { text: "Content upload", included: true },
      { text: "Unlimited plugins", included: true },
    ],
  },
];

const PricingPanel = ({ project }: { project: Project }) => {
  const [activeTab, setActiveTab] = useState(0);

  // const seller = project.seller || defaultSeller;
  // const clientTag = project.clientTag || "🍁 Baby Boomers Cleaning";
  const aboutGig = project.aboutGig || defaultAboutGig;
  const tiers = project.pricingTiers || defaultPricingTiers;
  const tier = tiers[activeTab] || tiers[0];

  return (
    <section className="pricing-section">
      {/* Left – Seller Info */}
      <div className="pricing-left">
        <h2 className="pricing-service-title">
          I will design, build, redesign, develop, clone, update, or customize this{" "}
          <span className="pricing-highlight">{project.title}</span> website
        </h2>

        {/* <div className="pricing-seller">
          <div className="pricing-avatar">
            <span>{seller.avatarLetter}</span>
          </div>
          <div className="pricing-seller-info">
            <p className="pricing-seller-name">{seller.name} <span className="pricing-badge">{seller.badge}</span></p>
            <div className="pricing-stars">
              {[...Array(Math.floor(seller.rating))].map((_, i) => (
                <FiStar key={i} className="star-icon filled" />
              ))}
              <span className="pricing-rating">{seller.rating.toFixed(1)} ({seller.reviewsCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* <div className="pricing-meta">
          <span className="pricing-meta-item">Among my clients</span>
          <span className="pricing-client-tag">{clientTag}</span>
        </div> */}

        {/* ── About This Gig Section ──────────────────────────────── */}
        <div className="about-gig-section">
          <h3 className="about-gig-title">About this gig</h3>

          <p className="about-gig-text">
            {aboutGig.intro}
          </p>

          <p className="about-gig-text highlight-bold">
            {aboutGig.emphasis}
          </p>

          <p className="about-gig-text">
            {aboutGig.description}
          </p>

          <div className="about-gig-group">
            <h4 className="about-gig-subtitle">What is included:</h4>
            <ul className="about-gig-list">
              {aboutGig.whatIsIncluded.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="about-gig-group">
            <h4 className="about-gig-subtitle">Industries I've worked with:</h4>
            <ul className="about-gig-list">
              {aboutGig.industries.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="about-gig-group">
            <h4 className="about-gig-subtitle">Why work with me:</h4>
            <ul className="about-gig-list">
              {aboutGig.whyWorkWithMe.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <p className="about-gig-text footer-outro">
            {aboutGig.outro}
          </p>
        </div>
      </div>

      {/* Right – Package Card */}
      <div className="pricing-card">
        {/* Tabs */}
        <div className="pricing-tabs">
          {tiers.map((t, i) => (
            <button
              key={t.label}
              className={`pricing-tab${activeTab === i ? " active" : ""}`}
              onClick={() => setActiveTab(i)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="pricing-card-body">
          <div className="pricing-header-row">
            <p className="pricing-package-label">{tier.label} package</p>
            <p className="pricing-price">{tier.price}</p>
          </div>

          <p className="pricing-desc">{tier.description}</p>

          <div className="pricing-meta-row">
            <span className="pricing-meta-chip"><FiClock /> {tier.delivery}</span>
            <span className="pricing-meta-chip"><FiRefreshCw /> {tier.revisions}</span>
          </div>

          <ul className="pricing-features">
            {tier.features.map((f) => (
              <li key={f.text} className={`pricing-feature-item${f.included ? "" : " excluded"}`}>
                {f.included ? <FiCheck className="feature-icon check" /> : <FiX className="feature-icon cross" />}
                <span>{f.text}</span>
              </li>
            ))}
          </ul>

          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="pricing-cta-btn"
          >
            Continue <FiArrowRight />
          </a>

          <a
            href={`mailto:contact@example.com`}
            className="pricing-contact-link"
          >
            Contact me
          </a>

          {/* <div className="pricing-hourly">
            <div className="pricing-hourly-avatar"><span>{seller.avatarLetter}</span></div>
            <div>
              <p className="pricing-hourly-label">Need flexibility when hiring?</p>
              <p className="pricing-hourly-sub">Hire by the hour, ideal for long-term projects with flexible hours and weekly payments.</p>
              <div className="pricing-hourly-footer">
                <span className="pricing-hourly-rate">{seller.hourlyRate}</span>
                <a href="#" className="pricing-hourly-link">Request hourly offer</a>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default WorkDetail;
