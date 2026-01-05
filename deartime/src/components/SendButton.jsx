import React from 'react';
import { useNavigate } from 'react-router-dom';

const SendButton = () => {
    const navigate = useNavigate();

    return (
        <div className="tc-topbar-right">
            <button
                type="button"
                className="tc-create-btn"
                onClick={() => navigate('/timecapsule/create')}
            >
                캡슐 생성
            </button>
        </div>
    );
};

export default SendButton;