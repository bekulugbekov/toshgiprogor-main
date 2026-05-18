const GRAPHQL_API_URL =
  "https://eu-west-2.cdn.hygraph.com/content/cm5hkvhzr011507ulay5rda62/master";
const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get("slug");

async function fetchLastBlogs() {
  const query = `
    query MyQuery {
      blog(last: 5) {
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

    if (result.errors) {
      console.error("GraphQL error:", result.errors);
      return;
    }

    const lastBlogs = result.data.blog;
    renderLastBlogs(lastBlogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
  }
}

function renderLastBlogs(lastBlogs) {
  const container = document.querySelector(".latest-post-wrap");
  const language = localStorage.getItem("selectedLanguage") || "en";

  container.innerHTML = ""; 

  lastBlogs.forEach((blog) => {
    const title =
      language === "en"
        ? blog.titleEn
        : language === "ru"
        ? blog.titleRu
        : language === "zh"
        ? (blog.titleZh || blog.titleEn)
        : blog.titleUz;

    const description =
      language === "en"
        ? blog.descriptionEn.text
        : language === "ru"
        ? blog.descriptionRu.text
        : language === "zh"
        ? ((blog.descriptionZh && blog.descriptionZh.text) || blog.descriptionEn.text)
        : blog.descriptionUz.text;

    const blogHTML = `
      <div class="single-latest-post">
        <div class="latest-post-content">
          <div class="post-title">
            <h3>
              <a href="blog-details.html?slug=${blog.slug}">
                ${title}
              </a>
            </h3>
          </div>
          <div class="blog-info">
            <div class="blog-author">
              <p>by ${blog.author}</p>
            </div>
            <div class="blog-date">
              <p>${new Date(blog.blogDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML += blogHTML;
  });
}

fetchLastBlogs();


async function fetchBlogDetails(slug) {
  const query = `
    query BlogDetails {
      blogs(where: {slug: "${slug}"}) {
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

    if (result.errors) {
      console.error("GraphQL error:", result.errors);
      return null;
    }

    return result.data.blogs;
  } catch (error) {
    console.error("Error fetching blog details:", error);
    return null;
  }
}

async function renderBlogDetails() {
  const blog = await fetchBlogDetails(slug);
  const language = localStorage.getItem("selectedLanguage");

  if (!blog) {
    document.querySelector(".blog-details").innerHTML =
      "<h1>Blog not found</h1>";
    return;
  }

  const title =
    language === "en"
      ? blog.titleEn
      : language === "ru"
        ? blog.titleRu
        : language === "zh"
          ? (blog.titleZh || blog.titleEn)
          : blog.titleUz;

  const description =
    language === "en"
      ? blog.descriptionEn.text
      : language === "ru"
        ? blog.descriptionRu.text
        : language === "zh"
          ? ((blog.descriptionZh && blog.descriptionZh.text) || blog.descriptionEn.text)
          : blog.descriptionUz.text;

  document.querySelector(".blog-details").innerHTML = `
      <div class="section-title">
          <h3>${title} </h3>
      </div>
      <hr>
      <div class="blog-meta">
          <div class="blog-info">
              <span>${blog.author}</span>
              <span>${blog.blogDate}</span>
          </div>
      </div>
      <div class="blog-featured-img mt-30">
          <img width="100%" src="${blog.image.url}" alt="Featured Image">
      </div>
      <div class="blog-content">
          <p class="mt-30">${description}</p>
      </div>
    `;
}

renderBlogDetails();
