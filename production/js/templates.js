async function loadTemplate(selector, file) {
  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error(`Failed to load ${file}`);
    const html = await res.text();
    document.querySelector(selector).innerHTML = html;
  } catch (err) {
    console.error(err);
  }
}

// Load on page start
document.addEventListener("DOMContentLoaded", () => {
  loadTemplate("header", "header.html");
  loadTemplate("footer", "footer.html");
});
