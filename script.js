// Supabase Setup
const supabaseUrl = "https://nmdmriudkchtmdjkgnye.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tZG1yaXVka2NodG1kamtnbnllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU4NTA4MywiZXhwIjoyMDc0MTYxMDgzfQ.TkWuMWxeyyKzhW-hLD6N7FMBrrhHjCUQ-t6eTGAQoPE";
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
      menuGrid.innerHTML = `
        <div class="col-span-full text-center py-8">
          <p class="text-gray-600">Belum ada menu tersedia.</p>
        </div>
      `;
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
  const div = document.createElement('div');
  div.className = 'bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2';
  
  // Create the image element with onclick handler
  const imageElement = document.createElement('img');
  imageElement.src = menu.image_url || 'https://source.unsplash.com/400x300/?food';
  imageElement.alt = menu.name;
  imageElement.className = 'w-full h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity image-clickable';
  imageElement.onerror = function() { this.src = 'https://source.unsplash.com/400x300/?food'; };
  
  // Add click event listener
  imageElement.addEventListener('click', function() {
    openImageModal(menu.image_url || 'https://source.unsplash.com/400x300/?food', menu.name);
  });
  
  div.innerHTML = `
    <div class="relative group">
      <div class="image-container"></div>
      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <svg class="w-8 h-8 text-white zoom-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  
  // Insert the image into the container
  const imageContainer = div.querySelector('.image-container');
  imageContainer.appendChild(imageElement);
  
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
    'Business': 'bg-orange-500',
    'Catering': 'bg-blue-500',
    'Health': 'bg-green-500'
  };

  const categoryHoverColors = {
    'Business': 'hover:text-orange-500',
    'Catering': 'hover:text-blue-500',
    'Health': 'hover:text-green-500'
  };

  const readMoreColors = {
    'Business': 'text-orange-500 hover:text-orange-600',
    'Catering': 'text-blue-500 hover:text-blue-600',
    'Health': 'text-green-500 hover:text-green-600'
  };

  const articleElement = document.createElement('article');
  articleElement.className = 'bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300';
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Create the image element with click handler
  const imageElement = document.createElement('img');
  imageElement.src = article.image_url || 'https://source.unsplash.com/600x300/?article';
  imageElement.alt = article.title;
  imageElement.className = 'w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity image-clickable';
  imageElement.onerror = function() { this.src = `https://source.unsplash.com/600x300/?${article.category.toLowerCase()}`; };
  
  // Add click event listener
  imageElement.addEventListener('click', function() {
    openImageModal(article.image_url || 'https://source.unsplash.com/600x300/?article', article.title);
  });

  articleElement.innerHTML = `
    <div class="relative group">
      <div class="image-container"></div>
      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <svg class="w-8 h-8 text-white zoom-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
        </svg>
      </div>
      <div class="absolute top-4 left-4">
        <span class="${categoryColors[article.category] || 'bg-gray-500'} text-white px-3 py-1 rounded-full text-sm font-medium">
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
      <h3 class="text-xl font-bold text-gray-800 mb-3 ${categoryHoverColors[article.category] || 'hover:text-gray-600'} transition-colors cursor-pointer">
        ${article.title}
      </h3>
      <p class="text-gray-600 leading-relaxed">
        ${article.content.length > 150 ? article.content.substring(0, 150) + '...' : article.content}
      </p>
      <div class="mt-4">
        <button class="${readMoreColors[article.category] || 'text-gray-500 hover:text-gray-600'} font-medium transition-colors cursor-pointer bg-transparent border-none p-0">
          Baca Selengkapnya →
        </button>
      </div>
    </div>
  `;
  
  // Insert the image into the container
  const imageContainer = articleElement.querySelector('.image-container');
  imageContainer.appendChild(imageElement);
  
  // Add click handler for "Baca Selengkapnya" and title
  const readMoreBtn = articleElement.querySelector('button');
  const titleElement = articleElement.querySelector('h3');
  
  readMoreBtn.addEventListener('click', () => openArticleModal(article.id));
  titleElement.addEventListener('click', () => openArticleModal(article.id));
  
  return articleElement;
}

// Store articles data globally for modal access
let articlesData = [];

