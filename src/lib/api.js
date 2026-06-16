export const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ||
  'https://shadi-production.up.railway.app/api';

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL?.replace(/\/$/, '') ||
  API_BASE.replace(/\/api$/, '');

export async function readJsonResponse(response) {
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    return {
      success: false,
      message: payload.message || `Request failed with status ${response.status}`,
      ...payload,
    };
  }

  return payload;
}

