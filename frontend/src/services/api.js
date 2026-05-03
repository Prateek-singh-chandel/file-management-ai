const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : { detail: await response.text() };

  if (!response.ok) {
    const detail = typeof payload.detail === 'string' ? payload.detail : 'Request failed';
    throw new Error(detail);
  }

  return payload;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function scanFolder(path) {
  return requestJson('/scan-folder', {
    method: 'POST',
    body: JSON.stringify({ path }),
  });
}

export function organizeFolder(path) {
  return requestJson('/organize', {
    method: 'POST',
    body: JSON.stringify({ path }),
  });
}

export function undoFolder(path) {
  return requestJson('/undo', {
    method: 'POST',
    body: JSON.stringify(path ? { path } : {}),
  });
}

export function getStats(path) {
  return requestJson(`/stats?path=${encodeURIComponent(path)}`);
}

export function getAiSuggestions(path) {
  return requestJson(`/ai-suggestions?path=${encodeURIComponent(path)}`);
}
