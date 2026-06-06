// Parse username dynamically from URL paths or query params (supports /nfc/username, ?username=..., ?email=...)
const params = new URLSearchParams(window.location.search);
let username = params.get("username");
if (!username) {
  const paths = window.location.pathname.split('/');
  const nfcIndex = paths.indexOf('nfc');
  if (nfcIndex !== -1 && paths[nfcIndex + 1]) {
    username = paths[nfcIndex + 1];
  }
}
if (!username) {
  const emailParam = params.get("email");
  if (emailParam) {
    username = emailParam.split('@')[0];
  }
}
if (!username) {
  username = "default";
}

// SVG icon maps for Profile Tags
const TAG_ICONS = {
  location: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  role: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  video: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>`
};

// SVG icon maps for Social Cards
const SOCIAL_ICONS = {
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zM8 19H5V8h3v11zm-.5-12.27c-.97 0-1.75-.78-1.75-1.75s.78-1.75 1.75-1.75 1.75.78 1.75 1.75-.78 1.75-1.75 1.75zm11.5 12.27h-3v-5.6c0-3.37-4-3.11-4 0v5.6h-3V8h3v1.76c1.4-2.58 7-2.78 7 2.48v6.76z"/></svg>`,
  telegram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.37-.49 1.02-.74 3.99-1.74 6.66-2.88 7.99-3.44 3.8-1.58 4.59-1.85 5.1-.16.03.11.04.22.02.33z"/></svg>`,
  send: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.37-.49 1.02-.74 3.99-1.74 6.66-2.88 7.99-3.44 3.8-1.58 4.59-1.85 5.1-.16.03.11.04.22.02.33z"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.48 2.01 14.007 1.027 12.01 1.027c-5.442 0-9.866 4.372-9.87 9.802 0 1.714.453 3.39 1.313 4.882L2.435 21.03l4.212-1.876zm11.233-5.321c-.328-.163-1.94-.949-2.24-1.058-.3-.11-.518-.163-.736.163-.218.327-.845 1.058-1.036 1.275-.19.218-.381.245-.71.082-.327-.164-1.383-.505-2.636-1.614-.974-.863-1.632-1.93-1.823-2.257-.19-.327-.02-.504.143-.667.147-.146.328-.382.492-.573.164-.191.218-.328.328-.546.11-.218.055-.41-.028-.573-.082-.164-.736-1.744-1.01-2.4-.266-.636-.538-.55-.736-.56-.19-.01-.408-.01-.627-.01-.218 0-.573.082-.873.409-.3.327-1.145 1.118-1.145 2.727s1.173 3.164 1.336 3.382c.164.218 2.308 3.498 5.59 4.916.78.337 1.39.539 1.86.688.783.248 1.497.213 2.06.129.627-.094 1.94-.787 2.213-1.547.273-.76.273-1.409.191-1.546-.082-.136-.3-.218-.627-.382z"/></svg>`,
  messagecircle: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.48 2.01 14.007 1.027 12.01 1.027c-5.442 0-9.866 4.372-9.87 9.802 0 1.714.453 3.39 1.313 4.882L2.435 21.03l4.212-1.876zm11.233-5.321c-.328-.163-1.94-.949-2.24-1.058-.3-.11-.518-.163-.736.163-.218.327-.845 1.058-1.036 1.275-.19.218-.381.245-.71.082-.327-.164-1.383-.505-2.636-1.614-.974-.863-1.632-1.93-1.823-2.257-.19-.327-.02-.504.143-.667.147-.146.328-.382.492-.573.164-.191.218-.328.328-.546.11-.218.055-.41-.028-.573-.082-.164-.736-1.744-1.01-2.4-.266-.636-.538-.55-.736-.56-.19-.01-.408-.01-.627-.01-.218 0-.573.082-.873.409-.3.327-1.145 1.118-1.145 2.727s1.173 3.164 1.336 3.382c.164.218 2.308 3.498 5.59 4.916.78.337 1.39.539 1.86.688.783.248 1.497.213 2.06.129.627-.094 1.94-.787 2.213-1.547.273-.76.273-1.409.191-1.546-.082-.136-.3-.218-.627-.382z"/></svg>`,
  filetext: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
  globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
  behance: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.228 12.186c0 .59-.306 1.002-.894 1.002H4.661v-2.003h2.673c.588 0 .894.41.894 1.001zm-.136-3.078c0 .513-.275.845-.788.845H4.661V8.261h2.643c.513 0 .788.332.788.847zM0 4.67v14.66h8.847c2.518 0 4.331-1.074 4.331-3.666 0-1.632-.782-2.78-2.148-3.23 1.107-.468 1.63-1.489 1.63-2.886 0-2.417-1.745-3.32-4.043-3.32H0zm20.89 6.852c-1.387 0-2.14.733-2.316 2.052h4.593c-.098-1.3-.85-2.052-2.277-2.052zm.126-2.263c2.463 0 4.364 1.547 4.364 4.54h-9.056c.075 2.128 1.337 3.036 3.125 3.036 1.442 0 2.502-.55 2.821-1.71h2.276c-.63 2.45-2.766 3.73-5.197 3.73-3.864 0-5.632-2.585-5.632-5.463 0-3.045 1.93-5.673 5.3-5.673zm-3.364-2.616h6.417V8.1h-6.417v-1.44z"/></svg>`
};

// Default styling settings for social card brand colors
const DEFAULT_BRAND_COLORS = {
  instagram: "#E1306C",
  linkedin: "#0077B5",
  telegram: "#0088cc",
  send: "#0088cc",
  whatsapp: "#25D366",
  messagecircle: "#25D366",
  filetext: "#0052ff",
  link: "#0052ff",
  globe: "#0057ff",
  behance: "#0057ff"
};

