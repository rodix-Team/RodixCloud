'use client';

import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist, selectIsInWishlist } from '../../redux/slices/wishlistSlice';
import toast from 'react-hot-toast';

const HeartButton = styled.button`
  background: none;
  border: none;
  font-size: ${({ size }) => size || '1.5rem'};
  cursor: pointer;
  transition: transform 0.2s;
  padding: 0.5rem;
  
  &:hover {
    transform: scale(1.2);
  }

  &:active {
    transform: scale(0.9);
  }
`;

export default function FavoriteButton({ productId, productName, size }) {
    const dispatch = useDispatch();
    const isInWishlist = useSelector(selectIsInWishlist(productId));

    const handleToggle = (e) => {
        e.stopPropagation();
        dispatch(toggleWishlist(productId));

        if (isInWishlist) {
            toast.success(`تم إزالة ${productName} من المفضلة`);
        } else {
            toast.success(`❤️ تم إضافة ${productName} للمفضلة!`);
        }
    };

    return (
        <HeartButton onClick={handleToggle} size={size} title={isInWishlist ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}>
            {isInWishlist ? '❤️' : '🤍'}
        </HeartButton>
    );
}
