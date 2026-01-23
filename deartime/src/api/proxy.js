// src/api/proxy.js

export async function setProxy(friendId, expiredAt) {
  console.log("[setProxy] called", { friendId, expiredAt });

  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.log("[setProxy] no token");
    throw new Error("로그인이 필요합니다.");
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  console.log("[setProxy] apiBaseUrl:", apiBaseUrl);

  const isValidFormat =
    typeof expiredAt === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(expiredAt);

  if (!isValidFormat) {
    console.log("[setProxy] invalid expiredAt format:", expiredAt);
    throw new Error(
      "expiredAt 형식이 올바르지 않습니다. (yyyy-MM-dd'T'HH:mm:ss)",
    );
  }

  console.log("[setProxy] fetch start");

  const res = await fetch(`${apiBaseUrl}/api/friends/${friendId}/proxy`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expiredAt }),
  });

  console.log("[setProxy] fetch response status:", res.status);

  const rawText = await res.text();
  console.log("[setProxy] rawText:", rawText);

  let json = null;
  try {
    json = rawText ? JSON.parse(rawText) : null;
  } catch (e) {
    console.log("[setProxy] JSON parse fail", e);
  }

  if (res.ok) {
    console.log("[setProxy] success", json);
    return json?.data ?? null;
  }

  console.log("[setProxy] fail", json);
  throw new Error(json?.message || "대리인 설정 실패");
}

export async function removeProxy(proxyUserId) {
  console.log("[removeProxy] called", { proxyUserId });

  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.log("[removeProxy] no token");
    throw new Error("로그인이 필요합니다.");
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  console.log("[removeProxy] apiBaseUrl:", apiBaseUrl);

  console.log("[removeProxy] fetch start");

  const res = await fetch(`${apiBaseUrl}/api/friends/proxy/${proxyUserId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("[removeProxy] fetch response status:", res.status);

  const rawText = await res.text();
  console.log("[removeProxy] rawText:", rawText);

  let json = null;
  try {
    json = rawText ? JSON.parse(rawText) : null;
  } catch (e) {
    console.log("[removeProxy] JSON parse fail", e);
  }

  if (res.ok) {
    console.log("[removeProxy] success");
    return null;
  }

  console.log("[removeProxy] fail", json);
  throw new Error(json?.message || "대리인 해제 실패");
}
