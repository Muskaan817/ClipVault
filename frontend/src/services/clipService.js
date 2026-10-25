
const API_URL = 'http://localhost:5001/api/clips';

export async function getClips() {
  const response = await fetch(API_URL);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to fetch clips');
  }

  return result.data;
}

export async function createClip(content, type) {
  const payload = { content };
  if (type) {
    payload.type = type;
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to create clip');
  }

  return result.data;
}

export async function updateClip(id, updates) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to update clip');
  }

  return result.data;
}

export async function deleteClip(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to delete clip');
  }

  return result;
}
