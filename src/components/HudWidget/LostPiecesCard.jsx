import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieceChip } from '@/components/ui/piece-token';

export function LostPiecesCard({
  inGame,
  myName,
  oppName,
  myColor,
  oppColor,
  deadMyPieces = [],
  deadOppPieces = [],
  visible
}) {
  const ZigaMod = window.ZigaMod || {};

  if (!visible) return null;

  const groupPieces = (piecesList, colorCode) => {
    const grouped = {};
    if (Array.isArray(piecesList)) {
      for (const p of piecesList) {
        if (!p || p.type === undefined) continue;
        if (!grouped[p.type]) grouped[p.type] = 0;
        grouped[p.type]++;
      }
    }
    const sortedTypes = Object.keys(grouped)
      .map(Number)
      .sort(
        (a, b) =>
          (ZigaMod.PIECE_ORDER?.[a] ?? 99) - (ZigaMod.PIECE_ORDER?.[b] ?? 99)
      );
    return sortedTypes.map((typeId) => ({
      typeId,
      count: grouped[typeId],
      char: ZigaMod.getPieceChar
        ? ZigaMod.getPieceChar(typeId, colorCode)
        : '?',
      vnName: ZigaMod.getPieceVnName ? ZigaMod.getPieceVnName(typeId) : ''
    }));
  };

  const oppGroups = groupPieces(deadOppPieces, oppColor);
  const myGroups = groupPieces(deadMyPieces, myColor);

  return (
    <div id="ziga-section-lost-pieces" className="flex flex-col gap-2.5">
      {/* Opponent Lost Pieces */}
      <Card size="sm">
        <CardHeader>
          <CardTitle id="ziga-opp-label" className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-destructive" />
            <span>
              {inGame
                ? `${oppName} đã mất (${oppColor === 0 ? 'Đỏ' : 'Đen'})`
                : 'Quân đối thủ đã mất'}
            </span>
          </CardTitle>
          <CardAction>
            <Badge id="ziga-opp-count" variant="secondary">
              {deadOppPieces.length}/16
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div
            id="ziga-opp-lost-grid"
            className="flex min-h-6 flex-wrap items-center gap-1.5"
          >
            {!inGame ? (
              <span className="text-xs text-muted-foreground">
                Chờ bắt đầu ván đấu...
              </span>
            ) : oppGroups.length === 0 ? (
              <span className="text-xs text-muted-foreground">
                Chưa mất quân nào
              </span>
            ) : (
              oppGroups.map((g) => (
                <PieceChip
                  key={g.typeId}
                  char={g.char}
                  color={oppColor}
                  name={g.vnName}
                  count={g.count}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Player Lost Pieces */}
      <Card size="sm">
        <CardHeader>
          <CardTitle id="ziga-self-label" className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            <span>
              {inGame
                ? `${myName} đã mất (${myColor === 0 ? 'Đỏ' : 'Đen'})`
                : 'Quân của bạn đã mất'}
            </span>
          </CardTitle>
          <CardAction>
            <Badge id="ziga-self-count" variant="secondary">
              {deadMyPieces.length}/16
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div
            id="ziga-self-lost-grid"
            className="flex min-h-6 flex-wrap items-center gap-1.5"
          >
            {!inGame ? (
              <span className="text-xs text-muted-foreground">
                Chờ bắt đầu ván đấu...
              </span>
            ) : myGroups.length === 0 ? (
              <span className="text-xs text-muted-foreground">
                Chưa mất quân nào
              </span>
            ) : (
              myGroups.map((g) => (
                <PieceChip
                  key={g.typeId}
                  char={g.char}
                  color={myColor}
                  name={g.vnName}
                  count={g.count}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
