// Supabase Setup
const supabaseUrl = "https://nmdmriudkchtmdjkgnye.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tZG1yaXVka2NodG1kamtnbnllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU4NTA4MywiZXhwIjoyMDc0MTYxMDgzfQ.TkWuMWxeyyKzhW-hLD6N7FMBrrhHjCUQ-t6eTGAQoPE";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

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

// File upload function
async function uploadFile(file, folder = "images") {
  try {
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      throw new Error("File terlalu besar. Maksimal 2MB.");
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("File harus berupa gambar.");
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from("images")
      .upload(filePath, file);

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(filePath);

    return {
      fileName: fileName,
      url: publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

// Preview image function
function previewImage(input, previewId, imgId) {
  const file = input.files[0];
  if (file) {
    // Validate file
    if (file.size > 2 * 1024 * 1024) {
      alert("File terlalu besar. Maksimal 2MB.");
      input.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar.");
      input.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById(previewId).classList.remove("hidden");
      document.getElementById(imgId).src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  if (!checkAuth()) return;

  // Tab switching
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
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
      document.getElementById(`${tabName}-tab`).classList.remove("hidden");

      // Load data for active tab
      if (tabName === "menu") loadMenus();
      else if (tabName === "articles") loadArticles();
      else if (tabName === "testimonials") loadTestimonials();
    });
  });

  // Logout
  document.getElementById("logout-btn").addEventListener("click", () => {
    if (confirm("Apakah Anda yakin ingin logout?")) {
      localStorage.removeItem("adminLoggedIn");
      localStorage.removeItem("adminLoginTime");
      window.location.href = "adminlogin.html";
    }
  });

  // Image preview handlers
  document
    .getElementById("menu-image-file")
    .addEventListener("change", function () {
      previewImage(this, "menu-image-preview", "menu-preview-img");
    });

  document
    .getElementById("article-image-file")
    .addEventListener("change", function () {
      previewImage(this, "article-image-preview", "article-preview-img");
    });

  // Modal handlers
  setupModalHandlers();

  // Load initial data
  loadMenus();
});

// Menu Management
async function loadMenus() {
  try {
    const { data, error } = await supabase
      .from("menus")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const menuList = document.getElementById("menu-list");
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
    alert("Gagal memuat data menu");
  }
}

