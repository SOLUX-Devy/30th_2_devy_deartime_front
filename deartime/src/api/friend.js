const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * 친구 요청 / 친구 요청 수락
 * - 상대방이 먼저 요청한 경우 자동으로 accepted 처리됨
 * POST /api/friends
 */
export async function requestFriend({ friendId }) {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  const res = await fetch(`${API_BASE_URL}/api/friends`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ friendId }),
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "친구 요청에 실패했습니다.");
  }

  return json.data;
}
