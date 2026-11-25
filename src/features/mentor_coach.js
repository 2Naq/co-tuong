// src/features/mentor_coach.js - AI Xiangqi Mentor / Master-Level Tactical Coach & Multi-Variation Mindset Advisor
import React, { useState, useEffect, useMemo, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "../components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";
import {
  GraduationCap,
  BrainCircuit,
  Lightbulb,
  AlertTriangle,
  ShieldAlert,
  X,
  Maximize2,
  Minimize2,
  LayoutGrid,
  Play,
  Crosshair,
  Sparkles,
  Shield,
  Zap,
  Swords,
  Trophy,
  Compass,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Equal,
  Cpu,
  Fish,
  Flame,
} from "lucide-react";
import {
  PIECE_DEFS,
  resolvePieceType,
  DEFAULT_INITIAL_PIECE_TYPES,
} from "../core/constants";
import { cn } from "../lib/utils";
import { createXiangqiWorker } from "./xiangqi_engine";
import {
  getEngineProvider,
  setEngineProvider,
  listEngineProviders,
  reconnectPikafish,
  getEngineTransportStatus,
} from "./engine_provider";

(function (ZigaMod) {
  "use strict";

  console.log(
    "[AN Mod] Master AI Mentor Coach initializing with Background Web Worker Engine...",
  );

  let activeProviderId = "pikafish";
  let activeProvider = getEngineProvider(activeProviderId);
  const asyncWorker = activeProvider;
  const engine = activeProvider.engine || createXiangqiWorker().engine;

  // Theory categories for Grandmaster Knowledge Base
  const THEORY_CATEGORIES = [
    "Tất Cả",
    "Khai Cuộc",
    "Trung Cuộc",
    "Tàn Cuộc",
    "Sát Cục",
    "Binh Pháp",
  ];

  // Comprehensive Database of Xiangqi Grandmaster Maxims & Binh Thư Tượng Kỳ
  const XIANGQI_MAXIMS = [
    // --- KHAI CUỘC (OPENING) ---
    {
      id: "kc_xuat_xe",
      category: "Khai Cuộc",
      rule: "Xuất Xe chậm một nước, mất quyền chủ động mười chiêu",
      desc: "Đầu ván tối kỵ chậm xuất Xe. Nhanh chóng đưa Xe ra lộ thông 2, 4, 6, 8 để kiểm soát các trục huyết mạch chiếm thế thượng phong.",
      triggerId: "kc_xuat_xe",
    },
    {
      id: "kc_phao_dau",
      category: "Khai Cuộc",
      rule: "Pháo đầu uy chấn trung quân, tỏa định trục lộ",
      desc: "Pháo chiếm trung tâm khống chế cột 5, kẹp chặt Tướng Sĩ đối phương, tạo bệ phóng dũng mãnh cho các đợt công kích tiếp theo.",
      triggerId: "kc_phao_dau",
    },
    {
      id: "kc_lien_hoan",
      category: "Khai Cuộc",
      rule: "Song Mã liên hoàn, vững như bàn thạch",
      desc: "Hai Mã đan chéo giữ nhau ở trung lộ bảo vệ Tốt đầu, triệt tiêu đòn đột kích của địch và mở rộng tầm kiểm soát bàn cờ.",
      triggerId: "kc_song_ma",
    },
    {
      id: "kc_bat_dich",
      category: "Khai Cuộc",
      rule: "Khai cuộc bất dịch liên hành, quý tại thông suốt",
      desc: "Tránh đi một quân nhiều lần khi các quân chủ lực Xe Mã Pháo khác chưa kịp xuất trận; phát triển lực lượng đồng đều và hài hòa.",
      triggerId: "kc_can_bang",
    },
    {
      id: "kc_tuan_ha",
      category: "Khai Cuộc",
      rule: "Tuần hà phong tỏa, quá hà đoạt tiên",
      desc: "Xe Pháo chiếm tuyến bờ sông (tuần hà) khống chế đường tiến thoái của Tốt và Mã đối phương; kịp thời quá hà đè bẹp cánh yếu của địch.",
      triggerId: "kc_tuan_ha",
    },
    {
      id: "kc_trung_lo",
      category: "Khai Cuộc",
      rule: "Kiên cố trung lộ, dĩ dật đãi lao",
      desc: "Củng cố tuyến giữa bằng Sĩ Tượng và Mã liên hoàn, tạo bệ phóng vững chắc trước khi mở đợt tổng tấn công hai sườn.",
      triggerId: "kc_trung_lo",
    },

    // --- TRUNG CUỘC (MIDDLEGAME) ---
    {
      id: "tc_khuyet_si",
      category: "Trung Cuộc",
      rule: "Khuyết Sĩ kỵ Song Xe, nách rách Tướng kinh",
      desc: "Mất Sĩ hở sườn dễ bị Xe kẹp nách hoặc Song Xe giáp công; bên công hãy dồn toàn lực khoét sâu vào điểm yếu lộ 4 hoặc 6!",
      triggerId: "tc_khuyet_si",
    },
    {
      id: "tc_khuyet_tuong",
      category: "Trung Cuộc",
      rule: "Khuyết Tượng sợ Pháo, đáy cung hở ngòi",
      desc: "Mất Tượng phòng thủ tầm xa rách toác, tạo ngòi nổ cho Pháo bắn thẳng vào cung Tướng; bên công khai thác điểm mù đáy cung để dứt điểm.",
      triggerId: "tc_khuyet_tuong",
    },
    {
      id: "tc_phao_trong",
      category: "Trung Cuộc",
      rule: "Pháo trống vô giá, uy chấn trung quân",
      desc: "Pháo trống đối diện Tướng không có quân cản sở hữu sức công phá vô song; đối phương tê liệt hoàn toàn, hãy kết hợp Xe Mã sát cục tức thì!",
      triggerId: "tc_phao_trong",
    },
    {
      id: "tc_tot_nhap_cung",
      category: "Trung Cuộc",
      rule: "Nhất Tốt nhập cung, vạn quân kinh hãi",
      desc: "Tốt lọt vào cung Tướng đối phương uy lực ngang nửa con Xe, khóa chặt chân Tướng và mở toang cánh cửa cho các đòn sát cục.",
      triggerId: "tc_tot_nhap_cung",
    },
    {
      id: "tc_ma_oa_tam",
      category: "Trung Cuộc",
      rule: "Mã nhập oa tâm, bất tử dã hôn",
      desc: "Mã nhảy vào tâm cung tự làm tắc đường Tướng thoái lui; dồn hỏa lực vào trung lộ hoặc chiếu góc ép Tướng vào thế tuyệt sát.",
      triggerId: "tc_ma_oa_tam",
    },
    {
      id: "tc_ma_dien",
      category: "Trung Cuộc",
      rule: "Mã điền ắt bại, cản chân gãy cánh",
      desc: "Tránh để Mã bị cản chân; đồng thời chủ động gài quân cản mắt Mã đối phương để vô hiệu hóa một mũi tấn công chủ lực của địch.",
      triggerId: "tc_ma_dien",
    },
    {
      id: "tc_song_xe",
      category: "Trung Cuộc",
      rule: "Song Xe hợp bích, khai thông lộ hiểm",
      desc: "Hai Xe liên kết cùng một trục hoặc kiểm soát hai cánh thông thoáng, dễ dàng thọc sâu xuống đáy cung hoặc kẹp nách ép chết Tướng địch.",
      triggerId: "tc_song_xe",
    },
    {
      id: "tc_thi_quan",
      category: "Trung Cuộc",
      rule: "Thí quân đoạt tiên, bỏ nhỏ ăn lớn",
      desc: "Sẵn sàng hy sinh một quân nhỏ hoặc hoán đổi quân để phá vỡ thế phòng ngự vững chắc của địch, đoạt quyền chủ động chiến lược sát ván.",
      triggerId: "tc_thi_quan",
    },
    {
      id: "tc_kiem_toa",
      category: "Trung Cuộc",
      rule: "Ghim quân tỏa trận, triệt tiêu sinh lực",
      desc: "Dùng Xe Pháo ghìm chặt Xe Mã đối phương ở một cánh, biến quân địch thành vật cản vô dụng rồi rảnh tay tấn công cánh còn lại.",
      triggerId: "tc_kiem_toa",
    },
    {
      id: "tc_uu_the",
      category: "Trung Cuộc",
      rule: "Thừa thắng truy kích, công thành đoạt trại",
      desc: "Thế cờ đang áp đảo hoàn toàn, hãy dồn dập ra đòn không cho đối phương kịp chỉnh đốn Sĩ Tượng hay thở phào phản kháng.",
      triggerId: "tc_uu_the",
    },
    {
      id: "tc_nghich_canh",
      category: "Trung Cuộc",
      rule: "Nghịch cảnh kiên thủ, chờ cơ hồi mã thương",
      desc: "Thế cờ gặp khó khăn cần chấn chỉnh Sĩ Tượng kiên cố, thu gọn phòng tuyến tránh giao chiến nóng vội, chờ đối phương sơ hở phản đòn.",
      triggerId: "tc_nghich_canh",
    },
    {
      id: "tc_xe_phao_ma",
      category: "Trung Cuộc",
      rule: "Xe mười, Pháo bảy, Mã ba",
      desc: "Xe cơ động công phá mạnh nhất; Pháo khống chế tầm xa; Mã biến hóa uyển chuyển khi cờ thoáng. Phối hợp nhịp nhàng các binh chủng.",
      triggerId: "tc_xe_phao_ma",
    },

    // --- TÀN CUỘC (ENDGAME) ---
    {
      id: "tan_phao_hoan_ma",
      category: "Tàn Cuộc",
      rule: "Cờ tàn Pháo hoàn, Mã nhảy xung thiên",
      desc: "Cờ tàn thưa quân Pháo khó mượn ngòi; Mã có khoảng không rộng lớn tự do tung hoành, góc nhảy hiểm hóc quyết định thắng bại.",
      triggerId: "tan_phao_hoan_ma",
    },
    {
      id: "tan_tot_cao",
      category: "Tàn Cuộc",
      rule: "Tốt cao có giá, Tốt lụt vô công",
      desc: "Tốt chưa chạm đáy cung còn cơ động ép Tướng từ lộ sườn; tránh đẩy Tốt lụt xuống đáy sớm làm mất đi khả năng khống chế cửu cung.",
      triggerId: "tan_tot_cao",
    },
    {
      id: "tan_don_xe_phao_tuong",
      category: "Tàn Cuộc",
      rule: "Đơn Xe thắng Đơn Pháo Tượng, hòa Pháo Song Tượng",
      desc: "Đơn Xe gặp Pháo Tượng bền thì hòa; nhưng gặp khuyết Tượng hoặc Pháo mất điểm tựa thì Xe phối hợp mặt Tướng bức tử.",
      triggerId: "tan_don_xe",
    },
    {
      id: "tan_don_ma_si",
      category: "Tàn Cuộc",
      rule: "Đơn Mã khó thắng Đơn Sĩ, Mã Tốt phá Sĩ Tượng",
      desc: "Một Mã đơn độc không thể kết liễu Đơn Sĩ bền; cần có thêm Tốt trợ chiến để triệt hạ phòng thủ và khóa chặt đường chạy của Tướng.",
      triggerId: "tan_don_ma",
    },
    {
      id: "tan_tuong_tro_chien",
      category: "Tàn Cuộc",
      rule: "Cờ tàn Tướng xuất cung, uy lực như dũng tướng",
      desc: "Giai đoạn tàn cuộc ít quân tấn công, hãy đưa Tướng lên cao chiếm lộ trung tâm hoặc sườn, dùng mặt Tướng làm ngòi nổ hỗ trợ dứt điểm.",
      triggerId: "tan_tuong_tro_chien",
    },

    // --- SÁT CỤC (MATING MOTIFS & TACTICAL FINISHES) ---
    {
      id: "sat_thiet_mon",
      category: "Sát Cục",
      rule: "Thiết Môn Thuyên (Cửa sắt khóa Tướng)",
      desc: "Pháo ghim chặt trung lộ, Xe cắm đáy giáng đòn tuyệt sát Thiết Môn Thuyên bất khả hóa giải!",
      triggerId: "sat_thiet_mon",
    },
    {
      id: "sat_trac_dien_ho",
      category: "Sát Cục",
      rule: "Trắc Diện Hổ (Hổ vồ bên sườn)",
      desc: "Mã chiếm góc ngọa tào phối hợp cùng Xe sườn, khóa chặt cửu cung giáng đòn sát cục sấm sét bên sườn!",
      triggerId: "sat_trac_dien_ho",
    },
    {
      id: "sat_ma_hau_phao",
      category: "Sát Cục",
      rule: "Mã Hậu Pháo (Pháo điểm hỏa sau lưng Mã)",
      desc: "Mã khóa cửa cung cản đường Tướng, Pháo phía sau mượn Mã làm ngòi nổ phát hỏa tuyệt sát!",
      triggerId: "sat_ma_hau_phao",
    },
    {
      id: "sat_dieu_ngu",
      category: "Sát Cục",
      rule: "Điếu Ngư Mã (Mã câu cá khóa cửu cung)",
      desc: "Mã chiếm vị trí điếu ngư lộ 3 hoặc 7, phối hợp Xe thọc sườn siết chặt thòng lọng kết liễu trận đấu.",
      triggerId: "sat_dieu_ngu",
    },
    {
      id: "sat_trung_phao",
      category: "Sát Cục",
      rule: "Song Pháo Trùng (Hai Pháo chồng nhau một lộ)",
      desc: "Hai Pháo liên hoàn trên cùng một trục dọc nhắm thẳng mặt Tướng địch, đòn đánh uy lực nhất trong Tượng kỳ.",
      triggerId: "sat_trung_phao",
    },
    {
      id: "sat_hai_day",
      category: "Sát Cục",
      rule: "Hải Đáy Lao Nguyệt (Đáy biển mò trăng)",
      desc: "Xe luồn xuống tuyến đáy sau lưng Tướng địch, mượn mặt Tướng làm điểm tựa chiếu bí khi đối phương co cụm.",
      triggerId: "sat_hai_day",
    },
    {
      id: "sat_bach_kiem",
      category: "Sát Cục",
      rule: "Bạch Kiểm Tướng (Mặt Tướng đối diện trực tiếp)",
      desc: "Khai thác triệt để luật mặt Tướng không thể nhìn nhau để hỗ trợ Xe Pháo khóa cứng và kết liễu đối thủ.",
      triggerId: "sat_bach_kiem",
    },

    // --- BINH PHÁP (STRATEGIC WISDOM) ---
    {
      id: "bp_tri_bi_tri_ky",
      category: "Binh Pháp",
      rule: "Tri bỉ tri kỷ, bách chiến bất đãi",
      desc: "Biết người biết ta, trăm trận không nguy. Nắm rõ sở trường sở đoản của đối phương và phân tích thấu đáo thế trận trước khi ra đòn.",
      triggerId: "bp_tri_bi",
    },
    {
      id: "bp_tien_ha_thu",
      category: "Binh Pháp",
      rule: "Tiên hạ thủ vi cường, hậu hạ thủ tao ương",
      desc: "Ra tay trước chiếm thế thượng phong, ra tay chậm chuốc lấy hiểm nguy. Trong cờ tướng, nước Tiên có giá trị vô giá.",
      triggerId: "bp_tien_ha_thu",
    },
    {
      id: "bp_cong_tam",
      category: "Binh Pháp",
      rule: "Công tâm vi thượng, công thành vi hạ",
      desc: "Đánh vào tâm lý khiến đối phương rối loạn, nôn nóng đi sai còn hơn là chỉ chăm chăm ăn quân nhỏ mà bỏ lỡ thế sát ván.",
      triggerId: "bp_cong_tam",
    },
  ];

  /**
   * Grandmaster Xiangqi Opening Formation Recognizer
   * Evaluates piece placement to identify standard Xiangqi opening systems & battleplans.
   */
  function detectXiangqiOpening(pieces, myColor) {
    if (!pieces || pieces.length < 22) return null;

    const redCannons = pieces.filter((p) => p.color === 0 && p.type === 4);
    const blackCannons = pieces.filter((p) => p.color === 1 && p.type === 4);
    const redKnights = pieces.filter((p) => p.color === 0 && p.type === 5);
    const blackKnights = pieces.filter((p) => p.color === 1 && p.type === 5);
    const redBishops = pieces.filter((p) => p.color === 0 && p.type === 2);
    const blackBishops = pieces.filter((p) => p.color === 1 && p.type === 2);
    const redPawns = pieces.filter((p) => p.color === 0 && p.type === 6);
    const blackPawns = pieces.filter((p) => p.color === 1 && p.type === 6);

    const hasRedCentralCannon = redCannons.some(
      (p) => p.col === 4 && (p.row === 2 || p.row === 1 || p.row === 0),
    );
    const hasBlackCentralCannon = blackCannons.some(
      (p) => p.col === 4 && (p.row === 7 || p.row === 8 || p.row === 9),
    );

    // 1. TRUNG PHÁO (RED CENTRAL CANNON)
    if (hasRedCentralCannon) {
      if (hasBlackCentralCannon) {
        const redMovedFromLeft = !redCannons.some(
          (p) => p.col === 1 && p.row === 2,
        );
        const blackMovedFromLeft = !blackCannons.some(
          (p) => p.col === 1 && p.row === 7,
        );

        if (
          (redMovedFromLeft && blackMovedFromLeft) ||
          (!redMovedFromLeft && !blackMovedFromLeft)
        ) {
          return {
            name: "Thuận Thủ Pháo (Thuận Pháo)",
            category: "Cương Liệt Đối Công",
            battleplan:
              "Hai bên cùng cắm Pháo đầu đối công rực lửa! Xuất Xe tốc độ khống chế lộ thông 2, 4, 6, 8, chớ vội ăn Tốt đầu để mất tiên.",
            counterAdvice:
              "Tập trung ra Xe nhanh, dùng Mã bảo vệ Tốt đầu, chờ cơ hội Xe tuần hà kẹp nách.",
          };
        } else {
          return {
            name: "Nghịch Thủ Pháo (Nghịch Pháo)",
            category: "Quyết Chiến Tương Tàn",
            battleplan:
              "Thế trận đối công bất đối xứng cực kỳ khốc liệt! Bên nào ghìm được Xe Mã đối thủ trước sẽ chiếm thế thượng phong tuyệt đối.",
            counterAdvice:
              "Chủ động cản chân Mã đối phương, xuất Xe áp sát bờ sông phong tỏa hỏa lực Pháo.",
          };
        }
      }

      // Check Black's Bình Phong Mã
      const blackBPM = blackKnights.filter(
        (p) => (p.col === 2 && p.row === 7) || (p.col === 6 && p.row === 7),
      );
      if (
        blackBPM.length >= 2 ||
        (blackBPM.length >= 1 && blackKnights.some((p) => p.row === 7))
      ) {
        const hasTienThatBinh = blackPawns.some(
          (p) => p.col === 6 && p.row === 5,
        );
        const hasTienTamBinh = blackPawns.some(
          (p) => p.col === 2 && p.row === 5,
        );

        if (hasTienThatBinh && hasTienTamBinh) {
          return {
            name:
              myColor === 0
                ? "Trung Pháo Đối Bình Phong Mã Lưỡng Đầu Xà"
                : "Bình Phong Mã Lưỡng Đầu Xà Kháng Trung Pháo",
            category: "Chính Quy Cân Não",
            battleplan:
              "Đẩy hai Tốt thông đường cho Song Mã phi qua sông! Cần đưa Xe quá hà ghìm chặt Tốt và chèn ép cánh Mã.",
            counterAdvice:
              "Tấn Xe tuần hà hoặc quá hà kẹp Tốt, không để Song Mã địch thông thoáng phi ra biên.",
          };
        } else if (hasTienThatBinh) {
          return {
            name:
              myColor === 0
                ? "Trung Pháo Đối Bình Phong Mã Tiến Thất Binh"
                : "Bình Phong Mã Tiến Thất Binh Kháng Trung Pháo",
            category: "Đỉnh Cao Kỳ Nghệ",
            battleplan:
              "Thế trận kinh điển bậc nhất Tượng kỳ. Bên công dồn Xe Pháo đè cánh Tốt yếu; bên thủ dùng Mã kiềm chế trung lộ và phản công cánh hở.",
            counterAdvice:
              "Tấn công vào cánh Mã chưa phát triển của đối phương, xuất Xe chiếm lộ 2 hoặc 4 thông thoáng.",
          };
        } else if (hasTienTamBinh) {
          return {
            name:
              myColor === 0
                ? "Trung Pháo Đối Bình Phong Mã Tiến Tam Binh"
                : "Bình Phong Mã Tiến Tam Binh Kháng Trung Pháo",
            category: "Chiến Thuật Sâu Sắc",
            battleplan:
              "Kích hoạt cánh Binh 3 hỗ trợ Mã trái. Hãy linh hoạt dùng Xe quá hà đè Tốt hoặc chuyển Pháo biên tấn công.",
            counterAdvice:
              "Kiểm soát chặt chẽ tuyến hà, ngăn chặn đối phương dùng Mã đạp Binh qua sông.",
          };
        }
        return {
          name:
            myColor === 0
              ? "Trung Pháo Đối Bình Phong Mã"
              : "Bình Phong Mã Kháng Trung Pháo",
          category: "Kinh Điển Vững Vàng",
          battleplan:
            "Thế trận mẫu mực giữa công phá dũng mãnh và phòng thủ phản công kiên cố. Cần phát triển đồng đều Xe Mã Pháo.",
          counterAdvice:
            "Xuất Xe chiếm giữ lộ then chốt, tránh để Pháo đầu bị cô lập thiếu viện binh.",
        };
      }

      // Check Phản Cung Mã (Giáp Pháo)
      const hasPhanCungCannon = blackCannons.some(
        (p) => (p.col === 3 || p.col === 5) && p.row === 7,
      );
      if (hasPhanCungCannon) {
        return {
          name:
            myColor === 0
              ? "Trung Pháo Đối Phản Cung Mã (Giáp Pháo)"
              : "Phản Cung Mã Kháng Trung Pháo",
          category: "Biến Ảo Phản Kích",
          battleplan:
            "Giáp Pháo vào nách Mã tạo thế phòng ngự tầng tầng lớp lớp. Hãy tập trung đánh thẳng trung lộ hoặc đè gãy cánh Mã biên.",
          counterAdvice:
            "Khai thông lộ Xe, khai thác điểm yếu ở góc sĩ tượng khi địch co cụm giáp pháo.",
        };
      }

      // Check Đơn Đề Mã
      const hasCenterKnight = blackKnights.some(
        (p) => (p.col === 2 || p.col === 6) && p.row === 7,
      );
      const hasEdgeKnight = blackKnights.some(
        (p) => (p.col === 0 || p.col === 8) && (p.row === 7 || p.row === 8),
      );
      if (hasCenterKnight && hasEdgeKnight) {
        return {
          name:
            myColor === 0
              ? "Trung Pháo Đối Đơn Đề Mã"
              : "Đơn Đề Mã Kháng Trung Pháo",
          category: "Công Thủ Phân Liệt",
          battleplan:
            "Chia Mã một biên một trung, cánh biên linh hoạt nhưng trung lộ mỏng manh. Dồn lực công phá trung lộ và cánh đơn độc.",
          counterAdvice:
            "Tập trung hỏa lực vào cánh trung lộ của địch nơi chỉ có một Mã bảo vệ Tốt đầu.",
        };
      }

      // Check Phi Tượng
      const hasBlackCenterElephant = blackBishops.some(
        (p) => p.col === 4 && p.row === 7,
      );
      if (hasBlackCenterElephant) {
        return {
          name:
            myColor === 0
              ? "Trung Pháo Đối Phi Tượng Cuộc"
              : "Phi Tượng Cuộc Kháng Trung Pháo",
          category: "Tĩnh Chế Động",
          battleplan:
            "Dựng Tượng trung tâm gia cố phòng ngự triệt tiêu hỏa lực Pháo đầu. Hãy dạt Pháo sang cánh yếu hoặc tiến Xe tuần hà ép giao chiến.",
          counterAdvice:
            "Chuyển hướng tấn công sang hai sườn lộ 4-6, tránh đâm đầu vào pháo đài trung lộ.",
        };
      }

      // Check Quy Bối Pháo
      const hasQuyBoi = blackCannons.some((p) => p.row >= 8);
      if (hasQuyBoi) {
        return {
          name: "Trung Pháo Đối Quy Bối Pháo",
          category: "Kỳ Chiêu Bí Truyền",
          battleplan:
            "Thoái Pháo giấu sau lưng Sĩ Tượng nhằm phục kích phản kích bất ngờ. Cần tiến quân chậm chắc, giữ vững hàng tuyến.",
          counterAdvice:
            "Kiểm soát chặt các lộ sườn, cảnh giác đòn đâm Pháo đáy phản chiếu của địch.",
        };
      }

      return {
        name: "Trung Pháo Khai Cuộc (Đương Đầu Pháo)",
        category: "Cương Mãnh Tấn Công",
        battleplan:
          "Pháo đầu khống chế thẳng tim Tướng địch. Mau chóng xuất Xe khai thông trục lộ, phi Mã trợ chiến trung lộ.",
        counterAdvice:
          "Bảo vệ vững chắc Tốt đầu, không để đối phương dễ dàng thọc Pháo chém Tốt.",
      };
    }

    // 2. BLACK HAS CENTRAL CANNON
    if (hasBlackCentralCannon) {
      const redBPM = redKnights.filter(
        (p) => (p.col === 2 && p.row === 2) || (p.col === 6 && p.row === 2),
      );
      if (redBPM.length >= 2) {
        return {
          name:
            myColor === 1
              ? "Trung Pháo Đối Bình Phong Mã"
              : "Bình Phong Mã Kháng Trung Pháo",
          category: "Kiên Cố Phòng Phản",
          battleplan:
            "Song Mã giữ vững Tốt đầu như bức trường thành. Chờ Xe Pháo đối phương sơ hở để hoành xa quá hà phản kích.",
          counterAdvice:
            "Giữ vững liên kết Song Mã, sẵn sàng đẩy Tốt 3 hoặc Tốt 7 khai thông mắt Mã.",
        };
      }
      return {
        name:
          myColor === 1
            ? "Đương Đầu Pháo Khai Cuộc"
            : "Hậu Thủ Đối Đương Đầu Pháo",
        category: "Phòng Ngự Phản Kích",
        battleplan:
          "Đối phương chiếm trung lộ trước. Cần củng cố Sĩ Tượng và xuất Xe tốc độ để kiềm tỏa thế công của địch.",
        counterAdvice:
          "Ưu tiên gia cố tuyến giữa, tránh để Pháo trống trung lộ uy hiếp Tướng.",
      };
    }

    // 3. TIÊN NHÂN CHỈ LỘ (PUSH PAWN 3 OR 7)
    const hasRedAdvancedPawn = redPawns.some(
      (p) => (p.col === 2 || p.col === 6) && p.row === 4,
    );
    if (hasRedAdvancedPawn && !hasRedCentralCannon) {
      const hasBlackSymmetricPawn = blackPawns.some(
        (p) => (p.col === 2 || p.col === 6) && p.row === 5,
      );
      if (hasBlackSymmetricPawn) {
        return {
          name: "Đối Binh Cuộc (Song Binh Tương Kiến)",
          category: "Cân Bằng Thâm Sâu",
          battleplan:
            "Hai bên cùng tiến Binh tranh đoạt điểm tựa chiến lược. Trận đấu đòi hỏi tính toán trung cuộc cực kỳ sâu sắc.",
          counterAdvice:
            "Nhanh chóng xuất Xe chiếm lộ 2-8 và phát triển Mã theo hướng thông thoáng.",
        };
      }
      return {
        name: "Tiên Nhân Chỉ Lộ Cuộc (Binh Pháp Thăm Dò)",
        category: "Uyển Chuyển Cơ Động",
        battleplan:
          "Tiến Binh mở đường cho Mã, vừa dò xét phản ứng của địch vừa giữ kín ý đồ chiến lược. Biến hóa vô cùng linh hoạt.",
        counterAdvice:
          "Tùy theo nước đi tiếp theo của đối phương mà chuyển hóa thành Trung Pháo, Phi Tượng hoặc Quá Cung Pháo.",
      };
    }

    // 4. PHI TƯỢNG CUỘC
    const hasRedCenterElephant = redBishops.some(
      (p) => p.col === 4 && p.row === 2,
    );
    if (hasRedCenterElephant && !hasRedCentralCannon) {
      return {
        name: "Phi Tượng Cuộc (Phòng Ngự Phản Kích)",
        category: "Kiên Cố Vững Vàng",
        battleplan:
          "Củng cố phòng tuyến vững như bàn thạch, hạn chế tối đa rủi ro, chờ đối phương nóng vội lộ sơ hở.",
        counterAdvice:
          "Phát triển Song Mã và Xe thông thoáng, kiểm soát chặt chẽ tuyến hà.",
      };
    }

    // 5. KHỞI MÃ CUỘC
    const hasRedActiveKnights = redKnights.some(
      (p) => (p.col === 2 || p.col === 6) && p.row === 2,
    );
    const redCannonsUntouched = redCannons.every(
      (p) => p.row === 2 && (p.col === 1 || p.col === 7),
    );
    if (hasRedActiveKnights && redCannonsUntouched) {
      return {
        name: "Khởi Mã Cuộc (Chính Mã Khai Trận)",
        category: "Ổn Định Uyển Chuyển",
        battleplan:
          "Phát triển Mã chính quy chiếm cứ vị trí chiến lược, bảo vệ Tốt đầu và sẵn sàng thích ứng với mọi thế trận.",
        counterAdvice:
          "Đẩy Binh 3 hoặc 7 thông đường cho Mã nhảy tiếp, giữ Pháo linh hoạt ứng biến.",
      };
    }

    // 6. QUÁ CUNG PHÁO
    const hasRedQuaCung = redCannons.some(
      (p) => (p.col === 3 || p.col === 5) && p.row === 2,
    );
    if (hasRedQuaCung) {
      return {
        name: "Quá Cung Pháo (Chuyển Cánh Tập Kích)",
        category: "Kỳ Ảo Bất Ngờ",
        battleplan:
          "Điều Pháo qua cung tập trung hỏa lực vào một cánh đối phương, chuẩn bị xuất Xe hoành xa phối hợp đè bẹp cánh yếu.",
        counterAdvice:
          "Nhanh chóng củng cố cánh bị uy hiếp, khai thác khoảng trống ở cánh Pháo vừa dời đi.",
      };
    }

    // 7. SĨ GIÁC PHÁO
    const hasRedSiGiac = redCannons.some(
      (p) => (p.col === 3 || p.col === 5) && (p.row === 0 || p.row === 1),
    );
    if (hasRedSiGiac) {
      return {
        name: "Sĩ Giác Pháo (Pháo Nách Sĩ)",
        category: "Phòng Thủ Phục Kích",
        battleplan:
          "Đặt Pháo tại nách Sĩ vừa hỗ trợ phòng thủ cung Tướng vừa nhắm vào hàng Tốt đối phương từ cự ly an toàn.",
        counterAdvice:
          "Xuất Xe nhanh chiếm lộ thông, phát triển Mã lên trung tâm kiềm tỏa tầm bắn của Pháo nách.",
      };
    }

    // 8. KIM CÂU PHÁO
    const redCannonsSameFlank =
      redCannons.filter((p) => p.col <= 3).length === 2 ||
      redCannons.filter((p) => p.col >= 5).length === 2;
    if (redCannonsSameFlank) {
      return {
        name: "Kim Câu Pháo (Lưỡng Pháo Đồng Cánh)",
        category: "Hiểm Độc Bất Ngờ",
        battleplan:
          "Dồn hai Pháo về cùng một cánh tạo hỏa lực tầm xa dồn dập, kéo giãn đội hình phòng thủ của đối phương.",
        counterAdvice:
          "Chuyển Xe sang cánh bị tấn công tiếp ứng, đồng thời phản kích mạnh vào cánh trống trải của đối thủ.",
      };
    }

    return {
      name: "Khai Cuộc Tiêu Chuẩn",
      category: "Chính Quy Căn Bản",
      battleplan:
        "Triển khai đồng đều các binh chủng Xe, Mã, Pháo. Ưu tiên xuất Xe nhanh, kiểm soát lộ thông và bờ sông.",
      counterAdvice:
        "Tập trung khai thông các trục lộ chính, giữ cự ly đội hình cân bằng giữa công và thủ.",
    };
  }

  /**
   * Dynamic Grandmaster Maxim Selector
   * Evaluates the active board state, opponent weaknesses, king safety, and phase to select
   * the single most pertinent grandmaster maxim and tactical counsel in real-time.
   */
  function selectIntelligentMaxim(
    pieces,
    myColor,
    oppColor,
    phase,
    evalScore,
    inCheck,
    discThreat,
    plans,
    mateThreat,
  ) {
    if (!pieces || pieces.length === 0) {
      return XIANGQI_MAXIMS[0];
    }

    // 1. King in crisis / Sát Cục
    if (inCheck) {
      return {
        rule: "Tướng nguy bách bộ, tị kỳ phong mang",
        desc: "Tướng đang bị chiếu bức! Tính mạng chủ tướng là trên hết, ưu tiên dời Tướng hoặc điều quân che chở hóa giải trước.",
        category: "Sát Cục",
        triggerReason: "Tướng ta đang bị chiếu",
        badge: "Cấp Cứu Cung Tướng",
      };
    }

    if (discThreat) {
      return {
        rule: "Đề phòng ám tiễn, phá thế chiếu rút",
        desc: "Đối thủ đang giăng đòn chiếu rút/chiếu mở cực kỳ nguy hiểm! Lập tức dời Tướng hoặc phong tỏa ngòi chiếu.",
        category: "Sát Cục",
        triggerReason: "Nguy cơ đòn chiếu rút của địch",
        badge: "Hóa Giải Ám Tiễn",
      };
    }

    if (mateThreat && mateThreat.type === "attack") {
      return {
        rule: "Nhất cổ tác khí, dũng tướng đoạt thành",
        desc: "Trận thế sát cục đã lộ diện! Giữ vững sự tập trung, giáng đòn chính xác dứt điểm không cho đối phương cơ hội trở mình.",
        category: "Sát Cục",
        triggerReason: "Đang nắm giữ thế sát",
        badge: "Tuyệt Kỹ Sát Cục",
      };
    }

    // 2. Structural Deficiencies of Opponent
    const oppAdvisors = pieces.filter(
      (p) => p.color === oppColor && p.type === 1,
    ).length;
    const oppBishops = pieces.filter(
      (p) => p.color === oppColor && p.type === 2,
    ).length;
    const myRooks = pieces.filter(
      (p) => p.color === myColor && p.type === 3,
    ).length;
    const myCannons = pieces.filter(
      (p) => p.color === myColor && p.type === 4,
    ).length;
    const myKnights = pieces.filter(
      (p) => p.color === myColor && p.type === 5,
    ).length;

    if (oppAdvisors < 2 && myRooks >= 1) {
      return {
        rule: "Khuyết Sĩ kỵ Song Xe, nách rách Tướng kinh",
        desc: `Địch chỉ còn ${oppAdvisors} Sĩ che chở, hai sườn lộ 4-6 hở toác! Hãy dồn Xe Mã khoét sâu vào sườn yếu để tạo thế kẹp cổ.`,
        category: "Trung Cuộc",
        triggerReason: `Địch khuyết ${2 - oppAdvisors} Sĩ`,
        badge: "Khoét Sườn Tướng",
      };
    }

    if (oppBishops < 2 && myCannons >= 1) {
      return {
        rule: "Khuyết Tượng sợ Pháo, đáy cung hở ngòi",
        desc: `Địch chỉ còn ${oppBishops} Tượng phòng thủ tầm xa! Hãy dùng Pháo mượn ngòi đáy cung bắn thẳng vào trung quân địch.`,
        category: "Trung Cuộc",
        triggerReason: `Địch khuyết ${2 - oppBishops} Tượng`,
        badge: "Khai Thác Điểm Mù",
      };
    }

    // Check Oa tâm mã (Knight trapped at palace center)
    const oppPalaceCenterRow = oppColor === 0 ? 1 : 8;
    const oppTrappedKnight = pieces.find(
      (p) =>
        p.color === oppColor &&
        p.type === 5 &&
        p.col === 4 &&
        p.row === oppPalaceCenterRow,
    );
    if (oppTrappedKnight) {
      return {
        rule: "Mã nhập oa tâm, bất tử dã hôn",
        desc: "Mã địch nhảy vào tâm cung tự chặn đường chạy của Tướng! Mau chóng dồn hỏa lực vào trung lộ để kết liễu trận đấu.",
        category: "Trung Cuộc",
        triggerReason: "Mã địch tắc tại tâm cung",
        badge: "Tập Kích Oa Tâm",
      };
    }

    // 3. Special Tactical Formations
    // Check Hollow Cannon (Pháo trống)
    const oppKing = pieces.find((p) => p.color === oppColor && p.type === 0);
    if (oppKing) {
      const centralCannons = pieces.filter(
        (p) => p.color === myColor && p.type === 4 && p.col === oppKing.col,
      );
      for (const cannon of centralCannons) {
        const minR = Math.min(cannon.row, oppKing.row);
        const maxR = Math.max(cannon.row, oppKing.row);
        const blockers = pieces.filter(
          (p) => p.col === oppKing.col && p.row > minR && p.row < maxR,
        );
        if (blockers.length === 0) {
          return {
            rule: "Pháo trống vô giá, uy chấn trung quân",
            desc: "Pháo trống đối diện Tướng địch không có quân che chắn! Sức công phá sấm sét, phối hợp Xe Mã dứt điểm trận đấu.",
            category: "Trung Cuộc",
            triggerReason: "Pháo trống đối diện Tướng",
            badge: "Hỏa Lực Sấm Sét",
          };
        }
      }
    }

    // Check Advanced Pawn in enemy palace
    const enemyPalaceRows = myColor === 0 ? [7, 8, 9] : [0, 1, 2];
    const pawnInPalace = pieces.find(
      (p) =>
        p.color === myColor &&
        p.type === 6 &&
        enemyPalaceRows.includes(p.row) &&
        p.col >= 3 &&
        p.col <= 5,
    );
    if (pawnInPalace) {
      return {
        rule: "Nhất Tốt nhập cung, vạn quân kinh hãi",
        desc: "Tốt ta đã thâm nhập sâu vào cửu cung địch! Như một con dao găm kề cổ Tướng, khóa chặt cửu cung hỗ trợ Xe dứt điểm.",
        category: "Trung Cuộc",
        triggerReason: "Tốt ta đã nhập cung",
        badge: "Dao Găm Cận Vệ",
      };
    }

    // 4. Phase-Specific Principles
    if (phase === "Tàn Cuộc") {
      if (myKnights >= 1) {
        return {
          rule: "Cờ tàn Pháo hoàn, Mã nhảy xung thiên",
          desc: "Giai đoạn tàn cuộc đất trống mênh mông, Pháo mất ngòi suy yếu nhưng Mã tự do tung hoành! Hãy dùng góc nhảy hiểm của Mã để áp đảo.",
          category: "Tàn Cuộc",
          triggerReason: "Tàn cuộc phát huy Mã",
          badge: "Tàn Cuộc Mã Thắng",
        };
      }
      return {
        rule: "Tốt cao có giá, Tốt lụt vô công",
        desc: "Giữ Tốt ở hàng trên để khống chế lộ di chuyển của Tướng địch, tránh đẩy Tốt lụt xuống đáy sớm làm mất đi khả năng công phá.",
        category: "Tàn Cuộc",
        triggerReason: "Kỹ thuật tàn cuộc căn bản",
        badge: "Nghệ Thuật Binh Tốt",
      };
    }

    if (phase === "Khai Cuộc") {
      const redRookInit =
        myColor === 0 &&
        pieces.some(
          (p) =>
            p.color === 0 &&
            p.type === 3 &&
            p.row === 0 &&
            (p.col === 0 || p.col === 8),
        );
      const blackRookInit =
        myColor === 1 &&
        pieces.some(
          (p) =>
            p.color === 1 &&
            p.type === 3 &&
            p.row === 9 &&
            (p.col === 0 || p.col === 8),
        );
      if (redRookInit || blackRookInit) {
        return {
          rule: "Xuất Xe chậm một nước, mất quyền chủ động mười chiêu",
          desc: "Khai cuộc tối kỵ chậm xuất Xe! Nhanh chóng đưa Xe ra lộ thông 2, 4, 6, 8 kiểm soát các trục giao chiến huyết mạch.",
          category: "Khai Cuộc",
          triggerReason: "Xe chưa xuất quân",
          badge: "Tốc Độ Xuất Xe",
        };
      }
      return {
        rule: "Pháo đầu uy chấn trung quân, tỏa định trục lộ",
        desc: "Khống chế trung tâm tạo thế gọng kìm, vừa bảo vệ Tốt đầu vừa mở toang đường tiến cho Song Mã và Xe nhập cuộc.",
        category: "Khai Cuộc",
        triggerReason: "Phát triển quân khai cuộc",
        badge: "Quy Củ Trận Pháp",
      };
    }

    // 5. Score / Morale evaluations
    if (evalScore >= 350) {
      return {
        rule: "Thừa thắng truy kích, công thành đoạt trại",
        desc: "Thế trận đang áp đảo toàn diện (+3.5đ)! Siết chặt vòng vây, dồn ép đối thủ vào thế bế tắc không cho cơ hội trở mình.",
        category: "Trung Cuộc",
        triggerReason: "Ưu thế áp đảo",
        badge: "Tổng Lực Áp Đảo",
      };
    }

    if (evalScore <= -350) {
      return {
        rule: "Nghịch cảnh kiên thủ, chờ cơ hồi mã thương",
        desc: "Thế cờ đang bất lợi! Cần chỉnh đốn Sĩ Tượng kiên cố, tuyệt đối không nóng vội xua quân liều mạng, chờ địch sơ hở phản đòn.",
        category: "Trung Cuộc",
        triggerReason: "Thế cờ nghịch cảnh",
        badge: "Kiên Cố Chờ Thời",
      };
    }

    // Default
    return {
      rule: "Xe mười, Pháo bảy, Mã ba",
      desc: "Xe cơ động công phá mạnh nhất; Pháo khống chế tầm xa; Mã biến hóa uyển chuyển khi cờ thoáng. Phối hợp nhịp nhàng các binh chủng.",
      category: "Trung Cuộc",
      triggerReason: "Phối hợp binh chủng",
      badge: "Binh Thư Tượng Kỳ",
    };
  }

  let mentorPanelEl = null;
  let cachedAnalysis = null;
  let lastAnalysisHash = "";
  let mentorSetter = null;
  let cancelWorkerSearch = null;
  let analyzeDebounceTimer = null;
  let lastKnownGameData = null;

  // Extract living pieces from gameLayer
  function getBoardState(gameLayer) {
    if (!gameLayer || !gameLayer.V || !Array.isArray(gameLayer.V)) return null;
    const pieces = [];
    for (let i = 0; i < 32; i++) {
      const p = gameLayer.V[i];
      if (!p || p.pa) continue;
      const pieceType = resolvePieceType(p, i);
      const pieceColor = p.ka !== undefined ? p.ka : Math.floor(i / 16);
      const isUnopened = p.ac === 0;
      const def = PIECE_DEFS[pieceType] || {
        name: "Quân",
        value: 1,
        redChar: "兵",
        blackChar: "卒",
        short: "Q",
      };

      pieces.push({
        index: i,
        col: p.fa,
        row: p.rowIndex,
        type: pieceType,
        color: pieceColor,
        name: isUnopened ? "Quân Úp" : def.name,
        char: isUnopened
          ? "Úp"
          : pieceColor === 0
            ? def.redChar
            : def.blackChar,
        short: isUnopened ? "Ú" : def.short,
        ac: p.ac !== undefined ? p.ac : 1,
        unopened: isUnopened,
      });
    }
    return pieces;
  }

  function getBoardStateHash(gameLayer, myColor, oppColor) {
    if (!gameLayer || !gameLayer.V || !Array.isArray(gameLayer.V)) return "";
    const turn = gameLayer.Yc !== undefined ? gameLayer.Yc : "";
    let hash = `${turn}_${myColor}_${oppColor}_`;
    for (let i = 0; i < 32; i++) {
      const p = gameLayer.V[i];
      if (!p || p.pa) continue;
      const ac = p.ac !== undefined ? p.ac : 1;
      const ga = resolvePieceType(p, i);
      hash += `${i}:${p.fa},${p.rowIndex},${ga},${ac};`;
    }
    return hash;
  }

  // Generate authentic standard Vietnamese Xiangqi notation
  function getXiangqiNotation(piece, fromCol, fromRow, toCol, toRow, myColor) {
    const pCol = myColor === 0 ? 9 - fromCol : fromCol + 1;
    const tCol = myColor === 0 ? 9 - toCol : toCol + 1;
    const pChar = piece.short || "Q";

    if (toCol === fromCol) {
      const steps = Math.abs(toRow - fromRow);
      const isAdvancing = myColor === 0 ? toRow > fromRow : toRow < fromRow;
      const action = isAdvancing ? "." : "/";
      const actionWord = isAdvancing ? "tiến" : "thoái";
      return {
        short: `${pChar}${pCol}${action}${steps}`,
        full: `${piece.name} ${pCol} ${actionWord} ${steps}`,
      };
    } else {
      if (toRow === fromRow) {
        return {
          short: `${pChar}${pCol}-${tCol}`,
          full: `${piece.name} ${pCol} bình ${tCol}`,
        };
      } else {
        const isAdvancing = myColor === 0 ? toRow > fromRow : toRow < fromRow;
        const action = isAdvancing ? "." : "/";
        const actionWord = isAdvancing ? "tiến" : "thoái";
        return {
          short: `${pChar}${pCol}${action}${tCol}`,
          full: `${piece.name} ${pCol} ${actionWord} ${tCol}`,
        };
      }
    }
  }

  // Grandmaster tactical description and strategic rationale generator
  function getTacticalDescription(
    piece,
    target,
    notation,
    toCol,
    toRow,
    myColor,
    isCheck,
    isMate,
    lineReplies,
    pieces,
    evalPoints,
  ) {
    const tCol = myColor === 0 ? 9 - toCol : toCol + 1;
    const riverRank = myColor === 0 ? 4 : 5;
    const enemyPawnRank = myColor === 0 ? 6 : 3;
    const enemyBaseline = myColor === 0 ? 9 : 0;
    const isPastRiver = myColor === 0 ? toRow >= 5 : toRow <= 4;

    if (isMate) {
      return {
        tacticName: "Tuyệt Kỹ Sát Cục",
        why: `Nước cờ ${notation.short} tạo lập trận thế sát cục hoàn hảo! Khóa chặt mọi ngả đường thoái lui của Tướng địch.`,
        tag: "Sát Cục",
      };
    }

    if (isCheck) {
      return {
        tacticName: "Chiếu Tướng Ép Co Cụm",
        why: `Chiếu Tướng đanh thép tước đoạt quyền chủ động của địch, buộc Tướng hoặc Sĩ Tượng đối phương phải vá víu bộc lộ sơ hở lớn.`,
        tag: "Chiếu Tướng",
      };
    }

    if (target) {
      return {
        tacticName: `Chém ${target.name} Lộ ${tCol}`,
        why: `Triệt hạ ${target.name} then chốt tại lộ ${tCol}, xóa bỏ quân chốt chặn chiến lược và gia tăng cách biệt ưu thế lực lượng (+${evalPoints}đ).`,
        tag: "Đoạt Quân",
      };
    }

    // 1. Xe (Rook)
    if (piece.type === 3) {
      if (toRow === riverRank) {
        return {
          tacticName: "Xe Tuần Hà (Khống Chế Tuyến Sông)",
          why: `Xe chiếm cứ bờ sông lộ ${tCol} - tuyến huyết mạch chiến trường; vừa ngăn chặn Mã và Binh địch vượt sông, vừa sẵn sàng hoành xa chuyển cánh chi viện công kích thần tốc.`,
          tag: "Tuần Hà",
        };
      }
      if (toRow === enemyPawnRank) {
        return {
          tacticName: "Xe Quá Hà Áp Sát (Đè Mã Diệt Tốt)",
          why: `Xe lọt sâu vào trận địa địch tại lộ ${tCol}, chọc thẳng vào hàng Tốt yếu hại, đè đầu Mã đối phương và mở toang hành lang sườn cho các đợt công kích tiếp theo.`,
          tag: "Ghìm Mã",
        };
      }
      if (toRow === enemyBaseline || Math.abs(toRow - enemyBaseline) === 1) {
        return {
          tacticName: "Xe Áp Đáy Cung (Kẹp Cổ Khóa Tướng)",
          why: `Xe thọc sâu xuống tuyến đáy lộ ${tCol}, phong tỏa toàn bộ đường di chuyển của Tướng và Sĩ địch, tạo thế kẹp cổ phối hợp cùng Pháo/Mã sát phạt.`,
          tag: "Kẹp Cổ",
        };
      }
      return {
        tacticName: `Xe Chiếm Lộ ${tCol} Thông Thoáng`,
        why: `Xuất Xe kiểm soát lộ ${tCol} thông thoáng, làm chủ trục giao chiến chính, đoạt quyền tiên cơ và liên kết chặt chẽ toàn bộ tuyến công thủ.`,
        tag: "Lộ Thông",
      };
    }

    // 2. Pháo (Cannon)
    if (piece.type === 4) {
      if (toCol === 4) {
        return {
          tacticName: "Pháo Đầu Uy Chấn (Trung Pháo Công Tâm)",
          why: `Bình Pháo vào trung lộ khống chế trực diện tim Tướng địch, ghim chặt Tốt đầu và Tướng đối phương vào trục dọc, tạo thế công dồn dập và giải phóng đường cho Song Mã xuất trận.`,
          tag: "Pháo Đầu",
        };
      }
      if (toCol === 1 || toCol === 7) {
        return {
          tacticName: `Pháo Giáp Sườn (Lộ ${tCol})`,
          why: `Chuyển Pháo sang lộ ${tCol} tạo gọng kìm phối hợp cùng Xe, nhắm thẳng vào cánh yếu của đối phương và phong tỏa ý đồ xuất Xe phản kích của địch.`,
          tag: "Pháo Sườn",
        };
      }
      if (toRow === riverRank || toRow === enemyPawnRank) {
        return {
          tacticName: `Pháo Tuần Hà / Quá Hà Lộ ${tCol}`,
          why: `Tiến Pháo lên kiểm soát tuyến giao thông lộ ${tCol}, tạo ngòi nổ tầm xa ghìm chặt Xe Mã đối phương không cho tự do triển khai quân lực.`,
          tag: "Phong Tỏa",
        };
      }
      return {
        tacticName: `Pháo Lập Trận Lộ ${tCol}`,
        why: `Điều Pháo tới vị trí đắc địa lộ ${tCol}, thiết lập ngòi nổ chiến thuật đa hướng và bảo vệ các điểm then chốt của trận địa.`,
        tag: "Pháo Trận",
      };
    }

    // 3. Mã (Knight)
    if (piece.type === 5) {
      if (
        (toCol === 2 || toCol === 6) &&
        Math.abs(toRow - enemyBaseline) <= 2
      ) {
        return {
          tacticName: "Mã Ngọa Tào (Khóa Cung Tướng Địch)",
          why: `Phi Mã cắm thẳng vào huyệt đạo ngọa tào lộ ${tCol}, khóa chặt góc cung Tướng địch, đe dọa trực tiếp mạng sống của Tướng và mở đường cho Xe Pháo giáng đòn kết liễu.`,
          tag: "Ngọa Tào",
        };
      }
      if (
        (toCol === 3 || toCol === 5) &&
        Math.abs(toRow - enemyBaseline) <= 2
      ) {
        return {
          tacticName: "Mã Điếu Ngư (Mã Câu Cá Độc Chiêu)",
          why: `Mã chiếm vị trí Điếu Ngư hiểm hóc, kết hợp với Xe hoặc Pháo tạo thành thế thắt cổ không thể chống đỡ đối với Tướng địch.`,
          tag: "Điếu Ngư",
        };
      }
      if (toCol === 3 || toCol === 5) {
        return {
          tacticName: `Song Mã Khởi Nhịp Lộ ${tCol}`,
          why: `Mã tiến lên vị trí trung tâm lộ ${tCol}, liên hoàn bảo vệ Tốt đầu, mở rộng tầm kiểm soát bàn cờ và sẵn sàng phi qua sông công kích khi có cơ hội.`,
          tag: "Song Mã",
        };
      }
      if (isPastRiver) {
        return {
          tacticName: "Mã Vượt Sông Bàn Hà",
          why: `Mã phi qua sông đoạt điểm tựa chiến thuật, đạp vỡ thế phòng ngự phía trước và mở rộng không gian tấn công đa góc hiểm hóc.`,
          tag: "Bàn Hà",
        };
      }
      return {
        tacticName: `Mã Nhảy Khai Thông Lộ ${tCol}`,
        why: `Vận động Mã đến lộ ${tCol} thoáng đãng, thoát khỏi sự cản trở của chân Mã, tạo điểm tựa cơ động cho cả công thủ toàn diện.`,
        tag: "Khai Thông",
      };
    }

    // 4. Binh / Tốt (Pawn)
    if (piece.type === 6) {
      if (isPastRiver) {
        return {
          tacticName: "Tiểu Tốt Quá Hà (Áp Đảo Uy Lực)",
          why: `Tốt vượt sông áp sát phòng tuyến địch tại lộ ${tCol}, từng bước gặm nhấm không gian phòng ngự, sẵn sàng phối hợp thọc sâu vào cung Tướng đối phương.`,
          tag: "Tốt Qua Sông",
        };
      }
      return {
        tacticName: `Tiến Binh Khai Nhãn Lộ ${tCol}`,
        why: `Đẩy Binh lộ ${tCol} lên một nước nhằm thông đường cho Mã xuất kích, kiềm tỏa đà phát triển của quân địch trên cùng trục lộ.`,
        tag: "Khai Nhãn",
      };
    }

    // 5. Sĩ / Tượng (Guard / Bishop)
    if (piece.type === 1) {
      return {
        tacticName: "Bổ Sĩ Gia Cố Cung Tướng",
        why: `Dựng Sĩ che chắn trung lộ và góc cung, bảo vệ an toàn tuyệt đối cho Tướng trước các họng pháo tầm xa và đòn xuyên tâm của địch.`,
        tag: "Gia Cố",
      };
    }
    if (piece.type === 2) {
      return {
        tacticName: "Vén Tượng Liên Hoàn Phòng Thủ",
        why: `Liên kết đôi Tượng vững chắc, bảo vệ Tốt đầu và ngăn chặn Xe/Pháo đối phương nhòm ngó đáy cung trận địa.`,
        tag: "Vén Tượng",
      };
    }

    // 6. Tướng (King)
    if (piece.type === 0) {
      return {
        tacticName: "Tướng Xuất Cung Trợ Chiến",
        why: `Vận động Tướng chiếm lộ khống chế, dùng mặt Tướng làm ngòi nổ hỗ trợ Xe Pháo khóa chặt đường di chuyển của địch.`,
        tag: "Mặt Tướng",
      };
    }

    return {
      tacticName: `Điều Động Quân Lực Lộ ${tCol}`,
      why: `Di chuyển ${piece.name} đến Lộ ${tCol} tạo liên kết thế trận, sẵn sàng ứng biến theo mọi diễn biến tiếp theo.`,
      tag: "Điều Quân",
    };
  }

  /**
   * Classifies classical Xiangqi mating motifs for forced mates and pre-mate combinations.
   */
  function classifyXiangqiMateMotif(pieces, move, myColor, oppColor, score) {
    if (!move || !pieces) return null;
    const enemyPalaceRows = myColor === 0 ? [7, 8, 9] : [0, 1, 2];
    const enemyBaseline = myColor === 0 ? 9 : 0;
    const oppKing = pieces.find((p) => p.type === 0 && p.color === oppColor);
    const myKing = pieces.find((p) => p.type === 0 && p.color === myColor);
    const movingPiece = pieces.find(
      (p) =>
        p.col === move.fromCol && p.row === move.fromRow && p.color === myColor,
    );
    if (!movingPiece) return null;

    const toCol = move.toCol;
    const toRow = move.toRow;

    // 1. Bạch Kiểm Tướng (Mặt Tướng đối diện trực tiếp trợ chiến)
    if (myKing && oppKing && myKing.col === oppKing.col) {
      const minR = Math.min(myKing.row, oppKing.row);
      const maxR = Math.max(myKing.row, oppKing.row);
      const blockers = pieces.filter(
        (p) =>
          p.col === myKing.col &&
          p.row > minR &&
          p.row < maxR &&
          !(p.col === move.fromCol && p.row === move.fromRow),
      );
      if (blockers.length === 0) {
        return {
          id: "face-king",
          name: "Bạch Kiểm Tướng",
          tag: "face-king",
          desc: "Mượn uy thế Mặt Tướng trợ chiến trực tiếp trung lộ, kết liễu trận đấu bằng đòn Bạch Kiểm Tướng!",
        };
      }
    }

    // 2. Thiết Môn Khảm (Cửa sắt - Pháo/Xe ghim trung lộ, Xe cắm đáy)
    const centerPinned = pieces.some(
      (p) =>
        p.color === myColor &&
        p.col === 4 &&
        (p.type === 4 || p.type === 3) &&
        enemyPalaceRows.includes(p.row),
    );
    if (
      (movingPiece.type === 3 && toRow === enemyBaseline) ||
      (centerPinned && movingPiece.type === 3)
    ) {
      return {
        id: "iron-gate",
        name: "Thiết Môn Khảm",
        tag: "iron-gate",
        desc: "Pháo/Xe ghim chặt trung lộ, Xe đáy cắm xuống giáng đòn tuyệt sát Thiết Môn Khảm kinh điển!",
      };
    }

    // 3. Mã Ngọa Tào (Cắm góc cung lộ 2 hoặc lộ 8)
    const isNgocTaoCol = toCol === 1 || toCol === 7;
    const isNgocTaoRow =
      myColor === 0 ? toRow === 7 || toRow === 8 : toRow === 1 || toRow === 2;
    if (movingPiece.type === 5 && isNgocTaoCol && isNgocTaoRow) {
      return {
        id: "resting-horse",
        name: "Mã Ngọa Tào",
        tag: "resting-horse",
        desc: "Mã cắm góc hiểm Ngọa Tào, bóp nghẹt cửu cung không cho Tướng địch lối thoát!",
      };
    }

    // 4. Mã Hậu Pháo (Pháo điểm hỏa sau lưng Mã)
    if (movingPiece.type === 4 || movingPiece.type === 5) {
      const hasHorseFront = pieces.some(
        (p) =>
          p.color === myColor &&
          p.type === 5 &&
          enemyPalaceRows.includes(p.row),
      );
      if (hasHorseFront && (movingPiece.type === 4 || movingPiece.type === 5)) {
        return {
          id: "horse-cannon-mate",
          name: "Mã Hậu Pháo",
          tag: "horse-cannon-mate",
          desc: "Mã khóa cửa cung, Pháo phía sau điểm hỏa tuyệt sát đòn Mã Hậu Pháo bất khả hóa giải!",
        };
      }
    }

    // 5. Điếu Ngư Mã (Mã câu cá: cột 2 hoặc 6, hàng 7 hoặc 2)
    const isDieuNguCol = toCol === 2 || toCol === 6;
    const isDieuNguRow = myColor === 0 ? toRow === 7 : toRow === 2;
    if (movingPiece.type === 5 && isDieuNguCol && isDieuNguRow) {
      return {
        id: "fishing-horse",
        name: "Điếu Ngư Mã",
        tag: "fishing-horse",
        desc: "Thế trận Điếu Ngư Mã giăng lưới, phối hợp Xe sườn siết chặt thòng lọng tuyệt sát!",
      };
    }

    // 6. Song Xe Bào (Double Chariot Assail)
    if (movingPiece.type === 3 && enemyPalaceRows.includes(toRow)) {
      return {
        id: "double-rook",
        name: "Song Xe Bào",
        tag: "double-rook",
        desc: "Hỏa lực Xe Pháo giáp công liên hoàn, dồn ép Tướng địch vào tử địa!",
      };
    }

    // 7. Trắc Diện Hổ (Mã ngọa tào + Xe sườn phối hợp tuyệt sát)
    const hasHorseFlank = pieces.some(
      (p) =>
        p.color === myColor &&
        p.type === 5 &&
        (p.col === 1 || p.col === 7 || p.col === 2 || p.col === 6) &&
        enemyPalaceRows.includes(p.row),
    );
    if (
      movingPiece.type === 3 &&
      (toCol === 3 || toCol === 5 || toCol === 1 || toCol === 7) &&
      hasHorseFlank
    ) {
      return {
        id: "trac-dien-ho",
        name: "Trắc Diện Hổ",
        tag: "trac-dien-ho",
        desc: "Mã khóa góc cung, Xe sườn áp sát giáng đòn Trắc Diện Hổ sấm sét đoạt mạng Tướng địch!",
      };
    }

    // 8. Song Pháo Trùng (Hai Pháo cùng một lộ chiếu bí)
    if (movingPiece.type === 4) {
      const otherCannonSameCol = pieces.some(
        (p) =>
          p.color === myColor &&
          p.type === 4 &&
          p.col === toCol &&
          !(p.col === move.fromCol && p.row === move.fromRow) &&
          enemyPalaceRows.includes(p.row),
      );
      if (otherCannonSameCol && enemyPalaceRows.includes(toRow)) {
        return {
          id: "double-cannon",
          name: "Song Pháo Trùng",
          tag: "double-cannon",
          desc: "Song Pháo trùng trục lộ giáng hỏa lực kinh hoàng, Tướng địch không còn đường thoái lui!",
        };
      }
    }

    // 9. Hải Đáy Lao Nguyệt (Xe luồn đáy mượn ngòi chiếu bí)
    if (movingPiece.type === 3 && toRow === enemyBaseline) {
      return {
        id: "sea-bottom-moon",
        name: "Hải Đáy Lao Nguyệt",
        tag: "sea-bottom-moon",
        desc: "Xe cắm đáy cung luồn sau lưng Tướng, giáng đòn Đáy Biển Mò Trăng đoạt thắng quyết định!",
      };
    }

    // 10. Đại Đao Oan Tâm (Xe/Tốt phá thẳng tâm cung)
    if (
      (movingPiece.type === 3 || movingPiece.type === 6) &&
      toCol === 4 &&
      enemyPalaceRows.includes(toRow)
    ) {
      return {
        id: "gouging-heart",
        name: "Đại Đao Oan Tâm",
        tag: "gouging-heart",
        desc: "Chém thẳng vào huyệt đạo tâm cung đối phương, phá nát trận hình đoạt thắng tuyệt đối!",
      };
    }

    return {
      id: "mate-threat",
      name: "Tuyệt Sát Liên Hoàn",
      tag: "mate-threat",
      desc: "Chuỗi đòn công sát dồn dập, ép đối phương vào thế chiếu bí không thể cứu vãn!",
    };
  }

  /**
   * Scans for impending Discovered Checks (Chiếu Rút / Chiếu Mở) against our King.
   * E.g. Enemy Chariot or Cannon obstructed only by an enemy jumper (Elephant, Knight, Pawn).
   * When that enemy piece moves, our King is instantly placed in check!
   */
  function detectDiscoveredCheckThreat(pieces, myColor, oppColor) {
    if (!pieces || pieces.length === 0) return null;
    const myKing = pieces.find((p) => p.type === 0 && p.color === myColor);
    if (!myKing) return null;

    const DIRS = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];

    for (const [dc, dr] of DIRS) {
      let c = myKing.col + dc;
      let r = myKing.row + dr;
      const rayPieces = [];

      while (c >= 0 && c <= 8 && r >= 0 && r <= 9) {
        const found = pieces.find((p) => p.col === c && p.row === r);
        if (found) rayPieces.push(found);
        c += dc;
        r += dr;
      }

      if (rayPieces.length >= 2) {
        const p1 = rayPieces[0];
        const p2 = rayPieces[1];

        // 1. Chariot Discovered Check (Xe Chiếu Rút):
        // p1 is an enemy blocker, p2 is an enemy Chariot!
        if (p1.color === oppColor && p2.color === oppColor && p2.type === 3) {
          const colName = myColor === 0 ? 9 - p1.col : p1.col + 1;
          return {
            type: "discovered_check",
            attacker: p2,
            blocker: p1,
            desc: `CẢNH BÁO CHIẾU RÚT: ${p1.name} địch tại Lộ ${colName} đang cản đường ${p2.name} chiếu Tướng. Khi ${p1.name} nảy đi sẽ giáng đòn chiếu rút cực hiểm!`,
          };
        }

        // 2. Cannon Discovered Check (Pháo Chiếu Rút):
        // A Cannon needs 1 screen. If ray has p1 and p2, and p3 is an enemy Cannon:
        if (rayPieces.length >= 3) {
          const p3 = rayPieces[2];
          if (p3.color === oppColor && p3.type === 4) {
            const enemyBlocker =
              p1.color === oppColor ? p1 : p2.color === oppColor ? p2 : null;
            if (enemyBlocker) {
              const colName =
                myColor === 0 ? 9 - enemyBlocker.col : enemyBlocker.col + 1;
              return {
                type: "discovered_check",
                attacker: p3,
                blocker: enemyBlocker,
                desc: `CẢNH BÁO PHÁO RÚT: ${enemyBlocker.name} địch tại Lộ ${colName} đang che ngòi ${p3.name}. Đối thủ nảy ${enemyBlocker.name} sẽ mở hỏa lực Pháo chiếu Tướng lập tức!`,
              };
            }
          }
        }
      }
    }

    return null;
  }

  // =========================================================================
  // Master Tactical Engine Integration (Negamax MultiPV + 2-3 Variations)
  // =========================================================================

  // Lightweight (<0.02ms) instant static analysis for HUD card when modal is closed
  function buildQuickAnalysis(quickRes, gameData, pieces) {
    if (!gameData || !pieces || pieces.length === 0) return null;
    const myColor = gameData.myColor;
    const oppColor = gameData.oppColor;
    const gameLayer = gameData.gameLayer;
    const activeColor =
      gameLayer && gameLayer.Yc !== undefined ? gameLayer.Yc : myColor;
    const isMyTurn = activeColor === myColor;

    const totalPieces = pieces.length;
    let phase = "Trung Cuộc";
    if (totalPieces >= 28) phase = "Khai Cuộc";
    else if (totalPieces <= 14) phase = "Tàn Cuộc";

    const score = quickRes && !quickRes.error ? quickRes.score : 0;
    let inCheck = quickRes && !quickRes.error ? !!quickRes.inCheck : false;
    if (!inCheck) {
      try {
        engine.setup(pieces);
        inCheck = engine.inCheck(myColor);
      } catch (e) {}
    }
    const evalPoints = (score / 100).toFixed(1);
    let evalText = "Cân bằng (0.0)";
    if (score >= 50) evalText = `+${evalPoints}đ (Bạn ưu)`;
    else if (score <= -50) evalText = `${evalPoints}đ (Địch ưu)`;

    const discThreat = detectDiscoveredCheckThreat(pieces, myColor, oppColor);

    let commentary = {
      type: "turn",
      title: "LƯỢT ĐI CỦA BẠN",
      move: null,
      shortMove: null,
      why: "Đến lượt bạn đi. Hãy mở Kỳ Đạo Sư để xem phân tích chuyên sâu.",
    };

    if (inCheck) {
      commentary = {
        type: "danger",
        title: "🚨 TƯỚNG ĐANG BỊ CHIẾU!",
        move: null,
        shortMove: null,
        why: "Tướng của bạn đang bị đối phương chiếu! Cần ưu tiên tuyệt đối hóa giải thế chiếu an toàn.",
        badge: "CỨU GIÁ",
      };
    } else if (discThreat) {
      commentary = {
        type: "danger",
        title: "CẢNH BÁO CHIẾU RÚT",
        move: null,
        shortMove: null,
        why: discThreat.desc,
      };
    } else if (!isMyTurn) {
      commentary = {
        type: "waiting",
        title: "LƯỢT ĐỐI THỦ ĐANG SUY NGHĨ",
        move: null,
        shortMove: null,
        why: "Đối thủ đang suy nghĩ nước cờ. Làm chén trà chứ!",
      };
    }

    const coachCommentary = commentary.move
      ? `Khuyên dùng ${commentary.move}! ${commentary.why}`
      : commentary.why;

    const openingInfo = detectXiangqiOpening(pieces, myColor);
    const currentMaxim = selectIntelligentMaxim(
      pieces,
      myColor,
      oppColor,
      phase,
      score,
      inCheck,
      discThreat,
      [],
      null,
    );

    return {
      phase,
      isMyTurn,
      myColor,
      oppColor,
      pieces,
      evalScore: score,
      evalPoints,
      evalText,
      coachCommentary,
      commentary,
      threatInfo: discThreat ? { desc: discThreat.desc } : null,
      plans: [],
      inCheck,
      depth: 0,
      nodes: 0,
      evalBreakdown:
        quickRes && quickRes.evalBreakdown ? quickRes.evalBreakdown : null,
      openingName: openingInfo ? openingInfo.name : null,
      openingInfo: openingInfo,
      engineName:
        activeProviderId === "pikafish"
          ? getEngineTransportStatus().type === "native-ws"
            ? "Pikafish NNUE (Native WS: 8765)"
            : "Pikafish 17 NNUE (Cloud)"
          : "AN Grandmaster JS",
      pikafishStatus:
        activeProviderId === "pikafish"
          ? getEngineTransportStatus().type
          : "js-engine",
      mateThreat: discThreat
        ? {
            type: "defense",
            motif: "Chiếu Rút Nguy Hiểm",
            steps: 1,
            title: "🚨 CẢNH BÁO ĐÒN CHIẾU RÚT!",
            explanation: discThreat.desc,
          }
        : null,
      maxim: currentMaxim,
      allMaxims: XIANGQI_MAXIMS,
      isQuickOnly: true,
    };
  }

  // Maps Alpha-Beta search result into rich tactical plans with opponent variations
  function buildTacticalAnalysis(searchRes, gameData, pieces) {
    if (!gameData || !pieces || pieces.length === 0 || !searchRes) return null;

    try {
      const myColor = gameData.myColor;
      const oppColor = gameData.oppColor;
      const gameLayer = gameData.gameLayer;
      const activeColor =
        gameLayer && gameLayer.Yc !== undefined ? gameLayer.Yc : myColor;
      const isMyTurn = activeColor === myColor;

      // Phase determination
      const totalPieces = pieces.length;
      let phase = "Trung Cuộc";
      if (totalPieces >= 28) phase = "Khai Cuộc";
      else if (totalPieces <= 14) phase = "Tàn Cuộc";

      // Numerical Advantage Score (centipawn to points)
      // Kế sách và lộ trình chiến thuật luôn được xây dựng cho Người Chơi (Ta đi)
      const movingColor = myColor;
      const targetColor = oppColor;

      const rawScore = searchRes.score || 0;
      const topScore =
        searchRes.side !== undefined && searchRes.side !== myColor
          ? -rawScore
          : rawScore;
      const evalPoints = (topScore / 100).toFixed(1);
      let evalText = "Cân bằng (0.0)";
      if (topScore >= 50) evalText = `+${evalPoints}đ (Bạn ưu)`;
      else if (topScore <= -50) evalText = `${evalPoints}đ (Địch ưu)`;

      let inCheck = Boolean(searchRes.inCheck);
      if (!inCheck) {
        try {
          engine.setup(pieces);
          inCheck = Boolean(engine.inCheck(myColor));
        } catch (e) {}
      }

      const plans = [];

      // Helper to clone and apply one move on a piece array so deep PV steps (3..8) find moved pieces accurately
      const applySimMove = (
        boardArr,
        fromCol,
        fromRow,
        toCol,
        toRow,
        sideCol,
      ) => {
        if (
          !Array.isArray(boardArr) ||
          fromCol == null ||
          fromRow == null ||
          toCol == null ||
          toRow == null
        ) {
          return boardArr;
        }
        return boardArr
          .filter(
            (p) => !(p.col === toCol && p.row === toRow && p.color !== sideCol),
          )
          .map((p) =>
            p.col === fromCol && p.row === fromRow && p.color === sideCol
              ? { ...p, col: toCol, row: toRow }
              : { ...p },
          );
      };

      const formatPlanScoreText = (sc, isMateFlag, mateInVal) => {
        if (isMateFlag || Math.abs(sc) >= 9000) {
          const steps =
            mateInVal && Math.abs(mateInVal) > 0
              ? Math.abs(mateInVal)
              : Math.max(
                  1,
                  Math.ceil((10000 - Math.min(Math.abs(sc), 9999)) / 2),
                );
          return sc >= 0 ? `Sát ${steps}` : `Bị sát ${steps}`;
        }
        const pts = (sc / 100).toFixed(1);
        return sc > 0 ? `+${pts}` : `${pts}`;
      };

      (searchRes.lines || []).forEach((line, idx) => {
        const movingPiece = pieces.find(
          (p) =>
            p.col === line.fromCol &&
            p.row === line.fromRow &&
            p.color === movingColor,
        );
        if (!movingPiece) return;

        const targetPiece = pieces.find(
          (p) =>
            p.col === line.toCol &&
            p.row === line.toRow &&
            p.color === targetColor,
        );

        const notation = getXiangqiNotation(
          movingPiece,
          line.fromCol,
          line.fromRow,
          line.toCol,
          line.toRow,
          movingColor,
        );

        const isMate = line.delivermate || line.score >= engine.MATE - 100;
        const isCheck = inCheck;

        const desc = getTacticalDescription(
          movingPiece,
          targetPiece,
          notation,
          line.toCol,
          line.toRow,
          movingColor,
          isCheck,
          isMate,
          line.replies,
          pieces,
          evalPoints,
        );

        // Process 2-3 Opponent Variations with Deep Tactical Explanations
        let rawReplies = (line.replies || []).filter(
          (r) => r && r.fromCol != null && r.toCol != null,
        );

        // If no opponent replies provided by engine/cloud, dynamically compute 1-3 REAL legal opponent responses!
        if (rawReplies.length === 0) {
          try {
            const afterOurMove = pieces
              .filter(
                (p) =>
                  !(
                    p.col === line.toCol &&
                    p.row === line.toRow &&
                    p.color === oppColor
                  ),
              )
              .map((p) =>
                p.col === line.fromCol &&
                p.row === line.fromRow &&
                p.color === movingColor
                  ? { ...p, col: line.toCol, row: line.toRow }
                  : { ...p },
              );

            const oppSearch = engine.analyze({
              pieces: afterOurMove,
              side: oppColor,
              maxDepth: 3,
              timeMs: 40,
              multiPV: 3,
            });

            if (oppSearch && oppSearch.lines && oppSearch.lines.length > 0) {
              rawReplies = oppSearch.lines.map((ol) => ({
                fromCol: ol.fromCol,
                fromRow: ol.fromRow,
                toCol: ol.toCol,
                toRow: ol.toRow,
                score: ol.score,
                answer:
                  ol.pv && ol.pv[1] ? { ...ol.pv[1], score: -ol.score } : null,
                step4:
                  ol.pv && ol.pv[2] ? { ...ol.pv[2], score: ol.score } : null,
                step5:
                  ol.pv && ol.pv[3] ? { ...ol.pv[3], score: -ol.score } : null,
              }));
            }
          } catch (e) {
            console.warn(
              "[AN Mod] Dynamic opponent reply generation fallback:",
              e,
            );
          }
        }

        const boardAfterStep1 = applySimMove(
          pieces,
          line.fromCol,
          line.fromRow,
          line.toCol,
          line.toRow,
          movingColor,
        );

        const variations = rawReplies.map((rep, rIdx) => {
          const oppPiece = boardAfterStep1.find(
            (p) =>
              p.col === rep.fromCol &&
              p.row === rep.fromRow &&
              p.color === oppColor,
          ) || {
            col: rep.fromCol,
            row: rep.fromRow,
            type: 6,
            color: oppColor,
            name: "Quân địch",
            short: "Q",
          };

          const oppTarget = boardAfterStep1.find(
            (p) =>
              p.col === rep.toCol && p.row === rep.toRow && p.color === myColor,
          );

          const oppNot = getXiangqiNotation(
            oppPiece,
            rep.fromCol,
            rep.fromRow,
            rep.toCol,
            rep.toRow,
            oppColor,
          );

          const boardAfterStep2 = applySimMove(
            boardAfterStep1,
            rep.fromCol,
            rep.fromRow,
            rep.toCol,
            rep.toRow,
            oppColor,
          );

          let oppWhy = "";
          const oppTCol = oppColor === 0 ? 9 - rep.toCol : rep.toCol + 1;
          if (oppTarget) {
            oppWhy = `Phản pháo chém ${oppTarget.name} tại Lộ ${oppTCol} nhằm giải tỏa sức ép.`;
          } else if (oppPiece && oppPiece.type === 0) {
            oppWhy = `Tướng địch dời sang Lộ ${oppTCol} thoát khỏi tầm ngắm nguy hiểm của ta.`;
          } else if (oppPiece && (oppPiece.type === 1 || oppPiece.type === 2)) {
            oppWhy = `Bổ ${oppPiece.name} củng cố phòng tuyến trước thế công dồn dập của ta.`;
          } else if (oppPiece && oppPiece.type === 3) {
            oppWhy = `Xuất Xe kiểm soát Lộ ${oppTCol} hòng ngăn chặn mũi đột phá của ta.`;
          } else if (oppPiece && oppPiece.type === 4) {
            oppWhy = `Điều Pháo tới Lộ ${oppTCol} tìm kiếm ngòi nổ phản kích.`;
          } else if (oppPiece && oppPiece.type === 5) {
            oppWhy = `Nhảy Mã lên Lộ ${oppTCol} hòng khai thông thế trận và phản kích.`;
          } else if (oppPiece && oppPiece.type === 6) {
            oppWhy = `Tiến Binh Lộ ${oppTCol} mở đường cho Mã hoặc tranh đoạt quyền kiểm soát hà.`;
          } else {
            oppWhy = `Điều quân phản ứng củng cố trận địa.`;
          }

          // Follow-up answer from friendly side (simulated on boardAfterStep2!)
          let ansNot = null;
          let ansWhy = "";
          if (rep.answer) {
            const ansPiece = boardAfterStep2.find(
              (p) =>
                p.col === rep.answer.fromCol &&
                p.row === rep.answer.fromRow &&
                p.color === myColor,
            );
            if (ansPiece) {
              ansNot = getXiangqiNotation(
                ansPiece,
                rep.answer.fromCol,
                rep.answer.fromRow,
                rep.answer.toCol,
                rep.answer.toRow,
                myColor,
              );
              const ansTarget = boardAfterStep2.find(
                (p) =>
                  p.col === rep.answer.toCol &&
                  p.row === rep.answer.toRow &&
                  p.color === oppColor,
              );
              const ansTCol =
                myColor === 0 ? 9 - rep.answer.toCol : rep.answer.toCol + 1;
              if (ansTarget) {
                ansWhy = `Lập tức chém ${ansTarget.name} Lộ ${ansTCol}, đoạt ưu thế quyết định.`;
              } else if (rep.answer.score && rep.answer.score > 9000) {
                ansWhy = `Giáng đòn sát cục kết liễu trận đấu!`;
              } else if (ansPiece.type === 0) {
                ansWhy = `Vận động Tướng chiếm lộ khống chế trợ chiến khóa chặt đối phương.`;
              } else if (ansPiece.type === 3) {
                ansWhy = `Xe bồi đòn khống chế Lộ ${ansTCol}, siết chặt vòng vây ép địch vào thế bí.`;
              } else if (ansPiece.type === 4) {
                ansWhy = `Pháo bồi thêm đòn công kích sườn/trung lộ, khóa chặt đường tẩu thoát.`;
              } else if (ansPiece.type === 5) {
                ansWhy = `Mã phi lên Lộ ${ansTCol} tạo gọng kìm phối hợp cùng Xe Pháo dồn ép Tướng địch.`;
              } else if (ansPiece.type === 6) {
                ansWhy = `Tiểu Tốt xông lên áp sát nách cung, gia tăng áp lực sát ván.`;
              } else {
                ansWhy = `Bồi thêm đòn ${ansNot.short} giữ vững ưu thế áp đảo.`;
              }
            }
          }

          const varLabel =
            rIdx === 0
              ? `Biến 1 (Phổ biến): ${oppNot.short}`
              : rIdx === 1
                ? `Biến 2 (Phòng thủ): ${oppNot.short}`
                : `Biến 3 (Phản công): ${oppNot.short}`;

          return {
            idx: rIdx,
            label: varLabel,
            shortLabel: `Biến ${rIdx + 1}: ${oppNot.short}`,
            oppNotation: oppNot,
            oppWhy,
            fromCol: rep.fromCol,
            fromRow: rep.fromRow,
            toCol: rep.toCol,
            toRow: rep.toRow,
            oppPiece,
            answer: rep.answer
              ? {
                  fromCol: rep.answer.fromCol,
                  fromRow: rep.answer.fromRow,
                  toCol: rep.answer.toCol,
                  toRow: rep.answer.toRow,
                  notation: ansNot,
                  why: ansWhy,
                }
              : null,
            step4: rep.step4 || null,
            step5: rep.step5 || null,
          };
        });

        // Default if completely empty (e.g. checkmate)
        if (variations.length === 0) {
          variations.push({
            idx: 0,
            label: "Biến 1: Địch cùng đường",
            shortLabel: "Hết cờ",
            oppNotation: {
              short: "Hết nước",
              full: "Đối thủ không còn nước đi hợp lệ",
            },
            oppWhy: "Đối thủ lâm vào thế sát cục hoặc hết nước đi.",
            fromCol: null,
            fromRow: null,
            toCol: null,
            toRow: null,
            oppPiece: null,
            answer: null,
            step4: null,
            step5: null,
          });
        }

        // Check classical Xiangqi mating motif
        const isForcedMate = line.delivermate || line.score >= 9000;
        const mateMotif = isForcedMate
          ? classifyXiangqiMateMotif(
              pieces,
              line,
              movingColor,
              targetColor,
              line.score,
            )
          : null;

        // Build up to 8-step interactive tactical roadmap by accurately simulating the board at each ply!
        const roadmap = [];
        const rep0 = variations[0];
        const pvSequence = [];

        if (Array.isArray(line.pv) && line.pv.length >= 2) {
          for (let s = 0; s < Math.min(8, line.pv.length); s++) {
            const mv = line.pv[s];
            if (mv && mv.fromCol != null && mv.toCol != null) {
              pvSequence.push(mv);
            }
          }
        } else {
          pvSequence.push({
            fromCol: line.fromCol,
            fromRow: line.fromRow,
            toCol: line.toCol,
            toRow: line.toRow,
          });
          if (rep0 && rep0.fromCol != null && rep0.toCol != null) {
            pvSequence.push({
              fromCol: rep0.fromCol,
              fromRow: rep0.fromRow,
              toCol: rep0.toCol,
              toRow: rep0.toRow,
            });
            if (rep0.answer && rep0.answer.fromCol != null) {
              pvSequence.push(rep0.answer);
              if (rep0.step4 && rep0.step4.fromCol != null) {
                pvSequence.push(rep0.step4);
                if (rep0.step5 && rep0.step5.fromCol != null) {
                  pvSequence.push(rep0.step5);
                }
              }
            }
          }
        }

        const STEP_LABELS = [
          "1. Ta đi",
          "2. Địch đáp",
          "3. Ta bồi",
          "4. Địch đỡ",
          "5. Dứt điểm",
          "6. Địch chống",
          "7. Áp sát",
          "8. Địch thủ",
        ];

        let simBoard = pieces.map((p) => ({ ...p }));
        for (let sIdx = 0; sIdx < pvSequence.length; sIdx++) {
          const mv = pvSequence[sIdx];
          const stepNum = sIdx + 1;
          const stepSide = sIdx % 2 === 0 ? movingColor : oppColor;
          const stepPiece = simBoard.find(
            (p) =>
              p.col === mv.fromCol &&
              p.row === mv.fromRow &&
              p.color === stepSide,
          );
          const stepTarget = simBoard.find(
            (p) =>
              p.col === mv.toCol && p.row === mv.toRow && p.color !== stepSide,
          );

          let stepNot = null;
          let stepWhy = "";

          if (sIdx === 0) {
            stepNot = notation;
            stepWhy = desc.why;
          } else if (sIdx === 1 && rep0 && rep0.oppNotation) {
            stepNot = rep0.oppNotation;
            stepWhy = rep0.oppWhy;
          } else if (
            sIdx === 2 &&
            rep0 &&
            rep0.answer &&
            rep0.answer.notation
          ) {
            stepNot = rep0.answer.notation;
            stepWhy = rep0.answer.why;
          } else if (stepPiece) {
            stepNot = getXiangqiNotation(
              stepPiece,
              mv.fromCol,
              mv.fromRow,
              mv.toCol,
              mv.toRow,
              stepSide,
            );
            const tCol = stepSide === 0 ? 9 - mv.toCol : mv.toCol + 1;
            if (stepSide === movingColor) {
              stepWhy = stepTarget
                ? `Ta tiếp tục chém ${stepTarget.name} Lộ ${tCol}, khoét sâu ưu thế!`
                : stepNum >= 5
                  ? `Đẩy mạnh mũi tiến công ${stepNot.short}, siết chặt thế thắng quyết định!`
                  : `Điều ${stepPiece.name} tới Lộ ${tCol} duy trì sức ép liên hoàn.`;
            } else {
              stepWhy = stepTarget
                ? `Địch phản công ăn ${stepTarget.name} Lộ ${tCol} để giảm tải áp lực.`
                : `Địch xoay sở điều ${stepPiece.name} chống đỡ trước vòng vây.`;
            }
          } else {
            stepNot = {
              short:
                stepSide === movingColor
                  ? `Ta đi #${stepNum}`
                  : `Địch đi #${stepNum}`,
              full:
                stepSide === movingColor
                  ? "Nước cờ liên hoàn của ta"
                  : "Nước phòng thủ của địch",
            };
            stepWhy =
              stepSide === movingColor
                ? "Duy trì nhịp tiến công theo biến chính Pikafish."
                : "Địch chống đỡ theo biến chính Pikafish.";
          }

          roadmap.push({
            step: stepNum,
            side: stepSide,
            label:
              STEP_LABELS[sIdx] ||
              `${stepNum}. ${stepSide === movingColor ? "Ta" : "Địch"}`,
            piece: stepPiece || null,
            fromCol: mv.fromCol,
            fromRow: mv.fromRow,
            toCol: mv.toCol,
            toRow: mv.toRow,
            notation: stepNot,
            why: stepWhy,
          });

          simBoard = applySimMove(
            simBoard,
            mv.fromCol,
            mv.fromRow,
            mv.toCol,
            mv.toRow,
            stepSide,
          );
        }

        // Dynamic strategic preparation linking Step 1 to Step 2 and Step 3
        let prepText = "";
        const firstRep = rep0 || variations[0];
        if (
          firstRep &&
          firstRep.oppNotation?.short &&
          firstRep.oppNotation?.short !== "Địch đi"
        ) {
          if (firstRep.answer && firstRep.answer.notation?.short) {
            prepText = `Kế sách: Đón đầu nước ${firstRep.oppNotation.short} của địch để lập tức bồi đòn ${firstRep.answer.notation.short}, làm chủ thế trận.`;
          } else {
            prepText = `Kế sách: Khống chế biến phản ứng ${firstRep.oppNotation.short} của đối phương, đoạt tiên cơ áp đảo.`;
          }
        }

        const planWhy = prepText ? `${desc.why} (${prepText})` : desc.why;

        const PLAN_BADGES = [
          "Tối Ưu",
          "Chắc Chắn",
          "Đột Phá",
          "Biến Hóa",
          "Dự Phòng",
          "Khai Phá",
          "Sáng Tạo",
          "Kiềm Chế",
        ];
        const planType =
          idx === 0
            ? "attack"
            : idx === 1
              ? "defend"
              : idx % 2 === 0
                ? "attack"
                : "maneuver";
        const planBadge = mateMotif
          ? "Tuyệt Sát"
          : PLAN_BADGES[idx] || `Biến #${idx + 1}`;

        const planTags =
          line.tags && line.tags.length > 0
            ? [...line.tags]
            : desc.tag
              ? [desc.tag]
              : [];
        if (mateMotif && !planTags.includes(mateMotif.tag)) {
          planTags.unshift(mateMotif.tag);
        }

        plans.push({
          id: `plan_${idx}`,
          idx,
          name: mateMotif
            ? `${notation.short} · ${mateMotif.name}`
            : `${notation.short} · ${desc.tacticName}`,
          shortNotation: notation.short,
          fullNotation: notation.full,
          type: planType,
          badge: planBadge,
          tag: mateMotif ? mateMotif.tag : desc.tag,
          tags: planTags,
          why: planWhy,
          score: line.score,
          scoreText: formatPlanScoreText(
            line.score || 0,
            Boolean(line.isMate || isForcedMate),
            line.mateIn,
          ),
          wdl: line.wdl || null,
          winrate: line.winrate ?? null,
          depth: line.depth || searchRes.depth || 0,
          piece: movingPiece,
          fromCol: line.fromCol,
          fromRow: line.fromRow,
          toCol: line.toCol,
          toRow: line.toRow,
          variations,
          roadmap,
        });
      });

      // Dự phòng an toàn: nếu không có dòng tính toán hoặc bị lọc hết (Kế Sách (0)),
      // tự động chạy phân tích nhanh từ engine JS nội bộ để người chơi luôn có kế sách tối ưu.
      if (plans.length === 0) {
        try {
          const fallbackRes = engine.analyze({
            pieces,
            side: movingColor,
            maxDepth: 4,
            timeMs: 120,
            multiPV: 3,
          });
          if (
            fallbackRes &&
            fallbackRes.lines &&
            fallbackRes.lines.length > 0
          ) {
            fallbackRes.lines.forEach((line) => {
              const movingPiece = pieces.find(
                (p) =>
                  p.col === line.fromCol &&
                  p.row === line.fromRow &&
                  p.color === movingColor,
              );
              if (!movingPiece) return;
              const notation = getXiangqiNotation(
                movingPiece,
                line.fromCol,
                line.fromRow,
                line.toCol,
                line.toRow,
                movingColor,
              );
              const fullNotation = notation ? notation.full : "";
              const shortNotation = notation ? notation.short : "";
              plans.push({
                id: `fallback-${line.fromCol}-${line.fromRow}-${line.toCol}-${line.toRow}`,
                name: `Triển khai ${movingPiece.name}`,
                badge: "An Toàn",
                fullNotation,
                shortNotation,
                tag: "reposition",
                tags: ["reposition"],
                why: `Chủ động điều động ${movingPiece.name} ổn định thế trận, củng cố phòng thủ và đón bắt thời cơ phản công.`,
                score: line.score || 0,
                piece: movingPiece,
                fromCol: line.fromCol,
                fromRow: line.fromRow,
                toCol: line.toCol,
                toRow: line.toRow,
                variations: [],
                roadmap: [
                  {
                    step: 1,
                    type: "my",
                    fromCol: line.fromCol,
                    fromRow: line.fromRow,
                    toCol: line.toCol,
                    toRow: line.toRow,
                    piece: movingPiece,
                    notation: { short: shortNotation, full: fullNotation },
                    shortNotation,
                    explanation: `Triển khai ${movingPiece.name} kiểm soát vị trí trọng yếu.`,
                    badge: "Nước Đi Khuyên Dùng",
                  },
                ],
              });
            });
          }
        } catch (e) {
          console.warn("[AN Mod] Fallback plan generation error:", e);
        }
      }

      const discThreat = detectDiscoveredCheckThreat(pieces, myColor, oppColor);

      // Coach Dynamic Commentary - Structured & Pure Text (No raw emojis)
      let commentary = {
        type: "optimal",
        title: "GỢI Ý TỐI ƯU",
        move: plans[0] ? plans[0].fullNotation : null,
        shortMove: plans[0] ? plans[0].shortNotation : null,
        why: plans[0] ? plans[0].why : "Hãy triển khai nước cờ cẩn trọng.",
      };

      if (inCheck) {
        const escapePlan = plans[0];
        commentary = {
          type: "danger",
          title: "🚨 TƯỚNG ĐANG BỊ CHIẾU! BẮT BUỘC CỨU GIÁ!",
          move: escapePlan ? escapePlan.fullNotation : null,
          shortMove: escapePlan ? escapePlan.shortNotation : null,
          why: escapePlan
            ? `Tướng đang bị đối phương chiếu! Hãy đi ngay ${escapePlan.fullNotation} để hóa giải thế chiếu an toàn.`
            : "Tướng của bạn đang bị đối phương chiếu! Cần ưu tiên tuyệt đối hóa giải thế chiếu.",
          badge: "CỨU GIÁ CẤP THIẾT",
        };
        plans.forEach((p) => {
          p.type = "defend";
          p.badge = "Giải Chiếu";
        });
      } else if (topScore <= -9000) {
        commentary = {
          type: "danger",
          title: "🚨 BÁO ĐỘNG SÁT CỤC! NGUY CƠ BỊ BỨC TỬ!",
          move: plans[0] ? plans[0].fullNotation : null,
          shortMove: plans[0] ? plans[0].shortNotation : null,
          why: plans[0]
            ? `Đối phương đang giăng bẫy sát cục nguy hiểm! Nước đi duy nhất kéo dài: ${plans[0].fullNotation}.`
            : "Đối phương đang có đòn sát cục quyết định! Hãy tập trung toàn lực phòng thủ.",
          badge: "BÁO ĐỘNG ĐỎ",
        };
      } else if (discThreat) {
        commentary = {
          type: "danger",
          title: "CẢNH BÁO CHIẾU RÚT",
          move: plans[0] ? plans[0].fullNotation : null,
          shortMove: plans[0] ? plans[0].shortNotation : null,
          why: discThreat.desc,
        };
      } else if (plans[0]?.tag?.includes("Sát Cục")) {
        commentary = {
          type: "mate",
          title: "ĐÒN SÁT CỤC TUYỆT KỸ",
          move: plans[0].fullNotation,
          shortMove: plans[0].shortNotation,
          why: plans[0].why,
        };
      } else if (!isMyTurn) {
        commentary = {
          type: "waiting",
          title: "LƯỢT ĐỐI THỦ ĐANG SUY NGHĨ",
          move: null,
          shortMove: null,
          why: "Đối thủ đang suy nghĩ nước cờ. Hãy quan sát trận thế và giữ vững sự tập trung!",
        };
      } else if (plans[0]) {
        commentary = {
          type: "optimal",
          title: "GỢI Ý TỐI ƯU",
          move: plans[0].fullNotation,
          shortMove: plans[0].shortNotation,
          why: plans[0].why,
        };
      } else {
        commentary = {
          type: "turn",
          title: "LƯỢT ĐI CỦA BẠN",
          move: null,
          shortMove: null,
          why: "Đến lượt bạn đi. Hãy triển khai nước cờ cẩn trọng.",
        };
      }

      const coachCommentary = commentary.move
        ? `Khuyên dùng ${commentary.move}! ${commentary.why}`
        : commentary.why;

      // Threat description if opponent threatens material
      let threatInfo = discThreat ? { desc: discThreat.desc } : null;
      if (!threatInfo && searchRes.threat && searchRes.threat.gain >= 150) {
        const thPiece = pieces.find(
          (p) =>
            p.col === searchRes.threat.fromCol &&
            p.row === searchRes.threat.fromRow &&
            p.color === oppColor,
        );
        const thTarget = pieces.find(
          (p) =>
            p.col === searchRes.threat.toCol &&
            p.row === searchRes.threat.toRow &&
            p.color === myColor,
        );
        if (thPiece && thTarget) {
          threatInfo = {
            desc: `${thPiece.name} địch đang dòm ngó ${thTarget.name} của bạn tại Lộ ${myColor === 0 ? 9 - thTarget.col : thTarget.col + 1}!`,
          };
        }
      }

      // Mate & Pre-Mate Threat Analysis (Offensive Climax & Defensive Danger)
      let mateThreat = null;
      if (
        topScore >= 9000 ||
        (plans[0] &&
          plans[0].tags.some(
            (t) =>
              t === "iron-gate" ||
              t === "resting-horse" ||
              t === "horse-cannon-mate" ||
              t === "face-king" ||
              t === "fishing-horse" ||
              t === "double-rook" ||
              t === "mate-threat" ||
              t === "Kẹp Cổ" ||
              t === "clamp-neck",
          )) ||
        (plans[0] && plans[0].name && plans[0].name.includes("Khóa Tướng"))
      ) {
        const mateSteps = Math.max(
          1,
          Math.ceil((10000 - Math.min(Math.max(topScore, 9000), 9999)) / 2),
        );
        const motifName =
          plans[0]?.name.split("·")[1]?.trim() ||
          plans[0]?.name ||
          "Sát Cục Tuyệt Kỹ";
        mateThreat = {
          type: "attack",
          motif: motifName,
          steps: mateSteps,
          title: `THẾ TRẬN TUYỆT SÁT [${motifName}]`,
          explanation: `Bạn đang nắm giữ thế sát [trong ${mateSteps} nước đi]! Tướng của bạn hoàn toàn an toàn, hãy đi chính xác theo gợi ý để kết liễu trận đấu!`,
        };
      } else if (topScore <= -300 || topScore <= -9000) {
        const oppMateSteps =
          topScore <= -9000
            ? Math.max(
                1,
                Math.ceil((10000 - Math.min(Math.abs(topScore), 9999)) / 2),
              )
            : null;
        mateThreat = {
          type: "defense",
          motif: "Hiểm Họa Tử Huyệt",
          steps: oppMateSteps,
          title: oppMateSteps
            ? `🚨 CẢNH BÁO TỬ HUYỆT: NGUY CƠ BỊ SÁT CỤC (${oppMateSteps} NƯỚC)!`
            : `🚨 CẢNH BÁO TỬ HUYỆT: NGUY CƠ BỊ SÁT CỤC!`,
          explanation: `Đối thủ đang dồn dập vây hãm cửu cung. Bắt buộc phải triển khai nước cờ phòng ngự ${
            plans[0]?.shortNotation || "cứu giá"
          } để hóa giải đòn sát của địch!`,
        };
        if (plans[0]) {
          plans[0].badge = "Cứu Mạng";
          if (!plans[0].tags.includes("emergency-defend")) {
            plans[0].tags.unshift("emergency-defend");
          }
        }
      } else if (discThreat) {
        mateThreat = {
          type: "defense",
          motif: "Chiếu Rút Nguy Hiểm",
          steps: 1,
          title: "🚨 CẢNH BÁO ĐÒN CHIẾU RÚT!",
          explanation: discThreat.desc,
        };
        if (plans[0]) {
          plans[0].badge = "Hóa Giải Chiếu Rút";
          if (!plans[0].tags.includes("emergency-defend")) {
            plans[0].tags.unshift("emergency-defend");
          }
        }
      }

      const openingInfo = detectXiangqiOpening(pieces, myColor);
      const currentMaxim = selectIntelligentMaxim(
        pieces,
        myColor,
        oppColor,
        phase,
        searchRes.score,
        inCheck,
        discThreat,
        plans,
        mateThreat,
      );

      return {
        phase,
        isMyTurn,
        myColor,
        oppColor,
        pieces,
        evalScore: searchRes.score,
        evalPoints,
        evalText,
        coachCommentary,
        commentary,
        threatInfo,
        mateThreat,
        plans,
        inCheck: inCheck,
        depth: searchRes.depth || 0,
        seldepth: searchRes.seldepth || 0,
        nodes: searchRes.nodes || 0,
        nps: searchRes.nps || 0,
        wdl: searchRes.wdl || plans[0]?.wdl || null,
        winrate: searchRes.winrate ?? plans[0]?.winrate ?? null,
        hardwareMeta: searchRes.hardwareMeta || null,
        isProgressive: Boolean(searchRes.isProgressive),
        isDeepThink: Boolean(searchRes.isDeepThink),
        openingName: openingInfo
          ? openingInfo.name
          : searchRes.openingName || null,
        openingInfo: openingInfo,
        evalBreakdown: searchRes.evalBreakdown || null,
        engineName:
          searchRes.engineName ||
          (activeProviderId === "pikafish"
            ? getEngineTransportStatus().type === "native-ws"
              ? "Pikafish NNUE (Native WS: 8765)"
              : "Pikafish 17 NNUE (Cloud)"
            : "AN Grandmaster JS"),
        pikafishStatus:
          searchRes.pikafishStatus ||
          (activeProviderId === "pikafish"
            ? getEngineTransportStatus().type
            : "js-engine"),
        ttHits: searchRes.ttHits || 0,
        maxim: currentMaxim,
        allMaxims: XIANGQI_MAXIMS,
        isQuickOnly: false,
      };
    } catch (err) {
      console.error("[AN Mod] Fatal error in buildTacticalAnalysis:", err);
      return null;
    }
  }

  // Asynchronous Deep Engine Search via Dedicated Background Web Worker / Pikafish Pro Streaming
  function triggerDeepAnalysis(gameData, pieces, extraOptions = {}) {
    if (!gameData || !pieces || pieces.length === 0) return;
    const myColor = gameData.myColor;
    const activeColor =
      gameData.gameLayer && gameData.gameLayer.Yc !== undefined
        ? gameData.gameLayer.Yc
        : myColor;
    const isMyTurn = activeColor === myColor;
    const isDeepThink = Boolean(extraOptions.isDeepThink);

    // QUY TẮC BẮT BUỘC: Kỳ Đạo Sư là Cố Vấn Tối Cao cho Người Chơi (Ta)!
    // Khi đang trong lượt của đối thủ (địch đang suy nghĩ trên bàn thật),
    // TUYỆT ĐỐI KHÔNG search biến cờ của địch (trừ khi user chủ động bấm Deep Think).
    if (!isMyTurn && !isDeepThink) {
      if (cancelWorkerSearch) {
        cancelWorkerSearch();
        cancelWorkerSearch = null;
      }
      return;
    }

    const currentHash = lastAnalysisHash;

    if (cancelWorkerSearch) {
      cancelWorkerSearch();
      cancelWorkerSearch = null;
    }

    if (cachedAnalysis && mentorSetter) {
      cachedAnalysis.searchStartTime = Date.now();
      mentorSetter(
        { ...cachedAnalysis, isSearching: true, isDeepThink },
        { preserveSelection: true },
      );
    }

    const isCoUp = Boolean(
      window.ZigaMod &&
      window.ZigaMod.isCoUpGame &&
      gameData &&
      gameData.gameLayer &&
      window.ZigaMod.isCoUpGame(gameData.gameLayer),
    );

    const pikaCfg =
      (window.ZigaMod &&
        window.ZigaMod.userSettings &&
        window.ZigaMod.userSettings.pikafishConfig) ||
      {};
    const configuredMultiPV = Math.max(
      3,
      Math.min(8, parseInt(pikaCfg.multiPV, 10) || 5),
    );
    const configuredTimeMs = Math.max(
      1200,
      Math.min(12000, parseInt(pikaCfg.thinkTimeMs, 10) || 3000),
    );
    const configuredMaxDepth = Math.max(
      20,
      Math.min(54, parseInt(pikaCfg.maxDepth, 10) || 36),
    );

    const effectiveTimeMs =
      activeProviderId === "pikafish"
        ? isDeepThink
          ? Math.max(8000, configuredTimeMs)
          : configuredTimeMs
        : isDeepThink
          ? 2000
          : 800;

    const effectiveMaxDepth =
      activeProviderId === "pikafish"
        ? isDeepThink
          ? Math.max(44, configuredMaxDepth)
          : configuredMaxDepth
        : isDeepThink
          ? 14
          : 12;

    // Luôn tính toán biến cờ cho Người Chơi (myColor)
    const sideToAnalyze = myColor;
    const provider = getEngineProvider(activeProviderId);
    let hasStreamedAtLeastOnce = false;

    cancelWorkerSearch = provider.analyzeAsync(
      {
        pieces,
        side: sideToAnalyze,
        maxDepth: effectiveMaxDepth,
        timeMs: effectiveTimeMs,
        multiPV: configuredMultiPV,
        isCoUp,
        isDeepThink,
        onProgress: (partialRes) => {
          try {
            if (lastAnalysisHash !== currentHash) return;
            if (
              !partialRes ||
              !partialRes.lines ||
              partialRes.lines.length === 0
            )
              return;
            const progAnalysis = buildTacticalAnalysis(
              partialRes,
              gameData,
              pieces,
            );
            if (
              !progAnalysis ||
              !progAnalysis.plans ||
              progAnalysis.plans.length === 0
            )
              return;
            progAnalysis.isSearching = true;
            progAnalysis.isProgressive = true;
            progAnalysis.isDeepThink = isDeepThink;
            progAnalysis.isQuickOnly = false;
            const preserve = hasStreamedAtLeastOnce || isDeepThink;
            hasStreamedAtLeastOnce = true;
            cachedAnalysis = progAnalysis;
            ZigaMod.lastEngineAnalysis = progAnalysis;
            updateMentorHudCardText(progAnalysis);
            if (mentorSetter) {
              mentorSetter(progAnalysis, { preserveSelection: preserve });
            }
          } catch (e) {}
        },
      },
      (err, searchRes) => {
        cancelWorkerSearch = null;
        try {
          if (err || !searchRes || searchRes.error) {
            console.warn(
              "[AN Mod] Background engine search error, retrying with emergency fallback:",
              err,
            );
            try {
              const fbRes = engine.analyze({
                pieces,
                side: sideToAnalyze,
                maxDepth: 5,
                timeMs: 250,
                multiPV: configuredMultiPV,
              });
              if (fbRes && !fbRes.error) {
                const fbDeep = buildTacticalAnalysis(fbRes, gameData, pieces);
                if (fbDeep) {
                  fbDeep.isSearching = false;
                  fbDeep.isQuickOnly = false;
                  cachedAnalysis = fbDeep;
                  updateMentorHudCardText(fbDeep);
                  if (mentorSetter) {
                    mentorSetter(fbDeep);
                  }
                  if (mentorPanelEl && mentorPanelEl.style.display !== "none") {
                    renderMentorFloatingContent(fbDeep);
                  }
                }
              }
            } catch (e) {}
            return;
          }

          // Drop stale results if board state changed during search
          if (lastAnalysisHash !== currentHash) return;

          let deepAnalysis = buildTacticalAnalysis(searchRes, gameData, pieces);
          if (
            !deepAnalysis ||
            !deepAnalysis.plans ||
            deepAnalysis.plans.length === 0
          ) {
            try {
              const fbRes = engine.analyze({
                pieces,
                side: sideToAnalyze,
                maxDepth: 5,
                timeMs: 250,
                multiPV: configuredMultiPV,
              });
              if (fbRes && !fbRes.error) {
                deepAnalysis = buildTacticalAnalysis(fbRes, gameData, pieces);
              }
            } catch (e) {}
          }

          if (!deepAnalysis) {
            return;
          }

          deepAnalysis.isSearching = false;
          deepAnalysis.isProgressive = false;
          deepAnalysis.isDeepThink = isDeepThink;
          deepAnalysis.isQuickOnly = false;
          cachedAnalysis = deepAnalysis;
          ZigaMod.lastEngineAnalysis = deepAnalysis;
          updateMentorHudCardText(deepAnalysis);

          if (mentorSetter) {
            mentorSetter(deepAnalysis, {
              preserveSelection: hasStreamedAtLeastOnce || isDeepThink,
            });
          }
          if (mentorPanelEl && mentorPanelEl.style.display !== "none") {
            renderMentorFloatingContent(deepAnalysis);
          }
        } catch (cbErr) {
          console.error(
            "[AN Mod] Uncaught error in triggerDeepAnalysis callback:",
            cbErr,
          );
        } finally {
          if (cachedAnalysis && cachedAnalysis.isSearching) {
            cachedAnalysis.isSearching = false;
            if (mentorSetter) {
              mentorSetter({ ...cachedAnalysis }, { preserveSelection: true });
            }
          }
        }
      },
    );
  }

  // Synchronous fallback (kept for external API compatibility)
  function analyzeTacticalMindset(gameData) {
    if (!gameData || !gameData.gameLayer) return null;
    const pieces = getBoardState(gameData.gameLayer);
    if (!pieces || pieces.length === 0) return null;

    const searchRes = engine.analyze({
      pieces,
      side: gameData.myColor,
      maxDepth: 5,
      timeMs: 260,
      multiPV: 3,
    });

    if (!searchRes || searchRes.error) return null;
    return buildTacticalAnalysis(searchRes, gameData, pieces);
  }

  // =========================================================================
  // Elegant Subdued Mini Xiangqi Chessboard Component (NO NEON SPIDERWEBS)
  // =========================================================================
  function MentorMiniBoard({
    pieces,
    myColor,
    activePlan,
    activeVariation,
    activeStep,
    setActiveStep,
  }) {
    // Dynamically position pieces based on the selected step
    const displayPieces = useMemo(() => {
      if (!pieces) return [];
      if (!activePlan || activeStep === 0) return pieces;

      let current = pieces.map((p) => ({ ...p }));
      const oppColor = 1 - myColor;

      const applyMove = (
        fromCol,
        fromRow,
        toCol,
        toRow,
        sideColor,
        flagKey,
      ) => {
        if (
          fromCol == null ||
          toCol == null ||
          fromRow == null ||
          toRow == null
        )
          return;
        current = current.filter(
          (p) => !(p.col === toCol && p.row === toRow && p.color !== sideColor),
        );
        const moving = current.find(
          (p) =>
            p.col === fromCol && p.row === fromRow && p.color === sideColor,
        );
        if (moving) {
          moving.col = toCol;
          moving.row = toRow;
          moving[flagKey] = true;
        }
      };

      // Step 1: Our Move
      if (activeStep >= 1) {
        applyMove(
          activePlan.fromCol,
          activePlan.fromRow,
          activePlan.toCol,
          activePlan.toRow,
          myColor,
          "isMyMove",
        );
      }

      // Step 2: Selected Opponent Variation Move
      if (activeStep >= 2 && activeVariation) {
        applyMove(
          activeVariation.fromCol,
          activeVariation.fromRow,
          activeVariation.toCol,
          activeVariation.toRow,
          oppColor,
          "isOppMove",
        );
      }

      // Step 3: Friendly Follow-Up Move
      if (activeStep >= 3 && activeVariation?.answer) {
        applyMove(
          activeVariation.answer.fromCol,
          activeVariation.answer.fromRow,
          activeVariation.answer.toCol,
          activeVariation.answer.toRow,
          myColor,
          "isFollowUpMove",
        );
      }

      // Step 4: Opponent Defense
      const step4 = activeVariation?.step4 || activePlan?.roadmap?.[3];
      if (activeStep >= 4 && step4) {
        applyMove(
          step4.fromCol,
          step4.fromRow,
          step4.toCol,
          step4.toRow,
          oppColor,
          "isOppStep4",
        );
      }

      // Step 5: Friendly Climax
      const step5 = activeVariation?.step5 || activePlan?.roadmap?.[4];
      if (activeStep >= 5 && step5) {
        applyMove(
          step5.fromCol,
          step5.fromRow,
          step5.toCol,
          step5.toRow,
          myColor,
          "isClimaxMove",
        );
      }

      // Steps 6..8+: Extended deep PV moves from Pikafish roadmap
      if (activeStep >= 6 && Array.isArray(activePlan?.roadmap)) {
        for (
          let s = 6;
          s <= Math.min(activeStep, activePlan.roadmap.length);
          s++
        ) {
          const rm = activePlan.roadmap[s - 1];
          if (rm) {
            applyMove(
              rm.fromCol,
              rm.fromRow,
              rm.toCol,
              rm.toRow,
              s % 2 === 1 ? myColor : oppColor,
              s % 2 === 1 ? "isClimaxMove" : "isOppStep4",
            );
          }
        }
      }

      return current;
    }, [pieces, activePlan, activeVariation, activeStep, myColor]);

    const getSquarePos = (col, row) => {
      if (col == null || row == null || isNaN(col) || isNaN(row)) {
        return null;
      }
      // Trên Ziga, người chơi luôn được hiển thị ở nửa dưới bàn cờ.
      // Khi người chơi là Đỏ (myColor === 0): hàng 0 ở đáy bàn cờ (displayRow = 9), cột 0 bên trái (displayCol = 0).
      // Khi người chơi là Đen (myColor === 1): trên Ziga bàn cờ đảo góc nhìn để quân Đen ở đáy (hàng 9),
      // nên displayRow = row và displayCol = 8 - col để mini-board khớp 1-1 với bàn cờ thật trên màn hình.
      const isBlack = myColor === 1;
      const displayRow = isBlack ? row : 9 - row;
      const displayCol = isBlack ? 8 - col : col;

      const x = ((25 + displayCol * 43.75) / 400) * 100;
      const y = ((25 + displayRow * 44.44) / 450) * 100;
      return { x, y };
    };

    // Calculate ONLY the arrow for the currently active step (prevents neon clutter!)
    const activeArrow = useMemo(() => {
      if (!activePlan) return null;

      let move = null;
      let color = "var(--primary, #06b6d4)";
      let marker = "url(#clean-arrow-blue)";
      let dashed = false;

      if (activeStep === 0 || activeStep === 1) {
        move = {
          fromCol: activePlan.fromCol,
          fromRow: activePlan.fromRow,
          toCol: activePlan.toCol,
          toRow: activePlan.toRow,
        };
        color = "var(--primary, #06b6d4)";
        marker = "url(#clean-arrow-blue)";
        dashed = false;
      } else if (activeStep === 2 && activeVariation) {
        move = {
          fromCol: activeVariation.fromCol,
          fromRow: activeVariation.fromRow,
          toCol: activeVariation.toCol,
          toRow: activeVariation.toRow,
        };
        color = "#f43f5e";
        marker = "url(#clean-arrow-red)";
        dashed = true;
      } else if (activeStep === 3 && activeVariation?.answer) {
        move = {
          fromCol: activeVariation.answer.fromCol,
          fromRow: activeVariation.answer.fromRow,
          toCol: activeVariation.answer.toCol,
          toRow: activeVariation.answer.toRow,
        };
        color = "#f59e0b";
        marker = "url(#clean-arrow-gold)";
        dashed = false;
      } else if (activeStep === 4) {
        const step4 = activeVariation?.step4 || activePlan?.roadmap?.[3];
        if (step4) {
          move = {
            fromCol: step4.fromCol,
            fromRow: step4.fromRow,
            toCol: step4.toCol,
            toRow: step4.toRow,
          };
          color = "#fb923c";
          marker = "url(#clean-arrow-orange)";
          dashed = true;
        }
      } else if (activeStep === 5) {
        const step5 = activeVariation?.step5 || activePlan?.roadmap?.[4];
        if (step5) {
          move = {
            fromCol: step5.fromCol,
            fromRow: step5.fromRow,
            toCol: step5.toCol,
            toRow: step5.toRow,
          };
          color = "#10b981";
          marker = "url(#clean-arrow-emerald)";
          dashed = false;
        }
      } else if (activeStep >= 6) {
        const rm = activePlan?.roadmap?.[activeStep - 1];
        if (rm) {
          move = {
            fromCol: rm.fromCol,
            fromRow: rm.fromRow,
            toCol: rm.toCol,
            toRow: rm.toRow,
          };
          const isMyStep = activeStep % 2 === 1;
          color = isMyStep ? "#10b981" : "#fb923c";
          marker = isMyStep
            ? "url(#clean-arrow-emerald)"
            : "url(#clean-arrow-orange)";
          dashed = !isMyStep;
        }
      }

      if (
        !move ||
        move.fromCol == null ||
        move.toCol == null ||
        move.fromRow == null ||
        move.toRow == null
      ) {
        return null;
      }

      const s = getSquarePos(move.fromCol, move.fromRow);
      const e = getSquarePos(move.toCol, move.toRow);
      if (!s || !e) return null;

      return {
        x1: s.x,
        y1: s.y,
        x2: e.x,
        y2: e.y,
        color,
        marker,
        dashed,
      };
    }, [activePlan, activeVariation, activeStep, myColor]);

    // Active origin & target rings
    const targetRingPos = useMemo(() => {
      if (!activePlan) return null;
      if (activeStep === 0 || activeStep === 1)
        return getSquarePos(activePlan.toCol, activePlan.toRow);
      if (activeStep === 2 && activeVariation)
        return getSquarePos(activeVariation.toCol, activeVariation.toRow);
      if (activeStep === 3 && activeVariation?.answer)
        return getSquarePos(
          activeVariation.answer.toCol,
          activeVariation.answer.toRow,
        );
      if (activeStep === 4) {
        const st4 = activeVariation?.step4 || activePlan?.roadmap?.[3];
        return st4 ? getSquarePos(st4.toCol, st4.toRow) : null;
      }
      if (activeStep === 5) {
        const st5 = activeVariation?.step5 || activePlan?.roadmap?.[4];
        return st5 ? getSquarePos(st5.toCol, st5.toRow) : null;
      }
      if (activeStep >= 6) {
        const rm = activePlan?.roadmap?.[activeStep - 1];
        return rm ? getSquarePos(rm.toCol, rm.toRow) : null;
      }
      return null;
    }, [activePlan, activeVariation, activeStep, myColor]);

    const originRingPos = useMemo(() => {
      if (!activePlan) return null;
      if (activeStep === 0 || activeStep === 1)
        return getSquarePos(activePlan.fromCol, activePlan.fromRow);
      if (activeStep === 2 && activeVariation)
        return getSquarePos(activeVariation.fromCol, activeVariation.fromRow);
      if (activeStep === 3 && activeVariation?.answer)
        return getSquarePos(
          activeVariation.answer.fromCol,
          activeVariation.answer.fromRow,
        );
      if (activeStep === 4) {
        const st4 = activeVariation?.step4 || activePlan?.roadmap?.[3];
        return st4 ? getSquarePos(st4.fromCol, st4.fromRow) : null;
      }
      if (activeStep === 5) {
        const st5 = activeVariation?.step5 || activePlan?.roadmap?.[4];
        return st5 ? getSquarePos(st5.fromCol, st5.fromRow) : null;
      }
      if (activeStep >= 6) {
        const rm = activePlan?.roadmap?.[activeStep - 1];
        return rm ? getSquarePos(rm.fromCol, rm.fromRow) : null;
      }
      return null;
    }, [activePlan, activeVariation, activeStep, myColor]);

    return (
      <div className="flex flex-col gap-1.5">
        {/* SVG Board */}
        <div
          className="relative mx-auto aspect-400/450 w-full max-w-62.5 overflow-hidden rounded-xl border shadow-md select-none"
          style={{
            background: "#1c1814",
            borderColor: "rgba(100, 75, 45, 0.4)",
          }}
        >
          <svg
            viewBox="0 0 400 450"
            className="pointer-events-none absolute inset-0 size-full"
          >
            <defs>
              <marker
                id="clean-arrow-blue"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path
                  d="M 0 1.5 L 9 5 L 0 8.5 z"
                  fill="var(--primary, #06b6d4)"
                />
              </marker>
              <marker
                id="clean-arrow-red"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#f43f5e" />
              </marker>
              <marker
                id="clean-arrow-gold"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#f59e0b" />
              </marker>
              <marker
                id="clean-arrow-orange"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#fb923c" />
              </marker>
              <marker
                id="clean-arrow-emerald"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#10b981" />
              </marker>
            </defs>

            {/* Outlines */}
            <rect
              x="20"
              y="20"
              width="360"
              height="410"
              fill="none"
              stroke="#4a3622"
              strokeWidth="2"
            />
            <rect
              x="25"
              y="25"
              width="350"
              height="400"
              fill="none"
              stroke="#684f32"
              strokeWidth="1"
            />

            {/* Grid Lines */}
            {Array.from({ length: 10 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1="25"
                y1={25 + i * 44.44}
                x2="375"
                y2={25 + i * 44.44}
                stroke="#52402e"
                strokeWidth="0.9"
              />
            ))}

            {Array.from({ length: 9 }).map((_, i) => {
              const x = 25 + i * 43.75;
              if (i === 0 || i === 8) {
                return (
                  <line
                    key={`v-${i}`}
                    x1={x}
                    y1="25"
                    x2={x}
                    y2="425"
                    stroke="#52402e"
                    strokeWidth="0.9"
                  />
                );
              }
              return (
                <React.Fragment key={`v-${i}`}>
                  <line
                    x1={x}
                    y1="25"
                    x2={x}
                    y2={25 + 4 * 44.44}
                    stroke="#52402e"
                    strokeWidth="0.9"
                  />
                  <line
                    x1={x}
                    y1={25 + 5 * 44.44}
                    x2={x}
                    y2="425"
                    stroke="#52402e"
                    strokeWidth="0.9"
                  />
                </React.Fragment>
              );
            })}

            {/* Palaces */}
            <line
              x1={25 + 3 * 43.75}
              y1="25"
              x2={25 + 5 * 43.75}
              y2={25 + 2 * 44.44}
              stroke="#52402e"
              strokeWidth="0.9"
            />
            <line
              x1={25 + 5 * 43.75}
              y1="25"
              x2={25 + 3 * 43.75}
              y2={25 + 2 * 44.44}
              stroke="#52402e"
              strokeWidth="0.9"
            />
            <line
              x1={25 + 3 * 43.75}
              y1={25 + 7 * 44.44}
              x2={25 + 5 * 43.75}
              y2="425"
              stroke="#52402e"
              strokeWidth="0.9"
            />
            <line
              x1={25 + 5 * 43.75}
              y1={25 + 7 * 44.44}
              x2={25 + 3 * 43.75}
              y2="425"
              stroke="#52402e"
              strokeWidth="0.9"
            />

            {/* River Text */}
            <text
              x="100"
              y={25 + 4.7 * 44.44}
              fill="#826644"
              fontSize="12"
              fontFamily="serif"
              textAnchor="middle"
              opacity="0.6"
            >
              楚 河
            </text>
            <text
              x="300"
              y={25 + 4.7 * 44.44}
              fill="#826644"
              fontSize="12"
              fontFamily="serif"
              textAnchor="middle"
              opacity="0.6"
            >
              漢 界
            </text>

            {/* Single Active Arrow (Crisp & Clean) */}
            {activeArrow && (
              <line
                x1={`${activeArrow.x1}%`}
                y1={`${activeArrow.y1}%`}
                x2={`${activeArrow.x2}%`}
                y2={`${activeArrow.y2}%`}
                stroke={activeArrow.color}
                strokeWidth="2.8"
                strokeDasharray={activeArrow.dashed ? "4 3" : undefined}
                strokeLinecap="round"
                markerEnd={activeArrow.marker}
                style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.7))" }}
              />
            )}
          </svg>

          {/* Clean Target & Origin Highlights (NO OPAQUE DISKS) */}
          {originRingPos && (
            <div
              className="ring-1.5 pointer-events-none absolute size-6 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full ring-emerald-400/80"
              style={{
                left: `${originRingPos.x}%`,
                top: `${originRingPos.y}%`,
              }}
            />
          )}
          {targetRingPos && (
            <div
              className="pointer-events-none absolute size-6 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full ring-2 ring-cyan-400/80"
              style={{
                left: `${targetRingPos.x}%`,
                top: `${targetRingPos.y}%`,
                backgroundColor: "rgba(6, 182, 212, 0.15)",
              }}
            />
          )}

          {/* Living Pieces */}
          {displayPieces.map((p) => {
            const pos = getSquarePos(p.col, p.row);
            if (!pos) return null;
            const isRed = p.color === 0;
            const isUnopened = p.unopened || p.ac === 0;

            let borderStyle = "";
            if (isUnopened) {
              borderStyle =
                "border border-amber-600/70 bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 text-amber-300 shadow-md";
            } else if (isRed) {
              borderStyle =
                "border border-red-500/80 bg-stone-100 text-red-600 font-serif";
            } else {
              borderStyle =
                "border border-zinc-700 bg-zinc-900 text-zinc-100 font-serif";
            }

            if (p.isMyMove) borderStyle += " ring-2 ring-cyan-400 z-20";
            else if (p.isOppMove) borderStyle += " ring-2 ring-rose-500 z-20";
            else if (p.isFollowUpMove)
              borderStyle += " ring-2 ring-amber-400 z-20";
            else if (p.isOppStep4)
              borderStyle += " ring-2 ring-orange-400 z-20";
            else if (p.isClimaxMove)
              borderStyle += " ring-2 ring-emerald-400 z-20";

            return (
              <div
                key={`${p.index}-${p.col}-${p.row}`}
                className={`absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-bold shadow-sm transition-all duration-300 ${borderStyle}`}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                <span
                  className={`leading-none select-none ${isUnopened ? "font-sans text-[9px] font-black tracking-tighter text-amber-300" : "font-serif text-[11px]"}`}
                >
                  {isUnopened ? "ÚP" : p.char}
                </span>
              </div>
            );
          })}
        </div>

        {/* Stepper Buttons (6 buttons to walk through the active 5-step line) */}
        <div className="grid grid-cols-6 gap-1 pt-0.5">
          <Button
            variant="ghost"
            size="xs"
            className={cn(
              "flex h-6 items-center justify-center gap-0.5 rounded-md border px-1 text-[9px] font-medium transition-all",
              activeStep === 0
                ? "border-cyan-400/60 bg-cyan-500/20 font-bold text-cyan-300 shadow-xs"
                : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white",
            )}
            onClick={() => setActiveStep(0)}
            title="Xem thế cờ thực tế hiện tại"
          >
            <RotateCcw className="size-2.5 shrink-0" />
            <span>Ván thật</span>
          </Button>
          <Button
            variant="ghost"
            size="xs"
            disabled={!activePlan}
            className={cn(
              "flex h-6 items-center justify-center gap-0.5 rounded-md border px-1 text-[9px] font-medium transition-all",
              activeStep === 1
                ? "border-cyan-400/60 bg-cyan-500/20 font-bold text-cyan-300 shadow-xs"
                : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white",
              !activePlan &&
                "cursor-not-allowed border-white/5 bg-transparent opacity-30",
            )}
            onClick={() => setActiveStep(1)}
            title="1. Ta đi: Nước cờ tối ưu đề xuất"
          >
            <Play className="size-2.5 shrink-0 text-cyan-400" />
            <span>1. Ta</span>
          </Button>
          <Button
            variant="ghost"
            size="xs"
            disabled={!activeVariation || activeVariation.fromCol == null}
            className={cn(
              "flex h-6 items-center justify-center gap-0.5 rounded-md border px-1 text-[9px] font-medium transition-all",
              activeStep === 2
                ? "border-rose-400/60 bg-rose-500/20 font-bold text-rose-300 shadow-xs"
                : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white",
              (!activeVariation || activeVariation.fromCol == null) &&
                "cursor-not-allowed border-white/5 bg-transparent opacity-30",
            )}
            onClick={() => setActiveStep(2)}
            title="2. Địch: Nước phản ứng dự kiến của đối phương"
          >
            <Swords className="size-2.5 shrink-0 text-rose-400" />
            <span>2. Địch</span>
          </Button>
          <Button
            variant="ghost"
            size="xs"
            disabled={
              !activeVariation?.answer || activeVariation.answer.fromCol == null
            }
            className={cn(
              "flex h-6 items-center justify-center gap-0.5 rounded-md border px-1 text-[9px] font-medium transition-all",
              activeStep === 3
                ? "border-amber-400/60 bg-amber-500/20 font-bold text-amber-300 shadow-xs"
                : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white",
              (!activeVariation?.answer ||
                activeVariation.answer.fromCol == null) &&
                "cursor-not-allowed border-white/5 bg-transparent opacity-30",
            )}
            onClick={() => setActiveStep(3)}
            title="3. Ta bồi: Nước bồi đòn khai thác sơ hở"
          >
            <Sparkles className="size-2.5 shrink-0 text-amber-400" />
            <span>3. Bồi</span>
          </Button>
          <Button
            variant="ghost"
            size="xs"
            disabled={!activeVariation?.step4 && !activePlan?.roadmap?.[3]}
            className={cn(
              "flex h-6 items-center justify-center gap-0.5 rounded-md border px-1 text-[9px] font-medium transition-all",
              activeStep === 4
                ? "border-orange-400/60 bg-orange-500/20 font-bold text-orange-300 shadow-xs"
                : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white",
              !activeVariation?.step4 &&
                !activePlan?.roadmap?.[3] &&
                "cursor-not-allowed border-white/5 bg-transparent opacity-30",
            )}
            onClick={() => setActiveStep(4)}
            title="4. Địch đỡ: Đối phương xoay sở chống đỡ"
          >
            <Shield className="size-2.5 shrink-0 text-orange-400" />
            <span>4. Đỡ</span>
          </Button>
          <Button
            variant="ghost"
            size="xs"
            disabled={!activeVariation?.step5 && !activePlan?.roadmap?.[4]}
            className={cn(
              "flex h-6 items-center justify-center gap-0.5 rounded-md border px-1 text-[9px] font-medium transition-all",
              activeStep === 5
                ? "border-emerald-400/60 bg-emerald-500/20 font-bold text-emerald-300 shadow-xs"
                : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white",
              !activeVariation?.step5 &&
                !activePlan?.roadmap?.[4] &&
                "cursor-not-allowed border-white/5 bg-transparent opacity-30",
            )}
            onClick={() => setActiveStep(5)}
            title="5. Dứt điểm: Nước đoạt ưu thế hoặc sát cục"
          >
            <Trophy className="size-2.5 shrink-0 text-emerald-400" />
            <span>5. Sát</span>
          </Button>
        </div>

        {/* Extended Deep Steps 6..8 (when Pikafish PV has >= 6 plies) */}
        {activePlan?.roadmap && activePlan.roadmap.length > 5 && (
          <div className="grid grid-cols-3 gap-1">
            {activePlan.roadmap.slice(5, 8).map((rm) => {
              const isMyStep = rm.step % 2 === 1;
              return (
                <Button
                  key={rm.step}
                  variant="ghost"
                  size="xs"
                  className={cn(
                    "flex h-5.5 items-center justify-center gap-0.5 rounded-md border px-1 text-[8.5px] font-medium transition-all",
                    activeStep === rm.step
                      ? isMyStep
                        ? "border-emerald-400/60 bg-emerald-500/20 font-bold text-emerald-300 shadow-xs"
                        : "border-orange-400/60 bg-orange-500/20 font-bold text-orange-300 shadow-xs"
                      : "border-white/10 bg-white/4 text-zinc-300 hover:bg-white/10 hover:text-white",
                  )}
                  onClick={() => setActiveStep(rm.step)}
                  title={`${rm.label}: ${rm.notation?.full || rm.notation?.short || ""}`}
                >
                  <span>
                    {rm.step}.{" "}
                    {rm.notation?.short || (isMyStep ? "Ta" : "Địch")}
                  </span>
                </Button>
              );
            })}
          </div>
        )}

        {/* Step context subtitle below stepper buttons */}
        <div className="flex min-h-4.75 items-center rounded border border-white/6 bg-white/3 px-1.5 py-0.5 text-[9.5px] leading-tight">
          {(activeStep === 0 || !activePlan) && (
            <span className="text-muted-foreground font-medium">
              Bàn cờ thực tế hiện tại
            </span>
          )}
          {activeStep === 1 && activePlan && (
            <span className="truncate font-semibold text-cyan-400">
              1. Ta đi: <strong>{activePlan.shortNotation}</strong> (
              {activePlan.fullNotation})
            </span>
          )}
          {activeStep === 2 && activeVariation && (
            <span className="truncate font-semibold text-rose-400">
              2. Địch đáp:{" "}
              <strong>{activeVariation.oppNotation?.short || "Nước đi"}</strong>{" "}
              — {activeVariation.oppWhy}
            </span>
          )}
          {activeStep === 3 && activeVariation?.answer && (
            <span className="truncate font-semibold text-amber-400">
              3. Ta bồi:{" "}
              <strong>
                {activeVariation.answer.notation?.short || "Nước cờ"}
              </strong>{" "}
              — {activeVariation.answer.why}
            </span>
          )}
          {activeStep === 4 && (
            <span className="truncate font-semibold text-orange-400">
              4. Địch đỡ:{" "}
              <strong>
                {activePlan?.roadmap?.[3]?.notation?.short || "Phòng thủ"}
              </strong>{" "}
              —{" "}
              {activePlan?.roadmap?.[3]?.why ||
                "Địch xoay sở chống đỡ trước vòng vây"}
            </span>
          )}
          {activeStep === 5 && (
            <span className="truncate font-semibold text-emerald-400">
              5. Dứt điểm:{" "}
              <strong>
                {activePlan?.roadmap?.[4]?.notation?.short || "Đoạt thế"}
              </strong>{" "}
              —{" "}
              {activePlan?.roadmap?.[4]?.why ||
                "Giáng đòn đoạt thắng lợi quyết định!"}
            </span>
          )}
          {activeStep >= 6 && activePlan?.roadmap?.[activeStep - 1] && (
            <span
              className={`truncate font-semibold ${
                activeStep % 2 === 1 ? "text-emerald-400" : "text-orange-400"
              }`}
            >
              {activePlan.roadmap[activeStep - 1].label}:{" "}
              <strong>
                {activePlan.roadmap[activeStep - 1].notation?.short || ""}
              </strong>{" "}
              — {activePlan.roadmap[activeStep - 1].why}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Tactical badge classifier for Grandmaster Engine & Pikafish tags
  function getTacticalBadgeProps(tag) {
    switch (tag) {
      case "hollow-cannon":
        return {
          label: "Pháo Trống",
          color: "border-red-500/40 text-red-400 bg-red-500/15",
          icon: Sparkles,
        };
      case "central-cannon":
        return {
          label: "Pháo Đầu",
          color: "border-amber-500/40 text-amber-300 bg-amber-500/15",
          icon: Crosshair,
        };
      case "sacrifice":
        return {
          label: "Phế Quân",
          color: "border-purple-500/40 text-purple-300 bg-purple-500/15",
          icon: Zap,
        };
      case "open-file-rook":
        return {
          label: "Lộ Thông Xe",
          color: "border-emerald-500/40 text-emerald-300 bg-emerald-500/15",
          icon: TrendingUp,
        };
      case "knight-block":
        return {
          label: "Cản Chân Mã",
          color: "border-yellow-500/40 text-yellow-300 bg-yellow-500/15",
          icon: ShieldAlert,
        };
      case "guard-break":
        return {
          label: "Phá Sĩ/Tượng",
          color: "border-pink-500/40 text-pink-300 bg-pink-500/15",
          icon: Swords,
        };
      case "checks":
        return {
          label: "Chiếu Tướng",
          color: "border-cyan-500/40 text-cyan-300 bg-cyan-500/15",
          icon: Zap,
        };
      case "capture":
        return {
          label: "Đoạt Quân",
          color: "border-blue-500/40 text-blue-300 bg-blue-500/15",
          icon: Trophy,
        };
      case "iron-gate":
        return {
          label: "Thiết Môn Khảm",
          color:
            "border-amber-400/50 text-amber-300 bg-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.25)]",
          icon: Trophy,
        };
      case "resting-horse":
        return {
          label: "Mã Ngọa Tào",
          color:
            "border-amber-400/50 text-amber-300 bg-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.25)]",
          icon: Trophy,
        };
      case "horse-cannon-mate":
        return {
          label: "Mã Hậu Pháo",
          color:
            "border-amber-400/50 text-amber-300 bg-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.25)]",
          icon: Trophy,
        };
      case "fishing-horse":
        return {
          label: "Điếu Ngư Mã",
          color:
            "border-amber-400/50 text-amber-300 bg-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.25)]",
          icon: Trophy,
        };
      case "face-king":
        return {
          label: "Bạch Kiểm Tướng",
          color:
            "border-amber-400/50 text-amber-300 bg-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.25)]",
          icon: Trophy,
        };
      case "double-rook":
        return {
          label: "Song Xe Bào",
          color:
            "border-amber-400/50 text-amber-300 bg-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.25)]",
          icon: Trophy,
        };
      case "mate-threat":
        return {
          label: "Tuyệt Sát",
          color:
            "border-amber-400/50 text-amber-300 bg-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.25)]",
          icon: Trophy,
        };
      case "emergency-defend":
        return {
          label: "Cứu Mạng",
          color:
            "border-rose-500/60 text-rose-300 bg-rose-500/25 shadow-[0_0_8px_rgba(244,63,94,0.3)]",
          icon: ShieldAlert,
        };
      default:
        return {
          label: tag,
          color: "border-white/10 text-slate-300 bg-white/5",
          icon: Sparkles,
        };
    }
  }

  // 5-Pillar Grandmaster Evaluation Breakdown Tab
  function EvaluationBreakdownTab({ breakdown, score, phase }) {
    if (!breakdown) {
      return (
        <div className="text-muted-foreground/80 flex flex-col items-center justify-center p-6 text-center">
          <BrainCircuit className="mb-2 size-6 text-cyan-400" />
          <span className="text-foreground text-xs font-semibold">
            Chưa có dữ liệu 5 Trụ Cột
          </span>
          <span className="text-muted-foreground mt-1 text-[10px]">
            Dữ liệu bóc tách hình thế sẽ tự động hiển thị khi động cơ phân tích
            xong thế trận.
          </span>
        </div>
      );
    }

    const pillars = [
      {
        key: "material",
        name: "Lực Lượng (Material)",
        desc: "Chênh lệch quân lực thực tế giữa hai bên",
        val: breakdown.material || 0,
        icon: Trophy,
        color: "text-blue-400",
      },
      {
        key: "positional",
        name: "Thế Trận & Điểm Huyệt",
        desc: "Khống chế các vị trí trọng yếu trên bàn cờ",
        val: breakdown.positional || 0,
        icon: Compass,
        color: "text-indigo-400",
      },
      {
        key: "kingSafety",
        name: "An Toàn Cung Tướng",
        desc: "Bộ Sĩ Tượng liên hoàn & phòng thủ cung",
        val: breakdown.kingSafety || 0,
        icon: Shield,
        color: "text-emerald-400",
      },
      {
        key: "mobility",
        name: "Độ Cơ Động (Xe & Mã)",
        desc: "Xe chiếm lộ thông & Mã không bị cản chân",
        val: breakdown.mobility || 0,
        icon: TrendingUp,
        color: "text-amber-400",
      },
      {
        key: "cannonTactics",
        name: "Chiến Thuật Pháo",
        desc: "Pháo đầu trấn áp & Pháo trống uy hiếp",
        val: breakdown.cannonTactics || 0,
        icon: Sparkles,
        color: "text-red-400",
      },
    ];

    return (
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/3 p-2 text-[10px]">
          <span className="text-muted-foreground font-medium">
            Tổng điểm thế trận:
          </span>
          <span
            className={`font-mono font-bold ${score >= 0 ? "text-emerald-400" : "text-rose-400"}`}
          >
            {score > 0 ? `+${score}` : score} điểm ({phase})
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {pillars.map((pil) => {
            const Icon = pil.icon;
            const isAdv = pil.val > 0;
            const isDis = pil.val < 0;
            const widthPct = Math.min(
              100,
              Math.max(8, Math.abs(pil.val) * 1.5),
            );

            return (
              <div
                key={pil.key}
                className="flex flex-col gap-1 rounded-lg border border-white/6 bg-black/20 p-2 text-[10px]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`size-3.5 ${pil.color}`} />
                    <span className="text-foreground/90 font-semibold">
                      {pil.name}
                    </span>
                  </div>
                  <span
                    className={`font-mono font-bold ${
                      isAdv
                        ? "text-emerald-400"
                        : isDis
                          ? "text-rose-400"
                          : "text-muted-foreground"
                    }`}
                  >
                    {pil.val > 0 ? `+${pil.val}` : pil.val}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/6">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isAdv
                        ? "bg-emerald-500"
                        : isDis
                          ? "bg-rose-500"
                          : "bg-white/20"
                    }`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
                <span className="text-muted-foreground/80 text-[9px] leading-tight">
                  {pil.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // React Error Boundary to Prevent Mentor Crash
  // =========================================================================
  class MentorErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      console.error(
        "[AN Mod] Mentor Coach Error caught by boundary:",
        error,
        errorInfo,
      );
    }

    componentDidUpdate(prevProps) {
      if (
        this.state.hasError &&
        prevProps.initialAnalysis !== this.props.initialAnalysis
      ) {
        this.setState({ hasError: false, error: null });
      }
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-rose-500/40 bg-zinc-950/95 p-4 text-center text-rose-300 shadow-2xl backdrop-blur-md">
            <AlertTriangle className="size-6 animate-pulse text-rose-400" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-bold text-white">
                Đã xảy ra gián đoạn giao diện
              </span>
              <span className="text-muted-foreground text-[9.5px]">
                Kỳ Đạo Sư đã tự động bảo vệ dữ liệu để không làm vỡ trận cờ.
              </span>
            </div>
            <Button
              size="xs"
              variant="outline"
              className="mt-1 h-6 border-white/20 text-[9.5px] hover:bg-white/10"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Khôi phục giao diện
            </Button>
          </div>
        );
      }
      return this.props.children;
    }
  }

  // =========================================================================
  // Main AI Mentor Floating Panel Component (Compact & Studio Modes)
  // =========================================================================
  function MentorFloatingPanel({ initialAnalysis, onClose }) {
    const [analysis, setAnalysis] = useState(initialAnalysis);
    const [tab, setTab] = useState("plans");
    const [selectedPlanIdx, setSelectedPlanIdx] = useState(0);
    const [activeVariationIdx, setActiveVariationIdx] = useState(0);
    const [activeStep, setActiveStep] = useState(1);
    const [engineId, setEngineId] = useState(activeProviderId);
    const [liveTransport, setLiveTransport] = useState(() =>
      getEngineTransportStatus(),
    );

    useEffect(() => {
      const handleStatusChange = (e) => {
        setLiveTransport(e.detail || getEngineTransportStatus());
      };

      const handleConfigChange = () => {
        if (lastKnownGameData) {
          const pcs = getBoardState(lastKnownGameData.gameLayer);
          if (pcs) triggerDeepAnalysis(lastKnownGameData, pcs);
        }
      };

      window.addEventListener(
        "ZIGA_PIKAFISH_STATUS_CHANGE",
        handleStatusChange,
      );
      window.addEventListener(
        "ZIGA_PIKAFISH_CONFIG_CHANGE",
        handleConfigChange,
      );
      const pollTimer = setInterval(() => {
        setLiveTransport(getEngineTransportStatus());
      }, 1000);

      return () => {
        window.removeEventListener(
          "ZIGA_PIKAFISH_STATUS_CHANGE",
          handleStatusChange,
        );
        window.removeEventListener(
          "ZIGA_PIKAFISH_CONFIG_CHANGE",
          handleConfigChange,
        );
        clearInterval(pollTimer);
      };
    }, [engineId]);

    const handleToggleEngine = () => {
      const nextEngine = engineId === "js-engine" ? "pikafish" : "js-engine";
      activeProviderId = nextEngine;
      setEngineProvider(nextEngine);
      setEngineId(nextEngine);
      if (lastKnownGameData) {
        const pcs = getBoardState(lastKnownGameData.gameLayer);
        if (pcs) triggerDeepAnalysis(lastKnownGameData, pcs);
      }
    };

    const handleDeepThink = () => {
      if (lastKnownGameData) {
        const pcs = getBoardState(lastKnownGameData.gameLayer);
        if (pcs) {
          triggerDeepAnalysis(lastKnownGameData, pcs, { isDeepThink: true });
        }
      }
    };

    // View modes: isCompact (true by default - non-blocking 380px) vs Studio (false - dual pane 640px)
    const [isCompact, setIsCompact] = useState(() => {
      try {
        const saved = localStorage.getItem("ziga_mentor_compact");
        if (saved !== null) return saved === "true";
      } catch (e) {}
      return true; // Default to COMPACT to NEVER cover the chessboard!
    });

    const [showMiniBoardInCompact, setShowMiniBoardInCompact] = useState(() => {
      try {
        const saved = localStorage.getItem("ziga_mentor_show_mini_board");
        if (saved !== null) return saved === "true";
      } catch (e) {}
      return true; // Mặc định luôn bật bàn cờ nhỏ khi mở Kỳ Đạo Sư
    });

    mentorSetter = (nextAnalysis, opts = {}) => {
      if (nextAnalysis) {
        setAnalysis(nextAnalysis);
        if (!opts || !opts.preserveSelection) {
          setSelectedPlanIdx(0);
          setActiveVariationIdx(0);
          setActiveStep(1);
        }
      }
    };

    const activePlan =
      analysis?.plans?.[selectedPlanIdx] || analysis?.plans?.[0] || null;
    const activeVariation =
      activePlan?.variations?.[activeVariationIdx] ||
      activePlan?.variations?.[0] ||
      null;

    const toggleCompactMode = () => {
      setIsCompact((prev) => {
        const next = !prev;
        try {
          localStorage.setItem("ziga_mentor_compact", String(next));
        } catch (e) {}
        return next;
      });
    };

    if (!analysis) {
      return (
        <Card className="ziga-mentor-panel-card border-border/80 w-85 shadow-2xl backdrop-blur-2xl">
          <div className="ziga-mentor-drag-handle border-border/30 flex shrink-0 cursor-move items-center justify-between border-b bg-white/2 px-3.5 py-2.5 select-none">
            <div className="flex items-center gap-2">
              <div
                className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/10"
                style={{ background: "rgba(255, 255, 255, 0.05)" }}
              >
                <GraduationCap className="size-4 text-cyan-400" />
              </div>
              <span className="text-foreground text-xs font-bold tracking-wider whitespace-nowrap uppercase">
                Tà Đạo Sư
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground size-7 rounded-lg"
            >
              <X className="size-3.5" />
            </Button>
          </div>
          <CardContent className="text-muted-foreground p-5 text-center text-xs">
            Đang tính toán nước cờ... Vui lòng vào ván đấu để AI phân tích.
          </CardContent>
        </Card>
      );
    }

    const panelWidth = isCompact ? 390 : 640;

    return (
      <Card
        className="ziga-mentor-panel-card border-border/80 relative flex flex-col overflow-hidden rounded-2xl shadow-2xl backdrop-blur-2xl transition-all duration-200"
        style={{
          width: `${panelWidth}px`,
          maxWidth: "96vw",
          maxHeight: "90vh",
          background: "var(--popover, rgba(18, 20, 26, 0.92))",
          borderColor: "rgba(255, 255, 255, 0.12)",
        }}
      >
        {/* TẦNG 1: HEADER (Thanh Tiêu Đề & Nút Điều Khiển Tinh Gọn, Không Tràn Viền) */}

        <div className="ziga-mentor-drag-handle border-border/30 flex shrink-0 cursor-move items-center justify-between border-b bg-white/2 px-3 py-2 select-none">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div
              className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/10 shadow-xs"
              style={{ background: "rgba(255, 255, 255, 0.06)" }}
            >
              <GraduationCap className="size-4 text-cyan-400" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <span className="text-foreground shrink-0 text-xs font-bold tracking-wider uppercase">
                  Tà Đạo Sư
                </span>
              </div>
              <div className="flex flex-col items-start justify-center gap-1">
                <div className="text-muted-foreground mt-0.5 flex items-center gap-1 truncate overflow-hidden text-[9px] whitespace-nowrap">
                  <span
                    className="py-0.2 text-muted-foreground/90 shrink-0 rounded border border-white/8 px-1 font-medium"
                    style={{ background: "rgba(255, 255, 255, 0.04)" }}
                  >
                    {analysis.phase}
                  </span>
                  <span>•</span>
                  <span className="inline-flex shrink-0 items-center gap-1 font-medium">
                    {analysis.isMyTurn ? (
                      <>
                        <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                        <span className="font-semibold text-emerald-400">
                          Bạn
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="bg-muted-foreground/50 size-1.5 rounded-full" />
                        <span>Đối thủ</span>
                      </>
                    )}
                  </span>
                  <span>•</span>
                  <span className="inline-flex shrink-0 items-center gap-1 font-medium">
                    <span
                      className={`size-2 rounded-full border ${
                        analysis.myColor === 0
                          ? "border-red-400 bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]"
                          : "border-zinc-500 bg-zinc-800 shadow-[0_0_4px_rgba(0,0,0,0.5)]"
                      }`}
                    />
                    <span>{analysis.myColor === 0 ? "Phe Đỏ" : "Phe Đen"}</span>
                  </span>
                </div>
                <div className="flex flex-row justify-center gap-0.5">
                  <span
                    className={`py-0.2 inline-flex shrink-0 items-center gap-0.5 rounded border px-1.5 font-mono text-[9px] font-semibold whitespace-nowrap ${
                      analysis.evalScore >= 50
                        ? "border-emerald-500/30 text-emerald-400"
                        : analysis.evalScore <= -50
                          ? "border-rose-500/30 text-rose-400"
                          : "border-white/10 text-slate-300"
                    }`}
                    style={{
                      background:
                        analysis.evalScore >= 50
                          ? "rgba(16, 185, 129, 0.1)"
                          : analysis.evalScore <= -50
                            ? "rgba(244, 63, 94, 0.1)"
                            : "rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    {analysis.evalScore >= 50 ? (
                      <TrendingUp className="size-2.5" />
                    ) : analysis.evalScore <= -50 ? (
                      <TrendingDown className="size-2.5" />
                    ) : (
                      <Equal className="size-2.5" />
                    )}
                    <span>{analysis.evalText}</span>
                  </span>
                  {/* Live Engine Status Badge */}
                  {(() => {
                    const status =
                      engineId === "pikafish"
                        ? liveTransport.type
                        : "js-engine";
                    if (engineId === "pikafish") {
                      if (status === "native-ws") {
                        return (
                          <span
                            className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.25)] select-none"
                            onClick={() => {
                              reconnectPikafish();
                              setTimeout(() => {
                                setLiveTransport(getEngineTransportStatus());
                              }, 150);
                            }}
                            title={`🟢 ${liveTransport.statusText || "Pikafish WS Native Pro"} đang kết nối trực tiếp. Bấm để ping/kết nối lại.`}
                          >
                            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400 text-nowrap shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                            <span>{liveTransport.label || "WS Pro"}</span>
                          </span>
                        );
                      } else if (status === "cloud-nnue") {
                        return (
                          <span
                            className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-cyan-500/40 bg-cyan-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.2)] select-none"
                            onClick={() => {
                              reconnectPikafish();
                              setTimeout(() => {
                                setLiveTransport(getEngineTransportStatus());
                              }, 150);
                            }}
                            title="🌐 Pikafish Cloud (Depth 30-62 via ChessDB). Bấm để thử kết nối WS Local 8765."
                          >
                            <span className="size-1.5 rounded-full bg-cyan-400 text-nowrap shadow-[0_0_6px_rgba(34,211,238,0.9)]" />
                            <span>Cloud+</span>
                          </span>
                        );
                      } else {
                        return (
                          <span
                            className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300 select-none"
                            onClick={() => {
                              reconnectPikafish();
                              setTimeout(() => {
                                setLiveTransport(getEngineTransportStatus());
                              }, 150);
                            }}
                            title="⚡ Đang dùng JS Engine dự phòng. Hãy chạy start_pikafish.bat và bấm vào đây để kết nối lại!"
                          >
                            <span className="size-1.5 rounded-full bg-amber-400 text-nowrap" />
                            <span>JS Offline</span>
                          </span>
                        );
                      }
                    }
                    return (
                      <span
                        className="inline-flex items-center gap-1 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-cyan-400 select-none"
                        title="⚡ Động cơ tích hợp sẵn AN Grandmaster JS"
                      >
                        <Cpu className="size-2.5" />
                        <span>JS Worker</span>
                      </span>
                    );
                  })()}
                  {/* Live Depth & WDL Pill */}
                  {(analysis.depth > 0 || analysis.isSearching) && (
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[8.5px] font-semibold whitespace-nowrap ${
                        analysis.isSearching
                          ? "border-amber-400/40 bg-amber-500/15 text-amber-300"
                          : "border-white/10 bg-white/5 text-slate-300"
                      }`}
                      title={`Độ sâu: Depth ${analysis.depth || "?"}${analysis.nps ? ` • Tốc độ: ${(analysis.nps / 1000000).toFixed(2)}M nodes/s` : ""}${analysis.wdl ? ` • WDL: ${(analysis.wdl.win / 10).toFixed(0)}% Thắng / ${(analysis.wdl.draw / 10).toFixed(0)}% Hòa / ${(analysis.wdl.loss / 10).toFixed(0)}% Thua` : ""}`}
                    >
                      {analysis.isSearching && (
                        <span className="size-1.5 animate-ping rounded-full bg-amber-400" />
                      )}
                      <span>
                        D{analysis.depth || "..."}
                        {analysis.winrate != null &&
                        (!window.ZigaMod?.userSettings?.pikafishConfig ||
                          window.ZigaMod.userSettings.pikafishConfig.showWdl !==
                            false)
                          ? ` • ${Math.round(analysis.winrate)}%`
                          : ""}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons: Compact & Cleanly Spaced */}
          <div className="flex shrink-0 items-center gap-1.5 pl-1.5">
            {/* Deep Think (8s / D44) Boost Button */}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleDeepThink}
              title="🔥 Tính Sâu (Deep Think 8s / Depth 44): Dồn toàn lực Pikafish tìm sát cục & biến sâu nhất cho thế cờ hiện tại!"
              className={`size-6.5 rounded-lg border transition-all ${
                analysis.isSearching && analysis.isDeepThink
                  ? "animate-pulse border-orange-400/70 bg-orange-500/25 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.45)]"
                  : "border-orange-500/35 bg-orange-500/10 text-orange-400 hover:border-orange-400/60 hover:bg-orange-500/20"
              }`}
            >
              <Flame className="size-3.5" />
            </Button>

            {/* Engine Switcher Toggle Button */}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleToggleEngine}
              title={`Đang dùng: ${analysis.engineName || "AN Grandmaster JS"}. Bấm để chuyển sang ${
                engineId === "js-engine" ? "Pikafish NNUE" : "AN Grandmaster JS"
              }`}
              className={`size-6.5 rounded-lg border transition-all ${
                engineId === "pikafish"
                  ? "border-amber-400/50 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"
                  : "border-cyan-400/40 bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25"
              }`}
            >
              {engineId === "pikafish" ? (
                <Fish className="size-3.5" />
              ) : (
                <Cpu className="size-3.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon-xs"
              onClick={toggleCompactMode}
              title={isCompact ? "Mở rộng 2 cột (Studio)" : "Thu gọn 1 cột"}
              className="text-muted-foreground hover:text-foreground size-6.5 rounded-lg border border-transparent transition-colors hover:border-white/10 hover:bg-white/6"
            >
              {isCompact ? (
                <Maximize2 className="size-3.5" />
              ) : (
                <Minimize2 className="size-3.5" />
              )}
            </Button>

            {isCompact && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setShowMiniBoardInCompact((p) => !p)}
                title={
                  showMiniBoardInCompact ? "Ẩn bàn cờ nhỏ" : "Hiện bàn cờ nhỏ"
                }
                className={`size-6.5 rounded-lg border transition-colors ${
                  showMiniBoardInCompact
                    ? "border-cyan-400/40 text-cyan-400"
                    : "text-muted-foreground hover:text-foreground border-transparent hover:border-white/10 hover:bg-white/6"
                }`}
                style={{
                  background: showMiniBoardInCompact
                    ? "rgba(6, 182, 212, 0.12)"
                    : "transparent",
                }}
              >
                <LayoutGrid className="size-3.5" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onClose}
              title="Đóng bảng cố vấn"
              className="text-muted-foreground hover:text-foreground size-6.5 rounded-lg transition-colors hover:bg-rose-500/15"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* TẦNG KHAI CUỘC NẾU CÓ */}
        {analysis.openingName && (
          <div className="px-3 pt-2">
            <div className="flex flex-col gap-1 rounded-xl border border-amber-500/35 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent px-3 py-2 text-[10.5px] text-amber-300 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-1.5">
                  <Sparkles className="size-3.5 shrink-0 text-amber-400" />
                  <span className="truncate">
                    Thế Trận: <strong>{analysis.openingName}</strong>
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="shrink-0 border-amber-400/40 bg-amber-500/20 px-1.5 py-0 text-[9px] font-semibold text-amber-300"
                >
                  {analysis.openingInfo?.category || "Khai Cuộc Chuẩn"}
                </Badge>
              </div>
              {analysis.openingInfo?.battleplan && (
                <p className="text-[9.5px] leading-snug text-amber-200/85">
                  💡 {analysis.openingInfo.battleplan}
                </p>
              )}
            </div>
          </div>
        )}

        {/* TẦNG NỘI DUNG CHÍNH (COMPACT vs DUAL PANE) */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3 pt-2">
          {!isCompact ? (
            /* Studio Mode (Dual Pane) */
            <div className="grid min-h-0 flex-1 grid-cols-12 gap-3 overflow-hidden">
              <div className="col-span-5 flex min-h-0 flex-col gap-2">
                <MentorMiniBoard
                  pieces={analysis.pieces}
                  myColor={analysis.myColor}
                  activePlan={activePlan}
                  activeVariation={activeVariation}
                  activeStep={activeStep}
                  setActiveStep={setActiveStep}
                />
              </div>

              <div className="col-span-7 flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
                <InsightBanner analysis={analysis} />
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  <PlansTabsSection
                    tab={tab}
                    setTab={setTab}
                    analysis={analysis}
                    selectedPlanIdx={selectedPlanIdx}
                    setSelectedPlanIdx={setSelectedPlanIdx}
                    activeVariationIdx={activeVariationIdx}
                    setActiveVariationIdx={setActiveVariationIdx}
                    activeStep={activeStep}
                    setActiveStep={setActiveStep}
                    onDrawPlan={(p, varIdx) => drawPlanArrowOnBoard(p, varIdx)}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Compact Mode (Single Column - Bàn cờ nhỏ trên cùng, Gợi ý tối ưu nằm ngay dưới) */
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
              {/* 1. Bàn Cờ Nhỏ Hiện Ngay Phía Trên (Mặc định luôn bật khi mở Kỳ Đạo Sư) */}
              {showMiniBoardInCompact && (
                <div className="border-border/30 shrink-0 rounded-xl border bg-black/30 p-2">
                  <MentorMiniBoard
                    pieces={analysis.pieces}
                    myColor={analysis.myColor}
                    activePlan={activePlan}
                    activeVariation={activeVariation}
                    activeStep={activeStep}
                    setActiveStep={setActiveStep}
                  />
                </div>
              )}

              {/* 2. Dời Thẻ Gợi Ý Tối Ưu / Nhận Định Chiến Thuật Xuống Phía Dưới Bàn Cờ Nhỏ */}
              <div className="shrink-0">
                <InsightBanner analysis={analysis} />
              </div>

              {/* 3. Danh Sách Kế Sách, 5 Trụ Cột, Tâm Pháp */}
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <PlansTabsSection
                  tab={tab}
                  setTab={setTab}
                  analysis={analysis}
                  selectedPlanIdx={selectedPlanIdx}
                  setSelectedPlanIdx={setSelectedPlanIdx}
                  activeVariationIdx={activeVariationIdx}
                  setActiveVariationIdx={setActiveVariationIdx}
                  activeStep={activeStep}
                  setActiveStep={setActiveStep}
                  onDrawPlan={(p, varIdx) => drawPlanArrowOnBoard(p, varIdx)}
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  // =========================================================================
  // Sub-Component: Highlight Insight Banner (Frosted Glass Tactical Coach)
  // =========================================================================
  function InsightBanner({ analysis }) {
    if (!analysis) return null;
    const comm = analysis.commentary || {
      type: "optimal",
      title: "GỢI Ý TỐI ƯU",
      move: analysis.plans?.[0]?.fullNotation,
      why: analysis.coachCommentary,
    };

    const isMate = comm.type === "mate";
    const isDanger = comm.type === "danger";

    return (
      <div
        className={`relative flex items-start gap-2.5 rounded-xl border p-2.5 transition-all ${
          isMate
            ? "border-l-[3.5px] border-white/10 border-l-amber-500"
            : isDanger
              ? "border-l-[3.5px] border-white/10 border-l-rose-500"
              : "border-l-[3.5px] border-white/10 border-l-cyan-400"
        }`}
        style={{
          background: "rgba(255, 255, 255, 0.03)",
        }}
      >
        {/* Left Lucide Icon Container */}
        <div
          className={`flex size-7 shrink-0 items-center justify-center rounded-lg border ${
            isMate
              ? "border-amber-500/30 text-amber-400"
              : isDanger
                ? "border-rose-500/30 text-rose-400"
                : "border-cyan-400/30 text-cyan-400"
          }`}
          style={{
            background: isMate
              ? "rgba(245, 158, 11, 0.12)"
              : isDanger
                ? "rgba(244, 63, 94, 0.12)"
                : "rgba(6, 182, 212, 0.12)",
          }}
        >
          {isMate ? (
            <Trophy className="size-4" />
          ) : isDanger ? (
            <AlertTriangle className="size-4" />
          ) : comm.type === "turn" ? (
            <Crosshair className="size-4" />
          ) : (
            <Lightbulb className="size-4" />
          )}
        </div>

        {/* Content with Clear Hierarchy */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`text-[9.5px] font-bold tracking-wider uppercase ${
                isMate
                  ? "text-amber-400"
                  : isDanger
                    ? "text-rose-400"
                    : "text-cyan-400"
              }`}
            >
              {comm.title}
            </span>
            {comm.move && (
              <span
                className="text-foreground py-0.2 rounded border border-white/15 px-1.5 font-mono text-[10.5px] font-bold"
                style={{ background: "rgba(255, 255, 255, 0.08)" }}
              >
                {comm.move}
              </span>
            )}
          </div>

          <span className="text-foreground/90 text-[11px] leading-snug font-medium">
            {comm.why}
          </span>

          {analysis.threatInfo && (
            <div
              className="mt-1 flex items-center gap-1.5 rounded-md border border-rose-500/30 px-2 py-1 text-[10px] text-rose-300"
              style={{ background: "rgba(244, 63, 94, 0.1)" }}
            >
              <ShieldAlert className="size-3.5 shrink-0 text-rose-400" />
              <span className="leading-tight font-medium">
                {analysis.threatInfo.desc}
              </span>
            </div>
          )}

          {analysis.mateThreat && (
            <div
              className={`mt-1.5 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10.5px] ${
                analysis.mateThreat.type === "attack"
                  ? "border-amber-500/40 bg-amber-500/15 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                  : "animate-pulse border-rose-500/50 bg-rose-500/20 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
              }`}
            >
              {analysis.mateThreat.type === "attack" ? (
                <Trophy className="size-4 shrink-0 text-amber-400" />
              ) : (
                <ShieldAlert className="size-4 shrink-0 text-rose-400" />
              )}
              <div className="flex min-w-0 flex-col">
                <span
                  className={`text-[10px] font-bold tracking-wide uppercase ${
                    analysis.mateThreat.type === "attack"
                      ? "text-amber-300"
                      : "text-rose-300"
                  }`}
                >
                  {analysis.mateThreat.title}
                </span>
                <span className="text-[9.5px] leading-tight opacity-90">
                  {analysis.mateThreat.explanation}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // Sub-Component: Plans, Variations & Theory Tabs
  // =========================================================================
  function PlansTabsSection({
    tab,
    setTab,
    analysis,
    selectedPlanIdx,
    setSelectedPlanIdx,
    activeVariationIdx,
    setActiveVariationIdx,
    activeStep,
    setActiveStep,
    onDrawPlan,
  }) {
    const plans = analysis?.plans || [];
    const [theoryCategory, setTheoryCategory] = useState("Tất Cả");

    const filteredMaxims = useMemo(() => {
      if (theoryCategory === "Tất Cả") return XIANGQI_MAXIMS;
      return XIANGQI_MAXIMS.filter((m) => m.category === theoryCategory);
    }, [theoryCategory]);

    return (
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="flex min-h-0 flex-1 flex-col"
      >
        <TabsList className="grid h-6.5 w-full shrink-0 grid-cols-3">
          <TabsTrigger value="plans" className="gap-1 text-[9.5px]">
            <Compass className="size-3" />
            <span>Kế Sách ({plans.length})</span>
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="gap-1 text-[9.5px]">
            <LayoutGrid className="size-3" />
            <span>5 Trụ Cột</span>
          </TabsTrigger>
          <TabsTrigger value="theory" className="gap-1 text-[9.5px]">
            <BrainCircuit className="size-3" />
            <span>Tâm Pháp</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: KẾ SÁCH THỰC CHIẾN (WITH OPPONENT VARIATIONS) */}
        <TabsContent
          value="plans"
          className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pt-1 pr-1"
          data-scrollable="true"
        >
          {plans.length > 0 ? (
            plans.map((p, idx) => {
              const isSelected = selectedPlanIdx === idx;
              const currentVarIdx = isSelected ? activeVariationIdx : 0;
              const currentVar =
                p.variations?.[currentVarIdx] || p.variations?.[0];

              return (
                <div
                  key={p.id}
                  className="flex cursor-pointer flex-col gap-2 rounded-xl p-2.5 transition-all"
                  style={{
                    background: isSelected
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(255, 255, 255, 0.02)",
                    border: isSelected
                      ? "1px solid var(--primary, #06b6d4)"
                      : "1px solid rgba(255, 255, 255, 0.08)",
                    borderLeft: isSelected
                      ? "3.5px solid var(--primary, #06b6d4)"
                      : "1px solid rgba(255, 255, 255, 0.08)",
                    boxShadow: isSelected
                      ? "0 4px 14px rgba(0, 0, 0, 0.25)"
                      : "none",
                  }}
                  onClick={() => {
                    setSelectedPlanIdx(idx);
                    setActiveVariationIdx(0);
                    setActiveStep(1);
                    onDrawPlan(p, 0);
                  }}
                >
                  {/* Header: Badge, Move Notation & Tactical Purpose */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className="text-foreground/90 inline-flex items-center gap-1 rounded border border-white/15 px-1.5 py-0 text-[9px] font-semibold"
                          style={{ background: "rgba(255, 255, 255, 0.06)" }}
                        >
                          {p.type === "attack" ? (
                            <Sparkles className="size-2.5 text-cyan-400" />
                          ) : p.type === "defend" ? (
                            <Shield className="size-2.5 text-rose-400" />
                          ) : (
                            <Zap className="size-2.5 text-amber-400" />
                          )}
                          <span>{p.badge}</span>
                        </Badge>
                        <span className="text-primary font-mono text-[11.5px] font-bold">
                          {p.shortNotation}
                        </span>
                        {p.scoreText && (
                          <span
                            className={`rounded border px-1 py-0 font-mono text-[9px] font-bold ${
                              (p.score || 0) >= 50
                                ? "border-emerald-500/35 bg-emerald-500/15 text-emerald-300"
                                : (p.score || 0) <= -50
                                  ? "border-rose-500/35 bg-rose-500/15 text-rose-300"
                                  : "border-white/10 bg-white/5 text-slate-300"
                            }`}
                            title={
                              p.wdl
                                ? `Thắng ${(p.wdl.win / 10).toFixed(0)}% • Hòa ${(p.wdl.draw / 10).toFixed(0)}% • Thua ${(p.wdl.loss / 10).toFixed(0)}%`
                                : `Điểm đánh giá: ${p.scoreText}`
                            }
                          >
                            {p.scoreText}
                            {p.winrate != null &&
                            (!window.ZigaMod?.userSettings?.pikafishConfig ||
                              window.ZigaMod.userSettings.pikafishConfig
                                .showWdl !== false)
                              ? ` · ${Math.round(p.winrate)}%`
                              : ""}
                          </span>
                        )}
                      </div>
                      <span className="text-foreground truncate text-[11px] font-bold">
                        {p.name.split("·")[1] || p.name}
                      </span>
                    </div>

                    {/* Tactical Tags Badges */}
                    {p.tags && p.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1">
                        {p.tags.map((t, tIdx) => {
                          const badgeProps = getTacticalBadgeProps(t);
                          const IconComp = badgeProps.icon;
                          return (
                            <span
                              key={tIdx}
                              className={`py-0.2 inline-flex items-center gap-0.5 rounded border px-1.5 text-[8.5px] font-semibold ${badgeProps.color}`}
                            >
                              <IconComp className="size-2" />
                              <span>{badgeProps.label}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Step 1: Ta Đi */}
                  <div className="flex items-start gap-1.5 text-[10.5px]">
                    <span className="shrink-0 font-bold text-cyan-400">
                      1. Ta đi:
                    </span>
                    <span className="text-foreground/90 leading-tight font-medium">
                      <strong>{p.fullNotation}</strong> — {p.why}
                    </span>
                  </div>

                  {/* Step 2: DỰ ĐOÁN PHẢN ỨNG ĐỐI THỦ (2 ĐẾN 3 BIẾN SỐ) */}
                  {isSelected && p.variations && p.variations.length > 0 && (
                    <div className="flex flex-col gap-1.5 rounded-lg border border-white/6 bg-black/25 p-2 text-[10px]">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-[9.5px] font-semibold">
                          Dự đoán phản ứng của địch ({p.variations.length}{" "}
                          biến):
                        </span>
                        <span className="font-mono text-[9px] text-rose-400">
                          2. Địch đáp
                        </span>
                      </div>

                      {/* Variations Segmented Selector */}
                      <div className="flex flex-wrap gap-1">
                        {p.variations.map((v, vIdx) => {
                          const isVarActive = currentVarIdx === vIdx;
                          return (
                            <button
                              key={v.idx}
                              type="button"
                              className={`rounded border px-2 py-0.5 text-[9.5px] font-medium transition-colors ${
                                isVarActive
                                  ? "border-cyan-400/50 font-bold text-cyan-300 shadow-xs"
                                  : "text-muted-foreground border-white/10 hover:bg-white/6"
                              }`}
                              style={{
                                background: isVarActive
                                  ? "rgba(6, 182, 212, 0.15)"
                                  : "rgba(255, 255, 255, 0.03)",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveVariationIdx(vIdx);
                                setActiveStep(2);
                                onDrawPlan(p, vIdx);
                              }}
                            >
                              {v.shortLabel}
                            </button>
                          );
                        })}
                      </div>

                      {/* Active Variation Explanation */}
                      {currentVar && (
                        <div className="flex flex-col gap-1 border-t border-white/5 pt-1">
                          <div className="flex items-start gap-1">
                            <span className="shrink-0 font-bold text-rose-400">
                              Địch:
                            </span>
                            <span className="text-muted-foreground leading-tight">
                              <strong>
                                {currentVar.oppNotation?.full || "Nước đi"}
                              </strong>{" "}
                              ({currentVar.oppWhy})
                            </span>
                          </div>

                          {/* Step 3: Đòn phản kích của ta cho biến này */}
                          {currentVar.answer ? (
                            <div className="flex items-start gap-1">
                              <span className="shrink-0 font-bold text-amber-400">
                                3. Ta bồi:
                              </span>
                              <span className="text-foreground/90 leading-tight font-medium">
                                <strong>
                                  {currentVar.answer.notation?.full ||
                                    "Nước cờ"}
                                </strong>{" "}
                                ({currentVar.answer.why})
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-start gap-1 text-emerald-400">
                              <span className="shrink-0 font-bold">
                                3. Kết cục:
                              </span>
                              <span className="leading-tight">
                                Đối thủ lâm vào thế cùng lực kiệt.
                              </span>
                            </div>
                          )}
                          {/* Multi-Step Tactical Roadmap Pills (up to 8 steps from Pikafish PV) */}
                          {p.roadmap && p.roadmap.length >= 3 && (
                            <div className="mt-0.5 flex flex-col gap-1 border-t border-white/5 pt-1.5">
                              <span className="text-muted-foreground text-[9px] font-semibold">
                                Lộ trình tác chiến {p.roadmap.length} bước:
                              </span>
                              <div className="flex flex-wrap items-center gap-1 pb-0.5">
                                {p.roadmap.map((rm, rmIdx) => (
                                  <button
                                    key={rmIdx}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedPlanIdx(idx);
                                      setActiveStep(rm.step);
                                    }}
                                    className={`shrink-0 rounded border px-1.5 py-0.5 text-[8.5px] font-semibold transition-all ${
                                      activeStep === rm.step
                                        ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-sm"
                                        : "text-muted-foreground hover:text-foreground border-white/10 bg-white/3 hover:border-white/20"
                                    }`}
                                  >
                                    {`${rm.step}. ${rm.step % 2 === 1 ? "Ta" : "Địch"}: ${rm.notation?.short || "Đi"}`}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <Button
                      variant="default"
                      size="xs"
                      className="h-5.5 flex-1 gap-1 text-[9.5px] font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlanIdx(idx);
                        onDrawPlan(p, currentVarIdx);
                      }}
                    >
                      <Crosshair className="size-3" />
                      <span>Vẽ Lên Bàn Thật</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      className="h-5.5 gap-1 text-[9.5px] font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlanIdx(idx);
                        setActiveStep(1);
                      }}
                    >
                      <Play className="size-3" />
                      <span>Thử Trên Bàn Nhỏ</span>
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-muted-foreground/80 flex flex-1 flex-col items-center justify-center gap-2.5 p-6 text-center">
              <BrainCircuit
                className={`size-6 text-cyan-400 ${
                  analysis?.isSearching ? "animate-pulse" : ""
                }`}
              />
              <div className="flex flex-col gap-1">
                <span className="text-foreground text-xs font-semibold">
                  {analysis?.isSearching
                    ? "AI đang tính toán các biến cờ chuyên sâu..."
                    : !analysis?.isMyTurn
                      ? "Lượt đối thủ đang suy nghĩ..."
                      : "Đang theo dõi thế trận ván đấu..."}
                </span>
                <span className="text-muted-foreground text-[10px]">
                  {analysis?.isSearching
                    ? "Thuật toán Pikafish NNUE / Web Worker chạy ngầm (0% lag bàn cờ)."
                    : !analysis?.isMyTurn
                      ? "Kế sách phản công sẽ lập tức xuất hiện khi đến lượt bạn đi."
                      : "Thực hiện nước cờ để cập nhật kế sách mới."}
                </span>
              </div>
            </div>
          )}
        </TabsContent>

        {/* TAB 2: HÌNH THẾ 5 TRỤ CỘT (GRANDMASTER EVALUATION) */}
        <TabsContent
          value="breakdown"
          className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pt-1 pr-1"
          data-scrollable="true"
        >
          <EvaluationBreakdownTab
            breakdown={analysis.evalBreakdown}
            score={analysis.evalScore}
            phase={analysis.phase}
          />
        </TabsContent>

        {/* TAB 3: TÂM PHÁP & LÝ LUẬN */}
        <TabsContent
          value="theory"
          className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pt-1 pr-1"
          data-scrollable="true"
        >
          {/* 1. KHẨU QUYẾT ỨNG DỤNG THẾ TRẬN HIỆN TẠI (DYNAMIC CONTEXTUAL MAXIM) */}
          {analysis?.maxim && (
            <div className="relative overflow-hidden rounded-xl border border-amber-500/35 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent p-2.5 shadow-xs">
              <div className="mb-1 flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-400">
                  <Sparkles className="size-3.5 shrink-0 text-amber-400" />
                  <span>Khẩu Quyết Ứng Dụng Thế Trận</span>
                </div>
                {analysis.maxim.badge && (
                  <Badge
                    variant="outline"
                    className="border-amber-400/50 bg-amber-500/20 px-1.5 py-0 text-[8.5px] font-bold text-amber-300"
                  >
                    {analysis.maxim.badge}
                  </Badge>
                )}
              </div>
              <span className="text-foreground block text-[10.5px] leading-snug font-bold">
                "{analysis.maxim.rule}"
              </span>
              <p className="text-muted-foreground mt-0.5 text-[9.5px] leading-relaxed">
                {analysis.maxim.desc}
              </p>
              {analysis.maxim.triggerReason && (
                <div className="mt-1.5 flex items-center gap-1 text-[8.5px] text-amber-300/80">
                  <span className="inline-block size-1.5 rounded-full bg-amber-400"></span>
                  <span>
                    Kích hoạt do:{" "}
                    <strong>{analysis.maxim.triggerReason}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 2. THẾ TRẬN KHAI CUỘC NẾU CÓ */}
          {analysis?.openingInfo && (
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-2.5 text-[9.5px]">
              <div className="mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1 font-bold text-cyan-300">
                  <Compass className="size-3 text-cyan-400" />
                  {analysis.openingInfo.name}
                </span>
                <Badge
                  variant="outline"
                  className="border-cyan-400/40 bg-cyan-500/20 px-1 py-0 text-[8px] text-cyan-200"
                >
                  {analysis.openingInfo.category}
                </Badge>
              </div>
              <p className="text-muted-foreground text-[9px] leading-snug">
                <strong className="text-cyan-200">Kế sách:</strong>{" "}
                {analysis.openingInfo.battleplan}
              </p>
              {analysis.openingInfo.counterAdvice && (
                <p className="text-muted-foreground mt-1 text-[9px] leading-snug">
                  <strong className="text-cyan-200">Ứng biến:</strong>{" "}
                  {analysis.openingInfo.counterAdvice}
                </p>
              )}
            </div>
          )}

          {/* 3. BỘ LỌC DANH MỤC BINH THƯ */}
          <div className="flex flex-col gap-1 pt-0.5">
            <div className="text-muted-foreground flex items-center justify-between px-0.5 text-[9.5px] font-semibold">
              <span className="flex items-center gap-1">
                <BrainCircuit className="text-primary size-3" />
                Kho Tàng Tâm Pháp Tượng Kỳ ({filteredMaxims.length})
              </span>
            </div>
            {/* Category filter pills */}
            <div className="flex flex-wrap gap-1">
              {THEORY_CATEGORIES.map((cat) => {
                const isSelected = theoryCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setTheoryCategory(cat)}
                    className={`rounded-lg px-2 py-0.5 text-[8.5px] font-medium transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. DANH SÁCH KHẨU QUYẾT THEO DANH MỤC */}
          <div className="flex flex-col gap-1 pb-1">
            {filteredMaxims.map((m, idx) => {
              const isActive =
                analysis?.maxim && analysis.maxim.rule === m.rule;
              return (
                <div
                  key={idx}
                  className={`rounded-lg border p-2 text-[9px] leading-snug transition-all ${
                    isActive
                      ? "border-amber-400/50 bg-amber-500/15 ring-1 ring-amber-400/30"
                      : "border-border/30 bg-muted/10 hover:bg-muted/20"
                  }`}
                >
                  <div className="mb-0.5 flex items-center justify-between gap-1">
                    <strong
                      className={
                        isActive ? "font-bold text-amber-300" : "text-primary"
                      }
                    >
                      {m.rule}
                    </strong>
                    <div className="flex shrink-0 items-center gap-1">
                      {isActive && (
                        <span className="rounded bg-amber-500/30 px-1 py-0 text-[7.5px] font-bold text-amber-300">
                          Ứng Dụng
                        </span>
                      )}
                      <span className="bg-muted/40 text-muted-foreground rounded px-1 py-0 text-[7.5px]">
                        {m.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-[8.5px] leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    );
  }

  // =========================================================================
  // Panel Lifecycle & DOM Controller with Scroll Lock
  // =========================================================================
  function toggleMentorFloatingPanel(forceOpen) {
    if (!mentorPanelEl) {
      createMentorFloatingPanel();
    }

    const isVisible = mentorPanelEl.style.display !== "none";
    const nextState = forceOpen !== undefined ? !!forceOpen : !isVisible;

    if (nextState) {
      mentorPanelEl.style.display = "flex";
      const isDark =
        typeof document !== "undefined" &&
        document.documentElement.classList.contains("dark");
      if (isDark) mentorPanelEl.classList.add("dark");
      else mentorPanelEl.classList.remove("dark");

      if (typeof ZigaMod.lockOuterScroll === "function") {
        ZigaMod.lockOuterScroll();
      }

      if (
        cachedAnalysis &&
        !cachedAnalysis.isQuickOnly &&
        (cachedAnalysis.plans || []).length > 0
      ) {
        renderMentorFloatingContent(cachedAnalysis);
      } else {
        if (cachedAnalysis) {
          renderMentorFloatingContent({ ...cachedAnalysis, isSearching: true });
        }
        if (lastKnownGameData && lastKnownGameData.gameLayer) {
          const pieces = getBoardState(lastKnownGameData.gameLayer);
          if (pieces && pieces.length > 0) {
            triggerDeepAnalysis(lastKnownGameData, pieces);
          }
        }
      }
    } else {
      mentorPanelEl.style.display = "none";
      if (typeof ZigaMod.unlockOuterScroll === "function") {
        ZigaMod.unlockOuterScroll();
      }
      if (analyzeDebounceTimer) {
        clearTimeout(analyzeDebounceTimer);
        analyzeDebounceTimer = null;
      }
      if (cancelWorkerSearch) {
        cancelWorkerSearch();
        cancelWorkerSearch = null;
      }
    }
  }

  function createMentorFloatingPanel() {
    if (mentorPanelEl) return mentorPanelEl;

    mentorPanelEl = document.createElement("div");
    mentorPanelEl.id = "ziga-mentor-floating-panel";
    mentorPanelEl.className =
      "ziga-shadcn-root fixed z-[2147483646] select-none";
    mentorPanelEl.style.display = "none";

    const isDark =
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark");
    if (isDark) mentorPanelEl.classList.add("dark");

    // Smart positioning: place cleanly to the right of the chessboard without covering it!
    const canvas = document.getElementById("gameCanvas");
    let targetLeft = 0;
    let targetTop = 20;

    let savedPos = null;
    try {
      const p = localStorage.getItem("ziga_mentor_pos");
      if (p) savedPos = JSON.parse(p);
    } catch (e) {}

    if (
      savedPos &&
      typeof savedPos.left === "number" &&
      savedPos.left < window.innerWidth - 100
    ) {
      targetLeft = savedPos.left;
      targetTop = savedPos.top;
    } else if (canvas) {
      const r = canvas.getBoundingClientRect();
      const availableRight = window.innerWidth - r.right;
      if (availableRight >= 390) {
        targetLeft = r.right + 12; // Sits cleanly in the right sidebar!
        targetTop = Math.max(15, r.top);
      } else {
        targetLeft = Math.max(10, window.innerWidth - 400);
        targetTop = 20;
      }
    } else {
      targetLeft = Math.max(10, window.innerWidth - 400);
      targetTop = 20;
    }

    mentorPanelEl.style.left = `${targetLeft}px`;
    mentorPanelEl.style.top = `${targetTop}px`;

    // Strict Scroll Lock on Host Web
    mentorPanelEl.addEventListener(
      "wheel",
      (e) => {
        const scrollable = e.target.closest(
          '.overflow-y-auto, [data-scrollable="true"]',
        );
        if (!scrollable) {
          e.preventDefault();
          return;
        }
        const delta = e.deltaY;
        const atTop = scrollable.scrollTop <= 0 && delta < 0;
        const atBottom =
          scrollable.scrollTop + scrollable.clientHeight >=
            scrollable.scrollHeight - 1 && delta > 0;
        if (atTop || atBottom) {
          e.preventDefault();
        }
      },
      { passive: false },
    );

    mentorPanelEl.addEventListener(
      "touchmove",
      (e) => {
        const scrollable = e.target.closest(
          '.overflow-y-auto, [data-scrollable="true"]',
        );
        if (!scrollable) {
          e.preventDefault();
        }
      },
      { passive: false },
    );

    document.body.appendChild(mentorPanelEl);
    const root = createRoot(mentorPanelEl);
    root.render(
      <MentorErrorBoundary>
        <MentorFloatingPanel
          initialAnalysis={cachedAnalysis}
          onClose={() => toggleMentorFloatingPanel(false)}
        />
      </MentorErrorBoundary>,
    );

    setupMentorDraggable(mentorPanelEl);
    return mentorPanelEl;
  }

  function setupMentorDraggable(panel) {
    let isDragging = false;
    let startX, startY, initX, initY;

    panel.addEventListener("mousedown", (e) => {
      if (
        e.target.closest("button") ||
        e.target.closest("input") ||
        e.target.closest('[role="tab"]') ||
        e.target.closest(".overflow-y-auto")
      )
        return;
      isDragging = true;
      document.body.classList.add("ziga-is-dragging-or-resizing");
      startX = e.clientX;
      startY = e.clientY;
      const r = panel.getBoundingClientRect();
      initX = r.left;
      initY = r.top;
    });

    window.addEventListener(
      "mousemove",
      (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const newLeft = Math.max(
          10,
          Math.min(window.innerWidth - panel.offsetWidth - 10, initX + dx),
        );
        const newTop = Math.max(
          10,
          Math.min(window.innerHeight - panel.offsetHeight - 10, initY + dy),
        );
        panel.style.left = `${newLeft}px`;
        panel.style.top = `${newTop}px`;
      },
      { capture: true },
    );

    window.addEventListener(
      "mouseup",
      () => {
        if (isDragging) {
          isDragging = false;
          document.body.classList.remove("ziga-is-dragging-or-resizing");
          try {
            const r = panel.getBoundingClientRect();
            localStorage.setItem(
              "ziga_mentor_pos",
              JSON.stringify({ left: r.left, top: r.top }),
            );
          } catch (e) {}
        }
      },
      { capture: true },
    );
  }

  function renderMentorFloatingContent(analysis) {
    if (!mentorPanelEl || !analysis) return;
    if (mentorSetter) {
      mentorSetter(analysis);
    }
  }

  // Clear mentor-drawn arrows and highlights from the real game canvas
  function clearMentorPlanArrows() {
    let changed = false;
    if (ZigaMod.drawnArrows) {
      for (let i = ZigaMod.drawnArrows.length - 1; i >= 0; i--) {
        if (ZigaMod.drawnArrows[i].isMentorPlan) {
          ZigaMod.drawnArrows.splice(i, 1);
          changed = true;
        }
      }
    }
    if (ZigaMod.drawnHighlights) {
      for (let i = ZigaMod.drawnHighlights.length - 1; i >= 0; i--) {
        if (ZigaMod.drawnHighlights[i].isMentorPlan) {
          ZigaMod.drawnHighlights.splice(i, 1);
          changed = true;
        }
      }
    }
    if (
      changed &&
      typeof ZigaMod.ensureDrawingCanvas === "function" &&
      typeof ZigaMod.redrawTacticalCanvas === "function"
    ) {
      const c = ZigaMod.ensureDrawingCanvas();
      if (c) {
        ZigaMod.redrawTacticalCanvas(c);
      }
    }
  }

  // Draw full tactical roadmap on real game canvas via tactical_drawing
  function drawPlanArrowOnBoard(plan, variationIdx = 0) {
    if (!plan || !ZigaMod.drawnArrows) return;

    for (let i = ZigaMod.drawnArrows.length - 1; i >= 0; i--) {
      if (ZigaMod.drawnArrows[i].isMentorPlan) {
        ZigaMod.drawnArrows.splice(i, 1);
      }
    }

    if (ZigaMod.drawnHighlights) {
      for (let i = ZigaMod.drawnHighlights.length - 1; i >= 0; i--) {
        if (ZigaMod.drawnHighlights[i].isMentorPlan) {
          ZigaMod.drawnHighlights.splice(i, 1);
        }
      }
    }

    // Step 1: Green/Cyan arrow (Ta đi)
    ZigaMod.drawnArrows.push({
      fromCol: plan.fromCol,
      fromRow: plan.fromRow,
      toCol: plan.toCol,
      toRow: plan.toRow,
      color: "green",
      isMentorPlan: true,
    });

    if (ZigaMod.drawnHighlights) {
      ZigaMod.drawnHighlights.push({
        col: plan.toCol,
        row: plan.toRow,
        color: "green",
        isMentorPlan: true,
      });
    }

    // Step 2: Red arrow (Địch đáp trả theo biến đang chọn)
    const activeVar = plan.variations?.[variationIdx] || plan.variations?.[0];
    if (
      activeVar &&
      activeVar.fromCol !== undefined &&
      activeVar.toCol !== undefined
    ) {
      ZigaMod.drawnArrows.push({
        fromCol: activeVar.fromCol,
        fromRow: activeVar.fromRow,
        toCol: activeVar.toCol,
        toRow: activeVar.toRow,
        color: "red",
        isMentorPlan: true,
      });

      // Step 3: Gold arrow (Ta phản kích bồi thêm)
      if (activeVar.answer) {
        ZigaMod.drawnArrows.push({
          fromCol: activeVar.answer.fromCol,
          fromRow: activeVar.answer.fromRow,
          toCol: activeVar.answer.toCol,
          toRow: activeVar.answer.toRow,
          color: "gold",
          isMentorPlan: true,
        });
      }
    }

    if (ZigaMod.ensureDrawingCanvas) {
      const c = ZigaMod.ensureDrawingCanvas();
      if (c && ZigaMod.redrawTacticalCanvas) {
        ZigaMod.redrawTacticalCanvas();
      }
    }
  }

  // Update text of HUD card (zero DOM reconstruction)
  function updateMentorHudCardText(analysis) {
    const phaseEl = document.getElementById("ziga-mentor-phase-val");
    const commentEl = document.getElementById("ziga-mentor-comment-val");
    if (phaseEl)
      phaseEl.textContent = `${analysis.phase} · ${
        analysis.isMyTurn ? "Lượt Bạn Đi" : "Lượt Đối Thủ"
      }`;
    if (commentEl) commentEl.textContent = analysis.coachCommentary;
  }

  // Update Mentor Card inside main HUD with state guard & background worker execution
  function updateMentorHud(gameData) {
    const userSettings = ZigaMod.userSettings || {};
    if (userSettings.mentorCoach === false) {
      const card = document.getElementById("ziga-mentor-hud-card");
      if (card) card.style.display = "none";
      if (mentorPanelEl) mentorPanelEl.style.display = "none";
      if (analyzeDebounceTimer) {
        clearTimeout(analyzeDebounceTimer);
        analyzeDebounceTimer = null;
      }
      if (cancelWorkerSearch) {
        cancelWorkerSearch();
        cancelWorkerSearch = null;
      }
      return;
    }

    if (!gameData || !gameData.gameLayer) {
      const card = document.getElementById("ziga-mentor-hud-card");
      if (card) card.style.display = "none";
      lastAnalysisHash = "";
      cachedAnalysis = null;
      lastKnownGameData = null;
      if (analyzeDebounceTimer) {
        clearTimeout(analyzeDebounceTimer);
        analyzeDebounceTimer = null;
      }
      if (cancelWorkerSearch) {
        cancelWorkerSearch();
        cancelWorkerSearch = null;
      }
      clearMentorPlanArrows();
      if (mentorSetter) {
        mentorSetter(null);
      }
      return;
    }

    lastKnownGameData = gameData;
    const card = document.getElementById("ziga-mentor-hud-card");
    if (card) card.style.display = "flex";

    const stateHash = getBoardStateHash(
      gameData.gameLayer,
      gameData.myColor,
      gameData.oppColor,
    );
    // Nếu thế trận không hề thay đổi:
    if (stateHash === lastAnalysisHash) {
      // 1. Đang có debounce hoặc đang tính toán ngầm -> để nguyên cho engine chạy xong, tuyệt đối KHÔNG ngắt!
      if (
        analyzeDebounceTimer !== null ||
        (cachedAnalysis && cachedAnalysis.isSearching)
      ) {
        // Watchdog chống kẹt: nếu isSearching đã quá 5s (do worker lag hoặc crash), tự reset
        if (
          cachedAnalysis &&
          cachedAnalysis.searchStartTime &&
          Date.now() - cachedAnalysis.searchStartTime > 5000
        ) {
          cachedAnalysis.isSearching = false;
          if (mentorSetter) {
            mentorSetter({ ...cachedAnalysis, isSearching: false });
          }
        }
        return;
      }
      // 2. Thế trận không đổi và đã phân tích xong -> giữ nguyên tuyệt đối, KHÔNG re-render!
      if (cachedAnalysis) {
        return;
      }
    }
    lastAnalysisHash = stateHash;

    const pieces = getBoardState(gameData.gameLayer);
    if (!pieces || pieces.length === 0) return;

    // Instant static evaluation (<0.02ms) to update left HUD card with ZERO main thread load
    const quickRes = asyncWorker.quickEvaluate(pieces, gameData.myColor);
    const quickAnalysis = buildQuickAnalysis(quickRes, gameData, pieces);

    const activeColor =
      gameData.gameLayer && gameData.gameLayer.Yc !== undefined
        ? gameData.gameLayer.Yc
        : gameData.myColor;
    const isMyTurn = activeColor === gameData.myColor;

    if (!isMyTurn) {
      // Đang trong lượt của đối thủ:
      // Xóa mũi tên kế sách cũ để tránh nhầm lẫn
      clearMentorPlanArrows();
      if (analyzeDebounceTimer) {
        clearTimeout(analyzeDebounceTimer);
        analyzeDebounceTimer = null;
      }
      if (cancelWorkerSearch) {
        cancelWorkerSearch();
        cancelWorkerSearch = null;
      }

      const waitingAnalysis = {
        ...quickAnalysis,
        isSearching: false,
        isQuickOnly: false,
        plans: [],
        activeStep: 0,
        selectedPlanIdx: 0,
        commentary: {
          type: "waiting",
          title: "LƯỢT ĐỐI THỦ ĐANG SUY NGHĨ",
          move: null,
          shortMove: null,
          why: "Đối thủ đang suy nghĩ nước cờ. Hãy quan sát trận thế và giữ vững sự tập trung!",
        },
      };
      cachedAnalysis = waitingAnalysis;
      updateMentorHudCardText(waitingAnalysis);
      if (mentorSetter) {
        mentorSetter(waitingAnalysis);
      }
      return;
    }

    // Đang trong lượt của Người Chơi (Ta đi):
    clearMentorPlanArrows();

    // Giữ lại plans cũ trong giai đoạn chờ để tránh UI chớp giật (bàn cờ nhỏ và tab kế sách không bị biến mất đột ngột)
    const transitionalAnalysis = {
      ...quickAnalysis,
      isSearching: true,
      isQuickOnly: true,
      searchStartTime: Date.now(),
      plans: cachedAnalysis?.plans?.length ? cachedAnalysis.plans : [],
      activeStep: 1,
      selectedPlanIdx: 0,
    };
    cachedAnalysis = transitionalAnalysis;

    if (quickAnalysis) {
      updateMentorHudCardText(quickAnalysis);
    }

    const isPanelOpen = mentorPanelEl && mentorPanelEl.style.display !== "none";

    // If modal is CLOSED, do NOT run deep multi-tree search! Keep CPU at 0% for 60 FPS gameplay
    if (!isPanelOpen) {
      if (analyzeDebounceTimer) {
        clearTimeout(analyzeDebounceTimer);
        analyzeDebounceTimer = null;
      }
      if (cancelWorkerSearch) {
        cancelWorkerSearch();
        cancelWorkerSearch = null;
      }
      return;
    }

    // Modal is OPEN: cập nhật mượt mà UI
    if (mentorSetter) {
      mentorSetter(transitionalAnalysis);
    }

    if (analyzeDebounceTimer) {
      clearTimeout(analyzeDebounceTimer);
    }

    analyzeDebounceTimer = setTimeout(() => {
      analyzeDebounceTimer = null;
      triggerDeepAnalysis(gameData, pieces);
    }, 140);
  }

  // Export to namespace
  ZigaMod.analyzeTacticalMindset = analyzeTacticalMindset;
  ZigaMod.updateMentorHud = updateMentorHud;
  ZigaMod.toggleMentorFloatingPanel = toggleMentorFloatingPanel;
})((window.ZigaMod = window.ZigaMod || {}));
