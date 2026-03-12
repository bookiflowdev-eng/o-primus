import React from 'react';

export type BoundingBox = {
  id: string;
  x: number | string;
  y: number | string;
  width: number | string;
  height: number | string;
  type: 'container' | 'text' | 'image' | 'interactive';
  label?: string;
};

interface SpatialOverlayProps {
  boxes: BoundingBox[];
}

export const SpatialOverlay: React.FC<SpatialOverlayProps> = ({ boxes }) => {
  const formatVal = (val: number | string) => (typeof val === 'number' ? `${val}px` : val);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-50"
      style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {boxes.map((box) => (
        <g 
          key={box.id} 
          // Utilisation de variables CSS inline pour éviter les recalculs React complexes
          style={{ transform: `translate(${formatVal(box.x)}, ${formatVal(box.y)})` }}
          className="animate-in fade-in duration-300"
        >
          <rect
            width={box.width}
            height={box.height}
            fill="none"
            stroke={box.type === 'interactive' ? '#3b82f6' : box.type === 'text' ? '#10b981' : '#ef4444'}
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="animate-pulse"
          />
          {box.label && (
            <g style={{ transform: `translate(2px, -6px)` }}>
              <rect x="-2" y="-9" width="100" height="12" fill="#000" opacity="0.6" rx="2" />
              <text 
                x="2" 
                y="0" 
                fill="#fff" 
                fontSize="9" 
                fontFamily="monospace"
                className="font-bold tracking-widest opacity-90"
              >
                {box.label}
              </text>
            </g>
          )}
        </g>
      ))}
    </svg>
  );
};