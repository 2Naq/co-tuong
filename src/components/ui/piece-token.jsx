import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const pieceTokenVariants = cva(
  'relative inline-flex items-center justify-center rounded-full font-serif font-black select-none transition-transform duration-150 hover:scale-105 shrink-0',
  {
    variants: {
      color: {
        red: 'bg-[radial-gradient(circle_at_35%_35%,#fff7eb_0%,#e8cfa1_60%,#bd9f67_100%)] text-[#c92a2a] border-[1.5px] border-[#bd302b] shadow-[0_2px_5px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.7)] [text-shadow:0_0_1px_rgba(201,42,42,0.5)]',
        black:
          'bg-[radial-gradient(circle_at_35%_35%,#fff7eb_0%,#ded0be_60%,#a89a87_100%)] text-[#1a202c] border-[1.5px] border-[#2d3748] shadow-[0_2px_5px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.7)] [text-shadow:0_0_1px_rgba(0,0,0,0.5)]'
      },
      size: {
        xs: 'size-5 text-[11px]',
        sm: 'size-6 text-[13px]',
        default: 'size-7 text-[15px]',
        md: 'size-8 text-[16px]',
        lg: 'size-10 text-[20px]',
        xl: 'size-12 text-[24px]'
      }
    },
    defaultVariants: {
      color: 'red',
      size: 'default'
    }
  }
);

function normalizePieceColor(c) {
  if (c === 0 || c === '0' || c === 'red') return 'red';
  return 'black';
}

function PieceToken({
  char,
  color = 'red',
  size = 'default',
  count = 1,
  badgeClassName,
  title,
  className,
  style
}) {
  const normColor = normalizePieceColor(color);
  const normSize = size === 'lg' ? 'lg' : size === 'xl' ? 'xl' : size === 'sm' ? 'sm' : size === 'xs' ? 'xs' : size === 'md' ? 'md' : 'default';

  return (
    <div
      title={title}
      style={{
        fontFamily: '"KaiTi", "BiauKai", "STKaiti", "SimSun", "Cinzel", serif',
        ...style
      }}
      className={cn(pieceTokenVariants({ color: normColor, size: normSize }), className)}
    >
      {/* Concentric inner engraved ring */}
      <span className="absolute inset-[1.5px] rounded-full border border-current opacity-30 pointer-events-none" />
      <span className="relative z-1 leading-none translate-y-[-0.5px]">{char}</span>
      {count > 1 && (
        <span
          className={cn(
            'absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-sans font-extrabold leading-none flex items-center justify-center',
            'bg-amber-500 text-slate-950 border border-slate-900 shadow-sm z-10',
            badgeClassName
          )}
        >
          {count}
        </span>
      )}
    </div>
  );
}

function PieceChip({ char, color = 'red', name, count = 1, className, title, onClick }) {
  const isRed = color === 0 || color === '0' || color === 'red';
  return (
    <div
      title={title || `${name || char} (${count})`}
      onClick={onClick}
      className={cn(
        'ziga-piece-chip inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all cursor-pointer select-none',
        isRed
          ? 'red-piece bg-red-950/25 border-red-500/30 hover:bg-red-950/45 hover:border-red-500/50'
          : 'black-piece bg-zinc-800/40 border-zinc-700/60 hover:bg-zinc-800/70 hover:border-zinc-500',
        className
      )}
    >
      <PieceToken char={char} color={isRed ? 'red' : 'black'} size="sm" />
      {name && <span className="text-xs font-semibold text-foreground/90">{name}</span>}
      {count > 0 && (
        <span className={cn('text-xs font-black font-mono', isRed ? 'text-red-400' : 'text-zinc-300')}>
          ×{count}
        </span>
      )}
    </div>
  );
}

export { PieceToken, PieceChip, pieceTokenVariants };
