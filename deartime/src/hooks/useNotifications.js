// src/hooks/useNotifications.js
import { useEffect, useState, useCallback, useRef } from "react";
import {
  fetchNotifications,
  connectNotificationSocket,
  disconnectNotificationSocket,
  readNotification, // PATCH /api/notifications/{id}/read
} from "../api/notification";
import { updateFriendStatus } from "../api/friend";

import friendIcon from "../assets/default_profile2.png?url";
import letterIcon from "../assets/letter.png?url";
import capsuleIcon from "../assets/timecapsule.png?url";

/* =========================
   ✅ Local cache helpers
========================= */
const CACHE_KEY = (uid) => `noti_persist_${uid}`;
const MAX_CACHE = 200;

const normalizeType = (t) => String(t || "").toUpperCase();

const safeParseJsonArray = (s) => {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
};

const sortByCreatedAtDesc = (list) => {
  return [...list].sort((a, b) => {
    const at = new Date(a?.createdAt || 0).getTime();
    const bt = new Date(b?.createdAt || 0).getTime();
    return bt - at;
  });
};

// ✅ unread만 유지
const keepUnreadOnly = (list) => (list || []).filter((n) => n?.isRead !== true);

const mergeById = (prevList, incomingList) => {
  const map = new Map();

  (prevList || []).forEach((n) => {
    if (n?.id != null) map.set(n.id, n);
  });

  (incomingList || []).forEach((n) => {
    if (n?.id == null) return;
    const old = map.get(n.id) || {};
    map.set(n.id, { ...old, ...n });
  });

  return keepUnreadOnly(sortByCreatedAtDesc(Array.from(map.values()))).slice(
    0,
    MAX_CACHE
  );
};

// ✅ “읽음 처리 대상” (드롭다운 닫을 때 read)
const isAutoReadType = (type) => {
  const t = normalizeType(type);
  return (
    t === "LETTER_RECEIVED" ||
    t === "CAPSULE_RECEIVED" ||
    t === "CAPSULE_OPENED" ||
    t === "FRIEND_ACCEPT"
  );
};

