const REPORTS_URL = 'data/reports.json';

function getReportId() {
  return new URLSearchParams(window.location.search).get('id')?.trim().toUpperCase() || '';
}

function text(value, fallback = '—') {
  return value === null || value === undefined || String(value).trim() === '' ? fallback : String(value);
}

function safeClass(value) {
  return /pass|clean|unlocked|excellent|off/i.test(String(value || '')) ? 'pass' : '';
}

function detailRows(items) {
  return items
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
    .map(([label, value]) => `
      <div class="detail-row">
        <div class="detail-label">${label}</div>
        <div class="detail-value ${safeClass(value)}">${text(value)}</div>
      </div>
    `).join('');
}

function galleryMarkup(photos) {
  if (!Array.isArray(photos) || photos.length === 0) {
    return '<div class="empty-gallery">Inspection photos will appear here once they are synced from the Loopi inspection workflow.</div>';
  }
  return `
    <div class="gallery-grid">
      ${photos.map(photo => `
        <figure class="gallery-card">
          <img src="${photo.src}" alt="${text(photo.label, 'Device photo')}" loading="lazy">
          <figcaption class="gallery-label">${text(photo.label, 'Device photo')}</figcaption>
        </figure>
      `).join('')}
    </div>
  `;
}

function renderReport(report) {
  document.title = `${report.reportId} | Loopi Inspection Report`;

  const app = document.getElementById('reportApp');
  app.innerHTML = `
    <section class="report-hero">
      <div class="report-kicker">Loopi Verified</div>
      <h1>${text(report.title, 'Device Inspection Report')}</h1>
      <div class="report-subtitle">${text(report.subtitle)}</div>
      <div class="report-id">Report ${text(report.reportId)}</div>
    </section>

    <section class="status-strip" aria-label="Inspection highlights">
      <div class="status-item"><div class="status-label">Lock status</div><div class="status-value ${safeClass(report.highlights?.carrierLock)}">${text(report.highlights?.carrierLock)}</div></div>
      <div class="status-item"><div class="status-label">IMEI status</div><div class="status-value ${safeClass(report.highlights?.imei)}">${text(report.highlights?.imei)}</div></div>
      <div class="status-item"><div class="status-label">Battery</div><div class="status-value">${text(report.highlights?.batteryHealth)}</div></div>
      <div class="status-item"><div class="status-label">Condition</div><div class="status-value">${text(report.highlights?.condition)}</div></div>
    </section>

    <section class="report-grid">
      <article class="report-card">
        <h2>Quick Summary</h2>
        <div class="metric-grid">
          <div class="metric"><div class="metric-label">Device</div><div class="metric-value">${text(report.quickSummary?.device)}</div></div>
          <div class="metric"><div class="metric-label">Battery Health</div><div class="metric-value">${text(report.quickSummary?.batteryHealth)}</div></div>
          <div class="metric"><div class="metric-label">Condition</div><div class="metric-value">${text(report.quickSummary?.condition)}</div></div>
          <div class="metric"><div class="metric-label">Defects</div><div class="metric-value">${text(report.quickSummary?.defects)}</div></div>
        </div>
      </article>

      <article class="report-card">
        <h2>Device Information</h2>
        <div class="detail-list">
          ${detailRows([
            ['Serial Number', report.deviceInformation?.serialNumber],
            ['IMEI', report.deviceInformation?.imei]
          ])}
        </div>
      </article>

      <article class="report-card full">
        <h2>Functional Check</h2>
        <div class="detail-list">
          ${detailRows([
            ['Cycle Count', report.functionalCheck?.cycleCount],
            ['Carrier Lock', report.functionalCheck?.carrierLock],
            ['Blacklist', report.functionalCheck?.blacklist],
            ['Activation Lock', report.functionalCheck?.activationLock],
            ['Face ID', report.functionalCheck?.faceId],
            ['Display / Touchscreen', report.functionalCheck?.displayTouchscreen],
            ['Front Camera', report.functionalCheck?.frontCamera],
            ['Rear Camera', report.functionalCheck?.rearCamera],
            ['Microphone', report.functionalCheck?.microphone],
            ['Speaker', report.functionalCheck?.speaker],
            ['Wi-Fi / Bluetooth / Cellular', report.functionalCheck?.connectivity],
            ['Charging Port / Wireless Charging', report.functionalCheck?.charging],
            ['Buttons', report.functionalCheck?.buttons]
          ])}
        </div>
      </article>

      <article class="report-card full">
        <h2>Cosmetic Condition</h2>
        <div class="detail-list">
          ${detailRows([
            ['Screen', report.cosmeticCondition?.screen],
            ['Frame', report.cosmeticCondition?.frame],
            ['Back Glass', report.cosmeticCondition?.backGlass]
          ])}
        </div>
      </article>

      ${report.publicNotes ? `
      <article class="report-card full">
        <h2>Inspection Notes</h2>
        <p class="muted">${report.publicNotes}</p>
      </article>` : ''}

      <article class="report-card full">
        <h2>Device Gallery</h2>
        ${galleryMarkup(report.photos)}
      </article>

      <article class="report-card full">
        <h2>Disclaimer</h2>
        <div class="disclaimer">${text(report.disclaimer)}</div>
      </article>

      <article class="report-card full report-about">
        <p class="eyebrow">About Loopi</p>
        <h2>A clearer second life for devices.</h2>
        <p>Learn how Loopi documents pre-owned devices and how to get in touch.</p>
        <a class="text-link" href="about.html">About Loopi →</a>
      </article>
    </section>
  `;
}

function renderError(title, message) {
  document.getElementById('reportApp').innerHTML = `
    <section class="error-panel">
      <h1>${title}</h1>
      <p>${message}</p>
      <a class="text-link" href="index.html">Return to Loopi →</a>
    </section>
  `;
}

async function init() {
  const reportId = getReportId();
  if (!reportId) {
    renderError('Report ID required', 'Open this page from a Loopi QR code or enter a Report ID from the home page.');
    return;
  }

  try {
    const response = await fetch(REPORTS_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load report data.');
    const reports = await response.json();
    const report = reports[reportId];
    if (!report) {
      renderError('Report not found', `No published Loopi report was found for ${reportId}.`);
      return;
    }
    renderReport(report);
  } catch (error) {
    renderError('Unable to load report', 'Please try again later.');
  }
}

init();