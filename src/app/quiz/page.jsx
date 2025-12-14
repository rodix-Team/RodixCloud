'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// -----------------
// DATA & LOGIC
// -----------------
const QUESTIONS = [
  {
    id: 'goal',
    text: 'أشنو هو الهدف الرئيسي ديالك من العسل؟',
    options: [
      { id: 'health', icon: '💊', label: 'علاج وتقوية المناعة', desc: 'باغي نحمي صحتي وصحة عائلتي' },
      { id: 'daily', icon: '🥞', label: 'فطور واستهلاك يومي', desc: 'لذة ومذاق رائع فوق البغرير والمسمن' },
      { id: 'gift', icon: '🎁', label: 'هدية راقية', desc: 'باغي نهدي شي حاجة هموية للأحباب' },
    ]
  },
  {
    id: 'taste',
    text: 'كيفاش كيعجبك مذاق العسل؟',
    options: [
      { id: 'strong', icon: '🔥', label: 'قاصح وحار', desc: 'مذاق مجهد كيتحس بيه فالحلق' },
      { id: 'sweet', icon: '🍭', label: 'حلو وخفيف', desc: 'مذاق بنين وكيعجب الدراري الصغار' },
      { id: 'balanced', icon: '⚖️', label: 'متوازن', desc: 'ماشي قاصح بزاف وماشي حلو بزاف' },
    ]
  }
];

// Mapped to actual IDs from productsSlice.js
// 1: Thyme (Strong/Health)
// 2: Eucalyptus (Balanced/Health)
// 3: Lemon (Sweet/Daily)
// 4: Sidr (Premium/Sweet/Health)
// 5: Wildflower (Balanced/Daily)
// 11: Black Seed (Health/Strong)

const RECOMMENDATIONS = {
  'health-strong': {
    name: 'عسل الزعتر الجبلي',
    image: '/images/honey_thyme.jpg',
    price: '150 درهم',
    desc: 'أفضل خيار للمناعة والجهاز التنفسي. مذاق قوي وفوائد صحية لا تحصى.',
    link: '/products/1'
  },
  'health-sweet': {
    name: 'عسل السدر الملكي',
    image: '/images/sidr.jpg',
    price: '280 درهم',
    desc: 'عسل فاخر يجمع بين المذاق الحلو والفوائد العلاجية القوية. ممتاز للمعدة.',
    link: '/products/4'
  },
  'health-balanced': {
    name: 'عسل الأوكالبتوس',
    image: '/images/honey_eucalyptus.jpg',
    price: '120 درهم',
    desc: 'ممتاز للصدر والحلق، بمذاق متوازن ومنعش. خيار طبيعي للحماية من البرد.',
    link: '/products/2'
  },
  'daily-strong': {
    name: 'عسل الزعتر الجبلي',
    image: '/images/honey_thyme.jpg',
    price: '150 درهم',
    desc: 'اذا كنت عزيز عليك المذاق القوي فالفطور، الزعتر هو احسن اختيار باش تبدا نهارك.',
    link: '/products/1'
  },
  'daily-sweet': {
    name: 'عسل الليمون الفاخر',
    image: '/images/honey_lemon.jpg',
    price: '165 درهم',
    desc: 'خفيف، منعش، وكيعجب كلشي. هو اللي كيجي واعر مع الخبز والمسمن.',
    link: '/products/3'
  },
  'daily-balanced': {
    name: 'عسل الزهور البرية',
    image: '/images/bzahur.jpg',
    price: '135 درهم',
    desc: 'عسل متعدد الأزهار، مذاقه كيعجب الكبير والصغير ومثالي للاستعمال اليومي.',
    link: '/products/5'
  },
  'gift-strong': {
    name: 'عسل الحبة السوداء',
    image: '/images/bzahur.jpg',
    price: '175 درهم',
    desc: 'هدية فيها الشفاء والبركة. عسل الحبة السوداء معروف بفوائده العظيمة.',
    link: '/products/11'
  },
  'gift-sweet': {
    name: 'عسل السدر الملكي (فاخر)',
    image: '/images/sidr.jpg',
    price: '280 درهم',
    desc: 'الذهب السائل. عسل السدر هو أرقى ما يمكن تقدمه كهدية للأحباب.',
    link: '/products/4'
  },
  'gift-balanced': {
    name: 'عسل الجينسنغ الملكي',
    image: '/images/sidr.jpg',
    price: '250 درهم',
    desc: 'هدية الطاقة والحيوية. عسل ممزوج بالجينسنغ لتجربة فريدة.',
    link: '/products/12'
  }
};

