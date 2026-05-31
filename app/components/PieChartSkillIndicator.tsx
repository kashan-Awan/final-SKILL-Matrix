import React from 'react';

interface PieChartSkillIndicatorProps {
  level: string;
  size?: number;
}

const PieChartSkillIndicator: React.FC<PieChartSkillIndicatorProps> = ({ 
  level, 
  size = 60 
}) => {
  // Map skill levels to percentages and colors
  const skillLevelConfig = {
    'None': { percentage: 0, color: '#9CA3AF', bgColor: '#F3F4F6' },
    'Low Skilled': { percentage: 25, color: '#EF4444', bgColor: '#FEF2F2' },
    'Semi Skilled': { percentage: 50, color: '#F59E0B', bgColor: '#FFFBEB' },
    'Skilled': { percentage: 75, color: '#3B82F6', bgColor: '#EFF6FF' },
    'Highly Skilled': { percentage: 100, color: '#10B981', bgColor: '#F0FDF4' }
  };

  const config = skillLevelConfig[level as keyof typeof skillLevelConfig] || skillLevelConfig['None'];
  const { percentage, color, bgColor } = config;

  // Calculate circle properties
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div 
      className="relative flex items-center justify-center transition-all duration-300 hover:scale-110"
      style={{ width: size, height: size }}
    >
      {/* Background circle */}
      <div
        className="absolute inset-0 rounded-full shadow-lg"
        style={{ backgroundColor: bgColor }}
      />
      
      {/* SVG Circle */}
      <svg
        width={size}
        height={size}
        className="relative z-10 transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="4"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span 
          className="font-bold text-gray-700"
          style={{ fontSize: size * 0.2 }}
        >
          {percentage}%
        </span>
      </div>
    </div>
  );
};

export default PieChartSkillIndicator;