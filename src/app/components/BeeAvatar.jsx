'use client';

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const AvatarContainer = styled(motion.div)`
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const BeeIcon = styled(motion.div)`
  font-size: 3.5rem;
  line-height: 1;
  user-select: none;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
`;

const ExpressionBubble = styled(motion.div)`
  position: absolute;
  top: -10px;
  right: -10px;
  font-size: 1.5rem;
  background: white;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const NameTag = styled(motion.div)`
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const EXPRESSIONS = {
    happy: '😊',
    thinking: '🤔',
    talking: '💬',
    waving: '👋',
    excited: '🎉'
};

export default function BeeAvatar({
    expression = 'happy',
    showName = true,
    onClick
}) {
    const [isHovered, setIsHovered] = useState(false);

    // Bounce animation
    const bounceAnimation = {
        y: [0, -10, 0],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    };

    // Wiggle animation on hover
    const wiggleAnimation = {
        rotate: [0, -10, 10, -10, 0],
        transition: {
            duration: 0.5,
            ease: "easeInOut"
        }
    };

    return (
        <AvatarContainer
            animate={isHovered ? wiggleAnimation : bounceAnimation}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={onClick}
            whileTap={{ scale: 0.9 }}
        >
            {/* Main Bee Icon */}
            <BeeIcon
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20
                }}
            >
                🐝
            </BeeIcon>

            {/* Expression Bubble */}
            {expression && EXPRESSIONS[expression] && (
                <ExpressionBubble
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        delay: 0.2
                    }}
                >
                    {EXPRESSIONS[expression]}
                </ExpressionBubble>
            )}

            {/* Name Tag */}
            {showName && (
                <NameTag
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    العواد
                </NameTag>
            )}
        </AvatarContainer>
    );
}
