const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function updateFriendStatus(friendId, status) {
  const token = localStorage.getItem("accessToken");
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const res = await fetch(`${apiBaseUrl}/api/friends/${friendId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  const json = await res.json();
  if (!res.ok || !json?.success) {
    throw new Error(json?.message || "친구 상태 변경 실패");
  }
  return json;
}
