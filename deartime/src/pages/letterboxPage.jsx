import React, { useState, useEffect } from 'react'; // ✅ 상태 관리를 위해 추가
import '../styles/LetterboxPage.css';
import LetterCard from '../components/LetterCard';
import MailTabs from '../components/MailTabs'; 
import SendButton from '../components/SendButton'; 

const Letterbox = () => {
    // 1. 데이터를 담을 상태(State) 선언
    const [letters, setLetters] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태 관리

    // 2. 컴포넌트 마운트 시 데이터 fetch
    useEffect(() => {
        fetch('/mocks/letters.json') // public/mocks/letters.json 경로
            .then((res) => {
                if (!res.ok) throw new Error('데이터 로드 실패');
                return res.json();
            })
            .then((json) => {
                setLetters(json.data); // JSON 구조에 맞게 설정
                setIsLoading(false);
            })
            .catch((err) => {
                console.error('Fetch error:', err);
                setIsLoading(false);
            });
    }, []);

    return (
        <div className="letterbox-container">
            <div className="letterbox-content">
                <header className="letterbox-header">
                    <MailTabs />
                    <SendButton />
                </header>

                <main className="letter-grid">
                    {/* 3. 데이터 로딩 중 처리 및 리스트 렌더링 */}
                    {isLoading ? (
                        <p>편지를 불러오는 중입니다...</p>
                    ) : (
                        letters.map((letter) => (
                            <LetterCard key={letter.letterId} data={letter} />
                        ))
                    )}
                </main>
            </div>
        </div>
    );
};

export default Letterbox;