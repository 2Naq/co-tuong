import React from 'react';
import { Dices } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table';
import { PieceChip } from '@/components/ui/piece-token';

export function CoUpTrackerCard({ stats, oppName, myName, visible }) {
  const ZigaMod = window.ZigaMod || {};

  if (!visible || !stats || !stats.isCoUp) return null;

  const renderPoolList = (pool, colorCode) => {
    const types = Object.keys(pool)
      .map(Number)
      .filter((t) => pool[t] > 0)
      .sort(
        (a, b) =>
          (ZigaMod.PIECE_ORDER?.[a] ?? 99) - (ZigaMod.PIECE_ORDER?.[b] ?? 99)
      );

    if (types.length === 0) {
      return (
        <span className="text-xs text-muted-foreground">
          Đã mở hết toàn bộ quân!
        </span>
      );
    }

    return types.map((typeId) => {
      const count = pool[typeId];
      const char = ZigaMod.getPieceChar
        ? ZigaMod.getPieceChar(typeId, colorCode)
        : '?';
      const vnName = ZigaMod.getPieceVnName
        ? ZigaMod.getPieceVnName(typeId)
        : '';
      return (
        <PieceChip
          key={typeId}
          char={char}
          color={colorCode}
          count={count}
          title={`${vnName} còn lại: ${count}`}
        />
      );
    });
  };

  return (
    <Card size="sm" id="ziga-coup-section">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Dices className="size-4 text-primary" />
          <span>Thống Kê Cờ Úp & Xác Suất</span>
        </CardTitle>
        <CardAction>
          <Badge variant="default">Cờ Úp</Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-1.5 rounded-lg border bg-muted/20 p-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">
              {oppName || 'Đối thủ'} chưa lật:
            </span>
            <Badge variant="secondary">
              {stats.oppHiddenBoardCount} bàn / {stats.oppUnrevealedTotal} túi
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {renderPoolList(stats.oppPool, stats.oppColor)}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 rounded-lg border bg-muted/20 p-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">
              {myName || 'Bạn'} chưa lật:
            </span>
            <Badge variant="secondary">
              {stats.myHiddenBoardCount} bàn / {stats.myUnrevealedTotal} túi
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {renderPoolList(stats.myPool, stats.myColor)}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Xác suất mở</TableHead>
              <TableHead className="text-right">Xe</TableHead>
              <TableHead className="text-right">Pháo</TableHead>
              <TableHead className="text-right">Mã</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="text-xs font-medium">
                {oppName?.slice(0, 8) || 'Đối thủ'}
              </TableCell>
              <TableCell className="text-right text-xs">
                {stats.oppProbs?.[3] || 0}%
              </TableCell>
              <TableCell className="text-right text-xs">
                {stats.oppProbs?.[4] || 0}%
              </TableCell>
              <TableCell className="text-right text-xs">
                {stats.oppProbs?.[5] || 0}%
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-xs font-medium">
                {myName?.slice(0, 8) || 'Bạn'}
              </TableCell>
              <TableCell className="text-right text-xs text-primary font-medium">
                {stats.myProbs?.[3] || 0}%
              </TableCell>
              <TableCell className="text-right text-xs text-primary font-medium">
                {stats.myProbs?.[4] || 0}%
              </TableCell>
              <TableCell className="text-right text-xs text-primary font-medium">
                {stats.myProbs?.[5] || 0}%
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
