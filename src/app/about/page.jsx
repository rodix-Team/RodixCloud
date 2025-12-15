'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, useScroll, useTransform } from 'framer-motion';
import CountUp from 'react-countup';
import Link from 'next/link';
import Bee3D from '../components/Bee3D';

// -----------------
// ANIMATIONS
// -----------------
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3
    }
  }
};

// -----------------
// STYLED COMPONENTS
// -----------------
const PageContainer = styled.div`
  background: ${({ theme }) => theme.colors.background};
  overflow-x: hidden;
`;

const HeroSection = styled.div`
  height: 90vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #2a2a2a 0%, #000000 100%);
  color: white;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/images/honey-comb-pattern.png'); // Placeholder
    opacity: 0.1;
    z-index: 1;
  }
`;

const HeroContent = styled(motion.div)`
  text-align: center;
  z-index: 2;
  position: relative;
`;

const HeroTitle = styled.h1`
  font-size: 5rem;
  font-weight: 900;
  margin-bottom: 1rem;
  background: linear-gradient(to right, #FFD700, #FDB931, #FFD700);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  background-size: 200% auto;
  animation: shimmer 3s linear infinite;

  @keyframes shimmer {
    to { background-position: 200% center; }
  }

  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.5rem;
  max-width: 600px;
  margin: 0 auto;
  color: #ddd;
  line-height: 1.6;
`;

const BeeContainer = styled.div`
  position: absolute;
  top: 50%;
  right: 10%;
  width: 300px;
  height: 300px;
  transform: translateY(-50%);
  z-index: 3;

  @media (max-width: 768px) {
    width: 150px;
    height: 150px;
    top: 20%;
    right: 50%;
    transform: translate(50%, -50%);
  }
`;

const StatsSection = styled.section`
  padding: 4rem 2rem;
  background: #fff;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  text-align: center;
  margin-top: -50px;
  position: relative;
  z-index: 4;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -10px 30px rgba(0,0,0,0.1);
`;

const StatItem = styled.div`
  h3 {
    font-size: 3rem;
    color: ${({ theme }) => theme.colors.primary};
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  p {
    font-size: 1.1rem;
    color: #666;
  }
`;

const StorySection = styled.section`
  padding: 6rem 2rem;
  background: linear-gradient(180deg, #fff 0%, #FFF8E1 100%);
`;

const SectionHeader = styled(motion.div)`
  text-align: center;
  margin-bottom: 5rem;

  h2 {
    font-size: 3rem;
    color: #333;
    margin-bottom: 1rem;
  }
  
  .line {
    width: 60px;
    height: 4px;
    background: ${({ theme }) => theme.colors.primary};
    margin: 0 auto;
    border-radius: 2px;
  }
`;

const Timeline = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 4px;
    background: #FFD700;
    transform: translateX(-50%);
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    &::before {
      left: 20px;
    }
  }
`;

const TimelineItem = styled(motion.div)`
  display: flex;
  justify-content: ${({ $position }) => $position === 'left' ? 'flex-end' : 'flex-start'};
  padding-bottom: 4rem;
  width: 50%;
  margin-left: ${({ $position }) => $position === 'right' ? '50%' : '0'};
  margin-right: ${({ $position }) => $position === 'left' ? '50%' : '0'};
  position: relative;

  @media (max-width: 768px) {
    width: 100%;
    margin: 0;
    padding-left: 50px;
    justify-content: flex-start;
  }

  &::after {
    content: '🐝';
    font-size: 1.5rem;
    position: absolute;
    top: 0;
    ${({ $position }) => $position === 'left' ? 'right: -20px;' : 'left: -20px;'}
    background: #fff;
    border: 2px solid #FFD700;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;

    @media (max-width: 768px) {
      left: 0;
      right: auto;
    }
  }
`;

const TimelineContent = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  border: 1px solid rgba(255,255,255,0.5);
  max-width: 400px;
  
  h3 {
    font-size: 1.5rem;
    color: #d17834;
    margin-bottom: 1rem;
  }

  p {
    line-height: 1.6;
    color: #555;
  }
`;

const ValuesSection = styled.section`
  padding: 6rem 2rem;
  background: url('/images/custom_honey_bg.jpg') center/cover fixed;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.6);
  }
`;

const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const ValueCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2.5rem;
  border-radius: 20px;
  color: white;
  text-align: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    background: rgba(255, 255, 255, 0.15);
  }

  .icon {
    font-size: 3rem;
    margin-bottom: 1.5rem;
  }

  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #FFD700;
  }
