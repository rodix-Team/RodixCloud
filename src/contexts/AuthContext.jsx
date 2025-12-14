'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile,
    sendEmailVerification,
    updateEmail,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { auth } from '../lib/firebase';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Register new user
    async function register(email, password, displayName) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update display name
        await updateProfile(userCredential.user, {
            displayName: displayName
        });

        // Send email verification
        await sendEmailVerification(userCredential.user);

        return userCredential;
    }

    // Login user
    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    // Logout user
    function logout() {
        return signOut(auth);
    }

    // Reset password
    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
    }

    // Update user profile
    function updateUserProfile(displayName, photoURL) {
        return updateProfile(auth.currentUser, {
            displayName,
            photoURL
        });
    }

    // Resend email verification
    function resendVerification() {
        return sendEmailVerification(auth.currentUser);
    }

    // Update user email
    async function updateUserEmail(newEmail, currentPassword) {
        const user = auth.currentUser;

        // Re-authenticate user before email change
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Update email
        await updateEmail(user, newEmail);

        // Send verification to new email
        await sendEmailVerification(user);
    }

    // Change password
    async function changePassword(currentPassword, newPassword) {
        const user = auth.currentUser;

        // Re-authenticate user before password change
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Update password
        await updatePassword(user, newPassword);
    }

    // Sign in with Google
    async function signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        return result.user;
    }

    // Sign in with Facebook
    async function signInWithFacebook() {
        const provider = new FacebookAuthProvider();
        const result = await signInWithPopup(auth, provider);
        return result.user;
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        loading,
        isAuthenticated: !!currentUser,
        register,
        login,
        logout,
        resetPassword,
        updateUserProfile,
        updateUserEmail,
        changePassword,
        resendVerification,
        signInWithGoogle,
        signInWithFacebook
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
