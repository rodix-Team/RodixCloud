'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Container = styled.div`
  margin-top: 1.5rem;
  width: 100%;
`;

const PayButton = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #0055a4 0%, #003366 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  box-shadow: 0 4px 15px rgba(0, 85, 164, 0.3);

  &:hover {
    box-shadow: 0 6px 20px rgba(0, 85, 164, 0.4);
  }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const CMIModal = styled(motion.div)`
  background: white;
  width: 100%;
  max-width: 450px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  background: #f8f9fa;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;

  img {
    height: 30px;
  }
`;

const ModalContent = styled.div`
  padding: 2rem;
  text-align: center;
`;

const Loader = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0055a4;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SecureBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #28a745;
  font-size: 0.9rem;
  margin-top: 1rem;
  font-weight: 500;
`;

export default function CMIPayment({ amount, onSuccess }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [step, setStep] = useState('redirect'); // redirect, payment, success

    const handlePayment = () => {
        setIsProcessing(true);
        setShowModal(true);

        // Simulate redirection delay
        setTimeout(() => {
            setStep('payment');
        }, 2000);
    };

    const confirmPayment = () => {
        setStep('processing');

        // Simulate bank processing
        setTimeout(() => {
            setStep('success');
            setTimeout(() => {
                onSuccess(`CMI-${Date.now()}`); // Generate fake CMI transaction ID
                setShowModal(false);
            }, 1500);
        }, 2500);
    };

    return (
        <Container>
            <PayButton
                onClick={handlePayment}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <span>🇲🇦</span>
                <span>الدفع ببطاقة بنكية مغربية (CMI)</span>
            </PayButton>

            <AnimatePresence>
                {showModal && (
                    <ModalOverlay
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <CMIModal
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <Header>
                                <span style={{ fontWeight: 'bold', color: '#0055a4' }}>CMI Secure Payment</span>
                                <span style={{ fontSize: '0.8rem', color: '#666' }}>{amount} MAD</span>
                            </Header>

                            <ModalContent>
                                {step === 'redirect' && (
                                    <>
                                        <Loader />
                                        <h3>جاري الاتصال بالمركز النقدي...</h3>
                                        <p style={{ color: '#666', marginTop: '0.5rem' }}>نرجو الانتظار قليلاً</p>
                                    </>
                                )}

                                {step === 'payment' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
                                        <h3 style={{ marginBottom: '0.5rem' }}>بوابة الدفع الآمنة</h3>
                                        <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                            هذه محاكاة لعملية الدفع عبر CMI.
                                            <br />
                                            في الوضع الحقيقي، ستدفع هنا.
                                        </p>
                                        <PayButton onClick={confirmPayment} style={{ width: '100%', margin: '0 auto' }}>
                                            تأكيد الدفع (Simulation)
                                        </PayButton>
                                        <SecureBadge>
                                            🔒 100% CMI Secured
                                        </SecureBadge>
                                    </motion.div>
                                )}

                                {step === 'processing' && (
                                    <>
                                        <Loader />
                                        <h3>جاري معالجة العملية...</h3>
                                        <p style={{ color: '#666' }}>التحقق من الرصيد البنكي</p>
                                    </>
                                )}

                                {step === 'success' && (
                                    <>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                                        <h3>تمت العملية بنجاح!</h3>
                                    </>
                                )}
                            </ModalContent>
                        </CMIModal>
                    </ModalOverlay>
                )}
            </AnimatePresence>
        </Container>
    );
}
