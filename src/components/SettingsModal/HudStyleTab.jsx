import React from "react";
import {
  Palette,
  Check,
  Pipette,
  Sparkles,
  Sliders,
  Layers,
  Square,
  Maximize2,
  RotateCcw,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { DEFAULT_HUD_STYLE, HUD_STYLE_PRESETS } from "../../core/constants";
import {
  resolveHudAccent,
  hexToRgba,
  getContrastYIQ,
} from "../../ui/hud_theme";
import { cn } from "../../lib/utils";

export function HudStyleTab({ draft, updateDraft }) {
  const ZigaMod = window.ZigaMod || {};
  const presets =
    Array.isArray(ZigaMod.HUD_STYLE_PRESETS) &&
    ZigaMod.HUD_STYLE_PRESETS.length > 0
      ? ZigaMod.HUD_STYLE_PRESETS
      : HUD_STYLE_PRESETS;

  const hudStyle = {
    ...DEFAULT_HUD_STYLE,
    ...(draft.hudStyle || {}),
  };

  const activeColor = resolveHudAccent(hudStyle);
  const textColor = getContrastYIQ(activeColor);

  const handleUpdate = (patch) => {
    updateDraft({
      hudStyle: {
        ...hudStyle,
        ...patch,
      },
    });
  };

  // Border radius map
  const radiusMap = {
    rounded_xl: "16px",
    rounded_lg: "12px",
    rounded_sm: "4px",
  };

  // Mini preview background styling
  let previewBg = "rgba(18, 18, 22, 0.88)";
  let previewBackdrop = "blur(12px)";
  if (hudStyle.bgMode === "solid") {
    previewBg = "#141416";
    previewBackdrop = "none";
  } else if (hudStyle.bgMode === "clear") {
    previewBg = "rgba(12, 12, 15, 0.65)";
    previewBackdrop = "blur(6px)";
  }

  const previewShadow = hudStyle.borderGlow
    ? `0 12px 30px rgba(0, 0, 0, 0.6), 0 0 14px ${hexToRgba(activeColor, 0.35)}`
    : "0 10px 25px rgba(0, 0, 0, 0.5)";

  const previewBorderColor = hudStyle.borderGlow
    ? hexToRgba(activeColor, 0.55)
    : "rgba(255, 255, 255, 0.1)";

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Live Mini-Preview Section */}
      <Card size="sm" className="border-border/80 relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="text-primary size-4" />
              <span>Xem Trước HUD Thời Gian Thực (Live Mini Preview)</span>
            </CardTitle>
            <Badge
              variant="outline"
              style={{
                borderColor: hexToRgba(activeColor, 0.5),
                color: activeColor,
              }}
            >
              {hudStyle.preset === "custom"
                ? `Custom: ${activeColor}`
                : presets.find((p) => p.id === hudStyle.preset)?.name ||
                  "Mặc định"}
            </Badge>
          </div>
          <CardDescription>
            Khung bên dưới mô phỏng trực tiếp diện mạo bảng điều khiển HUD khi
            áp dụng
          </CardDescription>
        </CardHeader>

        <CardContent className="flex justify-center p-3">
          {/* Mockup HUD Container */}
          <div
            style={{
              width: "100%",
              maxWidth: "380px",
              backgroundColor: previewBg,
              backdropFilter: previewBackdrop,
              WebkitBackdropFilter: previewBackdrop,
              borderRadius: radiusMap[hudStyle.borderRadius] || "16px",
              boxShadow: previewShadow,
              border: `1px solid ${previewBorderColor}`,
              transition: "all 0.25s ease",
            }}
            className="text-foreground flex flex-col overflow-hidden select-none"
          >
            {/* Mock Header */}
            <div className="border-border/40 flex items-center justify-between border-b px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <span
                  style={{
                    backgroundColor: activeColor,
                    color: textColor,
                  }}
                  className="flex size-5.5 items-center justify-center rounded text-[11px] font-black"
                >
                  AN
                </span>
                <span className="text-xs font-bold tracking-tight">
                  TOOLS SUPPORT
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  style={{ backgroundColor: hexToRgba(activeColor, 0.15) }}
                  className="border-border/40 flex size-6 items-center justify-center rounded border text-[10px]"
                >
                  🌙
                </span>
                <span
                  style={{ backgroundColor: hexToRgba(activeColor, 0.15) }}
                  className="border-border/40 flex size-6 items-center justify-center rounded border text-[10px]"
                >
                  ⚙️
                </span>
              </div>
            </div>

            {/* Mock Body */}
            <div className="flex flex-col gap-2 p-3 text-xs">
              {/* Game status pill */}
              <div
                style={{
                  backgroundColor:
                    hudStyle.cardOpacity === "transparent"
                      ? "rgba(255, 255, 255, 0.04)"
                      : hudStyle.cardOpacity === "solid"
                        ? "#1c1c20"
                        : "rgba(255, 255, 255, 0.07)",
                  borderRadius: "8px",
                }}
                className="border-border/30 flex items-center gap-2 border px-2.5 py-1.5"
              >
                <span
                  style={{ backgroundColor: activeColor }}
                  className="size-2 animate-pulse rounded-full"
                />
                <span className="text-foreground font-medium">
                  Đang xem ván (Phuong_HN vs Quang_SG)
                </span>
              </div>

              {/* Material Bar Card Preview */}
              <div
                style={{
                  backgroundColor:
                    hudStyle.cardOpacity === "transparent"
                      ? "rgba(255, 255, 255, 0.04)"
                      : hudStyle.cardOpacity === "solid"
                        ? "#1c1c20"
                        : "rgba(255, 255, 255, 0.07)",
                  borderRadius: "8px",
                }}
                className="border-border/30 flex flex-col gap-1.5 border p-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-semibold">
                    Điểm Lực Lượng
                  </span>
                  <span
                    style={{
                      backgroundColor: hexToRgba(activeColor, 0.2),
                      color: activeColor,
                      border: `1px solid ${hexToRgba(activeColor, 0.4)}`,
                    }}
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  >
                    +1.5 (Bạn ưu)
                  </span>
                </div>
                {/* Progress bar */}
                <div className="bg-muted/60 relative h-2 w-full overflow-hidden rounded-full">
                  <div
                    style={{
                      width: "60%",
                      backgroundColor: activeColor,
                    }}
                    className="h-full rounded-full transition-all"
                  />
                </div>
                <div className="text-muted-foreground flex justify-between text-[11px]">
                  <span>
                    Bạn: <strong className="text-foreground">49.0 đ</strong>
                  </span>
                  <span>
                    Đối thủ: <strong className="text-foreground">47.5 đ</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Preset Colors Grid */}
      <Card size="sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Palette className="text-primary size-4" />
            <span>Chủ Đề & Màu Sắc Nổi Bật (Accent Color)</span>
          </CardTitle>
          <CardDescription>
            Chọn một trong 8 phong cách phối màu tinh tế hoặc tự chọn mã màu Hex
          </CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
          {presets.map((preset) => {
            const isSelected = hudStyle.preset === preset.id;
            return (
              <Card
                key={preset.id}
                size="sm"
                onClick={() => handleUpdate({ preset: preset.id })}
                className={cn(
                  "hover:border-primary/60 relative cursor-pointer transition-all select-none",
                  isSelected ? "bg-accent/40 ring-2" : "hover:bg-accent/20",
                )}
                style={
                  isSelected
                    ? {
                        borderColor: preset.color,
                        boxShadow: `0 0 10px ${hexToRgba(preset.color, 0.3)}`,
                      }
                    : {}
                }
              >
                <CardContent className="flex flex-col gap-2 p-3">
                  <div className="flex items-center justify-between">
                    <div
                      style={{
                        backgroundColor: preset.color,
                        boxShadow: `0 0 8px ${preset.color}`,
                      }}
                      className="size-5 rounded-full border border-white/20"
                    />
                    {isSelected && (
                      <Check
                        style={{ color: preset.color }}
                        className="size-4 font-bold"
                      />
                    )}
                  </div>
                  <div>
                    <div className="text-foreground text-xs font-bold">
                      {preset.name}
                    </div>
                    <div className="text-muted-foreground line-clamp-1 text-[11px]">
                      {preset.desc}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Custom Hex Color Card */}
          <Card
            size="sm"
            onClick={() => handleUpdate({ preset: "custom" })}
            className={cn(
              "hover:border-primary/60 relative cursor-pointer transition-all select-none",
              hudStyle.preset === "custom"
                ? "bg-accent/40 ring-2"
                : "hover:bg-accent/20",
            )}
            style={
              hudStyle.preset === "custom"
                ? {
                    borderColor: hudStyle.customColor || "#f97316",
                    boxShadow: `0 0 10px ${hexToRgba(hudStyle.customColor || "#f97316", 0.3)}`,
                  }
                : {}
            }
          >
            <CardContent className="flex flex-col gap-2 p-3">
              <div className="flex items-center justify-between">
                <div className="relative flex items-center">
                  <input
                    type="color"
                    id="ziga-custom-hud-color-input"
                    value={hudStyle.customColor || "#f97316"}
                    onChange={(e) => {
                      handleUpdate({
                        preset: "custom",
                        customColor: e.target.value,
                      });
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute inset-0 size-5 cursor-pointer rounded-full border-0 p-0 opacity-0"
                  />
                  <div
                    style={{
                      backgroundColor: hudStyle.customColor || "#f97316",
                      boxShadow: `0 0 8px ${hudStyle.customColor || "#f97316"}`,
                    }}
                    className="flex size-5 cursor-pointer items-center justify-center rounded-full border border-white/20"
                  >
                    <Pipette className="size-2.5 text-white mix-blend-difference" />
                  </div>
                </div>
                {hudStyle.preset === "custom" && (
                  <Check
                    style={{ color: hudStyle.customColor || "#f97316" }}
                    className="size-4 font-bold"
                  />
                )}
              </div>
              <div>
                <div className="text-foreground flex items-center gap-1 text-xs font-bold">
                  <span>Tự chọn mã màu</span>
                </div>
                <div className="text-muted-foreground font-mono text-[11px]">
                  {hudStyle.customColor || "#f97316"}
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* 3. Surface & Glassmorphism Options */}
      <Card size="sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Layers className="text-primary size-4" />
            <span>Chế Độ Nền & Hiệu Ứng Kính Mờ (Glassmorphism)</span>
          </CardTitle>
          <CardDescription>
            Điều chỉnh độ trong suốt và mức độ mờ nhòe hậu cảnh bàn cờ
          </CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {[
            {
              id: "glass",
              title: "Kính Mờ (Glass)",
              desc: "Nền mờ nhòe sang trọng, xuyên thấu bàn cờ nhẹ nhàng (Khuyên dùng)",
            },
            {
              id: "solid",
              title: "Nền Đặc (Solid 100%)",
              desc: "Nền đen/trắng đặc 100%, rõ ràng sắc nét, triệt tiêu phân tâm",
            },
            {
              id: "clear",
              title: "Trong Suốt Cao (Clear)",
              desc: "Độ trong suốt 65%, quan sát tối đa các nước đi phía sau HUD",
            },
          ].map((mode) => {
            const isSelected = hudStyle.bgMode === mode.id;
            return (
              <Card
                key={mode.id}
                size="sm"
                onClick={() => handleUpdate({ bgMode: mode.id })}
                className={cn(
                  "cursor-pointer transition-all select-none",
                  isSelected
                    ? "border-primary bg-primary/10 ring-primary ring-1"
                    : "hover:bg-accent/20",
                )}
              >
                <CardContent className="flex flex-col gap-1 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground text-xs font-bold">
                      {mode.title}
                    </span>
                    {isSelected && <Check className="text-primary size-3.5" />}
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    {mode.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* 4. Fine-Tuning Options Grid (Glow, Border Radius, Card Opacity, Scale) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Border Neon Glow */}
        <Card size="sm">
          <CardContent className="flex items-center justify-between p-3.5">
            <div className="flex flex-col gap-0.5 pr-2">
              <Label className="text-foreground cursor-pointer text-xs font-semibold">
                Viền Neon Phát Sáng (Border Glow)
              </Label>
              <span className="text-muted-foreground text-[11px]">
                Tỏa vầng sáng hào quang neon theo màu chủ đạo xung quanh viền
                HUD
              </span>
            </div>
            <Switch
              checked={hudStyle.borderGlow}
              onCheckedChange={(val) => handleUpdate({ borderGlow: val })}
            />
          </CardContent>
        </Card>

        {/* Border Radius */}
        <Card size="sm">
          <CardContent className="flex flex-col gap-2 p-3.5">
            <div className="flex items-center justify-between">
              <Label className="text-foreground text-xs font-semibold">
                Độ Bo Góc Khung HUD
              </Label>
              <span className="text-muted-foreground text-[11px]">
                {hudStyle.borderRadius === "rounded_xl"
                  ? "16px (Bo tròn)"
                  : hudStyle.borderRadius === "rounded_lg"
                    ? "12px (Vừa)"
                    : "4px (Góc vuông)"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: "rounded_xl", label: "Bo Tròn" },
                { id: "rounded_lg", label: "Bo Vừa" },
                { id: "rounded_sm", label: "Góc Vuông" },
              ].map((r) => (
                <Button
                  key={r.id}
                  variant={
                    hudStyle.borderRadius === r.id ? "default" : "outline"
                  }
                  size="xs"
                  onClick={() => handleUpdate({ borderRadius: r.id })}
                  className="text-[11px]"
                >
                  {r.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card Surface Contrast */}
        <Card size="sm">
          <CardContent className="flex flex-col gap-2 p-3.5">
            <div className="flex items-center justify-between">
              <Label className="text-foreground text-xs font-semibold">
                Độ Tương Phản Thẻ Thống Kê
              </Label>
              <span className="text-muted-foreground text-[11px]">
                {hudStyle.cardOpacity === "transparent"
                  ? "Xuyên thấu"
                  : hudStyle.cardOpacity === "solid"
                    ? "Đậm nét"
                    : "Tiêu chuẩn"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: "default", label: "Tiêu Chuẩn" },
                { id: "transparent", label: "Xuyên Thấu" },
                { id: "solid", label: "Đậm Nét" },
              ].map((c) => (
                <Button
                  key={c.id}
                  variant={
                    hudStyle.cardOpacity === c.id ? "default" : "outline"
                  }
                  size="xs"
                  onClick={() => handleUpdate({ cardOpacity: c.id })}
                  className="text-[11px]"
                >
                  {c.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* HUD Scale */}
        <Card size="sm">
          <CardContent className="flex flex-col gap-2 p-3.5">
            <div className="flex items-center justify-between">
              <Label className="text-foreground text-xs font-semibold">
                Tỷ Lệ Thu Phóng HUD
              </Label>
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="font-mono text-[11px]">
                  {Math.round((hudStyle.hudScale || 1.0) * 100)}%
                </Badge>
                {hudStyle.hudScale !== 1.0 && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleUpdate({ hudScale: 1.0 })}
                    title="Đặt lại 100%"
                  >
                    <RotateCcw className="text-muted-foreground size-3" />
                  </Button>
                )}
              </div>
            </div>
            <Slider
              value={[Math.round((hudStyle.hudScale || 1.0) * 100)]}
              min={85}
              max={115}
              step={5}
              onValueChange={([val]) => handleUpdate({ hudScale: val / 100 })}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
