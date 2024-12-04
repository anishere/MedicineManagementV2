import { useState } from 'react';
import { Input, Button, Card } from 'antd';
import { SendOutlined } from '@ant-design/icons';

function ChatComponent() {
    const [messages, setMessages] = useState([]);  // Lưu trữ tin nhắn
    const [input, setInput] = useState('');  // Lưu trữ đầu vào của người dùng
    const [loading, setLoading] = useState(false);  // Trạng thái loading khi đang gửi tin nhắn
    const [error, setError] = useState(null);  // Lưu trữ thông báo lỗi (nếu có)

    const handleSendMessage = async () => {
        if (input.trim() === '') return;  // Kiểm tra nếu đầu vào rỗng
        if (loading) return;  // Nếu đang gửi tin nhắn, không cho gửi lại

        // Bắt đầu trạng thái loading
        setLoading(true);
        setError(null);  // Đặt lỗi thành null nếu có

        // Thêm tin nhắn của người dùng vào danh sách sau khi bắt đầu gửi
        setMessages(prevMessages => [
            ...prevMessages,
            { sender: 'user', text: input, loading: true } // Thêm trạng thái loading cho tin nhắn người dùng
        ]);

        try {
            // Gửi yêu cầu tới API RapidAPI
            const response = await fetch('https://copilot5.p.rapidapi.com/copilot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-rapidapi-host': 'copilot5.p.rapidapi.com',
                    'x-rapidapi-key': 'f27b6ab341msh0e7579f514266e6p1c84f2jsna514cbe9a80d',  
                    //e64b491779msh5bacb09d6016fa5p13a50djsn3e2b61f76280
                },
                body: JSON.stringify({
                    message: input,
                    conversation_id: null,  // Nếu cần duy trì cuộc trò chuyện, bạn có thể thay đổi giá trị này
                    tone: 'BALANCED',  // Tùy chọn: 'BALANCED', 'EXCITED', 'SAD', 'ANGRY'
                    markdown: false,
                    photo_url: null,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Thêm phản hồi từ API RapidAPI vào danh sách tin nhắn sau khi nhận được câu trả lời
                setMessages(prevMessages => {
                    // Cập nhật lại tin nhắn người dùng (loading: false) và thêm tin nhắn chatbot
                    const updatedMessages = prevMessages.map(msg =>
                        msg.loading === true ? { ...msg, loading: false } : msg
                    );
                    return [
                        ...updatedMessages,
                        { sender: 'chatbot', text: data.data.message.trim() }
                    ];
                });
            } else {
                // Xử lý lỗi API (nếu có)
                setError('Error: ' + data.message || 'An unknown error occurred');
            }
        } catch (error) {
            // Xử lý lỗi khi gọi API
            setError('An error occurred while communicating with the server.');
            console.error('Error:', error);
        } finally {
            // Kết thúc trạng thái loading
            setLoading(false);
        }

        // Xóa nội dung đầu vào sau khi gửi tin nhắn
        setInput('');
    };

    return (
        <div style={{ padding: '0px', width: '1200px', margin: '0 auto', height: '80vh', display: 'flex', flexDirection: 'column' }}>
            {/* Hiển thị thông báo lỗi (nếu có) */}
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            {/* Hiển thị tin nhắn */}
            <Card
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    overflowY: 'auto',
                    marginBottom: '10px',
                    padding: '10px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                }}
                bodyStyle={{ padding: 0 }}
            >
                {messages.map((message, index) => (
                    <div key={index} style={{
                        marginBottom: '15px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '10px',
                        backgroundColor: message.sender === 'user' ? '#f0f0f0' : '#e6f7ff',
                        borderRadius: '8px',
                        maxWidth: '80%',
                        wordBreak: 'break-word',
                        marginLeft: message.sender === 'user' ? 'auto' : '0',
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong>{message.sender === 'user' ? 'You' : 'Chatbot'}:</strong>
                            <p style={{ margin: 0, padding: 0, fontSize: '14px' }}>{message.text}</p>
                        </div>
                    </div>
                ))}
            </Card>

            {/* Input và nút gửi */}
            <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                disabled={loading}  // Vô hiệu hóa khi đang tải
                style={{ marginBottom: '10px', borderRadius: '8px' }}
            />
            <Button
                type="primary"
                onClick={handleSendMessage}
                icon={<SendOutlined />}
                block
                disabled={loading}  // Vô hiệu hóa khi đang tải
                loading={loading}  // Hiển thị loading spinner
                style={{ borderRadius: '8px' }}
            >
                {loading ? 'Sending...' : 'Send'}
            </Button>
        </div>
    );
}

export default ChatComponent;
