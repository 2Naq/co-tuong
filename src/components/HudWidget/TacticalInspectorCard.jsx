import React from 'react';
import { Crosshair, Swords, Shield } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PieceToken, PieceChip } from '@/components/ui/piece-token';

export function TacticalInspectorCard({ tactical, visible }) {
  const ZigaMod = window.ZigaMod || {};
  const piece = tactical?.piece;
  const targets = tactical?.targets || [];
  const defended = tactical?.defended || [];

  if (!visible || !piece) return null;

  const pChar = ZigaMod.getPieceChar
    ? ZigaMod.getPieceChar(piece.Ga, piece.ka)
    : '?';
  const pName = ZigaMod.getPieceVnName
    ? ZigaMod.getPieceVnName(piece.Ga)
    : '';
  const colorName = piece.ka === 0 ? 'Đỏ' : 'Đen';

  return (
    <Card size="sm" id="ziga-section-tactical">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Crosshair className="size-4 text-primary" />
          <span>Tầm Đánh Của Quân Đang Chọn</span>
        </CardTitle>
        <CardDescription className="flex items-center gap-2 pt-1">
          <PieceToken char={pChar} color={piece.ka} size="sm" />
          <span>
            {pName} {colorName} ({pChar}) · Cột {piece.fa + 1}, Hàng {piece.rowIndex + 1}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-2.5">
        <Separator />

        {/* Attackable Targets */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <Swords className="size-3.5 text-primary" />
              Có thể ăn ngay
            </span>
            <Badge variant="default">{targets.length}</Badge>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {targets.length === 0 ? (
              <span className="text-xs text-muted-foreground">
                Không có quân đối phương trong tầm ăn
              </span>
            ) : (
              targets.map((t, idx) => {
                const tChar = ZigaMod.getPieceChar
                  ? ZigaMod.getPieceChar(t.Ga, t.ka)
                  : '?';
                const tName = ZigaMod.getPieceVnName
                  ? ZigaMod.getPieceVnName(t.Ga)
                  : '';
                return (
                  <PieceChip
                    key={idx}
                    char={tChar}
                    color={t.ka}
                    subLabel={`${tName} (${t.fa + 1},${t.rowIndex + 1})`}
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
              <Shield className="size-3.5 text-muted-foreground" />
              Đang bảo vệ đồng đội
            </span>
            <Badge variant="secondary">{defended.length}</Badge>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {defended.length === 0 ? (
              <span className="text-xs text-muted-foreground">
                Không bảo vệ quân nào
              </span>
            ) : (
              defended.map((d, idx) => {
                const dChar = ZigaMod.getPieceChar
                  ? ZigaMod.getPieceChar(d.Ga, d.ka)
                  : '?';
                const dName = ZigaMod.getPieceVnName
                  ? ZigaMod.getPieceVnName(d.Ga)
                  : '';
                return (
                  <PieceChip
                    key={idx}
                    char={dChar}
                    color={d.ka}
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
