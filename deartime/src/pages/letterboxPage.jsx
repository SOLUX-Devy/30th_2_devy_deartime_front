import React from 'react';
import '../styles/LetterboxPage.css';
import LetterCard from '../components/LetterCard';
import MailTabs from '../components/MailTabs'; 
import SendButton from '../components/SendButton'; 

// API에서 받은 실제 JSON 구조를 MOCK 데이터로 사용
const apiResponse = { 
    data: {
        data: [
        {
            letterId: 1,
            senderNickname: "테스터_A",
            title: "첫 편지입니다",
            summary: "17148",
            themeCode: "DEFAULT",
            sentAt: "2025-12-15T00:32:08.164649",
            isRead: true,
            isBookmarked: true
        }
        ]
    }
};

const Letterbox = () => {
    const letters = apiResponse.data.data;

    return (
        <div className="letterbox-container">
        <div className="main-navbar-placeholder">Main Navbar</div>
        
            <div className="letterbox-content">
                <header className="letterbox-header">
                    {/* Tabs, Button 컴포넌트 삽입 */}
                    <MailTabs />
                    <SendButton />
                </header>

                <main className="letter-grid">
                    {letters.map((letter) => (
                        <LetterCard key={letter.letterId} data={letter} />
                    ))}
                </main>
            </div>

        </div>
    );
};

export default Letterbox;