'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { selectUserOrders } from '../../redux/slices/ordersSlice';
import StarRating from './StarRating';
import toast from 'react-hot-toast';

const FormContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const FormTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SubmitButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: #d17834;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

export default function ReviewForm({ productId, onSubmit }) {
  const router = useRouter();
  const { currentUser, isAuthenticated } = useAuth();
  const userOrders = useSelector(selectUserOrders(currentUser?.uid));

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  // Check if user purchased this product
  const hasPurchased = userOrders?.some(order =>
    order.items?.some(item => item.id === productId)
  );

  useEffect(() => {
    // Auto-fill user name if authenticated
    if (!isAuthenticated) {
      // User must be logged in to review
    }
  }, [isAuthenticated]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول لكتابة تقييم');
      router.push('/login');
      return;
    }

    if (rating === 0 || !title || !comment) {
      toast.error('الرجاء ملء جميع الحقول');
      return;
    }

    const review = {
      id: Date.now(),
      productId,
      userId: currentUser.uid,
      userName: currentUser.displayName || 'مستخدم',
      userEmail: currentUser.email,
      rating,
      title,
      comment,
      date: new Date().toISOString(),
      verified: hasPurchased, // Verified if user purchased
      helpful: 0
    };

    onSubmit(review);
    toast.success('✅ تم إضافة تقييمك!');

    // Reset form
    setRating(0);
    setTitle('');
    setComment('');
  };

  return (
    <FormContainer>
      <FormTitle>اكتب تقييمك</FormTitle>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>التقييم *</Label>
          <StarRating
            rating={rating}
            interactive
            onChange={setRating}
            size="1.5rem"
          />
        </FormGroup>

        <FormGroup>
          <Label>الاسم</Label>
          <Input
            type="text"
            value={currentUser?.displayName || 'مستخدم'}
            disabled
            style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
          />
          {hasPurchased && (
            <div style={{ color: '#10b981', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              ✅ مشتري موثق
            </div>
          )}
        </FormGroup>

        <FormGroup>
          <Label>عنوان التقييم *</Label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: منتج ممتاز"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>التعليق *</Label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="شاركنا تجربتك مع هذا المنتج..."
            required
          />
        </FormGroup>

        <SubmitButton type="submit">
          إرسال التقييم
        </SubmitButton>
      </form>
    </FormContainer>
  );
}
