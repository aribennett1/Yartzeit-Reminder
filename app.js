const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1dwd73mDGAOcbA_cjX-e76zgi-8nX9WiFE0pRDHpd794/export?format=csv&gid=1366559412";

const HEBREW_MONTH_ORDER = [
  "Tishrei",
  "Cheshvan",
  "Kislev",
  "Teves",
  "Shvat",
  "Adar",
  "Adar I",
  "Adar II",
  "Adar ?",
  "Nissan",
  "Iyar",
  "Sivan",
  "Tammuz",
  "Av",
  "Elul",
];

const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const tabsEl = document.getElementById("family-tabs");
const listEl = document.getElementById("yahrzeit-list");

let allYahrzeits = [];
let activeFamily = "All";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      row.push(field);
      if (row.some((value) => value.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((value) => value.trim() !== "")) {
      rows.push(row);
    }
  }

  return rows;
}

function extractDriveFileId(url) {
  const match = url.match(/\/d\/([^/]+)/);
  return match ? match[1] : null;
}

function driveUrlToImageEmbed(url) {
  const fileId = extractDriveFileId(url.trim());
  if (!fileId) {
    return null;
  }
  return `https://lh3.googleusercontent.com/d/${fileId}=s750?authuser=0`;
}

function parsePictures(pictureCell) {
  if (!pictureCell || !pictureCell.trim()) {
    return [];
  }

  return pictureCell
    .split(",")
    .map((url) => driveUrlToImageEmbed(url))
    .filter(Boolean);
}

function parseVideos(videoCell) {
  if (!videoCell || !videoCell.trim()) {
    return [];
  }

  const segments = videoCell.split(/,(?=[^:]+:\s*https?:\/\/)/);
  const pattern =
    /^([^:]+):\s*(https?:\/\/[^\s,]+)\s+Alternate [Ll]ink:\s*(https?:\/\/[^\s,]+)/i;

  return segments
    .map((segment) => {
      const match = segment.trim().match(pattern);
      if (!match) {
        return null;
      }

      return {
        label: match[1].trim(),
        primaryUrl: match[2].trim(),
        alternateUrl: match[3].trim(),
      };
    })
    .filter(Boolean);
}

function extractYouTubeId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1).split("/")[0];
    }
    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}

function isYouTubeUrl(url) {
  return /youtube\.com|youtu\.be/.test(url);
}

function isDriveUrl(url) {
  return /drive\.google\.com/.test(url);
}

function monthSortValue(month) {
  const index = HEBREW_MONTH_ORDER.indexOf(month);
  return index === -1 ? HEBREW_MONTH_ORDER.length : index;
}

function sortYahrzeits(items) {
  return [...items].sort((a, b) => {
    const monthDiff = monthSortValue(a.month) - monthSortValue(b.month);
    if (monthDiff !== 0) {
      return monthDiff;
    }
    return Number(a.day) - Number(b.day);
  });
}

function parseYahrzeitRow(row) {
  const [day, month, year, englishName, hebrewName, notes, picture, video, family] =
    row;

  return {
    day: String(day).trim(),
    month: String(month).trim(),
    year: String(year || "").trim(),
    englishName: String(englishName || "").trim(),
    hebrewName: String(hebrewName || "").trim(),
    notes: String(notes || "").trim(),
    pictures: parsePictures(picture),
    videos: parseVideos(video),
    family: String(family || "").trim(),
  };
}

function formatTitle(yahrzeit) {
  const english = yahrzeit.englishName || "Unknown";
  const hebrew = yahrzeit.hebrewName || "";
  const hebrewPart = hebrew ? ` (${hebrew})` : "";
  return `${english}${hebrewPart} - ${yahrzeit.day} ${yahrzeit.month}`;
}

function createVideoEmbed(video) {
  const block = document.createElement("div");
  block.className = "video-block";

  const label = document.createElement("p");
  label.className = "video-label";
  label.textContent = video.label;
  block.appendChild(label);

  if (isYouTubeUrl(video.primaryUrl)) {
    const youtubeId = extractYouTubeId(video.primaryUrl);
    if (youtubeId) {
      const iframe = document.createElement("iframe");
      iframe.className = "video-embed";
      iframe.src = `https://www.youtube.com/embed/${youtubeId}`;
      iframe.title = `${video.label} on YouTube`;
      iframe.loading = "lazy";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      block.appendChild(iframe);
    }
  } else if (isDriveUrl(video.primaryUrl)) {
    const fileId = extractDriveFileId(video.primaryUrl);
    if (fileId) {
      const iframe = document.createElement("iframe");
      iframe.className = "video-embed";
      iframe.src = `https://drive.google.com/file/d/${fileId}/preview`;
      iframe.title = `${video.label} on Google Drive`;
      iframe.loading = "lazy";
      iframe.allow = "autoplay";
      iframe.allowFullscreen = true;
      block.appendChild(iframe);
    }
  }

  if (video.alternateUrl) {
    const alternate = document.createElement("a");
    alternate.className = "alternate-link";
    alternate.href = video.alternateUrl;
    alternate.target = "_blank";
    alternate.rel = "noopener noreferrer";
    alternate.textContent = "Alternate link (Google Drive)";
    block.appendChild(alternate);
  }

  return block;
}

