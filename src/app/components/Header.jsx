'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';
import { selectTotalItemsCount } from '../../redux/slices/cartSlice';
import { motion, AnimatePresence } from 'framer-motion';

// -----------------
// STYLED COMPONENTS
// -----------------
const HeaderWrapper = styled.header`
  background: linear-gradient(135deg, #F4A300 0%, #FFB82E 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 0.5rem 0;
`;

const HeaderContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.5rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.8rem;
  font-weight: 900;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1100;

  span { font-size: 2rem; }
`;

const DesktopNav = styled.nav`
  display: flex;
  gap: 1.5rem;
  align-items: center;

  @media (max-width: 900px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: rgba(255,255,255,0.9);
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s;
  padding: 0.5rem 0;
  position: relative;

  &:hover {
    color: white;
    
    &::after {
      width: 100%;
    }
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 0;
    height: 2px;
    background: white;
    transition: width 0.3s;
  }
  
  &.featured {
    background: rgba(255,255,255,0.2);
    padding: 0.5rem 1.2rem;
    border-radius: 50px;
    
    &::after { display: none; }
    
    &:hover {
      background: rgba(255,255,255,0.3);
      transform: translateY(-2px);
    }
  }
`;

const RightSection = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  z-index: 1100;
`;

const CartLink = styled(Link)`
  background-color: white;
  color: #F4A300;
  padding: 0.6rem 1.2rem; // Larger touch target
  border-radius: 50px;
  text-decoration: none;
  font-weight: 800;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.2s;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);

  &:hover {
    transform: scale(1.05);
  }

  span.icon { font-size: 1.2rem; }
`;

const CartBadge = styled.span`
  background-color: #ef4444;
  color: white;
  border-radius: 50px;
  min-width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  padding: 0 6px;
`;

// Mobile Specific
const HamburgerBtn = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  display: none;
  z-index: 1100;
  padding: 0.5rem;

  @media (max-width: 900px) {
    display: block;
  }
`;

const MobileMenu = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100vh;
  background: white;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  padding: 6rem 2rem 2rem;
  gap: 1.5rem;
  overflow-y: auto;
`;

const MobileLink = styled(Link)`
  font-size: 1.5rem;
  color: #333;
  font-weight: bold;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  &:active {
    color: #F4A300;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
  backdrop-filter: blur(5px);
`;

const UserMenuButton = styled.button`
  background: rgba(255,255,255,0.2);
  border: none;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 120%;
  left: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  min-width: 220px;
  overflow: hidden;
  opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transform: ${({ $isOpen }) => ($isOpen ? 'translateY(0)' : 'translateY(-10px)')};
  transition: all 0.2s;

  a, button {
    display: block;
    width: 100%;
    padding: 1rem;
    text-align: right;
    border: none;
    background: white;
    font-size: 1rem;
    color: #333;
    cursor: pointer;
    font-family: inherit;
    
    &:hover { background: #f9f9f9; color: #F4A300; }
  }
`;

export default function Header() {
  const router = useRouter();
  const cartItemsCount = useSelector(selectTotalItemsCount);
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  const getInitials = (name) => {
    if (!name) return '؟';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const closeMobile = () => setIsMobileMenuOpen(false);

  return (
    <HeaderWrapper>
      <HeaderContainer>
        {/* Toggle Button for Mobile */}
        <HamburgerBtn onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? '✕' : '☰'}
        </HamburgerBtn>

        <Logo href="/" onClick={closeMobile}>
          <span>🍯</span> عسل تارودانت
        </Logo>

        {/* Desktop Navigation */}
        <DesktopNav>
          <NavLink href="/">الرئيسية</NavLink>
          <NavLink href="/products">المنتجات</NavLink>
          <NavLink href="/quiz" className="featured">🧠 اكتشف عسلك</NavLink>
          <NavLink href="/orders">طلباتي</NavLink>
          <NavLink href="/about">من نحن</NavLink>
          <NavLink href="/contact">اتصل بنا</NavLink>
          <NavLink href="/faq">الأسئلة الشائعة</NavLink>
        </DesktopNav>

        {/* Right Actions */}
        <RightSection>
          {isAuthenticated ? (
            <div style={{ position: 'relative' }} onMouseLeave={() => setIsMenuOpen(false)}>
              <UserMenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {getInitials(currentUser?.displayName)}
              </UserMenuButton>

              <DropdownMenu $isOpen={isMenuOpen}>
                <Link href="/profile">👤 الملف الشخصي</Link>
                <Link href="/orders">📦 طلباتي</Link>
                <button onClick={handleLogout}>🚪 تسجيل الخروج</button>
              </DropdownMenu>
            </div>
          ) : (
            <NavLink href="/login" style={{ fontSize: '0.9rem' }}>دخول</NavLink>
          )}

          <CartLink href="/cart">
            <span className="icon">🛒</span>
            {cartItemsCount > 0 && <CartBadge>{cartItemsCount}</CartBadge>}
          </CartLink>
        </RightSection>
      </HeaderContainer>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <Overlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobile}
            />
            <MobileMenu
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <MobileLink href="/" onClick={closeMobile}>🏠 الرئيسية</MobileLink>
              <MobileLink href="/products" onClick={closeMobile}>🍯 المنتجات</MobileLink>
              <MobileLink href="/quiz" onClick={closeMobile} style={{ color: '#F4A300' }}>🧠 اكتشف عسلك</MobileLink>
              <MobileLink href="/orders" onClick={closeMobile}>📦 طلباتي</MobileLink>
              <MobileLink href="/about" onClick={closeMobile}>ℹ️ من نحن</MobileLink>
              <MobileLink href="/contact" onClick={closeMobile}>📞 اتصل بنا</MobileLink>
              <MobileLink href="/faq" onClick={closeMobile}>❓ الأسئلة الشائعة</MobileLink>

              {!isAuthenticated && (
                <MobileLink href="/login" onClick={closeMobile}>🔑 تسجيل الدخول</MobileLink>
              )}
            </MobileMenu>
          </>
        )}
      </AnimatePresence>
    </HeaderWrapper>
  );
}