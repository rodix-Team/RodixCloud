'use client';

import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const FormContainer = styled.form`
  margin-top: 1rem;
`;

const PaymentButton = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  background: black;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff3333;
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
`;

export default function CheckoutForm({ amount, onSuccess }) {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
        });

        if (error) {
            setErrorMessage(error.message);
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess(paymentIntent.id);
        } else {
            setErrorMessage('حدث خطأ غير متوقع.');
            setIsProcessing(false);
        }
    };

    return (
        <FormContainer onSubmit={handleSubmit}>
            <PaymentElement />
            {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
            <PaymentButton
                disabled={!stripe || isProcessing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {isProcessing ? 'جاري المعالجة...' : `ادفع ${amount} درهم`}
            </PaymentButton>
        </FormContainer>
    );
}
