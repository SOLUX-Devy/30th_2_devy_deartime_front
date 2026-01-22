import SockJS from "sockjs-client";
import Stomp from "stompjs";

let stompClient = null;

/* ... fetchNotifications, readNotification 등 위쪽 코드는 그대로 유지 ... */
// (기존 API 함수들은 생략하겠습니다. 아래 connect 함수만 바꿔주세요)

/* WebSocket (SockJS + STOMP) 연결 */
export const connectNotificationSocket = ({ userId, onMessage }) => {
  console.log("👉 [1] 소켓 함수 진입"); // 1번 로그

  // 1. 이미 연결된 상태인지 확인
  if (stompClient && stompClient.connected) {
    console.log("👉 [STOP] 이미 연결되어 있어서 중단함");
    return;
  }

  // 2. 토큰과 userId 확인
  const token = localStorage.getItem("accessToken");
  console.log(`👉 [2] 정보 확인 - Token존재여부: ${!!token}, UserId: ${userId}`); // 2번 로그

  if (!token) {
    console.error("⛔ [ERROR] 토큰이 없어서 소켓 연결 불가");
    return;
  }
  if (!userId) {
    console.error("⛔ [ERROR] userId가 없어서 소켓 연결 불가 (로그인 상태 확인필요)");
    return;
  }

  console.log("👉 [3] SockJS 연결 시도 (/ws-stomp)"); // 3번 로그

  // 3. SockJS 연결
  // (Vite Proxy가 설정되어 있어야 http://localhost:8080/ws-stomp 로 넘어갑니다)
  const socket = new SockJS("/ws-stomp");
  stompClient = Stomp.over(socket);

  // 디버깅을 위해 로그 켜기
  stompClient.debug = (str) => {
    console.log(`[STOMP Debug] ${str}`);
  };

  console.log("👉 [4] STOMP connect 호출"); // 4번 로그

  // 4. STOMP 연결
  stompClient.connect(
    { Authorization: `Bearer ${token}` }, // 명세서대로 헤더 추가
    (frame) => {
      console.log("✅ [5] STOMP 연결 성공!", frame);

      // 5. 구독
      const subUrl = `/sub/notifications/${userId}`;
      console.log(`👉 [6] 구독 시작: ${subUrl}`);

      stompClient.subscribe(subUrl, (message) => {
        try {
          const notification = JSON.parse(message.body);
          console.log("🔔 [EVENT] 새 알림 도착:", notification);
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