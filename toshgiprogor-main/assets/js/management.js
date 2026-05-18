const FILE_EXPLORER_GRAPHQL_API_URL =
  "https://eu-west-2.cdn.hygraph.com/content/cm5hkvhzr011507ulay5rda62/master";

const query = `
query MyQuery {
  folders {
    id
    nameRu
    nameEn
    nameUz
    type
    children {
      ... on SubFolder {
        id
        nameEn
        nameRu
        nameUz
        type
        children {
          ... on SubFolder {
            id
            nameEn
            nameRu
            nameUz
            type
            children {
              ... on File {
                id
                nameEn
                nameRu
                nameUz
                type
                url {
                  url
                }
              }
            }
          }
          ... on File {
            id
            nameEn
            nameRu
            nameUz
            type
            url {
              url
            }
          }
        }
      }
      ... on File {
        id
        nameEn
        nameRu
        nameUz
        type
        url {
          url
        }
      }
    }
  }
}
`;

// Function to create folder and file icons
function createFolderSidebarIcon() {
  return `<svg class="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="rgb(96 165 250)" stroke="currentColor" stroke-width="3">
                  <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>`;
}

function createFolderIcon() {
  return `<svg class="w-10 h-10 text-blue-400" viewBox="0 0 24 24" fill="rgb(96 165 250)" stroke="currentColor" stroke-width="3">
                  <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>`;
}

function createFileIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-white" viewBox="0 0 24 24" fill="rgb(96 165 250)"><path d="M8.267 14.68c-.184 0-.308.018-.372.036v1.178c.076.018.171.023.302.023.479 0 .774-.242.774-.651 0-.366-.254-.586-.704-.586zm3.487.012c-.2 0-.33.018-.407.036v2.61c.077.018.201.018.313.018.817.006 1.349-.444 1.349-1.396.006-.83-.479-1.268-1.255-1.268z"></path><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM9.498 16.19c-.309.29-.765.42-1.296.42a2.23 2.23 0 0 1-.308-.018v1.426H7v-3.936A7.558 7.558 0 0 1 8.219 14c.557 0 .953.106 1.22.319.254.202.426.533.426.923-.001.392-.131.723-.367.948zm3.807 1.355c-.42.349-1.059.515-1.84.515-.468 0-.799-.03-1.024-.06v-3.917A7.947 7.947 0 0 1 11.66 14c.757 0 1.249.136 1.633.426.415.308.675.799.675 1.504 0 .763-.279 1.29-.663 1.615zM17 14.77h-1.532v.911H16.9v.734h-1.432v1.604h-.906V14.03H17v.74zM14 9h-1V4l5 5h-4z"></path></svg>`;
}

function createImageIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-white" viewBox="0 0 24 24" fill="rgb(96 165 250)"><path d="M6 22h12a2 2 0 0 0 2-2V8l-6-6H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2zm7-18 5 5h-5V4zm-4.5 7a1.5 1.5 0 1 1-.001 3.001A1.5 1.5 0 0 1 8.5 11zm.5 5 1.597 1.363L13 13l4 6H7l2-3z"></path></svg>`;
}

function createZipIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-white" viewBox="0 0 24 24" fill="rgb(96 165 250)"><path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6h-3v2H9v2h2v2H9v2h2v8H7v-6h2v-2H7V8h2V6H7V4h2V2H6zm7 2 5 5h-5V4z"></path><path d="M8 15h2v2H8z"></path></svg>`;
}

// Function to render a single item (folder or file) in the sidebar
let data = [];
let currentPath = [];
const language = localStorage.getItem("selectedLanguage") || "en";

async function fetchFolders() {
  try {
    const response = await fetch(FILE_EXPLORER_GRAPHQL_API_URL, {
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

    data = result.data.folders;
    initializeFileExplorer();
  } catch (error) {
    console.error("Error fetching folders:", error);
  }
}

// Sidebar elementlarni render qilish
function renderSidebarItem(item) {
  const name =
    language === "en"
      ? item.nameEn
      : language === "ru"
      ? item.nameRu
      : item.nameUz;
  return `
    <div class="select-none">
      <div class="flex items-center px-2 py-2 rounded-md hover:bg-gray-700 hover:text-white cursor-pointer " data-id="${
        item.id
      }">
        ${item.type === "folder" ? createFolderSidebarIcon() : createFileIcon()}
        <span class="ml-2 text-sm">${name}</span>
      </div>
    </div>
  `;
}

// Asosiy fayl va papkalar joylashuvi
function renderMainContent(items) {
  const fileGrid = document.getElementById("fileGrid");
  fileGrid.innerHTML = items
    .map((item) => {
      let fileContent = "";
      const name =
        language === "en"
          ? item.nameEn
          : language === "ru"
          ? item.nameRu
          : item.nameUz;
      if (item.type === "folder") {
        fileContent = `
          <div class="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer" data-id="${
            item.id
          }">
            ${createFolderIcon()}
            <p class="text-sm text-white hover:underline mt-2">${name}</p>
          </div>`;
      } else {
        if (item.type === "image-file") {
          fileContent = `
          <div class="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer" data-id="${
            item.id
          }">
            ${createImageIcon()}
            <p class="text-sm text-white hover:underline mt-2">${name}</p>
          </div>`;
        } else if (item.type === "zip-file") {
          fileContent = `
          <div class="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer" data-id="${
            item.id
          }">
            ${createZipIcon()}
            <a href="${
              item.url.url
            }" download class="text-sm text-white hover:underline mt-2">${name}</a>
          </div>`;
        } else {
          fileContent = `
          <div class="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer" data-id="${
            item.id
          }">
            ${createFileIcon()}
            <p class="text-sm text-white hover:underline mt-2">${name}</p>
          </div>`;
        }
      }
      return fileContent;
    })
    .join("");
}

// Breadcrumb'ni yangilash
function updateBreadcrumb() {
  const breadcrumb = document.getElementById("breadcrumb");
  const breadcrumbItems = currentPath.map((item, index) => ({
    name: language === "en" ? item.nameEn : language === "ru" ? item.nameRu : item.nameUz,
    id: item.id,
    isLast: index === currentPath.length - 1,
  }));

  const back = language === "en" ? "Back" : language === "ru" ? "Назад" : "Orqaga";

  const backButton =
    currentPath.length > 1
      ? `<span class="cursor-pointer mx-2 hover:underline" onclick="goBack()">← ${back}</span>`
      : "";

  if (breadcrumbItems.length > 4) {
    const visibleItems = breadcrumbItems.slice(0, 1);
    const lastItem = breadcrumbItems[breadcrumbItems.length - 1];

    breadcrumb.innerHTML = `
      ${backButton}
      ${visibleItems
        .map(
          (item) =>
            `<span class="cursor-pointer mx-2" data-id="${item.id}">${item.name}</span>`
        )
        .join(" / ")}
      <span class="mx-2">...</span>
      ${
        lastItem
          ? `<span class="cursor-pointer mx-2 font-semibold" data-id="${lastItem.id}">${lastItem.name}</span>`
          : ""
      }
    `;
  } else {
    breadcrumb.innerHTML = `
      ${backButton}
      ${breadcrumbItems
        .map(
          (item) =>
            `<span class="cursor-pointer mx-2 ${
              item.isLast ? "font-semibold" : ""
            }" data-id="${item.id}">${item.name}</span>`
        )
        .join(" / ")}
    `;
  }
}

// Papka ichiga kirish yoki faylni ochish
function navigateTo(id) {
  let items;

  if (id === "root") {
    currentPath = [];
    items = data;
  } else {
    const targetItem = findItemById(data, id);

    if (targetItem) {
      if (targetItem.type === "folder") {
        if (!currentPath.find((item) => item.id === targetItem.id)) {
          currentPath.push(targetItem);
        }
        items = targetItem.children;
      } else {
        window.open(targetItem.url.url, "_blank");
        return;
      }
    }
  }

  renderMainContent(items || []);
  updateBreadcrumb();
}

// ID bo'yicha elementni topish
function findItemById(items, id) {
  for (let item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

// Ortga qaytish
function goBack() {
  currentPath.pop();
  const parentItem = currentPath[currentPath.length - 1];
  renderMainContent(parentItem ? parentItem.children : data);
  updateBreadcrumb();
}

// File explorer'ni ishga tushirish
function initializeFileExplorer() {
  const sidebar = document.getElementById("sidebar");
  sidebar.innerHTML = data.map((item) => renderSidebarItem(item)).join("");

  sidebar.addEventListener("click", (e) => {
    const itemEl = e.target.closest("[data-id]");
    if (!itemEl) return;
    currentPath = [];
    navigateTo(itemEl.dataset.id);
  });

  document.getElementById("fileGrid").addEventListener("click", (e) => {
    const itemEl = e.target.closest("[data-id]");
    if (!itemEl) return;
    navigateTo(itemEl.dataset.id);
  });

  navigateTo("root");
}

fetchFolders();
