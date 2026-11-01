import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export function ThreatAlertCard({ threats = [], visible }) {
  const ZigaMod = window.ZigaMod || {};

  if (!visible || !Array.isArray(threats) || threats.length === 0) {
    return null;
  }

  return (
    <Alert id="ziga-threat-banner" variant="destructive">
      <AlertTriangle />
      <AlertTitle>Cảnh báo quân đang bị dọa ăn</AlertTitle>
      <AlertAction>
        <Badge variant="destructive">{threats.length}</Badge>
      </AlertAction>
      <AlertDescription>
        <div id="ziga-threat-list" className="mt-2 flex flex-col gap-1.5">
          {threats.slice(0, 4).map((t, idx) => {
            if (!t) return null;
            const targetPiece = t.target || t.victim || {};
            const targetType =
              t.targetType !== undefined
                ? t.targetType
                : targetPiece.Ga !== undefined
                  ? targetPiece.Ga
                  : targetPiece.type;
            const targetColor =
              t.targetColor !== undefined
                ? t.targetColor
                : targetPiece.ka !== undefined
                  ? targetPiece.ka
                  : targetPiece.color;

            const victimChar =
              t.targetChar ||
              (ZigaMod.getPieceChar && targetType !== undefined
                ? ZigaMod.getPieceChar(targetType, targetColor)
                : "?");
            const victimName =
              t.targetName ||
              (ZigaMod.PIECE_DEFS?.[targetType]?.name ??
                (ZigaMod.getPieceVnName && targetType !== undefined
                  ? ZigaMod.getPieceVnName(targetType)
                  : "Quân"));

            const col = targetPiece.fa !== undefined ? targetPiece.fa : t.col;
            const row =
              targetPiece.rowIndex !== undefined
                ? targetPiece.rowIndex
                : targetPiece.row !== undefined
                  ? targetPiece.row
                  : t.row;
            const coordLabel =
              t.coordText ||
              (col !== undefined && row !== undefined
                ? `C${col + 1}·H${row + 1}`
                : "");

            let attackerNames = t.attackerName;
            if (!attackerNames) {
              if (Array.isArray(t.attackers) && t.attackers.length > 0) {
                attackerNames = t.attackers
                  .filter(Boolean)
                  .map((a) => {
                    const aType = a.Ga !== undefined ? a.Ga : a.type;
                    return (
                      ZigaMod.PIECE_DEFS?.[aType]?.name ||
                      (ZigaMod.getPieceVnName
                        ? ZigaMod.getPieceVnName(aType)
                        : "Quân")
                    );
                  })
                  .join(", ");
              } else if (t.attacker) {
                const aType =
                  t.attackerType !== undefined
                    ? t.attackerType
                    : t.attacker.Ga !== undefined
                      ? t.attacker.Ga
                      : t.attacker.type;
                attackerNames =
                  ZigaMod.PIECE_DEFS?.[aType]?.name ||
                  (ZigaMod.getPieceVnName
                    ? ZigaMod.getPieceVnName(aType)
                    : "Đối phương");
              } else {
                attackerNames = "Đối phương";
              }
            }

            return (
              <div
                key={idx}
                className="border-border bg-background/80 text-foreground flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-xs"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Badge
                    variant="outline"
                    className="text-primary px-1.5 py-0 font-serif font-bold"
                  >
                    {victimChar}
                  </Badge>
                  <span className="text-foreground truncate font-medium">
                    {victimName} {coordLabel ? `(${coordLabel})` : ""}
                  </span>
                </div>
                <span className="text-destructive shrink-0 text-xs font-medium">
                  Bị {attackerNames} nhắm
                </span>
              </div>
            );
          })}
        </div>
      </AlertDescription>
    </Alert>
  );
}
