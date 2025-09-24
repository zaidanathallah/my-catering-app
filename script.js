// Supabase Setup
const supabaseUrl = "https://nmdmriudkchtmdjkgnye.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tZG1yaXVka2NodG1kamtnbnllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1ODUwODMsImV4cCI6MjA3NDE2MTA4M30.LnZrN6eYdAdbbWtDo_8vsWDqJ74NOGkBGjagKFdqoXo";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

async function loadTestimonials() {
  console.log("Loading testimonials...");
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error loading testimonials:", error);
    return;
  }
  console.log("Data loaded:", data);
  const inner = document.getElementById("carousel-inner");
  inner.innerHTML = ""; // Clear
  if (data && data.length > 0) {
    const duplicated = [...data, ...data];
    duplicated.forEach((item) => {
      const div = document.createElement("div");
      div.className = "carousel-item bg-white p-4 rounded shadow";
      div.innerHTML = `<p class="font-bold">${item.name}</p><p>${item.message}</p>`;
      inner.appendChild(div);
    });
  } else {
    inner.innerHTML = '<p class="text-center">Belum ada testimoni.</p>';
  }
}

document.getElementById("testi-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const message = document.getElementById("message").value.trim();
  const submitBtn = document.getElementById("submit-testimonial-btn");
  const successMsg = document.getElementById("testimonial-success");
  const errorMsg = document.getElementById("testimonial-error");

  // Hide previous messages
  successMsg.classList.add("hidden");
  errorMsg.classList.add("hidden");

  // Validate inputs
  if (!name || !message) {
    showTestimonialError("Mohon lengkapi semua field.");
    return;
  }

  if (name.length < 2) {
    showTestimonialError("Nama minimal 2 karakter.");
    return;
  }

  if (message.length < 10) {
    showTestimonialError("Testimoni minimal 10 karakter.");
    return;
  }

  // Show loading state
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Mengirim...";
  submitBtn.disabled = true;
  submitBtn.classList.add("opacity-75", "cursor-not-allowed");

  try {
    console.log("Sending:", { name, message });
    const { error } = await supabase
      .from("testimonials")
      .insert({ name, message });

    if (!error) {
      console.log("Success, reloading testimonials...");

      // Show success message
      showTestimonialSuccess();

      // Reset form
      document.getElementById("testi-form").reset();

      // Reload testimonials
      loadTestimonials();

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        successMsg.classList.add("hidden");
      }, 5000);
    } else {
      throw error;
    }
  } catch (error) {
    console.error("Error inserting testimony:", error);
    showTestimonialError("Gagal mengirim testimoni. Silakan coba lagi.");
  } finally {
    // Restore button state
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    submitBtn.classList.remove("opacity-75", "cursor-not-allowed");
  }
});

// Helper function to show success message
function showTestimonialSuccess() {
  const successMsg = document.getElementById("testimonial-success");
  successMsg.classList.remove("hidden");
  successMsg.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Helper function to show error message
function showTestimonialError(message) {
  const errorMsg = document.getElementById("testimonial-error");
  const errorText = errorMsg.querySelector("p");
  errorText.textContent = message;
  errorMsg.classList.remove("hidden");
  errorMsg.scrollIntoView({ behavior: "smooth", block: "nearest" });

  // Auto-hide error message after 5 seconds
  setTimeout(() => {
    errorMsg.classList.add("hidden");
  }, 5000);
}

// Load initial data when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Load all data
  loadTestimonials();
  loadMenuItems();
  loadArticles();

  // Handle "Load More Articles" button
  const loadMoreBtn = document.getElementById("load-more-articles");
  let articlesOffset = 6; // Start after the first 6 articles

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", async function () {
      try {
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .order("created_at", { ascending: false })
          .range(articlesOffset, articlesOffset + 5); // Load 6 more articles

        if (error) throw error;

        if (data && data.length > 0) {
          // Add new articles to global storage
          articlesData = [...articlesData, ...data];

          const articlesGrid = document.getElementById("articles-grid");
          data.forEach((article) => {
            const articleItem = createArticleCard(article);
            articlesGrid.appendChild(articleItem);
          });

          articlesOffset += data.length;

          // Hide button if no more articles
          if (data.length < 6) {
            loadMoreBtn.style.display = "none";
          }
        } else {
          loadMoreBtn.textContent = "Tidak ada artikel lainnya";
          loadMoreBtn.disabled = true;
        }
      } catch (error) {
        console.error("Error loading more articles:", error);
        alert("Gagal memuat artikel tambahan");
      }
    });
  }

  // Live Chat Widget Functionality
  const chatButton = document.getElementById("chat-button");
  const chatBox = document.getElementById("chat-box");
  const closeChat = document.getElementById("close-chat");
  const chatInput = document.getElementById("chat-input");
  const sendMessage = document.getElementById("send-message");
  const quickMessageBtns = document.querySelectorAll(".quick-message-btn");
  const whatsappNumber = "6281259384244"; // WhatsApp number

  // Toggle chat box
  chatButton.addEventListener("click", function () {
    chatBox.classList.toggle("hidden");
    if (!chatBox.classList.contains("hidden")) {
      chatInput.focus();
    }
  });

  // Close chat box
  closeChat.addEventListener("click", function () {
    chatBox.classList.add("hidden");
  });

  // Send message function
  function sendToWhatsApp(message = null) {
    const messageText = message || chatInput.value.trim();
    if (messageText) {
      const encodedMessage = encodeURIComponent(messageText);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, "_blank");
      chatInput.value = "";
      chatBox.classList.add("hidden");
    }
  }

  // Handle quick message buttons
  quickMessageBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const message = this.getAttribute("data-message");
      sendToWhatsApp(message);
    });
  });

  // Send message on button click
  sendMessage.addEventListener("click", () => sendToWhatsApp());

  // Send message on Enter key press
  chatInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendToWhatsApp();
    }
  });

  // Close chat when clicking outside
  document.addEventListener("click", function (e) {
    if (!chatButton.contains(e.target) && !chatBox.contains(e.target)) {
      chatBox.classList.add("hidden");
    }
  });

  // Toggle menu mobile - Single implementation
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", function (e) {
      e.preventDefault();
      navMenu.classList.toggle("active");
    });

    // Close mobile menu when clicking on a nav link
    const navLinks = navMenu.querySelectorAll('a[href^="#"]');
    navLinks.forEach((link) => {
      link.addEventListener("click", function () {
        if (window.innerWidth < 768) {
          navMenu.classList.remove("active");
        }
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener("click", function (e) {
      if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove("active");
      }
    });
  } else {
    console.error("Menu toggle or nav menu element not found!");
  }
});

