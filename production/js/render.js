// robust loader that expects templates/templates.json to be an array
async function loadJSON(file) {
  const res = await fetch(file);
  if (!res.ok) throw new Error(`Failed to fetch ${file} — ${res.status} ${res.statusText}`);
  return res.json();
}

function renderResume(template, portfolio) {
  const d = portfolio.data || {};
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
        ${d.photoUrl ? `<img class="left__photo" src="assets/${d.photoUrl}" alt="${d.name || ''}">` : ''}
        <div class="left__info">
          <div class="left__name">${d.name || ''}</div>
          <div class="left__subtitle">${d.title || ''}</div>

          <div class="left__sectionTitle">${contact.title || 'Contact'}</div>
          <ul class="left__list">
            ${d.location ? `<li>${d.location}</li>` : ''}
            ${d.email ? `<li>${d.email}</li>` : ''}
            ${d.phone ? `<li>${d.phone}</li>` : ''}
            ${d.website ? `<li>${d.website}</li>` : ''}
          </ul>

          <div class="left__sectionTitle">${educationTitle}</div>
          <ul class="left__list">
            ${(Array.isArray(d.education) ? d.education : []).map(e => `<li><strong>${e.institution || ''}</strong><br><small>${e.period || ''}</small></li>`).join('')}
          </ul>

          <div class="left__sectionTitle">${skillsTitle}</div>
          <div style="width:100%; margin-top:10px;">
            ${(Array.isArray(d.skills) ? d.skills : []).map(s => `<span class="left__skill">${s}</span>`).join('')}
          </div>
        </div>
      </div>

      <div class="right">
        <div class="right__header">
          <div>
            <h1>${header.title || d.name || ''}</h1>
            <div class="right__titleSmall">${d.title || ''}</div>
          </div>
        </div>

        <div class="sectionTitle">${profile.title || 'Profile'}</div>
        <div class="profile"><p>${d.profile || ''}</p></div>

        <div class="sectionTitle">${experienceTitle}</div>
        ${(Array.isArray(d.experience) ? d.experience : []).map(exp => `
          <div class="job">
            <h3>${exp.role || ''}</h3>
            <div class="meta">${exp.period || ''}${exp.company ? ' • ' + exp.company : ''}</div>
            <p>${exp.description || ''}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

async function init() {
  try {
    if (location.protocol === 'file:') {
      const msg = 'Please serve this over http(s) (e.g. run a local server) — fetch() won’t work from file://';
      document.getElementById('app').innerHTML = `<pre style="color:tomato">${msg}</pre>`;
      console.error(msg);
      return;
    }

    const templatesRaw = await loadJSON('templates/templates.json');
    const templates = Array.isArray(templatesRaw) ? templatesRaw : [templatesRaw];
    const portfolio = await loadJSON('Portfolios/data.json');

    const desiredId = portfolio.templateId;
    let template = templates.find(t => (t.templateId != null && String(t.templateId) === String(desiredId)) || (t.id != null && String(t.id) === String(desiredId)));

    if (!template) template = templates[0];
    if (!template) throw new Error('No template available in templates/templates.json');

    const cssText = template.styles ?? template.css ?? '';
    if (cssText) {
      const styleTag = document.createElement('style');
      styleTag.textContent = cssText;
      document.head.appendChild(styleTag);
    }

    const html = renderResume(template, portfolio);
    document.getElementById('app').innerHTML = html;

  } catch (err) {
    console.error(err);
    document.getElementById('app').innerHTML = `<pre style="color:tomato">${err.message || err}</pre>`;
  }
}

window.addEventListener('DOMContentLoaded', init);
