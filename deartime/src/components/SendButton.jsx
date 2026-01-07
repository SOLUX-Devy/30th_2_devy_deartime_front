import React from 'react';
import { useNavigate } from 'react-router-dom';

const SendButton = () => {
    const navigate = useNavigate();

    return (
        <div className="tc-topbar-right">
            <button
                type="button"
                className="tc-create-btn"
                onClick={() => navigate('/letterbox/sendLetter')}
            >
                편지 보내기 
            </button>
        </div>
    );
};

export default SendButton;