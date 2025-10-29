/**
 * Animation Utilities
 * 
 * Centralized animation constants and keyframes for consistent
 * animations across the application.
 */

import { keyframes } from '@mui/material';

/**
 * Animation durations (in ms)
 */
export const ANIMATION_DURATION = {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
} as const;

/**
 * Easing functions
 */
export const EASING = {
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    EASE_OUT: 'cubic-bezier(0.0, 0, 0.2, 1)',
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
    SPRING: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

/**
 * Keyframe animations
 */
export const fadeIn = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

export const fadeInUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

export const fadeInDown = keyframes`
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

export const slideInRight = keyframes`
    from {
        transform: translateX(100%);
    }
    to {
        transform: translateX(0);
    }
`;

export const slideInLeft = keyframes`
    from {
        transform: translateX(-100%);
    }
    to {
        transform: translateX(0);
    }
`;

export const scaleIn = keyframes`
    from {
        transform: scale(0.9);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
`;

export const pulse = keyframes`
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
`;

export const shimmer = keyframes`
    0% {
        background-position: -1000px 0;
    }
    100% {
        background-position: 1000px 0;
    }
`;

/**
 * Common transition props for MUI components
 */
export const transitions = {
    fadeIn: {
        animation: `${fadeIn} ${ANIMATION_DURATION.NORMAL}ms ${EASING.EASE_OUT}`,
    },
    fadeInUp: {
        animation: `${fadeInUp} ${ANIMATION_DURATION.NORMAL}ms ${EASING.EASE_OUT}`,
    },
    fadeInDown: {
        animation: `${fadeInDown} ${ANIMATION_DURATION.NORMAL}ms ${EASING.EASE_OUT}`,
    },
    scaleIn: {
        animation: `${scaleIn} ${ANIMATION_DURATION.NORMAL}ms ${EASING.EASE_OUT}`,
    },
    hover: {
        transition: `all ${ANIMATION_DURATION.FAST}ms ${EASING.EASE_IN_OUT}`,
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
    },
    hoverScale: {
        transition: `transform ${ANIMATION_DURATION.FAST}ms ${EASING.EASE_IN_OUT}`,
        '&:hover': {
            transform: 'scale(1.02)',
        },
    },
} as const;

/**
 * Stagger children animation delays
 */
export const getStaggerDelay = (index: number, baseDelay = 50) => ({
    animation: `${fadeInUp} ${ANIMATION_DURATION.NORMAL}ms ${EASING.EASE_OUT}`,
    animationDelay: `${index * baseDelay}ms`,
    animationFillMode: 'backwards',
});