// Load menu items from database
async function loadMenuItems() {
  try {
    console.log("Loading menu items...");
    const { data, error } = await supabase
      .from("menus")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    console.log("Menu data loaded:", data);
    console.log("Number of menu items:", data ? data.length : 0);

    // Debug: Check each menu item
    if (data && data.length > 0) {
      data.forEach((menu, index) => {
        console.log(`Menu ${index + 1}:`, {
          name: menu.name,
          image_url: menu.image_url,
          price: menu.price,
        });
      });
    }

    const menuGrid = document.getElementById("menu-grid");

    if (!menuGrid) {
      console.error("Menu grid element not found!");
      return;
    }

    menuGrid.innerHTML = "";

    if (data && data.length > 0) {
      data.forEach((menu) => {
        const menuItem = createMenuCard(menu);
        menuGrid.appendChild(menuItem);
      });
    } else {
      // If no data, create some sample menu items so something displays
      console.log("No menu data found, creating sample items...");
      const sampleMenus = [
        {
          name: "Nasi Goreng Spesial",
          description:
            "Nasi goreng dengan ayam, udang, dan telur, disajikan dengan acar.",
          price: 25000,
          image_url:
            "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
        },
        {
          name: "Salad Sayur Segar",
          description:
            "Campuran sayur segar dengan dressing vinaigrette, cocok untuk diet.",
          price: 20000,
          image_url:
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
        },
        {
          name: "Puding Coklat",
          description: "Puding coklat lembut dengan topping buah segar.",
          price: 15000,
          image_url:
            "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop",
        },
        {
          name: "Ayam Bakar Madu",
          description:
            "Ayam bakar dengan bumbu madu, lengkap dengan lalapan dan sambal.",
          price: 30000,
          image_url:
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
        },
      ];

      sampleMenus.forEach((menu) => {
        const menuItem = createMenuCard(menu);
        menuGrid.appendChild(menuItem);
      });
    }
  } catch (error) {
    console.error("Error loading menu items:", error);
    const menuGrid = document.getElementById("menu-grid");
    if (menuGrid) {
      menuGrid.innerHTML = `
        <div class="col-span-full text-center py-8">
          <p class="text-red-600">Gagal memuat menu: ${error.message}</p>
        </div>
      `;
    }
  }
}

