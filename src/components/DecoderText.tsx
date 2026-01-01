import {useEffect, useRef, useState} from 'react';

interface DecoderTextProps {
  text: string;
  start?: boolean;
  delay?: number;
  className?: string;
}

const GLYPHS = [
  'ア', 'イ', 'ウ', 'エ', 'オ',
  'カ', 'キ', 'ク', 'ケ', 'コ',
  'サ', 'シ', 'ス', 'セ', 'ソ',
  'タ', 'チ', 'ツ', 'テ', 'ト',
  'ナ', 'ニ', 'ヌ', 'ネ', 'ノ',
  '0', '1', '7', '9', '/', '_',
];

export function DecoderText({
  text,
  start = true,
  delay = 0,
  className = '',
}: DecoderTextProps) {
  const [rendered, setRendered] = useState<string>(text);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || !start) {
      setRendered(text);
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const chars = Array.from(text);
    const totalDuration = Math.min(950, Math.max(420, chars.length * 42));

    const run = () => {
      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / totalDuration);

        const nextChars = chars.map((char, index) => {
          if (char === ' ') {
            return ' ';
          }
          const threshold = (index + 1) / chars.length;
          if (progress >= threshold) {
            return char;
          }
          const glyphIndex =
            Math.floor((elapsed * 0.045 + index * 7) % GLYPHS.length);
          return GLYPHS[glyphIndex];
        });

        setRendered(nextChars.join(''));

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          setRendered(text);
        }
      };

      rafRef.current = requestAnimationFrame(step);
    };

    if (delay > 0) {
      timeoutId = setTimeout(run, delay);
    } else {
      run();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [text, start, delay]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">{rendered}</span>
    </span>
  );
}
