# FE
# 📍 Deartime(디어타임) - 우수상 수상
**🗓 프로젝트 기간: 2025.9 ~ 2026.1**

### 별빛처럼 사라지지 않는 기억을 기록하는 곳  
DearTime은 흩어져 있는 개인의 기록과 감정을 정제된 디지털 유산으로 보존하는 기억 관리 플랫폼입니다.
직관적인 UX를 통해 추억을 안전하게 관리·공유하며, 과거의 기억을 미래의 가치로 이어줍니다.


## 프로젝트 비전
- 개인의 추억과 감정을 장기적으로 안전하게 보존
- 타임캡슐을 통해 미래의 특정 시점에 기억 전달
- 사망 이후에도 기록이 유지되는 디지털 유산 관리 구조
- 감성적인 UI/UX를 통한 정서적 위로와 연결 경험 제공
- 단순 기록 앱이 아닌, 기억 중심 아카이빙 플랫폼 지향

## 주요 기능
- **갤러리 기록 기능**: 사진과 함께 추억을 기록하고 시간의 흐름에 따라 정리할 수 있습니다. 개인의 기억을 시각적으로 보존하며 의미 있는 순간을 한곳에 모을 수 있습니다.
- **우체통(편지) 기능**: 친구와 편지를 주고받으며 감정과 이야기를 기록할 수 있습니다. 말로 전하지 못한 마음을 글로 남기고, 시간이 지나 다시 꺼내볼 수 있습니다.
- **타임캡슐 기능**: 특정 시점에 열리는 타임캡슐을 만들어 미래의 나 또는 친구에게 메시지를 보낼 수 있습니다. 현재의 기억을 봉인해 미래의 가치로 이어줍니다.
- **친구목록 및 대리인 설정 기능**: 친구를 추가하고, 나의 기록을 관리해 줄 대리인을 설정할 수 있습니다. 개인 기록의 공유 범위를 조절하고, 안전하게 추억을 보존할 수 있습니다.

## 역할 분담

| 이름  | 역할분담 |
|-----| ------ |
| <a href="https://github.com/eunseo0903">정은서(FE장)</a> |로그인, 홈화면, FE 배포|
| <a href="https://github.com/hycho04">조현영</a> |타임캡슐, 친구목록|
| <a href="https://github.com/nylee0116">이나연</a> |편지목록, 우체통|
| <a href="https://github.com/juday1036">김민주</a> |레코드, 앨범|


## 🛠 Tech Stack
### Frontend
| Category | Technology |
| --- | --- |
| **Library** | React |
| **State Management** | React Hooks (useState, useEffect, useMemo, useRef) |
| **Routing** | React Router DOM |
| **HTTP Client** | Axios |
| **Styling** | CSS3 (Custom Modules) |
| **Deployment** | Vercel |



## 📁 Project Structure
```text
src/
├── assets/          # 이미지 및 정적 자원
├── components/      # 재사용 가능한 공용 컴포넌트 (LetterCard, Modal 등)
├── pages/           # 페이지 단위 컴포넌트 (Gallery, Letterbox 등)
├── styles/          # 전역 및 컴포넌트별 CSS 파일
└── App.js           # 라우팅 및 전역 상태 설정
