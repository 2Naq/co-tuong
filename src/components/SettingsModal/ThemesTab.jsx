import React from "react";
import { Palette, Check, Pipette } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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

  const themesList = Object.keys(auraThemes).map((k) => auraThemes[k]);
  themesList.push({
    id: "custom",
    name: "Tùy Chỉnh Màu Cá Nhân",
    myColor: custom.myColor || "#39ff14",
    oppColor: custom.oppColor || "#ff1744",
    desc: "Tự do chọn mã màu Hex bằng Color Picker",
  });

  const activeThemeId =
    custom.mode === "neon" && custom.theme ? custom.theme : "default";

  return (
    <div className="flex flex-col gap-3">
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="text-primary size-4" />
            <span>Bộ Sưu Tập Chủ Đề Màu Aura ({themesList.length} mẫu)</span>
          </CardTitle>
          <CardDescription>
            Bấm chọn để áp dụng trực tiếp lên bàn cờ Ziga thời gian thực
          </CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {themesList.map((th) => {
            const isSelected = activeThemeId === th.id;
            const myCol =
              th.id === "custom" ? custom.myColor || "#39ff14" : th.myColor;
            const oppCol =
              th.id === "custom" ? custom.oppColor || "#ff1744" : th.oppColor;

            return (
              <Card
                key={th.id}
                size="sm"
                onClick={() => {
                  if (th.id === "custom") {
                    updateDraft({
                      auraCustom: {
                        ...custom,
                        mode: "neon",
                        theme: "custom",
                      },
                    });
                  } else {
                    updateDraft({
                      auraCustom: {
                        ...custom,
                        mode: "neon",
                        theme: th.id,
                        myColor: th.myColor,
                        oppColor: th.oppColor,
                      },
                    });
                  }
                }}
                className={cn(
                  "relative cursor-pointer transition-all select-none",
                  isSelected
                    ? "ring-primary bg-accent/40 ring-2"
                    : "hover:bg-accent/30",
                )}
              >
                <CardContent className="flex flex-col gap-2.5">
                  <div className="bg-muted/40 flex items-center justify-center gap-6 rounded-md border py-2.5">
                    {/* Red Piece Sample with Aura */}
                    <div className="relative flex size-11 items-center justify-center">
                      <div
                        style={{
                          border: `2px solid ${myCol}`,
                          boxShadow: `0 0 10px ${myCol}`,
                        }}
                        className="pointer-events-none absolute inset-0 rounded-full"
                      />
                      <PieceToken char="車" color="red" size="default" />
                    </div>

                    {/* Black Piece Sample with Aura */}
                    <div className="relative flex size-11 items-center justify-center">
                      <div
                        style={{
                          border: `2px solid ${oppCol}`,
                          boxShadow: `0 0 10px ${oppCol}`,
                        }}
                        className="pointer-events-none absolute inset-0 rounded-full"
                      />
                      <PieceToken char="馬" color="black" size="default" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5 pr-6">
                    <span className="text-foreground text-xs font-semibold">
                      {th.name}
                    </span>
                    <span className="text-muted-foreground line-clamp-1 text-xs">
                      {th.desc}
                    </span>
                  </div>
                </CardContent>
                {isSelected && (
                  <span className="bg-primary text-primary-foreground absolute -top-2 -right-2 z-1000 flex size-5 items-center justify-center rounded-full shadow-sm">
                    <Check className="size-3 stroke-3" />
                  </span>
                )}
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* Custom Color Picker Panel */}
      {activeThemeId === "custom" && (
        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pipette className="text-primary size-4" />
              <span>Tùy Chỉnh Bảng Màu Cá Nhân (Color Picker)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Label className="bg-muted/20 flex cursor-pointer items-center justify-between rounded-lg border p-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-foreground text-xs font-medium">
                  Màu Hào Quang Lượt Tôi Đi
                </span>
                <span className="text-muted-foreground font-mono text-xs">
                  {custom.myColor || "#39ff14"}
                </span>
              </div>
              <input
                type="color"
                value={custom.myColor || "#39ff14"}
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
                className="h-8 w-12 cursor-pointer rounded border bg-transparent"
              />
            </Label>

            <Label className="bg-muted/20 flex cursor-pointer items-center justify-between rounded-lg border p-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-foreground text-xs font-medium">
                  Màu Cảnh Báo Lượt Đối Thủ
                </span>
                <span className="text-muted-foreground font-mono text-xs">
                  {custom.oppColor || "#ff1744"}
                </span>
              </div>
              <input
                type="color"
                value={custom.oppColor || "#ff1744"}
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
                className="h-8 w-12 cursor-pointer rounded border bg-transparent"
              />
            </Label>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
