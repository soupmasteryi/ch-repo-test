import { API_BASE_URL } from "./config";

function placeholderPreviewBlob() {
  const binary = atob(PLACEHOLDER_PNG_BASE64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: "image/png" });
}

function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export async function createWhiteboard({
  token,
  userId,
  canvasData,
  previewDataUrl,
}) {
  const form = new FormData();
  form.append(
    "whiteboardData",
    new Blob([JSON.stringify({ createdAt: new Date().toISOString() })], {
      type: "application/json",
    }),
  );
  form.append(
    "preview",
    dataUrlToBlob(previewDataUrl),
  );
  form.append(
    "canvas",
    new Blob([canvasData ?? ""], { type: "application/octet-stream" })
  );

  let res;
  try {
    res = await fetch(`${API_BASE_URL}/users/${userId}/whiteboards`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
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
    throw new Error(
      data?.message || "Could not generate a code. Please try again.",
    );
  }

  return data;
}

export async function updateWhiteboard({ token, userId, code, canvasData }) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}/users/${userId}/whiteboards/${code}/canvas`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/octet-stream",
      },
      body: canvasData ?? "",
    });
  } catch {
    throw new Error("Unable to reach the server. Please try again.");
  }

  if (!res.ok) {
    let data = null;
    try {
      data = await res.json();
    } catch {
    }
    throw new Error(
      data?.message || "Could not save the whiteboard. Please try again.",
    );
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
  }

  return data;
}

export async function listWhiteboards({ token, userId }) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}/users/${userId}/whiteboards`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
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
    throw new Error(
      data?.message || "Could not load your whiteboards. Please try again.",
    );
  }

  return Array.isArray(data) ? data : data?.whiteboards ?? [];
}

export async function deleteWhiteboard({ token, userId, id }) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}/users/${userId}/whiteboards/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error("Unable to reach the server. Please try again.");
  }

  if (!res.ok) {
    let data = null;
    try {
      data = await res.json();
    } catch {
    }
    throw new Error(
      data?.message || "Could not delete the whiteboard. Please try again.",
    );
  }
}

export async function fetchPreview({ token, previewUrl }) {
  const url = `${API_BASE_URL}${previewUrl.startsWith("/") ? "" : "/"}${previewUrl}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error("Could not load preview.");
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export async function getWhiteboard({ token, userId, code }) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}/users/${userId}/whiteboards/${code}/canvas`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch(ex) {
    throw ex;
  }

  if (!res.ok) {
    let data = null;
    try {
      data = await res.json();
    } catch {
    }
    throw new Error(
      data?.message ||
        "Could not load that whiteboard. Please check the code and try again.",
    );
  }

  const canvasData = await res.text();
  return { id: code, canvasData };
}
