import { useState, useEffect } from "react";
import { profileData } from "./profileData.js";
import { 
  ChevronRight, 
  Code, 
  Sparkles, 
  MapPin, 
  Plus, 
  Home, 
  Clock, 
  Trophy, 
  User, 
  Gem,
  Check,
  Copy,
  X,
  Share2
} from "lucide-react";

/* Custom High-Fidelity SVG Brand Icons to match exact logos */
const InstagramLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedinLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TelegramLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-.7 3.99-.98 5.51-.12.64-.35.85-.58.87-.5.05-.88-.31-1.36-.63-.76-.49-1.18-.8-1.92-1.28-.85-.56-.3-.87.19-1.37.13-.13 2.33-2.14 2.37-2.31.01-.02.01-.1-.05-.15-.06-.05-.14-.03-.21-.02-.09.02-1.58 1.01-4.48 2.96-.42.29-.8.43-1.15.42-.38-.01-1.11-.22-1.65-.39-.66-.22-1.19-.33-1.14-.7.02-.19.28-.39.77-.59 3.02-1.31 5.03-2.18 6.03-2.6 2.87-1.2 3.46-1.41 3.85-1.41.09 0 .28.02.4.12.1.09.13.22.14.32-.01.07-.01.17-.02.24z"/>
  </svg>
);

const BehanceLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.2 16.5H3.6V7.5h4.6c2 0 3.2 1 3.2 2.6 0 1.2-.7 2-1.9 2.3 1.5.2 2.3 1.2 2.3 2.6 0 2-1.3 3.5-3.6 3.5zm-1-6.1H4.9V11h2.2c1.1 0 1.7-.5 1.7-1.3s-.6-1.3-1.6-1.3zm.3 4.2H4.9V15h2.6c1.1 0 1.7-.5 1.7-1.4s-.6-1.3-1.7-1.3zm13.1-3.6c-2.3 0-3.9 1.4-3.9 3.7 0 2.2 1.6 3.7 4 3.7 1.8 0 3-.9 3.5-2.2h-1.6c-.3.5-.9 1-1.9 1-1.3 0-2-.8-2.1-2.1H24c.1-2.4-1.4-4.1-3.6-4.1zm-1.8 2.6c.1-1 .8-1.6 1.7-1.6.9 0 1.6.6 1.7 1.6h-3.4zM16.2 9.5h5.4V8.3h-5.4v1.2z" />
  </svg>
);

const WhatsappLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.758.459 3.473 1.332 4.985L2 22l5.161-1.353a9.924 9.924 0 0 0 4.851 1.264h.004c5.502 0 9.988-4.486 9.988-9.992C22 6.482 17.514 2 12.012 2zm6.6 14.18c-.272.761-1.358 1.391-2.222 1.472-.614.056-1.411.082-2.28-.201a10.376 10.376 0 0 1-4.708-3.085A10.741 10.741 0 0 1 6.8 9.873c-.534-.916-.848-1.99-.39-2.584.228-.294.61-.692.915-.997.112-.112.224-.224.305-.305.244-.244.407-.366.57-.366.162 0 .325.081.447.325.326.65.773 1.83.854 1.993.082.163.136.353.027.57-.109.217-.163.353-.326.543-.163.19-.325.38-.488.57-.163.163-.353.353-.136.733.217.38.978 1.628 2.092 2.617 1.438 1.276 2.661 1.683 3.04 1.873.38.19.61.163.827-.081.217-.244.923-1.072 1.168-1.439.244-.366.488-.3.814-.177.325.122 2.062 1.018 2.415 1.194.353.177.585.258.667.407.082.149.082.855-.19 1.616z"/>
  </svg>
);

const CVIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

// Map configured string names to React Components
const IconResolver = ({ name }) => {
  switch (name) {
    case "Instagram":
      return <InstagramLogo />;
    case "Linkedin":
      return <LinkedinLogo />;
    case "Send":
      return <TelegramLogo />;
    case "MessageCircle":
      return <WhatsappLogo />;
    case "FileText":
      return <CVIcon />;
    case "Link":
      return <LinkIcon />;
    case "Globe":
      return <BehanceLogo />;
    case "Code":
      return <Code className="w-4 h-4 tag-icon" />;
    case "Sparkles":
      return <Sparkles className="w-4 h-4 tag-icon" />;
    case "MapPin":
      return <MapPin className="w-4 h-4 tag-icon" />;
    default:
      return <LinkIcon />;
  }
};

