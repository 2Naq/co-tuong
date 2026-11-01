import React, { useState } from "react";
import { Eye, RotateCcw } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PieceToken } from "@/components/ui/piece-token";
import { PRESET_AURAS } from "../../aura/aura_presets";
import { AURA_THEMES } from "../../core/constants";
import { cn } from "../../lib/utils";

const ANIMATION_LABELS = {
  spin_pulse: "Xoay 360° & Nhịp Thở (Mặc định)",
  spin: "Xoay Tròn 360° Liên Tục",
  pulse: "Nhịp Thở Hào Quang (Không xoay)",
  heartbeat: "Nhịp Đập Cảnh Báo Nhanh",
  static: "Đứng Yên (Tĩnh)",
};

export function LivePreviewStage({ draft, updateDraft, auraPresets = [] }) {
  const ZigaMod = window.ZigaMod || {};
  const effectivePresets =
    Array.isArray(auraPresets) && auraPresets.length > 0
      ? auraPresets
      : PRESET_AURAS;
  const custom = draft.auraCustom || {};
  const isImageMode = custom.mode === "image";
  const scaleVal = typeof custom.scale === "number" ? custom.scale : 1.0;
  const speedVal =
    typeof custom.spinSpeed === "number" ? custom.spinSpeed : 3.5;
  const animType = custom.animation || "spin";
  const scalePercent = Math.round(scaleVal * 100);

  const [selectOpen, setSelectOpen] = useState(false);

  const handleOpenChange = (open) => {
    const scrollY = window.scrollY;
    setSelectOpen(open);
    if (open) {
      // Prevent browser from scrolling window to bottom on focus
      requestAnimationFrame(() => {
        if (window.scrollY !== scrollY) {
          window.scrollTo(window.scrollX, scrollY);
        }
      });
    }
  };

  const handleSelectAnim = (val) => {
    if (val) {
      updateDraft({
        auraCustom: {
          ...custom,
          animation: val,
        },
      });
      setSelectOpen(false);
    }
  };

  const myCol = custom.myColor || "#39ff14";
  const oppCol = custom.oppColor || "#ff1744";

  const myImg = ZigaMod.resolveAuraImageData
    ? ZigaMod.resolveAuraImageData(custom, "my")
    : custom.customImageMy || "";
  const oppImg = ZigaMod.resolveAuraImageData
    ? ZigaMod.resolveAuraImageData(custom, "opp")
    : custom.customImageOpp || "";

  // Active theme or preset badge title
  let badgeTitle = "Mặc định";
  if (isImageMode) {
    const pMy = effectivePresets.find((p) => p.id === custom.presetMy);
    const pOpp = effectivePresets.find((p) => p.id === custom.presetOpp);
    if (pMy && pOpp) {
      badgeTitle = `${pMy.title} / ${pOpp.title}`;
    } else if (pMy) {
      badgeTitle = pMy.title;
    } else if (pOpp) {
      badgeTitle = pOpp.title;
    } else {
      badgeTitle = "Ảnh PNG Đồ Họa";
    }
  } else {
    const themes =
      ZigaMod.AURA_THEMES && Object.keys(ZigaMod.AURA_THEMES).length > 0
        ? ZigaMod.AURA_THEMES
        : AURA_THEMES;
    const th = themes?.[custom.theme];
    badgeTitle = th
      ? th.name
      : custom.theme === "custom"
        ? "Tự Chọn Hex"
        : "Neon JJ Xiangqi";
  }

  const animClass = `aura-anim-${animType}`;

  const renderPreviewRing = (side, colorHex, imgUrl) => {
    const isImage = isImageMode && !!imgUrl;
    // Calibrated to 48px piece (size="xl"):
    // PNG ring: 66px base width gives hollow inner 66 * 0.72 = 47.5px, hugging the 48px piece!
    // Neon ring: 56px base width hugs the 48px piece with a 4px radiant glow!
    const baseDiameter = isImage ? 66 : 56;
    const baseStyle = {
      "--aura-scale": scaleVal,
      "--aura-speed": `${speedVal}s`,
      width: `calc(${baseDiameter}px * var(--aura-scale, 1))`,
      height: `calc(${baseDiameter}px * var(--aura-scale, 1))`,
      left: "50%",
      top: "50%",
    };

    if (isImage) {
      return (
        <div
          style={{
            ...baseStyle,
            backgroundImage: `url("${imgUrl}")`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            filter: `drop-shadow(0 0 8px ${colorHex})`,
          }}
          className={cn("pointer-events-none absolute z-20", animClass)}
        />
      );
    }

    return (
      <div
        style={{
          ...baseStyle,
          border: `2.5px solid ${colorHex}`,
          boxShadow: `0 0 12px ${colorHex}, 0 0 24px ${colorHex}, inset 0 0 8px ${colorHex}`,
        }}
        className={cn(
          "pointer-events-none absolute z-20 rounded-full",
          animClass,
        )}
      />
    );
  };

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="text-primary size-4" />
          <span>Xem trước hiệu ứng Hào Quang (Live Preview)</span>
        </CardTitle>
        <CardAction>
          <Badge
            variant="secondary"
            className="max-w-55 truncate"
            title={badgeTitle}
          >
            {badgeTitle}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {/* Dual Chessboard Stage */}
        <div className="bg-muted/30 grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-lg border px-4 py-3.5">
          {/* My Piece */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="relative flex size-20 items-center justify-center">
              {renderPreviewRing("my", myCol, myImg)}
              <PieceToken
                char="帥"
                color="red"
                size="xl"
                className="z-10 shadow-lg"
              />
            </div>
            <span className="text-foreground text-xs font-semibold">
              Lượt Tôi Đi
            </span>
            <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
              Quân Có Thể Ăn
            </Badge>
          </div>

          <div className="text-muted-foreground text-xs font-black select-none">
            VS
          </div>

          {/* Opponent Piece */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="relative flex size-20 items-center justify-center">
              {renderPreviewRing("opp", oppCol, oppImg)}
              <PieceToken
                char="將"
                color="black"
                size="xl"
                className="z-10 shadow-lg"
              />
            </div>
            <span className="text-foreground text-xs font-semibold">
              Lượt Đối Thủ Đi
            </span>
            <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
              Quân Ta Bị Nhắm
            </Badge>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="bg-muted/20 flex flex-col gap-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <Label>Kích thước vòng</Label>
              <div className="flex items-center gap-1.5">
                <Badge variant="default">{scalePercent}%</Badge>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() =>
                    updateDraft({ auraCustom: { ...custom, scale: 1.0 } })
                  }
                  title="Đặt lại về kích thước chuẩn 100%"
                >
                  <RotateCcw className="mr-1 size-3" />
                  100%
                </Button>
              </div>
            </div>
            <Slider
              min={70}
              max={130}
              step={5}
              value={[scalePercent]}
              onValueChange={(vals) => {
                const nextVal = Array.isArray(vals) ? vals[0] : vals;
                updateDraft({
                  auraCustom: {
                    ...custom,
                    scale: Number((nextVal / 100).toFixed(2)),
                  },
                });
              }}
            />
          </div>

          <div className="bg-muted/20 flex flex-col gap-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <Label>Chu kỳ xoay</Label>
              <Badge variant="secondary">{speedVal.toFixed(1)}s</Badge>
            </div>
            <Slider
              min={10}
              max={80}
              step={2}
              value={[Math.round(speedVal * 10)]}
              onValueChange={(vals) => {
                const nextVal = Array.isArray(vals) ? vals[0] : vals;
                updateDraft({
                  auraCustom: {
                    ...custom,
                    spinSpeed: Number((nextVal / 10).toFixed(1)),
                  },
                });
              }}
            />
          </div>
        </div>

        {/* Animation Mode Select */}
        <div className="bg-muted/20 flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
          <Label>Chế độ chuyển động</Label>
          <Select
            modal={false}
            open={selectOpen}
            onOpenChange={handleOpenChange}
            value={animType}
            onValueChange={handleSelectAnim}
          >
            <SelectTrigger className="w-64 cursor-pointer">
              <SelectValue placeholder="Chọn hiệu ứng chuyển động">
                {ANIMATION_LABELS[animType] || animType}
              </SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} positionMethod="fixed">
              <SelectItem
                value="spin_pulse"
                onClick={() => handleSelectAnim("spin_pulse")}
                onPointerDown={() => handleSelectAnim("spin_pulse")}
              >
                Xoay 360° & Nhịp Thở (Mặc định)
              </SelectItem>
              <SelectItem
                value="spin"
                onClick={() => handleSelectAnim("spin")}
                onPointerDown={() => handleSelectAnim("spin")}
              >
                Xoay Tròn 360° Liên Tục
              </SelectItem>
              <SelectItem
                value="pulse"
                onClick={() => handleSelectAnim("pulse")}
                onPointerDown={() => handleSelectAnim("pulse")}
              >
                Nhịp Thở Hào Quang (Không xoay)
              </SelectItem>
              <SelectItem
                value="heartbeat"
                onClick={() => handleSelectAnim("heartbeat")}
                onPointerDown={() => handleSelectAnim("heartbeat")}
              >
                Nhịp Đập Cảnh Báo Nhanh
              </SelectItem>
              <SelectItem
                value="static"
                onClick={() => handleSelectAnim("static")}
                onPointerDown={() => handleSelectAnim("static")}
              >
                Đứng Yên (Tĩnh)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
