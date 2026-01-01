const MailTabs = () => {
    const tabs = ["받은 편지", "보낸 편지", "즐겨찾기", "우리의 우체통"];
    
    return (
        <div style={{ display: 'flex', gap: '30px' }}>
        {tabs.map((tab, index) => (
            <span key={tab} style={{ 
            fontSize: '1.2rem', 
            fontWeight: index === 0 ? 'bold' : 'normal',
            borderBottom: index === 0 ? '2px solid white' : 'none',
            paddingBottom: '5px',
            cursor: 'pointer'
            }}>
            {tab}
            </span>
        ))}
        </div>
    );
};

export default MailTabs;