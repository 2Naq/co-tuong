import React from "react";
import { HelpCircle, Scale } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "@/components/ui/popover";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import { cn } from "../../lib/utils";

const PIECE_SCORE_REF = [
  { char: "車", name: "Xe", pts: "9.0", id: 3 },
  { char: "炮", name: "Pháo", pts: "4.5", id: 4 },
  { char: "馬", name: "Mã", pts: "4.0", id: 5 },
  { char: "相", name: "Tượng", pts: "2.0", id: 2 },
  { char: "仕", name: "Sĩ", pts: "2.0", id: 1 },
  { char: "兵", name: "Tốt", pts: "1.0", id: 6 },
  { char: "?", name: "Quân úp", pts: "3.0", id: "up" },
];

export function MaterialBarCard({ material, myName, oppName, visible }) {
  if (!visible || !material) return null;

  const myScore = typeof material.myScore === "number" ? material.myScore : 0;
  const oppScore =
    typeof material.oppScore === "number" ? material.oppScore : 0;
  const diff =
    typeof material.diff === "number" ? material.diff : myScore - oppScore;
  const myCounts = material.myCounts || {};
  const oppCounts = material.oppCounts || {};
  const totalScore = myScore + oppScore;
  const myPercent =
    totalScore > 0
      ? Math.min(92, Math.max(8, (myScore / totalScore) * 100))
      : 50;

  let diffText = "Cân bằng (0)";
  let diffBadgeClass =
    "border-border/50 bg-white/5 text-muted-foreground font-medium";
  if (diff > 0) {
    diffText = `+${diff.toFixed(1)} (Bạn ưu)`;
    diffBadgeClass =
      "border-emerald-500/40 bg-emerald-500/15 text-emerald-400 font-semibold";
  } else if (diff < 0) {
    diffText = `${diff.toFixed(1)} (Đối thủ ưu)`;
    diffBadgeClass =
      "border-rose-500/40 bg-rose-500/15 text-rose-400 font-semibold";
  }

  return (
    <Card
      size="sm"
      id="ziga-material-section"
      className="transition-all duration-200"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-1.5">
          <Scale className="text-primary size-4 shrink-0" />
          <span className="text-xs font-bold tracking-tight">
            Điểm Lực Lượng
          </span>
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-muted-foreground/70 hover:text-foreground size-5 rounded-full transition-colors hover:bg-white/10"
                  title="Xem bảng quy đổi điểm chi tiết từng quân cờ"
                />
              }
            >
              <HelpCircle className="size-3.5" />
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-84 p-3.5 backdrop-blur-2xl"
            >
              <PopoverHeader className="border-border/30 border-b pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Scale className="text-primary size-4 shrink-0" />
                    <PopoverTitle className="text-xs font-bold tracking-tight">
                      Bảng Quy Đổi Lực Lượng
                    </PopoverTitle>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-border/40 text-muted-foreground bg-white/5 px-2 py-0.5 text-[9.5px] font-normal"
                  >
                    Chuẩn Quốc Tế
                  </Badge>
                </div>
                <PopoverDescription className="text-muted-foreground/80 mt-0.5 text-[11px]">
                  Thống kê tương quan điểm số từng loại quân trên bàn
                </PopoverDescription>
              </PopoverHeader>
              <Table className="mt-1">
                <TableHeader>
                  <TableRow className="text-[11px]">
                    <TableHead className="text-foreground h-7 font-bold">
                      Quân cờ
                    </TableHead>
                    <TableHead className="text-muted-foreground h-7 text-center font-bold">
                      Hệ số
                    </TableHead>
                    <TableHead className="text-primary h-7 text-right font-bold">
                      {myName?.slice(0, 10) || "Bạn"}
                    </TableHead>
                    <TableHead className="h-7 text-right font-bold text-rose-400">
                      {oppName?.slice(0, 10) || "Đối thủ"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-[11px]">
                  {PIECE_SCORE_REF.map((row, idx) => {
                    const mCount =
                      typeof myCounts[row.id] === "number"
                        ? myCounts[row.id]
                        : 0;
                    const oCount =
                      typeof oppCounts[row.id] === "number"
                        ? oppCounts[row.id]
                        : 0;
                    if (row.id === "up" && mCount === 0 && oCount === 0) {
                      return null;
                    }
                    const unitPts = parseFloat(row.pts) || 0;
                    const mPts = (mCount * unitPts).toFixed(1);
                    const oPts = (oCount * unitPts).toFixed(1);

                    const myLead = mCount > oCount;
                    const oppLead = oCount > mCount;

                    return (
                      <TableRow
                        key={row.id}
                        className={cn(
                          "h-7 transition-colors",
                          idx % 2 === 1 ? "bg-white/[0.02]" : "bg-transparent",
                          "hover:bg-white/[0.06]",
                        )}
                      >
                        <TableCell className="text-foreground py-1 font-semibold">
                          <span className="font-mono text-xs font-bold">
                            {row.char}
                          </span>{" "}
                          <span className="text-foreground/90">{row.name}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground/80 py-1 text-center font-mono text-[10.5px]">
                          {row.pts}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "py-1 text-right font-mono text-[11px]",
                            myLead
                              ? "text-primary font-bold"
                              : "text-foreground/90 font-medium",
                          )}
                        >
                          {mCount > 0 ? `${mCount} (${mPts})` : "-"}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "py-1 text-right font-mono text-[11px]",
                            oppLead
                              ? "font-bold text-rose-400"
                              : "text-muted-foreground font-medium",
                          )}
                        >
                          {oCount > 0 ? `${oCount} (${oPts})` : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter className="text-[11px] font-semibold">
                  <TableRow className="h-8">
                    <TableCell
                      colSpan={2}
                      className="text-foreground py-1 font-bold"
                    >
                      Tổng Điểm
                    </TableCell>
                    <TableCell className="text-primary py-1 text-right font-mono text-xs font-extrabold">
                      {myScore.toFixed(1)} đ
                    </TableCell>
                    <TableCell className="py-1 text-right font-mono text-xs font-extrabold text-rose-400">
                      {oppScore.toFixed(1)} đ
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </PopoverContent>
          </Popover>
        </CardTitle>
        <CardAction>
          <Badge
            id="ziga-mat-diff"
            variant="outline"
            className={cn(
              "px-2 py-0.5 text-[10px] tracking-tight shadow-2xs",
              diffBadgeClass,
            )}
          >
            {diffText}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-2.5 pt-0">
        {/* Dual Tug-of-war Material Bar */}
        <div className="border-border/30 bg-muted/40 relative h-2.5 w-full overflow-hidden rounded-full border shadow-inner backdrop-blur-xs">
          {/* My (Self) progress fill */}
          <div
            id="ziga-mat-fill-self"
            style={{ width: `${myPercent}%` }}
            className="bg-primary h-full transition-all duration-300"
          />
          {/* Opponent subtle fill */}
          <div
            style={{ left: `${myPercent}%`, width: `${100 - myPercent}%` }}
            className="absolute top-0 bottom-0 bg-rose-500/35 transition-all duration-300"
          />
          {/* Center 50% equilibrium marker */}
          <div className="bg-foreground/50 pointer-events-none absolute top-0 bottom-0 left-1/2 z-10 w-0.5 -translate-x-1/2 shadow-xs" />
        </div>

        {/* Detailed High-Contrast Score Row */}
        <div className="flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="bg-primary size-2 shrink-0 rounded-full shadow-xs" />
            <span className="text-muted-foreground text-[11px]">Bạn:</span>
            <span className="text-foreground font-mono text-xs font-bold">
              <span id="ziga-mat-self-pts">{myScore.toFixed(1)}</span> đ
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="size-2 shrink-0 rounded-full bg-rose-500/70 shadow-xs" />
            <span className="text-muted-foreground text-[11px]">Đối thủ:</span>
            <span className="text-foreground font-mono text-xs font-bold">
              <span id="ziga-mat-opp-pts">{oppScore.toFixed(1)}</span> đ
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
