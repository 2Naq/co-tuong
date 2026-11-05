import React from "react";
import { Crosshair, Swords, Shield } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PieceToken, PieceChip } from "@/components/ui/piece-token";

export function TacticalInspectorCard({ tactical, visible }) {
  const ZigaMod = window.ZigaMod || {};
  const piece = tactical?.piece;
  const targets = tactical?.targets || [];
  const defended = tactical?.defended || [];

  if (!visible || !piece) return null;

  const pChar = ZigaMod.getPieceChar
    ? ZigaMod.getPieceChar(piece.Ga, piece.ka)
    : "?";
  const pName = ZigaMod.getPieceVnName ? ZigaMod.getPieceVnName(piece.Ga) : "";
  const colorName = piece.ka === 0 ? "Đỏ" : "Đen";

  return (
    <Card size="sm" id="ziga-section-tactical">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Crosshair className="text-primary size-4" />
          <span>Tầm Đánh Của Quân Đang Chọn</span>
        </CardTitle>
        <CardDescription className="flex items-center gap-2 pt-1">
          <PieceToken char={pChar} color={piece.ka} size="sm" />
          <span>
            {pName} {colorName} ({pChar}) · Cột {piece.fa + 1}, Hàng{" "}
            {piece.rowIndex + 1}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-2.5">
        <Separator />

        {/* Attackable Targets */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <Swords className="text-primary size-3.5" />
              Có thể ăn ngay
            </span>
            <Badge variant="default">{targets.length}</Badge>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {targets.length === 0 ? (
              <span className="text-muted-foreground text-xs">
                Không có quân đối phương trong tầm ăn
              </span>
            ) : (
              targets.map((t, idx) => {
                const tType = t?.type !== undefined ? t.type : t?.Ga;
                const tColor = t?.color !== undefined ? t.color : t?.ka;
                const tCol = t?.col !== undefined ? t.col : t?.fa;
                const tRow = t?.row !== undefined ? t.row : t?.rowIndex;
                const tChar =
                  t?.char ||
                  (ZigaMod.getPieceChar && tType !== undefined
                    ? ZigaMod.getPieceChar(tType, tColor)
                    : "?");
                const tName =
                  t?.name ||
                  (ZigaMod.getPieceVnName && tType !== undefined
                    ? ZigaMod.getPieceVnName(tType)
                    : "Quân");
                const coordStr =
                  tCol !== undefined && tRow !== undefined
                    ? ` (${tCol + 1},${tRow + 1})`
                    : "";
                return (
                  <PieceChip
                    key={idx}
                    char={tChar}
                    color={tColor}
                    subLabel={`${tName}${coordStr}`}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Defended Allies */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <Shield className="text-muted-foreground size-3.5" />
              Đang bảo vệ đồng đội
            </span>
            <Badge variant="secondary">{defended.length}</Badge>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {defended.length === 0 ? (
              <span className="text-muted-foreground text-xs">
                Không bảo vệ quân nào
              </span>
            ) : (
              defended.map((d, idx) => {
                const dType = d?.type !== undefined ? d.type : d?.Ga;
                const dColor = d?.color !== undefined ? d.color : d?.ka;
                const dChar =
                  d?.char ||
                  (ZigaMod.getPieceChar && dType !== undefined
                    ? ZigaMod.getPieceChar(dType, dColor)
                    : "?");
                const dName =
                  d?.name ||
                  (ZigaMod.getPieceVnName && dType !== undefined
                    ? ZigaMod.getPieceVnName(dType)
                    : "Quân");
                return (
                  <PieceChip
                    key={idx}
                    char={dChar}
                    color={dColor}
                    subLabel={dName}
                  />
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
