// Admin Dashboard Script - Tanpa konflik variabel
(function () {
  "use strict";

  // Supabase Setup untuk Admin
  const ADMIN_SUPABASE_URL = "https://nmdmriudkchtmdjkgnye.supabase.co";
  const ADMIN_SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tZG1yaXVka2NodG1kamtnbnllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1ODUwODMsImV4cCI6MjA3NDE2MTA4M30.LnZrN6eYdAdbbWtDo_8vsWDqJ74NOGkBGjagKFdqoXo";

  let adminSupabase = null;

  // Initialize Supabase untuk Admin
  function initAdminSupabase() {
    if (typeof window.supabase !== "undefined") {
      adminSupabase = window.supabase.createClient(
        ADMIN_SUPABASE_URL,
        ADMIN_SUPABASE_KEY,
      );
      console.log("Admin Supabase initialized successfully");
      return true;
    }
    console.error("Supabase library not loaded");
    return false;
  }

  // Check authentication
  function checkAuth() {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    const loginTime = localStorage.getItem("adminLoginTime");
    const currentTime = Date.now();
    const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours

    if (!isLoggedIn || currentTime - parseInt(loginTime) > sessionDuration) {
      localStorage.removeItem("adminLoggedIn");
      localStorage.removeItem("adminLoginTime");
      window.location.href = "adminlogin.html";
      return false;
    }
    return true;
  }

  // Load menus
  async function loadMenus() {
    try {
      console.log("Loading menus...");
      const { data, error } = await adminSupabase
        .from("menus")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const menuList = document.getElementById("menu-list");
      if (!menuList) {
        console.error("Menu list element not found");
        return;
      }

      menuList.innerHTML = "";

      if (data && data.length > 0) {
        data.forEach((menu) => {
          const menuItem = createMenuItem(menu);
          menuList.appendChild(menuItem);
        });
      } else {
        menuList.innerHTML =
          '<p class="text-gray-500 text-center py-4">Belum ada menu yang ditambahkan.</p>';
      }
    } catch (error) {
      console.error("Error loading menus:", error);
      const menuList = document.getElementById("menu-list");
      if (menuList) {
        menuList.innerHTML = `<p class="text-red-500 text-center py-4">Error: ${error.message}</p>`;
      }
    }
  }

  // Create menu item element
  function createMenuItem(menu) {
    const div = document.createElement("div");
    div.className =
      "bg-gray-50 rounded-lg p-4 flex items-center justify-between";

    // Gunakan base64 encoded SVG untuk placeholder yang lebih aman
    const placeholderImage =
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiNlNWU3ZWIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5Y2EzYWYiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";

    // Create image element programmatically untuk menghindari error onerror
    const imgElement = document.createElement("img");
    imgElement.src = menu.image_url || placeholderImage;
    imgElement.alt = menu.name || "";
    imgElement.className = "w-16 h-16 object-cover rounded-lg";
    imgElement.onerror = function () {
      this.src = placeholderImage;
    };

    const contentDiv = document.createElement("div");
    contentDiv.className = "flex items-center space-x-4";
    contentDiv.innerHTML = `
      <div class="img-container"></div>
      <div>
        <h3 class="font-semibold text-gray-800">${menu.name}</h3>
        <p class="text-gray-600 text-sm">${menu.description}</p>
        <p class="text-blue-600 font-medium">Rp ${parseInt(menu.price).toLocaleString()}</p>
      </div>
    `;
    contentDiv.querySelector(".img-container").appendChild(imgElement);

    const buttonsDiv = document.createElement("div");
    buttonsDiv.className = "flex space-x-2";
    buttonsDiv.innerHTML = `
      <button onclick="window.adminFunctions.editMenu(${menu.id})" class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
        Edit
      </button>
      <button onclick="window.adminFunctions.deleteMenu(${menu.id})" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
        Hapus
      </button>
    `;

    div.appendChild(contentDiv);
    div.appendChild(buttonsDiv);
    return div;
  }

  // Delete menu
  async function deleteMenu(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus menu ini?")) return;

    try {
      console.log("Deleting menu id:", id);
      const { error } = await adminSupabase.from("menus").delete().eq("id", id);
      if (error) throw error;

      console.log("Menu deleted successfully");
      alert("Menu berhasil dihapus!");
      await loadMenus();
    } catch (error) {
      console.error("Error deleting menu:", error);
      alert("Gagal menghapus menu: " + error.message);
    }
  }

  // Edit menu
  async function editMenu(id) {
    try {
      const { data, error } = await adminSupabase
        .from("menus")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Fill form with existing data
      document.getElementById("menu-id").value = data.id;
      document.getElementById("menu-name").value = data.name;
      document.getElementById("menu-description").value = data.description;
      document.getElementById("menu-price").value = data.price;

      // Show current image
      if (data.image_url) {
        document
          .getElementById("menu-image-preview")
          .classList.remove("hidden");
        document.getElementById("menu-preview-img").src = data.image_url;
      }

      // Make file input not required for edit
      document.getElementById("menu-image-file").removeAttribute("required");

      document.getElementById("menu-modal-title").textContent = "Edit Menu";
      showModal("menu-modal");
    } catch (error) {
      console.error("Error loading menu for edit:", error);
      alert("Gagal memuat data menu: " + error.message);
    }
  }

  // Save menu
  async function saveMenu(formData) {
    try {
      console.log("Saving menu with data:", formData);

      let imageUrl = formData.image_url;

      // Handle file upload if new file is selected
      const fileInput = document.getElementById("menu-image-file");
      if (fileInput.files && fileInput.files[0]) {
        // For demo, use placeholder image
        imageUrl = `https://picsum.photos/400/300?random=${Date.now()}`;
      }

      let result;
      if (formData.id) {
        // Update existing menu - trigger database akan auto-update updated_at
        const updateData = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
        };

        // Hanya update image_url jika ada perubahan
        if (imageUrl) {
          updateData.image_url = imageUrl;
        }

        console.log("Updating menu with:", updateData);
        result = await adminSupabase
          .from("menus")
          .update(updateData)
          .eq("id", formData.id);
      } else {
        // Insert new menu
        if (!imageUrl) {
          imageUrl = `https://picsum.photos/400/300?random=${Date.now()}`;
        }

        console.log("Inserting new menu");
        result = await adminSupabase.from("menus").insert([
          {
            name: formData.name,
            description: formData.description,
            price: formData.price,
            image_url: imageUrl,
          },
        ]);
      }

      console.log("Save result:", result);

      if (result.error) throw result.error;

      closeModal("menu-modal");
      alert("Menu berhasil disimpan!");

      // Reload langsung untuk memastikan data tampil
      await loadMenus();
    } catch (error) {
      console.error("Error saving menu:", error);
      alert("Gagal menyimpan menu: " + error.message);
    }
  }

  // Modal functions
  function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("hidden");
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("hidden");
    }
  }

  function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
      form.reset();
      const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
      hiddenInputs.forEach((input) => (input.value = ""));

      // Hide image previews
      if (formId === "menu-form") {
        document.getElementById("menu-image-preview").classList.add("hidden");
      } else if (formId === "article-form") {
        document
          .getElementById("article-image-preview")
          .classList.add("hidden");
      }
    }
  }

  // Initialize everything
  document.addEventListener("DOMContentLoaded", async function () {
    console.log("DOM loaded, initializing admin dashboard...");

    // Wait for Supabase library to load
    let retries = 0;
    while (!initAdminSupabase() && retries < 10) {
      console.log("Waiting for Supabase library...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      retries++;
    }

    if (!adminSupabase) {
      alert(
        "Gagal menginisialisasi koneksi database. Silakan refresh halaman.",
      );
      return;
    }

    // Check authentication
    if (!checkAuth()) {
      return;
    }

    console.log("Setting up admin dashboard...");

    // Tab switching
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    console.log("Found tab buttons:", tabBtns.length);

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Tab clicked:", btn.getAttribute("data-tab"));
        const tabName = btn.getAttribute("data-tab");

        // Update active tab
        tabBtns.forEach((b) => {
          b.classList.remove("active", "border-blue-500", "text-blue-600");
          b.classList.add("border-transparent", "text-gray-500");
        });
        btn.classList.add("active", "border-blue-500", "text-blue-600");
        btn.classList.remove("border-transparent", "text-gray-500");

        // Show/hide content
        tabContents.forEach((content) => {
          content.classList.add("hidden");
        });
        const targetTab = document.getElementById(`${tabName}-tab`);
        if (targetTab) {
          targetTab.classList.remove("hidden");
        }

        // Load data for active tab
        if (tabName === "menu") {
          loadMenus();
        } else if (tabName === "articles") {
          loadArticles();
        } else if (tabName === "testimonials") {
          loadTestimonials();
        }
      });
    });

    // Logout button
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Logout clicked");
        if (confirm("Apakah Anda yakin ingin logout?")) {
          localStorage.removeItem("adminLoggedIn");
          localStorage.removeItem("adminLoginTime");
          window.location.href = "adminlogin.html";
        }
      });
    }

    // Add menu button
    const addMenuBtn = document.getElementById("add-menu-btn");
    if (addMenuBtn) {
      addMenuBtn.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Add menu clicked");
        clearForm("menu-form");
        document.getElementById("menu-modal-title").textContent = "Tambah Menu";
        document.getElementById("menu-image-preview").classList.add("hidden");
        document.getElementById("menu-image-file").setAttribute("required", "");
        showModal("menu-modal");
      });
    }

    // Add article button
    const addArticleBtn = document.getElementById("add-article-btn");
    if (addArticleBtn) {
      addArticleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Add article clicked");
        clearForm("article-form");
        document.getElementById("article-modal-title").textContent =
          "Tambah Artikel";
        document
          .getElementById("article-image-preview")
          .classList.add("hidden");
        document
          .getElementById("article-image-file")
          .setAttribute("required", "");
        showModal("article-modal");
      });
    }

    // Cancel buttons
    const cancelMenuBtn = document.getElementById("cancel-menu");
    if (cancelMenuBtn) {
      cancelMenuBtn.addEventListener("click", (e) => {
        e.preventDefault();
        closeModal("menu-modal");
      });
    }

    const cancelArticleBtn = document.getElementById("cancel-article");
    if (cancelArticleBtn) {
      cancelArticleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        closeModal("article-modal");
      });
    }

    // Form submissions
    const menuForm = document.getElementById("menu-form");
    if (menuForm) {
      menuForm.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("Menu form submitted");
        const existingImgPreview = document.getElementById("menu-preview-img");
        const existingImgUrl =
          existingImgPreview &&
          !document
            .getElementById("menu-image-preview")
            .classList.contains("hidden")
            ? existingImgPreview.src
            : null;
        const formData = {
          id: document.getElementById("menu-id").value || null,
          name: document.getElementById("menu-name").value,
          description: document.getElementById("menu-description").value,
          price: parseInt(document.getElementById("menu-price").value),
          image_url: existingImgUrl,
        };
        saveMenu(formData);
      });
    }

    const articleForm = document.getElementById("article-form");
    if (articleForm) {
      articleForm.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("Article form submitted");
        const existingImgPreview = document.getElementById(
          "article-preview-img",
        );
        const existingImgUrl =
          existingImgPreview &&
          !document
            .getElementById("article-image-preview")
            .classList.contains("hidden")
            ? existingImgPreview.src
            : null;
        const formData = {
          id: document.getElementById("article-id").value || null,
          title: document.getElementById("article-title").value,
          author: document.getElementById("article-author").value,
          category: document.getElementById("article-category").value,
          content: document.getElementById("article-content").value,
          image_url: existingImgUrl,
        };
        saveArticle(formData);
      });
    }

    // Load initial data
    console.log("Loading initial menu data...");
    loadMenus();

    // Setup realtime dengan polling untuk admin
    setupAdminRealtimeSubscriptions();

    console.log("Admin dashboard initialized successfully!");
  });

  // Load articles
  async function loadArticles() {
    try {
      console.log("Loading articles...");
      const { data, error } = await adminSupabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const articlesList = document.getElementById("articles-list");
      if (!articlesList) {
        console.error("Articles list element not found");
        return;
      }

      articlesList.innerHTML = "";

      if (data && data.length > 0) {
        data.forEach((article) => {
          const articleItem = createArticleItem(article);
          articlesList.appendChild(articleItem);
        });
      } else {
        articlesList.innerHTML =
          '<p class="text-gray-500 text-center py-4">Belum ada artikel yang ditambahkan.</p>';
      }
    } catch (error) {
      console.error("Error loading articles:", error);
      const articlesList = document.getElementById("articles-list");
      if (articlesList) {
        articlesList.innerHTML = `<p class="text-red-500 text-center py-4">Error: ${error.message}</p>`;
      }
    }
  }

  // Create article item element
  function createArticleItem(article) {
    const div = document.createElement("div");
    div.className =
      "bg-gray-50 rounded-lg p-4 flex items-center justify-between";

    // Gunakan base64 encoded SVG untuk placeholder
    const placeholderImage =
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiNlNWU3ZWIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5Y2EzYWYiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";

    // Create image element programmatically untuk menghindari error onerror
    const imgElement = document.createElement("img");
    imgElement.src = article.image_url || placeholderImage;
    imgElement.alt = article.title || "";
    imgElement.className = "w-16 h-16 object-cover rounded-lg";
    imgElement.onerror = function () {
      this.src = placeholderImage;
    };

    const contentDiv = document.createElement("div");
    contentDiv.className = "flex items-center space-x-4";
    contentDiv.innerHTML = `
      <div class="img-container"></div>
      <div>
        <h3 class="font-semibold text-gray-800">${article.title}</h3>
        <p class="text-gray-600 text-sm">${article.content.substring(0, 100)}...</p>
        <p class="text-blue-600 font-medium">${article.category} • ${article.author}</p>
      </div>
    `;
    contentDiv.querySelector(".img-container").appendChild(imgElement);

    const buttonsDiv = document.createElement("div");
    buttonsDiv.className = "flex space-x-2";
    buttonsDiv.innerHTML = `
      <button onclick="window.adminFunctions.editArticle(${article.id})" class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
        Edit
      </button>
      <button onclick="window.adminFunctions.deleteArticle(${article.id})" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
        Hapus
      </button>
    `;

    div.appendChild(contentDiv);
    div.appendChild(buttonsDiv);
    return div;
  }

  // Delete article
  async function deleteArticle(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus artikel ini?")) return;

    try {
      console.log("Deleting article id:", id);
      const { error } = await adminSupabase
        .from("articles")
        .delete()
        .eq("id", id);
      if (error) throw error;

      console.log("Article deleted successfully");
      alert("Artikel berhasil dihapus!");
      await loadArticles();
    } catch (error) {
      console.error("Error deleting article:", error);
      alert("Gagal menghapus artikel: " + error.message);
    }
  }

  // Edit article
  async function editArticle(id) {
    try {
      const { data, error } = await adminSupabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Fill form with existing data
      document.getElementById("article-id").value = data.id;
      document.getElementById("article-title").value = data.title;
      document.getElementById("article-author").value = data.author;
      document.getElementById("article-category").value = data.category;
      document.getElementById("article-content").value = data.content;

      // Show current image
      if (data.image_url) {
        document
          .getElementById("article-image-preview")
          .classList.remove("hidden");
        document.getElementById("article-preview-img").src = data.image_url;
      }

      // Make file input not required for edit
      document.getElementById("article-image-file").removeAttribute("required");

      document.getElementById("article-modal-title").textContent =
        "Edit Artikel";
      showModal("article-modal");
    } catch (error) {
      console.error("Error loading article for edit:", error);
      alert("Gagal memuat data artikel: " + error.message);
    }
  }

  // Save article
  async function saveArticle(formData) {
    try {
      console.log("Saving article with data:", formData);

      let imageUrl = formData.image_url;

      // Handle file upload if new file is selected
      const fileInput = document.getElementById("article-image-file");
      if (fileInput.files && fileInput.files[0]) {
        // For demo, use placeholder image
        imageUrl = `https://picsum.photos/600/400?random=${Date.now()}`;
      }

      let result;
      if (formData.id) {
        // Update existing article - trigger database akan auto-update updated_at
        const updateData = {
          title: formData.title,
          author: formData.author,
          category: formData.category,
          content: formData.content,
        };

        // Hanya update image_url jika ada perubahan
        if (imageUrl) {
          updateData.image_url = imageUrl;
        }

        console.log("Updating article with:", updateData);
        result = await adminSupabase
          .from("articles")
          .update(updateData)
          .eq("id", formData.id);
      } else {
        // Insert new article
        if (!imageUrl) {
          imageUrl = `https://picsum.photos/600/400?random=${Date.now()}`;
        }

        console.log("Inserting new article");
        result = await adminSupabase.from("articles").insert([
          {
            title: formData.title,
            author: formData.author,
            category: formData.category,
            content: formData.content,
            image_url: imageUrl,
          },
        ]);
      }

      console.log("Save article result:", result);

      if (result.error) throw result.error;

      closeModal("article-modal");
      alert("Artikel berhasil disimpan!");

      // Reload langsung untuk memastikan data tampil
      await loadArticles();
    } catch (error) {
      console.error("Error saving article:", error);
      alert("Gagal menyimpan artikel: " + error.message);
    }
  }

  // Load testimonials
  async function loadTestimonials() {
    try {
      console.log("Loading testimonials...");
      const { data, error } = await adminSupabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const testimonialsList = document.getElementById("testimonials-list");
      if (!testimonialsList) {
        console.error("Testimonials list element not found");
        return;
      }

      testimonialsList.innerHTML = "";

      if (data && data.length > 0) {
        data.forEach((testimonial) => {
          const testimonialItem = createTestimonialItem(testimonial);
          testimonialsList.appendChild(testimonialItem);
        });
      } else {
        testimonialsList.innerHTML =
          '<p class="text-gray-500 text-center py-4">Belum ada testimoni yang ditambahkan.</p>';
      }
    } catch (error) {
      console.error("Error loading testimonials:", error);
      const testimonialsList = document.getElementById("testimonials-list");
      if (testimonialsList) {
        testimonialsList.innerHTML = `<p class="text-red-500 text-center py-4">Error: ${error.message}</p>`;
      }
    }
  }

  // Create testimonial item element
  function createTestimonialItem(testimonial) {
    const div = document.createElement("div");
    div.className =
      "bg-gray-50 rounded-lg p-4 flex items-center justify-between";

    div.innerHTML = `
      <div class="flex items-center space-x-4">
        <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
          ${testimonial.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 class="font-semibold text-gray-800">${testimonial.name}</h3>
          <p class="text-gray-600 text-sm">${testimonial.message.substring(0, 100)}...</p>
          <p class="text-blue-600 font-medium text-xs">${new Date(testimonial.created_at).toLocaleDateString("id-ID")}</p>
        </div>
      </div>
      <div class="flex space-x-2">
        <button onclick="window.adminFunctions.deleteTestimonial(${testimonial.id})" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
          Hapus
        </button>
      </div>
    `;
    return div;
  }

  // Delete testimonial
  async function deleteTestimonial(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus testimoni ini?")) return;

    try {
      console.log("Deleting testimonial id:", id);
      const { error } = await adminSupabase
        .from("testimonials")
        .delete()
        .eq("id", id);
      if (error) throw error;

      console.log("Testimonial deleted successfully");
      alert("Testimoni berhasil dihapus!");
      await loadTestimonials();
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      alert("Gagal menghapus testimoni: " + error.message);
    }
  }

  // Setup realtime dengan Supabase Realtime untuk admin
  function setupAdminRealtimeSubscriptions() {
    if (!adminSupabase) {
      console.error("Admin Supabase client tidak tersedia untuk realtime!");
      return;
    }

    console.log("Setting up admin realtime subscriptions...");

    // Subscribe ke perubahan tabel menus
    const menusChannel = adminSupabase
      .channel("admin-menus-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "menus",
        },
        (payload) => {
          console.log("Admin: Menu change detected!", payload);
          const activeTab = document.querySelector(".tab-btn.active");
          const activeTabName = activeTab
            ? activeTab.getAttribute("data-tab")
            : null;
          if (activeTabName === "menu") {
            loadMenus();
          }
        },
      )
      .subscribe((status) => {
        console.log("Admin menus channel status:", status);
      });

    // Subscribe ke perubahan tabel articles
    const articlesChannel = adminSupabase
      .channel("admin-articles-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "articles",
        },
        (payload) => {
          console.log("Admin: Article change detected!", payload);
          const activeTab = document.querySelector(".tab-btn.active");
          const activeTabName = activeTab
            ? activeTab.getAttribute("data-tab")
            : null;
          if (activeTabName === "articles") {
            loadArticles();
          }
        },
      )
      .subscribe((status) => {
        console.log("Admin articles channel status:", status);
      });

    // Subscribe ke perubahan tabel testimonials
    const testimonialsChannel = adminSupabase
      .channel("admin-testimonials-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "testimonials",
        },
        (payload) => {
          console.log("Admin: Testimonial change detected!", payload);
          const activeTab = document.querySelector(".tab-btn.active");
          const activeTabName = activeTab
            ? activeTab.getAttribute("data-tab")
            : null;
          if (activeTabName === "testimonials") {
            loadTestimonials();
          }
        },
      )
      .subscribe((status) => {
        console.log("Admin testimonials channel status:", status);
      });

    // Store channels untuk cleanup jika diperlukan
    window.adminRealtimeChannels = {
      menus: menusChannel,
      articles: articlesChannel,
      testimonials: testimonialsChannel,
    };

    console.log("Admin realtime subscriptions setup complete!");
  }

  // Expose functions globally untuk onclick handlers
  window.adminFunctions = {
    deleteMenu,
    editMenu,
    loadMenus,
    loadArticles,
    editArticle,
    deleteArticle,
    loadTestimonials,
    deleteTestimonial,
  };
})();
