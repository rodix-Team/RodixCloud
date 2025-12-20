'use client';

import styled from 'styled-components';

const AvatarContainer = styled.div`
  width: ${({ $size }) => $size || '40px'};
  height: ${({ $size }) => $size || '40px'};
  border-radius: 50%;
  background: linear-gradient(135deg, #F4A300 0%, #FFB82E 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ $fontSize }) => $fontSize || '1.5rem'};
  box-shadow: 0 2px 8px rgba(244, 163, 0, 0.3);
`;

export default function BeeAvatar({ size = '40px', fontSize = '1.5rem' }) {
    return (
        <AvatarContainer $size={size} $fontSize={fontSize}>
            🐝
        </AvatarContainer>
    );
}
