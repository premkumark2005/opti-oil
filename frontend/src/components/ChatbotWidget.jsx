import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import styles from './ChatbotWidget.module.css';

const ChatbotWidget = () => {
  const { user } = useAuth();
  
  const getGreeting = () => {
    if (user?.role === 'admin') return "Hello Admin. Ask me about sales, inventory, suppliers, or production.";
    if (user?.role === 'supplier') return "Hello Supplier. Ask me about your orders or materials.";
    if (user?.role === 'wholesaler') return "Hello Wholesaler. Ask me about product availability or your orders.";
    return "Hello! I am your AI assistant. Ask me anything about your data.";
  };

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: getGreeting(), sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Assuming frontend passes the token automatically if using an interceptor
      // or using withCredentials. We'll use standard axios config if needed.
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chatbot/query`, {
        message: userMessage
      }, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // standard for JWT if not using cookies
        }
      });

      const responseText = res.data?.data?.response || "Sorry, I couldn't get a valid response.";
      setMessages(prev => [...prev, { text: responseText, sender: 'bot' }]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      const errorMsg = error.response?.data?.message || "Error communicating with the chatbot.";
      setMessages(prev => [...prev, { text: `Error: ${errorMsg}`, sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.chatbotContainer}>
      {isOpen ? (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <h3>AI Assistant</h3>
            <button className={styles.closeBtn} onClick={toggleChat} aria-label="Close Chat">
              &times;
            </button>
          </div>
          <div className={styles.chatBody}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`${styles.message} ${msg.sender === 'user' ? styles.userMsg : styles.botMsg}`}>
                <div className={styles.messageBubble}>
                  {msg.sender === 'bot'
                    ? <ReactMarkdown>{msg.text}</ReactMarkdown>
                    : msg.text
                  }
                </div>
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.message} ${styles.botMsg}`}>
                <div className={styles.messageBubble}>
                  <span className={styles.typingIndicator}>...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className={styles.chatFooter} onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className={styles.chatInput}
            />
            <button type="submit" disabled={isLoading || !inputValue.trim()} className={styles.sendBtn}>
              Send
            </button>
          </form>
        </div>
      ) : (
        <button className={styles.floatingBtn} onClick={toggleChat} aria-label="Open Chat">
          💬
        </button>
      )}
    </div>
  );
};

export default ChatbotWidget;
