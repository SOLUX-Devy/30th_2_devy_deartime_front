// 알림 목록 조회 Mock 데이터
export const MOCK_NOTIFICATIONS = {
  status: 200,
  success: true,
  message: "알림 목록 조회 성공",
  data: {
    content: [
      {
        id: 5,
        type: "LETTER_RECEIVED",
        senderNickname: "민지",
        contentTitle: "오랜만이야!",
        targetId: 42,
        content: "민지님이 편지를 보냈습니다.",
        isRead: false,
        createdAt: "2025-12-30T14:30:00",
      },
      {
        id: 4,
        type: "CAPSULE_OPENED",
        senderNickname: "철수",
        contentTitle: "1년 후의 나에게",
        targetId: 15,
        content: "철수님이 타임캡슐을 열어볼 수 있습니다.",
        isRead: false,
        createdAt: "2025-12-30T12:00:00",
      },
      {
        id: 3,
        type: "FRIEND_ACCEPT",
        senderNickname: "영희",
        contentTitle: null,
        targetId: 7,
        content: "영희님이 친구 요청을 수락했습니다.",
        isRead: true,
        createdAt: "2025-12-29T18:45:00",
      },
    ],
    totalElements: 15,
    totalPages: 1,
    size: 20,
    number: 0,
    first: true,
    last: true,
    empty: false,
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