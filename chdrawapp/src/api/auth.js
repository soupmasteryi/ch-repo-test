import { API_BASE_URL } from "./config";

async function postCredentials(path, { email, password }) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error("Unable to reach the server. Please try again.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
  }

  if (!res.ok) {
    throw new Error(data?.message || "Something went wrong. Please try again.");
  }

  return data;
}

export function login(credentials) {
  return postCredentials("/auth/login", credentials);
}

export function register(credentials) {
  return postCredentials("/auth/register", credentials);
}

export async function logout(token) {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
  }
}
