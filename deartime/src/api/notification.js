import SockJS from "sockjs-client";
import Stomp from "stompjs";

let stompClient = null;

// [GET] 알림 목록 조회 
export const fetchNotifications = async ({ page = 0, size = 20 }) => {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`/api/notifications?page=${page}&size=${size}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("알림 조회 실패");
  return res.json();
};

// [PATCH] 알림 읽음 처리
export const readNotification = async (id) => {
  const token = localStorage.getItem("accessToken");
  const res = await fetch(`/api/notifications/${id}/read`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("알림 읽음 처리 실패");
  return res.json();
};

export const connectNotificationSocket = ({ userId, onMessage }) => {
  if (stompClient && stompClient.connected) return;

  const token = localStorage.getItem("accessToken");
  if (!token || !userId) return;

  // 1. SockJS 엔드포인트 연결 (/ws-stomp)
  const socket = new SockJS("/ws-stomp"); 
  stompClient = Stomp.over(socket);

  // 2. STOMP 연결 (헤더에 토큰 포함)
  stompClient.connect(
    { Authorization: `Bearer ${token}` },
    (frame) => {
      console.log("[STOMP] Connected:", frame);

      // 3. 구독 (/sub/notifications/{userId})
      stompClient.subscribe(`/sub/notifications/${userId}`, (message) => {
        try {
          const notification = JSON.parse(message.body);
          console.log("[STOMP] 새 알림:", notification);
          onMessage?.(notification);
        } catch (e) {
          console.error("[STOMP] JSON Parse Error", e);
        }
      });
    },
    (error) => {
      console.error("[STOMP] Connection Error:", error);
    }
  );
};

export const disconnectNotificationSocket = () => {
  if (stompClient) {
    stompClient.disconnect(() => {
      console.log("[STOMP] Disconnected");
    });
    stompClient = null;
  }
};