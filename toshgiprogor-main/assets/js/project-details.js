const GRAPHQL_API_URL =
  "https://eu-west-2.cdn.hygraph.com/content/cm5hkvhzr011507ulay5rda62/master";

const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get("slug");

// API ma'lumotlarini yuklash
async function fetchProjectDetails(slug, language = "en") {
  const query = `
    query {
      projects(where: {slug: "${slug}"}) {
        id
        slug
        titleEn
        titleRu
        titleUz
        totalArea
        livingSpace
        locationEn
        locationRu
        locationUz
        mainImage {
          url
        }
        materialSpaceEn
        materialSpaceRu
        materialSpaceUz
        projectYear
        descriptionOneEn {
          html
        }
        descriptionOneRu {
          html
        }
        descriptionOneUz {
          html
        }
        descriptionTwoEn {
          html
        }
        descriptionTwoRu {
          html
        }
        descriptionTwoUz {
          html
        }
        images {
          url
        }
          client
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
    const project = result.data.projects;
    const language = localStorage.getItem("selectedLanguage") || "en";

    if (project) {
      renderProjectDetails(project, language);
    } else {
      document.getElementById("project-container").innerHTML =
        "<p>Project not found</p>";
    }
  } catch (error) {
    console.error("Error fetching project details:", error);
  }
}

// Tasvir mavjudligini tekshirish va alternativ ko'rsatish uchun funksiya
function getImageOrPlaceholder(imageUrl, altText) {
  return imageUrl
    ? `<img style="width: 100%; height: 100%;" src="${imageUrl}" alt="${altText}">`
    : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: #f0f0f0; color: #888; font-size: 14px;">Image not available</div>`;
}

function renderProjectDetails(project, language) {
  const title =
    language === "en"
      ? project.titleEn
      : language === "ru"
      ? project.titleRu
      : project.titleUz;

  const location =
    language === "en"
      ? project.locationEn
      : language === "ru"
      ? project.locationRu
      : project.locationUz;

  const materialSpace =
    language === "en"
      ? project.materialSpaceEn
      : language === "ru"
      ? project.materialSpaceRu
      : project.materialSpaceUz;

  const descriptionOne =
    language === "en"
      ? project.descriptionOneEn.html
      : language === "ru"
      ? project.descriptionOneRu.html
      : project.descriptionOneUz.html;

  const descriptionTwo =
    language === "en"
      ? project.descriptionTwoEn.html
      : language === "ru"
      ? project.descriptionTwoRu.html
      : project.descriptionTwoUz.html;

  const totalArea =
    language === "en"
      ? "Total Area"
      : language === "ru"
      ? "Общая площадь"
      : "Umumiy maydon";

  const livingSpace =
    language === "en"
      ? "Living Space"
      : language === "ru"
      ? "Жилое пространство"
      : "Yashash maydoni";

  const materialSpaces =
    language === "en"
      ? "Material Space"
      : language === "ru"
      ? "Материальное пространство"
      : "Materiallar maydoni";

  const client =
    language === "en" ? "Client" : language === "ru" ? "Клиент" : "Mijoz";

  const locations =
    language === "en"
      ? "Location"
      : language === "ru"
      ? "Местоположение"
      : "Manzil";

  const year = language === "en" ? "Year" : language === "ru" ? "Год" : "Yil";

  const projectHTML = `
      <div class="row gx-5 justify-content-around align-items-start mt-30">
        <div class="col-xl-6 col-lg-6">
          <div class="project-bg">
            <img height="700px" src="${project.mainImage.url}" alt="${title}">
            <div class="project-brief-wrap">
              <div class="single-brief">
                <h6>${totalArea}</h6>
                <p>${project.totalArea || "N/A"}</p>
              </div>
              <div class="single-brief">
                <h6>${livingSpace}</h6>
                <p>${project.livingSpace || "N/A"}</p>
              </div>
              <div class="single-brief">
                <h6>${materialSpaces}</h6>
                <p>${materialSpace || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-6 col-lg-6">
          <div class="project-details-inner">
            <div class="section-title">
              <h2>${title.replace("/", "<i>/</i>")}</h2>
            </div>
            <div class="project-details-info">
              <div class="single-info">
                <p>${client}</p>
                <h4>${project.client || "N/A"}</h4>
              </div>
              <div class="single-info">
                <p>${locations}</p>
                <h4>${location || "N/A"}</h4>
              </div>
              <div class="single-info">
                <p>${year}</p>
                <h4>${project.projectYear || "N/A"}</h4>
              </div>
            </div>
            <div class="project-desc"></div>
          </div>
        </div>
      </div>
      <div class="gallery-section mt-120">
        <h4>Gallery</h4>
        <hr>
        <div class="row gx-3 gy-3 mt-20">
          <div class="col-xl-6 col-lg-6 col-md-12">
            <div class="row gx-3 gy-3">
              ${project.images
                .slice(0, 4)
                .map(
                  (image, index) => `
                <div class="col-xl-6 col-lg-6 col-md-6">
                  <div class="project-details-img" style="width: 100%; height: 100%;">
                    ${getImageOrPlaceholder(
                      image?.url,
                      `Gallery Image ${index + 1}`
                    )}
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
          <div class="col-xl-6 col-lg-6 col-md-6">
            <div class="project-details-img" style="width: 100%; height: 100%;">
              ${getImageOrPlaceholder(
                project.images[4]?.url,
                "Main Gallery Image"
              )}
            </div>
          </div>
        </div>
      </div>
       <div class="mt-40"></div>
    `;

  document.getElementById("project-container").innerHTML = projectHTML;
  document.querySelector(".project-desc").innerHTML = descriptionOne || "N/A";
  document.querySelector(".mt-40").innerHTML = descriptionTwo || "N/A";
}

if (slug) {
  fetchProjectDetails(slug, "en");
} else {
  console.error("Slug parameter is missing in the URL.");
}
