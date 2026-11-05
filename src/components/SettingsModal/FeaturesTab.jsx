import React, { useState } from "react";
import { Swords, BarChart3, Wrench, Sparkles, Search } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cn } from "../../lib/utils";

const FEATURE_CATEGORIES = [
  {
    id: "tactical",
    title: "Hỗ Trợ Tác Chiến & Cảnh Báo",
    desc: "Các công cụ phân tích thế cờ, gợi ý chiến thuật và cảnh báo đe dọa",
    icon: Swords,
    features: [
      {
        key: "liveBoardAura",
        alias: "boardAura",
        title: "Aura Live (Hào quang bàn cờ)",
        desc: "Lượt ta viền quân ăn được, lượt đối thủ viền quân ta bị nhắm",
        badge: "Khuyên dùng",
        badgeVariant: "default",
      },
      {
        key: "highlightTactics",
        alias: "highlight",
        title: "Highlight tầm đánh khi click quân",
        desc: "Bấm vào quân cờ để nhấp nháy toàn bộ quân đối phương ăn được",
        badge: "Khuyên dùng",
        badgeVariant: "default",
      },
      {
        key: "threatAlert",
        title: "Cảnh báo bị dọa ăn (Threat Scanner)",
        desc: "Báo động nguy cấp khi Xe, Pháo, Mã của bạn bị đối phương nhắm",
        badge: "Hot",
        badgeVariant: "destructive",
      },
      {
        key: "evalBar",
        title: "Thanh AI Eval Bar (Đo thế trận)",
        desc: "Hiển thị cột đo điểm ưu thế Đỏ / Đen theo thuật toán thế cờ",
        badge: "AI",
        badgeVariant: "secondary",
      },
      {
        key: "bestMoveArrow",
        title: "Mũi tên gợi ý nước tối ưu (Best Move)",
        desc: "Tự động vẽ mũi tên định hướng nước đi sắc sảo nhất",
        badge: "AI",
        badgeVariant: "secondary",
      },
      {
        key: "mentorCoach",
        title: "Gia Sư Đồng Hành (Mentor Coach)",
        desc: "Phân tích thế trận, gợi ý kế sách dài hạn & chỉ điểm sơ hở",
        badge: "AI",
        badgeVariant: "secondary",
      },
      {
        key: "showTacticalHud",
        title: "Chi tiết tầm đánh trong HUD",
        desc: "Liệt kê danh sách quân ăn được & quân bảo vệ chi tiết trên bảng",
      },
    ],
  },
  {
    id: "stats",
    title: "Thống Kê, Điểm Số & Cờ Úp",
    desc: "Đo lường lực lượng, theo dõi chủ lực còn lại và xác suất mở Cờ Úp",
    icon: BarChart3,
    features: [
      {
        key: "showLostPieces",
        title: "Thống kê quân đã bị ăn",
        desc: "Danh sách trực quan các quân cờ đã bị tiêu diệt của cả 2 bên",
        badge: "Khuyên dùng",
        badgeVariant: "default",
      },
      {
        key: "materialAdvantage",
        title: "Thanh chênh lệch điểm quân",
        desc: "Quy đổi sức mạnh lực lượng (+9 Xe, +4.5 Pháo, +4 Mã, +1.5 Tốt)",
        badge: "Khuyên dùng",
        badgeVariant: "default",
      },
      {
        key: "showKeyPieces",
        title: "Đếm Xe - Pháo - Mã còn lại",
        desc: "Thống kê số lượng chủ lực còn sống trên bàn cờ của 2 bên",
        badge: "Khuyên dùng",
        badgeVariant: "default",
      },
      {
        key: "showCoUpTracker",
        title: "Thống kê & Xác suất Cờ Úp",
        desc: "Đếm số quân úp chưa lật và tính % mở ra Xe, Pháo, Mã chuẩn xác",
        badge: "Cờ Úp",
        badgeVariant: "outline",
      },
      {
        key: "showMoveHistory",
        title: "Biên bản ván đấu & Xuất FEN/PGN",
        desc: "Ghi chép lịch sử từng nước đi để xuất sang phần mềm phân tích AI",
      },
    ],
  },
  {
    id: "utilities",
    title: "Tiện Ích, Giọng Nói & Bàn Cờ",
    desc: "Tọa độ chuẩn kỳ phổ, giọng đọc thuyết minh và dọn dẹp giao diện",
    icon: Wrench,
    features: [
      {
        key: "showRowNumbers",
        alias: "rowNumbers",
        title: "Tọa độ chuẩn Cờ Tướng (1 - 9)",
        desc: "Hiển thị số lộ dọc từ phải sang trái chuẩn theo góc nhìn mỗi bên",
        badge: "Khuyên dùng",
        badgeVariant: "default",
      },
      {
        key: "tacticalDrawing",
        title: "Vẽ mũi tên chiến thuật (Chuột phải)",
        desc: "Kéo chuột phải vẽ mũi tên tính cờ, click phải đánh dấu ô trọng điểm",
        badge: "Mới",
        badgeVariant: "outline",
      },
      {
        key: "openingBook",
        title: "Nhận diện Khai Cuộc (Opening Book)",
        desc: "Tự động phát hiện Thuận Pháo, Bình Phong Mã, Tiên Nhân Chỉ Lộ...",
        badge: "Mới",
        badgeVariant: "outline",
      },
      {
        key: "voiceAnnouncer",
        title: "Thuyết minh giọng nói Cờ Tướng",
        desc: "Giọng đọc tiếng Việt truyền cảm (Chiếu tướng, Ăn Xe, Bắt Mã...)",
      },
      {
        key: "timerAlertVoice",
        title: "Cảnh báo nhịp tim & sắp hết giờ",
        desc: "Hiệu ứng âm thanh cảnh báo dồn dập khi thời gian chỉ còn dưới 15 giây",
        badge: "Khuyên dùng",
        badgeVariant: "default",
      },
      {
        key: "vietnameseLabels",
        title: "Chữ tiếng Việt (X, P, M...)",
        desc: "Hiển thị ký hiệu viết tắt tiếng Việt thay cho chữ Hán trên các thẻ",
      },
      {
        key: "cleanAdView",
        title: "Tự động ẩn quảng cáo che vướng",
        desc: "Ẩn các dải banner quảng cáo hai bên hông che khuất bàn cờ",
        badge: "Khuyên dùng",
        badgeVariant: "default",
      },
    ],
  },
];