function createMenuItem(menu) {
  const div = document.createElement("div");
  div.className = "bg-gray-50 rounded-lg p-4 flex items-center justify-between";

  // Clean up the image URL and title for safe usage in HTML
  const safeImageUrl = menu.image_url
    ? menu.image_url.replace(/'/g, "&#39;")
    : "";
  const safeName = menu.name ? menu.name.replace(/'/g, "&#39;") : "";

  div.innerHTML = `
        <div class="flex items-center space-x-4">
            <img src="${safeImageUrl}" alt="${safeName}" 
                 class="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200 border-2 border-transparent hover:border-blue-300" 
                 onclick="openImageModal('${safeImageUrl}', '${safeName}')"
                 onerror="this.onerror=null; this.src='https://via.placeholder.com/64x64?text=No+Image';">
            <div>
                <h3 class="font-semibold text-gray-800">${menu.name}</h3>
                <p class="text-gray-600 text-sm">${menu.description}</p>
                <p class="text-blue-600 font-medium">Rp ${menu.price.toLocaleString()} / porsi</p>
            </div>
        </div>
        <div class="flex space-x-2">
            <button onclick="editMenu(${
              menu.id
            })" class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600" title="Edit menu" aria-label="Edit menu ${
    menu.name
  }">
                Edit
            </button>
            <button onclick="deleteMenu(${
              menu.id
            })" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600" title="Hapus menu" aria-label="Hapus menu ${
    menu.name
  }">
                Hapus
            </button>
        </div>
    `;
  return div;
}

async function saveMenu(menuData) {
  try {
    let imageUrl = menuData.image_url;
    let fileName = menuData.image_file_name;

    // Handle file upload if new file is selected
    const fileInput = document.getElementById("menu-image-file");
    if (fileInput.files && fileInput.files[0]) {
      const uploadResult = await uploadFile(fileInput.files[0], "menus");
      imageUrl = uploadResult.url;
      fileName = uploadResult.fileName;
    }

    let result;
    if (menuData.id) {
      // Update existing menu
      result = await supabase
        .from("menus")
        .update({
          name: menuData.name,
          description: menuData.description,
          price: menuData.price,
          image_url: imageUrl,
          image_file_name: fileName,
        })
        .eq("id", menuData.id);
    } else {
      // Insert new menu
      if (!imageUrl) {
        alert("Gambar harus diupload!");
        return;
      }
      result = await supabase.from("menus").insert([
        {
          name: menuData.name,
          description: menuData.description,
          price: menuData.price,
          image_url: imageUrl,
          image_file_name: fileName,
        },
      ]);
    }

    if (result.error) throw result.error;

    closeModal("menu-modal");
    loadMenus();
    alert("Menu berhasil disimpan!");
  } catch (error) {
    console.error("Error saving menu:", error);
    alert("Gagal menyimpan menu: " + error.message);
  }
}

async function deleteMenu(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus menu ini?")) return;

  try {
    // Get menu data to delete associated image
    const { data: menu } = await supabase
      .from("menus")
      .select("image_file_name")
      .eq("id", id)
      .single();

    // Delete menu from database
    const { error } = await supabase.from("menus").delete().eq("id", id);

    if (error) throw error;

    // Delete associated image file if exists
    if (menu && menu.image_file_name) {
      await supabase.storage
        .from("images")
        .remove([`menus/${menu.image_file_name}`]);
    }

    loadMenus();
    alert("Menu berhasil dihapus!");
  } catch (error) {
    console.error("Error deleting menu:", error);
    alert("Gagal menghapus menu");
  }
}

async function editMenu(id) {
  try {
    const { data, error } = await supabase
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
      document.getElementById("menu-image-preview").classList.remove("hidden");
      document.getElementById("menu-preview-img").src = data.image_url;
    }

    // Make file input not required for edit
    document.getElementById("menu-image-file").removeAttribute("required");

    document.getElementById("menu-modal-title").textContent = "Edit Menu";
    showModal("menu-modal");
  } catch (error) {
    console.error("Error loading menu for edit:", error);
    alert("Gagal memuat data menu");
  }
}

// Articles Management
async function loadArticles() {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const articlesList = document.getElementById("articles-list");
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
    alert("Gagal memuat data artikel");
  }
}