export function useNotifications({ navigate, userId }) {
  const [notifications, setNotifications] = useState([]); // ✅ unread만
  const [isOpen, setIsOpen] = useState(false);

  // ✅ 이번에 “열어서 본” 알림들(닫을 때 read)
  const seenOnOpenRef = useRef(new Set());
  const prevIsOpenRef = useRef(false);

  /* =========================
      아이콘 매핑
  ========================= */
  const getNotiIcon = useCallback((type) => {
    const t = normalizeType(type);

    if (t === "LETTER_RECEIVED") return letterIcon;
    if (t === "CAPSULE_RECEIVED" || t === "CAPSULE_OPENED") return capsuleIcon;
    if (t === "FRIEND_REQUEST" || t === "FRIEND_ACCEPT") return friendIcon;

    return friendIcon;
  }, []);

  /* =========================
      타입 판별
  ========================= */
  const isFriendRequest = useCallback(
    (noti) => normalizeType(noti?.type) === "FRIEND_REQUEST",
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

    const type = normalizeType(noti.type);
    const content = String(noti.content || "");
    const sender = noti.senderNickname || "누군가";

    if (type === "LETTER_RECEIVED") {
      const m = content.match(/^(.+?님이)\s*(.*)$/);
      return {
        title: m ? m[1] : `${sender}님이`,
        body: m ? m[2] : "편지를 보냈습니다.",
        sub: noti.contentTitle || null,
      };
    }

    if (type === "CAPSULE_RECEIVED") {
      return {
        title: `${sender}님이`,
        body: "새로운 타임캡슐을 보냈습니다.",
        sub: noti.contentTitle || null,
      };
    }

    if (type === "CAPSULE_OPENED") {
      const capsuleTitle = noti.contentTitle || content || null;
      return {
        title: "타임캡슐이 열렸습니다!",
        body: " ",
        sub: capsuleTitle,
      };
    }

    const m = content.match(/^(.+?님이)\s*(.*)$/);
    if (!m) return { title: content, body: "", sub: null };

    return { title: m[1], body: m[2] || "", sub: null };
  }, []);

  /* =========================
      helper: read 성공 시 제거
  ========================= */
  const markReadAndRemove = useCallback(async (notiId) => {
    try {
      await readNotification(notiId);
      setNotifications((prev) => prev.filter((n) => n.id !== notiId));
      return true;
    } catch (e) {
      console.error("[Noti] Read(PATCH) failed", e);
      return false;
    }
  }, []);

  /* =========================
      FRIEND_REQUEST 수락/거절
      - 여기서만 read + 제거
  ========================= */
  const acceptFriendRequest = useCallback(
    async (noti) => {
      try {
        const friendId = noti?.targetId ?? null;
        if (!friendId) throw new Error("targetId(friendId) 없음");

        await updateFriendStatus(friendId, "accepted");
        await markReadAndRemove(noti.id);
      } catch (e) {
        console.error("[Noti] accept failed", e);
      }
    },
    [markReadAndRemove]
  );

  const rejectFriendRequest = useCallback(
    async (noti) => {
      try {
        const friendId = noti?.targetId ?? null;
        if (!friendId) throw new Error("targetId(friendId) 없음");

        await updateFriendStatus(friendId, "rejected");
        await markReadAndRemove(noti.id);
      } catch (e) {
        console.error("[Noti] reject failed", e);
      }
    },
    [markReadAndRemove]
  );

  /* =========================
      ✅ Cache restore (unread만)
  ========================= */
  useEffect(() => {
    const uid = userId || localStorage.getItem("lastUserId");
    if (!uid) return;

    const saved = localStorage.getItem(CACHE_KEY(uid));
    const parsed = saved ? safeParseJsonArray(saved) : null;
    if (parsed) setNotifications(mergeById([], parsed));
  }, [userId]);

  /* =========================
      ✅ Cache persist (unread만)
  ========================= */
  useEffect(() => {
    const uid = userId || localStorage.getItem("lastUserId");
    if (!uid) return;

    try {
      localStorage.setItem(
        CACHE_KEY(uid),
        JSON.stringify(keepUnreadOnly(notifications))
      );
    } catch (e) {
      console.error("[Noti] cache save fail", e);
    }
  }, [notifications, userId]);

  /* =========================
      GET + Socket
  ========================= */
  useEffect(() => {
    if (!userId) return;

    localStorage.setItem("lastUserId", String(userId));

    let mounted = true;

    fetchNotifications({ page: 0, size: 20 })
      .then((res) => {
        if (!mounted) return;
        const list = res?.data?.content || [];
        setNotifications((prev) => mergeById(prev, list));
      })
      .catch((err) => console.error("[Noti] Fetch error:", err));

    connectNotificationSocket({
      userId,
      onMessage: (newNoti) => {
        setNotifications((prev) => mergeById(prev, [newNoti]));
      },
    });

    return () => {
      mounted = false;
      disconnectNotificationSocket();
    };
  }, [userId]);

  /* =========================
      ✅ UX: "열면 유지, 닫을 때 읽음 처리"
      - open(true) 되는 순간: 현재 보이는 autoRead 대상들을 seen set에 담아둠
      - close(false) 되는 순간: seen set에 있는 것들을 PATCH(read) 후 성공한 것만 제거
  ========================= */
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    const nowOpen = isOpen;

    // 1) 방금 열림: 이번에 본 알림을 기록
    if (!wasOpen && nowOpen) {
      notifications.forEach((n) => {
        if (n?.id && isAutoReadType(n.type)) {
          seenOnOpenRef.current.add(n.id);
        }
      });
    }

    // 2) 방금 닫힘: 기록된 알림들을 read 처리
    if (wasOpen && !nowOpen) {
      const ids = Array.from(seenOnOpenRef.current);
      if (ids.length > 0) {
        (async () => {
          const successIds = [];

          await Promise.all(
            ids.map(async (id) => {
              try {
                await readNotification(id);
                successIds.push(id);
              } catch (e) {
                console.error("[Noti] auto read(on close) failed", e);
              }
            })
          );

          if (successIds.length > 0) {
            setNotifications((prev) =>
              prev.filter((n) => !successIds.includes(n.id))
            );
          }

          // 다음 오픈을 위해 초기화
          seenOnOpenRef.current.clear();
        })();
      } else {
        seenOnOpenRef.current.clear();
      }
    }

    prevIsOpenRef.current = nowOpen;
  }, [isOpen, notifications]);

  /* =========================
      클릭 처리
      - 지금 UX는 "닫을 때 읽음"
      - 클릭은 이동만 담당
      - FRIEND_*는 read 절대 안 함
  ========================= */
  const onClickNotification = useCallback(
    (noti) => {
      if (!noti?.id) return;

      const type = normalizeType(noti?.type);

      // ✅ 클릭하면 일단 드롭다운 닫기
      // (→ 닫히면서 자동 read 처리됨: LETTER/CAPSULE)
      setIsOpen(false);

      switch (type) {
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
    },
    [navigate]
  );

  const hasUnread = notifications.length > 0;

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