// Create menu card element
function createMenuCard(menu) {
  const div = document.createElement("div");
  div.className = "bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2";

  // Debug: Log menu data to see what's happening
  console.log("Creating menu card for:", menu);

  // Ensure we always have a working image URL - NO WHITE PLACEHOLDERS
  const fallbackImages = [
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
  ];
  
  const randomFallback = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  const imageUrl = menu.image_url && menu.image_url.trim() !== '' ? menu.image_url : randomFallback;

  div.innerHTML = `
    <div class="relative group">
      <img
        src="${imageUrl}"
        alt="${menu.name}"
        class="w-full h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
        onclick="openImageModal('${imageUrl.replace(/'/g, '&#39;')}', '${menu.name.replace(/'/g, '&#39;')}')"
        onerror="this.src='${randomFallback}'"
        style="background: #f3f4f6; min-height: 256px;"
        onload="this.style.background = 'transparent'"
      />
      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
        </svg>
      </div>
    </div>
    <div class="p-6">
      <h3 class="text-xl font-bold text-gray-800 mb-3">${menu.name}</h3>
      <p class="text-gray-600 text-sm leading-relaxed mb-4">${menu.description}</p>
      <div class="flex items-center justify-between">
        <p class="text-2xl font-bold text-green-600">Rp ${menu.price.toLocaleString()}</p>
        <span class="text-sm text-gray-500">/ porsi</span>
      </div>
    </div>
  `;

  return div;
}

// Load articles from database
async function loadArticles() {
  try {
    console.log("Loading articles...");
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6); // Limit to 6 articles for display

    if (error) throw error;

    console.log("Articles data loaded:", data);

    // Store articles data globally for modal access
    articlesData = data || [];

    const articlesGrid = document.getElementById("articles-grid");

    if (!articlesGrid) {
      console.error("Articles grid element not found!");
      return;
    }

    articlesGrid.innerHTML = "";

    if (data && data.length > 0) {
      data.forEach((article) => {
        const articleItem = createArticleCard(article);
        articlesGrid.appendChild(articleItem);
      });
    } else {
      articlesGrid.innerHTML = `
        <div class="col-span-full text-center py-8">
          <p class="text-gray-600">Belum ada artikel tersedia.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error("Error loading articles:", error);
    const articlesGrid = document.getElementById("articles-grid");
    if (articlesGrid) {
      articlesGrid.innerHTML = `
        <div class="col-span-full text-center py-8">
          <p class="text-red-600">Gagal memuat artikel: ${error.message}</p>
        </div>
      `;
    }
  }
}

// Create article card element
function createArticleCard(article) {
  const categoryColors = {
    Business: "bg-orange-500",
    Catering: "bg-blue-500",
    Health: "bg-green-500",
  };

  const categoryHoverColors = {
    Business: "hover:text-orange-500",
    Catering: "hover:text-blue-500",
    Health: "hover:text-green-500",
  };

  const readMoreColors = {
    Business: "text-orange-500 hover:text-orange-600",
    Catering: "text-blue-500 hover:text-blue-600",
    Health: "text-green-500 hover:text-green-600",
  };

  const articleElement = document.createElement("article");
  articleElement.className =
    "bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300";

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  articleElement.innerHTML = `
    <div class="relative group">
      <img
        src="${
          article.image_url ||
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=300&fit=crop"
        }"
        alt="${article.title}"
        class="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
        onclick="openImageModal('${(
          article.image_url ||
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=300&fit=crop"
        ).replace(/'/g, "&#39;")}', '${article.title.replace(/'/g, "&#39;")}')"
        onerror="this.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=300&fit=crop'"
      />
      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
        </svg>
      </div>
      <div class="absolute top-4 left-4">
        <span class="${
          categoryColors[article.category] || "bg-gray-500"
        } text-white px-3 py-1 rounded-full text-sm font-medium">
          ${article.category}
        </span>
      </div>
    </div>
    <div class="p-6">
      <div class="flex items-center text-sm text-gray-500 mb-3">
        <span>${article.author}</span>
        <span class="mx-2">•</span>
        <span>${formatDate(article.created_at)}</span>
      </div>
      <h3 class="text-xl font-bold text-gray-800 mb-3 ${
        categoryHoverColors[article.category] || "hover:text-gray-600"
      } transition-colors cursor-pointer" onclick="showArticleContent('${article.title.replace(
    /'/g,
    "&#39;"
  )}', '${article.content.replace(/'/g, "&#39;").replace(/"/g, "&quot;")}', '${
    article.author
  }', '${article.category}', '${formatDate(article.created_at)}', '${(
    article.image_url || ""
  ).replace(/'/g, "&#39;")}')" >
        ${article.title}
      </h3>
      <p class="text-gray-600 leading-relaxed">
        ${
          article.content.length > 150
            ? article.content.substring(0, 150) + "..."
            : article.content
        }
      </p>
      <div class="mt-4">
        <button onclick="showArticleContent('${article.title.replace(
          /'/g,
          "&#39;"
        )}', '${article.content
    .replace(/'/g, "&#39;")
    .replace(/"/g, "&quot;")}', '${article.author}', '${
    article.category
  }', '${formatDate(article.created_at)}', '${(article.image_url || "").replace(
    /'/g,
    "&#39;"
  )}')" class="${
    readMoreColors[article.category] || "text-gray-500 hover:text-gray-600"
  } font-medium transition-colors cursor-pointer bg-transparent border-none p-0">
          Baca Selengkapnya →
        </button>
      </div>
    </div>
  `;

  return articleElement;
}

// Store articles data globally for modal access
let articlesData = [];

// Image Modal Functions - ABSOLUTELY NO WHITE BACKGROUNDS
function openImageModal(imageUrl, title) {
  console.log("Opening image modal for:", title, imageUrl);

  // Remove any existing image modal first
  const existingModal = document.getElementById("image-modal");
  if (existingModal) {
    existingModal.remove();
  }

  // Create PURE BLACK modal - NO WHITE ANYWHERE
  const modal = document.createElement("div");
  modal.id = "image-modal";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "black";
  modal.style.zIndex = "9999";
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";

  // ONLY IMAGE AND CLOSE BUTTON - NO WHITE CONTAINERS
  modal.innerHTML = `
    <button onclick="closeImageModal()" style="position: absolute; top: 20px; right: 20px; background: none; border: none; color: white; font-size: 30px; cursor: pointer; z-index: 10000;">×</button>
    <img 
      src="${imageUrl}" 
      alt="${title}" 
      style="max-width: 90%; max-height: 90%; object-fit: contain; cursor: pointer;"
      onclick="closeImageModal()"
    />
    <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); color: white; font-size: 18px;">${title}</div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = "hidden";

  // Close when clicking on black background
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeImageModal();
    }
  });
}

