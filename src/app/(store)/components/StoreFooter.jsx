'use client';

import styled from 'styled-components';
import Link from 'next/link';

const FooterContainer = styled.footer`
  background: ${({ theme }) => theme?.colors?.dark || '#1A1A1A'};
  color: white;
  padding: 3rem 1.5rem 1.5rem;
  margin-top: auto;
`;

const FooterInner = styled.div`
  max-width: 1280px;
  margin: 0 auto;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const FooterSection = styled.div``;

const FooterTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
`;

const FooterLink = styled(Link)`
  display: block;
  color: #ccc;
  padding: 0.25rem 0;
  transition: color 0.2s;
  
  &:hover {
    color: ${({ theme }) => theme?.colors?.primary || '#F4A300'};
  }
`;

const FooterText = styled.p`
  color: #999;
  line-height: 1.6;
`;

const Copyright = styled.div`
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #333;
  color: #666;
  font-size: 0.875rem;
`;

export default function StoreFooter() {
  return (
    <FooterContainer>
      <FooterInner>
        <FooterGrid>
          <FooterSection>
            <FooterTitle>🍯 متجر العسل</FooterTitle>
            <FooterText>
              أجود أنواع العسل الطبيعي مباشرة من المناحل إلى منزلك
            </FooterText>
          </FooterSection>
          
          <FooterSection>
            <FooterTitle>روابط سريعة</FooterTitle>
            <FooterLink href="/">الرئيسية</FooterLink>
            <FooterLink href="/products">المنتجات</FooterLink>
            <FooterLink href="/about">من نحن</FooterLink>
            <FooterLink href="/contact">اتصل بنا</FooterLink>
          </FooterSection>
          
          <FooterSection>
            <FooterTitle>خدمة العملاء</FooterTitle>
            <FooterLink href="/faq">الأسئلة الشائعة</FooterLink>
            <FooterLink href="/shipping">الشحن والتوصيل</FooterLink>
            <FooterLink href="/returns">سياسة الإرجاع</FooterLink>
          </FooterSection>
          
          <FooterSection>
            <FooterTitle>تواصل معنا</FooterTitle>
            <FooterText>📞 +212 XXX XXX XXX</FooterText>
            <FooterText>✉️ info@honey-store.com</FooterText>
          </FooterSection>
        </FooterGrid>
        
        <Copyright>
          © {new Date().getFullYear()} متجر العسل. جميع الحقوق محفوظة.
        </Copyright>
      </FooterInner>
    </FooterContainer>
  );
}
