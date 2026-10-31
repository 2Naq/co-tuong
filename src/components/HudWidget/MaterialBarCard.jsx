import React from 'react';
import { HelpCircle, Scale } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription
} from '@/components/ui/popover';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table';

const PIECE_SCORE_REF = [
  { char: '車', name: 'Xe', pts: '9.0', id: 3 },
  { char: '炮', name: 'Pháo', pts: '4.5', id: 4 },
  { char: '馬', name: 'Mã', pts: '4.0', id: 5 },
  { char: '相', name: 'Tượng', pts: '2.0', id: 2 },
  { char: '仕', name: 'Sĩ', pts: '2.0', id: 1 },
  { char: '兵', name: 'Tốt', pts: '1.0', id: 6 },
  { char: '?', name: 'Quân úp', pts: '3.0', id: 'up' }
];

export function MaterialBarCard({ material, myName, oppName, visible }) {
  if (!visible || !material) return null;

  const { myScore = 0, oppScore = 0, diff = 0, myBreakdown, oppBreakdown } = material;
  const totalScore = myScore + oppScore;
  const myPercent =
    totalScore > 0 ? Math.min(92, Math.max(8, (myScore / totalScore) * 100)) : 50;

  let diffText = 'Cân bằng (0)';
  if (diff > 0) diffText = `+${diff.toFixed(1)} (Bạn ưu)`;
  else if (diff < 0) diffText = `${diff.toFixed(1)} (Đối thủ ưu)`;

  return (
    <Card size="sm" id="ziga-material-section">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Scale className="size-4 text-primary" />
          <span>Điểm Lực Lượng</span>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  title="Xem bảng quy đổi điểm từng quân cờ"
                />
              }
            >
              <HelpCircle className="size-3.5 text-muted-foreground" />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80">
              <PopoverHeader>
                <PopoverTitle>Bảng quy đổi điểm lực lượng</PopoverTitle>
                <PopoverDescription>
                  Thống kê điểm số từng loại quân cờ trên bàn
                </PopoverDescription>
              </PopoverHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quân</TableHead>
                    <TableHead className="text-center">Hệ số</TableHead>
                    <TableHead className="text-right">
                      {myName?.slice(0, 8) || 'Bạn'}
                    </TableHead>
                    <TableHead className="text-right">
                      {oppName?.slice(0, 8) || 'Đối thủ'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PIECE_SCORE_REF.map((row) => {
                    const mItem =
                      row.id === 'up'
                        ? myBreakdown?.hidden
                        : myBreakdown?.byType?.[row.id];
                    const oItem =
                      row.id === 'up'
                        ? oppBreakdown?.hidden
                        : oppBreakdown?.byType?.[row.id];
                    if (row.id === 'up' && !mItem?.count && !oItem?.count)
                      return null;

                    return (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">
                          {row.char} {row.name}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {row.pts}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {mItem?.count
                            ? `${mItem.count} (${mItem.pts.toFixed(1)})`
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {oItem?.count
                            ? `${oItem.count} (${oItem.pts.toFixed(1)})`
                            : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </PopoverContent>
          </Popover>
        </CardTitle>
        <CardAction>
          <Badge id="ziga-mat-diff" variant={diff > 0 ? 'default' : 'secondary'}>
            {diffText}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            id="ziga-mat-fill-self"
            style={{ width: `${myPercent}%` }}
            className="h-full bg-primary transition-all duration-300"
          />
          <div className="pointer-events-none absolute top-0 bottom-0 left-1/2 w-px bg-border" />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Bạn: <strong id="ziga-mat-self-pts" className="text-foreground">{myScore.toFixed(1)}</strong> đ
          </span>
          <span>
            Đối thủ: <strong id="ziga-mat-opp-pts" className="text-foreground">{oppScore.toFixed(1)}</strong> đ
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
