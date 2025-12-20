'use client';

import styled from 'styled-components';
import { motion } from 'framer-motion';

const ActionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.backgroundLight};
  border-top: 1px solid #e0e0e0;
`;

const ActionButton = styled(motion.button)`
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.textPrimary};

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(244, 163, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Icon = styled.span`
  font-size: 1.2rem;
`;

const QUICK_ACTIONS = [
    {
        id: 'products',
        icon: '🍯',
        label: 'أنواع العسل',
        message: 'شوف أنواع العسل'
    },
    {
        id: 'recommendation',
        icon: '🎯',
        label: 'العسل المناسب',
        message: 'شنو العسل المناسب ليا؟'
    },
    {
        id: 'recipes',
        icon: '📖',
        label: 'وصفات',
        message: 'عندك وصفات بالعسل؟'
    },
    {
        id: 'benefits',
        icon: '💡',
        label: 'الفوائد',
        message: 'شنو فوائد العسل؟'
    }
];

export default function QuickActions({ onActionClick, disabled = false }) {
    const handleClick = (action) => {
        if (!disabled && onActionClick) {
            onActionClick(action.message);
        }
    };

    return (
        <ActionsContainer>
            {QUICK_ACTIONS.map((action, index) => (
                <ActionButton
                    key={action.id}
                    onClick={() => handleClick(action)}
                    disabled={disabled}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Icon>{action.icon}</Icon>
                    <span>{action.label}</span>
                </ActionButton>
            ))}
        </ActionsContainer>
    );
}
