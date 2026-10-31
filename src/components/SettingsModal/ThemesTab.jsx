import React from 'react';
import { Palette, Check, Pipette } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PieceToken } from '@/components/ui/piece-token';
import { cn } from '../../lib/utils';

export function ThemesTab({
  draft,
  updateDraft,
  auraPresets = []
}) {
  const colorPresets = auraPresets.filter((p) => p.style !== 'image');

  return (
    <div className="flex flex-col gap-3">
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="size-4 text-primary" />
            <span>Bộ Sưu Tập Chủ Đề Màu Aura ({colorPresets.length} mẫu)</span>
          </CardTitle>
          <CardDescription>
            Bấm chọn để áp dụng trực tiếp lên bàn cờ
          </CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {colorPresets.map((preset) => {
            const isSelected = draft.auraPreset === preset.id;
            const myCol =
              preset.id === 'custom' ? draft.customMyAuraColor : preset.myColor;
            const oppCol =
              preset.id === 'custom' ? draft.customOppAuraColor : preset.oppColor;

            return (
              <Card
                key={preset.id}
                size="sm"
                onClick={() => updateDraft({ auraPreset: preset.id })}
                className={cn(
                  'relative cursor-pointer transition-all',
                  isSelected
                    ? 'ring-2 ring-primary bg-accent/40'
                    : 'hover:bg-accent/30'
                )}
              >
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3 stroke-[3]" />
                  </span>
                )}

                <CardContent className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-center gap-5 rounded-md border bg-muted/40 py-2.5">
                    <div className="relative flex size-10 items-center justify-center">
                      <div
                        style={{
                          border: `2px ${preset.style === 'dashed' ? 'dashed' : 'solid'} ${myCol}`,
                          boxShadow: `0 0 10px ${myCol}`
                        }}
                        className="pointer-events-none absolute inset-0 rounded-full"
                      />
                      <PieceToken char="車" color={0} size="sm" />
                    </div>
                    <div className="relative flex size-10 items-center justify-center">
                      <div
                        style={{
                          border: `2px ${preset.style === 'dashed' ? 'dashed' : 'solid'} ${oppCol}`,
                          boxShadow: `0 0 10px ${oppCol}`
                        }}
                        className="pointer-events-none absolute inset-0 rounded-full"
                      />
                      <PieceToken char="馬" color={1} size="sm" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5 pr-5">
                    <span className="text-xs font-medium text-foreground">
                      {preset.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {preset.desc}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* Custom Color Picker Panel */}
      {draft.auraPreset === 'custom' && (
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pipette className="size-4 text-primary" />
              <span>Tùy Chỉnh Bảng Màu Cá Nhân (Custom Hex Color)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Label className="flex cursor-pointer items-center justify-between rounded-lg border bg-muted/20 p-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-foreground">
                  Màu Hào Quang Lượt Bạn Đi
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {draft.customMyAuraColor}
                </span>
              </div>
              <input
                type="color"
                value={draft.customMyAuraColor || '#22c55e'}
                onChange={(e) => updateDraft({ customMyAuraColor: e.target.value })}
                className="h-8 w-12 cursor-pointer rounded border bg-transparent"
              />
            </Label>

            <Label className="flex cursor-pointer items-center justify-between rounded-lg border bg-muted/20 p-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-foreground">
                  Màu Cảnh Báo Lượt Đối Thủ
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {draft.customOppAuraColor}
                </span>
              </div>
              <input
                type="color"
                value={draft.customOppAuraColor || '#ef4444'}
                onChange={(e) => updateDraft({ customOppAuraColor: e.target.value })}
                className="h-8 w-12 cursor-pointer rounded border bg-transparent"
              />
            </Label>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
