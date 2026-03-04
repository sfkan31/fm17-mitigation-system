const mitigationForm = document.getElementById('mitigation-form');
const mitigationsBody = document.getElementById('mitigations-body');
const formMessage = document.getElementById('form-message');

const statusLabels = {
  0: 'Open',
  1: 'InProgress',
  2: 'Closed'
};

function showMessage(text, isError = false) {
  formMessage.textContent = text;
  formMessage.classList.toggle('error', isError);
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString();
}

function isOverdue(mitigation) {
  if (!mitigation?.dueDate || Number(mitigation.status) === 2) {
    return false;
  }

  const dueDate = new Date(mitigation.dueDate);
  if (Number.isNaN(dueDate.getTime())) {
    return false;
  }

  const today = new Date();
  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return dueDate < today;
}

function getStatusClass(status) {
  if (Number(status) === 2) {
    return 'status-closed';
  }

  if (Number(status) === 1) {
    return 'status-in-progress';
  }

  return 'status-open';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderActions(mitigation) {
  const id = mitigation.id;

  if (!id) {
    return '-';
  }

  const actionButtons = [];

  if (Number(mitigation.status) !== 1) {
    actionButtons.push(`<button type="button" class="btn-secondary js-set-status" data-id="${id}" data-status="1">In Progress</button>`);
  }

  if (Number(mitigation.status) !== 2) {
    actionButtons.push(`<button type="button" class="btn-success js-set-status" data-id="${id}" data-status="2">Close</button>`);
  }

  if (actionButtons.length === 0) {
    return '-';
  }

  return `<div class="row-actions">${actionButtons.join('')}</div>`;
}

function renderMitigations(mitigations) {
  if (!Array.isArray(mitigations) || mitigations.length === 0) {
    mitigationsBody.innerHTML = '<tr><td colspan="7">No mitigations yet.</td></tr>';
    return;
  }

  mitigationsBody.innerHTML = mitigations
    .map((mitigation) => {
      const status = statusLabels[mitigation.status] ?? mitigation.status;
      const statusClass = getStatusClass(mitigation.status);
      const overdueClass = isOverdue(mitigation) ? 'overdue' : '';

      return `
        <tr class="${overdueClass}">
          <td>${escapeHtml(mitigation.riskSourceId)}</td>
          <td>${escapeHtml(mitigation.title)}</td>
          <td>${escapeHtml(mitigation.severityLevel)}</td>
          <td>${escapeHtml(mitigation.mitigationOwner)}</td>
          <td>${formatDate(mitigation.dueDate)}</td>
          <td><span class="status-pill ${statusClass}">${escapeHtml(status)}</span></td>
          <td>${renderActions(mitigation)}</td>
        </tr>
      `;
    })
    .join('');
}

async function loadMitigations() {
  mitigationsBody.innerHTML = '<tr><td colspan="7">Loading...</td></tr>';

  try {
    const response = await fetch('/api/mitigations');
    if (!response.ok) {
      throw new Error(`Failed to load mitigations (${response.status})`);
    }

    const mitigations = await response.json();
    renderMitigations(mitigations);
  } catch (error) {
    mitigationsBody.innerHTML = '<tr><td colspan="7">Unable to load mitigations.</td></tr>';
    showMessage(error.message, true);
  }
}

function validateForm(data) {
  if (!data.riskSourceId.trim()) {
    return 'RiskSourceId is required.';
  }

  if (!data.title.trim()) {
    return 'Title is required.';
  }

  const severity = Number(data.severityLevel);
  if (!Number.isInteger(severity) || severity < 1 || severity > 5) {
    return 'SeverityLevel must be an integer between 1 and 5.';
  }

  return '';
}

mitigationForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  showMessage('');

  const formData = new FormData(mitigationForm);
  const payload = {
    riskSourceId: String(formData.get('riskSourceId') ?? ''),
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? ''),
    severityLevel: Number(formData.get('severityLevel')),
    mitigationOwner: String(formData.get('mitigationOwner') ?? ''),
    dueDate: formData.get('dueDate') ? new Date(String(formData.get('dueDate'))).toISOString() : null,
    status: Number(formData.get('status') ?? 0)
  };

  const validationError = validateForm(payload);
  if (validationError) {
    showMessage(validationError, true);
    return;
  }

  try {
    const response = await fetch('/api/mitigations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Failed to create mitigation (${response.status})`);
    }

    mitigationForm.reset();
    showMessage('Mitigation created successfully.');
    await loadMitigations();
  } catch (error) {
    showMessage(error.message, true);
  }
});

mitigationsBody.addEventListener('click', async (event) => {
  const button = event.target.closest('.js-set-status');
  if (!button) {
    return;
  }

  const id = button.dataset.id;
  const nextStatus = Number(button.dataset.status);

  if (!id || Number.isNaN(nextStatus)) {
    return;
  }

  showMessage('');

  try {
    const existingResponse = await fetch(`/api/mitigations/${id}`);
    if (!existingResponse.ok) {
      throw new Error(`Failed to load mitigation ${id} (${existingResponse.status})`);
    }

    const mitigation = await existingResponse.json();
    mitigation.status = nextStatus;

    const updateResponse = await fetch(`/api/mitigations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mitigation)
    });

    if (!updateResponse.ok) {
      throw new Error(`Failed to update mitigation (${updateResponse.status})`);
    }

    showMessage(`Mitigation moved to ${statusLabels[nextStatus]}.`);
    await loadMitigations();
  } catch (error) {
    showMessage(error.message, true);
  }
});

loadMitigations();
