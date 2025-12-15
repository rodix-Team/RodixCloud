'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// -----------------
// STYLED COMPONENTS
// -----------------

const BreadcrumbsContainer = styled.nav`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  font-size: 0.9rem;
`;

const BreadcrumbsList = styled.ol`
  list-style: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
`;

const BreadcrumbItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BreadcrumbLink = styled(Link)`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const BreadcrumbCurrent = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 600;
`;

const Separator = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  user-select: none;
`;

// -----------------
// COMPONENT
// -----------------

export default function Breadcrumbs() {
    const pathname = usePathname();

    // تحويل المسار إلى breadcrumbs
    const pathSegments = pathname.split('/').filter(segment => segment);

    // إذا كنا في الصفحة الرئيسية، لا نعرض breadcrumbs
    if (pathSegments.length === 0) {
        return null;
    }

    // خريطة لترجمة المسارات للعربية
    const pathNames = {
        'products': 'المنتجات',
        'cart': 'عربة التسوق',
        'checkout': 'إتمام الطلب',
        'about': 'من نحن',
        'contact': 'اتصل بنا',
        'faq': 'الأسئلة الشائعة',
        'wishlist': 'المفضلة',
        'orders': 'طلباتي',
        'profile': 'حسابي',
    };

    const breadcrumbs = [
        { name: 'الرئيسية', path: '/' },
        ...pathSegments.map((segment, index) => {
            const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
            // إذا كان المسار رقم (مثل product ID)، نستخدم اسم خاص
            const name = isNaN(segment) ? (pathNames[segment] || segment) : `المنتج #${segment}`;
            return { name, path };
        }),
    ];

    return (
        <BreadcrumbsContainer aria-label="Breadcrumb">
            <BreadcrumbsList>
                {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;

                    return (
                        <BreadcrumbItem key={crumb.path}>
                            {!isLast ? (
                                <>
                                    <BreadcrumbLink href={crumb.path}>{crumb.name}</BreadcrumbLink>
                                    <Separator>/</Separator>
                                </>
                            ) : (
                                <BreadcrumbCurrent>{crumb.name}</BreadcrumbCurrent>
                            )}
                        </BreadcrumbItem>
                    );
                })}
            </BreadcrumbsList>
        </BreadcrumbsContainer>
    );
}
