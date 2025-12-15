'use client';

import { useState } from 'react';
import styled from 'styled-components';

const ZoomContainer = styled.div`
  position: relative;
  overflow: hidden;
  cursor: zoom-in;
  border-radius: 12px;
  background: #f5f5f5;
`;

const ZoomImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  transform-origin: ${({ $x, $y }) => `${$x}% ${$y}%`};
  
  ${({ $isZoomed }) => $isZoomed && `
    transform: scale(2);
  `}
`;

export default function ImageZoom({ src, alt, className }) {
    const [isZoomed, setIsZoomed] = useState(false);
    const [position, setPosition] = useState({ x: 50, y: 50 });

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setPosition({ x, y });
    };

    const handleMouseEnter = () => {
        setIsZoomed(true);
    };

    const handleMouseLeave = () => {
        setIsZoomed(false);
        setPosition({ x: 50, y: 50 });
    };

    return (
        <ZoomContainer
            className={className}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <ZoomImage
                src={src}
                alt={alt}
                $isZoomed={isZoomed}
                $x={position.x}
                $y={position.y}
            />
        </ZoomContainer>
    );
}
