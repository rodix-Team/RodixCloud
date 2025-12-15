'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Link from 'next/link';

// -----------------
// ANIMATIONS
// -----------------
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

// -----------------
// STYLED COMPONENTS
// -----------------

const PageWrapper = styled.div`
  background: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  padding-bottom: 4rem;
`;

const HeroSection = styled.div`
  height: 40vh;
  background: radial-gradient(circle at center, #2a2a2a 0%, #000000 100%);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  margin-bottom: -100px; // Overlap effect
  padding-bottom: 100px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: url('/images/custom_honey_bg.jpg') center/cover;
    opacity: 0.3;
  }
`;

const HeroTitle = styled(motion.h1)`
  font-size: 3.5rem;
  font-weight: 900;
  margin-bottom: 1rem;
  z-index: 2;
  background: linear-gradient(to right, #FFD700, #FDB931);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.2rem;
  color: #ddd;
  z-index: 2;
  max-width: 600px;
  padding: 0 1rem;
`;

const ContentContainer = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 10;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const InfoColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ContactCard = styled(motion.a)`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  border: 1px solid transparent;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.1);
    border-color: ${({ theme }) => theme.colors.primary};
  }

  .icon-box {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #FFD700 0%, #F57C00 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    color: white;
  }

  .info {
    h3 {
      font-size: 1.1rem;
      font-weight: bold;
      color: #333;
      margin-bottom: 0.3rem;
    }
    p {
      color: #666;
      font-size: 0.95rem;
      margin: 0;
    }
  }
`;

const MapCard = styled(motion.div)`
  background: #222;
  border-radius: 16px;
  overflow: hidden;
  height: 250px;
  position: relative;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  
  iframe {
    width: 100%;
    height: 100%;
    border: 0;
    opacity: 0.8;
  }

  &::after {
    content: 'طريق تارودانت - أكادير';
    position: absolute;
    bottom: 15px;
    right: 15px;
    background: white;
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: bold;
    color: black;
  }
`;

const FormWrapper = styled(motion.div)`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  padding: 3rem;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.5);

  h2 {
    margin-bottom: 2rem;
    color: #333;
    font-size: 1.8rem;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;
  position: relative;

  input, textarea {
    width: 100%;
    padding: 1.2rem;
    background: #f8f9fa;
    border: 2px solid transparent;
    border-radius: 12px;
    font-size: 1rem;
    transition: all 0.3s;
    font-family: inherit;

    &:focus {
      outline: none;
      background: white;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 4px rgba(244, 163, 0, 0.1);
    }
  }

  textarea {
    min-height: 150px;
    resize: vertical;
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 1.2rem;
  background: linear-gradient(135deg, #222 0%, #444 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    background: linear-gradient(135deg, #000 0%, #222 100%);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const FAQSection = styled.div`
  margin-top: 4rem;
  
  h2 {
    text-align: center;
    margin-bottom: 2rem;
    font-size: 2rem;
  }
`;

const FAQGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const FAQCard = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #eee;

  h4 {
    color: #d17834;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }
  p {
    font-size: 0.95rem;
    color: #666;
    margin: 0;
  }
`;

const SuccessOverlay = styled(motion.div)`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  z-index: 20;
  
  .icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  h3 { font-size: 1.5rem; color: #10b981; }
  p { color: #666; }
`;

// -----------------
// PAGE COMPONENT
// -----------------

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSent(true);
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setIsSent(false), 5000);
  };

  return (
    <PageWrapper>
      <HeroSection>
        <HeroTitle initial="hidden" animate="visible" variants={fadeInUp}>
          مركز خدمة الزبناء
        </HeroTitle>
        <HeroSubtitle initial="hidden" animate="visible" variants={fadeInUp}>
          نحن هنا للاستماع إليك. وسيلة تواصل سريعة، مباشرة، وآمنة.
        </HeroSubtitle>
      </HeroSection>

      <ContentContainer>
        <Grid>
          {/* Left Column: Contact Info */}
          <InfoColumn>
            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              <ContactCard href="tel:+212600000000" variants={fadeInUp}>
                <div className="icon-box">📞</div>
                <div className="info">
                  <h3>اتصل بنا</h3>
                  <p>+212 6xx xxx xxx</p>
                </div>
              </ContactCard>

              <ContactCard href="mailto:contact@honey.ma" variants={fadeInUp} style={{ marginTop: '1rem' }}>
                <div className="icon-box">📧</div>
                <div className="info">
                  <h3>راسلنا</h3>
                  <p>contact@honeytaroudant.ma</p>
                </div>
              </ContactCard>

              <ContactCard href="https://wa.me/212600000000" variants={fadeInUp} style={{ marginTop: '1rem' }}>
                <div className="icon-box">💬</div>
                <div className="info">
                  <h3>واتساب</h3>
                  <p>اجابة فورية (24/7)</p>
                </div>
              </ContactCard>
            </motion.div>

            <MapCard initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              {/* Using a static map image or placeholder style */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110502.60389552706!2d-8.956799557685608!3d30.47029511671966!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xdb3b6e80b263307%3A0x6b49071cb2f5451!2sTaroudant!5e0!3m2!1sen!2sma!4v1709400000000!5m2!1sen!2sma"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ filter: 'grayscale(100%) invert(92%) contrast(83%)' }}
              ></iframe>
            </MapCard>
          </InfoColumn>

          {/* Right Column: Glass Form */}
          <FormWrapper
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {isSent && (
              <SuccessOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="icon">✅</div>
                <h3>تم الإرسال بنجاح!</h3>
                <p>سيتصل بك فريقنا في أقرب وقت.</p>
              </SuccessOverlay>
            )}

            <h2>أرسل رسالة</h2>
            <form onSubmit={handleSubmit}>
              <InputGroup>
                <input
                  type="text"
                  placeholder="الاسم الكامل"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </InputGroup>
              <InputGroup>
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </InputGroup>
              <InputGroup>
                <textarea
                  placeholder="كيف يمكننا مساعدتك؟"
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  required
                ></textarea>
              </InputGroup>
              <SubmitBtn type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال الآن 🚀'}
              </SubmitBtn>
            </form>
          </FormWrapper>
        </Grid>

        {/* Quick FAQ */}
        <FAQSection>
          <h2>أسئلة متكررة</h2>
          <FAQGrid>
            <FAQCard whileHover={{ y: -5 }}>
              <h4>📦 شحال ديال الوقت كياخد التوصيل؟</h4>
              <p>مابين 24 و 48 ساعة للمدن الكبرى، و 3 أيام للمناطق النائية.</p>
            </FAQCard>
            <FAQCard whileHover={{ y: -5 }}>
              <h4>🛡️ واش كاين ضمان؟</h4>
              <p>نعم، ضمان استرجاع الأموال 100% اذا لم يعجبك المنتوج لأي سبب.</p>
            </FAQCard>
            <FAQCard whileHover={{ y: -5 }}>
              <h4>💳 طرق الدفع المتوفرة؟</h4>
              <p>الدفع نقداً عند الاستلام (COD) هو الطريقة المعتمدة حالياً.</p>
            </FAQCard>
          </FAQGrid>
        </FAQSection>

      </ContentContainer>
    </PageWrapper>
  );
}
