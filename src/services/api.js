// Cloudless AI Client Service Layer connecting React components to FastAPI Backend

const API_BASE = '/api/v1';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`Health check returned status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend connection warning:', err);
    return { status: 'fallback_mode', error: err.message };
  }
}

export async function submitReconstructionJob(payload) {
  const res = await fetch(`${API_BASE}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to submit job: ${res.statusText}`);
  return await res.json();
}

export async function fetchJobStatus(jobId) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}`);
  if (!res.ok) throw new Error(`Failed to fetch job status: ${res.statusText}`);
  return await res.json();
}

export async function fetchJobResults(jobId) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}/results`);
  if (!res.ok) throw new Error(`Failed to fetch job results: ${res.statusText}`);
  return await res.json();
}

export async function fetchAvailableModels() {
  const res = await fetch(`${API_BASE}/models`);
  if (!res.ok) throw new Error('Failed to fetch models');
  return await res.json();
}

export async function fetchBenchmarkComparison() {
  const res = await fetch(`${API_BASE}/benchmarks`);
  if (!res.ok) throw new Error('Failed to fetch benchmarks');
  return await res.json();
}

export async function submitEvaluation(payload) {
  const res = await fetch(`${API_BASE}/evaluations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to run evaluation');
  return await res.json();
}