// Load profile data from API
async function loadProfile() {
  try {
    const response = await fetch(`/api/profile/${username}`);

    if (!response.ok) {
      throw new Error("Profile details not found");
    }

    const profile = await response.json();

    // 1. Populate Basic Info
    document.getElementById("preview-name").textContent = profile.name || "Abhinand";
    
    // Set custom subtitle/tagline CTA
    const ctaElement = document.getElementById("preview-tagline-cta");
    if (ctaElement && profile.tagline) {
      // Retain the SVG underline child
      const svgUnderline = ctaElement.querySelector(".hand-underline");
      ctaElement.innerHTML = `${profile.tagline}`;
      if (svgUnderline) {
        ctaElement.appendChild(svgUnderline);
      }
    }

    // Format and highlight bio
    const bioElement = document.getElementById("preview-bio");
    if (bioElement && profile.bio) {
      let bioText = profile.bio;
      // Highlight "connect brands" in blue dynamically if it matches
      if (bioText.includes("connect brands")) {
        bioText = bioText.replace("connect brands", `<span class="highlight-blue">connect brands</span>`);
      }
      bioElement.innerHTML = bioText;
    }

    // Set Avatar Image
    if (profile.avatar) {
      document.getElementById("preview-avatar").src = profile.avatar;
    }

    // Set Diamonds Points score
    const pointsCountEl = document.getElementById("diamonds-count");
    if (pointsCountEl) {
      pointsCountEl.textContent = profile.diamonds || "12000";
    }

    // 2. Render Vertical Stack of Tags on the Right of Avatar
    const tagsContainer = document.getElementById("preview-tags");
    if (tagsContainer) {
      tagsContainer.innerHTML = "";
      if (profile.tags && profile.tags.length > 0) {
        profile.tags.forEach(tag => {
          const tagDiv = document.createElement("div");
          tagDiv.className = "tag-badge";

          // Determine appropriate SVG icon
          let iconSvg = TAG_ICONS.role;
          const textLower = tag.text.toLowerCase();
          
          if (tag.type === "location" || textLower.includes("india") || textLower.includes("bangalore") || textLower.includes(",")) {
            iconSvg = TAG_ICONS.location;
          } else if (tag.type === "video" || textLower.includes("creator") || textLower.includes("video") || textLower.includes("digital")) {
            iconSvg = TAG_ICONS.video;
          }

          tagDiv.innerHTML = `
            ${iconSvg}
            <span class="tag-text">${tag.text}</span>
          `;
          tagsContainer.appendChild(tagDiv);
        });
      }
    }

    // 3. Render Social Link Tiles
    const socialsGrid = document.getElementById("preview-socials-grid");
    if (socialsGrid) {
      socialsGrid.innerHTML = "";
      if (profile.socials && profile.socials.length > 0) {
        profile.socials.forEach(social => {
          const socialLink = document.createElement("a");
          socialLink.href = social.url || "#";
          socialLink.target = "_blank";
          socialLink.className = "social-card";

          // Determine SVG icon and brand color
          const platformKey = social.platform.toLowerCase().replace(/[^a-z0-9]/g, "");
          const cleanIconKey = (social.icon || social.platform).toLowerCase();
          
          const iconSvg = SOCIAL_ICONS[cleanIconKey] || SOCIAL_ICONS[platformKey] || SOCIAL_ICONS.link;
          const brandColor = social.color || DEFAULT_BRAND_COLORS[cleanIconKey] || DEFAULT_BRAND_COLORS[platformKey] || "#0052ff";

          let iconBoxStyle = `background-color: ${brandColor};`;
          if (cleanIconKey === "instagram" || platformKey === "instagram") {
            iconBoxStyle = `background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);`;
          }

          socialLink.innerHTML = `
            <div class="social-card-left">
              <div class="social-icon-box" style="${iconBoxStyle}">
                ${iconSvg}
              </div>
              <div class="social-info">
                <span class="social-name">${social.platform}</span>
                <span class="social-handle">${social.handle || ""}</span>
              </div>
            </div>
            <div class="social-card-right">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          `;
          socialsGrid.appendChild(socialLink);
        });
      }
    }

    // 4. Render Quote Card
    const quoteCard = document.getElementById("preview-quote-card");
    if (quoteCard) {
      if (profile.quote && profile.quote.text) {
        document.getElementById("preview-quote-text").textContent = profile.quote.text;
        document.getElementById("preview-quote-author").textContent = profile.quote.signature || "";
        quoteCard.style.display = "block";
      } else {
        quoteCard.style.display = "none";
      }
    }

    // 5. Hook up Interactive Diamonds Points Incrementor Click Event
    const btnIncrement = document.getElementById("btn-increment-points");
    const centerFloatingBtn = document.querySelector(".nav-center-btn");
    
    const incrementScore = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      try {
        const res = await fetch(`/api/profile/${username}/tap`, {
          method: "POST"
        });
        if (res.ok) {
          const data = await res.json();
          if (pointsCountEl) {
            pointsCountEl.textContent = data.diamonds;
            
            // Add subtle pop-scaling animation to diamonds badge
            const badge = document.getElementById("diamonds-badge");
            badge.style.transform = "scale(1.1)";
            setTimeout(() => {
              badge.style.transform = "scale(1)";
            }, 150);
          }
        }
      } catch (err) {
        console.error("Failed to increment diamonds points:", err);
      }
    };

    if (btnIncrement) {
      btnIncrement.addEventListener("click", incrementScore);
    }
    if (centerFloatingBtn) {
      centerFloatingBtn.addEventListener("click", incrementScore);
    }

  } catch (error) {
    console.error("Error loading user profile details:", error);
    document.getElementById("preview-name").textContent = "Profile Not Found";
  }
}

// Initialize on page load
loadProfile();