async function loadJSON(file) {
  const response = await fetch(file);
  return response.json();
}

function renderResume(template, data) {
  const d = data.data;

  return `
    <div class="resume">
      <div class="left">
        <img src="${d.photoUrl}" alt="${d.name}">
        <h2>${template.layout.contact.title}</h2>
        <p><strong>${d.name}</strong>, ${d.location}</p>
        <p>DOB: ${d.dob}</p>
        <p>${d.email}<br>${d.phone}<br>${d.website}</p>

        <h2>${template.layout.education.title}</h2>
        ${d.education.map(edu => `
          <p><strong>${edu.institution}</strong><br>${edu.period}</p>
        `).join('')}

        <h2>${template.layout.skills.title}</h2>
        <ul>
          ${d.skills.map(skill => `<li>${skill}</li>`).join('')}
        </ul>
      </div>

      <div class="right">
        <h1>${template.layout.header.title}</h1>

        <h2>${template.layout.profile.title}</h2>
        <p>${d.profile}</p>

        <h2>${template.layout.experience.title}</h2>
        ${d.experience.map(exp => `
          <h3>${exp.role}</h3>
          <p><em>${exp.period}</em></p>
          <p>${exp.description}</p>
        `).join('')}
      </div>
    </div>
  `;
}

async function init() {
  const templates = await loadJSON("templates/templates.json");
  const data = await loadJSON("Portfolios/data.json");

  // pick the first template for now
  const template = templates[0];

  // Inject styles from template
  const styleTag = document.createElement("style");
  styleTag.innerHTML = template.styles;
  document.head.appendChild(styleTag);

  // Render resume
  const html = renderResume(template, data);
  document.getElementById("app").innerHTML = html;
}

init();
