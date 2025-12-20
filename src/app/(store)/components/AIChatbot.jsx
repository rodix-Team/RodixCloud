'use client';

import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import { addItem } from '../../redux/slices/cartSlice';
import ProductChatCard from './ProductChatCard';
import BeeAvatar from './BeeAvatar';
import QuickActions from './QuickActions';
import Bee3D from './Bee3D';
import { formatTimestamp } from '../../utils/timeUtils';
import toast from 'react-hot-toast';

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

// Styled Components
const ChatContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  direction: rtl;
`;

const ChatButton = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F4A300 0%, #FFB82E 100%);
  border: none;
  box-shadow: 0 4px 20px rgba(244, 163, 0, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  transition: all 0.3s ease;
  animation: ${bounce} 2s ease-in-out infinite;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 25px rgba(244, 163, 0, 0.6);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ChatWindow = styled.div`
  position: absolute;
  bottom: 120px;
  right: 0;
  width: 350px;
  height: 490px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 248, 235, 0.98) 100%);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 
    0 20px 60px rgba(244, 163, 0, 0.15),
    0 8px 25px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(244, 163, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${fadeIn} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

  @media (max-width: 480px) {
    width: calc(100vw - 40px);
    height: calc(100vh - 120px);
    border-radius: 20px;
  }
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #F4A300 0%, #FF8C00 50%, #FFB82E 100%);
  padding: 1.2rem 1.5rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
    animation: shimmer 3s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
  }
  
  @keyframes shimmer {
    0%, 100% { transform: translateX(-30%) translateY(-30%); }
    50% { transform: translateX(30%) translateY(30%); }
  }
  
  /* Ensure buttons are clickable */
  > * {
    position: relative;
    z-index: 1;
  }
`;

const ChatTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 800;
  font-size: 1.15rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: linear-gradient(180deg, rgba(255, 248, 235, 0.5) 0%, rgba(255, 255, 255, 0.8) 100%);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  
  /* Honey pattern overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 17.32V52.68L30 70L0 52.68V17.32L30 0z' fill='%23F4A300' fill-opacity='0.03'/%3E%3C/svg%3E");
    background-size: 30px 30px;
    pointer-events: none;
    opacity: 0.5;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(244, 163, 0, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #F4A300 0%, #FFB82E 100%);
    border-radius: 3px;
  }
`;

const Message = styled.div`
  max-width: 85%;
  padding: 1rem 1.25rem;
  border-radius: 18px;
  animation: ${fadeIn} 0.3s ease-out;
  line-height: 1.6;
  position: relative;
  z-index: 1;
  
  ${({ $isUser }) => $isUser ? `
    align-self: flex-start;
    background: linear-gradient(135deg, #F4A300 0%, #FF9500 100%);
    color: white;
    border-bottom-right-radius: 6px;
    box-shadow: 0 4px 15px rgba(244, 163, 0, 0.3);
  ` : `
    align-self: flex-end;
    background: white;
    color: #333;
    border-bottom-left-radius: 6px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(244, 163, 0, 0.1);
  `}
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: ${({ $primary }) => $primary ? 'linear-gradient(135deg, #F4A300 0%, #FFB82E 100%)' : 'white'};
  color: ${({ $primary }) => $primary ? 'white' : '#F4A300'};
  border: ${({ $primary }) => $primary ? 'none' : '1px solid #F4A300'};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(244, 163, 0, 0.3);
  }
`;

const MessageContent = styled.div`
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const Timestamp = styled.div`
  font-size: 0.7rem;
  color: ${({ $isUser }) => $isUser ? 'rgba(255, 255, 255, 0.7)' : '#999'};
  margin-top: 0.25rem;
  text-align: ${({ $isUser }) => $isUser ? 'left' : 'right'};
`;

const InputContainer = styled.form`
  padding: 1rem 1.25rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 248, 235, 0.95) 100%);
  border-top: 1px solid rgba(244, 163, 0, 0.15);
  display: flex;
  gap: 0.75rem;
  backdrop-filter: blur(10px);
`;

const Input = styled.input`
  flex: 1;
  padding: 0.9rem 1.25rem;
  border: 2px solid rgba(244, 163, 0, 0.2);
  border-radius: 25px;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.3s ease;
  background: white;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);

  &:focus {
    border-color: #F4A300;
    box-shadow: 0 0 0 4px rgba(244, 163, 0, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.02);
  }

  &::placeholder {
    color: #aaa;
  }
