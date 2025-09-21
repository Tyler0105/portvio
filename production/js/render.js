// production/assets/js/script.js
async function loadJSON(file) {
  const res = await fetch(file);
  if (!res.ok) throw new Error(`Failed to fetch ${file} — ${res.status} ${res.statusText}`);
  return res.json();
}

function renderResume(template, portfolio) {
  // portfolio is expected to be: { portfolioId, templateId, data: { ... } }
  const d = portfolio.data || {};

  // defensive access to template.layout
  const L = template.layout || {};
  const contact = L.contact || {};
  const header = L.header || {};
  const profile = L.profile || {};
  const experienceTitle = (L.experience && L.experience.title) || "Experience";
  const educationTitle = (L.education && L.education.title) || "Education";
  const skillsTitle = (L.skills && L.skills.title) || "Key Skills";

  return `
    <div class="resume">
      <div class="left">
        ${d.photoUrl ? `<img src="${d.photoUrl}" alt="${d.name || ''}">` : ''}
        <h2>${contact.title || "Contact"}</h2>
        <p><strong>${d.name || ''}</strong>${d.location ? ', ' + d.location : ''}</p>
        ${d.dob ? `<p>DOB: ${d.dob}</p>` : ''}
        <p>
          ${d.email || ''}${d.email && d.phone ? '<br>' : ''}${d.phone || ''}${(d.email || d.phone) && d.website ? '<br>' : ''}${d.website || ''}
        </p>

        <h2>${educationTitle}</h2>
        ${(Array.isArray(d.education) ? d.education : []).map(edu => `
          <p><strong>${edu.institution || ''}</strong><br>${edu.period || ''}</p>
        `).join('')}

        <h2>${skillsTitle}</h2>
        <ul>
          ${(Array.isArray(d.skills) ? d.skills : []).map(skill => `<li>${skill}</li>`).join('')}
        </ul>
      </div>

      <div class="right">
        <h1>${header.title || ''}</h1>

        <h2>${profile.title || 'Profile'}</h2>
        <p>${d.profile || ''}</p>

        <h2>${experienceTitle}</h2>
        ${(Array.isArray(d.experience) ? d.experience : []).map(exp => `
          <div class="job">
            <h3>${exp.role || ''}</h3>
            <p><em>${exp.period || ''}</em></p>
            <p>${exp.description || ''}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

async function init() {
  try {
    // Quick check: fetch won't work from file:// (browser security) — detect and warn
    if (location.protocol === 'file:') {
      const msg = 'Cannot fetch JSON when page is opened via file:// — run a simple local server (e.g. `python -m http.server` or `npx http-server`) and open the page via http://.';
      console.error(msg);
      document.getElementById('app').innerHTML = `<pre style="color:tomato">${msg}</pre>`;
      return;
    }

    // load templates and portfolio
    const templatesRaw = await loadJSON('templates/templates.json'); // relative to the page URL (test.html)
    const portfolio = await loadJSON('Portfolios/data.json');

    // templates.json may be an array or a single object
    const templates = Array.isArray(templatesRaw) ? templatesRaw : [templatesRaw];

    // robust template matching: check templateId (number/string) or id field
    const desiredId = portfolio.templateId;
    let template = templates.find(t =>
      (t.templateId != null && String(t.templateId) === String(desiredId)) ||
      (t.id != null && String(t.id) === String(desiredId))
    );

    if (!template) {
      console.warn(`Template with id "${desiredId}" not found — falling back to first template.`);
      template = templates[0];
    }

    if (!template) {
      throw new Error('No template found in templates.json');
    }

    // Get CSS from common keys (styles, css)
    const cssText = template.styles ?? template.css ?? template.style ?? '';

    // Inject CSS
    if (cssText) {
      const styleTag = document.createElement('style');
      // use textContent so backslashes and special chars are preserved
      styleTag.textContent = cssText;
      document.head.appendChild(styleTag);
    } else {
      console.info('No CSS found on template (styles/css property missing).');
    }

    // Render HTML and inject
    const html = renderResume(template, portfolio);
    document.getElementById('app').innerHTML = html;

  } catch (err) {
    console.error('Init error:', err);
    // show error to user in the app area for easier debugging
    document.getElementById('app').innerHTML = `<pre style="color:tomato">${err.message || err}</pre>`;
  }
}

window.addEventListener('DOMContentLoaded', init);
