import React from 'react';

interface DimensionLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  offset?: number;
  color?: string;
  className?: string;
  fontSize?: number;
  strokeWidth?: number;
}

export function DimensionLine({
  x1, y1, x2, y2, label, offset = 20, color = '#94a3b8', className, fontSize = 60, strokeWidth = 2
}: DimensionLineProps) {
  // Calculate perpendicular vector for offset
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  
  if (len === 0) return null;

  const nx = (-dy / len) * offset;
  const ny = (dx / len) * offset;

  const px1 = x1 + nx;
  const py1 = y1 + ny;
  const px2 = x2 + nx;
  const py2 = y2 + ny;

  const mx = (px1 + px2) / 2;
  const my = (py1 + py2) / 2;

  return (
    <g className={className}>
      {/* Extension lines */}
      <line x1={x1} y1={y1} x2={px1} y2={py1} stroke={color} strokeWidth={strokeWidth} strokeDasharray={`${strokeWidth * 2} ${strokeWidth * 2}`} vectorEffect="non-scaling-stroke" />
      <line x1={x2} y1={y2} x2={px2} y2={py2} stroke={color} strokeWidth={strokeWidth} strokeDasharray={`${strokeWidth * 2} ${strokeWidth * 2}`} vectorEffect="non-scaling-stroke" />
      
      {/* Main dimension line */}
      <line 
        x1={px1} y1={py1} x2={px2} y2={py2} 
        stroke={color} strokeWidth={strokeWidth} 
        markerStart="url(#arrow-start)" 
        markerEnd="url(#arrow-end)" 
        vectorEffect="non-scaling-stroke"
      />
      
      {/* Label with background filter */}
      <text 
        x={mx} y={my} 
        fill={color} 
        fontSize={fontSize} 
        textAnchor="middle" 
        alignmentBaseline="middle"
        filter="url(#solid-bg)"
        className="select-none font-mono font-bold"
        vectorEffect="non-scaling-stroke"
      >
        {label}
      </text>
    </g>
  );
}
