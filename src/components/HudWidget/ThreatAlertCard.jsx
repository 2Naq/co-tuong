import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction
} from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { PieceToken } from '@/components/ui/piece-token';

export function ThreatAlertCard({ threats = [], visible }) {
  const ZigaMod = window.ZigaMod || {};

  if (!visible || !threats || threats.length === 0) {
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
            const victimChar = ZigaMod.getPieceChar
              ? ZigaMod.getPieceChar(t.victim.Ga, t.victim.ka)
              : '?';
            const victimName = ZigaMod.getPieceVnName
              ? ZigaMod.getPieceVnName(t.victim.Ga)
              : '';
            const attackerNames = t.attackers
              .map((a) =>
                ZigaMod.getPieceVnName ? ZigaMod.getPieceVnName(a.Ga) : '?'
              )
              .join(', ');

            return (
              <div
                key={idx}
                className="flex items-center justify-between rounded-md border bg-background/60 px-2.5 py-1.5 text-xs text-foreground"
              >
                <div className="flex items-center gap-2">
                  <PieceToken char={victimChar} color={t.victim.ka} size="sm" />
                  <span className="font-medium">
                    {victimName} ({t.victim.fa + 1},{t.victim.rowIndex + 1})
                  </span>
                </div>
                <span className="text-xs text-destructive">
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
