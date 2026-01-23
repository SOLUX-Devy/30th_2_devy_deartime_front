export async function setProxy(friendId, expiredAt) {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const res = await fetch(`${apiBaseUrl}/api/friends/${friendId}/proxy`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expiredAt }),
  });

  const json = await res.json().catch(() => ({}));

  const success = json?.success ?? (json?.code === 200) ?? false;

  if (!res.ok || !success) {
    throw new Error(json?.message || "대리인 설정 실패");
  }

  return json?.data ?? null;
}