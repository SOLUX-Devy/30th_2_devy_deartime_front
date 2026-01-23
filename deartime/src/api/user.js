// src/api/user.js
export async function fetchMe() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) throw new Error("accessToken 없음");

  const res = await fetch(`${apiBaseUrl}/api/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const json = await res.json();

  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || "users/me 실패");
  }

  return json?.data; // { userId, email, nickname, ... }
}
