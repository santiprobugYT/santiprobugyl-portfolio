(() => {
  // Lightbox: click an image to enlarge it. Arrows / keyboard move within the same group; Esc closes.
  const dlg = document.createElement("dialog");
  dlg.className = "lightbox";
  dlg.setAttribute("aria-label", "Image viewer");
  dlg.innerHTML =
    '<button class="lb-btn lb-close" type="button" aria-label="Close">\u2715</button>' +
    '<button class="lb-btn lb-prev" type="button" aria-label="Previous image">\u2039</button>' +
    '<figure><img alt=""><figcaption></figcaption></figure>' +
    '<button class="lb-btn lb-next" type="button" aria-label="Next image">\u203A</button>';
  document.body.appendChild(dlg);

  const img = dlg.querySelector("img");
  const caption = dlg.querySelector("figcaption");
  const prev = dlg.querySelector(".lb-prev");
  const next = dlg.querySelector(".lb-next");
  let items = [];
  let index = 0;

  function show(n) {
    index = (n + items.length) % items.length;
    const thumb = items[index].querySelector("img");
    img.src = thumb.currentSrc || thumb.src;
    img.alt = thumb.alt;
    caption.textContent = thumb.alt;
    prev.hidden = next.hidden = items.length < 2;
  }

  document.addEventListener("click", e => {
    const shot = e.target.closest(".shot");
    if (!shot || !shot.querySelector("img")) return; // image missing: nothing to open
    const group = shot.closest(".grid") || document;
    items = Array.from(group.querySelectorAll(".shot")).filter(s => s.querySelector("img"));
    show(items.indexOf(shot));
    dlg.showModal();
  });

  prev.addEventListener("click", () => show(index - 1));
  next.addEventListener("click", () => show(index + 1));
  dlg.querySelector(".lb-close").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });
})();
