'use client';

import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import styled from 'styled-components';
import toast from 'react-hot-toast';

const FormContainer = styled.form`
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const PaymentElementWrapper = styled.div`
  margin-bottom: 1.5rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: #d49500;
    transform: translateY(-2px);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fee;
  border-radius: 6px;
  text-align: center;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.6s linear infinite;
  margin-left: 0.5rem;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export default function PaymentForm({ amount, onSuccess, onError }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            toast.error('Stripe لم يتم تحميله بعد');
            return;
        }

        setIsProcessing(true);
        setErrorMessage('');

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/payment/success`,
                },
                redirect: 'if_required',
            });

            if (error) {
                console.error('Stripe Error Details:', {
                    type: error.type,
                    code: error.code,
                    message: error.message,
                    decline_code: error.decline_code
                });

                const errorMsg = error.message || 'حدث خطأ في الدفع';
                setErrorMessage(errorMsg);
                toast.error('فشل الدفع: ' + errorMsg);
                if (onError) onError(error);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                toast.success('✅ تم الدفع بنجاح!');
                if (onSuccess) onSuccess(paymentIntent);
            } else {
                console.log('Payment Intent Status:', paymentIntent?.status);
                toast.error('حالة الدفع غير معروفة');
            }
        } catch (err) {
            console.error('Payment Exception:', err);
            const errorMsg = err.message || 'حدث خطأ غير متوقع';
            setErrorMessage(errorMsg);
            toast.error('حدث خطأ في معالجة الدفع: ' + errorMsg);
            if (onError) onError(err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <FormContainer onSubmit={handleSubmit}>
            <PaymentElementWrapper>
                <PaymentElement />
            </PaymentElementWrapper>

            <SubmitButton type="submit" disabled={!stripe || isProcessing}>
                {isProcessing ? (
                    <>
                        جاري المعالجة...
                        <LoadingSpinner />
                    </>
                ) : (
                    `ادفع ${amount} درهم`
                )}
            </SubmitButton>

            {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        </FormContainer>
    );
}
