'use client';

import styled from 'styled-components';
import { useState, useRef } from 'react';
import { storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;

const PhotoPreview = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.backgroundLight};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const Photo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Placeholder = styled.div`
  font-size: 4rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const UploadButton = styled.label`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  display: inline-block;

  &:hover {
    background: #d17834;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const UploadProgress = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

export default function PhotoUpload({ currentPhotoURL, onPhotoUploaded }) {
    const { currentUser, updateUserProfile } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [photoURL, setPhotoURL] = useState(currentPhotoURL || '');
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('الرجاء اختيار صورة');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('حجم الصورة كبير جداً (الحد الأقصى 5MB)');
            return;
        }

        setUploading(true);

        try {
            // Create a reference to the file in Firebase Storage
            const storageRef = ref(storage, `profile-photos/${currentUser.uid}/${Date.now()}_${file.name}`);

            // Upload the file
            await uploadBytes(storageRef, file);

            // Get the download URL
            const downloadURL = await getDownloadURL(storageRef);

            // Update user profile with new photo URL
            await updateUserProfile({ photoURL: downloadURL });

            setPhotoURL(downloadURL);

            if (onPhotoUploaded) {
                onPhotoUploaded(downloadURL);
            }

            toast.success('✅ تم تحديث الصورة الشخصية!');
        } catch (error) {
            console.error('Photo upload error:', error);
            toast.error('❌ فشل رفع الصورة');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Container>
            <PhotoPreview>
                {photoURL ? (
                    <Photo src={photoURL} alt="Profile" />
                ) : (
                    <Placeholder>👤</Placeholder>
                )}
            </PhotoPreview>

            <UploadButton htmlFor="photo-upload" style={{ opacity: uploading ? 0.6 : 1 }}>
                {uploading ? '⏳ جاري الرفع...' : '📸 تغيير الصورة'}
            </UploadButton>

            <HiddenInput
                id="photo-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
            />

            {uploading && <UploadProgress>جاري رفع الصورة...</UploadProgress>}
        </Container>
    );
}
