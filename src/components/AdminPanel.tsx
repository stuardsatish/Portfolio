import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getPortfolioLinksFromFirebase,
  Project,
  db,
  storage
} from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import {
  FiArrowLeft,
  FiSave,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiX,
  FiSettings,
  FiAlertCircle,
  FiExternalLink
} from "react-icons/fi";
import "./styles/AdminPanel.css";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [img, setImg] = useState("");
  const [video, setVideo] = useState("");

  // Seller
  const [sellerName, setSellerName] = useState("");
  const [sellerBadge, setSellerBadge] = useState("");
  const [sellerRating, setSellerRating] = useState(5.0);
  const [sellerReviews, setSellerReviews] = useState(206);
  const [sellerAvatar, setSellerAvatar] = useState("J");
  const [sellerHourly, setSellerHourly] = useState("US$18/hour");

  // Client tag
  const [clientTag, setClientTag] = useState("");

  // About Gig
  const [gigIntro, setGigIntro] = useState("");
  const [gigEmphasis, setGigEmphasis] = useState("");
  const [gigDescription, setGigDescription] = useState("");
  const [gigOutro, setGigOutro] = useState("");
  const [gigIncluded, setGigIncluded] = useState<string[]>([]);
  const [gigIndustries, setGigIndustries] = useState<string[]>([]);
  const [gigWhyMe, setGigWhyMe] = useState<string[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);

  // Pricing Tiers (Basic, Standard, Premium)
  const [basicPrice, setBasicPrice] = useState("");
  const [basicDesc, setBasicDesc] = useState("");
  const [basicDelivery, setBasicDelivery] = useState("");
  const [basicRevisions, setBasicRevisions] = useState("");
  const [basicFeatures, setBasicFeatures] = useState<{ text: string; included: boolean }[]>([]);

  const [stdPrice, setStdPrice] = useState("");
  const [stdDesc, setStdDesc] = useState("");
  const [stdDelivery, setStdDelivery] = useState("");
  const [stdRevisions, setStdRevisions] = useState("");
  const [stdFeatures, setStdFeatures] = useState<{ text: string; included: boolean }[]>([]);

  const [premPrice, setPremPrice] = useState("");
  const [premDesc, setPremDesc] = useState("");
  const [premDelivery, setPremDelivery] = useState("");
  const [premRevisions, setPremRevisions] = useState("");
  const [premFeatures, setPremFeatures] = useState<{ text: string; included: boolean }[]>([]);

  // New Bullet Temporary States
  const [newIncluded, setNewIncluded] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [newWhyMe, setNewWhyMe] = useState("");

  const handleCreateNewClick = () => {
    setIsAddingNew(true);
    setSelectedIdx(projects.length);

    setTitle("");
    setLink("");
    setImg("/images/work-new.webp");
    setVideo("/video/hero-new.mp4");

    setSellerName("Junald A.");
    setSellerBadge("Fiverr's Choice");
    setSellerRating(5.0);
    setSellerReviews(206);
    setSellerAvatar("J");
    setSellerHourly("US$18/hour");

    setClientTag("🍁 New Client Tag");

    setGigIntro("Looking for a skilled developer to design or redesign your website with a modern, clean, and high-performing layout?");
    setGigEmphasis("You're in the right place.");
    setGigDescription("I help businesses and individuals create responsive, fast, and easy-to-manage websites from simple business sites to advanced eCommerce stores. Every site I build is optimized for speed, SEO, and user experience.");
    setGigOutro("Ready to build a new site or redesign your current one? Message me and let's create a website that truly represents your brand.");
    setGigIncluded([
      "Custom website development",
      "Redesign and revamp of existing sites",
      "Fully responsive for all devices",
      "Speed and performance optimization",
      "Premium design & customization",
      "Database / CMS setup and configuration"
    ]);
    setGigIndustries([
      "Business & Corporate service",
      "Real Estate & Service-based companies",
      "Cleaning, Roofing & Local services"
    ]);
    setGigWhyMe([
      "Clear communication",
      "On-time delivery",
      "Unlimited revisions",
      "Post-delivery support"
    ]);
    setGallery([]);

    setBasicPrice("US$80");
    setBasicDesc("One Page fully functional & responsive website design");
    setBasicDelivery("3-day delivery");
    setBasicRevisions("2 Revisions");
    setBasicFeatures([
      { text: "1 page", included: true },
      { text: "Functional website", included: true },
      { text: "Responsive design", included: true },
      { text: "Content upload", included: false }
    ]);

    setStdPrice("US$150");
    setStdDesc("Up to 5 pages, fully responsive with custom animations");
    setStdDelivery("5-day delivery");
    setStdRevisions("5 Revisions");
    setStdFeatures([
      { text: "Up to 5 pages", included: true },
      { text: "Functional website", included: true },
      { text: "Responsive design", included: true },
      { text: "Content upload", included: true }
    ]);

    setPremPrice("US$300");
    setPremDesc("Full custom website with advanced features, SEO, and priority support");
    setPremDelivery("10-day delivery");
    setPremRevisions("Unlimited");
    setPremFeatures([
      { text: "Unlimited pages", included: true },
      { text: "Functional website", included: true },
      { text: "Responsive design", included: true },
      { text: "Content upload", included: true }
    ]);
  };

  const handleCancelCreateNew = () => {
    setIsAddingNew(false);
    setSelectedIdx(0);
    if (projects[0]) {
      populateForm(projects[0]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "image") {
      setImgUploading(true);
    } else {
      setVideoUploading(true);
    }

    try {
      // Organize into project specific folders: portfolio/project-{selectedIdx}/{filename}
      const fileRef = ref(storage, `portfolio/project-${selectedIdx}/${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(fileRef);

      if (type === "image") {
        setImg(downloadUrl);
        showNotification("📸 Image uploaded to project folder successfully!", "success");
      } else {
        setVideo(downloadUrl);
        showNotification("🎥 Video uploaded to project folder successfully!", "success");
      }
    } catch (err: any) {
      console.error(err);
      showNotification(`❌ Upload failed: ${err.message}`, "error");
    } finally {
      if (type === "image") {
        setImgUploading(false);
      } else {
        setVideoUploading(false);
      }
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setGalleryUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Organize into project isolated folders, under portfolio/project-{selectedIdx}/gallery/{unique_id}-{filename}
        const fileRef = ref(storage, `portfolio/project-${selectedIdx}/gallery/${Date.now()}-${file.name}`);
        await uploadBytes(fileRef, file);
        const downloadUrl = await getDownloadURL(fileRef);
        uploadedUrls.push(downloadUrl);
      }
      setGallery((prev) => [...prev, ...uploadedUrls]);
      showNotification(`📸 ${files.length} gallery image(s) uploaded successfully!`, "success");
    } catch (err: any) {
      console.error(err);
      showNotification(`❌ Gallery upload failed: ${err.message}`, "error");
    } finally {
      setGalleryUploading(false);
    }
  };

  const handleRemoveGalleryImage = (idxToRemove: number) => {
    setGallery((prev) => prev.filter((_, idx) => idx !== idxToRemove));
    showNotification("🗑️ Image removed from gallery locally. Remember to click Save Changes to persist!", "success");
  };

  // Fetch all projects from Firebase on mount
  useEffect(() => {
    document.body.style.overflow = "auto";
    document.body.style.overflowY = "auto";
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await getPortfolioLinksFromFirebase();
      setProjects(data);
      if (data.length > 0) {
        populateForm(data[selectedIdx] || data[0]);
      }
    } catch (e) {
      console.error(e);
      showNotification("Failed to fetch projects.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Populate the form when switching projects
  const populateForm = (p: Project) => {
    setTitle(p.title || "");
    setLink(p.link || "");
    setImg(p.img || "");
    setVideo(p.video || "");

    const s = p.seller || { name: "", badge: "", rating: 5, reviewsCount: 0, avatarLetter: "J", hourlyRate: "" };
    setSellerName(s.name || "");
    setSellerBadge(s.badge || "");
    setSellerRating(s.rating || 5);
    setSellerReviews(s.reviewsCount || 0);
    setSellerAvatar(s.avatarLetter || "J");
    setSellerHourly(s.hourlyRate || "");

    setClientTag(p.clientTag || "");

    const g = p.aboutGig || { intro: "", emphasis: "", description: "", whatIsIncluded: [], industries: [], whyWorkWithMe: [], outro: "" };
    setGigIntro(g.intro || "");
    setGigEmphasis(g.emphasis || "");
    setGigDescription(g.description || "");
    setGigOutro(g.outro || "");
    setGigIncluded(g.whatIsIncluded || []);
    setGigIndustries(g.industries || []);
    setGigWhyMe(g.whyWorkWithMe || []);
    setGallery(p.gallery || []);

    const tiers = p.pricingTiers || [];

    // Basic
    const b = tiers[0] || { price: "", description: "", delivery: "", revisions: "", features: [] };
    setBasicPrice(b.price || "");
    setBasicDesc(b.description || "");
    setBasicDelivery(b.delivery || "");
    setBasicRevisions(b.revisions || "");
    setBasicFeatures(b.features || []);

    // Standard
    const std = tiers[1] || { price: "", description: "", delivery: "", revisions: "", features: [] };
    setStdPrice(std.price || "");
    setStdDesc(std.description || "");
    setStdDelivery(std.delivery || "");
    setStdRevisions(std.revisions || "");
    setStdFeatures(std.features || []);

    // Premium
    const pr = tiers[2] || { price: "", description: "", delivery: "", revisions: "", features: [] };
    setPremPrice(pr.price || "");
    setPremDesc(pr.description || "");
    setPremDelivery(pr.delivery || "");
    setPremRevisions(pr.revisions || "");
    setPremFeatures(pr.features || []);
  };

  // Populate when dropdown selection changes
  const handleProjectSelect = (idx: number) => {
    setSelectedIdx(idx);
    if (projects[idx]) {
      populateForm(projects[idx]);
    }
  };

  const showNotification = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  // List Modification Helpers
  const addBullet = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, val: string, setVal: React.Dispatch<React.SetStateAction<string>>) => {
    if (!val.trim()) return;
    setList([...list, val.trim()]);
    setVal("");
  };

  const removeBullet = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  // Feature modification helpers for tiers
  const toggleFeature = (features: { text: string; included: boolean }[], setFeatures: React.Dispatch<React.SetStateAction<{ text: string; included: boolean }[]>>, index: number) => {
    const updated = [...features];
    updated[index].included = !updated[index].included;
    setFeatures(updated);
  };

  const updateFeatureText = (features: { text: string; included: boolean }[], setFeatures: React.Dispatch<React.SetStateAction<{ text: string; included: boolean }[]>>, index: number, text: string) => {
    const updated = [...features];
    updated[index].text = text;
    setFeatures(updated);
  };

  const addFeature = (features: { text: string; included: boolean }[], setFeatures: React.Dispatch<React.SetStateAction<{ text: string; included: boolean }[]>>) => {
    setFeatures([...features, { text: "New Package Feature", included: true }]);
  };

  const removeFeature = (features: { text: string; included: boolean }[], setFeatures: React.Dispatch<React.SetStateAction<{ text: string; included: boolean }[]>>, index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  // Submit and update Firebase Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const updatedProject: Project = {
      index: selectedIdx,
      title,
      link,
      img,
      video,
      seller: {
        name: sellerName,
        badge: sellerBadge,
        rating: Number(sellerRating),
        reviewsCount: Number(sellerReviews),
        avatarLetter: sellerAvatar,
        hourlyRate: sellerHourly
      },
      clientTag,
      aboutGig: {
        intro: gigIntro,
        emphasis: gigEmphasis,
        description: gigDescription,
        whatIsIncluded: gigIncluded,
        industries: gigIndustries,
        whyWorkWithMe: gigWhyMe,
        outro: gigOutro
      },
      pricingTiers: [
        {
          label: "Basic",
          price: basicPrice,
          description: basicDesc,
          delivery: basicDelivery,
          revisions: basicRevisions,
          features: basicFeatures
        },
        {
          label: "Standard",
          price: stdPrice,
          description: stdDesc,
          delivery: stdDelivery,
          revisions: stdRevisions,
          features: stdFeatures
        },
        {
          label: "Premium",
          price: premPrice,
          description: premDesc,
          delivery: premDelivery,
          revisions: premRevisions,
          features: premFeatures
        }
      ],
      gallery
    };

    try {
      await setDoc(doc(db, "portfolioLinks", `project-${selectedIdx}`), updatedProject);

      const updatedProjectsList = [...projects];
      if (isAddingNew) {
        updatedProjectsList.push(updatedProject);
        setIsAddingNew(false);
      } else {
        updatedProjectsList[selectedIdx] = updatedProject;
      }
      setProjects(updatedProjectsList);

      showNotification(isAddingNew ? "✨ New project created in Firebase successfully!" : "✨ Project updated in Firebase successfully!", "success");
    } catch (e: any) {
      console.error(e);
      showNotification(`❌ Update failed: ${e.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="three-body"></div>
        <p>Loading portfolio data from Firebase...</p>
      </div>
    );
  }

  return (
    <div className="admin-workspace">
      {/* Sidebar / Navigation header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <Link to="/" className="admin-back-btn">
            <FiArrowLeft /> Back to Home
          </Link>
          <h1>Portfolio <span>Admin Workspace</span></h1>
        </div>
        <div className="project-selector-wrapper">
          {isAddingNew ? (
            <>
              <button
                type="button"
                onClick={handleCancelCreateNew}
                className="admin-cancel-new-btn"
              >
                <FiX /> Cancel
              </button>
              <select disabled className="admin-select">
                <option value={projects.length}>
                  + Creating New Project (0{projects.length + 1})
                </option>
              </select>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCreateNewClick}
                className="admin-create-new-btn"
              >
                <FiPlus /> Add New Project
              </button>
              <label>Editing Project:</label>
              <select
                value={selectedIdx}
                onChange={(e) => handleProjectSelect(Number(e.target.value))}
                className="admin-select"
              >
                {projects.map((p, idx) => (
                  <option key={idx} value={idx}>
                    0{idx + 1} - {p.title || `Project ${idx}`}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </header>

      {message && (
        <div className={`admin-alert ${message.type}`}>
          {message.type === "success" ? <FiCheck /> : <FiAlertCircle />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-form-container">

        {/* SECTION 1: Core Fields */}
        <fieldset className="admin-fieldset glassmorphic">
          <legend className="fieldset-legend"><FiSettings /> Core Project Settings</legend>
          <div className="admin-row">
            <div className="admin-group">
              <label>Project Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Retreat Website"
              />
            </div>
            <div className="admin-group">
              <label>Deployment / Live Link</label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                required
                placeholder="https://example.com"
              />
            </div>
          </div>
          <div className="admin-row">
            <div className="admin-group">
              <label>Thumbnail Image Path / URL</label>
              <div className="upload-input-container">
                <input
                  type="text"
                  value={img}
                  onChange={(e) => setImg(e.target.value)}
                  required
                  placeholder="e.g. /images/work-1.webp"
                  className="upload-text-input"
                />
                <label className="custom-upload-btn">
                  {imgUploading ? "Uploading..." : "Upload Image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "image")}
                    style={{ display: 'none' }}
                    disabled={imgUploading}
                  />
                </label>
              </div>
            </div>
            <div className="admin-group">
              <label>Hover Video Path / Storage URL</label>
              <div className="upload-input-container">
                <input
                  type="text"
                  value={video}
                  onChange={(e) => setVideo(e.target.value)}
                  placeholder="e.g. /video/hero-1.mp4"
                  className="upload-text-input"
                />
                <label className="custom-upload-btn">
                  {videoUploading ? "Uploading..." : "Upload Video"}
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e, "video")}
                    style={{ display: 'none' }}
                    disabled={videoUploading}
                  />
                </label>
              </div>
            </div>
          </div>
        </fieldset>

        {/* SECTION 2: Seller & Client Profile */}
        <fieldset className="admin-fieldset glassmorphic">
          <legend className="fieldset-legend">👤 Seller Profile & Client Tag</legend>
          <div className="admin-row">
            <div className="admin-group flex-2">
              <label>Seller Display Name</label>
              <input
                type="text"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="e.g. Junald A."
              />
            </div>
            <div className="admin-group">
              <label>Avatar Initials</label>
              <input
                type="text"
                maxLength={2}
                value={sellerAvatar}
                onChange={(e) => setSellerAvatar(e.target.value)}
                placeholder="e.g. J"
              />
            </div>
            <div className="admin-group">
              <label>Hourly Billing Rate</label>
              <input
                type="text"
                value={sellerHourly}
                onChange={(e) => setSellerHourly(e.target.value)}
                placeholder="US$18/hour"
              />
            </div>
          </div>
          <div className="admin-row">
            <div className="admin-group">
              <label>Review Rating (1-5)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={sellerRating}
                onChange={(e) => setSellerRating(Number(e.target.value))}
              />
            </div>
            <div className="admin-group">
              <label>Reviews Count</label>
              <input
                type="number"
                value={sellerReviews}
                onChange={(e) => setSellerReviews(Number(e.target.value))}
              />
            </div>
            <div className="admin-group flex-2">
              <label>Fiverr / Talent Badge</label>
              <input
                type="text"
                value={sellerBadge}
                onChange={(e) => setSellerBadge(e.target.value)}
                placeholder="e.g. Fiverr's Choice"
              />
            </div>
          </div>
          <div className="admin-row">
            <div className="admin-group">
              <label>Client Tag / Client Logo</label>
              <input
                type="text"
                value={clientTag}
                onChange={(e) => setClientTag(e.target.value)}
                placeholder="🍁 Baby Boomers Cleaning"
              />
            </div>
          </div>
        </fieldset>

        {/* SECTION 3: About this Gig Section */}
        <fieldset className="admin-fieldset glassmorphic">
          <legend className="fieldset-legend">📝 'About this Gig' Info Description</legend>
          <div className="admin-group">
            <label>Headline Intro Sentence</label>
            <textarea
              value={gigIntro}
              onChange={(e) => setGigIntro(e.target.value)}
              rows={2}
              placeholder="e.g. Looking for a skilled developer to build a modern..."
            />
          </div>
          <div className="admin-group">
            <label>Emphasis Phrase</label>
            <input
              type="text"
              value={gigEmphasis}
              onChange={(e) => setGigEmphasis(e.target.value)}
              placeholder="You're in the right place."
            />
          </div>
          <div className="admin-group">
            <label>Full Body Description Paragraph</label>
            <textarea
              value={gigDescription}
              onChange={(e) => setGigDescription(e.target.value)}
              rows={4}
              placeholder="Detailed description of your build process, optimizations, etc..."
            />
          </div>
          <div className="admin-group">
            <label>Footer Outro / Call-to-action</label>
            <textarea
              value={gigOutro}
              onChange={(e) => setGigOutro(e.target.value)}
              rows={2}
              placeholder="Ready to build a new site? Contact me..."
            />
          </div>

          {/* BULLET LIST MODIFIERS */}
          <div className="bullet-lists-container">
            {/* 1. What's Included */}
            <div className="bullet-editor-card">
              <h4>What is included</h4>
              <div className="bullet-add-row">
                <input
                  type="text"
                  value={newIncluded}
                  onChange={(e) => setNewIncluded(e.target.value)}
                  placeholder="Add item..."
                />
                <button type="button" onClick={() => addBullet(gigIncluded, setGigIncluded, newIncluded, setNewIncluded)} className="bullet-add-btn">
                  <FiPlus />
                </button>
              </div>
              <ul className="bullet-list-items">
                {gigIncluded.map((bullet, i) => (
                  <li key={i}>
                    <span>{bullet}</span>
                    <button type="button" onClick={() => removeBullet(gigIncluded, setGigIncluded, i)} className="bullet-remove-btn">
                      <FiTrash2 />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Industries worked with */}
            <div className="bullet-editor-card">
              <h4>Industries I've worked with</h4>
              <div className="bullet-add-row">
                <input
                  type="text"
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  placeholder="Add industry..."
                />
                <button type="button" onClick={() => addBullet(gigIndustries, setGigIndustries, newIndustry, setNewIndustry)} className="bullet-add-btn">
                  <FiPlus />
                </button>
              </div>
              <ul className="bullet-list-items">
                {gigIndustries.map((bullet, i) => (
                  <li key={i}>
                    <span>{bullet}</span>
                    <button type="button" onClick={() => removeBullet(gigIndustries, setGigIndustries, i)} className="bullet-remove-btn">
                      <FiTrash2 />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Why Work With Me */}
            <div className="bullet-editor-card">
              <h4>Why work with me</h4>
              <div className="bullet-add-row">
                <input
                  type="text"
                  value={newWhyMe}
                  onChange={(e) => setNewWhyMe(e.target.value)}
                  placeholder="Add reason..."
                />
                <button type="button" onClick={() => addBullet(gigWhyMe, setGigWhyMe, newWhyMe, setNewWhyMe)} className="bullet-add-btn">
                  <FiPlus />
                </button>
              </div>
              <ul className="bullet-list-items">
                {gigWhyMe.map((bullet, i) => (
                  <li key={i}>
                    <span>{bullet}</span>
                    <button type="button" onClick={() => removeBullet(gigWhyMe, setGigWhyMe, i)} className="bullet-remove-btn">
                      <FiTrash2 />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* GALLERY IMAGE SHOWCASE UPLOADER */}
          <div className="admin-gallery-section">
            <div className="admin-gallery-header">
              <div className="admin-gallery-title">
                <h4>📷 Project Showcase Gallery</h4>
                <p>Upload multiple project screenshots or mockups that will display beautifully at the bottom of the work detail page.</p>
              </div>
              <label className="custom-upload-btn premium-gallery-btn">
                {galleryUploading ? "Uploading Gallery..." : "➕ Upload Images"}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleGalleryUpload}
                  style={{ display: 'none' }}
                  disabled={galleryUploading}
                />
              </label>
            </div>

            <div className="admin-gallery-grid">
              {gallery.length === 0 ? (
                <div className="admin-gallery-empty">
                  <span>No gallery images uploaded yet. Click "Upload Images" to populate.</span>
                </div>
              ) : (
                gallery.map((url, i) => (
                  <div key={i} className="admin-gallery-item">
                    <img src={url} alt={`Gallery item ${i}`} />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(i)}
                      className="admin-gallery-item-remove"
                      title="Remove Image"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </fieldset>

        {/* SECTION 4: Pricing tiers */}
        <fieldset className="admin-fieldset glassmorphic">
          <legend className="fieldset-legend">🏷️ Service Packages (Basic, Standard, Premium)</legend>

          <div className="pricing-tiers-flex">

            {/* TIER 1: Basic */}
            <div className="tier-editor-column basic-col">
              <h3>🟢 Basic Package</h3>
              <div className="admin-group">
                <label>Price</label>
                <input type="text" value={basicPrice} onChange={(e) => setBasicPrice(e.target.value)} placeholder="US$80" />
              </div>
              <div className="admin-group">
                <label>Description</label>
                <textarea value={basicDesc} onChange={(e) => setBasicDesc(e.target.value)} rows={2} placeholder="One Page..." />
              </div>
              <div className="admin-row">
                <div className="admin-group">
                  <label>Delivery</label>
                  <input type="text" value={basicDelivery} onChange={(e) => setBasicDelivery(e.target.value)} placeholder="3-day delivery" />
                </div>
                <div className="admin-group">
                  <label>Revisions</label>
                  <input type="text" value={basicRevisions} onChange={(e) => setBasicRevisions(e.target.value)} placeholder="2 Revisions" />
                </div>
              </div>
              <div className="tier-features-editor">
                <div className="features-editor-header">
                  <label>Included Features Checklist</label>
                  <button type="button" onClick={() => addFeature(basicFeatures, setBasicFeatures)} className="feature-add-btn"><FiPlus /> Add</button>
                </div>
                <ul className="tier-features-list">
                  {basicFeatures.map((f, i) => (
                    <li key={i}>
                      <input
                        type="checkbox"
                        checked={f.included}
                        onChange={() => toggleFeature(basicFeatures, setBasicFeatures, i)}
                      />
                      <input
                        type="text"
                        value={f.text}
                        onChange={(e) => updateFeatureText(basicFeatures, setBasicFeatures, i, e.target.value)}
                        className="feature-text-input"
                      />
                      <button type="button" onClick={() => removeFeature(basicFeatures, setBasicFeatures, i)} className="feature-remove-btn"><FiTrash2 /></button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* TIER 2: Standard */}
            <div className="tier-editor-column std-col">
              <h3>🔵 Standard Package</h3>
              <div className="admin-group">
                <label>Price</label>
                <input type="text" value={stdPrice} onChange={(e) => setStdPrice(e.target.value)} placeholder="US$150" />
              </div>
              <div className="admin-group">
                <label>Description</label>
                <textarea value={stdDesc} onChange={(e) => setStdDesc(e.target.value)} rows={2} placeholder="Up to 5 pages..." />
              </div>
              <div className="admin-row">
                <div className="admin-group">
                  <label>Delivery</label>
                  <input type="text" value={stdDelivery} onChange={(e) => setStdDelivery(e.target.value)} placeholder="5-day delivery" />
                </div>
                <div className="admin-group">
                  <label>Revisions</label>
                  <input type="text" value={stdRevisions} onChange={(e) => setStdRevisions(e.target.value)} placeholder="5 Revisions" />
                </div>
              </div>
              <div className="tier-features-editor">
                <div className="features-editor-header">
                  <label>Included Features Checklist</label>
                  <button type="button" onClick={() => addFeature(stdFeatures, setStdFeatures)} className="feature-add-btn"><FiPlus /> Add</button>
                </div>
                <ul className="tier-features-list">
                  {stdFeatures.map((f, i) => (
                    <li key={i}>
                      <input
                        type="checkbox"
                        checked={f.included}
                        onChange={() => toggleFeature(stdFeatures, setStdFeatures, i)}
                      />
                      <input
                        type="text"
                        value={f.text}
                        onChange={(e) => updateFeatureText(stdFeatures, setStdFeatures, i, e.target.value)}
                        className="feature-text-input"
                      />
                      <button type="button" onClick={() => removeFeature(stdFeatures, setStdFeatures, i)} className="feature-remove-btn"><FiTrash2 /></button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* TIER 3: Premium */}
            <div className="tier-editor-column prem-col">
              <h3>🟣 Premium Package</h3>
              <div className="admin-group">
                <label>Price</label>
                <input type="text" value={premPrice} onChange={(e) => setPremPrice(e.target.value)} placeholder="US$300" />
              </div>
              <div className="admin-group">
                <label>Description</label>
                <textarea value={premDesc} onChange={(e) => setPremDesc(e.target.value)} rows={2} placeholder="Full custom..." />
              </div>
              <div className="admin-row">
                <div className="admin-group">
                  <label>Delivery</label>
                  <input type="text" value={premDelivery} onChange={(e) => setPremDelivery(e.target.value)} placeholder="10-day delivery" />
                </div>
                <div className="admin-group">
                  <label>Revisions</label>
                  <input type="text" value={premRevisions} onChange={(e) => setPremRevisions(e.target.value)} placeholder="Unlimited" />
                </div>
              </div>
              <div className="tier-features-editor">
                <div className="features-editor-header">
                  <label>Included Features Checklist</label>
                  <button type="button" onClick={() => addFeature(premFeatures, setPremFeatures)} className="feature-add-btn"><FiPlus /> Add</button>
                </div>
                <ul className="tier-features-list">
                  {premFeatures.map((f, i) => (
                    <li key={i}>
                      <input
                        type="checkbox"
                        checked={f.included}
                        onChange={() => toggleFeature(premFeatures, setPremFeatures, i)}
                      />
                      <input
                        type="text"
                        value={f.text}
                        onChange={(e) => updateFeatureText(premFeatures, setPremFeatures, i, e.target.value)}
                        className="feature-text-input"
                      />
                      <button type="button" onClick={() => removeFeature(premFeatures, setPremFeatures, i)} className="feature-remove-btn"><FiTrash2 /></button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </fieldset>

        {/* Floating Actions Panel */}
        <div className="admin-actions">
          {!isAddingNew && (
            <button
              type="button"
              onClick={() => navigate(`/work-detail/${selectedIdx}`)}
              className="preview-btn"
            >
              <FiExternalLink /> Live Preview Detail Page
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="save-btn"
          >
            <FiSave /> {saving ? "Saving Changes..." : isAddingNew ? "Create Project in Firebase" : "Update Project in Firebase"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AdminPanel;
