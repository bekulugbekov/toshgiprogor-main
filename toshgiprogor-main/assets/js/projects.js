const GRAPHQL_API_URL =
  "https://eu-west-2.cdn.hygraph.com/content/cm5hkvhzr011507ulay5rda62/master";

// Modal oynani yaratish
const modal = document.createElement("div");
modal.id = "projectModal";
modal.className = "modal";
modal.innerHTML = `
  <div class="modal-content">
    <span class="close">&times;</span>
    <div id="modal-project-container">
      <div class="loader">Loading...</div>
    </div>
  </div>
`;
document.body.appendChild(modal);

// Modalni ochish va yopish funksiyalari
function openModal() {
  modal.style.display = "block";
}

function closeModal() {
  modal.style.display = "none";
}

document.querySelector(".close").addEventListener("click", closeModal);
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

// Slider funksiyasi
function initSlider() {
  const slides = document.querySelectorAll(".slide");
  let currentSlide = 0;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.style.display = i === index ? "block" : "none";
    });
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
  }

  showSlide(currentSlide);

  // Keyingi va oldingi tugmalar
  const nextButton = document.createElement("button");
  nextButton.innerHTML = "&#10095;"; // O'ng strelka
  nextButton.addEventListener("click", nextSlide);

  const prevButton = document.createElement("button");
  prevButton.innerHTML = "&#10094;"; // Chap strelka
  prevButton.addEventListener("click", prevSlide);

  const sliderContainer = document.querySelector(".gallery-slider");
  sliderContainer.append(prevButton, nextButton);
}

// Loyiha tafsilotlarini modalga yuklash
function renderProjectDetailsToModal(project, language) {
  const modalContainer = document.getElementById("modal-project-container");
  const title =
    language === "en"
      ? project.titleEn
      : language === "ru"
      ? project.titleRu
      : project.titleUz;

  const imagesHTML = project.images
    .map(
      (image, index) => `
      <div class="slide">
        <img src="${image.url}" alt="Gallery Image" onload="hideLoader()">
      </div>
    `
    )
    .join("");

  const projectHTML = `
    <div class="modal-project-details">
      <h2>${title}</h2>
      <div class="gallery-slider">
        ${imagesHTML}
      </div>
    </div>
  `;

  modalContainer.innerHTML = projectHTML;
  openModal();
  initSlider();
}

// Loader ni yashirish
function hideLoader() {
  const loader = document.querySelector(".loader");
  if (loader) {
    loader.style.display = "none";
  }
}

// Loyiha tafsilotlarini olish va modalga yuklash
async function fetchProjectDetailsForModal(slug, language) {
  if (!slug) {
    console.error("Slug parameter is missing.");
    return;
  }

  const query = `
    query {
      project(where: {slug: "${slug}"}) {
        id
        slug
        titleEn
        titleRu
        titleUz
        mainImage {
          url
        }
        images {
          url
        }
      }
    }
  `;

  try {
    const response = await fetch(GRAPHQL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();
    const project = result.data.project[0];

    if (project) {
      renderProjectDetailsToModal(project, language);
    } else {
      console.error("Project not found");
    }
  } catch (error) {
    console.error("Error fetching project details:", error);
  }
}

// Kategoriyalarni so'rash
const categoryQuery = `
query MyQuery {
  categoriesConnection(last: 50) {
    edges {
      node {
        id
        slug
        titleEn
        titleRu
        titleUz
      }
    }
  }
}
`;

// Dinamik mahsulotlar uchun so'rov
const fetchProjectsQuery = (slug) => `
query MyQuery {
  categories(where: ${slug ? `{ slug: "${slug}" }` : `{}`}) {
    id
    slug
    projects(last: 1000) {
      id
      slug
      titleEn
      titleRu
      titleUz
      mainImage {
        url
      }
    }
  }
}
`;

// Kategoriyalarni olib kelish
async function fetchCategory() {
  try {
    const response = await fetch(GRAPHQL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: categoryQuery }),
    });

    const { data, errors } = await response.json();

    if (errors) throw new Error(errors.map((err) => err.message).join(", "));

    const categories = data.categoriesConnection.edges || [];
    renderCategories(categories);
  } catch (error) {
    console.error("Error fetching categories:", error.message);
  }
}