function closeImageModal() {
  console.log("Closing image modal");
  const modal = document.getElementById("image-modal");
  if (modal) {
    modal.remove();
    document.body.style.overflow = "auto";
  }
}

// Simple function to show article content without white modal
function showArticleContent(title, content, author, category, date, imageUrl) {
  // Create a simple alert or console log for now - no white modals!
  alert(
    `${title}\n\nBy: ${author}\nCategory: ${category}\nDate: ${date}\n\n${content}`
  );

  // If user wants to see the image, call openImageModal
  if (imageUrl && confirm("Do you want to view the article image?")) {
    openImageModal(imageUrl, title);
  }
}

// Replace the white article modal with a clean dark one like image modal
function openArticleModal(articleId) {
  const article = articlesData.find((a) => a.id === articleId);
  if (!article) return;

  // Remove any existing modals
  const existingModal = document.getElementById("article-modal");
  if (existingModal) {
    existingModal.remove();
  }

  // Create DARK modal like image modal - NO WHITE BACKGROUNDS
  const modal = document.createElement("div");
  modal.id = "article-modal";
  modal.className = "fixed inset-0 z-50 flex items-center justify-center";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.95)";
  modal.style.display = "flex";

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // NO WHITE CONTAINERS - Just content on dark background
  modal.innerHTML = `
    <div class="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
      <!-- Close button -->
      <button onclick="closeArticleModal()" class="fixed top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors p-2">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      
      <!-- Article image - clickable to open in image modal -->
      ${
        article.image_url
          ? `
        <div class="text-center mb-6">
          <img
            src="${article.image_url}"
            alt="${article.title}"
            class="max-w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity mx-auto"
            onclick="openImageModal('${article.image_url.replace(
              /'/g,
              "&#39;"
            )}', '${article.title.replace(/'/g, "&#39;")}')"
          />
        </div>
      `
          : ""
      }
      
      <!-- Article content -->
      <div class="text-center mb-4">
        <span class="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          ${article.category}
        </span>
      </div>
      
      <h1 class="text-3xl font-bold text-white mb-4 text-center">${
        article.title
      }</h1>
      
      <div class="text-center text-gray-300 text-sm mb-6">
        <span>By ${article.author}</span>
        <span class="mx-2">•</span>
        <span>${formatDate(article.created_at)}</span>
      </div>
      
      <div class="text-gray-200 leading-relaxed text-lg">
        ${article.content.replace(/\n/g, "<br><br>")}
      </div>
      
      <!-- Close button at bottom -->
      <div class="text-center mt-8">
        <button onclick="closeArticleModal()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          Tutup
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = "hidden";

  // Close when clicking on dark background
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeArticleModal();
    }
  });
}

function closeArticleModal() {
  const modal = document.getElementById("article-modal");
  if (modal) {
    modal.remove();
    document.body.style.overflow = "auto";
  }
}

// Close modal when clicking outside
document.addEventListener("click", function (e) {
  const modal = document.getElementById("article-modal");
  if (modal && e.target === modal) {
    closeArticleModal();
  }
});

// Close modal with Escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeImageModal();
    closeArticleModal();
  }
});