function createYahrzeitCard(yahrzeit) {
  const card = document.createElement("article");
  card.className = "yahrzeit-card";

  const summary = document.createElement("button");
  summary.type = "button";
  summary.className = "yahrzeit-summary";
  summary.setAttribute("aria-expanded", "false");

  const chevron = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  chevron.setAttribute("class", "chevron");
  chevron.setAttribute("viewBox", "0 0 24 24");
  chevron.setAttribute("aria-hidden", "true");
  chevron.innerHTML =
    '<path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';

  const title = document.createElement("span");
  title.className = "yahrzeit-title";
  title.textContent = formatTitle(yahrzeit);

  summary.append(chevron, title);

  const details = document.createElement("div");
  details.className = "yahrzeit-details hidden";

  if (yahrzeit.year) {
    const yearBlock = document.createElement("div");
    yearBlock.className = "detail-block";
    yearBlock.innerHTML = `
      <p class="detail-label">Year</p>
      <p class="detail-text">${escapeHtml(yahrzeit.year)}</p>
    `;
    details.appendChild(yearBlock);
  }

  if (yahrzeit.notes) {
    const notesBlock = document.createElement("div");
    notesBlock.className = "detail-block";
    notesBlock.innerHTML = `
      <p class="detail-label">Notes</p>
      <p class="detail-text">${escapeHtml(yahrzeit.notes)}</p>
    `;
    details.appendChild(notesBlock);
  }

  if (yahrzeit.videos.length > 0) {
    const videosBlock = document.createElement("div");
    videosBlock.className = "detail-block";
    const videosLabel = document.createElement("p");
    videosLabel.className = "detail-label";
    videosLabel.textContent =
      yahrzeit.videos.length === 1 ? "Video" : `${yahrzeit.videos.length} Videos`;
    videosBlock.appendChild(videosLabel);

    const videosGrid = document.createElement("div");
    videosGrid.className = "media-grid";
    yahrzeit.videos.forEach((video) => {
      videosGrid.appendChild(createVideoEmbed(video));
    });
    videosBlock.appendChild(videosGrid);
    details.appendChild(videosBlock);
  }

  if (yahrzeit.pictures.length > 0) {
    const picturesBlock = document.createElement("div");
    picturesBlock.className = "detail-block";
    const picturesLabel = document.createElement("p");
    picturesLabel.className = "detail-label";
    picturesLabel.textContent =
      yahrzeit.pictures.length === 1
        ? "Picture"
        : `${yahrzeit.pictures.length} Pictures`;
    picturesBlock.appendChild(picturesLabel);

    const picturesGrid = document.createElement("div");
    picturesGrid.className = "media-grid pictures";
    yahrzeit.pictures.forEach((url) => {
      const img = document.createElement("img");
      img.src = url;
      img.alt = yahrzeit.englishName;
      img.loading = "lazy";
      picturesGrid.appendChild(img);
    });
    picturesBlock.appendChild(picturesGrid);
    details.appendChild(picturesBlock);
  }

  summary.addEventListener("click", () => {
    const isOpen = !details.classList.contains("hidden");
    details.classList.toggle("hidden", isOpen);
    card.toggleAttribute("open", !isOpen);
    summary.setAttribute("aria-expanded", String(!isOpen));
  });

  card.append(summary, details);
  return card;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getFamilies(yahrzeits) {
  return [...new Set(yahrzeits.map((item) => item.family).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b)
  );
}

function renderTabs(families) {
  tabsEl.innerHTML = "";

  const allTab = document.createElement("button");
  allTab.type = "button";
  allTab.className = "tab-button";
  allTab.textContent = "All";
  allTab.setAttribute("role", "tab");
  allTab.setAttribute("aria-selected", activeFamily === "All" ? "true" : "false");
  allTab.addEventListener("click", () => {
    activeFamily = "All";
    renderTabs(families);
    renderList();
  });
  tabsEl.appendChild(allTab);

  families.forEach((family) => {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = "tab-button";
    tab.textContent = family;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", activeFamily === family ? "true" : "false");
    tab.addEventListener("click", () => {
      activeFamily = family;
      renderTabs(families);
      renderList();
    });
    tabsEl.appendChild(tab);
  });
}

function renderList() {
  listEl.innerHTML = "";

  const filtered =
    activeFamily === "All"
      ? allYahrzeits
      : allYahrzeits.filter((item) => item.family === activeFamily);

  sortYahrzeits(filtered).forEach((yahrzeit) => {
    listEl.appendChild(createYahrzeitCard(yahrzeit));
  });
}

async function loadYahrzeits() {
  try {
    const response = await fetch(SHEET_CSV_URL);
    if (!response.ok) {
      throw new Error(`Could not load spreadsheet (${response.status})`);
    }

    const csvText = await response.text();
    const rows = parseCsv(csvText);
    const dataRows = rows.slice(1);

    allYahrzeits = dataRows
      .map(parseYahrzeitRow)
      .filter((item) => item.englishName || item.hebrewName);

    if (allYahrzeits.length === 0) {
      throw new Error("No yahrzeit records were found in the spreadsheet.");
    }

    loadingEl.classList.add("hidden");
    tabsEl.classList.remove("hidden");
    listEl.classList.remove("hidden");

    renderTabs(getFamilies(allYahrzeits));
    renderList();
  } catch (error) {
    loadingEl.classList.add("hidden");
    errorEl.classList.remove("hidden");
    errorEl.textContent =
      error instanceof Error
        ? error.message
        : "Something went wrong while loading yahrzeits.";
  }
}

loadYahrzeits();