// Time formatting helper for connection history timestamps
const formatTimeAgo = (dateString) => {
  if (!dateString) return "just now";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 0) return "just now";
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "yesterday";
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return dateString;
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [diamonds, setDiamonds] = useState(parseInt(profileData.diamonds));
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Real database-backed history and leaderboard states
  const [historyEvents, setHistoryEvents] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);
  
  // Session & Auth Database State
  const [currentUser, setCurrentUser] = useState(() => {
    const localSession = localStorage.getItem("pertap_session");
    if (localSession) {
      const parsed = JSON.parse(localSession);
      return parsed.user ? parsed.user : parsed;
    }
    const tabSession = sessionStorage.getItem("pertap_session");
    if (tabSession) {
      const parsed = JSON.parse(tabSession);
      return parsed.user ? parsed.user : parsed;
    }
    return null;
  });
  
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [authError, setAuthError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register fields
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  // Edit Dashboard fields state
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editTagline, setEditTagline] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editTag1, setEditTag1] = useState("");
  const [editTag2, setEditTag2] = useState("");
  const [editInstagram, setEditInstagram] = useState("");
  const [editLinkedin, setEditLinkedin] = useState("");
  const [editTelegram, setEditTelegram] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editCv, setEditCv] = useState("");
  const [editPortfolio, setEditPortfolio] = useState("");
  const [editBehance, setEditBehance] = useState("");
  const [editQuoteText, setEditQuoteText] = useState("");
  const [editIsPremium, setEditIsPremium] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState("");

  // Async Database Profile Resolver
  const [activeProfile, setActiveProfile] = useState(profileData);
  const [isLoading, setIsLoading] = useState(true);

  // Sync editor fields helper
  const syncEditorFields = (profile) => {
    setEditName(profile.name);
    setEditAvatar(profile.avatar || "");
    setEditTagline(profile.tagline || "");
    setEditBio(profile.bio || "");
    setEditLocation(profile.tags.find(t => t.type === "location")?.text || "");
    setEditTag1(profile.tags.filter(t => t.type === "role")[0]?.text || "");
    setEditTag2(profile.tags.filter(t => t.type === "role")[1]?.text || "");
    
    const instagram = profile.socials.find(s => s.platform === "Instagram")?.handle || "";
    const linkedin = profile.socials.find(s => s.platform === "LinkedIn")?.handle || "";
    const telegram = profile.socials.find(s => s.platform === "Telegram")?.handle || "";
    const whatsapp = profile.socials.find(s => s.platform === "WhatsApp")?.handle || "";
    const cv = profile.socials.find(s => s.platform === "Download My CV / Resume")?.handle || "";
    const portfolio = profile.socials.find(s => s.platform === "Portfolio Link")?.handle || "";
    const behance = profile.socials.find(s => s.platform === "Behance")?.handle || "";
    
    setEditInstagram(instagram);
    setEditLinkedin(linkedin);
    setEditTelegram(telegram);
    setEditWhatsapp(whatsapp);
    setEditCv(cv);
    setEditPortfolio(portfolio);
    setEditBehance(behance);
    
    setEditQuoteText(profile.quote.text || "");
    setEditIsPremium(profile.isPremium || false);
  };

  // Fetch active card profile from Express SQL API on load or session change
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const session = localStorage.getItem("pertap_session") || sessionStorage.getItem("pertap_session");
        const token = session ? JSON.parse(session).token : null;
        const username = currentUser ? currentUser.username : "default";
        
        const res = await fetch(`/api/profile/${username}`, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          let resolvedProfile = data;

          if (currentUser && isImageDataUrl(data.avatar)) {
            setIsAvatarUploading(true);
            try {
              const migratedAvatarUrl = await uploadImageDataUrl(data.avatar, `${currentUser.username}-avatar-migrated`);
              resolvedProfile = { ...data, avatar: migratedAvatarUrl };
              console.log("[Tapfolio] Migrated legacy Base64 avatar to uploaded URL during profile load.");
            } catch (uploadErr) {
              console.error("Failed to migrate legacy Base64 avatar during profile load:", uploadErr);
              setAvatarUploadError("Existing profile image is Base64. Choose the image again if saving still fails.");
            } finally {
              setIsAvatarUploading(false);
            }
          }

          setActiveProfile(resolvedProfile);
          setDiamonds(parseInt(resolvedProfile.diamonds || 0));
          if (currentUser) {
            syncEditorFields(resolvedProfile);
          }
        }
      } catch (err) {
        console.error("Failed to load profile from backend:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Real database-backed history and leaderboard fetching helpers
  const fetchHistoryEvents = async (username) => {
    if (!username) return;
    setIsHistoryLoading(true);
    try {
      const session = localStorage.getItem("pertap_session") || sessionStorage.getItem("pertap_session");
      const token = session ? JSON.parse(session).token : null;
      const res = await fetch("/api/analytics", {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        
        // Compile history logs from analytics clicks and views
        const viewsList = (data.recentViews || []).map(v => ({
          id: `view-${v.id}`,
          action: "Card tapped / viewed",
          details: `Visitor from ${v.country_code === 'unknown' ? 'Unknown Location' : v.country_code} using a ${v.device_type} device.`,
          icon: "Globe",
          color: "#10b981",
          created_at: v.viewed_at
        }));
        
        const clicksList = (data.recentClicks || []).map(c => ({
          id: `click-${c.id}`,
          action: "Social link clicked",
          details: `Opened link to ${c.platform} using a ${c.device_type} device.`,
          icon: "Link",
          color: "#8b5cf6",
          created_at: c.clicked_at
        }));
        
        const mergedList = [...viewsList, ...clicksList].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setHistoryEvents(mergedList);
      }
    } catch (err) {
      console.error("Failed to fetch analytics history events:", err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setIsLeaderboardLoading(true);
    try {
      const res = await fetch("/api/leaderboard");
      if (res.ok) {
        const data = await res.json();
        setLeaderboardData(data);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard data:", err);
    } finally {
      setIsLeaderboardLoading(false);
    }
  };

  // Sync tab loading effects
  useEffect(() => {
    const requestedUsername = activeProfile.username || (currentUser ? currentUser.username : "default");
    const timer = setTimeout(() => {
      if (activeTab === "history") {
        fetchHistoryEvents(requestedUsername);
      } else if (activeTab === "leaderboard") {
        fetchLeaderboard();
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [activeTab, currentUser, activeProfile.username]);

  // Social link connection click tracker
  const handleSocialClick = async (social) => {
    const username = activeProfile.username || (currentUser ? currentUser.username : "default");
    try {
      await fetch(`/api/profile/${username}/click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: social.platform })
      });
    } catch (err) {
      console.error("Failed to log social click:", err);
    }
  };

  // Nav actions
  const handleProfileTabClick = () => {
    setActiveTab("profile");
    if (currentUser) {
      syncEditorFields(activeProfile);
    }
  };

  const handleDiamondClick = async () => {
    // Optimistic update
    setDiamonds(prev => prev + 1);
    
    try {
      const username = activeProfile.username || (currentUser ? currentUser.username : "default");
      const res = await fetch(`/api/profile/${username}/tap`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setDiamonds(data.diamonds);
      }
    } catch (err) {
      console.error("Failed to increment diamonds in DB:", err);
    }
  };

  const handleCopyLink = () => {
    const copyUrl = `${window.location.protocol}//${window.location.host}/nfc/${activeProfile.username || currentUser.username}`;
    navigator.clipboard.writeText(copyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Login action handler (hits Vercel Serverless Endpoint)
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Login failed.");
        return;
      }
      
      const sessionData = { user: data.user, token: data.token };
      if (rememberMe) {
        localStorage.setItem("pertap_session", JSON.stringify(sessionData));
      } else {
        sessionStorage.setItem("pertap_session", JSON.stringify(sessionData));
      }
      
      setCurrentUser(data.user);
      setLoginEmail("");
      setLoginPassword("");
      setActiveTab("home");
    } catch (err) {
      console.error("Login request error:", err);
      setAuthError("Network error occurred. Please try again.");
    }
  };

  // Registration action handler (hits Vercel Serverless Endpoint)
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError("");
    
    if (!registerName.trim() || !registerEmail.trim() || !registerUsername.trim() || !registerPassword) {
      setAuthError("All fields are required.");
      return;
    }
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: registerName, 
          email: registerEmail, 
          username: registerUsername,
          password: registerPassword 
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Registration failed.");
        return;
      }
      
      // Auto login after sign up
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registerEmail, password: registerPassword })
      });
      
      if (loginRes.ok) {
        const loginData = await loginRes.json();
        const sessionData = { user: loginData.user, token: loginData.token };
        sessionStorage.setItem("pertap_session", JSON.stringify(sessionData));
        setCurrentUser(loginData.user);
      }
      
      setRegisterName("");
      setRegisterEmail("");
      setRegisterUsername("");
      setRegisterPassword("");
      setActiveTab("home");
    } catch (err) {
      console.error("Registration request error:", err);
      setAuthError("Network error occurred. Please try again.");
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("pertap_session");
    sessionStorage.removeItem("pertap_session");
    setCurrentUser(null);
  };

  const getAuthToken = () => {
    const session = localStorage.getItem("pertap_session") || sessionStorage.getItem("pertap_session");
    if (!session) return null;

    try {
      return JSON.parse(session).token || null;
    } catch (err) {
      console.error("Failed to parse stored session:", err);
      return null;
    }
  };

  const readApiResponse = async (response) => {
    const text = await response.text();
    if (!text) return {};

    try {
      return JSON.parse(text);
    } catch {
      return { error: text };
    }
  };

  function isImageDataUrl(value) {
    return typeof value === "string" && value.startsWith("data:image/");
  }

  const findBase64ImagePath = (value, path = "profileData") => {
    if (typeof value === "string") {
      return isImageDataUrl(value) ? path : null;
    }

    if (Array.isArray(value)) {
      for (let index = 0; index < value.length; index += 1) {
        const result = findBase64ImagePath(value[index], `${path}[${index}]`);
        if (result) return result;
      }
      return null;
    }

    if (value && typeof value === "object") {
      for (const [key, childValue] of Object.entries(value)) {
        const result = findBase64ImagePath(childValue, `${path}.${key}`);
        if (result) return result;
      }
    }

    return null;
  };

  const getPayloadBytes = (value) => new TextEncoder().encode(JSON.stringify(value)).length;

  const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });

  const compressImageDataUrl = (dataUrl, maxSize = 320) => new Promise((resolve, reject) => {
    if (!isImageDataUrl(dataUrl)) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > height && width > maxSize) {
        height *= maxSize / width;
        width = maxSize;
      } else if (height > maxSize) {
        width *= maxSize / height;
        height = maxSize;
      }

      canvas.width = Math.max(1, Math.round(width));
      canvas.height = Math.max(1, Math.round(height));

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = () => reject(new Error("Could not process the selected image."));
    img.src = dataUrl;
  });

  async function uploadImageDataUrl(dataUrl, filenamePrefix = "avatar") {
    if (!isImageDataUrl(dataUrl)) return dataUrl;

    const token = getAuthToken();
    if (!token) {
      throw new Error("Please log in again before uploading your profile image.");
    }

    const compressedDataUrl = await compressImageDataUrl(dataUrl);
    const uploadPayload = {
      filename: `${filenamePrefix}-${Date.now()}.jpg`,
      contentType: "image/jpeg",
      base64Data: compressedDataUrl
    };
    const uploadBytes = getPayloadBytes(uploadPayload);
    console.log(`[Tapfolio] Avatar upload payload size: ${(uploadBytes / 1024).toFixed(2)} KB`);

    const uploadRes = await fetch("/api/profile/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(uploadPayload)
    });

    const uploadData = await readApiResponse(uploadRes);
    if (!uploadRes.ok) {
      throw new Error(uploadData.error || `Image upload failed with status ${uploadRes.status}.`);
    }

    if (!uploadData.url || isImageDataUrl(uploadData.url)) {
      throw new Error("Image upload did not return a valid URL.");
    }

    return uploadData.url;
  }

  // Upload selected avatar immediately so profile_data only stores an image URL.
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarUploadError("");

    if (!file.type.startsWith("image/")) {
      setAvatarUploadError("Please choose an image file.");
      return;
    }

    setIsAvatarUploading(true);
    try {
      const rawDataUrl = await readFileAsDataUrl(file);
      setEditAvatar(rawDataUrl); // Temporary local preview only while the upload runs.

      const uploadedUrl = await uploadImageDataUrl(rawDataUrl, `${currentUser.username}-avatar`);
      setEditAvatar(uploadedUrl);
      console.log("[Tapfolio] Avatar uploaded successfully. URL:", uploadedUrl);
    } catch (err) {
      console.error("Avatar upload error:", err);
      setAvatarUploadError(err.message || "Failed to upload profile image.");
    } finally {
      setIsAvatarUploading(false);
      e.target.value = "";
    }
  };

  // Profile Editor Save handler (hits Vercel Serverless Endpoint)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    if (isAvatarUploading) {
      alert("Please wait for the profile image upload to finish before saving.");
      return;
    }

    let finalAvatarUrl = editAvatar;
    if (isImageDataUrl(finalAvatarUrl)) {
      try {
        console.log("[Tapfolio] Legacy Base64 avatar detected during save. Uploading before profile update.");
        finalAvatarUrl = await uploadImageDataUrl(finalAvatarUrl, `${currentUser.username}-avatar`);
        setEditAvatar(finalAvatarUrl);
      } catch (err) {
        console.error("Avatar upload before save failed:", err);
        alert(err.message || "Failed to upload profile image. Changes not saved.");
        return;
      }
    }
    
    const updatedProfile = {
      ...activeProfile,
      name: editName,
      avatar: finalAvatarUrl,
      tagline: editTagline,
      bio: editBio,
      isPremium: editIsPremium,
      tags: [
        { text: editTag1 || "UI/UX Designer", type: "role" },
        { text: editTag2 || "Digital Creator", type: "role" },
        { text: editLocation || "Bangalore, India", type: "location" }
      ],
      socials: activeProfile.socials.map(social => {
        let handle = social.handle;
        let url = social.url;
        
        switch (social.platform) {
          case "Instagram":
            handle = editInstagram;
            url = editInstagram ? `https://instagram.com/${editInstagram.replace("@", "")}` : "#";
            break;
          case "LinkedIn":
            handle = editLinkedin;
            url = editLinkedin ? `https://linkedin.com/in/${editLinkedin.toLowerCase().replace(/\s+/g, "-")}` : "#";
            break;
          case "Telegram":
            handle = editTelegram;
            url = editTelegram ? `https://t.me/${editTelegram.replace("@", "")}` : "#";
            break;
          case "WhatsApp":
            handle = editWhatsapp;
            break;
          case "Download My CV / Resume":
            handle = editCv;
            break;
          case "Portfolio Link":
            handle = editPortfolio;
            url = editPortfolio ? `https://${editPortfolio}` : "#";
            break;
          case "Behance":
            handle = editBehance;
            url = editBehance ? `https://behance.net/${editBehance}` : "#";
            break;
        }
        
        return { ...social, handle, url };
      }),
      quote: {
        text: editQuoteText,
        signature: editName
      }
    };

    const base64ImagePath = findBase64ImagePath(updatedProfile);
    if (base64ImagePath) {
      alert(`Profile image at ${base64ImagePath} is still Base64. Upload the image first, then save again.`);
      return;
    }

    // 3. Log payload size before saving and block oversized profile JSON.
    const payloadStr = JSON.stringify({ profileData: updatedProfile });
    const payloadBytes = new TextEncoder().encode(payloadStr).length;
    const payloadSizeKB = (payloadBytes / 1024).toFixed(2);
    console.log(`[Tapfolio] Profile save payload size: ${payloadSizeKB} KB (${payloadBytes} bytes)`);

    if (payloadBytes > 100 * 1024) {
      alert(`Profile payload is ${payloadSizeKB}KB. Keep it below 100KB by storing images as URLs before saving.`);
      return;
    }
    
    try {
      const token = getAuthToken();
      if (!token) {
        alert("Your session has expired. Please log in again before saving.");
        return;
      }

      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ profileData: updatedProfile })
      });
      
      const data = await readApiResponse(res);
      
      if (!res.ok) {
        console.error("Save profile failed:", data.error);
        alert(`Failed to save changes: ${data.error || "Please try again."}`);
        return;
      }
      
      // Update state live upon success, incorporating the calculated score from server
      const savedProfile = {
        ...updatedProfile,
        diamonds: data.diamonds || updatedProfile.diamonds
      };
      setActiveProfile(savedProfile);
      setDiamonds(parseInt(data.diamonds || 0));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Save profile request error:", err);
      alert(`Network error occurred while saving: ${err.message}`);
    }
  };

  // 1. HOME TAB VIEW (Responsive full-web layout)
  const renderHomeTab = () => (
    <div className="home-container-centered">
      {/* Profile Card */}
      <div className="web-profile-card">
        {/* Header section with Wave & Diamond counter */}
        <div className="header-section-web">
          <div className="header-row">
            <div className="greeting-container">
              <div className="greeting-tag">
                <span className="greeting-wave">👋</span> Hey, i am
              </div>
              <h1 className="greeting-name">{activeProfile.name}</h1>
              <div className="greeting-sub">{activeProfile.tagline}</div>
            </div>
            
            <button className="diamond-badge" onClick={handleDiamondClick}>
              <Sparkles className="w-4 h-4" style={{ animation: "float 3s ease-in-out infinite" }} />
              <span>Score: {diamonds.toLocaleString()}</span>
            </button>
          </div>

          {/* Profile Picture and details stack */}
          <div className="profile-row">
            <div className="avatar-wrapper">
              <div className="avatar-ring-outer">
                <div className="avatar-ring-inner">
                  <img 
                    src={activeProfile.avatar} 
                    alt={activeProfile.name} 
                    className="avatar-image"
                  />
                </div>
              </div>
              {activeProfile.isOnline && <div className="status-indicator pulse"></div>}
            </div>

            <div className="profile-tags">
              {activeProfile.tags.map((tag, idx) => (
                <div key={idx} className="tag-pill">
                  <IconResolver name={tag.type === "location" ? "MapPin" : idx === 0 ? "Code" : "Sparkles"} />
                  <span>{tag.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bio Paragraph */}
        <p className="profile-bio">{activeProfile.bio}</p>
      </div>

      {/* Connection Header Divider */}
      <div className="divider-container">
        <span className="divider-line"></span>
        <span className="divider-text">
          <span className="divider-dot"></span>
          Connect with me
          <span className="divider-dot"></span>
        </span>
        <span className="divider-line"></span>
      </div>

      {/* Social links grid */}
      <div className="socials-grid" style={{ marginBottom: "24px" }}>
        {activeProfile.socials.map((social, idx) => (
          <a 
            key={idx}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-card"
            onClick={() => handleSocialClick(social)}
          >
            <div className="social-left">
              <div className="icon-box" style={{ backgroundColor: "rgba(255, 255, 255, 0.02)", color: social.color, border: `1px solid ${social.color}25` }}>
                <IconResolver name={social.icon} />
              </div>
              <div className="social-info">
                <span className="social-title">{social.platform}</span>
                <span className="social-handle">{social.handle}</span>
              </div>
            </div>
            <div className="social-right">
              <ChevronRight className="w-5 h-5" />
            </div>
          </a>
        ))}
      </div>

      {/* Signature Quote Card */}
      <div className="quote-card">
        <div className="quote-shape-1"></div>
        <div className="quote-shape-2"></div>
        <div className="quote-content">
          <span className="quote-icon-container">“</span>
          <div className="quote-body">
            <p className="quote-text">{activeProfile.quote.text}</p>
            <span className="quote-signature">{activeProfile.quote.signature}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. HISTORY TAB VIEW (Database-backed real-time connection log)
  const renderHistoryTab = () => {
    return (
      <div className="tab-view-container">
        <h2 style={{ fontSize: "1.6rem", fontWeight: "800", marginBottom: "4px" }}>Tap Analytics</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "25px" }}>Realtime history of your connections.</p>
        
        {isHistoryLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
            <div style={{
              width: "24px",
              height: "24px",
              border: "2px solid rgba(167, 139, 250, 0.1)",
              borderTopColor: "var(--primary-color)",
              borderRadius: "50%",
              animation: "rotateGlow 1s linear infinite"
            }}></div>
          </div>
        ) : historyEvents.length === 0 ? (
          <div style={{
            background: "var(--card-bg)",
            padding: "24px",
            borderRadius: "18px",
            border: "1px solid var(--card-border)",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: "0.9rem"
          }}>
            No connection actions logged yet. Share your card to start gathering taps!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {historyEvents.map((evt, idx) => (
              <div key={evt.id || idx} style={{
                display: "flex",
                gap: "16px",
                background: "var(--card-bg)",
                padding: "16px",
                borderRadius: "18px",
                border: "1px solid var(--card-border)",
                boxShadow: "var(--shadow-sm)"
              }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  color: evt.color || "var(--primary-color)",
                  border: `1px solid ${evt.color || "var(--primary-color)"}25`,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexShrink: 0
                }}>
                  <IconResolver name={evt.icon || "Link"} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", textAlign: "left" }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--text-dark)" }}>{evt.action}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "500" }}>{formatTimeAgo(evt.created_at)}</span>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px", lineHeight: "1.3" }}>{evt.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 3. LEADER BOARD TAB VIEW (Database-backed professional connection rankings)
  const renderLeaderboardTab = () => {
    // Determine current user's eligibility
    const hasAvatar = activeProfile.avatar && activeProfile.avatar !== "/profile_avatar.png" && activeProfile.avatar !== "";
    const hasBio = activeProfile.bio && activeProfile.bio.trim() !== "";
    const hasTags = activeProfile.tags && activeProfile.tags.some(t => t.text && t.text.trim() !== "");
    
    // Connected socials count helper
    const getConnectedSocialsCount = () => {
      let count = 0;
      if (activeProfile.socials) {
        activeProfile.socials.forEach(s => {
          if (s.handle && s.handle.trim() !== "" && s.handle !== "Chat with me" && s.handle !== "View & Download" && s.handle !== "abhinand.design" && !s.handle.includes("abhinand")) {
            count++;
          }
        });
      }
      return count;
    };
    const socialCount = getConnectedSocialsCount();
    const hasSocials = socialCount >= 3;
    const meetsCompleteness = hasAvatar && hasBio && hasTags && hasSocials;
    const isUserEligible = activeProfile.isPremium && meetsCompleteness;

    return (
      <div className="tab-view-container">
        <h2 style={{ fontSize: "1.6rem", fontWeight: "800", marginBottom: "4px" }}>Trending Portfolios</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "20px" }}>Creators with the most connections this week.</p>
        
        {/* Requirements guidelines banner */}
        <div className="auth-card" style={{ marginTop: 0, marginBottom: "24px", padding: "16px", display: "flex", flexDirection: "column", gap: "8px", borderLeft: "4px solid var(--primary-color)", textAlign: "left" }}>
          <h4 style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--text-dark)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Leaderboard Requirements</h4>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
            Only <strong>Premium Members</strong> who satisfy all profile completeness checklist criteria (Profile Picture, Bio description, Location/Role tags, and 3+ Social handles connected) are listed on the leaderboard.
          </p>
          <div style={{
            fontSize: "0.78rem",
            padding: "8px 12px",
            borderRadius: "8px",
            backgroundColor: isUserEligible ? "rgba(34, 197, 94, 0.05)" : "rgba(239, 68, 68, 0.05)",
            border: isUserEligible ? "1px solid rgba(34, 197, 94, 0.15)" : "1px solid rgba(239, 68, 68, 0.15)",
            color: isUserEligible ? "#4ade80" : "#ef4444",
            fontWeight: "600",
            width: "fit-content",
            marginTop: "4px"
          }}>
            {isUserEligible ? (
              "✓ Your portfolio is listed on the leaderboard."
            ) : (
              "✗ Your portfolio is not listed. Upgrade to Premium and complete your checklist in the Profile tab."
            )}
          </div>
        </div>

        {isLeaderboardLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
            <div style={{
              width: "24px",
              height: "24px",
              border: "2px solid rgba(167, 139, 250, 0.1)",
              borderTopColor: "var(--primary-color)",
              borderRadius: "50%",
              animation: "rotateGlow 1s linear infinite"
            }}></div>
          </div>
        ) : leaderboardData.length === 0 ? (
          <div style={{
            background: "var(--card-bg)",
            padding: "24px",
            borderRadius: "18px",
            border: "1px solid var(--card-border)",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: "0.9rem"
          }}>
            No qualified premium portfolios found on the leaderboard.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {leaderboardData.map((leader, idx) => {
              const rank = idx + 1;
              const isUser = currentUser && leader.email.toLowerCase() === currentUser.email.toLowerCase();
              return (
                <div key={leader.email || idx} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: isUser ? "rgba(99, 102, 241, 0.08)" : "var(--card-bg)",
                  padding: "14px 18px",
                  borderRadius: "20px",
                  border: isUser ? "1.5px solid var(--primary-color)" : "1px solid var(--card-border)",
                  boxShadow: isUser ? "var(--shadow-md)" : "var(--shadow-sm)",
                  transform: isUser ? "scale(1.02)" : "none"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ 
                      fontSize: "1.1rem", 
                      fontWeight: "800", 
                      color: rank === 1 ? "#fbbf24" : rank === 2 ? "#94a3b8" : rank === 3 ? "#b45309" : "var(--text-muted)",
                      width: "24px",
                      textAlign: "left"
                    }}>
                      #{rank}
                    </span>
                    
                    <img 
                      src={leader.avatar || "/profile_avatar.png"} 
                      alt={leader.name}
                      style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255, 255, 255, 0.1)", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}
                    />
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px", textAlign: "left" }}>
                      <span style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--text-dark)" }}>{leader.name} {isUser && "(You)"}</span>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "500" }}>{leader.tag || "Creator"}</span>
                    </div>
                  </div>

                  <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--primary-color)" }}>{leader.diamonds.toLocaleString()} pts</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // 4. AUTH GATEWAY VIEW (Login / Register Card shown before loading app frame)
  const renderAuthGateway = () => (
    <div className="tab-view-container" style={{ padding: "80px 24px 40px", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <div style={{
          background: "var(--primary-gradient)",
          width: "60px",
          height: "60px",
          borderRadius: "20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "0 auto 16px",
          color: "#fff",
          boxShadow: "0 8px 16px rgba(124, 58, 237, 0.3)"
        }}>
          <Gem className="w-8 h-8" />
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: "800", color: "var(--text-dark)", letterSpacing: "-1px" }}>Tapfolio</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "4px" }}>
          {authMode === "login" ? "Log in to access your digital card" : "Create a new account to get started"}
        </p>
      </div>

      <div className="auth-card">
        {authError && (
          <div style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "12px",
            padding: "12px",
            color: "#dc2626",
            fontSize: "0.82rem",
            marginBottom: "16px",
            fontWeight: "600",
            textAlign: "left"
          }}>
            ⚠️ {authError}
          </div>
        )}

        {authMode === "login" ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="you@domain.com"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                required
              />
            </div>
            
            {/* Remember Me Checkbox */}
            <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: "8px", marginTop: "4px", marginBottom: "8px" }}>
              <input 
                type="checkbox" 
                id="rememberMe" 
                checked={rememberMe} 
                onChange={e => setRememberMe(e.target.checked)} 
                style={{ width: "16px", height: "16px", accentColor: "var(--primary-color)", cursor: "pointer" }}
              />
              <label htmlFor="rememberMe" style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: "500", cursor: "pointer", userSelect: "none" }}>
                Remember Me
              </label>
            </div>

            <button type="submit" className="form-submit-btn">Log In</button>
            <span className="auth-toggle-link" onClick={() => { setAuthMode("register"); setAuthError(""); }}>
              Don't have an account? Register
            </span>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Mohammed Nibras"
                value={registerName}
                onChange={e => setRegisterName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="nibras"
                value={registerUsername}
                onChange={e => setRegisterUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="you@domain.com"
                value={registerEmail}
                onChange={e => setRegisterEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={registerPassword}
                onChange={e => setRegisterPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="form-submit-btn" style={{ marginTop: "12px" }}>Register & Create Card</button>
            <span className="auth-toggle-link" onClick={() => { setAuthMode("login"); setAuthError(""); }}>
              Already have an account? Log In
            </span>
          </form>
        )}
      </div>
    </div>
  );

  // 5. PROFILE TAB VIEW (Edit profile form responsive widescreen layout)
  const renderProfileTab = () => {
    const getConnectedSocialsCount = () => {
      let count = 0;
      if (editInstagram && editInstagram.trim() !== "") count++;
      if (editLinkedin && editLinkedin.trim() !== "") count++;
      if (editTelegram && editTelegram.trim() !== "") count++;
      if (editWhatsapp && editWhatsapp.trim() !== "") count++;
      if (editCv && editCv.trim() !== "") count++;
      if (editPortfolio && editPortfolio.trim() !== "") count++;
      if (editBehance && editBehance.trim() !== "") count++;
      return count;
    };

    const hasAvatar = editAvatar && editAvatar !== "/profile_avatar.png" && editAvatar !== "";
    const hasBio = editBio && editBio.trim() !== "";
    const hasTags = (editLocation && editLocation.trim() !== "") || (editTag1 && editTag1.trim() !== "") || (editTag2 && editTag2.trim() !== "");
    const hasQuote = editQuoteText && editQuoteText.trim() !== "";
    const socialCount = getConnectedSocialsCount();
    const hasSocials = socialCount >= 3;

    const checklistCount = (hasAvatar ? 1 : 0) + (hasBio ? 1 : 0) + (hasTags ? 1 : 0) + (hasQuote ? 1 : 0) + (hasSocials ? 1 : 0);
    const scoreBoost = (hasAvatar ? 2000 : 0) + (hasBio ? 1500 : 0) + (hasTags ? 1500 : 0) + (hasQuote ? 1000 : 0) + (hasSocials ? 1500 : 0);
    const premiumBoost = editIsPremium ? 5000 : 0;
    const totalBoost = scoreBoost + premiumBoost;
    const meetsCompleteness = hasAvatar && hasBio && hasTags && hasSocials;
    const isEligible = editIsPremium && meetsCompleteness;

    return (
      <div className="tab-view-container">
        <div className="admin-header">
          <div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-dark)" }}>Edit Tapfolio</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Logged in as {currentUser.email}</p>
          </div>
          <button className="btn-danger-outline" onClick={handleLogout}>Log Out</button>
        </div>

        {saveSuccess && (
          <div style={{
            background: "rgba(34, 197, 94, 0.08)",
            border: "1px solid rgba(34, 197, 94, 0.2)",
            borderRadius: "12px",
            padding: "12px",
            color: "#4ade80",
            fontSize: "0.82rem",
            marginBottom: "16px",
            fontWeight: "700",
            textAlign: "left"
          }}>
            ✓ Profile saved successfully!
          </div>
        )}

        {/* Score Guide & Subscription status dashboard */}
        <div className="checklist-container auth-card">
          {/* Subscription & Eligibility Status */}
          <div className="checklist-left-col" style={{ display: "flex", flexDirection: "column", gap: "16px", borderRight: "1px solid var(--card-border)", paddingRight: "24px" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-dark)", display: "flex", alignItems: "center", gap: "8px", border: "none", padding: 0 }}>
                Leaderboard Eligibility
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "4px" }}>
                Upgrade your plan and satisfy criteria checklist to join trending rankings.
              </p>
            </div>

            {/* Plan Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-muted)" }}>Membership Tier:</span>
              {editIsPremium ? (
                <span style={{ backgroundColor: "rgba(251, 191, 36, 0.1)", color: "#fbbf24", border: "1.5px solid #fbbf24", padding: "4px 12px", borderRadius: "50px", fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  👑 Premium
                </span>
              ) : (
                <span style={{ backgroundColor: "rgba(100, 116, 139, 0.1)", color: "var(--text-muted)", border: "1.5px solid var(--card-border)", padding: "4px 12px", borderRadius: "50px", fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Standard
                </span>
              )}
            </div>

            {/* Eligibility Status Message */}
            <div style={{ 
              backgroundColor: isEligible ? "rgba(34, 197, 94, 0.05)" : "rgba(239, 68, 68, 0.05)",
              border: isEligible ? "1px solid rgba(34, 197, 94, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)",
              padding: "12px",
              borderRadius: "12px",
              fontSize: "0.8rem",
              color: isEligible ? "#4ade80" : "#ef4444",
              textAlign: "left",
              lineHeight: "1.4"
            }}>
              {isEligible ? (
                <>✨ <strong>Listed on Leaderboard!</strong> Your portfolio is qualified and ranked with a total points boost of <strong>+{totalBoost.toLocaleString()} pts</strong>.</>
              ) : (
                <>
                  ⚠️ <strong>Not Listed on Leaderboard.</strong><br/>
                  Requirements:<br/>
                  {!editIsPremium && <div style={{ marginLeft: "8px" }}>• Upgrade to Premium Tier</div>}
                  {!meetsCompleteness && <div style={{ marginLeft: "8px" }}>• Complete checklist criteria (Avatar, Bio, Tags, 3+ Socials)</div>}
                </>
              )}
            </div>

            {/* Toggle Controls */}
            <div>
              {editIsPremium ? (
                <button 
                  type="button"
                  onClick={() => setEditIsPremium(false)}
                  className="btn-danger-outline"
                  style={{ width: "100%", borderRadius: "12px", height: "42px", display: "flex", justifyContent: "center", alignItems: "center" }}
                >
                  Downgrade to Standard
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={() => setEditIsPremium(true)}
                  style={{
                    width: "100%",
                    background: "var(--primary-gradient)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    height: "42px",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    boxShadow: "var(--shadow-sm)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  Upgrade to Premium Plan (Payed)
                </button>
              )}
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "6px", display: "block" }}>
                *Note: Click 'Save Profile Changes' below to persist plan updates.
              </span>
            </div>
          </div>

          {/* Completion Checklist */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--text-dark)" }}>Score Boost Checklist</h4>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                <div style={{ flex: 1, height: "6px", backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(checklistCount / 5) * 100}%`, backgroundColor: "var(--primary-color)", transition: "var(--transition)" }}></div>
                </div>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "600" }}>{checklistCount}/5 Done</span>
              </div>
            </div>

            {/* Checklist Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "Profile Picture", pts: "+2,000", ok: hasAvatar },
                { label: "Bio Description", pts: "+1,500", ok: hasBio },
                { label: "Location & Role Tags", pts: "+1,500", ok: hasTags },
                { label: "Signature Quote", pts: "+1,000", ok: hasQuote },
                { label: "Connect 3+ Social Links", pts: "+1,500", ok: hasSocials, sub: `(${socialCount}/3 connected)` }
              ].map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.8rem", padding: "6px 8px", backgroundColor: "rgba(255, 255, 255, 0.01)", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.02)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: item.ok ? "#22c55e" : "var(--text-muted)", fontWeight: "700" }}>
                      {item.ok ? "✓" : "○"}
                    </span>
                    <span style={{ color: item.ok ? "var(--text-dark)" : "var(--text-muted)", fontWeight: item.ok ? "600" : "400" }}>
                      {item.label} <span style={{ fontSize: "0.7rem", opacity: 0.6 }}>{item.sub}</span>
                    </span>
                  </div>
                  <span style={{ color: "var(--primary-color)", fontWeight: "700", fontSize: "0.75rem" }}>
                    {item.pts} pts
                  </span>
                </div>
              ))}
            </div>

            {/* Total Points boost display */}
            <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
              <span style={{ color: "var(--text-muted)", fontWeight: "600" }}>Total Score Boost:</span>
              <span style={{ color: "#fbbf24", fontWeight: "800" }}>+{totalBoost.toLocaleString()} pts</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile}>
          <div className="editor-grid">
            {/* Left Column: Basic Info & Quote */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="auth-card" style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: 0 }}>
                <h3 className="dashboard-section-title" style={{ marginTop: 0 }}>Basic Info</h3>
                
                <div className="form-group">
                  <label className="form-label">Display Name</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Profile Picture</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "4px" }}>
                    <div className="avatar-wrapper" style={{ width: "70px", height: "70px" }}>
                      <div className="avatar-ring-outer" style={{ inset: "-4px" }}>
                        <div className="avatar-ring-inner">
                          <img 
                            src={editAvatar || "/profile_avatar.png"} 
                            alt="Avatar Preview" 
                            className="avatar-image"
                          />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAvatarUpload}
                        disabled={isAvatarUploading}
                        className="form-input"
                        style={{ fontSize: "0.8rem", padding: "8px 10px" }}
                      />
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        {isAvatarUploading ? "Uploading image and replacing Base64 with a URL..." : "Supports JPG, PNG, GIF. The saved profile stores only the uploaded URL."}
                      </span>
                      {avatarUploadError && (
                        <span style={{ fontSize: "0.72rem", color: "#ef4444", fontWeight: "600" }}>
                          {avatarUploadError}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tagline / Subtitle</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={editTagline}
                    onChange={e => setEditTagline(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bio Description</label>
                  <textarea 
                    className="form-input"
                    rows="4"
                    style={{ resize: "none" }}
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Location (City, Country)</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={editLocation}
                    onChange={e => setEditLocation(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role Tag 1</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={editTag1}
                    onChange={e => setEditTag1(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role Tag 2</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={editTag2}
                    onChange={e => setEditTag2(e.target.value)}
                  />
                </div>
              </div>

              <div className="auth-card" style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: 0 }}>
                <h3 className="dashboard-section-title" style={{ marginTop: 0 }}>Signature Quote</h3>

                <div className="form-group">
                  <label className="form-label">Quote Content</label>
                  <textarea 
                    className="form-input"
                    rows="2"
                    style={{ resize: "none" }}
                    value={editQuoteText}
                    onChange={e => setEditQuoteText(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Right Column: Social Links & Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="auth-card" style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: 0 }}>
                <h3 className="dashboard-section-title" style={{ marginTop: 0 }}>Connection Handles</h3>

                <div className="form-group">
                  <label className="form-label">Instagram Username</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="@username"
                    value={editInstagram}
                    onChange={e => setEditInstagram(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">LinkedIn Name / URL</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="Username"
                    value={editLinkedin}
                    onChange={e => setEditLinkedin(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Telegram Handle</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="@username"
                    value={editTelegram}
                    onChange={e => setEditTelegram(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">WhatsApp Text</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="Chat with me"
                    value={editWhatsapp}
                    onChange={e => setEditWhatsapp(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CV / Resume Text</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="View & Download"
                    value={editCv}
                    onChange={e => setEditCv(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Portfolio Website URL</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="username.design"
                    value={editPortfolio}
                    onChange={e => setEditPortfolio(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Behance Username</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="behance.net/username"
                    value={editBehance}
                    onChange={e => setEditBehance(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="form-submit-btn"
                disabled={isAvatarUploading}
                style={{
                  height: "54px",
                  fontSize: "1rem",
                  marginBottom: "20px",
                  opacity: isAvatarUploading ? 0.65 : 1,
                  cursor: isAvatarUploading ? "not-allowed" : "pointer"
                }}
              >
                {isAvatarUploading ? "Uploading Image..." : "Save Profile Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  };

  // Widescreen Top Glassmorphism Navbar
  const renderDesktopNavbar = () => (
    <div className="desktop-navbar">
      <div className="navbar-inner">
        <button className="navbar-brand" onClick={() => setActiveTab("home")}>
          <Gem className="w-6 h-6 navbar-brand-icon" style={{ marginRight: "4px" }} />
          <span>Tapfolio</span>
        </button>

        <div className="navbar-menu">
          <button 
            className={`navbar-link ${activeTab === "home" ? "active" : ""}`}
            onClick={() => setActiveTab("home")}
          >
            Home
          </button>
          <button 
            className={`navbar-link ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            History
          </button>
          <button 
            className={`navbar-link ${activeTab === "leaderboard" ? "active" : ""}`}
            onClick={() => setActiveTab("leaderboard")}
          >
            Leader Board
          </button>
          <button 
            className={`navbar-link ${activeTab === "profile" ? "active" : ""}`}
            onClick={handleProfileTabClick}
          >
            Profile
          </button>
        </div>

        <div className="navbar-actions">
          <span className="navbar-user">{currentUser.email}</span>
          <button className="navbar-share-btn" onClick={() => setShowShareModal(true)}>
            <Plus className="w-4 h-4" />
            <span>Share Card</span>
          </button>
          <button className="btn-danger-outline" style={{ padding: "6px 14px" }} onClick={handleLogout}>Log Out</button>
        </div>
      </div>
    </div>
  );

  // High-Performance Loading State Renderer
  if (isLoading) {
    return (
      <div className="app-container">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", width: "100%", gap: "16px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            border: "4px solid rgba(167, 139, 250, 0.1)",
            borderTopColor: "var(--primary-color)",
            borderRadius: "50%",
            animation: "rotateGlow 1s linear infinite"
          }}></div>
          <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: "500" }}>Loading Tapfolio...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Background Ambients */}
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      {/* Desktop Top Navbar */}
      {currentUser && renderDesktopNavbar()}

      {/* Main Responsive Grid Layout */}
      <div className="phone-frame">
        <div className="phone-notch"></div>
        
        <div className="phone-content">
          {!currentUser ? (
            <div className="auth-container">
              <div style={{ width: "100%", maxWidth: "440px" }}>
                {renderAuthGateway()}
              </div>
            </div>
          ) : (
            <>
              {activeTab === "home" && renderHomeTab()}
              {activeTab === "history" && renderHistoryTab()}
              {activeTab === "leaderboard" && renderLeaderboardTab()}
              {activeTab === "profile" && renderProfileTab()}
            </>
          )}
        </div>

        {/* Floating Bottom Nav - Only show when authenticated (Visible on Mobile) */}
        {currentUser && (
          <div className="bottom-nav">
            <button 
              className={`nav-item ${activeTab === "home" ? "active" : ""}`}
              onClick={() => setActiveTab("home")}
            >
              <Home className="nav-icon" />
              <span className="nav-label">Home</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === "history" ? "active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              <Clock className="nav-icon" />
              <span className="nav-label">History</span>
            </button>

            {/* Plus button triggers the Share dialog modal */}
            <button 
              className="nav-center-item"
              onClick={() => setShowShareModal(true)}
            >
              <Plus className="center-plus-icon" />
            </button>

            <button 
              className={`nav-item ${activeTab === "leaderboard" ? "active" : ""}`}
              onClick={() => setActiveTab("leaderboard")}
            >
              <Trophy className="nav-icon" />
              <span className="nav-label">Leader Board</span>
            </button>

            <button 
              className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
              onClick={handleProfileTabClick}
            >
              <User className="nav-icon" />
              <span className="nav-label">Profile</span>
            </button>
          </div>
        )}
      </div>

      {/* High-Fidelity Share Modal Overlay */}
      {showShareModal && currentUser && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(5, 7, 15, 0.85)",
          backdropFilter: "blur(8px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "20px"
        }}
        onClick={() => setShowShareModal(false)}
        >
          <div style={{
            background: "var(--card-bg)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid var(--card-border)",
            borderRadius: "28px",
            width: "100%",
            maxWidth: "340px",
            padding: "24px",
            boxShadow: "var(--shadow-lg)",
            position: "relative",
            textAlign: "center",
            color: "var(--text-dark)"
          }}
          onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowShareModal(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "rgba(255,255,255,0.05)",
                border: "none",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                color: "var(--text-dark)"
              }}
            >
              <X className="w-4 h-4" />
            </button>

            <div style={{ 
              background: "var(--primary-gradient)",
              width: "50px",
              height: "50px",
              borderRadius: "15px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "10px auto 16px",
              color: "#fff",
              boxShadow: "0 4px 10px rgba(99, 102, 241, 0.3)"
            }}>
              <Share2 className="w-5 h-5" />
            </div>

            <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-dark)", marginBottom: "4px" }}>Share Profile</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "20px" }}>Let others scan to connect instantly.</p>

            {/* High-Fidelity Mock QR Code SVG */}
            <div style={{
              background: "#fff",
              padding: "16px",
              borderRadius: "20px",
              width: "160px",
              height: "160px",
              margin: "0 auto 20px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "var(--shadow-sm)",
              border: "1.5px solid var(--card-border)"
            }}>
              <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4">
                <rect x="5" y="5" width="25" height="25" rx="3" stroke="#6366f1" strokeWidth="6" />
                <rect x="13" y="13" width="9" height="9" fill="#6366f1" stroke="none" />
                <rect x="70" y="5" width="25" height="25" rx="3" stroke="#6366f1" strokeWidth="6" />
                <rect x="78" y="13" width="9" height="9" fill="#6366f1" stroke="none" />
                <rect x="5" y="70" width="25" height="25" rx="3" stroke="#6366f1" strokeWidth="6" />
                <rect x="13" y="78" width="9" height="9" fill="#6366f1" stroke="none" />
                {/* QR Code mock grid cells */}
                <rect x="42" y="10" width="10" height="10" fill="#6366f1" stroke="none" />
                <rect x="55" y="18" width="10" height="6" fill="#6366f1" stroke="none" />
                <rect x="45" y="32" width="6" height="12" fill="#6366f1" stroke="none" />
                <rect x="15" y="42" width="14" height="6" fill="#6366f1" stroke="none" />
                <rect x="42" y="70" width="12" height="18" fill="#6366f1" stroke="none" />
                <rect x="70" y="45" width="10" height="10" fill="#6366f1" stroke="none" />
                <rect x="80" y="75" width="10" height="10" fill="#6366f1" stroke="none" />
                <rect x="58" y="50" width="6" height="14" fill="#6366f1" stroke="none" />
                <rect x="82" y="60" width="12" height="6" fill="#6366f1" stroke="none" />
              </svg>
            </div>

            {/* Copy Link Input Bar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: "12px",
              padding: "6px 8px 6px 12px",
              border: "1.5px solid var(--card-border)",
              gap: "8px",
              marginBottom: "10px"
            }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, textAlign: "left" }}>
                {window.location.host || "pertap.com"}/nfc/{activeProfile.username || currentUser.username}
              </span>
              <button 
                onClick={handleCopyLink}
                style={{
                  background: "var(--primary-gradient)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
