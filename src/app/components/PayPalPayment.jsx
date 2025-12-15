'use client';

import { useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import styled from 'styled-components';
import toast from 'react-hot-toast';

const Container = styled.div`
  margin-top: 1.5rem;
  width: 100%;
  z-index: 1;
`;

const Warning = styled.div`
  background-color: #fff3cd;
  color: #856404;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  text-align: center;
  border: 1px solid #ffeeba;
`;

export default function PayPalPayment({ amount, onSuccess }) {

    // PayPal options
    const initialOptions = {
        "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test", // Fallback to "test" for development
        currency: "USD", // PayPal often requires USD or EUR for international/sandbox if MAD isn't fully supported in sandbox
        intent: "capture",
    };

    // Convert limit amount for display/test if needed. PayPal Sandbox works best with USD.
    // Assuming 1 USD approx 10 MAD for simplicity effectively in this demo context
    // or just pass the amount if the account supports MAD.
    const amountInUSD = (amount / 10).toFixed(2);

    return (
        <Container>
            {!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && (
                <Warning>
                    ⚠️ وضع التجربة: تأكد من إضافة Client ID في ملف .env.local
                </Warning>
            )}

            <PayPalScriptProvider options={initialOptions}>
                <PayPalButtons
                    style={{ layout: "vertical", shape: "rect", label: "pay" }}
                    createOrder={(data, actions) => {
                        return actions.order.create({
                            purchase_units: [
                                {
                                    amount: {
                                        value: amountInUSD, // PayPal usually expects string for value
                                    },
                                    description: "Honey Store Order",
                                },
                            ],
                        });
                    }}
                    onApprove={async (data, actions) => {
                        try {
                            const details = await actions.order.capture();
                            toast.success(`تم الدفع بنجاح بواسطة ${details.payer.name.given_name}`);
                            onSuccess(details.id); // Call the parent success handler
                        } catch (error) {
                            console.error("PayPal Capture Error:", error);
                            toast.error("حدث خطأ أثناء تأكيد الدفع");
                        }
                    }}
                    onError={(err) => {
                        console.error("PayPal Error:", err);
                        toast.error("حدث خطأ في الاتصال بـ PayPal");
                    }}
                />
            </PayPalScriptProvider>
        </Container>
    );
}
