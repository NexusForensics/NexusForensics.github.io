(() => {
  const OPEN_CLASS = "lightbox-open";
  const TRIGGER_CLASS = "lightbox-trigger";
  const SKIP_SELECTOR = ".brand img, .product-card img";

  const getTitle = (element) =>
    element.dataset.lightboxTitle ||
    element.getAttribute("alt") ||
    element.closest("figure")?.querySelector("figcaption")?.textContent?.trim() ||
    "";

  const getSource = (element) =>
    element.dataset.lightboxSrc ||
    element.currentSrc ||
    element.src ||
    "";

  const makeLightbox = () => {
    let lightbox = document.querySelector("[data-site-lightbox]");
    if (lightbox) return lightbox;

    lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("data-site-lightbox", "");
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.innerHTML = `
      <button class="lightbox-close" type="button" data-site-lightbox-close aria-label="Close image preview">Close</button>
      <figure>
        <img src="" alt="" data-site-lightbox-image />
        <figcaption data-site-lightbox-caption></figcaption>
      </figure>
    `;
    document.body.appendChild(lightbox);
    return lightbox;
  };

  const lightbox = makeLightbox();
  const lightboxImage = lightbox.querySelector("[data-site-lightbox-image]");
  const lightboxCaption = lightbox.querySelector("[data-site-lightbox-caption]");
  const closeButton = lightbox.querySelector("[data-site-lightbox-close]");

  if (!lightboxImage || !lightboxCaption || !closeButton) return;

  const openLightbox = (src, title) => {
    if (!src) return;
    lightboxImage.src = src;
    lightboxImage.alt = title;
    lightboxCaption.textContent = title;
    lightboxCaption.hidden = !title;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add(OPEN_CLASS);
  };

  const closeLightbox = () => {
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove(OPEN_CLASS);
    lightboxImage.removeAttribute("src");
    lightboxImage.alt = "";
  };

  document.querySelectorAll("img").forEach((image) => {
    if (image.closest(SKIP_SELECTOR)) return;
    if (image.closest("button[data-lightbox-src], a[data-lightbox-src]")) return;
    image.classList.add(TRIGGER_CLASS);
    image.setAttribute("tabindex", "0");
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `Open image preview${getTitle(image) ? `: ${getTitle(image)}` : ""}`);
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-lightbox-src]");
    if (button) {
      openLightbox(button.dataset.lightboxSrc, button.dataset.lightboxTitle || "");
      return;
    }

    const image = event.target.closest(`img.${TRIGGER_CLASS}`);
    if (image) {
      openLightbox(getSource(image), getTitle(image));
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLightbox();
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && event.target.matches(`img.${TRIGGER_CLASS}`)) {
      event.preventDefault();
      openLightbox(getSource(event.target), getTitle(event.target));
    }
  });

  lightbox.addEventListener("click", closeLightbox);
  closeButton.addEventListener("click", closeLightbox);
})();