// Kategoriyalarni render qilish
function renderCategories(categories) {
  const language = localStorage.getItem("selectedLanguage") || "en";
  const categoriesList = document.getElementById("categories-list");

  if (!categoriesList) {

    return;
  }

  const title =
    language === "en"
      ? "Show All"
      : language === "ru"
      ? "Показать все"
      : "Barchasi";

  categoriesList.innerHTML = `
      <li class="list-inline-item">
        <a data-slug="" class="category-link active">${title}</a>
      </li>
    `;

  categories.forEach(({ node }) => {
    const title =
      language === "en"
        ? node.titleEn
        : language === "ru"
        ? node.titleRu
        : node.titleUz;

    const li = document.createElement("li");
    li.className = "list-inline-item";
    li.innerHTML = `<a data-slug="${node.slug}" class="category-link">${title}</a>`;
    categoriesList.appendChild(li);
  });

  // Kategoriyaga bosish hodisasi
  document
    .querySelectorAll(".category-link")
    .forEach((link) => link.addEventListener("click", handleCategoryClick));
}

// Kategoriya ustiga bosish hodisasi
async function handleCategoryClick(e) {
  e.preventDefault();
  const slug = e.target.getAttribute("data-slug");

  // Barcha linklardan active sinfini olib tashlash
  document
    .querySelectorAll(".category-link")
    .forEach((link) => link.classList.remove("active"));

  // Tanlangan kategoriya linkiga active sinfini qo'shish
  e.target.classList.add("active");

  await fetchProjects(slug);
}

// Mahsulotlarni olib kelish
async function fetchProjects(slug = null) {
  const query = slug
    ? fetchProjectsQuery(slug)
    : `
    query MyQuery {
      projectConnection(last: 1000) {
        edges {
          node {
            id
            slug
            titleEn
            titleRu
            titleUz
            mainImage {
              url
            }
          }
        }
      }
    }`;

  try {
    const response = await fetch(GRAPHQL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const { data, errors } = await response.json();

    if (errors) throw new Error(errors.map((err) => err.message).join(", "));

    const projects =
      slug && data.categories
        ? data.categories[0]?.projects || []
        : data.projectConnection.edges.map((edge) => edge.node) || [];

    const isHomePage = document.body.getAttribute("data-page");
    renderProjects(projects, isHomePage);
  } catch (error) {
    console.error("Error fetching projects:", error.message);
  }
}

// Mahsulotlarni render qilish
function renderProjects(projects, isHomePage = false) {
  const language = localStorage.getItem("selectedLanguage") || "en";
  const projectWrapper = document.getElementById("projects-wrapper");

  if (!projectWrapper) {
    console.error("Projects wrapper element not found.");
    return;
  }

  if (projects.length === 0) {
    const noProjects =
      language === "en"
        ? "No projects available in this category."
        : language === "ru"
        ? "В этой категории нет доступных проектов"
        : "Bu kategoriyada loyihalar mavjud emas.";
    projectWrapper.innerHTML = `
        <div class="no-projects-message" style="text-align: center; font-size: 18px; color: #777; padding: 50px;">
          <p>${noProjects}</p>
        </div>
      `;
    return;
  }

  const visibleProjects =
    isHomePage === "home" || isHomePage === "about-us"
      ? projects.slice(0, 6)
      : projects;

  projectWrapper.innerHTML = visibleProjects
    .map((project) => {
      const title =
        language === "en"
          ? project.titleEn
          : language === "ru"
          ? project.titleRu
          : project.titleUz;

      const imageUrl = project.mainImage?.url || "assets/img/project/1-1.jpg";

      return isHomePage === "home"
        ? `
        <div class="col-xl-4 col-lg-4 col-md-6">
          <div>
            <div class="single-project-wrapper">
              <div class="project-img">
                <img
                  lazy="loaded"
                  height="290px"
                  width="422px"
                  src="${imageUrl}"
                  alt="${title}"
                />
              </div>
              <div class="project-title">
                <h3>${title}</h3>
              </div>
            </div>
          </div>
        </div>
      `
        : `
        <div class="col-xl-4 col-lg-4 col-md-6">
          <a href="#" class="project-link" data-slug="${project.slug}">
            <div class="single-project-wrapper">
              <div class="project-img">
                <img
                  lazy="loaded"
                  height="290px"
                  width="422px"
                  src="${imageUrl}"
                  alt="${title}"
                />
              </div>
              <div class="project-title">
                <h3>${title}</h3>
              </div>
            </div>
          </a>
        </div>
      `;
    })
    .join("");

  // Yangi yaratilgan project-link elementlariga click hodisasini qo'shish
  document.querySelectorAll(".project-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const slug = e.target.closest(".project-link").getAttribute("data-slug");
      fetchProjectDetailsForModal(slug);
    });
  });
}

// Sahifani aniqlash
function initializePage() {
  const page = document.body.getAttribute("data-page");

  fetchCategory();

  if (page === "projects") {
    fetchProjects();
  } else if (page === "home" || page === "about-us") {
    fetchProjects(null, true);
  }
}

initializePage();
