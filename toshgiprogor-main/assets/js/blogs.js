const BLOGS_GRAPHQL_API_URL =
  "https://eu-west-2.cdn.hygraph.com/content/cm5hkvhzr011507ulay5rda62/master";

const query = `
  query MyQuery {
    blogConnection {
      edges {
        node {
          id
          slug
          titleEn
          titleRu
          titleUz
          titleZh
          descriptionEn {
            text
          }
          descriptionRu {
            text
          }
          descriptionUz {
            text
          }
          descriptionZh {
            text
          }
          image {
            url
          }
          blogDate
          author
        }
      }
    }
  }
`;

async function fetchBlogs(limit = null) {
  try {
    const response = await fetch(BLOGS_GRAPHQL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error("GraphQL error:", result.errors);
      return;
    }

    let blogs = result.data.blogConnection.edges;

    if (limit) {
      blogs = blogs.slice(0, limit);
    }

    const currentPage = document.body.getAttribute("data-page");
    renderBlogs(blogs, currentPage);
  } catch (error) {
    console.error("Error fetching blogs:", error);
  }
}

function renderBlogs(blogs, currentPage) {
  const language = localStorage.getItem("selectedLanguage") || "en";
  const blogContainer = document.getElementById("blogs-container");
  blogContainer.innerHTML = "";

  blogs.forEach(({ node }, index) => {
    const title =
      language === "en"
        ? node.titleEn
        : language === "ru"
        ? node.titleRu
        : language === "zh"
        ? (node.titleZh || node.titleEn)
        : node.titleUz;

    const description =
      language === "en"
        ? node.descriptionEn.text
        : language === "ru"
        ? node.descriptionRu.text
        : language === "zh"
        ? ((node.descriptionZh && node.descriptionZh.text) || node.descriptionEn.text)
        : node.descriptionUz.text;

    if (currentPage === "home") {
      const blogCard = document.createElement("div");
      blogCard.className = "col-xl-4 col-lg-4 col-md-6 col-12";
      const isFirstInRow = index % 3 === 0;
      const isLastInRow = (index + 1) % 3 === 0;

      let imageStyle = "";
      if (isFirstInRow || isLastInRow) {
        imageStyle = "style='height: 500px; object-fit: cover;'";
      }

      blogCard.innerHTML = `
        <hr />
        <div class="single-blog-item mt-30">
          <div class="blog-bg">
            <img src="${node.image.url}" alt="${title}" ${imageStyle} />
          </div>
          <div class="blog-content">
            <hr />
            <h3>
              <a href="blog-details.html?slug=${node.slug}">
                ${title}
              </a>
            </h3>
            <div class="blog-info">
              <div class="blog-author">
                <p>by ${node.author}</p>
              </div>
              <div class="blog-date">
                <p>${node.blogDate}</p>
              </div>
            </div>
          </div>
        </div>
      `;
      blogContainer.appendChild(blogCard);
    } else if (currentPage === "blogs") {
      const blogWrapperItem = document.createElement("div");
      blogWrapperItem.className = "row align-items-center mt-60";

      const readMore =
        language === "en"
          ? "Read More"
          : language === "ru"
          ? "Читать больше"
          : language === "zh"
          ? "阅读更多"
          : "Batafsil";

      blogWrapperItem.innerHTML = `
        <div class="col-xl-6 col-lg-6">
          <div class="project-list-img">
            <img width="100%" src="${node.image.url}" alt="${title}" />
          </div>
        </div>
        <div class="col-xl-6 col-lg-6">
          <div class="project-list-content">
            <div class="section-title">
              <h6><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" style="fill: rgba(0, 0, 0, 1); margin-right: 5px"><path d="M21 20V6c0-1.103-.897-2-2-2h-2V2h-2v2H9V2H7v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2zM9 18H7v-2h2v2zm0-4H7v-2h2v2zm4 4h-2v-2h2v2zm0-4h-2v-2h2v2zm4 4h-2v-2h2v2zm0-4h-2v-2h2v2zm2-5H5V7h14v2z"></path></svg> ${
                node.blogDate
              }</h6>
              <h4>${title}</h4>
            </div>
            <p>
              ${description.slice(0, 200)}...
            </p>
            <a href="blog-details.html?slug=${
              node.slug
            }" class="read_more_link">
              <span class="link_text">${readMore}</span>
              <span class="link_icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(0, 0, 0, 1);"><path d="m11.293 17.293 1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H6v2h9.586z"></path></svg>
              </span>
            </a>
          </div>
        </div>
      `;
      blogContainer.appendChild(blogWrapperItem);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const currentPage = document.body.getAttribute("data-page");

  if (currentPage === "home") {
    fetchBlogs(3);
  } else if (currentPage === "blogs") {
    fetchBlogs();
  }
});
