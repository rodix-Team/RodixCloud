'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import { useState } from 'react';
import { selectCartTotalItems } from '@/redux/slices/cartSlice';
import { LocaleSelector } from '@/components/LocaleSelector';

const HeaderContainer = styled.header`
  background: white;
  box-shadow: ${({ theme }) => theme?.shadows?.sm || '0 2px 4px rgba(0,0,0,0.08)'};
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderInner = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    color: ${({ theme }) => theme?.colors?.primaryDark || '#D68910'};
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: ${({ theme }) => theme?.colors?.textPrimary || '#2C2C2C'};
  font-weight: 500;
  transition: color 0.2s;
  
  &:hover {
    color: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CartButton = styled(Link)`
  position: relative;
  padding: 0.5rem;
  border-radius: 50%;
  background: ${({ theme }) => theme?.colors?.backgroundDark || '#F5F5F5'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
    color: white;
  }
`;

const CartBadge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background: ${({ theme }) => theme?.colors?.error || '#F44336'};
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MobileMenuButton = styled.button`
  display: none;
  padding: 0.5rem;
  background: none;
  border: none;
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileMenu = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 80%;
  max-width: 300px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 20px rgba(0,0,0,0.15);
  padding: 2rem;
  z-index: 200;
  transform: translateX(${({ $isOpen }) => ($isOpen ? '0' : '100%')});
  transition: transform 0.3s ease;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 150;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transition: all 0.3s;
`;

const MobileNavLink = styled(Link)`
  display: block;
  padding: 1rem 0;
  font-size: 1.125rem;
  color: ${({ theme }) => theme?.colors?.textPrimary || '#2C2C2C'};
  border-bottom: 1px solid #eee;
`;

export default function StoreHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItemsCount = useSelector(selectCartTotalItems);

  return (
    <HeaderContainer>
      <HeaderInner>
        <Logo href="/">🍯 متجر العسل</Logo>

        <Nav>
          <NavLink href="/">الرئيسية</NavLink>
          <NavLink href="/products">المنتجات</NavLink>
          <NavLink href="/about">من نحن</NavLink>
          <NavLink href="/contact">اتصل بنا</NavLink>
        </Nav>

        <Actions>
          <LocaleSelector />

          <CartButton href="/cart">
            <ShoppingCart size={22} />
            {cartItemsCount > 0 && <CartBadge>{cartItemsCount}</CartBadge>}
          </CartButton>

          <MobileMenuButton onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </MobileMenuButton>
        </Actions>
      </HeaderInner>

      {/* Mobile Menu */}
      <Overlay $isOpen={mobileMenuOpen} onClick={() => setMobileMenuOpen(false)} />
      <MobileMenu $isOpen={mobileMenuOpen}>
        <button
          onClick={() => setMobileMenuOpen(false)}
          style={{ background: 'none', border: 'none', marginBottom: '2rem' }}
        >
          <X size={24} />
        </button>
        <MobileNavLink href="/" onClick={() => setMobileMenuOpen(false)}>الرئيسية</MobileNavLink>
        <MobileNavLink href="/products" onClick={() => setMobileMenuOpen(false)}>المنتجات</MobileNavLink>
        <MobileNavLink href="/about" onClick={() => setMobileMenuOpen(false)}>من نحن</MobileNavLink>
        <MobileNavLink href="/contact" onClick={() => setMobileMenuOpen(false)}>اتصل بنا</MobileNavLink>
        <MobileNavLink href="/cart" onClick={() => setMobileMenuOpen(false)}>
          🛒 السلة ({cartItemsCount})
        </MobileNavLink>
      </MobileMenu>
    </HeaderContainer>
  );
}