`;

const CTASection = styled.section`
  text-align: center;
  padding: 6rem 2rem;
  background: #111;
  color: white;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background: linear-gradient(45deg, #F4A300, #FFD700);
  color: #000;
  padding: 1rem 3rem;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 2rem;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

// -----------------
// PAGE COMPONENT
// -----------------

export default function AboutPage() {
  return (
    <PageContainer>
      {/* Hero Section */}
      <HeroSection>
        <HeroContent
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <HeroTitle>من نحن؟</HeroTitle>
          <HeroSubtitle>
            رحلة العسل من قلب جبال الأطلس إلى مائدتكم.<br />
            قصة عشق للطبيعة والجودة.
          </HeroSubtitle>
        </HeroContent>
        <BeeContainer>
          {/* The 3D Bee accompanies user */}
          <Bee3D isMuted={true} />
        </BeeContainer>
      </HeroSection>

      {/* Live Stats */}
      <StatsSection>
        <StatItem>
          <h3><CountUp end={5000} duration={2.5} suffix="+" /></h3>
          <p>زبون سعيد</p>
        </StatItem>
        <StatItem>
          <h3><CountUp end={10} duration={2.5} suffix="+" /></h3>
          <p>سنوات خبرة</p>
        </StatItem>
        <StatItem>
          <h3><CountUp end={100} duration={2.5} suffix="%" /></h3>
          <p>عسل طبيعي</p>
        </StatItem>
        <StatItem>
          <h3><CountUp end={24} duration={2.5} suffix="/7" /></h3>
          <p>دعم متواصل</p>
        </StatItem>
      </StatsSection>

      {/* Story Timeline */}
      <StorySection>
        <SectionHeader
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>قصتنا</h2>
          <div className="line"></div>
        </SectionHeader>

        <Timeline>
          <TimelineItem $position="left" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <TimelineContent>
              <h3>🌿 البداية (2014)</h3>
              <p>بدأت رحلتنا بشغف بسيط للعسل الحر. كنا مجرد هواة نجمع العسل من خلايا صغيرة في نواحي تارودانت، بهدف تقديم منتج نقي للعائلة والأصدقاء.</p>
            </TimelineContent>
          </TimelineItem>

          <TimelineItem $position="right" initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <TimelineContent>
              <h3>🏔️ التوسع (2016-2019)</h3>
              <p>كبر الحلم! بدأنا التواصل مع شيوخ النحالين في جبال سوس والأطلس. تعلمنا أسرار المهنة وتوسعنا لنشمل أنواعاً نادرة مثل عسل الزعتر والدغموس.</p>
            </TimelineContent>
          </TimelineItem>

          <TimelineItem $position="left" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <TimelineContent>
              <h3>✨ العواد اليوم</h3>
              <p>اليوم، "العواد" هو علامة تجارية موثوقة. نوصل العسل لآلاف البيوت المغربية، مع ضمان الجودة 100% وسياسة استرجاع تحترم الزبون.</p>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </StorySection>

      {/* Values (Glassmorphism) */}
      <ValuesSection>
        <SectionHeader style={{ color: 'white' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 style={{ color: 'white' }}>علاش تختارنا؟</h2>
          <div className="line" style={{ background: '#FFD700' }}></div>
        </SectionHeader>

        <ValuesGrid>
          <ValueCard whileHover={{ y: -10 }}>
            <div className="icon">🛡️</div>
            <h3>ضمان الجودة</h3>
            <p>كل قطرة عسل خضعت لفحوصات دقيقة. إذا مش عاجبك، فلوسك ترجع ليك.</p>
          </ValueCard>

          <ValueCard whileHover={{ y: -10 }}>
            <div className="icon">🚛</div>
            <h3>توصيل لجميع المدن</h3>
            <p>من طنجة للكويرة، العسل يوصلك فين ما كنتي وفي ظروف تخزين مثالية.</p>
          </ValueCard>

          <ValueCard whileHover={{ y: -10 }}>
            <div className="icon">🤝</div>
            <h3>معاملة طيبة</h3>
            <p>زبناؤنا هم عائلتنا. فريقنا واجد يجاوبك وينصحك بأي وقت.</p>
          </ValueCard>
        </ValuesGrid>
      </ValuesSection>

      {/* Final CTA */}
      <CTASection>
        <h2>جاهز للدخول لعالم العسل الحقيقي؟</h2>
        <p style={{ marginTop: '1rem', color: '#aaa' }}>اكتشف تشكيلتنا الفاخرة دابا.</p>
        <CTAButton href="/products">تسوق الآن 🍯</CTAButton>
      </CTASection>

    </PageContainer>
  );
}
