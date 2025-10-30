import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

export default function AppIcon(props: SvgIconProps) {
    return (
        <SvgIcon {...props} viewBox="0 0 512 512">
            <defs>
                {/* Gradient for depth */}
                <linearGradient id="appIconMainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#5865F2', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#4752C4', stopOpacity: 1 }} />
                </linearGradient>
                
                {/* Inner glow gradient */}
                <linearGradient id="appIconGlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#7289DA', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#5865F2', stopOpacity: 1 }} />
                </linearGradient>
            </defs>
            
            {/* Background circle - fills canvas like modern apps */}
            <circle cx="256" cy="256" r="240" fill="url(#appIconMainGradient)" />
            
            {/* Inner circle for depth */}
            <circle cx="256" cy="256" r="200" fill="url(#appIconGlowGradient)" opacity="0.3" />
            
            {/* Large, bold "P" - main identifier */}
            <g transform="translate(256, 256)">
                {/* P letter - thick and bold for visibility */}
                <path
                    d="M -60 -120 L -60 120 L -20 120 L -20 20 L 40 20 C 90 20 100 -10 100 -50 C 100 -90 90 -120 40 -120 Z M -20 -80 L 40 -80 C 60 -80 60 -60 60 -50 C 60 -40 60 -20 40 -20 L -20 -20 Z"
                    fill="#FFFFFF"
                />
                
                {/* Accent dot/checkmark - represents planning/completion */}
                <circle cx="70" cy="80" r="25" fill="#43B581" />
                
                {/* Small tick inside the circle */}
                <path
                    d="M 60 80 L 68 88 L 82 70"
                    stroke="#FFFFFF"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
            </g>
        </SvgIcon>
    );
}
