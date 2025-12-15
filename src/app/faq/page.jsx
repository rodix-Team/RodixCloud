'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// -----------------
// DATA
// -----------------
const FAQ_DATA = [
  {
    category: 'shipping',
    id: 1,
    question: 'كم يستغرق التوصيل؟',
    answer: 'للمدن الرئيسية (الدار البيضاء، الرباط، مراكش...) يستغرق 24-48 ساعة. باقي المدن والمناطق النائية من 3 إلى 5 أيام.'
  },
  {
    category: 'shipping',
    id: 2,
    question: 'كم تكلفة الشحن؟',
    answer: 'الشحن مجاني للطلبات فوق 500 درهم. أما للطلبات الأقل، فالسعر ثابت: 30 درهم لجميع أنحاء المغرب.'
  },
  {
    category: 'products',
    id: 3,
    question: 'واش العسل طبيعي 100%؟',
    answer: 'بالتأكيد! نحن نتعامل مباشرة مع النحالة في جبال الأطلس وسوس. كل دفعة تخضع لتحاليل مخبرية لضمان الجودة والخلو من السكر المضاف.'
  },
  {
    category: 'products',
    id: 4,
    question: 'شنو هو "عسل الدغموس"؟',
    answer: 'هو عسل حار وقوي، يستخرج من نبتة الدغموس الشوكية. مشهور بفوائده في تقوية المناعة وعلاج أمراض البرد والحساسية.'
  },
  {
    category: 'orders',
    id: 5,
    question: 'كيفاش نخلص؟',
    answer: 'الدفع عند الاستلام (COD) هو الطريقة المعتمدة حالياً. كتشوف السلعة ديالك عاد كتخلص الليفرور.'
  },
  {
    category: 'orders',
    id: 6,
    question: 'واش ممكن نرجع المنتج؟',
    answer: 'طبعاً. عندك 7 أيام من تاريخ الاستلام. بشرط القارورة تكون ما تحلاتش. كنتكلفو بمصاريف الإرجاع اذا كان الغلط منا.'
  },
  {
    category: 'general',
    id: 7,
    question: 'فين كاين المحل ديالكم؟',
    answer: 'المقر الرئيسي والمخازن في تارودانت. ولكن لا نتوفر على محل للبيع المباشر حالياً، البيع يتم عبر الموقع والتوصيل لجميع المدن.'
  }
];

const CATEGORIES = [
  { id: 'all', label: 'الكل', icon: '🔍' },
  { id: 'shipping', label: 'التوصيل', icon: '🚚' },
  { id: 'products', label: 'المنتجات', icon: '🍯' },
  { id: 'orders', label: 'الطلبات', icon: '📦' },
  { id: 'general', label: 'عام', icon: 'ℹ️' },
];

// -----------------
// ANIMATIONS
// -----------------
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

// -----------------
// STYLED COMPONENTS
// -----------------
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`;

const HeroSection = styled.div`
  height: 350px;
  background: radial-gradient(circle at center, #2a2a2a 0%, #000000 100%);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  margin-bottom: 3rem;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: url('/images/custom_honey_bg.jpg') center/cover;
    opacity: 0.3;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 800px;
  text-align: center;
`;

const Title = styled(motion.h1)`
  font-size: 3rem;
  color: white;
  margin-bottom: 1rem;
  font-weight: 900;
  
  span {
    color: #F4A300;
  }
`;

const SearchInput = styled(motion.input)`
  width: 100%;
  padding: 1.2rem 2rem;
  border-radius: 50px;
  border: none;
  font-size: 1.1rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  margin-top: 1rem;
  transition: all 0.3s;
  
  &:focus {
    outline: none;
    transform: scale(1.02);
    box-shadow: 0 15px 40px rgba(244, 163, 0, 0.2);
  }
`;

const MainContent = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
`;

const CategoryTabs = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
`;

const TabButton = styled(motion.button)`
  background: ${({ $active, theme }) => $active ? theme.colors.primary : 'white'};
  color: ${({ $active }) => $active ? 'white' : '#555'};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.primary : '#eee'};
  padding: 0.8rem 1.5rem;
  border-radius: 30px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.1);
  }
`;

const AccordionItem = styled(motion.div)`
  background: white;
  margin-bottom: 1rem;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.03);
`;

const QuestionButton = styled.button`
  width: 100%;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border: none;
  cursor: pointer;
  text-align: right;
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  transition: background 0.2s;

  &:hover {
    background: #f9f9f9;
  }

  .icon {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: ${({ $isOpen, theme }) => $isOpen ? theme.colors.primary : '#f0f0f0'};
    color: ${({ $isOpen }) => $isOpen ? 'white' : '#555'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    transition: all 0.3s;
    transform: ${({ $isOpen }) => $isOpen ? 'rotate(45deg)' : 'rotate(0)'};
  }
`;

const AnswerContent = styled(motion.div)`
  padding: 0 1.5rem;
  color: #666;
  line-height: 1.8;
  overflow: hidden;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #888;
  font-size: 1.1rem;
`;

// -----------------
// PAGE COMPONENT
// -----------------

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState(null);

  const toggleOpen = (id) => setOpenId(openId === id ? null : id);

  const filteredFAQs = FAQ_DATA.filter(faq => {
    // If searching, ignore category filter (Global Search)
    const matchesCategory = searchQuery ? true : (activeCategory === 'all' || faq.category === activeCategory);
    const matchesSearch = faq.question.includes(searchQuery) || faq.answer.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <PageContainer>
      <HeroSection>
        <ContentWrapper>
          <Title initial="hidden" animate="visible" variants={fadeInUp}>
            كيفاش نقدروا <span>نعاونوك؟</span>
          </Title>
          <SearchInput
            type="text"
            placeholder="بحث عن سؤال... (مثلاً: التوصيل، الدفع)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          />
        </ContentWrapper>
      </HeroSection>

      <MainContent>
        <CategoryTabs>
          {CATEGORIES.map(cat => (
            <TabButton
              key={cat.id}
              $active={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
              whileTap={{ scale: 0.95 }}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </TabButton>
          ))}
        </CategoryTabs>

        <AnimatePresence mode="popLayout">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq) => (
              <AccordionItem
                key={faq.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
              >
                <QuestionButton
                  onClick={() => toggleOpen(faq.id)}
                  $isOpen={openId === faq.id}
                >
                  {faq.question}
                  <span className="icon">+</span>
                </QuestionButton>
                <AnimatePresence>
                  {openId === faq.id && (
                    <AnswerContent
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1, paddingBottom: '1.5rem' }}
                      exit={{ height: 0, opacity: 0, paddingBottom: 0 }}
                    >
                      {faq.answer}
                    </AnswerContent>
                  )}
                </AnimatePresence>
              </AccordionItem>
            ))
          ) : (
            <EmptyState>
              😕 ما لقينا حتى سؤال كيطابق البحث ديالك.
            </EmptyState>
          )}
        </AnimatePresence>
      </MainContent>
    </PageContainer>
  );
}
