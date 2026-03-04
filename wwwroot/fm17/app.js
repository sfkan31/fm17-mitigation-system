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

function renderMitigations(mitigations) {
  if (!Array.isArray(mitigations) || mitigations.length === 0) {
    mitigationsBody.innerHTML = '<tr><td colspan="7">No mitigations yet.</td></tr>';
    return;
  }

  mitigationsBody.innerHTML = mitigations
    .map((mitigation) => {
      const status = statusLabels[mitigation.status] ?? mitigation.status;
      return `
        <tr>
          <td>${mitigation.riskSourceId ?? ''}</td>
          <td>${mitigation.title ?? ''}</td>
          <td>${mitigation.description ?? ''}</td>
          <td>${mitigation.severityLevel ?? ''}</td>
          <td>${mitigation.mitigationOwner ?? ''}</td>
          <td>${formatDate(mitigation.dueDate)}</td>
          <td>${status}</td>
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

loadMitigations();
