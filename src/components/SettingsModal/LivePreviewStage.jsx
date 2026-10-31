import React from 'react';
import { Eye } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { PieceToken } from '@/components/ui/piece-token';
import { cn } from '../../lib/utils';

const ANIMATION_LABELS = {
  spin_pulse: 'Xoay 360° & Nhịp Thở (Mặc định)',
  spin: 'Xoay Tròn 360° Liên Tục',
  pulse: 'Nhịp Thở Hào Quang (Không xoay)',
  heartbeat: 'Nhịp Đập Cảnh Báo Nhanh',
  static: 'Đứng Yên (Tĩnh)'
};

export function LivePreviewStage({
  draft,
  updateDraft,
  auraPresets = []
}) {
  const activePreset =
    auraPresets.find((p) => p.id === draft.auraPreset) ||
    auraPresets[0] || {
      id: 'default',
      myColor: '#22c55e',
      oppColor: '#ef4444',
      style: 'dashed'
    };

  const isCustomColor = draft.auraPreset === 'custom';
  const myCol = isCustomColor ? draft.customMyAuraColor : activePreset.myColor;
  const oppCol = isCustomColor ? draft.customOppAuraColor : activePreset.oppColor;
  const scaleVal = Number(draft.auraScale) || 1;
  const speedVal = Number(draft.auraSpeed) || 3.5;
  const animType = draft.auraAnimation || 'spin_pulse';
  const scalePercent = Math.round(scaleVal * 100);

  const animClass = `aura-anim-${animType}`;

  const renderPreviewRing = (colorHex) => {
    const isImagePreset = activePreset.style === 'image' && activePreset.imageUrl;
    const baseStyle = {
      '--aura-scale': scaleVal,
      '--aura-speed': `${speedVal}s`,
      width: '68px',
      height: '68px',
      left: '50%',
      top: '50%'
    };

    if (isImagePreset) {
      return (
        <div
          style={{
            ...baseStyle,
            backgroundImage: `url("${activePreset.imageUrl}")`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            filter: `drop-shadow(0 0 8px ${colorHex})`
          }}
          className={cn('pointer-events-none absolute z-20', animClass)}
        />
      );
    }

    return (
      <div
        style={{
          ...baseStyle,
          border: `2.5px ${activePreset.style === 'dashed' ? 'dashed' : 'solid'} ${colorHex}`,
          boxShadow: `0 0 14px ${colorHex}, inset 0 0 8px ${colorHex}`
        }}
        className={cn('pointer-events-none absolute z-20 rounded-full', animClass)}
      />
    );
  };

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="size-4 text-primary" />
          <span>Xem trước hiệu ứng Hào Quang (Live Preview)</span>
        </CardTitle>
        <CardAction>
          <Badge variant="secondary">{activePreset.name || 'Mặc định'}</Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {/* Dual Chessboard Stage */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-lg border bg-muted/30 px-4 py-3.5">
          <div className="flex flex-col items-center gap-1.5">
            <div className="relative flex size-16 items-center justify-center">
              {renderPreviewRing(myCol)}
              <PieceToken char="帥" color={0} size="lg" className="z-10" />
            </div>
            <span className="text-xs font-medium text-foreground">
              Lượt Tôi Đi
            </span>
            <Badge variant="outline">Quân Có Thể Ăn</Badge>
          </div>

          <div className="text-xs font-semibold text-muted-foreground select-none">
            VS
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <div className="relative flex size-16 items-center justify-center">
              {renderPreviewRing(oppCol)}
              <PieceToken char="將" color={1} size="lg" className="z-10" />
            </div>
            <span className="text-xs font-medium text-foreground">
              Lượt Đối Thủ Đi
            </span>
            <Badge variant="outline">Quân Ta Bị Nhắm</Badge>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3">
            <div className="flex items-center justify-between">
              <Label>Kích thước vòng</Label>
              <div className="flex items-center gap-1.5">
                <Badge variant="default">{scalePercent}%</Badge>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => updateDraft({ auraScale: 1.0 })}
                >
                  100%
                </Button>
              </div>
            </div>
            <Slider
              min={60}
              max={220}
              step={5}
              value={[scalePercent]}
              onValueChange={(vals) => {
                const nextVal = Array.isArray(vals) ? vals[0] : vals;
                updateDraft({ auraScale: Number((nextVal / 100).toFixed(2)) });
              }}
            />
          </div>

          <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3">
            <div className="flex items-center justify-between">
              <Label>Chu kỳ xoay</Label>
              <Badge variant="secondary">{speedVal.toFixed(1)}s</Badge>
            </div>
            <Slider
              min={8}
              max={80}
              step={2}
              value={[Math.round(speedVal * 10)]}
              onValueChange={(vals) => {
                const nextVal = Array.isArray(vals) ? vals[0] : vals;
                updateDraft({ auraSpeed: Number((nextVal / 10).toFixed(1)) });
              }}
            />
          </div>
        </div>

        {/* Animation Mode Select */}
        <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2">
          <Label>Chế độ chuyển động</Label>
          <Select
            value={animType}
            onValueChange={(val) => {
              if (val) updateDraft({ auraAnimation: val });
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Chọn hiệu ứng chuyển động">
                {ANIMATION_LABELS[animType] || animType}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spin_pulse">
                Xoay 360° & Nhịp Thở (Mặc định)
              </SelectItem>
              <SelectItem value="spin">Xoay Tròn 360° Liên Tục</SelectItem>
              <SelectItem value="pulse">
                Nhịp Thở Hào Quang (Không xoay)
              </SelectItem>
              <SelectItem value="heartbeat">Nhịp Đập Cảnh Báo Nhanh</SelectItem>
              <SelectItem value="static">Đứng Yên (Tĩnh)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
