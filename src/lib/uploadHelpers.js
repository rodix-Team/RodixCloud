// Upload utilities for Firebase Storage
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload user avatar to Firebase Storage
 * @param {File} file - Image file to upload
 * @param {string} userId - User ID for unique path
 * @returns {Promise<string>} - Download URL of uploaded image
 */
export const uploadUserAvatar = async (file, userId) => {
    if (!file || !userId) {
        throw new Error('File and userId are required');
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        throw new Error('نوع الملف غير مدعوم. استخدم JPG, PNG, GIF أو WebP');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        throw new Error('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت');
    }

    try {
        // Create unique filename
        const timestamp = Date.now();
        const filename = `avatar_${userId}_${timestamp}.${file.name.split('.').pop()}`;
        const storageRef = ref(storage, `avatars/${userId}/${filename}`);

        // Upload file
        const snapshot = await uploadBytes(storageRef, file, {
            contentType: file.type,
            customMetadata: {
                uploadedBy: userId,
                uploadedAt: new Date().toISOString()
            }
        });

        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        return downloadURL;
    } catch (error) {
        console.error('Upload error:', error);
        throw new Error('فشل رفع الصورة. حاول مرة أخرى');
    }
};

/**
 * Delete user's old avatar
 * @param {string} photoURL - URL of the image to delete
 */
export const deleteUserAvatar = async (photoURL) => {
    if (!photoURL || !photoURL.includes('firebase')) {
        return; // Not a Firebase URL, skip
    }

    try {
        const imageRef = ref(storage, photoURL);
        await deleteObject(imageRef);
    } catch (error) {
        console.error('Delete error:', error);
        // Don't throw, just log - deleting is optional
    }
};
