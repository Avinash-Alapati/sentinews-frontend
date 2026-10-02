import React from 'react';
import { Link } from 'react-router-dom';
import logoSvg from '@/assets/SentiNews_logo_exact.svg';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <Link to="/" className={`inline-flex items-center group py-1 ${className}`}>
      <img
        src={logoSvg}
        alt="SentiNews Logo"
        width={140}
        height={46}
        decoding="async"
        className="h-10 sm:h-12 md:h-[46px] w-auto object-contain transition-all group-hover:scale-[0.98] duration-200"
      />
    </Link>
  );
};

export default Logo;
