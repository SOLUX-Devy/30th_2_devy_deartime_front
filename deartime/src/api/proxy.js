export async function setProxy(friendId, expiredAt) {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("로그인이 필요합니다.");

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const isValidFormat =
    typeof expiredAt === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(expiredAt);

  if (!isValidFormat) {
    throw new Error("expiredAt 형식이 올바르지 않습니다. (yyyy-MM-dd'T'HH:mm:ss)");
  }

  const res = await fetch(`${apiBaseUrl}/api/friends/${friendId}/proxy`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expiredAt }),
  });

  const json = await res.json().catch(() => ({}));

  const ok = res.ok && json?.success === true;

  if (!ok) {
    const msg = json?.message || "대리인 설정 실패";
    const detail =
      typeof json?.data === "string" && json.data.trim().length > 0
        ? json.data
        : null;

    throw new Error(detail ? `${msg} (${detail})` : msg);
  }

  return json?.data ?? null;
}