`;

const SendButton = styled.button`
  background: linear-gradient(135deg, #F4A300 0%, #FF9500 100%);
  border: none;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(244, 163, 0, 0.4);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left 0.5s ease;
  }

  &:hover:not(:disabled) {
    transform: scale(1.1) translateY(-2px);
    box-shadow: 0 6px 25px rgba(244, 163, 0, 0.5);
    
    &::before {
      left: 100%;
    }
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const TypingIndicator = styled.div`
  align-self: flex-end;
  background: white;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .typing-text {
    color: #666;
    font-size: 0.9rem;
    margin-right: 0.5rem;
  }
  
  .typing-dots {
    display: flex;
    gap: 0.3rem;
  }

  span {
    width: 8px;
    height: 8px;
    background: #F4A300;
    border-radius: 50%;
    animation: ${bounce} 1s ease-in-out infinite;

    &:nth-child(1) {
      animation-delay: 0s;
    }

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
`;

const WelcomeMessage = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  color: #666;

  h3 {
    color: #F4A300;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.9rem;
    line-height: 1.6;
  }
`;

const BeeWrapper = styled.div`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  width: 128px;
  height: 128px;
  z-index: 50;
  cursor: pointer;
  transition: transform 0.3s;

  &:hover {
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    bottom: 0.75rem;
    right: 0.75rem;
  }
`;

export default function AIChatbot() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const allProducts = useSelector((state) => state.products.items);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  // Load chat history and mute preference
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    const savedMuted = localStorage.getItem('chatMuted');
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');

    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else if (!hasSeenWelcome && isOpen) {
      // Show welcome message on first open
      const welcomeMessage = {
        role: 'assistant',
        content: '🐝 السلام عليكم! أنا العواد، خبير العسل ديالكم!\n\nكيفاش نقدر نعاونك اليوم؟ 🍯',
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
      localStorage.setItem('hasSeenWelcome', 'true');
    }

    if (savedMuted) {
      setIsMuted(JSON.parse(savedMuted));
    }
  }, [isOpen]);

  // Save chat history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages.slice(-20)));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const playNotification = () => {
    if (!isMuted && audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem('chatMuted', JSON.stringify(newMuted));
  };

  const handleButtonClick = (button) => {
    if (button.type === 'add-to-cart') {
      const product = allProducts.find(p => p.id === button.productId);
      if (product) {
        dispatch(addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
        }));
        toast.success(`✅ تم إضافة ${product.name} للعربة!`);
      }
    } else if (button.type === 'view-product') {
      router.push(`/products/${button.productId}`);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
          context: pathname,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Handle response (can be object with content/buttons/product or just string)
      const responseData = data.response;
      const aiMessage = {
        role: 'assistant',
        content: responseData.content || responseData,
        buttons: responseData.buttons,
        product: responseData.product,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
      playNotification();
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'عذراً، حدث خطأ. حاول مرة أخرى.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickAction = (text) => {
    sendMessage(text);
  };

  return (
    <ChatContainer>
      {isOpen && (
        <ChatWindow>
          <ChatHeader>
            <ChatTitle>
              <span>🐝</span>
              <span>مساعدك العواد</span>
            </ChatTitle>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <CloseButton onClick={toggleMute} title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}>
                {isMuted ? '🔇' : '🔊'}
              </CloseButton>
              {messages.length > 0 && (
                <CloseButton onClick={clearHistory} title="مسح المحادثة">
                  🗑️
                </CloseButton>
              )}
              <CloseButton onClick={() => setIsOpen(false)}>
                ✕
              </CloseButton>
            </div>
          </ChatHeader>

          <MessagesContainer>
            {messages.length === 0 ? (
              <WelcomeMessage>
                <h3>مرحباً بك! 👋</h3>
                <p>أنا العواد، خبير العسل ديالكم. كيف نقدر نعاونك اليوم؟ 🐝</p>
              </WelcomeMessage>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <div key={index}>
                    <Message $isUser={msg.role === 'user'}>
                      <MessageContent>{msg.content}</MessageContent>
                      {msg.timestamp && (
                        <Timestamp $isUser={msg.role === 'user'}>
                          {formatTimestamp(msg.timestamp)}
                        </Timestamp>
                      )}
                      {msg.buttons && msg.buttons.length > 0 && (
                        <ButtonsContainer>
                          {msg.buttons.map((button, btnIndex) => (
                            <ActionButton
                              key={btnIndex}
                              $primary={button.type === 'add-to-cart'}
                              onClick={() => handleButtonClick(button)}
                            >
                              {button.label}
                            </ActionButton>
                          ))}
                        </ButtonsContainer>
                      )}
                    </Message>
                    {msg.product && (
                      <ProductChatCard product={msg.product} />
                    )}
                  </div>
                ))}
                {isLoading && (
                  <TypingIndicator>
                    <span className="typing-text">🐝 العواد كيفكر...</span>
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </TypingIndicator>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </MessagesContainer>

          {/* Quick Actions */}
          {messages.length === 0 && (
            <QuickActions
              onActionClick={(message) => sendMessage(message)}
              disabled={isLoading}
            />
          )}

          <InputContainer onSubmit={handleSubmit}>
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="اكتب رسالتك..."
              disabled={isLoading}
            />
            <SendButton type="submit" disabled={isLoading || !inputValue.trim()}>
              ➤
            </SendButton>
          </InputContainer>
        </ChatWindow>
      )}

      <BeeWrapper onClick={() => setIsOpen(!isOpen)}>
        <Bee3D onClick={() => setIsOpen(!isOpen)} isMuted={isMuted} isActive={isOpen} />
      </BeeWrapper>
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE=" preload="auto" />
    </ChatContainer>
  );
}
