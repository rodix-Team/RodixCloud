'use client';

import styled from 'styled-components';
import { useState } from 'react';

const GalleryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MainImage = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: zoom-in;
`;

const ThumbnailsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  border: 3px solid ${({ $isActive, theme }) =>
        $isActive ? theme.colors.primary : 'transparent'};
  transition: all 0.3s;
  opacity: ${({ $isActive }) => $isActive ? 1 : 0.6};

  &:hover {
    opacity: 1;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export default function ImageGallery({ images, productName }) {
    const [selectedImage, setSelectedImage] = useState(0);

    if (!images || images.length === 0) {
        return null;
    }

    return (
        <GalleryContainer>
            <MainImage
                src={images[selectedImage]}
                alt={`${productName} - صورة ${selectedImage + 1}`}
            />

            {images.length > 1 && (
                <ThumbnailsContainer>
                    {images.map((image, index) => (
                        <Thumbnail
                            key={index}
                            src={image}
                            alt={`${productName} - معاينة ${index + 1}`}
                            $isActive={selectedImage === index}
                            onClick={() => setSelectedImage(index)}
                        />
                    ))}
                </ThumbnailsContainer>
            )}
        </GalleryContainer>
    );
}
