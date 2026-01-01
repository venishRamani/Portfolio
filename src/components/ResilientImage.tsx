import {useState} from 'react';
import {ImageOff} from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  fallbackTitle: string;
  className?: string;
}

export function ResilientImage({
  src,
  alt,
  fallbackTitle,
  className = '',
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#18181C] via-[#121215] to-[#0A0A0B] p-6 text-center text-[#9CA3AF] ${className}`}
      >
        <ImageOff className="h-6 w-6 text-[#52525B]" aria-hidden="true" />
        <span className="font-mono text-xs font-medium text-[#F4F4F5]">{fallbackTitle}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
