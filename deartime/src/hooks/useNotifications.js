import { useEffect, useState, useCallback } from "react";
import {
  fetchNotifications,
  connectNotificationSocket,
  disconnectNotificationSocket,
  readNotification,
} from "../api/notification";
import { updateFriendStatus } from "../api/friend"; 
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

  const splitNotiContent = useCallback((noti) => {
  if (!noti) return { title: "", body: "", sub: null };

  const type = String(noti.type || "").toUpperCase();
  const content = String(noti.content || "");
  const sender = noti.senderNickname || "누군가";

  // ✉️ 편지
  if (type === "LETTER_RECEIVED") {
    const m = content.match(/^(.+?님이)\s*(.*)$/);
    return {
      title: m ? m[1] : `${sender}님이`,
      body: m ? m[2] : "편지를 보냈습니다.",
      sub: noti.contentTitle || null,
    };
  }

  // ⏳ 타임캡슐 도착
  if (type === "CAPSULE_RECEIVED") {
    return {
      title: `${sender}님이`,
      body: "새로운 타임캡슐을 보냈습니다.",
      sub: null,
    };
  }

  // 🔓 타임캡슐 열림
  if (type === "CAPSULE_OPENED") {
    const capsuleTitle = noti.contentTitle || content || null;
    return {
      title: "타임캡슐이 열렸습니다!",
      body: "",          // 필요하면 여기 문구 넣어도 됨
      sub: capsuleTitle, // "어렸을 때의 추억" 같은 제목
    };
  }

  // 👥 나머지(친구요청/수락 등): 기존 규칙
  const m = content.match(/^(.+?님이)\s*(.*)$/);
  if (!m) return { title: content, body: "", sub: null };

  return { title: m[1], body: m[2] || "", sub: null };
}, []);

  const getFriendIdFromNoti = (noti) => {
  return noti?.targetId ?? null; // ✅ 지금 로그에 존재
};

const acceptFriendRequest = async (noti) => {
  try {
    const friendId = getFriendIdFromNoti(noti);
    if (!friendId) throw new Error("friendId를 알림에서 찾을 수 없습니다 (targetId 없음)");

    await updateFriendStatus(friendId, "accepted");
    setNotifications((prev) => prev.filter((n) => n.id !== noti.id));
  } catch (e) {
    console.error("[Noti] accept failed", e);
  }
};

const rejectFriendRequest = async (noti) => {
  try {
    const friendId = getFriendIdFromNoti(noti);
    if (!friendId) throw new Error("friendId를 알림에서 찾을 수 없습니다 (targetId 없음)");

    await updateFriendStatus(friendId, "rejected");
    setNotifications((prev) => prev.filter((n) => n.id !== noti.id));
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
    isFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
  };
}
