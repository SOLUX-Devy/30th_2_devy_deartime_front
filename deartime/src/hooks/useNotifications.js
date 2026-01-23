import { useEffect, useState, useCallback } from "react";
import {
  fetchNotifications,
  connectNotificationSocket,
  disconnectNotificationSocket,
  readNotification,
} from "../api/notification";
import { requestFriend } from "../api/friend"; 
import friendIcon from "../assets/default_profile2.png?url";
import letterIcon from "../assets/letter.png?url";
import capsuleIcon from "../assets/timecapsule.png?url";

export function useNotifications({ navigate, userId }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  /* =========================
      아이콘 매핑
  ========================= */
  const getNotiIcon = useCallback((type) => {
    const t = String(type || "").toUpperCase();

    if (t === "LETTER_RECEIVED") return letterIcon;
    if (t === "CAPSULE_RECEIVED" || t === "CAPSULE_OPENED") return capsuleIcon;
    if (t === "FRIEND_REQUEST" || t === "FRIEND_ACCEPT") return friendIcon;

    return friendIcon;
  }, []);

  /* =========================
      타입 판별
  ========================= */
  const isFriendRequest = useCallback(
    (noti) => String(noti?.type || "").toUpperCase() === "FRIEND_REQUEST",
    []
  );

  /* =========================
      시간 포맷
  ========================= */
  const formatTime = useCallback((dateString) => {
    if (!dateString) return "";
    const diff = (new Date() - new Date(dateString)) / 1000 / 60;

    if (diff < 1) return "방금 전";
    if (diff < 60) return `${Math.floor(diff)}분 전`;
    if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;

    return dateString.slice(0, 10).replace(/-/g, ".");
  }, []);

  /* =========================
      알림 내용 분리
  ========================= */
  const splitNotiContent = useCallback((noti) => {
    if (!noti) return { title: "", body: "", sub: null };

    const type = String(noti.type || "").toUpperCase();
    const content = String(noti.content || "");

    // ✉️ 편지
    if (type === "LETTER_RECEIVED") {
      const sender = noti.senderNickname || "누군가";
      const m = content.match(/^(.+?님이)\s*(.*)$/);

      return {
        title: m ? m[1] : `${sender}님이`,
        body: m ? m[2] : "편지를 보냈습니다.",
        sub: noti.contentTitle || null,
      };
    }

    // 👥 나머지
    const m = content.match(/^(.+?님이)\s*(.*)$/);
    if (!m) return { title: content, body: "", sub: null };

    return { title: m[1], body: m[2] || "", sub: null };
  }, []);

  /* =========================
      친구 요청 수락
  ========================= */
  const acceptFriendRequest = async (noti) => {
    try {
      await requestFriend({ friendId: noti.senderId });
      await readNotification(noti.id);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === noti.id
            ? { ...n, isRead: true, handled: true }
            : n
        )
      );
    } catch (e) {
      console.error("[Noti] accept failed", e);
      alert(e.message || "친구 요청 수락에 실패했습니다.");
    }
  };

  /* =========================
      친구 요청 거절
      (서버 거절 API 없으므로 읽음 처리만)
  ========================= */
  const rejectFriendRequest = async (noti) => {
    try {
      await readNotification(noti.id);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === noti.id
            ? { ...n, isRead: true, handled: true }
            : n
        )
      );
    } catch (e) {
      console.error("[Noti] reject failed", e);
    }
  };

  /* =========================
      알림 조회 + 소켓
  ========================= */
  useEffect(() => {
    if (!userId) return;

    let mounted = true;

    fetchNotifications({ page: 0, size: 20 })
      .then((res) => {
        if (mounted && res?.data?.content) {
          setNotifications(res.data.content);
        }
      })
      .catch((err) => console.error("[Noti] Fetch error:", err));

    connectNotificationSocket({
      userId,
      onMessage: (newNoti) => {
        setNotifications((prev) => [newNoti, ...prev]);
      },
    });

    return () => {
      mounted = false;
      disconnectNotificationSocket();
    };
  }, [userId]);

  /* =========================
      알림 클릭 처리
  ========================= */
  const onClickNotification = async (noti) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === noti.id ? { ...n, isRead: true } : n
      )
    );

    try {
      if (!noti.isRead) {
        await readNotification(noti.id);
      }
    } catch (e) {
      console.error("[Noti] Read failed", e);
    }

    setIsOpen(false);

    switch (noti.type) {
      case "LETTER_RECEIVED":
        navigate("/letterbox");
        break;
      case "CAPSULE_RECEIVED":
      case "CAPSULE_OPENED":
        navigate("/timecapsule");
        break;
      case "FRIEND_REQUEST":
      case "FRIEND_ACCEPT":
        navigate("/friend");
        break;
      default:
        break;
    }
  };

  const hasUnread = notifications.some((n) => !n.isRead);

  /* =========================
      EXPORT
  ========================= */
  return {
    notifications,
    isOpen,
    setIsOpen,
    hasUnread,

    onClickNotification,
    formatTime,
    getNotiIcon,
    splitNotiContent,

    // ⭐ 친구 요청 관련
    isFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
  };
}
