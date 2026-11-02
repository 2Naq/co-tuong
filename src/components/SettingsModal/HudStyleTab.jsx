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
  let previewBg = "rgba(18, 18, 24, 0.75)";
  let previewBackdrop = "blur(16px)";
  if (hudStyle.bgMode === "solid") {
    previewBg = "#141416";
    previewBackdrop = "none";
  } else if (hudStyle.bgMode === "clear") {
    previewBg = "rgba(10, 10, 14, 0.45)";
    previewBackdrop = "blur(8px)";
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
              <span>
                Xem Trước Giao Diện Toàn Dự Án Thời Gian Thực (Live Preview)
              </span>
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
            Mô phỏng trực tiếp diện mạo đồng bộ của Bảng Điều Khiển HUD và Hộp
            Thoại Cài Đặt / Nút Bấm khi áp dụng
          </CardDescription>
        </CardHeader>

        <CardContent className="p-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* 1. HUD Preview */}
            <div
              style={{
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
              {/* Header */}
              <div className="border-border/40 flex items-center justify-between border-b px-3 py-2">
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      backgroundColor: activeColor,
                      color: textColor,
                    }}
                    className="flex size-5.5 items-center justify-center rounded text-[11px] font-black shadow-xs"
                  >
                    AN
                  </span>
                  <span className="text-xs font-bold tracking-tight">
                    BẢNG HUD
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    style={{
                      backgroundColor: hexToRgba(activeColor, 0.15),
                      color: activeColor,
                    }}
                    className="border-border/40 flex size-5.5 items-center justify-center rounded border text-[10px]"
                  >
                    🌙
                  </span>
                  <span
                    style={{
                      backgroundColor: hexToRgba(activeColor, 0.15),
                      color: activeColor,
                    }}
                    className="border-border/40 flex size-5.5 items-center justify-center rounded border text-[10px]"
                  >
                    ⚙️
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-col gap-2 p-2.5 text-xs">
                {/* Game status */}
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
                  className="border-border/30 flex items-center gap-2 border px-2 py-1.5"
                >
                  <span
                    style={{ backgroundColor: activeColor }}
                    className="size-2 animate-pulse rounded-full"
                  />
                  <span className="text-foreground text-[11px] font-medium">
                    Đang xem ván (Phuong_HN vs Quang_SG)
                  </span>
                </div>

                {/* Score bar */}
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
                  className="border-border/30 flex flex-col gap-1.5 border p-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-foreground text-[11px] font-semibold">
                      Điểm Lực Lượng
                    </span>
                    <span
                      style={{
                        backgroundColor: hexToRgba(activeColor, 0.2),
                        color: activeColor,
                        border: `1px solid ${hexToRgba(activeColor, 0.4)}`,
                      }}
                      className="rounded-full px-1.5 py-0.5 text-[9.5px] font-bold"
                    >
                      +1.5 (Ưu)
                    </span>
                  </div>
                  <div className="bg-muted/60 relative h-1.5 w-full overflow-hidden rounded-full">
                    <div
                      style={{
                        width: "60%",
                        backgroundColor: activeColor,
                      }}
                      className="h-full rounded-full transition-all"
                    />
                  </div>
                  <div className="text-muted-foreground flex justify-between text-[10px]">
                    <span>
                      Bạn: <strong className="text-foreground">49.0 đ</strong>
                    </span>
                    <span>
                      Đối thủ:{" "}
                      <strong className="text-foreground">47.5 đ</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Global Modal & UI Components Preview */}
            <div
              style={{
                backgroundColor: previewBg,
                backdropFilter: previewBackdrop,
                WebkitBackdropFilter: previewBackdrop,
                borderRadius: radiusMap[hudStyle.borderRadius] || "16px",
                boxShadow: previewShadow,
                border: `1px solid ${previewBorderColor}`,
                transition: "all 0.25s ease",
              }}
              className="text-foreground flex flex-col justify-between overflow-hidden p-2.5 text-xs select-none"
            >
              <div className="flex flex-col gap-2">
                {/* Header item */}
                <div className="border-border/40 flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Sliders
                      className="size-3.5"
                      style={{ color: activeColor }}
                    />
                    <span className="text-xs">HỘP THOẠI & NÚT BẤM</span>
                  </div>
                  <span
                    style={{
                      backgroundColor: hexToRgba(activeColor, 0.2),
                      color: activeColor,
                      borderColor: hexToRgba(activeColor, 0.4),
                    }}
                    className="rounded-full border px-1.5 py-0.5 text-[9.5px] font-bold"
                  >
                    --primary
                  </span>
                </div>

                {/* Button & UI Showcase */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground text-[10.5px]">
                      Nút bấm mẫu:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        style={{
                          backgroundColor: activeColor,
                          color: textColor,
                          borderRadius:
                            hudStyle.borderRadius === "rounded_sm"
                              ? "4px"
                              : "6px",
                        }}
                        className="px-2 py-0.5 text-[10.5px] font-semibold shadow-xs"
                      >
                        Lưu & Chọn
                      </button>
                      <button
                        type="button"
                        style={{
                          borderColor: hexToRgba(activeColor, 0.6),
                          color: activeColor,
                          borderRadius:
                            hudStyle.borderRadius === "rounded_sm"
                              ? "4px"
                              : "6px",
                        }}
                        className="border bg-transparent px-2 py-0.5 text-[10.5px] font-semibold"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>

                  <div className="border-border/20 flex items-center justify-between gap-2 border-t pt-1">
                    <span className="text-muted-foreground text-[10.5px]">
                      Công tắc bật/tắt (Switch):
                    </span>
                    <div
                      style={{
                        backgroundColor: activeColor,
                      }}
                      className="flex h-3.5 w-7 items-center justify-end rounded-full px-0.5"
                    >
                      <div className="size-2.5 rounded-full bg-white shadow-xs" />
                    </div>
                  </div>

                  <div className="border-border/20 flex items-center justify-between gap-2 border-t pt-1">
                    <span className="text-muted-foreground text-[10.5px]">
                      Thanh trượt (Slider):
                    </span>
                    <div className="relative flex h-3 w-24 items-center">
                      <div className="bg-muted/60 h-1 w-full rounded-full">
                        <div
                          style={{ width: "70%", backgroundColor: activeColor }}
                          className="h-full rounded-full"
                        />
                      </div>
                      <div
                        style={{ left: "70%", borderColor: activeColor }}
                        className="bg-background absolute size-2.5 -translate-x-1/2 rounded-full border-2 shadow-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div
                style={{
                  backgroundColor: hexToRgba(activeColor, 0.1),
                  borderColor: hexToRgba(activeColor, 0.25),
                  color: activeColor,
                }}
                className="mt-2 rounded border px-2 py-1 text-center text-[10px] font-medium"
              >
                ✓ Tự động áp dụng đồng bộ toàn bộ HUD, Modal Cài Đặt, Sa Bàn &
                Review
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
            <span>
              Chủ Đề & Màu Sắc Chủ Đạo Toàn Dự Án (Global Accent Color)
            </span>
          </CardTitle>
          <CardDescription>
            Chọn phong cách màu sắc nổi bật hoặc tự chọn mã màu Hex. Toàn bộ các
            nút bấm, viền kích hoạt, badge và thanh tiến trình trong dự án sẽ
            đồng bộ theo mã màu này.
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
            <span>
              Chế Độ Nền & Hiệu Ứng Kính Mờ (Glassmorphism Toàn Dự Án)
            </span>
          </CardTitle>
          <CardDescription>
            Điều chỉnh độ mờ kính cường lực (frosted glass) và độ trong suốt
            xuyên thấu cho cả bảng HUD lẫn các Hộp Thoại (Modal)
          </CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {[
            {
              id: "glass",
              title: "Kính Mờ (Frosted Glass)",
              desc: "Nền mờ kính cường lực 82%, làm nổi bật các thẻ nội dung bên trong, xuyên thấu bàn cờ nhẹ nhàng trên cả HUD lẫn Hộp Thoại (Khuyên dùng)",
            },
            {
              id: "solid",
              title: "Nền Đặc (Solid 100%)",
              desc: "Nền đen/trắng đặc 100%, rõ ràng sắc nét, độ tương phản cao, triệt tiêu mọi phân tâm bàn cờ hậu cảnh",
            },
            {
              id: "clear",
              title: "Trong Suốt Cao (Clear 60%)",
              desc: "Độ trong suốt 60%, mờ nhẹ, quan sát tối đa các nước đi phía sau HUD và Hộp Thoại",
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
                  <p className="text-foreground/40 text-[11px]">{mode.desc}</p>
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
                Viền Neon Phát Sáng Toàn Dự Án (Border Glow)
              </Label>
              <span className="text-muted-foreground text-[11px]">
                Tỏa vầng sáng hào quang neon theo màu chủ đạo xung quanh viền
                HUD và Hộp Thoại Cài Đặt
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
                Độ Bo Góc Toàn Dự Án (Border Radius Token)
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
                Độ Tương Phản Thẻ Nội Dung (Card Surface)
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