// -----------------
// STYLED COMPONENTS
// -----------------
const QuizContainer = styled.div`
  min-height: 100vh;
  background: url('/images/custom_honey_bg.jpg') center/cover fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.6);
  }

  @media (max-width: 768px) {
    padding: 1rem;
    background-attachment: scroll;
  }
`;

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  width: 100%;
  max-width: 700px;
  min-height: 500px;
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    min-height: auto;
    border-radius: 16px;
  }
`;

const Progress = styled.div`
  width: 100%;
  height: 6px;
  background: #eee;
  border-radius: 3px;
  margin-bottom: 2rem;
  overflow: hidden;

  .bar {
    height: 100%;
    background: ${({ theme }) => theme.colors.primary};
    transition: width 0.5s ease;
  }
`;

const QuestionTitle = styled(motion.h2)`
  font-size: 2rem;
  color: #333;
  margin-bottom: 3rem;
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 2rem;
  }
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const OptionButton = styled(motion.button)`
  background: white;
  border: 2px solid #eee;
  border-radius: 16px;
  padding: 2rem 1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
  }

  .icon {
    font-size: 3rem;
  }
  
  h3 {
    font-size: 1.2rem;
    color: #333;
    margin: 0;
  }
  
  p {
    font-size: 0.9rem;
    color: #777;
    margin: 0;
    line-height: 1.4;
  }
`;

const ResultContent = styled(motion.div)`
  text-align: center;

  .confetti {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 2.5rem;
    color: #d17834;
    margin-bottom: 0.5rem;
    
    @media (max-width: 768px) {
      font-size: 1.8rem;
    }
  }

  h3 {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 1.5rem;
    
    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
  }

  .desc {
    font-size: 1.1rem;
    color: #555;
    margin-bottom: 2rem;
    line-height: 1.8;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
    
    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }

  .price {
    font-size: 1.8rem;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 2rem;
    display: block;
    
    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }
`;

const CTAButton = styled(Link)`
  background: linear-gradient(45deg, #F4A300, #FFD700);
  color: black;
  padding: 1rem 3rem;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: bold;
  text-decoration: none;
  display: inline-block;
  box-shadow: 0 10px 25px rgba(244, 163, 0, 0.3);
  transition: all 0.3s;
  margin: 0.5rem;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 35px rgba(244, 163, 0, 0.4);
  }

  @media (max-width: 768px) {
    padding: 0.9rem 2.5rem;
    font-size: 1.1rem;
    width: 100%;
    margin: 0.5rem 0;
  }
`;

// -----------------
// COMPONENT
// -----------------

export default function HoneyQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const handleAnswer = (optionId) => {
    const currentQuestion = QUESTIONS[step];
    const newAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      // Calculate Result
      const key = `${newAnswers.goal}-${newAnswers.taste}`;
      setResult(RECOMMENDATIONS[key] || RECOMMENDATIONS['health-strong']); // Default fallback
    }
  };

  const restartQuiz = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
  };

  return (
    <QuizContainer>
      <AnimatePresence mode="wait">
        {!result ? (
          <Card
            key="question-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <Progress>
              <div className="bar" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}></div>
            </Progress>

            <QuestionTitle
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={step}
            >
              {QUESTIONS[step].text}
            </QuestionTitle>

            <OptionsGrid>
              {QUESTIONS[step].options.map((option) => (
                <OptionButton
                  key={option.id}
                  onClick={() => handleAnswer(option.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="icon">{option.icon}</span>
                  <h3>{option.label}</h3>
                  <p>{option.desc}</p>
                </OptionButton>
              ))}
            </OptionsGrid>
          </Card>
        ) : (
          <Card
            key="result-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <ResultContent>
              <div className="confetti">🎉</div>
              <h2>لقينا ليك العسل المثالي!</h2>
              <h3>{result.name}</h3>
              <p className="desc">{result.desc}</p>
              <span className="price">{result.price}</span>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                <CTAButton href={result.link}>شراء الآن 🛒</CTAButton>
                <button
                  onClick={restartQuiz}
                  style={{ background: 'transparent', border: 'none', color: '#777', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  إعادة الكويز 🔄
                </button>
              </div>
            </ResultContent>
          </Card>
        )}
      </AnimatePresence>
    </QuizContainer>
  );
}