function createArticleItem(article) {
  const div = document.createElement("div");
  div.className = "bg-gray-50 rounded-lg p-4 flex items-center justify-between";

  // Clean up the image URL and title for safe usage in HTML
  const safeImageUrl = article.image_url
    ? article.image_url.replace(/'/g, "&#39;")
    : "";
  const safeTitle = article.title ? article.title.replace(/'/g, "&#39;") : "";

  div.innerHTML = `
        <div class="flex items-center space-x-4">
            <img src="${safeImageUrl}" alt="${safeTitle}" 
                 class="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200 border-2 border-transparent hover:border-blue-300" 
                 onclick="openImageModal('${safeImageUrl}', '${safeTitle}')"
                 onerror="this.onerror=null; this.src='https://via.placeholder.com/64x64?text=No+Image';">
            <div>
                <h3 class="font-semibold text-gray-800">${article.title}</h3>
                <p class="text-gray-600 text-sm">By ${article.author} • ${
    article.category
  }</p>
                <p class="text-gray-500 text-sm">${article.content.substring(
                  0,
                  100
                )}...</p>
            </div>
        </div>
        <div class="flex space-x-2">
            <button onclick="editArticle(${
              article.id
            })" class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600" title="Edit artikel" aria-label="Edit artikel ${
    article.title
  }">
                Edit
            </button>
            <button onclick="deleteArticle(${
              article.id
            })" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600" title="Hapus artikel" aria-label="Hapus artikel ${
    article.title
  }">
                Hapus
            </button>
        </div>
    `;
  return div;
}

async function saveArticle(articleData) {
  try {
    let imageUrl = articleData.image_url;
    let fileName = articleData.image_file_name;

    // Handle file upload if new file is selected
    const fileInput = document.getElementById("article-image-file");
    if (fileInput.files && fileInput.files[0]) {
      const uploadResult = await uploadFile(fileInput.files[0], "articles");
      imageUrl = uploadResult.url;
      fileName = uploadResult.fileName;
    }

    let result;
    if (articleData.id) {
      // Update existing article
      result = await supabase
        .from("articles")
        .update({
          title: articleData.title,
          author: articleData.author,
          category: articleData.category,
          content: articleData.content,
          image_url: imageUrl,
          image_file_name: fileName,
        })
        .eq("id", articleData.id);
    } else {
      // Insert new article
      if (!imageUrl) {
        alert("Gambar harus diupload!");
        return;
      }
      result = await supabase.from("articles").insert([
        {
          title: articleData.title,
          author: articleData.author,
          category: articleData.category,
          content: articleData.content,
          image_url: imageUrl,
          image_file_name: fileName,
        },
      ]);
    }

    if (result.error) throw result.error;

    closeModal("article-modal");
    loadArticles();
    alert("Artikel berhasil disimpan!");
  } catch (error) {
    console.error("Error saving article:", error);
    alert("Gagal menyimpan artikel: " + error.message);
  }
}

async function deleteArticle(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus artikel ini?")) return;

  try {
    // Get article data to delete associated image
    const { data: article } = await supabase
      .from("articles")
      .select("image_file_name")
      .eq("id", id)
      .single();

    // Delete article from database
    const { error } = await supabase.from("articles").delete().eq("id", id);

    if (error) throw error;

    // Delete associated image file if exists
    if (article && article.image_file_name) {
      await supabase.storage
        .from("images")
        .remove([`articles/${article.image_file_name}`]);
    }

    loadArticles();
    alert("Artikel berhasil dihapus!");
  } catch (error) {
    console.error("Error deleting article:", error);
    alert("Gagal menghapus artikel");
  }
}

async function editArticle(id) {
  try {
    const { data, error } = await supabase
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

    document.getElementById("article-modal-title").textContent = "Edit Artikel";
    showModal("article-modal");
  } catch (error) {
    console.error("Error loading article for edit:", error);
    alert("Gagal memuat data artikel");
  }
}

// Testimonials Management
async function loadTestimonials() {
  try {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const testimonialsList = document.getElementById("testimonials-list");
    testimonialsList.innerHTML = "";

    if (data && data.length > 0) {
      data.forEach((testimonial) => {
        const testimonialItem = createTestimonialItem(testimonial);
        testimonialsList.appendChild(testimonialItem);
      });
    } else {
      testimonialsList.innerHTML =
        '<p class="text-gray-500 text-center py-4">Belum ada testimoni.</p>';
    }
  } catch (error) {
    console.error("Error loading testimonials:", error);
    alert("Gagal memuat data testimoni");
  }
}

function createTestimonialItem(testimonial) {
  const div = document.createElement("div");
  div.className = "bg-gray-50 rounded-lg p-4 flex items-center justify-between";
  div.innerHTML = `
        <div>
            <h3 class="font-semibold text-gray-800">${testimonial.name}</h3>
            <p class="text-gray-600">${testimonial.message}</p>
            <p class="text-gray-400 text-sm">${new Date(
              testimonial.created_at
            ).toLocaleDateString("id-ID")}</p>
        </div>
        <div>
            <button onclick="deleteTestimonial(${
              testimonial.id
            })" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600" title="Hapus testimoni" aria-label="Hapus testimoni dari ${
    testimonial.name
  }">
                Hapus
            </button>
        </div>
    `;
  return div;
}

async function deleteTestimonial(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus testimoni ini?")) return;

  try {
    const { error } = await supabase.from("testimonials").delete().eq("id", id);

    if (error) throw error;

    loadTestimonials();
    alert("Testimoni berhasil dihapus!");
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    alert("Gagal menghapus testimoni");
  }
}

// Modal Management
function setupModalHandlers() {
  // Menu modal
  document.getElementById("add-menu-btn").addEventListener("click", () => {
    clearForm("menu-form");
    document.getElementById("menu-modal-title").textContent = "Tambah Menu";
    document.getElementById("menu-image-preview").classList.add("hidden");
    document.getElementById("menu-image-file").setAttribute("required", "");
    showModal("menu-modal");
  });

  document.getElementById("cancel-menu").addEventListener("click", () => {
    closeModal("menu-modal");
  });

  document.getElementById("menu-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = {
      id: document.getElementById("menu-id").value || null,
      name: document.getElementById("menu-name").value,
      description: document.getElementById("menu-description").value,
      price: parseInt(document.getElementById("menu-price").value),
      image_url: null,
      image_file_name: null,
    };
    saveMenu(formData);
  });

  // Article modal
  document.getElementById("add-article-btn").addEventListener("click", () => {
    clearForm("article-form");
    document.getElementById("article-modal-title").textContent =
      "Tambah Artikel";
    document.getElementById("article-image-preview").classList.add("hidden");
    document.getElementById("article-image-file").setAttribute("required", "");
    showModal("article-modal");
  });

  document.getElementById("cancel-article").addEventListener("click", () => {
    closeModal("article-modal");
  });

  document.getElementById("article-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = {
      id: document.getElementById("article-id").value || null,
      title: document.getElementById("article-title").value,
      author: document.getElementById("article-author").value,
      category: document.getElementById("article-category").value,
      content: document.getElementById("article-content").value,
      image_url: null,
      image_file_name: null,
    };
    saveArticle(formData);
  });
}

