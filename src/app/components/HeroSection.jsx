'use client';

import styled, { keyframes } from 'styled-components';
import Link from 'next/link';

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const Hero = styled.section`
  background: linear-gradient(135deg, rgba(244, 163, 0, 0.9) 0%, rgba(255, 184, 46, 0.8) 100%), 
              url('/images/honey_background.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  margin-bottom: 3rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const HeroContent = styled.div`
  padding: 2rem 1.5rem;
  max-width: 900px;
  position: relative;
  z-index: 2;
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 1rem;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  animation: ${fadeInUp} 0.8s ease-out;
  line-height: 1.2;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.5rem;
  margin-bottom: 2.5rem;
  font-weight: 400;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  animation: ${fadeInUp} 0.8s ease-out 0.2s backwards;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 1.2rem;
  }
`;

const BadgesContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  animation: ${fadeInUp} 0.8s ease-out 0.4s backwards;
`;

const Badge = styled.div`
  background: rgba(255, 255, 255, 0.95);
  color: #2c3e50;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  span {
    font-size: 1.3rem;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  animation: ${fadeInUp} 0.8s ease-out 0.6s backwards;
`;

const ShopNowButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #2c3e50;
  color: white;
  padding: 1.2rem 3rem;
  font-size: 1.25rem;
  font-weight: 700;
  border-radius: 50px;
  transition: all 0.3s ease;
  text-decoration: none;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);

  &:hover {
    background-color: #1a252f;
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const SecondaryButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 1.2rem 3rem;
  font-size: 1.25rem;
  font-weight: 700;
  border-radius: 50px;
  border: 2px solid white;
  transition: all 0.3s ease;
  text-decoration: none;
  backdrop-filter: blur(10px);

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-3px);
  }
`;

const FloatingIcon = styled.div`
  position: absolute;
  font-size: 3rem;
  opacity: 0.3;
  animation: ${float} 3s ease-in-out infinite;
  pointer-events: none;

  &:nth-child(1) {
    top: 10%;
    left: 10%;
    animation-delay: 0s;
  }

  &:nth-child(2) {
    top: 20%;
    right: 15%;
    animation-delay: 1s;
  }

  &:nth-child(3) {
    bottom: 15%;
    left: 15%;
    animation-delay: 2s;
  }

  &:nth-child(4) {
    bottom: 20%;
    right: 10%;
    animation-delay: 1.5s;
  }
`;

const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  animation: ${pulse} 2s ease-in-out infinite;
  cursor: pointer;
  font-size: 2rem;
  opacity: 0.8;
`;

export default function HeroSection() {
  return (
    <Hero>
      <FloatingIcon>🍯</FloatingIcon>
      <FloatingIcon>🐝</FloatingIcon>
      <FloatingIcon>🌸</FloatingIcon>
      <FloatingIcon>✨</FloatingIcon>

      <HeroContent>
        <HeroTitle>🍯 عسل تارودانت الذهبي الأصلي</HeroTitle>
        <HeroSubtitle>
          أجود أنواع العسل الحر المغربي من جبال سوس ماسة، مضمون الجودة والنقاوة
        </HeroSubtitle>

        <BadgesContainer>
          <Badge>
            <span>✓</span>
            100% طبيعي
          </Badge>
          <Badge>
            <span>🚚</span>
            توصيل سريع
          </Badge>
          <Badge>
            <span>⭐</span>
            ضمان الجودة
          </Badge>
        </BadgesContainer>

        <ButtonsContainer>
          <ShopNowButton href="/products">
            تسوق الآن
            <span>→</span>
          </ShopNowButton>
          <SecondaryButton href="/about">
            اعرف المزيد
            <span>ℹ️</span>
          </SecondaryButton>
        </ButtonsContainer>
      </HeroContent>

      <ScrollIndicator onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}>
        ↓
      </ScrollIndicator>
    </Hero>
  );
}