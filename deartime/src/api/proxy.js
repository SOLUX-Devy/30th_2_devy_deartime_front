export async function setProxy(friendId, expiredAt) {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  const res = await fetch(`/api/friends/${friendId}/proxy`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expiredAt }),
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "대리인 설정 실패");
  }

  return json.data;
}