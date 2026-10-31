import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const pieceTokenVariants = cva(
  'relative inline-flex items-center justify-center rounded-full font-serif font-black select-none transition-transform duration-150 hover:scale-110 hover:z-10 shrink-0',
  {
    variants: {
      color: {
        red: 'bg-gradient-to-br from-[#fffdf7] via-[#f3e2c3] to-[#d9be8b] text-[#c81d11] border-2 border-[#c81d11] shadow-[0_2px_5px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.85)]',
        black:
          'bg-gradient-to-br from-[#fffdf7] via-[#e8e3d5] to-[#c7bfa8] text-[#14171f] border-2 border-[#1f2430] shadow-[0_2px_5px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.85)]'
      },
      size: {
        default: 'size-7 text-[15px]',
        sm: 'size-6 text-[13px]'
      }
    },
    defaultVariants: {
      color: 'red',
      size: 'default'
    }
  }
);

function PieceToken({
  char,
  color = 'red',
  size = 'default',
  count = 1,
  badgeClassName,
  title,
  className
}) {
  return (
    <div
      title={title}
      className={cn(pieceTokenVariants({ color, size }), className)}
    >
      <span className="leading-none translate-y-[-0.5px]">{char}</span>
      {count > 1 && (
        <span
          className={cn(
            'absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-sans font-extrabold leading-none flex items-center justify-center',
            'bg-amber-500 text-slate-950 border border-slate-900 shadow-sm',
            badgeClassName
          )}
        >
          {count}
        </span>
      )}
    </div>
  );
}

function PieceChip({ char, color = 'red', label, className }) {
  const isRed = color === 'red';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border transition-colors',
        isRed
          ? 'bg-red-600 text-white border-red-500'
          : 'bg-sky-600 text-white border-sky-500',
        className
      )}
    >
      <span
        className={cn(
          'inline-flex items-center justify-center size-4 rounded-full text-[10px] font-serif font-black border',
          isRed
            ? 'bg-[#f7ebd2] text-[#c81d11] border-[#c81d11]'
            : 'bg-[#e8e3d5] text-[#14171f] border-[#1f2430]'
        )}
      >
        {char}
      </span>
      <span>{label}</span>
    </span>
  );
}

export { PieceToken, PieceChip, pieceTokenVariants };
