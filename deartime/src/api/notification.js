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

/* WebSocket (SockJS + STOMP) 연결 */
export const connectNotificationSocket = ({ userId, onMessage }) => {

  // 1. 이미 연결된 상태인지 확인
  if (stompClient && stompClient.connected) {
    return;
  }

  // 2. 토큰과 userId 확인
  const token = localStorage.getItem("accessToken");

  if (!token) {
    console.error("[ERROR] 토큰이 없어서 소켓 연결 불가");
    return;
  }
  if (!userId) {
    console.error("[ERROR] userId가 없어서 소켓 연결 불가 (로그인 상태 확인필요)");
    return;
  }

  // 3. SockJS 연결
  const socket = new SockJS("https://api.deartime.kr/ws-stomp");
  stompClient = Stomp.over(socket);

  // 4. STOMP 연결
  stompClient.connect(
    { Authorization: `Bearer ${token}` }, // 명세서대로 헤더 추가
    (frame) => {
      console.log("✅ STOMP 연결 성공!", frame);

      // 5. 구독
      const subUrl = `/sub/notifications/${userId}`;
      console.log(`👉 구독 시작: ${subUrl}`);

      stompClient.subscribe(subUrl, (message) => {
        try {
          const notification = JSON.parse(message.body);
          console.log("🔔 새 알림 도착:", notification);
          onMessage?.(notification);
        } catch (e) {
          console.error("JSON Parse Error", e);
        }
      });
    },
    (error) => {
      console.error("❌ [ERROR] STOMP 연결 실패:", error);
    }
  );
};

export const disconnectNotificationSocket = () => {
  if (stompClient) {
    stompClient.disconnect(() => {
      console.log("👋 [WS] Disconnected");
    });
    stompClient = null;
  }
};