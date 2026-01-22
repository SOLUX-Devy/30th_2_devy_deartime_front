let socket = null;

// 알림 목록 조회
export const fetchNotifications = async ({ page = 0, size = 20 }) => {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(
    `/api/notifications?page=${page}&size=${size}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) throw new Error("알림 조회 실패");
  return res.json();
};

// 알림 읽음 처리 
export const readNotification = async (id) => {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`/api/notifications/${id}/read`, {
    method: "PATCH", 
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("알림 읽음 처리 실패");
  }

  return res.json();
};

/* WebSocket */
export const connectNotificationSocket = ({ onMessage }) => {
  if (socket) return;

  const token = localStorage.getItem("accessToken");
  // 웹소켓 URL은 환경변수나 설정에 맞게 조정하세요
  const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8080"; 

  socket = new WebSocket(
    `${wsUrl}/ws/notifications?token=${token}`
  );

  socket.onopen = () => {
    console.log("[WS] notification connected");
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage?.(data);
    } catch (e) {
      console.error("[WS] Parse error", e);
    }
  };

  socket.onclose = () => {
    socket = null;
    console.log("[WS] notification disconnected");
  };
};

export const disconnectNotificationSocket = () => {
  socket?.close();
  socket = null;
};