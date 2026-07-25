export function injectMetaTags(): void {
  if (typeof window === "undefined") return;

  const defaults = {
    title: "HR ID Card Automata - Design & Export Employee ID Cards",
    description:
      "Privacy-first, offline-capable web app for designing, customizing, and batch-exporting employee ID cards. Drag-and-drop template designer with PDF/DOCX export.",
    url: "https://hr-id-card-automata.vercel.app",
    image: "https://hr-id-card-automata.vercel.app/og-image.png",
  };

  setMeta("og:title", defaults.title);
  setMeta("og:description", defaults.description);
  setMeta("og:url", defaults.url);
  setMeta("og:image", defaults.image);
  setMeta("og:type", "website");
  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:title", defaults.title);
  setMeta("twitter:description", defaults.description);
  setMeta("twitter:image", defaults.image);

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "HR ID Card Automata",
    description: defaults.description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  });
  document.head.appendChild(script);
}

function setMeta(property: string, content: string): void {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}
