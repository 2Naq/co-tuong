import React, { useState } from 'react';
import { Sparkles, Check, Upload, Trash2 } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { PieceToken } from '@/components/ui/piece-token';
import { cn } from '../../lib/utils';

export function AuraGalleryTab({
  draft,
  updateDraft,
  auraPresets = []
}) {
  const [filterMode, setFilterMode] = useState('all');
  const imagePresets = auraPresets.filter((p) => p.style === 'image');

  const filteredPresets = imagePresets.filter((p) => {
    if (filterMode === 'new') return !!p.isNew;
    return true;
  });

  const handleUploadChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      alert('Dung lượng ảnh tối đa 2.5MB!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (typeof dataUrl === 'string') {
        updateDraft({
          customAuraImage: dataUrl,
          auraPreset: 'custom_upload'
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Gallery Card */}
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span>Kho Hào Quang Đồ Họa PNG ({imagePresets.length} mẫu)</span>
          </CardTitle>
          <CardDescription>
            Hiệu ứng vòng pháp trận, rồng lửa, lôi điện tách nền trong suốt
          </CardDescription>
          <CardAction>
            <ToggleGroup
              variant="outline"
              size="sm"
              value={[filterMode]}
              onValueChange={(vals) => {
                const next = Array.isArray(vals) ? vals[0] : vals;
                if (next) setFilterMode(next);
              }}
            >
              <ToggleGroupItem value="all">
                Tất cả ({imagePresets.length})
              </ToggleGroupItem>
              <ToggleGroupItem value="new">
                12 Mẫu Mới
              </ToggleGroupItem>
            </ToggleGroup>
          </CardAction>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPresets.map((preset) => {
            const isSelected = draft.auraPreset === preset.id;
            const imgSrc =
              preset.id === 'custom_upload'
                ? draft.customAuraImage
                : preset.imageUrl;

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
                {preset.isNew && (
                  <Badge variant="default" className="absolute top-2.5 left-2.5 z-20">
                    NEW
                  </Badge>
                )}

                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 z-20 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3 stroke-[3]" />
                  </span>
                )}

                <CardContent className="flex flex-col gap-2">
                  <div className="relative flex h-16 items-center justify-center overflow-hidden rounded-md border bg-muted/40">
                    {imgSrc ? (
                      <div
                        style={{
                          backgroundImage: `url("${imgSrc}")`,
                          backgroundSize: 'contain',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center',
                          filter: `drop-shadow(0 0 6px ${preset.myColor || '#22c55e'})`
                        }}
                        className="pointer-events-none absolute size-14 animate-[zigaAuraSpin_6s_linear_infinite]"
                      />
                    ) : null}
                    <PieceToken char="帥" color={0} size="sm" className="z-10" />
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="truncate text-xs font-medium text-foreground">
                      {preset.name}
                    </span>
                    <span className="line-clamp-2 text-xs text-muted-foreground">
                      {preset.desc}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* Custom Image Upload */}
      <Card size="sm">
        <CardHeader>
          <CardTitle>Tải ảnh Hào Quang cá nhân (PNG / GIF / WebP / SVG)</CardTitle>
          <CardDescription>
            Khuyên dùng ảnh PNG tách nền trong suốt tỉ lệ vuông 1:1 (Tối đa 2.5MB)
          </CardDescription>
          <CardAction className="flex items-center gap-2">
            <label className="inline-flex cursor-pointer">
              <input
                type="file"
                accept="image/png,image/gif,image/webp,image/svg+xml"
                onChange={handleUploadChange}
                className="hidden"
              />
              <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border bg-secondary px-2.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80">
                <Upload className="size-3.5" />
                Chọn Ảnh Từ Máy
              </span>
            </label>

            {draft.customAuraImage && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  updateDraft({
                    customAuraImage: '',
                    auraPreset:
                      draft.auraPreset === 'custom_upload'
                        ? 'default'
                        : draft.auraPreset
                  })
                }
              >
                <Trash2 />
                Xóa Ảnh
              </Button>
            )}
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  );
}
