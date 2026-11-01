import React from 'react';
import { Swords, BarChart3 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';

const COMBAT_FEATURES = [
  {
    key: 'showLostPieces',
    title: 'Quân đã bị ăn',
    desc: 'Thống kê số lượng quân đã mất của 2 bên'
  },
  {
    key: 'highlightTactics',
    alias: 'highlight',
    title: 'Highlight tầm đánh trên bàn cờ',
    desc: 'Bấm vào quân để nhấp nháy quân ăn được'
  },
  {
    key: 'liveBoardAura',
    alias: 'boardAura',
    title: 'Aura Live (Hào quang trên bàn cờ)',
    desc: 'Lượt ta viền quân ăn được, lượt đối thủ viền quân ta bị nhắm'
  },
  {
    key: 'showTacticalHud',
    title: 'Chi tiết tầm đánh trong HUD',
    desc: 'Liệt kê danh sách quân ăn được & quân bảo vệ'
  },
  {
    key: 'threatAlert',
    title: 'Cảnh báo bị dọa ăn (Threat Scanner)',
    desc: 'Báo động khi Xe, Pháo, Mã của bạn bị đối phương nhắm'
  },
  {
    key: 'evalBar',
    title: 'Thanh AI Eval Bar (Đánh giá thế trận)',
    desc: 'Hiển thị cột điểm lợi thế Đỏ/Đen cạnh bàn cờ'
  },
  {
    key: 'bestMoveArrow',
    title: 'Gợi ý nước đi tốt nhất (AI Best Move)',
    desc: 'Tự động vẽ mũi tên vàng gợi ý nước đi tối ưu'
  },
  {
    key: 'mentorCoach',
    title: 'Gia Sư Đồng Hành (Mentor Coach)',
    desc: 'Phân tích thế trận, kế hoạch tác chiến & điểm yếu'
  }
];

const STATS_FEATURES = [
  {
    key: 'showCoUpTracker',
    title: 'Thống kê & Xác suất Cờ Úp',
    desc: 'Đếm quân úp và tính % mở Xe, Pháo, Mã...'
  },
  {
    key: 'materialAdvantage',
    title: 'Thanh chênh lệch điểm quân',
    desc: 'Đo lường ưu thế lực lượng (+9 Xe, +4.5 Pháo...)'
  },
  {
    key: 'showKeyPieces',
    title: 'Đếm Xe - Pháo - Mã còn lại',
    desc: 'Thống kê số lượng chủ lực còn sống'
  },
  {
    key: 'showMoveHistory',
    title: 'Biên bản ván đấu & Xuất FEN',
    desc: 'Ghi chép lịch sử nước đi để phân tích AI'
  },
  {
    key: 'showRowNumbers',
    alias: 'rowNumbers',
    title: 'Tọa độ chuẩn Cờ Tướng (1 - 9)',
    desc: 'Hiển thị số lộ dọc từ phải sang trái chuẩn kỳ phổ'
  },
  {
    key: 'tacticalDrawing',
    title: 'Vẽ mũi tên chiến thuật (Chuột phải)',
    desc: 'Kéo chuột phải vẽ mũi tên tính cờ, bấm để đánh dấu ô'
  },
  {
    key: 'openingBook',
    title: 'Nhận diện Khai Cuộc (Opening Book)',
    desc: 'Tự động phát hiện Bình Phong Mã, Thuận Pháo, Tiên Nhân Chỉ Lộ...'
  },
  {
    key: 'voiceAnnouncer',
    title: 'Thuyết minh giọng nói Cờ Tướng',
    desc: 'Đọc truyền cảm nước đi, ăn quân và chiếu tướng'
  }
];

function FeatureRow({ item, checked, onToggle }) {
  return (
    <Label
      htmlFor={`ziga-opt-${item.key}`}
      className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border bg-muted/20 p-3 font-normal transition-colors hover:bg-accent/50"
    >
      <div className="flex flex-col gap-0.5 pr-2">
        <span className="text-xs font-medium text-foreground">
          {item.title}
        </span>
        <span className="text-xs text-muted-foreground">
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

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {/* Column 1: Combat & Tactical */}
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Swords className="size-4 text-primary" />
            <span>Hỗ Trợ Nước Đi & Tác Chiến</span>
          </CardTitle>
          <CardDescription>
            Các tính năng phân tích thế trận và cảnh báo trên bàn cờ
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {COMBAT_FEATURES.map((item) => (
            <FeatureRow
              key={item.key}
              item={item}
              checked={getChecked(item)}
              onToggle={handleToggle}
            />
          ))}
        </CardContent>
      </Card>

      {/* Column 2: Stats & Display */}
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-4 text-primary" />
            <span>Thống Kê, Hiển Thị & Cờ Úp</span>
          </CardTitle>
          <CardDescription>
            Thống kê quân mất, xác suất Cờ Úp và biên bản ván đấu
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {STATS_FEATURES.map((item) => (
            <FeatureRow
              key={item.key}
              item={item}
              checked={getChecked(item)}
              onToggle={handleToggle}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
