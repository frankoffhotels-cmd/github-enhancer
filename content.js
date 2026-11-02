
console.log("GitHub Enhancer content script loaded");

/**
 * content.js - GitHub Enhancer Content Script
 * Adds "Copy" buttons to code blocks and "Download" buttons to file headers.
 */

// Wait for DOM to be ready
if (document.readyState === "complete") {
  init();
} else {
  window.addEventListener("load", init);
}

function init() {
  addCopyButtons();
  addDownloadButtons();
  observeDOM();
}

/**
 * Adds "Copy" buttons to code blocks.
 */
function addCopyButtons() {
  const codeBlocks = Array.from(
    document.querySelectorAll("div.highlight pre, table.highlight, td.blob-code")
  ).filter(
    (block) =>
      !block.matches("td.blob-code") || !block.closest("table.highlight")
  );
  console.log("GitHub Enhancer: found code blocks:", codeBlocks.length);
  codeBlocks.forEach((block) => {
    if (block.dataset.copyButtonAdded) return;
    const container = block.parentElement;
    if (!container) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-sm btn-outline copy-code-btn";
    btn.setAttribute("aria-label", "Copy code");
    btn.innerHTML = "Copy";

    btn.style.position = "absolute";
    btn.style.top = "8px";
    btn.style.right = "8px";
    btn.style.zIndex = "100";
    btn.style.background = "none";
    btn.style.border = "1px solid var(--text-fg-primary, #333)";
    btn.style.color = "var(--text-fg-primary, #333)";
    btn.style.padding = "4px 8px";
    btn.style.fontSize = "12px";
    btn.style.cursor = "pointer";
    btn.style.borderRadius = "4px";
    btn.style.transition = "background-color 0.2s, color 0.2s";

    btn.addEventListener("mouseenter", () => {
      btn.style.background = "var(--primary-bg-subtle, #f0f0f0)";
      btn.style.color = "var(--primary-fg, #24292e)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.background = "none";
      btn.style.color = "var(--text-fg-primary, #333)";
    });

    btn.addEventListener("click", async () => {
      const codeText = block.matches("table.highlight")
        ? Array.from(
            block.querySelectorAll("td.blob-code"),
            (line) => line.textContent || ""
          ).join("\n")
        : block.textContent || block.innerText || "";
      try {
        await navigator.clipboard.writeText(codeText);
        const originalText = btn.innerHTML;
        btn.innerHTML = "Copied!";
        btn.style.background = "var(--primary-fg, #24292e)";
        btn.style.color = "var(--primary-bg-subtle, #fff)";
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = "none";
          btn.style.color = "var(--text-fg-primary, #333)";
        }, 2000);
      } catch (err) {
        console.error("Failed to copy text:", err);
        btn.innerHTML = "Error";
        setTimeout(() => (btn.innerHTML = "Copy"), 1500);
      }
    });

    container.style.position = "relative";
    container.appendChild(btn);
    block.dataset.copyButtonAdded = "true";
  });
}

/**
 * Adds "Download" buttons next to file headers on GitHub file pages.
 */
function addDownloadButtons() {
  const fileHeaders = document.querySelectorAll(
    '[data-testid="breadcrumbs"] a:last-child, .file-header .js-navigation-open'
  );
  console.log("GitHub Enhancer: found file headers:", fileHeaders.length);

  fileHeaders.forEach((header) => {
    const container = header.parentElement;
    const rawUrl = constructRawUrl();
    if (!rawUrl) return;
    if (!container || container.dataset.downloadButtonAdded) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-sm btn-outline download-file-btn";
    btn.setAttribute("aria-label", "Download file");
    btn.innerHTML = "Download";

    btn.style.position = "absolute";
    btn.style.top = "8px";
    btn.style.right = "40px";
    btn.style.zIndex = "100";
    btn.style.background = "none";
    btn.style.border = "1px solid var(--text-fg-primary, #333)";
    btn.style.color = "var(--text-fg-primary, #333)";
    btn.style.padding = "4px 8px";
    btn.style.fontSize = "12px";
    btn.style.cursor = "pointer";
    btn.style.borderRadius = "4px";
    btn.style.transition = "background-color 0.2s, color 0.2s";

    btn.addEventListener("mouseenter", () => {
      btn.style.background = "var(--primary-bg-subtle, #f0f0f0)";
      btn.style.color = "var(--primary-fg, #24292e)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.background = "none";
      btn.style.color = "var(--text-fg-primary, #333)";
    });

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.open(rawUrl, "_blank", "noopener");
    });

    container.style.position = "relative";
    container.appendChild(btn);
    container.dataset.downloadButtonAdded = "true";
  });
}

/**
 * Constructs a raw GitHub URL when the current page shows a file.
 */
function constructRawUrl() {
  const filePath = window.location.pathname.match(
    /^\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/
  );
  if (!filePath) return null;

  const [, owner, repo, branch, path] = filePath;
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
}

/**
 * Observes DOM changes to add buttons dynamically.
 */
function observeDOM() {
  const observer = new MutationObserver((mutations) => {
    addCopyButtons();
    addDownloadButtons();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
