// 알림 목록 조회 Mock 데이터
// 알림 목록 조회 Mock 데이터
export const MOCK_NOTIFICATIONS = {
  status: 200,
  success: true,
  message: "알림 목록 조회 성공",
  data: {
    content: [
      {
        id: 1,
        type: "FRIEND_INVITE",
        senderNickname: "송이",
        contentTitle: null,
        targetId: 12,
        content: "송이 님이 친구 초대를 보냈습니다.",
        isRead: false,
        createdAt: "2025-12-30T14:13:00",
      },
      {
        id: 2,
        type: "TIMECAPSULE_OPEN",
        senderNickname: null,
        contentTitle: "어렸을 때의 추억",
        targetId: 33,
        content: "타임캡슐이 열렸습니다!",
        isRead: true,
        createdAt: "2025-12-30T10:00:00",
      },
      {
        id: 3,
        type: "TIMECAPSULE_RECEIVED",
        senderNickname: "솔록스",
        contentTitle: null,
        targetId: 44,
        content: "솔록스 님이 새로운 타임캡슐을 보냈습니다.",
        isRead: true,
        createdAt: "2025-12-25T09:00:00",
      },
      {
        id: 4,
        type: "LETTER_RECEIVED",
        senderNickname: "솔룩스",
        contentTitle: "잘 지내고 있지?",
        targetId: 55,
        content: "솔룩스 님이 편지를 보냈습니다.",
        isRead: true,
        createdAt: "2025-09-25T09:00:00",
      },
    ],
  },
};

// 프로필 정보 조회 Mock 데이터
export const MOCK_USER_PROFILE = {
  status: 200,
  success: true,
  message: "조회 성공",
  data: {
    userId: 1,
    email: "test@gmail.com",
    nickname: "은서",
    birthDate: "2003-09-03",
    bio: "안녕하세요, 은서입니다.",
    profileImageUrl: "https://example.com/profile.png", // 실제 사용 시에는 assets 폴더의 이미지나 URL 사용
    joinDays: 25, // 가입일수는 프론트에서 계산하거나 데이터에 추가 가능
  },
};