// Image Modal Functions - Define at the top level for global access
function openImageModal(imageUrl, title) {
  console.log("Opening image modal for:", title, imageUrl);

  // Remove any existing image modal first
  const existingModal = document.getElementById("image-modal");
  if (existingModal) {
    existingModal.remove();
  }

  // Create new modal with dark overlay like your reference
  const modal = document.createElement("div");
  modal.id = "image-modal";
  modal.className = "fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4";
  modal.style.display = "flex";

  // Ensure proper escaping for HTML attributes
  const escapedImageUrl = imageUrl.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const escapedTitle = title.replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  modal.innerHTML = `
    <div class="relative max-w-6xl max-h-full flex flex-col items-center">
      <!-- Close button in top right -->
      <button onclick="closeImageModal()" class="absolute -top-12 -right-4 text-white bg-black bg-opacity-60 rounded-full p-3 hover:bg-opacity-80 transition-all z-10 shadow-lg">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      
      <!-- Title above image -->
      <div class="mb-4 text-center">
        <h3 class="text-xl font-semibold text-white drop-shadow-lg">${escapedTitle}</h3>
      </div>
      
      <!-- Main image - enlarged and centered -->
      <div class="flex justify-center items-center">
        <img 
          src="${escapedImageUrl}" 
          alt="${escapedTitle}" 
          class="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" 
          onerror="this.onerror=null; this.src='https://via.placeholder.com/800x600?text=Image+Not+Found';"
        >
      </div>
      
      <!-- Close button below image -->
      <div class="mt-6 text-center">
        <button onclick="closeImageModal()" class="bg-white text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium shadow-lg">
          Tutup
        </button>
      </div>
    </div>
  `;

  // Add to document
  document.body.appendChild(modal);
  document.body.classList.add("modal-open");
  document.body.style.overflow = "hidden";

  // Add click outside to close
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeImageModal();
    }
  });

  // Add fade-in animation
  modal.style.opacity = "0";
  setTimeout(() => {
    modal.style.transition = "opacity 0.3s ease";
    modal.style.opacity = "1";
  }, 10);
}

function closeImageModal() {
  console.log("Closing image modal");
  const modal = document.getElementById("image-modal");
  if (modal) {
    // Add fade-out animation
    modal.style.transition = "opacity 0.3s ease";
    modal.style.opacity = "0";
    setTimeout(() => {
      modal.remove();
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "auto";
    }, 300);
  }
}

// Article Modal Functions
function openArticleModal(articleId) {
  const article = articlesData.find(a => a.id === articleId);
  if (!article) return;

  const categoryColors = {
    'Business': 'bg-orange-500',
    'Catering': 'bg-blue-500', 
    'Health': 'bg-green-500'
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Remove any existing article modal first
  const existingModal = document.getElementById('article-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // Create new modal
  const modal = document.createElement('div');
  modal.id = 'article-modal';
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
  modal.style.display = 'flex';

  // Properly escape strings for safe HTML usage
  const safeImageUrl = (article.image_url || 'https://source.unsplash.com/800x400/?article').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
  const safeTitle = (article.title || '').replace(/'/g, '&#39;').replace(/"/g, '&quot;');

  modal.innerHTML = `
    <div class="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
      <div class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <span class="${categoryColors[article.category] || 'bg-gray-500'} text-white px-3 py-1 rounded-full text-sm font-medium">
            ${article.category}
          </span>
          <div class="text-sm text-gray-500">
            <span>${article.author}</span>
            <span class="mx-2">•</span>
            <span>${formatDate(article.created_at)}</span>
          </div>
        </div>
        <button onclick="closeArticleModal()" class="text-gray-500 hover:text-gray-700 text-2xl font-bold">
          ×
        </button>
      </div>
      
      <div class="p-6">
        <div class="relative mb-6 group">
          <img
            src="${article.image_url || 'https://source.unsplash.com/800x400/?article'}"
            alt="${article.title}"
            class="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onclick="openImageModal('${safeImageUrl}', '${safeTitle}')"
            onerror="this.src='https://source.unsplash.com/800x400/?${article.category.toLowerCase()}'"
          />
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-lg">
            <svg class="w-12 h-12 text-white zoom-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
            </svg>
          </div>
        </div>
        
        <h1 class="text-3xl font-bold text-gray-800 mb-4">${article.title}</h1>
        
        <div class="prose max-w-none text-gray-600 leading-relaxed">
          ${article.content.replace(/\n/g, '</p><p class="mb-4">')}
        </div>
      </div>
      
      <div class="px-6 py-4 bg-gray-50 border-t">
        <button onclick="closeArticleModal()" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Tutup
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
  
  // Add click outside to close
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeArticleModal();
    }
  });
}

function closeArticleModal() {
  const modal = document.getElementById('article-modal');
  if (modal) {
    modal.remove();
    document.body.classList.remove('modal-open');
    document.body.style.overflow = 'auto';
  }
}

// Make functions globally available
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;
window.openArticleModal = openArticleModal;
window.closeArticleModal = closeArticleModal;

// Close modal when clicking outside
document.addEventListener("click", function (e) {
  const modal = document.getElementById("article-modal");
  if (modal && e.target === modal) {
    closeArticleModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeImageModal();
    closeArticleModal();
  }
});

