// Frontend Script - Tanpa konflik variabel
(function () {
  "use strict";

  // Supabase Setup
  const FRONTEND_SUPABASE_URL = "https://nmdmriudkchtmdjkgnye.supabase.co";
  const FRONTEND_SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tZG1yaXVka2NodG1kamtnbnllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1ODUwODMsImV4cCI6MjA3NDE2MTA4M30.LnZrN6eYdAdbbWtDo_8vsWDqJ74NOGkBGjagKFdqoXo";

  let frontendSupabase = null;
  let articlesData = [];
  let articlesOffset = 6;

  // Initialize Supabase untuk Frontend
  function initFrontendSupabase() {
    if (typeof window.supabase !== "undefined") {
      frontendSupabase = window.supabase.createClient(
        FRONTEND_SUPABASE_URL,
        FRONTEND_SUPABASE_KEY,
      );
      console.log("Frontend Supabase initialized successfully");
      return true;
    }
    console.error("Supabase library not loaded");
    return false;
  }

  // Test koneksi Supabase
  async function testSupabaseConnection() {
    try {
      if (!frontendSupabase) {
        console.error("Supabase client tidak tersedia!");
        return false;
      }

      console.log("Testing Supabase connection...");
      const { data, error } = await frontendSupabase
        .from("menus")
        .select("id, name")
        .limit(1);

      if (error) {
        console.error("Supabase connection error:", error);
        return false;
      }

      console.log("Supabase connection successful! Sample data:", data);
      return true;
    } catch (error) {
      console.error("Supabase connection failed:", error);
      return false;
    }
  }
  // Load testimonials
  async function loadTestimonials() {
    try {
      console.log("Loading testimonials...");
      const { data, error } = await frontendSupabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading testimonials:", error);
        return;
      }

      console.log("Testimonials data loaded:", data);
      const inner = document.getElementById("carousel-inner");
      if (!inner) return;

      inner.innerHTML = "";
      if (data && data.length > 0) {
        data.forEach((item) => {
          const div = document.createElement("div");
          div.className = "carousel-item bg-white p-6 rounded-xl shadow-lg";
          div.innerHTML = `
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  ${item.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div class="flex-1">
                <p class="font-bold text-lg text-gray-800 mb-2">${item.name}</p>
                <p class="text-gray-600 leading-relaxed">${item.message}</p>
                <p class="text-sm text-gray-400 mt-2">${new Date(item.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
            </div>
          `;
          inner.appendChild(div);
        });

        // Setup carousel navigation
        setupCarouselNavigation(data.length);
      } else {
        inner.innerHTML =
          '<p class="text-center text-gray-500 py-8">Belum ada testimoni.</p>';
      }
    } catch (error) {
      console.error("Error loading testimonials:", error);
    }
  }

  // Setup carousel navigation
  let currentSlide = 0;
  let totalSlides = 0;
  let slidesPerView = 3;

  function setupCarouselNavigation(itemCount) {
    totalSlides = itemCount;
    const inner = document.getElementById("carousel-inner");
    const prevBtn = document.getElementById("carousel-prev");
    const nextBtn = document.getElementById("carousel-next");

    if (!inner || !prevBtn || !nextBtn) return;

    // Determine slides per view based on screen width
    function updateSlidesPerView() {
      if (window.innerWidth < 768) {
        slidesPerView = 1;
      } else if (window.innerWidth < 1024) {
        slidesPerView = 2;
      } else {
        slidesPerView = 3;
      }
    }

    updateSlidesPerView();
    window.addEventListener("resize", updateSlidesPerView);

    function updateCarousel() {
      const slideWidth = 100 / slidesPerView;
      const translateX = -(currentSlide * slideWidth);
      inner.style.transform = `translateX(${translateX}%)`;
    }

    prevBtn.onclick = () => {
      // Loop ke akhir jika di awal
      if (currentSlide === 0) {
        currentSlide = Math.max(0, totalSlides - slidesPerView);
      } else {
        currentSlide--;
      }
      updateCarousel();
    };

    nextBtn.onclick = () => {
      const maxSlide = Math.max(0, totalSlides - slidesPerView);
      // Loop ke awal jika di akhir
      if (currentSlide >= maxSlide) {
        currentSlide = 0;
      } else {
        currentSlide++;
      }
      updateCarousel();
    };

    // Initial update
    updateCarousel();
  }

  // Load menu items
  async function loadMenuItems() {
    try {
      if (!frontendSupabase) {
        console.error("Supabase client tidak tersedia!");
        return;
      }

      console.log("Loading menu items...");
      const { data, error } = await frontendSupabase
        .from("menus")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log("Menu data loaded:", data);
      const menuGrid = document.getElementById("menu-grid");
      if (!menuGrid) return;

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
    const div = document.createElement("div");
    div.className =
      "bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2";

    const imageElement = document.createElement("img");
    imageElement.src =
      menu.image_url || "https://source.unsplash.com/400x300/?food";
    imageElement.alt = menu.name;
    imageElement.className =
      "w-full h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity image-clickable";
    imageElement.onerror = function () {
      this.src = "https://source.unsplash.com/400x300/?food";
    };

    imageElement.addEventListener("click", function () {
      openImageModal(
        menu.image_url || "https://source.unsplash.com/400x300/?food",
        menu.name,
      );
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

    const imageContainer = div.querySelector(".image-container");
    imageContainer.appendChild(imageElement);
    return div;
  }

  // Load articles
  async function loadArticles() {
    try {
      console.log("Loading articles...");
      const { data, error } = await frontendSupabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;

      console.log("Articles data loaded:", data);
      articlesData = data || [];

      const articlesGrid = document.getElementById("articles-grid");
      if (!articlesGrid) return;

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

      // Reset load more state
      articlesOffset = 6;
      const loadMoreBtn = document.getElementById("load-more-articles");
      if (loadMoreBtn) {
        loadMoreBtn.style.display = "inline-block";
        loadMoreBtn.textContent = "Lihat Artikel Lainnya";
        loadMoreBtn.disabled = false;
        if (!data || data.length < 6) {
          loadMoreBtn.style.display = "none";
        }
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

    const imageElement = document.createElement("img");
    imageElement.src =
      article.image_url || "https://source.unsplash.com/600x300/?article";
    imageElement.alt = article.title;
    imageElement.className =
      "w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity image-clickable";
    imageElement.onerror = function () {
      this.src = `https://source.unsplash.com/600x300/?${article.category.toLowerCase()}`;
    };

    imageElement.addEventListener("click", function () {
      openImageModal(
        article.image_url || "https://source.unsplash.com/600x300/?article",
        article.title,
      );
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
          <span class="${categoryColors[article.category] || "bg-gray-500"} text-white px-3 py-1 rounded-full text-sm font-medium">
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
        <h3 class="text-xl font-bold text-gray-800 mb-3 ${categoryHoverColors[article.category] || "hover:text-gray-600"} transition-colors cursor-pointer">
          ${article.title}
        </h3>
        <p class="text-gray-600 leading-relaxed">
          ${article.content.length > 150 ? article.content.substring(0, 150) + "..." : article.content}
        </p>
        <div class="mt-4">
          <button class="${readMoreColors[article.category] || "text-gray-500 hover:text-gray-600"} font-medium transition-colors cursor-pointer bg-transparent border-none p-0">
            Baca Selengkapnya →
          </button>
        </div>
      </div>
    `;

    const imageContainer = articleElement.querySelector(".image-container");
    imageContainer.appendChild(imageElement);

    const readMoreBtn = articleElement.querySelector("button");
    const titleElement = articleElement.querySelector("h3");

    readMoreBtn.addEventListener("click", () => openArticleModal(article.id));
    titleElement.addEventListener("click", () => openArticleModal(article.id));

    return articleElement;
  }
  // Image Modal Functions
  function openImageModal(imageUrl, title) {
    console.log("Opening image modal for:", title, imageUrl);

    const existingModal = document.getElementById("image-modal");
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement("div");
    modal.id = "image-modal";
    modal.className =
      "fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4";
    modal.style.display = "flex";

    const escapedImageUrl = imageUrl
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
    const escapedTitle = title.replace(/"/g, "&quot;").replace(/'/g, "&#39;");

    modal.innerHTML = `
      <div class="relative max-w-6xl max-h-full flex flex-col items-center">
        <button onclick="window.frontendFunctions.closeImageModal()" class="absolute -top-12 -right-4 text-white bg-black bg-opacity-60 rounded-full p-3 hover:bg-opacity-80 transition-all z-10 shadow-lg">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        
        <div class="mb-4 text-center">
          <h3 class="text-xl font-semibold text-white drop-shadow-lg">${escapedTitle}</h3>
        </div>
        
        <div class="flex justify-center items-center">
          <img 
            src="${escapedImageUrl}" 
            alt="${escapedTitle}" 
            class="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" 
            onerror="this.onerror=null; this.src='https://via.placeholder.com/800x600?text=Image+Not+Found';"
          >
        </div>
        
        <div class="mt-6 text-center">
          <button onclick="window.frontendFunctions.closeImageModal()" class="bg-white text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium shadow-lg">
            Tutup
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.classList.add("modal-open");
    document.body.style.overflow = "hidden";

    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        closeImageModal();
      }
    });

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
    const article = articlesData.find((a) => a.id === articleId);
    if (!article) return;

    const categoryColors = {
      Business: "bg-orange-500",
      Catering: "bg-blue-500",
      Health: "bg-green-500",
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const existingModal = document.getElementById("article-modal");
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement("div");
    modal.id = "article-modal";
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4";
    modal.style.display = "flex";

    const safeImageUrl = (
      article.image_url || "https://source.unsplash.com/800x400/?article"
    )
      .replace(/'/g, "&#39;")
      .replace(/"/g, "&quot;");
    const safeTitle = (article.title || "")
      .replace(/'/g, "&#39;")
      .replace(/"/g, "&quot;");

    modal.innerHTML = `
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        <div class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div class="flex items-center space-x-3">
            <span class="${categoryColors[article.category] || "bg-gray-500"} text-white px-3 py-1 rounded-full text-sm font-medium">
              ${article.category}
            </span>
            <div class="text-sm text-gray-500">
              <span>${article.author}</span>
              <span class="mx-2">•</span>
              <span>${formatDate(article.created_at)}</span>
            </div>
          </div>
          <button onclick="window.frontendFunctions.closeArticleModal()" class="text-gray-500 hover:text-gray-700 text-2xl font-bold">
            ×
          </button>
        </div>
        
        <div class="p-6">
          <div class="relative mb-6 group">
            <img
              src="${article.image_url || "https://source.unsplash.com/800x400/?article"}"
              alt="${article.title}"
              class="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onclick="window.frontendFunctions.openImageModal('${safeImageUrl}', '${safeTitle}')"
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
          <button onclick="window.frontendFunctions.closeArticleModal()" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Tutup
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.classList.add("modal-open");
    document.body.style.overflow = "hidden";

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
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "auto";
    }
  }
  // Setup realtime dengan Supabase Realtime untuk frontend
  function setupRealtimeSubscriptions() {
    if (!frontendSupabase) {
      console.error("Supabase client tidak tersedia untuk realtime!");
      return;
    }

    console.log("Setting up frontend realtime subscriptions...");

    // Subscribe ke perubahan tabel menus
    const menusChannel = frontendSupabase
      .channel("frontend-menus-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "menus",
        },
        (payload) => {
          console.log("Frontend: Menu change detected!", payload);
          loadMenuItems();
        },
      )
      .subscribe((status) => {
        console.log("Frontend menus channel status:", status);
      });

    // Subscribe ke perubahan tabel articles
    const articlesChannel = frontendSupabase
      .channel("frontend-articles-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "articles",
        },
        (payload) => {
          console.log("Frontend: Article change detected!", payload);
          loadArticles();
        },
      )
      .subscribe((status) => {
        console.log("Frontend articles channel status:", status);
      });

    // Subscribe ke perubahan tabel testimonials
    const testimonialsChannel = frontendSupabase
      .channel("frontend-testimonials-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "testimonials",
        },
        (payload) => {
          console.log("Frontend: Testimonial change detected!", payload);
          loadTestimonials();
        },
      )
      .subscribe((status) => {
        console.log("Frontend testimonials channel status:", status);
      });

    // Store channels untuk cleanup jika diperlukan
    window.frontendRealtimeChannels = {
      menus: menusChannel,
      articles: articlesChannel,
      testimonials: testimonialsChannel,
    };

    console.log("Frontend realtime subscriptions setup complete!");
  }

  // Helper functions for testimonial form
  function showTestimonialSuccess() {
    const successMsg = document.getElementById("testimonial-success");
    if (successMsg) {
      successMsg.classList.remove("hidden");
      successMsg.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function showTestimonialError(message) {
    const errorMsg = document.getElementById("testimonial-error");
    if (errorMsg) {
      const errorText = errorMsg.querySelector("p");
      if (errorText) {
        errorText.textContent = message;
      }
      errorMsg.classList.remove("hidden");
      errorMsg.scrollIntoView({ behavior: "smooth", block: "nearest" });

      setTimeout(() => {
        errorMsg.classList.add("hidden");
      }, 5000);
    }
  }
  // DOM Content Loaded Event
  document.addEventListener("DOMContentLoaded", async function () {
    console.log("DOM loaded, initializing frontend...");

    // Wait for Supabase library to load
    let retries = 0;
    while (!initFrontendSupabase() && retries < 10) {
      console.log("Waiting for Supabase library...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      retries++;
    }

    if (!frontendSupabase) {
      console.error("Gagal menginisialisasi koneksi database!");
      const menuGrid = document.getElementById("menu-grid");
      if (menuGrid) {
        menuGrid.innerHTML = `
          <div class="col-span-full text-center py-8">
            <p class="text-red-600">Gagal terhubung ke database. Silakan refresh halaman.</p>
          </div>
        `;
      }
      return;
    }

    // Test connection
    const isConnected = await testSupabaseConnection();
    if (isConnected) {
      console.log("Memuat data dari Supabase...");
      loadTestimonials();
      loadMenuItems();
      loadArticles();
      setupRealtimeSubscriptions();
    } else {
      console.error("Gagal terhubung ke Supabase!");
    }

    // Testimonial form handler
    const testiForm = document.getElementById("testi-form");
    if (testiForm) {
      testiForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const message = document.getElementById("message").value.trim();
        const submitBtn = document.getElementById("submit-testimonial-btn");
        const successMsg = document.getElementById("testimonial-success");
        const errorMsg = document.getElementById("testimonial-error");

        if (successMsg) successMsg.classList.add("hidden");
        if (errorMsg) errorMsg.classList.add("hidden");

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

        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Mengirim...";
        submitBtn.disabled = true;
        submitBtn.classList.add("opacity-75", "cursor-not-allowed");

        try {
          console.log("Sending:", { name, message });
          const { error } = await frontendSupabase
            .from("testimonials")
            .insert({ name, message });

          if (!error) {
            console.log("Success, reloading testimonials...");
            showTestimonialSuccess();
            testiForm.reset();
            loadTestimonials();

            setTimeout(() => {
              if (successMsg) successMsg.classList.add("hidden");
            }, 5000);
          } else {
            throw error;
          }
        } catch (error) {
          console.error("Error inserting testimony:", error);
          showTestimonialError("Gagal mengirim testimoni. Silakan coba lagi.");
        } finally {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          submitBtn.classList.remove("opacity-75", "cursor-not-allowed");
        }
      });
    }
    // Load More Articles button
    const loadMoreBtn = document.getElementById("load-more-articles");

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", async function () {
        try {
          const { data, error } = await frontendSupabase
            .from("articles")
            .select("*")
            .order("created_at", { ascending: false })
            .range(articlesOffset, articlesOffset + 5);

          if (error) throw error;

          if (data && data.length > 0) {
            articlesData = [...articlesData, ...data];

            const articlesGrid = document.getElementById("articles-grid");
            data.forEach((article) => {
              const articleItem = createArticleCard(article);
              articlesGrid.appendChild(articleItem);
            });

            articlesOffset += data.length;

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

    // Live Chat Widget
    const chatButton = document.getElementById("chat-button");
    const chatBox = document.getElementById("chat-box");
    const closeChat = document.getElementById("close-chat");
    const chatInput = document.getElementById("chat-input");
    const sendMessage = document.getElementById("send-message");
    const quickMessageBtns = document.querySelectorAll(".quick-message-btn");
    const whatsappNumber = "6281259384244";

    if (chatButton && chatBox) {
      chatButton.addEventListener("click", function () {
        chatBox.classList.toggle("hidden");
        if (!chatBox.classList.contains("hidden") && chatInput) {
          chatInput.focus();
        }
      });
    }

    if (closeChat && chatBox) {
      closeChat.addEventListener("click", function () {
        chatBox.classList.add("hidden");
      });
    }

    function sendToWhatsApp(message = null) {
      const messageText = message || (chatInput ? chatInput.value.trim() : "");
      if (messageText) {
        const encodedMessage = encodeURIComponent(messageText);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, "_blank");
        if (chatInput) chatInput.value = "";
        if (chatBox) chatBox.classList.add("hidden");
      }
    }

    quickMessageBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const message = this.getAttribute("data-message");
        sendToWhatsApp(message);
      });
    });

    if (sendMessage) {
      sendMessage.addEventListener("click", () => sendToWhatsApp());
    }

    if (chatInput) {
      chatInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          sendToWhatsApp();
        }
      });
    }

    // Mobile menu toggle
    const menuToggle = document.getElementById("menu-toggle");
    const navMenu = document.getElementById("nav-menu");

    if (menuToggle && navMenu) {
      menuToggle.addEventListener("click", function (e) {
        e.preventDefault();
        navMenu.classList.toggle("active");
      });

      const navLinks = navMenu.querySelectorAll('a[href^="#"]');
      navLinks.forEach((link) => {
        link.addEventListener("click", function () {
          if (window.innerWidth < 768) {
            navMenu.classList.remove("active");
          }
        });
      });

      document.addEventListener("click", function (e) {
        if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
          navMenu.classList.remove("active");
        }
      });
    }

    console.log("Frontend initialized successfully!");
  });

  // Close modals with Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeImageModal();
      closeArticleModal();
    }
  });

  // Expose functions globally
  window.frontendFunctions = {
    loadMenuItems,
    loadArticles,
    loadTestimonials,
    testSupabaseConnection,
    openImageModal,
    closeImageModal,
    openArticleModal,
    closeArticleModal,
  };
})();
