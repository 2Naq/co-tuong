import React from "react";
import {
  Palette,
  Check,
  Pipette,
  ArrowLeftRight,
  Sparkles,
  Zap,
  Image as ImageIcon,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PieceToken } from "@/components/ui/piece-token";
import { AURA_THEMES } from "../../core/constants";
import { cn } from "../../lib/utils";

export function ThemesTab({ draft, updateDraft }) {
  const ZigaMod = window.ZigaMod || {};
  const custom = draft.auraCustom || {};
  const auraThemes =
    ZigaMod.AURA_THEMES && Object.keys(ZigaMod.AURA_THEMES).length > 0
      ? ZigaMod.AURA_THEMES
      : AURA_THEMES;

  const isImageMode = custom.mode === "image";
  const activeThemeId =
    custom.mode === "neon" && custom.theme ? custom.theme : "default";

  const themesList = Object.keys(auraThemes).map((k) => auraThemes[k]);

  const currentMyColor = custom.myColor || "#39ff14";
  const currentOppColor = custom.oppColor || "#ff1744";

  const handleSelectTheme = (th) => {
    updateDraft({
      auraCustom: {
        ...custom,
        mode: "neon",
        theme: th.id,
        myColor: th.myColor,
        oppColor: th.oppColor,
      },
    });
  };

  const handleSelectCustom = () => {
    updateDraft({
      auraCustom: {
        ...custom,
        mode: "neon",
        theme: "custom",
      },
    });
  };

  const handleSwapColors = () => {
    updateDraft({
      auraCustom: {
        ...custom,
        mode: "neon",
        theme: "custom",
        myColor: currentOppColor,
        oppColor: currentMyColor,
      },
    });
  };

  const handleSameColor = () => {
    updateDraft({
      auraCustom: {
        ...custom,
        mode: "neon",
        theme: "custom",
        oppColor: currentMyColor,
      },
    });
  };

  const handleSwitchToNeon = () => {
    updateDraft({
      auraCustom: {
        ...custom,
        mode: "neon",
        theme: custom.theme || "default",
      },
    });
  };

  return (
    <div className="flex flex-col gap-3.5">
      {/* Mode Banner Indicator */}
      {isImageMode ? (
        <div className="flex items-center justify-between rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <ImageIcon className="size-4 shrink-0 text-amber-400" />
            <span>
              Bàn cờ đang dùng <strong>Hào Quang Ảnh PNG Đồ Họa</strong>. Bấm
              chọn một chủ đề bên dưới để kích hoạt lại chế độ Neon Vector.
            </span>
          </div>
          <Button
            variant="outline"
            size="xs"
            onClick={handleSwitchToNeon}
            className="shrink-0 border-amber-500/50 text-amber-200 hover:bg-amber-500/20"
          >
            <Zap className="mr-1 size-3" />
            Bật Neon
          </Button>
        </div>
      ) : (
        <div className="border-primary/30 bg-primary/5 text-foreground flex items-center justify-between rounded-lg border p-2.5 text-xs">
          <div className="flex items-center gap-2">
            <Zap className="text-primary size-3.5" />
            <span>
              Chế độ hiện tại:{" "}
              <strong>
                Hào Quang Neon Bàn Cờ (Tối ưu hiệu năng mượt 60fps)
              </strong>
            </span>
          </div>
          <Badge
            variant="outline"
            className="border-primary/40 text-primary text-[10px]"
          >
            Đang Hoạt Động
          </Badge>
        </div>
      )}

      {/* Preset Themes Collection */}
      <Card size="sm">
        <CardHeader className="pb-2.5">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Palette className="text-primary size-4" />
              <span>
                Bộ Sưu Tập Chủ Đề Màu Aura ({themesList.length} phong cách)
              </span>
            </CardTitle>
            <Badge variant="secondary" className="font-mono text-[11px]">
              8 Mẫu Thiết Kế
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Bấm chọn để áp dụng trực tiếp lên vòng tròn hào quang bao quanh quân
            cờ ăn được trên bàn cờ
          </CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {themesList.map((th) => {
            const isSelected = !isImageMode && activeThemeId === th.id;
            return (
              <Card
                key={th.id}
                size="sm"
                onClick={() => handleSelectTheme(th)}
                className={cn(
                  "relative cursor-pointer overflow-hidden transition-all select-none",
                  isSelected
                    ? "border-primary bg-primary/10 ring-primary shadow-sm ring-2"
                    : "hover:border-primary/50 hover:bg-accent/30",
                )}
              >
                <CardContent className="flex flex-col gap-2.5 p-3">
                  {/* Pieces Showcase Box */}
                  <div className="bg-muted/40 border-border/60 relative flex items-center justify-around rounded-md border py-2.5">
                    {/* My Piece */}
                    <div className="relative flex size-10 items-center justify-center">
                      <div
                        style={{
                          border: `2px solid ${th.myColor}`,
                          boxShadow: `0 0 10px ${th.myColor}`,
                        }}
                        className="pointer-events-none absolute inset-0 animate-pulse rounded-full"
                      />
                      <PieceToken char="車" color="red" size="sm" />
                    </div>

                    <span className="text-muted-foreground text-[11px] font-bold">
                      VS
                    </span>

                    {/* Opp Piece */}
                    <div className="relative flex size-10 items-center justify-center">
                      <div
                        style={{
                          border: `2px solid ${th.oppColor}`,
                          boxShadow: `0 0 10px ${th.oppColor}`,
                        }}
                        className="pointer-events-none absolute inset-0 animate-pulse rounded-full"
                      />
                      <PieceToken char="馬" color="black" size="sm" />
                    </div>
                  </div>

                  {/* Name and description */}
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground text-xs font-bold">
                        {th.name}
                      </span>
                      {isSelected && (
                        <Check className="text-primary size-3.5 stroke-3" />
                      )}
                    </div>
                    <span className="text-muted-foreground line-clamp-1 text-[11px]">
                      {th.desc}
                    </span>
                  </div>

                  {/* Color Swatch Dots */}
                  <div className="border-border/40 text-muted-foreground flex items-center justify-between border-t pt-1 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span
                        style={{ backgroundColor: th.myColor }}
                        className="size-2.5 rounded-full border border-white/20"
                      />
                      <span>Tôi</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        style={{ backgroundColor: th.oppColor }}
                        className="size-2.5 rounded-full border border-white/20"
                      />
                      <span>Địch</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Custom Theme Card */}
          <Card
            size="sm"
            onClick={handleSelectCustom}
            className={cn(
              "relative cursor-pointer overflow-hidden transition-all select-none",
              !isImageMode && activeThemeId === "custom"
                ? "border-primary bg-primary/10 ring-primary shadow-sm ring-2"
                : "hover:border-primary/50 hover:bg-accent/30",
            )}
          >
            <CardContent className="flex flex-col gap-2.5 p-3">
              <div className="bg-muted/40 border-border/60 relative flex items-center justify-around rounded-md border py-2.5">
                <div className="relative flex size-10 items-center justify-center">
                  <div
                    style={{
                      border: `2px solid ${currentMyColor}`,
                      boxShadow: `0 0 10px ${currentMyColor}`,
                    }}
                    className="pointer-events-none absolute inset-0 animate-pulse rounded-full"
                  />
                  <PieceToken char="車" color="red" size="sm" />
                </div>
                <span className="text-muted-foreground text-[11px] font-bold">
                  VS
                </span>
                <div className="relative flex size-10 items-center justify-center">
                  <div
                    style={{
                      border: `2px solid ${currentOppColor}`,
                      boxShadow: `0 0 10px ${currentOppColor}`,
                    }}
                    className="pointer-events-none absolute inset-0 animate-pulse rounded-full"
                  />
                  <PieceToken char="馬" color="black" size="sm" />
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-foreground text-xs font-bold">
                    Tùy Chỉnh Màu Cá Nhân
                  </span>
                  {!isImageMode && activeThemeId === "custom" && (
                    <Check className="text-primary size-3.5 stroke-3" />
                  )}
                </div>
                <span className="text-muted-foreground line-clamp-1 text-[11px]">
                  Tự do phối màu theo ý thích
                </span>
              </div>

              <div className="border-border/40 text-muted-foreground flex items-center justify-between border-t pt-1 font-mono text-[10px]">
                <span>{currentMyColor}</span>
                <span>{currentOppColor}</span>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Interactive Quick Color Tweaker (Always available for fine-tuning) */}
      <Card size="sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Pipette className="text-primary size-4" />
              <span>Tinh Chỉnh Nhanh Màu Sắc 2 Phe</span>
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="xs"
                onClick={handleSwapColors}
                className="gap-1 text-[11px]"
                title="Đảo chéo màu giữa lượt Tôi và lượt Đối Thủ"
              >
                <ArrowLeftRight className="size-3" />
                <span>Đảo Màu 2 Phe</span>
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={handleSameColor}
                className="gap-1 text-[11px]"
                title="Đồng bộ màu lượt Đối Thủ theo màu lượt Tôi"
              >
                <Sparkles className="size-3" />
                <span>Dùng Chung 1 Màu</span>
              </Button>
            </div>
          </div>
          <CardDescription className="text-xs">
            Bạn có thể nhấp trực tiếp vào ô màu để đổi mã màu chính xác cho từng
            bên
          </CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* My Color Picker */}
          <Label className="bg-muted/30 hover:bg-accent/40 border-border/80 flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span
                  style={{ backgroundColor: currentMyColor }}
                  className="size-3 rounded-full border border-white/20"
                />
                <span className="text-foreground text-xs font-semibold">
                  Màu Hào Quang Lượt Tôi Đi
                </span>
              </div>
              <span className="text-muted-foreground font-mono text-[11px]">
                Mã màu: {currentMyColor}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentMyColor}
                onChange={(e) =>
                  updateDraft({
                    auraCustom: {
                      ...custom,
                      mode: "neon",
                      theme: "custom",
                      myColor: e.target.value,
                    },
                  })
                }
                className="border-border/60 size-8 cursor-pointer rounded-md border bg-transparent p-0.5"
              />
            </div>
          </Label>

          {/* Opp Color Picker */}
          <Label className="bg-muted/30 hover:bg-accent/40 border-border/80 flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span
                  style={{ backgroundColor: currentOppColor }}
                  className="size-3 rounded-full border border-white/20"
                />
                <span className="text-foreground text-xs font-semibold">
                  Màu Cảnh Báo Lượt Đối Thủ
                </span>
              </div>
              <span className="text-muted-foreground font-mono text-[11px]">
                Mã màu: {currentOppColor}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentOppColor}
                onChange={(e) =>
                  updateDraft({
                    auraCustom: {
                      ...custom,
                      mode: "neon",
                      theme: "custom",
                      oppColor: e.target.value,
                    },
                  })
                }
                className="border-border/60 size-8 cursor-pointer rounded-md border bg-transparent p-0.5"
              />
            </div>
          </Label>
        </CardContent>
      </Card>
    </div>
  );
}
