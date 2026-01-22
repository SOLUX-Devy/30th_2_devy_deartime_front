import { useEffect, useState, useCallback } from "react";
import {
  fetchNotifications,
  connectNotificationSocket,
  disconnectNotificationSocket,
  readNotification,
} from "../api/notification";
import "../styles/header.css";
import friendIcon from "../assets/default_profile.png"; 
import letterIcon from "../assets/letter.svg";
import capsuleIcon from "../assets/timecapsule.svg";

export function useNotifications({ navigate, userId }) { // userId 추가
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const getNotiIcon = useCallback((type) => {
    switch (type) {
      case "LETTER_RECEIVED":
        return letterIcon;
      case "CAPSULE_RECEIVED":
      case "CAPSULE_OPENED":
        return capsuleIcon;
      case "FRIEND_REQUEST":
      case "FRIEND_ACCEPT":
        return friendIcon;
      default:
        return friendIcon;
    }
  }, []);

  /* UTIL: 시간 포맷 */
  const formatTime = useCallback((dateString) => {
    if (!dateString) return "";
    const diff = (new Date() - new Date(dateString)) / 1000 / 60;
    if (diff < 1) return "방금 전";
    if (diff < 60) return `${Math.floor(diff)}분 전`;
    if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;
    return dateString.slice(0, 10).replace(/-/g, ".");
  }, []);

  const splitNotiContent = useCallback((content) => {
    if (!content) return { title: "", body: "" };
    // "닉네임님이 ..." 형태 파싱
    const match = content.match(/(.+님이)\s(.+)/);
    if (!match) return { title: content, body: null };
    return { title: match[1], body: match[2] };
  }, []);

  /* API 호출 및 소켓 연결 */
  useEffect(() => {
    // 로그인이 안 되어 있거나 userId가 없으면 실행 X
    if (!userId) return;

    let mounted = true;

    // 기존 알림 목록 가져오기
    fetchNotifications({ page: 0, size: 20 })
      .then((res) => {
        if (mounted && res?.data?.content) {
          setNotifications(res.data.content);
        }
      })
      .catch((err) => console.error("[Noti] Fetch error:", err));

    // 소켓 연결 (userId 전달 필수)
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
  }, [userId]); // userId가 변경되면(로그인 등) 다시 연결

  /* 클릭 시 이동 및 읽음 처리 */
  const onClickNotification = async (noti) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === noti.id ? { ...n, isRead: true } : n))
    );

    try {
      if (!noti.isRead) {
        await readNotification(noti.id);
      }
    } catch (e) {
      console.error("[Noti] Read failed", e);
    }

    setIsOpen(false);

    // 명세에 따른 페이지 이동
    switch (noti.type) {
      case "LETTER_RECEIVED":
        navigate("/letterbox");
        break;
      case "CAPSULE_RECEIVED":
      case "CAPSULE_OPENED":
        navigate("/timecapsule");
        break;
      case "FRIEND_REQUEST": // 친구 요청 받음 -> 친구 목록으로
      case "FRIEND_ACCEPT":  // 친구 수락 됨 -> 친구 목록으로
        navigate("/friend");
        break;
      default:
        break;
    }
  };

  const hasUnread = notifications.some((n) => !n.isRead);

  return {
    notifications,
    isOpen,
    setIsOpen,
    hasUnread,
    onClickNotification,
    formatTime,
    getNotiIcon,
    splitNotiContent,
  };
}