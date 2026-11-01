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
} from "@/components/ui/table";

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
  if (diff > 0) diffText = `+${diff.toFixed(1)} (Bạn ưu)`;
  else if (diff < 0) diffText = `${diff.toFixed(1)} (Đối thủ ưu)`;

  return (
    <Card size="sm" id="ziga-material-section">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Scale className="text-primary size-4" />
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
              <HelpCircle className="text-muted-foreground size-3.5" />
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
                      {myName?.slice(0, 8) || "Bạn"}
                    </TableHead>
                    <TableHead className="text-right">
                      {oppName?.slice(0, 8) || "Đối thủ"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PIECE_SCORE_REF.map((row) => {
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

                    return (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">
                          {row.char} {row.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-center">
                          {row.pts}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {mCount > 0 ? `${mCount} (${mPts})` : "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-right">
                          {oCount > 0 ? `${oCount} (${oPts})` : "-"}
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
          <Badge
            id="ziga-mat-diff"
            variant={diff > 0 ? "default" : "secondary"}
          >
            {diffText}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        <div className="bg-muted relative h-2 w-full overflow-hidden rounded-full">
          <div
            id="ziga-mat-fill-self"
            style={{ width: `${myPercent}%` }}
            className="bg-primary h-full transition-all duration-300"
          />
          <div className="bg-border pointer-events-none absolute top-0 bottom-0 left-1/2 w-px" />
        </div>

        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>
            Bạn:{" "}
            <strong id="ziga-mat-self-pts" className="text-foreground">
              {myScore.toFixed(1)}
            </strong>{" "}
            đ
          </span>
          <span>
            Đối thủ:{" "}
            <strong id="ziga-mat-opp-pts" className="text-foreground">
              {oppScore.toFixed(1)}
            </strong>{" "}
            đ
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
