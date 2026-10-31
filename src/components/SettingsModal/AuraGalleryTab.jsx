import React, { useState } from 'react';
import { Sparkles, Check, Upload, Trash2, Shield, Swords } from 'lucide-react';
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
import { PRESET_AURAS } from '../../aura/aura_presets';
import { cn } from '../../lib/utils';

export function AuraGalleryTab({
  draft,
  updateDraft,
  auraPresets = []
}) {
  const [filterMode, setFilterMode] = useState('all');
  const custom = draft.auraCustom || {};
  const effectivePresets =
    Array.isArray(auraPresets) && auraPresets.length > 0
      ? auraPresets
      : PRESET_AURAS;

  const filteredPresets = effectivePresets.filter((p) => {
    if (filterMode === 'new') return !!p.isNew;
    if (filterMode === 'my') return p.cat === 'my';
    if (filterMode === 'opp') return p.cat === 'opp';
    return true;
  });

  const handleApplyPreset = (preset, side) => {
    if (side === 'my') {
      updateDraft({
        auraCustom: {
          ...custom,
          mode: 'image',
          presetMy: preset.id
        }
      });
    } else if (side === 'opp') {
      updateDraft({
        auraCustom: {
          ...custom,
          mode: 'image',
          presetOpp: preset.id
        }
      });
    } else {
      updateDraft({
        auraCustom: {
          ...custom,
          mode: 'image',
          presetMy: preset.id,
          presetOpp: preset.id
        }
      });
    }
  };

  const handleUploadChange = (e, side) => {
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
        if (side === 'my') {
          updateDraft({
            auraCustom: {
              ...custom,
              mode: 'image',
              customImageMy: dataUrl
            }
          });
        } else {
          updateDraft({
            auraCustom: {
              ...custom,
              mode: 'image',
              customImageOpp: dataUrl
            }
          });
        }
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
            <span>Kho Hào Quang Đồ Họa PNG ({effectivePresets.length} mẫu)</span>
          </CardTitle>
          <CardDescription>
            Hiệu ứng vòng pháp trận, rồng lửa, lôi điện tách nền trong suốt chất lượng cao
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
                Tất cả ({effectivePresets.length})
              </ToggleGroupItem>
              <ToggleGroupItem value="new">
                12 Mẫu Mới
              </ToggleGroupItem>
              <ToggleGroupItem value="my">
                Lượt Tôi
              </ToggleGroupItem>
              <ToggleGroupItem value="opp">
                Lượt Đối Thủ
              </ToggleGroupItem>
            </ToggleGroup>
          </CardAction>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPresets.map((preset) => {
            const isSelectedMy = custom.mode === 'image' && custom.presetMy === preset.id;
            const isSelectedOpp = custom.mode === 'image' && custom.presetOpp === preset.id;
            const isSelected = isSelectedMy || isSelectedOpp;
            const imgSrc = preset.base64;

            return (
              <Card
                key={preset.id}
                size="sm"
                className={cn(
                  'relative transition-all overflow-hidden flex flex-col justify-between',
                  isSelected
                    ? 'ring-2 ring-primary bg-accent/40'
                    : 'hover:bg-accent/30'
                )}
              >
                {preset.isNew && (
                  <Badge variant="default" className="absolute top-2 left-2 z-20 text-[10px] px-1.5 py-0">
                    MỚI
                  </Badge>
                )}

                {isSelected && (
                  <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
                    {isSelectedMy && (
                      <Badge variant="outline" className="text-[9px] bg-green-500/20 text-green-400 border-green-500/40 px-1 py-0">
                        Tôi
                      </Badge>
                    )}
                    {isSelectedOpp && (
                      <Badge variant="outline" className="text-[9px] bg-red-500/20 text-red-400 border-red-500/40 px-1 py-0">
                        Địch
                      </Badge>
                    )}
                  </div>
                )}

                <CardContent className="flex flex-col gap-2 p-3">
                  {/* Visual Preview Box */}
                  <div className="relative flex h-24 items-center justify-center overflow-hidden rounded-md border bg-muted/40">
                    {imgSrc ? (
                      <div
                        style={{
                          backgroundImage: `url("${imgSrc}")`,
                          backgroundSize: 'contain',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center',
                          filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.45))',
                          top: '50%',
                          left: '50%',
                          width: '56px',
                          height: '56px'
                        }}
                        className="pointer-events-none absolute z-10 animate-[zigaAuraSpin_6s_linear_infinite]"
                      />
                    ) : null}
                    <PieceToken
                      char={preset.cat === 'opp' ? '將' : '帥'}
                      color={preset.cat === 'opp' ? 'black' : 'red'}
                      size="md"
                      className="z-20 shadow-md"
                    />
                  </div>

                  {/* Title & Tag */}
                  <div className="flex flex-col gap-0.5">
                    <span className="truncate text-xs font-semibold text-foreground" title={preset.title}>
                      {preset.title}
                    </span>
                    <span className="line-clamp-1 text-[11px] text-muted-foreground">
                      {preset.tag || (preset.cat === 'my' ? 'Khuyên dùng Lượt Tôi' : 'Khuyên dùng Đối Thủ')}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-1 pt-1 border-t">
                    <Button
                      variant={isSelectedMy ? 'default' : 'outline'}
                      size="xs"
                      className="text-[10px] h-6 px-1"
                      onClick={() => handleApplyPreset(preset, 'my')}
                      title="Áp dụng mẫu này cho Lượt Tôi Đi"
                    >
                      <Shield className="size-2.5 mr-0.5" />
                      Tôi
                    </Button>
                    <Button
                      variant={isSelectedOpp ? 'destructive' : 'outline'}
                      size="xs"
                      className="text-[10px] h-6 px-1"
                      onClick={() => handleApplyPreset(preset, 'opp')}
                      title="Áp dụng mẫu này cho Lượt Đối Thủ Đi"
                    >
                      <Swords className="size-2.5 mr-0.5" />
                      Địch
                    </Button>
                    <Button
                      variant="secondary"
                      size="xs"
                      className="text-[10px] h-6 px-1"
                      onClick={() => handleApplyPreset(preset, 'both')}
                      title="Áp dụng mẫu này cho Cả Hai Phe"
                    >
                      Cả 2
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* Custom Image Upload Panel */}
      <Card size="sm">
        <CardHeader>
          <CardTitle>Tải ảnh Hào Quang cá nhân (PNG / WebP / SVG)</CardTitle>
          <CardDescription>
            Tự tải lên hình ảnh vòng pháp trận tách nền PNG trong suốt từ máy tính của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Upload for My */}
          <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3">
            <span className="text-xs font-medium text-foreground">Ảnh Lượt Tôi Đi (Quân Ta)</span>
            <div className="flex items-center gap-2">
              <input
                id="ziga-upload-my"
                type="file"
                accept="image/png,image/webp,image/svg+xml"
                onChange={(e) => handleUploadChange(e, 'my')}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('ziga-upload-my')?.click()}
              >
                <Upload className="size-3.5 mr-1" />
                Chọn File Ảnh
              </Button>
              {custom.customImageMy && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    updateDraft({
                      auraCustom: { ...custom, customImageMy: '' }
                    })
                  }
                  title="Xóa ảnh tải lên lượt tôi"
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              )}
            </div>
          </div>

          {/* Upload for Opp */}
          <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-3">
            <span className="text-xs font-medium text-foreground">Ảnh Lượt Đối Thủ (Quân Địch)</span>
            <div className="flex items-center gap-2">
              <input
                id="ziga-upload-opp"
                type="file"
                accept="image/png,image/webp,image/svg+xml"
                onChange={(e) => handleUploadChange(e, 'opp')}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('ziga-upload-opp')?.click()}
              >
                <Upload className="size-3.5 mr-1" />
                Chọn File Ảnh
              </Button>
              {custom.customImageOpp && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    updateDraft({
                      auraCustom: { ...custom, customImageOpp: '' }
                    })
                  }
                  title="Xóa ảnh tải lên lượt đối thủ"
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
