interface MochiLogoProps {
  size?: number;
  className?: string;
  color?: string;
}

export function MochiLogo({ size = 32, className = '', color = 'currentColor' }: MochiLogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M20 50C20 33.4315 33.4315 20 50 20C66.5685 20 80 33.4315 80 50C80 66.5685 66.5685 80 50 80C33.4315 80 20 66.5685 20 50Z" 
        fill={color} 
        fillOpacity="0.2"
      />
      <path 
        d="M30 60C30 48.9543 38.9543 40 50 40C61.0457 40 70 48.9543 70 60C70 65.5228 65.5228 70 60 70H40C34.4772 70 30 65.5228 30 60Z" 
        fill={color}
      />
      <circle cx="42" cy="55" r="4" fill="white"/>
      <circle cx="58" cy="55" r="4" fill="white"/>
      <path d="M48 62C48 62 49 64 50 64C51 64 52 62 52 62" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
