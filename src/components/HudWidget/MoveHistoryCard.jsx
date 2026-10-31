import React, { useEffect, useRef } from 'react';
import { ScrollText, Copy, Trash2, BarChart2 } from 'lucide-react';
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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table';

export function MoveHistoryCard({ moves = [], visible }) {
  const scrollRef = useRef(null);
  const ZigaMod = window.ZigaMod || {};

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves.length]);

  if (!visible) return null;

  const pairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      round: Math.floor(i / 2) + 1,
      first: moves[i],
      second: moves[i + 1] || null
    });
  }

  return (
    <Card size="sm" id="ziga-section-history">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <ScrollText className="size-4 text-primary" />
          <span>Biên Bản Ván Đấu</span>
        </CardTitle>
        <CardAction>
          <Badge id="ziga-move-counter" variant="secondary">
            {moves.length} nước
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            variant="outline"
            size="xs"
            id="ziga-btn-copy-fen"
            onClick={() => ZigaMod.copyCurrentFen?.()}
            title="Sao chép mã FEN thế cờ hiện tại"
            className="flex-1"
          >
            <Copy />
            FEN
          </Button>

          <Button
            variant="outline"
            size="xs"
            id="ziga-btn-copy-pgn"
            onClick={() => ZigaMod.copyMoveHistoryText?.()}
            title="Sao chép toàn bộ biên bản ván đấu"
            className="flex-1"
          >
            <Copy />
            PGN
          </Button>

          <Button
            variant="default"
            size="xs"
            id="ziga-btn-game-review"
            onClick={() => ZigaMod.showGameReviewModal?.()}
            title="Phân tích chất lượng nước đi & sai lầm"
            className="flex-1"
          >
            <BarChart2 />
            Review
          </Button>

          <Button
            variant="destructive"
            size="icon-xs"
            id="ziga-btn-clear-moves"
            onClick={() => ZigaMod.resetMoveRecorder?.()}
            title="Xóa biên bản hiện tại"
          >
            <Trash2 />
          </Button>
        </div>

        <div
          id="ziga-move-list"
          ref={scrollRef}
          className="max-h-36 min-h-14 overflow-y-auto rounded-lg border bg-muted/20"
        >
          {pairs.length === 0 ? (
            <div className="p-3 text-center text-xs text-muted-foreground">
              Đang theo dõi... Các nước đi sẽ tự động xuất hiện tại đây.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Tiên (Đỏ)</TableHead>
                  <TableHead>Hậu (Đen)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pairs.map((p) => (
                  <TableRow key={p.round}>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {p.round}.
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium">
                      {p.first?.notation || ''}
                      {p.first?.capturedChar ? (
                        <span className="ml-1 text-primary">
                          ({p.first.capturedChar})
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {p.second?.notation || ''}
                      {p.second?.capturedChar ? (
                        <span className="ml-1 text-primary">
                          ({p.second.capturedChar})
                        </span>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
