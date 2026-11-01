import React from "react";
import { Dices } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { PieceChip } from "@/components/ui/piece-token";

export function CoUpTrackerCard({ stats, oppName, myName, visible }) {
  const ZigaMod = window.ZigaMod || {};

  if (!visible || !stats) return null;

  const oppData = stats.opp || {};
  const myData = stats.self || {};
  const oppUnopened = oppData.unopenedCount ?? stats.oppHiddenBoardCount ?? 0;
  const myUnopened = myData.unopenedCount ?? stats.myHiddenBoardCount ?? 0;

  const oppPool = stats.oppPool || {
    3: oppData.hiddenXe || 0,
    4: oppData.hiddenPhao || 0,
    5: oppData.hiddenMa || 0,
    1: Math.floor((oppData.hiddenPhe || 0) / 2),
    2: Math.ceil((oppData.hiddenPhe || 0) / 2),
    6: oppData.hiddenTot || 0,
  };

  const myPool = stats.myPool || {
    3: myData.hiddenXe || 0,
    4: myData.hiddenPhao || 0,
    5: myData.hiddenMa || 0,
    1: Math.floor((myData.hiddenPhe || 0) / 2),
    2: Math.ceil((myData.hiddenPhe || 0) / 2),
    6: myData.hiddenTot || 0,
  };

  const oppColor = stats.oppColor ?? 1;
  const myColor = stats.myColor ?? 0;

  const renderPoolList = (pool = {}, colorCode) => {
    const types = Object.keys(pool)
      .map(Number)
      .filter((t) => (pool[t] || 0) > 0)
      .sort(
        (a, b) =>
          (ZigaMod.PIECE_ORDER?.[a] ?? 99) - (ZigaMod.PIECE_ORDER?.[b] ?? 99),
      );

    if (types.length === 0) {
      return (
        <span className="text-muted-foreground text-xs">
          Đã mở hết toàn bộ quân!
        </span>
      );
    }

    return types.map((typeId) => {
      const count = pool[typeId];
      const char = ZigaMod.getPieceChar
        ? ZigaMod.getPieceChar(typeId, colorCode)
        : "?";
      const vnName = ZigaMod.getPieceVnName
        ? ZigaMod.getPieceVnName(typeId)
        : "";
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
          <Dices className="text-primary size-4" />
          <span>Thống Kê Cờ Úp & Xác Suất</span>
        </CardTitle>
        <CardAction>
          <Badge variant="default">Cờ Úp</Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-2.5">
        <div className="bg-muted/20 flex flex-col gap-1.5 rounded-lg border p-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground font-medium">
              {oppName || "Đối thủ"} chưa lật:
            </span>
            <Badge variant="secondary">{oppUnopened} quân úp</Badge>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {renderPoolList(oppPool, oppColor)}
          </div>
        </div>

        <div className="bg-muted/20 flex flex-col gap-1.5 rounded-lg border p-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground font-medium">
              {myName || "Bạn"} chưa lật:
            </span>
            <Badge variant="secondary">{myUnopened} quân úp</Badge>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {renderPoolList(myPool, myColor)}
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
                {oppName?.slice(0, 8) || "Đối thủ"}
              </TableCell>
              <TableCell className="text-right text-xs">
                {oppData.probXe ?? stats.oppProbs?.[3] ?? 0}%
              </TableCell>
              <TableCell className="text-right text-xs">
                {oppData.probPhao ?? stats.oppProbs?.[4] ?? 0}%
              </TableCell>
              <TableCell className="text-right text-xs">
                {oppData.probMa ?? stats.oppProbs?.[5] ?? 0}%
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="text-xs font-medium">
                {myName?.slice(0, 8) || "Bạn"}
              </TableCell>
              <TableCell className="text-primary text-right text-xs font-medium">
                {myData.probXe ?? stats.myProbs?.[3] ?? 0}%
              </TableCell>
              <TableCell className="text-primary text-right text-xs font-medium">
                {myData.probPhao ?? stats.myProbs?.[4] ?? 0}%
              </TableCell>
              <TableCell className="text-primary text-right text-xs font-medium">
                {myData.probMa ?? stats.myProbs?.[5] ?? 0}%
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
