// src/features/game_review.js - Post-game Blunder Analysis, Move Accuracy & shadcn/ui Review Modal
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart2, Compass, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

(function (ZigaMod) {
  'use strict';

  function classifyMoveQuality(scoreBefore, scoreAfter, isRed) {
    const evalChange = isRed ? scoreAfter - scoreBefore : scoreBefore - scoreAfter;

    if (evalChange >= 1.5) {
      return { type: 'brilliant', label: 'Tuyệt chiêu', variant: 'default' };
    }
    if (evalChange >= -0.2) {
      return { type: 'best', label: 'Nước tốt nhất', variant: 'secondary' };
    }
    if (evalChange >= -0.7) {
      return { type: 'inaccuracy', label: 'Chưa tối ưu', variant: 'outline' };
    }
    if (evalChange >= -1.6) {
      return { type: 'mistake', label: 'Nước sai lầm', variant: 'secondary' };
    }
    return { type: 'blunder', label: 'Sai lầm chí mạng', variant: 'destructive' };
  }

  function analyzeGame(history) {
    if (!history || !Array.isArray(history) || history.length === 0) return null;

    const redStats = {
      brilliant: 0,
      best: 0,
      inaccuracy: 0,
      mistake: 0,
      blunder: 0,
      totalMoves: 0,
      scoreAccSum: 0
    };
    const blackStats = {
      brilliant: 0,
      best: 0,
      inaccuracy: 0,
      mistake: 0,
      blunder: 0,
      totalMoves: 0,
      scoreAccSum: 0
    };
    const analyzedMoves = [];

    let prevScore = 0.0;

    for (let i = 0; i < history.length; i++) {
      const move = history[i];
      const isRed = move.turnColor === 0;

      let currentScore = prevScore;
      if (move.capturedType !== null && move.capturedType !== undefined) {
        const valMap = { 3: 4.5, 4: 2.5, 5: 2.0, 1: 1.0, 2: 1.0, 6: 0.8, 0: 10.0 };
        const capVal = valMap[move.capturedType] || 1.0;
        currentScore += isRed ? capVal : -capVal;
      }

      const quality = classifyMoveQuality(prevScore, currentScore, isRed);
      const targetStats = isRed ? redStats : blackStats;

      targetStats[quality.type]++;
      targetStats.totalMoves++;

      let moveAcc = 100;
      if (quality.type === 'inaccuracy') moveAcc = 82;
      else if (quality.type === 'mistake') moveAcc = 55;
      else if (quality.type === 'blunder') moveAcc = 15;
      targetStats.scoreAccSum += moveAcc;

      analyzedMoves.push({
        moveIndex: i,
        moveNumber: move.moveNumber,
        turnColor: move.turnColor,
        notation: move.notation,
        quality,
        scoreBefore: prevScore,
        scoreAfter: currentScore
      });

      prevScore = currentScore;
    }

    const redAccuracy =
      redStats.totalMoves > 0
        ? (redStats.scoreAccSum / redStats.totalMoves).toFixed(1)
        : '100.0';
    const blackAccuracy =
      blackStats.totalMoves > 0
        ? (blackStats.scoreAccSum / blackStats.totalMoves).toFixed(1)
        : '100.0';

    return {
      totalRounds: Math.ceil(history.length / 2),
      redStats,
      blackStats,
      redAccuracy,
      blackAccuracy,
      analyzedMoves
    };
  }

  let reviewRoot = null;
  let reviewHost = null;
  let setReviewStateExternal = null;

  function GameReviewDialogHost() {
    const [state, setState] = useState({
      open: false,
      analysis: null,
      redPlayer: 'Bên Đỏ',
      blackPlayer: 'Bên Đen'
    });

    useEffect(() => {
      setReviewStateExternal = setState;
    }, []);

    const { open, analysis, redPlayer, blackPlayer } = state;
    if (!analysis) return null;

    const notableMoves = analysis.analyzedMoves
      .filter(
        (m) =>
          m.quality.type === 'blunder' ||
          m.quality.type === 'mistake' ||
          m.quality.type === 'brilliant'
      )
      .slice(0, 8);

    const rows = [
      { key: 'brilliant', label: 'Tuyệt chiêu (Brilliant)' },
      { key: 'best', label: 'Tốt nhất (Best Move)' },
      { key: 'inaccuracy', label: 'Chưa tối ưu (Inaccuracy)' },
      { key: 'mistake', label: 'Nước sai lầm (Mistake)' },
      { key: 'blunder', label: 'Sơ hở chí mạng (Blunder)' }
    ];

    return (
      <Dialog
        open={open}
        onOpenChange={(val) => setState((s) => ({ ...s, open: val }))}
      >
        <DialogContent className="sm:max-w-xl max-h-[88vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart2 className="size-4 text-primary" />
              <span>Tổng Kết & Phân Tích Ván Đấu</span>
            </DialogTitle>
            <DialogDescription>
              Đánh giá chất lượng nước đi và sai lầm then chốt ({analysis.totalRounds} hiệp)
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 py-1">
            {/* Accuracy Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card size="sm">
                <CardContent className="flex flex-col items-center gap-1 py-1 text-center">
                  <span className="text-xs font-medium text-muted-foreground">
                    {redPlayer} (Đỏ)
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {analysis.redAccuracy}%
                  </span>
                  <Badge variant="secondary">Độ chính xác</Badge>
                </CardContent>
              </Card>

              <Card size="sm">
                <CardContent className="flex flex-col items-center gap-1 py-1 text-center">
                  <span className="text-xs font-medium text-muted-foreground">
                    {blackPlayer} (Đen)
                  </span>
                  <span className="text-2xl font-bold text-foreground">
                    {analysis.blackAccuracy}%
                  </span>
                  <Badge variant="secondary">Độ chính xác</Badge>
                </CardContent>
              </Card>
            </div>

            {/* Quality Breakdown Table */}
            <Card size="sm">
              <CardHeader>
                <CardTitle>Thống kê phân loại nước đi</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Đỏ</TableHead>
                      <TableHead>Phân loại nước đi</TableHead>
                      <TableHead className="text-center">Đen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.key}>
                        <TableCell className="text-center font-semibold text-primary">
                          {analysis.redStats[r.key]}
                        </TableCell>
                        <TableCell className="font-medium">{r.label}</TableCell>
                        <TableCell className="text-center font-semibold text-foreground">
                          {analysis.blackStats[r.key]}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Notable Moves */}
            <Card size="sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-1.5">
                  <Sparkles className="size-4 text-primary" />
                  <span>Các nước đi đáng chú ý</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1.5">
                {notableMoves.length === 0 ? (
                  <span className="text-xs text-muted-foreground">
                    Ván đấu diễn ra chặt chẽ, không có sai lầm nghiêm trọng!
                  </span>
                ) : (
                  notableMoves.map((m) => (
                    <div
                      key={m.moveIndex}
                      className="flex items-center justify-between rounded-md border bg-muted/20 px-2.5 py-1.5 text-xs"
                    >
                      <span>
                        Nước <strong>{m.moveNumber}</strong> (
                        {m.turnColor === 0 ? 'Đỏ' : 'Đen'}):{' '}
                        <strong className="font-mono text-primary">
                          {m.notation}
                        </strong>
                      </span>
                      <Badge variant={m.quality.variant}>{m.quality.label}</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="shrink-0 sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setState((s) => ({ ...s, open: false }));
                ZigaMod.openTacticalSandbox?.();
              }}
            >
              <Compass />
              Mở Bàn Cờ Ảo Để Rút Kinh Nghiệm
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setState((s) => ({ ...s, open: false }))}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  function showGameReviewModal() {
    const history = ZigaMod.moveHistory || [];
    const data = ZigaMod.getActiveGameData ? ZigaMod.getActiveGameData() : null;

    if (history.length === 0) {
      if (ZigaMod.copyToClipboard) {
        ZigaMod.copyToClipboard(
          '',
          'ℹ️ Chưa có nước đi nào trong ván đấu để phân tích!'
        );
      }
      return;
    }

    const analysis = analyzeGame(history);
    if (!analysis) return;

    const redPlayer =
      data && data.myColor === 0
        ? data.myName || 'Bên Đỏ'
        : data && data.oppName
          ? data.oppName
          : 'Bên Đỏ';
    const blackPlayer =
      data && data.myColor === 1
        ? data.myName || 'Bên Đen'
        : data && data.oppName
          ? data.oppName
          : 'Bên Đen';

    if (!reviewHost) {
      reviewHost = document.createElement('div');
      reviewHost.id = 'ziga-game-review-modal';
      reviewHost.className = 'ziga-shadcn-root';
      document.body.appendChild(reviewHost);
      reviewRoot = createRoot(reviewHost);
      reviewRoot.render(<GameReviewDialogHost />);
    }

    setTimeout(() => {
      if (setReviewStateExternal) {
        setReviewStateExternal({
          open: true,
          analysis,
          redPlayer,
          blackPlayer
        });
      }
    }, 0);
  }

  ZigaMod.analyzeGame = analyzeGame;
  ZigaMod.showGameReviewModal = showGameReviewModal;
})(window.ZigaMod = window.ZigaMod || {});