const RECOMMENDED_SETTINGS = {
  showLostPieces: true,
  highlightTactics: true,
  highlight: true,
  liveBoardAura: true,
  boardAura: true,
  materialAdvantage: true,
  showKeyPieces: true,
  showRowNumbers: true,
  rowNumbers: true,
  timerAlertVoice: true,
  cleanAdView: true,
  evalBar: true,
};

function FeatureRow({ item, checked, onToggle }) {
  return (
    <Label
      htmlFor={`ziga-opt-${item.key}`}
      className={cn(
        "flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 font-normal transition-all",
        checked
          ? "border-primary/40 bg-accent/40 shadow-xs"
          : "border-border/60 bg-muted/20 hover:bg-accent/30",
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5 pr-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-foreground text-xs font-semibold">
            {item.title}
          </span>
          {item.badge && (
            <Badge
              variant={item.badgeVariant || "outline"}
              className="px-1.5 py-0 text-[10px] leading-none font-medium"
            >
              {item.badge}
            </Badge>
          )}
        </div>
        <span className="text-muted-foreground text-[11px] leading-relaxed">
          {item.desc}
        </span>
      </div>
      <Switch
        id={`ziga-opt-${item.key}`}
        checked={!!checked}
        onCheckedChange={(val) => onToggle(item.key, val, item.alias)}
      />
    </Label>
  );
}

export function FeaturesTab({ draft, updateDraft }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleToggle = (key, val, alias) => {
    const patch = { [key]: val };
    if (alias) patch[alias] = val;
    updateDraft(patch);
  };

  const getChecked = (item) => {
    if (draft[item.key] !== undefined) return draft[item.key];
    if (item.alias && draft[item.alias] !== undefined) return draft[item.alias];
    return false;
  };

  const handleApplyRecommended = () => {
    updateDraft(RECOMMENDED_SETTINGS);
  };

  const q = searchQuery.toLowerCase().trim();

  return (
    <div className="flex flex-col gap-3.5">
      {/* Top Banner Action Bar */}
      <div className="border-border/80 bg-muted/30 flex flex-col items-stretch justify-between gap-2.5 rounded-lg border p-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm tính năng (tầm đánh, aura, cờ úp, giọng nói...)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-input/60 bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary w-full rounded-md border py-1.5 pr-3 pl-8 text-xs focus:ring-1 focus:outline-none"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleApplyRecommended}
          className="border-primary/40 hover:bg-primary/10 text-primary shrink-0 gap-1.5 text-xs"
          title="Bật ngay cấu hình chuẩn khuyên dùng cho trải nghiệm tốt nhất"
        >
          <Sparkles className="size-3.5" />
          <span>Bật Bộ Khuyên Dùng</span>
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
        {FEATURE_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const filteredFeatures = cat.features.filter((f) => {
            if (!q) return true;
            return (
              f.title.toLowerCase().includes(q) ||
              f.desc.toLowerCase().includes(q)
            );
          });

          if (filteredFeatures.length === 0) return null;

          const activeCount = filteredFeatures.filter((f) =>
            getChecked(f),
          ).length;

          return (
            <Card
              key={cat.id}
              size="sm"
              className={cn(
                cat.id === "utilities" ? "lg:col-span-2" : "",
                "flex flex-col",
              )}
            >
              <CardHeader className="pb-2.5">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Icon className="text-primary size-4" />
                    <span>{cat.title}</span>
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="text-[11px] font-medium"
                  >
                    {activeCount}/{filteredFeatures.length} Bật
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {cat.desc}
                </CardDescription>
              </CardHeader>
              <CardContent
                className={cn(
                  "flex flex-col gap-2",
                  cat.id === "utilities"
                    ? "grid grid-cols-1 sm:grid-cols-2"
                    : "",
                )}
              >
                {filteredFeatures.map((item) => (
                  <FeatureRow
                    key={item.key}
                    item={item}
                    checked={getChecked(item)}
                    onToggle={handleToggle}
                  />
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
