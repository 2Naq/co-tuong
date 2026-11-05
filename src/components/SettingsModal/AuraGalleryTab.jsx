import React, { useState } from "react";
import {
  Sparkles,
  Check,
  Upload,
  Trash2,
  Shield,
  Swords,
  Zap,
  RotateCcw,
  Image as ImageIcon,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PieceToken } from "@/components/ui/piece-token";
import { PRESET_AURAS } from "../../aura/aura_presets";
import { cn } from "../../lib/utils";

export function AuraGalleryTab({ draft, updateDraft, auraPresets = [] }) {
  const [filterMode, setFilterMode] = useState("all");
  const custom = draft.auraCustom || {};
  const isImageMode = custom.mode === "image";

  const effectivePresets =
    Array.isArray(auraPresets) && auraPresets.length > 0
      ? auraPresets
      : PRESET_AURAS;

  const filteredPresets = effectivePresets.filter((p) => {
    if (filterMode === "new") return !!p.isNew;
    if (filterMode === "my") return p.cat === "my";
    if (filterMode === "opp") return p.cat === "opp";
    return true;
  });

  const activeMyPreset = effectivePresets.find((p) => p.id === custom.presetMy);
  const activeOppPreset = effectivePresets.find(
    (p) => p.id === custom.presetOpp,
  );

  const handleApplyPreset = (preset, side) => {
    if (side === "my") {
      updateDraft({
        auraCustom: {
          ...custom,
          mode: "image",
          presetMy: preset.id,
        },
      });
    } else if (side === "opp") {
      updateDraft({
        auraCustom: {
          ...custom,
          mode: "image",
          presetOpp: preset.id,
        },
      });
    } else {
      updateDraft({
        auraCustom: {
          ...custom,
          mode: "image",
          presetMy: preset.id,
          presetOpp: preset.id,
        },
      });
    }
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

  const handleUploadChange = (e, side) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert("Dung lượng ảnh tối đa 3MB!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (typeof dataUrl === "string") {
        if (side === "my") {
          updateDraft({
            auraCustom: {
              ...custom,
              mode: "image",
              customImageMy: dataUrl,
            },
          });
        } else {
          updateDraft({
            auraCustom: {
              ...custom,
              mode: "image",
              customImageOpp: dataUrl,
            },
          });
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-3.5">
      {/* Active Selection Summary Bar */}
      <div className="border-border/80 bg-muted/30 flex flex-col items-stretch justify-between gap-2.5 rounded-lg border p-2.5 text-xs sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-foreground flex items-center gap-1.5 font-semibold">
            <ImageIcon className="text-primary size-4" />
            Đang chọn:
          </span>
          <Badge
            variant="outline"
            className="gap-1 border-green-500/40 bg-green-500/15 text-green-400"
          >
            <Shield className="size-3" />
            Lượt Tôi:{" "}
            {activeMyPreset?.title ||
              (custom.customImageMy ? "Ảnh Upload" : "Mặc định")}
          </Badge>
          <Badge
            variant="outline"
            className="gap-1 border-red-500/40 bg-red-500/15 text-red-400"
          >
            <Swords className="size-3" />
            Lượt Địch:{" "}
            {activeOppPreset?.title ||
              (custom.customImageOpp ? "Ảnh Upload" : "Mặc định")}
          </Badge>
        </div>

        {isImageMode ? (
          <Button
            variant="outline"
            size="xs"
            onClick={handleSwitchToNeon}
            className="text-primary border-primary/40 hover:bg-primary/10 shrink-0 gap-1 text-[11px]"
            title="Chuyển về hào quang Neon Vector ban đầu"
          >
            <Zap className="size-3" />
            <span>Về Hào Quang Neon</span>
          </Button>
        ) : (
          <Badge variant="secondary" className="shrink-0 text-[10px]">
            Click chọn mẫu bất kỳ để kích hoạt
          </Badge>
        )}
      </div>

      {/* Gallery Main Card */}
      <Card size="sm">
        <CardHeader className="pb-2.5">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Sparkles className="text-primary size-4" />
                <span>
                  Kho Hào Quang Đồ Họa PNG ({effectivePresets.length} mẫu HD)
                </span>
              </CardTitle>
              <CardDescription className="text-xs">
                Hiệu ứng vòng ma pháp, rồng lửa, lôi điện tách nền trong suốt
                chất lượng cao
              </CardDescription>
            </div>

            {/* Filter Toggle Group */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: `Tất cả (${effectivePresets.length})` },
                { id: "new", label: "12 Mẫu Mới" },
                { id: "my", label: "Lượt Tôi" },
                { id: "opp", label: "Lượt Đối Thủ" },
              ].map((f) => (
                <Button
                  key={f.id}
                  variant={filterMode === f.id ? "default" : "outline"}
                  size="xs"
                  onClick={() => setFilterMode(f.id)}
                  className="h-7 shrink-0 px-2.5 text-[11px]"
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPresets.map((preset) => {
            const isSelectedMy = isImageMode && custom.presetMy === preset.id;
            const isSelectedOpp = isImageMode && custom.presetOpp === preset.id;
            const isSelectedBoth = isSelectedMy && isSelectedOpp;
            const isSelected = isSelectedMy || isSelectedOpp;
            const imgSrc = preset.base64;

            return (
              <Card
                key={preset.id}
                size="sm"
                className={cn(
                  "border-border/80 relative flex flex-col justify-between overflow-hidden transition-all",
                  isSelected
                    ? "border-primary bg-accent/40 ring-primary shadow-sm ring-2"
                    : "hover:border-primary/50 hover:bg-accent/20",
                )}
              >
                {/* Top Badges */}
                <div className="absolute top-2 left-2 z-20 flex items-center gap-1">
                  {preset.isNew && (
                    <Badge
                      variant="default"
                      className="px-1.5 py-0 text-[10px] font-bold"
                    >
                      MỚI
                    </Badge>
                  )}
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
                    {isSelectedBoth ? (
                      <Badge
                        variant="default"
                        className="px-1.5 py-0 text-[9px] font-bold"
                      >
                        Cả 2 Phe
                      </Badge>
                    ) : (
                      <>
                        {isSelectedMy && (
                          <Badge
                            variant="outline"
                            className="border-green-500/50 bg-green-500/25 px-1 py-0 text-[9px] font-bold text-green-300"
                          >
                            Tôi
                          </Badge>
                        )}
                        {isSelectedOpp && (
                          <Badge
                            variant="outline"
                            className="border-red-500/60 bg-red-600 px-1.5 py-0 text-[9px] font-bold text-white shadow-xs"
                          >
                            Địch
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                )}

                <CardContent className="flex flex-col gap-2.5 p-3">
                  {/* Visual Preview Box */}
                  <div className="bg-muted/40 border-border/60 relative flex h-24 items-center justify-center overflow-hidden rounded-md border">
                    <div className="relative flex size-14.5 items-center justify-center">
                      {imgSrc && (
                        <div
                          style={{
                            backgroundImage: `url("${imgSrc}")`,
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                            filter:
                              "drop-shadow(0 0 8px rgba(255, 255, 255, 0.45))",
                            animation: "spin 6s linear infinite",
                          }}
                          className="pointer-events-none absolute inset-0 z-10"
                        />
                      )}
                      <PieceToken
                        char={preset.cat === "opp" ? "將" : "帥"}
                        color={preset.cat === "opp" ? "black" : "red"}
                        size="md"
                        className="z-20 shadow-md"
                      />
                    </div>
                  </div>

                  {/* Title & Tag */}
                  <div className="flex flex-col gap-0.5">
                    <span
                      className="text-foreground truncate text-xs font-bold"
                      title={preset.title}
                    >
                      {preset.title}
                    </span>
                    <span className="text-muted-foreground line-clamp-1 text-[11px]">
                      {preset.tag ||
                        (preset.cat === "my"
                          ? "Phong cách hộ thân (Lượt Tôi)"
                          : "Phong cách sát phạt (Lượt Địch)")}
                    </span>
                  </div>

                  {/* 3 Quick Action Buttons */}
                  <div className="border-border/50 grid grid-cols-3 gap-1.5 border-t pt-2">
                    <Button
                      variant={isSelectedMy ? "default" : "outline"}
                      size="xs"
                      className={cn(
                        "h-6.5 gap-1 overflow-hidden px-1 text-[10px] font-semibold whitespace-nowrap transition-all",
                        isSelectedMy
                          ? "bg-primary text-primary-foreground shadow-xs ring-1 ring-white/20"
                          : "hover:border-primary/50 hover:text-primary",
                      )}
                      onClick={() => handleApplyPreset(preset, "my")}
                      title="Áp dụng mẫu này cho Lượt Tôi Đi (Quân ta có thể ăn)"
                    >
                      <Shield className="size-2.5 shrink-0" />
                      <span className="truncate">Lượt Tôi</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      className={cn(
                        "h-6.5 gap-1 overflow-hidden px-1 text-[10px] font-semibold whitespace-nowrap transition-all",
                        isSelectedOpp
                          ? "border-red-600 bg-red-600 text-white shadow-xs ring-1 ring-white/20 hover:bg-red-700 hover:text-white"
                          : "hover:border-red-500/50 hover:text-red-400",
                      )}
                      style={
                        isSelectedOpp
                          ? {
                              backgroundColor: "#dc2626",
                              color: "#ffffff",
                              borderColor: "#b91c1c",
                            }
                          : {}
                      }
                      onClick={() => handleApplyPreset(preset, "opp")}
                      title="Áp dụng mẫu này cho Lượt Đối Thủ Đi (Quân ta bị nhắm)"
                    >
                      <Swords className="size-2.5 shrink-0" />
                      <span className="truncate">Lượt Địch</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      className={cn(
                        "h-6.5 gap-1 overflow-hidden px-1 text-[10px] font-semibold whitespace-nowrap transition-all",
                        isSelectedBoth
                          ? "border-amber-600 bg-amber-600 text-white shadow-xs ring-1 ring-white/20 hover:bg-amber-700 hover:text-white"
                          : "hover:border-amber-500/50 hover:text-amber-400",
                      )}
                      style={
                        isSelectedBoth
                          ? {
                              backgroundColor: "#d97706",
                              color: "#ffffff",
                              borderColor: "#b45309",
                            }
                          : {}
                      }
                      onClick={() => handleApplyPreset(preset, "both")}
                      title="Áp dụng mẫu này cho Cả Hai Phe"
                    >
                      <Sparkles className="size-2.5 shrink-0" />
                      <span className="truncate">Cả 2</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* Custom Image Upload & Management Panel */}
      <Card size="sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Upload className="text-primary size-4" />
            <span>Tải Ảnh Hào Quang Cá Nhân (PNG / WebP / SVG)</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Tải lên bất kỳ ảnh vòng tròn ma pháp tách nền trong suốt từ máy tính
            của bạn
          </CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Upload for My Side */}
          <div className="bg-muted/20 border-border/80 flex flex-col gap-2.5 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                <Shield className="size-3.5 text-green-400" />
                Ảnh Lượt Tôi Đi (Quân Ta)
              </span>
              {custom.customImageMy && (
                <Badge variant="outline" className="text-[10px] text-green-400">
                  Đã tải ảnh
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="ziga-upload-my"
                type="file"
                accept="image/png,image/webp,image/svg+xml"
                onChange={(e) => handleUploadChange(e, "my")}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  document.getElementById("ziga-upload-my")?.click()
                }
                className="gap-1.5 text-xs"
              >
                <Upload className="size-3.5" />
                <span>Chọn File Ảnh PNG</span>
              </Button>
              {custom.customImageMy && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    updateDraft({
                      auraCustom: { ...custom, customImageMy: "" },
                    })
                  }
                  title="Xóa ảnh tải lên lượt tôi"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </div>

            {custom.customImageMy && (
              <div className="border-border/40 flex items-center gap-3 border-t pt-1">
                <div className="relative flex size-12 items-center justify-center">
                  <div
                    style={{
                      backgroundImage: `url("${custom.customImageMy}")`,
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                      filter: "drop-shadow(0 0 6px rgba(255, 255, 255, 0.45))",
                      animation: "spin 6s linear infinite",
                    }}
                    className="pointer-events-none absolute inset-0 z-10"
                  />
                  <PieceToken
                    char="帥"
                    color="red"
                    size="sm"
                    className="z-20 shadow-sm"
                  />
                </div>
                <span className="text-muted-foreground text-[11px]">
                  Ảnh đã sẵn sàng và đang áp dụng trên bàn cờ
                </span>
              </div>
            )}
          </div>

          {/* Upload for Opp Side */}
          <div className="bg-muted/20 border-border/80 flex flex-col gap-2.5 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                <Swords className="size-3.5 text-red-400" />
                Ảnh Lượt Đối Thủ (Quân Địch)
              </span>
              {custom.customImageOpp && (
                <Badge variant="outline" className="text-[10px] text-red-400">
                  Đã tải ảnh
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="ziga-upload-opp"
                type="file"
                accept="image/png,image/webp,image/svg+xml"
                onChange={(e) => handleUploadChange(e, "opp")}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  document.getElementById("ziga-upload-opp")?.click()
                }
                className="gap-1.5 text-xs"
              >
                <Upload className="size-3.5" />
                <span>Chọn File Ảnh PNG</span>
              </Button>
              {custom.customImageOpp && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    updateDraft({
                      auraCustom: { ...custom, customImageOpp: "" },
                    })
                  }
                  title="Xóa ảnh tải lên lượt đối thủ"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </div>

            {custom.customImageOpp && (
              <div className="border-border/40 flex items-center gap-3 border-t pt-1">
                <div className="relative flex size-12 items-center justify-center">
                  <div
                    style={{
                      backgroundImage: `url("${custom.customImageOpp}")`,
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                      filter: "drop-shadow(0 0 6px rgba(255, 255, 255, 0.45))",
                      animation: "spin 6s linear infinite",
                    }}
                    className="pointer-events-none absolute inset-0 z-10"
                  />
                  <PieceToken
                    char="將"
                    color="black"
                    size="sm"
                    className="z-20 shadow-sm"
                  />
                </div>
                <span className="text-muted-foreground text-[11px]">
                  Ảnh đã sẵn sàng và đang áp dụng trên bàn cờ
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