function showModal(modalId) {
  document.getElementById(modalId).classList.remove("hidden");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add("hidden");
}

function clearForm(formId) {
  document.getElementById(formId).reset();
  const hiddenInputs = document.querySelectorAll(
    `#${formId} input[type="hidden"]`
  );
  hiddenInputs.forEach((input) => (input.value = ""));
}

// Image Modal Functions
function openImageModal(imageUrl, title) {
  // Create modal if it doesn't exist
  let modal = document.getElementById("image-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "image-modal";
    modal.className =
      "fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4";
    modal.style.display = "none";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="relative max-w-4xl max-h-full">
      <button onclick="closeImageModal()" class="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all z-10">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      <div class="bg-white rounded-lg overflow-hidden shadow-2xl">
        <div class="p-4 border-b bg-gray-50">
          <h3 class="text-lg font-semibold text-gray-800">${title}</h3>
        </div>
        <div class="p-4">
          <img src="${imageUrl}" alt="${title}" class="w-full h-auto max-h-96 object-contain rounded-lg" onerror="this.onerror=null; this.src='https://via.placeholder.com/400x300?text=Image+Not+Found';">
        </div>
        <div class="p-4 border-t bg-gray-50 text-center">
          <button onclick="closeImageModal()" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Tutup
          </button>
        </div>
      </div>
    </div>
  `;

  modal.style.display = "flex";
  document.body.style.overflow = "hidden"; // Prevent background scrolling
}

function closeImageModal() {
  const modal = document.getElementById("image-modal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto"; // Restore scrolling
  }
}

// Close modal when clicking outside the image
document.addEventListener("click", function (e) {
  const modal = document.getElementById("image-modal");
  if (modal && e.target === modal) {
    closeImageModal();
  }
});

// Close modal with Escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeImageModal();
  }
});

