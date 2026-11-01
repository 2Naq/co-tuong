// src/features/mentor_coach.js - AI Xiangqi Mentor / Live Tactical Coach & Mindset Advisor
import React, { useState } from "react";
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

(function (ZigaMod) {
  "use strict";

  console.log("[AN Mod] Mentor Coach module initializing...");

  // Database of Xiangqi Master Maxims & Mindset Principles
  const XIANGQI_MAXIMS = [
    {
      rule: "Khuyết Sĩ kỵ Song Xe, khuyết Tượng sợ Pháo",
      desc: "Mất Sĩ thì cánh Tướng bị hở dễ bị 2 Xe đối phương thọc sâu, mất Tượng thì Pháo đối phương dễ mượn ngòi bắn phá tan tành.",
    },
    {
      rule: "Nhất Tốt nhập cung, vạn quân kinh hãi",
      desc: "Một con Tốt qua sông lọt vào cung Tướng đối phương uy lực không kém một con Xe, phong tỏa cử động của Tướng đối thủ.",
    },
    {
      rule: "Xe mười, Pháo bảy, Mã ba",
      desc: "Sức mạnh tấn công và cơ động: Xe mạnh nhất, Pháo uy lực tầm xa trong khai trung cuộc, Mã uy lực hiểm hóc khi cờ thông thoáng.",
    },
    {
      rule: "Cờ tàn Pháo hoàn, Mã nhảy xung thiên",
      desc: "Cờ tàn ít quân thì Pháo khó tìm ngòi, Mã lại tự do phi nhảy không lo bị cản chân, sức sát thương cực lớn.",
    },
    {
      rule: "Xuất Xe chậm một nước, mất quyền chủ động mười chiêu",
      desc: "Xe là binh chủng công phá mạnh nhất, đầu ván phải ưu tiên khai thông lộ Xe sớm (lộ 2, 4, 6, 8) để chiếm tiên cơ.",
    },
    {
      rule: "Mã điền ắt bại, chớ ham ăn mồi quên giữ thành",
      desc: "Mã bị quân mình hoặc quân địch cản chân thì trở thành phế binh, đừng vì ham ăn Tốt nhỏ mà để đối phương đoạt tiên phong tỏa.",
    },
    {
      rule: "Pháo đầu uy chấn trung quân",
      desc: "Pháo chiếm trung lộ uy hiếp trực tiếp vào Tướng đối thủ, buộc đối phương phải phân tán lực lượng chống đỡ.",
    },
    {
      rule: "Tả hữu tương liên, công thủ toàn diện",
      desc: "Hai cánh Xe-Pháo-Mã phải liên kết yểm trợ nhau, tránh để một cánh quá mạnh còn một cánh bị bỏ trống.",
    },
    {
      rule: "Song Mã liên hoàn, vững như bàn thạch",
      desc: "Hai Mã bảo vệ lẫn nhau ở trung lộ tạo thành thế trận phòng thủ kiên cố, vừa giữ Tốt đầu vừa sẵn sàng phản kích.",
    },
    {
      rule: "Khai cuộc tranh tiên, trung cuộc đoạt thế, tàn cuộc tranh sát",
      desc: "Đầu ván tranh giành tốc độ ra quân, giữa ván tranh đoạt vị trí khống chế, cuối ván tập trung đòn phối hợp sát Tướng.",
    },
  ];

  let mentorPanelEl = null;
  let activeTab = "plans"; // 'plans' | 'weakness' | 'maxims'
  let cachedAnalysis = null;
  let lastAnalysisHash = "";

  // Fast hash of active board state to avoid unnecessary re-analysis & DOM thrashing
  function getBoardStateHash(gameLayer, myColor, oppColor) {
    if (!gameLayer || !gameLayer.V || !Array.isArray(gameLayer.V)) return "";
    const turn = gameLayer.Yc !== undefined ? gameLayer.Yc : "";
    let hash = `${turn}_${myColor}_${oppColor}_`;
    for (let i = 0; i < 32; i++) {
      const p = gameLayer.V[i];
      if (!p || p.pa) continue;
      hash += `${i}:${p.fa},${p.rowIndex};`;
    }
    return hash;
  }

  // Extract piece coordinates and alive state
  function getBoardState(gameLayer) {
    if (!gameLayer || !gameLayer.V || !Array.isArray(gameLayer.V)) return null;
    const pieces = [];
    for (let i = 0; i < 32; i++) {
      const p = gameLayer.V[i];
      if (!p || p.pa) continue;
      pieces.push({
        index: i,
        col: p.fa,
        row: p.rowIndex,
        type: p.Ga !== undefined ? p.Ga : 6,
        color: p.ka !== undefined ? p.ka : Math.floor(i / 16),
      });
    }
    return pieces;
  }

  // Analyze king safety, piece mobility, hanging pieces, and formulate 3 strategic plans
  function analyzeTacticalMindset(gameData) {
    if (!gameData || !gameData.gameLayer) return null;
    const gameLayer = gameData.gameLayer;
    const pieces = getBoardState(gameLayer);
    if (!pieces || pieces.length === 0) return null;

    const myColor = gameData.myColor;
    const oppColor = gameData.oppColor;
    const activeColor = gameLayer.Yc !== undefined ? gameLayer.Yc : myColor;
    const isMyTurn = activeColor === myColor;

    // 1. Classify Game Phase
    const totalPieces = pieces.length;
    let phase = "Trung Cuộc";
    if (totalPieces >= 28) phase = "Khai Cuộc";
    else if (totalPieces <= 14) phase = "Tàn Cuộc";

    // 2. King Safety & Advisor/Elephant Structure
    const myKing = pieces.find((p) => p.type === 0 && p.color === myColor);
    const oppKing = pieces.find((p) => p.type === 0 && p.color === oppColor);

    const myAdvisors = pieces.filter(
      (p) => p.type === 1 && p.color === myColor,
    ).length;
    const myElephants = pieces.filter(
      (p) => p.type === 2 && p.color === myColor,
    ).length;
    const oppAdvisors = pieces.filter(
      (p) => p.type === 1 && p.color === oppColor,
    ).length;
    const oppElephants = pieces.filter(
      (p) => p.type === 2 && p.color === oppColor,
    ).length;

    // 3. Piece Mobility & Key Outposts
    const myRooks = pieces.filter((p) => p.type === 3 && p.color === myColor);
    const oppRooks = pieces.filter((p) => p.type === 3 && p.color === oppColor);
    const myCannons = pieces.filter((p) => p.type === 4 && p.color === myColor);
    const oppCannons = pieces.filter(
      (p) => p.type === 4 && p.color === oppColor,
    );
    const myKnights = pieces.filter((p) => p.type === 5 && p.color === myColor);
    const oppKnights = pieces.filter(
      (p) => p.type === 5 && p.color === oppColor,
    );
    const myPawnsCrossed = pieces.filter(
      (p) =>
        p.type === 6 &&
        p.color === myColor &&
        (myColor === 0 ? p.row >= 5 : p.row <= 4),
    );
    const oppPawnsCrossed = pieces.filter(
      (p) =>
        p.type === 6 &&
        p.color === oppColor &&
        (oppColor === 0 ? p.row >= 5 : p.row <= 4),
    );

    // 4. Vulnerabilities
    const weaknesses = [];
    const opportunities = [];

    if (oppAdvisors < 2) {
      opportunities.push({
        title: "Đối thủ khuyết Sĩ",
        desc: "Cung Tướng đối phương hở sườn. Ưu tiên điều Xe và Pháo khoét sâu vào góc thiếu Sĩ.",
      });
    }
    if (oppElephants < 2) {
      opportunities.push({
        title: "Đối thủ khuyết Tượng",
        desc: "Hàng tuyến dưới của địch yếu, Pháo của bạn có thể dễ dàng mượn ngòi uy hiếp Tướng.",
      });
    }
    if (myAdvisors < 2) {
      weaknesses.push({
        title: "Bên mình khuyết Sĩ",
        desc: "Cẩn trọng đòn Xe đối phương thọc sâu kẹp cổ hoặc đòn Pháo giác.",
      });
    }
    if (myElephants < 2) {
      weaknesses.push({
        title: "Bên mình khuyết Tượng",
        desc: "Tránh để Xe đối phương chiếm lộ thông dòm ngó trung tâm.",
      });
    }

    if (
      oppRooks.length > 0 &&
      oppRooks.some((r) => r.col === 0 || r.col === 8)
    ) {
      opportunities.push({
        title: "Xe địch còn ở góc biên",
        desc: "Đối thủ xuất Xe chậm, hãy tận dụng quyền chủ động kiểm soát sông và trung lộ.",
      });
    }

    if (myPawnsCrossed.length > 0) {
      opportunities.push({
        title: `Bạn có ${myPawnsCrossed.length} Tốt đã qua sông`,
        desc: "Tốt qua sông uy lực như nửa con Xe, hãy bảo kê Tốt tiến sâu ép Tướng hoặc chém Tượng.",
      });
    }

    // 5. Generate 3 Strategic Coaching Plans
    const plans = [];

    // Plan A: Attack (Offense)
    let attackPlan = null;
    if (myRooks.length > 0) {
      const r = myRooks[0];
      const targetCol = oppKing ? oppKing.col : 4;
      const targetRow = myColor === 0 ? 8 : 1;
      attackPlan = {
        name: "Xe Chiến Thọc Sâu Áp Sát Cung Tướng",
        type: "attack",
        badge: "⚔️ Kế Sách Tấn Công",
        color: "#ef4444",
        moveNotation: `X${9 - r.col}.${myColor === 0 ? 8 - r.row : r.row - 1}`,
        fromCol: r.col,
        fromRow: r.row,
        toCol:
          targetCol === r.col ? (r.col > 4 ? r.col - 2 : r.col + 2) : targetCol,
        toRow: targetRow,
        why: "Đưa Xe kiểm soát hàng cửu hoặc hàng hà đối phương để phong tỏa cử động của Tướng và ghìm chân song Mã.",
        mentorTip:
          "Khi Xe đã áp sát tuyến đáy, phối hợp Pháo nách hoặc Mã ngọa tào sẽ tạo thành thế sát cục không thể chống đỡ.",
      };
    } else if (myCannons.length > 0) {
      const c = myCannons[0];
      attackPlan = {
        name: "Pháo Bắn Trung Lộ Phá Vỡ Phòng Tuyến",
        type: "attack",
        badge: "⚔️ Kế Sách Tấn Công",
        color: "#ef4444",
        fromCol: c.col,
        fromRow: c.row,
        toCol: 4,
        toRow: myColor === 0 ? 5 : 4,
        why: "Tập trung hỏa lực vào trung tâm, ghìm chặt Tướng đối thủ trong cung.",
        mentorTip:
          "Pháo đầu có ngòi nổ hỗ trợ sẽ làm tê liệt toàn bộ hệ thống phòng thủ của đối phương.",
      };
    }

    // Plan B: Solid / Defense
    let defensePlan = null;
    if (myAdvisors < 2 || myElephants < 2) {
      defensePlan = {
        name: "Gia Cố Cung Tướng & Kết Nối Sĩ Tượng",
        type: "defense",
        badge: "🛡️ Kế Sách Củng Cố",
        color: "#38bdf8",
        fromCol: 4,
        fromRow: myColor === 0 ? 0 : 9,
        toCol: 4,
        toRow: myColor === 0 ? 1 : 8,
        why: "Bịt kín các lộ chiếu rút của đối phương, tạo thế che chắn vững chãi cho Tướng.",
        mentorTip:
          "Thành trì vững chắc mới có thể yên tâm phát động tấn công quy mô lớn.",
      };
    } else {
      defensePlan = {
        name: "Bình Phong Song Mã Liên Hoàn Thủ",
        type: "defense",
        badge: "🛡️ Kế Sách Củng Cố",
        color: "#38bdf8",
        fromCol: myKnights.length > 0 ? myKnights[0].col : 2,
        fromRow:
          myKnights.length > 0 ? myKnights[0].row : myColor === 0 ? 0 : 9,
        toCol: 4,
        toRow: myColor === 0 ? 2 : 7,
        why: "Liên kết song Mã ở trung lộ, vừa bảo vệ Tốt đầu vừa cản bước tiến của Xe đối thủ.",
        mentorTip:
          "Mã liên hoàn không sợ Xe chém đơn độc, tạo điểm tựa để phản kích.",
      };
    }

    // Plan C: Maneuver / Positional Initiative
    let positionalPlan = null;
    if (myKnights.length > 0) {
      const k = myKnights[0];
      const targetRow =
        myColor === 0 ? Math.min(9, k.row + 2) : Math.max(0, k.row - 2);
      const targetCol = k.col >= 4 ? k.col - 1 : k.col + 1;
      positionalPlan = {
        name: "Mã Phi Qua Hà Chiếm Điểm Tựa Ngọa Tào",
        type: "maneuver",
        badge: "🌀 Kế Sách Tranh Tiên",
        color: "#eab308",
        fromCol: k.col,
        fromRow: k.row,
        toCol: targetCol,
        toRow: targetRow,
        why: "Nhảy Mã qua sông chiếm lộ hiểm, mở đường cho đòn đánh Mã Ngọa Tào hoặc Mã Điền.",
        mentorTip:
          "Mã qua sông như rồng gặp nước, luôn quan sát xem chân Mã có bị quân địch cản không trước khi nhảy.",
      };
    } else {
      positionalPlan = {
        name: "Đẩy Tốt Thông Đường Khai Mở Thế Trận",
        type: "maneuver",
        badge: "🌀 Kế Sách Tranh Tiên",
        color: "#eab308",
        fromCol: 4,
        fromRow: myColor === 0 ? 3 : 6,
        toCol: 4,
        toRow: myColor === 0 ? 4 : 5,
        why: "Đẩy Tốt tranh chấp bờ sông, khống chế không gian và giải tỏa lộ chạy cho Mã.",
        mentorTip:
          "Tốt thông đường thì Mã phi nhanh, đối phương sẽ mất quyền kiểm soát trung lộ.",
      };
    }

    if (attackPlan) plans.push(attackPlan);
    if (defensePlan) plans.push(defensePlan);
    if (positionalPlan) plans.push(positionalPlan);

    // Pick dynamic coach commentary
    let coachCommentary = "";
    if (threatsAlertCount(gameData) > 0) {
      coachCommentary =
        "⚠️ Kỳ thủ cẩn thận! Quân lực đang bị đối phương đe dọa. Hãy xem xét phương án củng cố phòng thủ ngay!";
    } else if (opportunities.length > 0) {
      coachCommentary = `💡 Cơ hội sáng giá: ${opportunities[0].title}. Hãy đẩy nhanh nhịp độ tấn công để đoạt ưu thế!`;
    } else if (isMyTurn) {
      coachCommentary =
        "🎯 Đến lượt bạn xuất chiêu. Hãy kiên nhẫn quan sát điểm yếu đối thủ trước khi hạ quyết định.";
    } else {
      coachCommentary =
        "⏳ Đối thủ đang toan tính nước cờ. Hãy dự đoán trước hướng phản công của họ.";
    }

    // Pick deterministic contextual maxim based on phase
    let maximIdx = 0;
    if (phase === "Khai Cuộc") maximIdx = 4;
    else if (phase === "Tàn Cuộc") maximIdx = 3;
    else {
      if (oppAdvisors < 2 || oppElephants < 2) maximIdx = 0;
      else if (myPawnsCrossed.length > 0) maximIdx = 1;
      else maximIdx = 7;
    }
    const currentMaxim = XIANGQI_MAXIMS[maximIdx] || XIANGQI_MAXIMS[0];

    return {
      phase,
      isMyTurn,
      coachCommentary,
      plans,
      weaknesses,
      opportunities,
      maxim: currentMaxim,
    };
  }

  function threatsAlertCount(gameData) {
    if (!gameData || !gameData.gameLayer || !ZigaMod.scanThreats) return 0;
    const t = ZigaMod.scanThreats(
      gameData.gameLayer,
      gameData.myColor,
      gameData.oppColor,
    );
    return t ? t.length : 0;
  }

  // Ensure HUD element structure exists (created ONCE to prevent DOM recreation)
  function ensureMentorHudCard(container) {
    let card = document.getElementById("ziga-mentor-hud-card");
    if (!card) {
      card = document.createElement("div");
      card.id = "ziga-mentor-hud-card";
      card.className = "ziga-mentor-hud-card";
      card.innerHTML = `
        <div class="ziga-mentor-header" id="ziga-mentor-toggle-btn" title="Bấm để mở rộng cửa sổ Gia Sư Cố Vấn chi tiết">
          <div class="ziga-mentor-title-wrap">
            <span class="ziga-mentor-avatar">🎓</span>
            <div>
              <div class="ziga-mentor-title">GIA SƯ ĐỒNG HÀNH</div>
              <div class="ziga-mentor-phase" id="ziga-mentor-phase-val">Khai Cuộc</div>
            </div>
          </div>
          <button class="ziga-mentor-popout-btn" id="ziga-btn-mentor-popout" type="button" title="Mở bảng cố vấn nổi cạnh bàn cờ">📌 Mở Bảng Cố Vấn</button>
        </div>
        <div class="ziga-mentor-bubble">
          <p class="ziga-mentor-comment" id="ziga-mentor-comment-val"></p>
        </div>
      `;

      card.addEventListener("click", (e) => {
        if (e.target.closest("#ziga-btn-mentor-popout")) return;
        toggleMentorFloatingPanel(true);
      });

      const popout = card.querySelector("#ziga-btn-mentor-popout");
      if (popout) {
        popout.addEventListener("click", (e) => {
          e.stopPropagation();
          toggleMentorFloatingPanel(true);
        });
      }

      const openingBadge = document.getElementById("ziga-opening-badge");
      try {
        if (openingBadge && openingBadge.parentNode === container) {
          container.insertBefore(card, openingBadge.nextSibling);
        } else {
          container.prepend(card);
        }
      } catch (e) {
        container.prepend(card);
      }
    }
    card.style.display = "flex";
    return card;
  }

  // Update text of HUD card (zero DOM reconstruction)
  function updateMentorHudCardText(analysis) {
    const phaseEl = document.getElementById("ziga-mentor-phase-val");
    const commentEl = document.getElementById("ziga-mentor-comment-val");
    if (phaseEl)
      phaseEl.textContent = `${analysis.phase} · ${analysis.isMyTurn ? "Lượt Bạn Đi" : "Lượt Đối Thủ"}`;
    if (commentEl) commentEl.textContent = analysis.coachCommentary;
  }

  // Update Mentor Card inside main HUD with state guard
  function updateMentorHud(gameData) {
    const userSettings = ZigaMod.userSettings || {};
    if (userSettings.mentorCoach === false) {
      const card = document.getElementById("ziga-mentor-hud-card");
      if (card) card.style.display = "none";
      if (mentorPanelEl) mentorPanelEl.style.display = "none";
      return;
    }

    if (!gameData || !gameData.gameLayer) {
      const card = document.getElementById("ziga-mentor-hud-card");
      if (card) card.style.display = "none";
      lastAnalysisHash = "";
      cachedAnalysis = null;
      return;
    }

    const container = document.getElementById("ziga-mod-body");
    if (!container) return;

    ensureMentorHudCard(container);

    // STATE GUARD: Only re-analyze when piece positions or turns actually change
    const stateHash = getBoardStateHash(
      gameData.gameLayer,
      gameData.myColor,
      gameData.oppColor,
    );
    if (stateHash === lastAnalysisHash && cachedAnalysis) {
      return; // Identical state - no work, zero DOM overhead!
    }
    lastAnalysisHash = stateHash;

    const analysis = analyzeTacticalMindset(gameData);
    if (!analysis) return;
    cachedAnalysis = analysis;

    updateMentorHudCardText(analysis);

    // Update floating panel if open
    if (mentorPanelEl && mentorPanelEl.style.display !== "none") {
      renderMentorFloatingContent(analysis);
    }
  }

  let mentorRoot = null;
  let mentorSetter = null;

  function MentorFloatingPanel({ initialAnalysis, onClose }) {
    const [analysis, setAnalysis] = useState(initialAnalysis);
    const [tab, setTab] = useState("plans");

    mentorSetter = (nextAnalysis) => {
      if (nextAnalysis) setAnalysis(nextAnalysis);
    };

    if (!analysis) {
      return (
        <Card className="border-border bg-card text-card-foreground w-[340px] shadow-2xl">
          <CardHeader className="border-border cursor-move border-b pb-2">
            <CardTitle className="text-primary text-xs font-bold tracking-wider uppercase">
              Kỳ Đạo Sư (AI Mentor)
            </CardTitle>
            <CardDescription className="text-[11px]">
              Gia sư đồng hành nâng cao tư duy cờ tướng
            </CardDescription>
            <CardAction>
              <Button variant="ghost" size="icon-xs" onClick={onClose}>
                ✕
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="text-muted-foreground p-4 text-xs">
            Chờ ván cờ bắt đầu để phân tích thế trận...
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-border bg-card text-card-foreground flex max-h-[82vh] w-[340px] flex-col overflow-hidden shadow-2xl">
        <CardHeader className="border-border bg-muted/20 shrink-0 cursor-move border-b pb-2">
          <CardTitle className="text-primary text-xs font-bold tracking-wider uppercase">
            Kỳ Đạo Sư (AI Mentor)
          </CardTitle>
          <CardDescription className="text-[11px]">
            Gia sư đồng hành nâng cao tư duy cờ tướng
          </CardDescription>
          <CardAction>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onClose}
              title="Đóng bảng cố vấn"
            >
              ✕
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-col gap-3 overflow-y-auto p-3">
          <Alert className="bg-muted/40 px-3 py-2">
            <AlertDescription className="text-foreground text-xs leading-relaxed">
              {analysis.coachCommentary}
            </AlertDescription>
          </Alert>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid h-8 w-full grid-cols-3">
              <TabsTrigger value="plans" className="text-[11px]">
                3 Kế Sách
              </TabsTrigger>
              <TabsTrigger value="weakness" className="text-[11px]">
                Điểm Yếu
              </TabsTrigger>
              <TabsTrigger value="maxims" className="text-[11px]">
                Khẩu Quyết
              </TabsTrigger>
            </TabsList>

            <TabsContent value="plans" className="mt-2.5 flex flex-col gap-2">
              {analysis.plans.map((p, idx) => (
                <Card key={idx} size="sm" className="bg-muted/20">
                  <CardHeader className="pb-1">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant={
                          p.type === "attack"
                            ? "default"
                            : p.type === "defend"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {p.badge}
                      </Badge>
                      {p.moveNotation && (
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px]"
                        >
                          {p.moveNotation}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="mt-1 text-xs font-bold">
                      {p.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      <strong className="text-foreground">Ý đồ:</strong> {p.why}
                    </p>
                    <div className="text-muted-foreground bg-muted/50 border-border/60 rounded-md border p-2 text-[11px]">
                      {p.mentorTip}
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <Button
                        variant="default"
                        size="xs"
                        className="flex-1 text-[11px]"
                        onClick={() => drawPlanArrowOnBoard(p)}
                      >
                        Chỉ Đường
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        className="text-[11px]"
                        onClick={() => {
                          if (ZigaMod.openTacticalSandbox)
                            ZigaMod.openTacticalSandbox();
                        }}
                      >
                        Đi Thử
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent
              value="weakness"
              className="mt-2.5 flex flex-col gap-2.5"
            >
              <div className="flex flex-col gap-1.5">
                <span className="text-primary text-[11px] font-bold tracking-wider uppercase">
                  Cơ Hội Tấn Công Đối Thủ
                </span>
                {analysis.opportunities.length > 0 ? (
                  analysis.opportunities.map((o, idx) => (
                    <Card key={idx} size="sm" className="bg-muted/20">
                      <CardHeader className="pb-0.5">
                        <CardTitle className="text-xs font-semibold">
                          {o.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-muted-foreground text-[11px]">
                        {o.desc}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground text-xs italic">
                    Đối phương đang giữ thế trận khá kín kẽ, chưa có sơ hở lớn.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-destructive text-[11px] font-bold tracking-wider uppercase">
                  Lỗ Hổng Phòng Thủ Của Bạn
                </span>
                {analysis.weaknesses.length > 0 ? (
                  analysis.weaknesses.map((w, idx) => (
                    <Card key={idx} size="sm" className="bg-muted/20">
                      <CardHeader className="pb-0.5">
                        <CardTitle className="text-destructive text-xs font-semibold">
                          {w.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-muted-foreground text-[11px]">
                        {w.desc}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground text-xs italic">
                    Hệ thống phòng thủ của bạn đang rất tròn trịa và an toàn.
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent
              value="maxims"
              className="mt-2.5 flex flex-col gap-2.5"
            >
              <Alert className="bg-primary/10 border-primary/30">
                <AlertTitle className="text-primary text-xs font-bold">
                  "{analysis.maxim.rule}"
                </AlertTitle>
                <AlertDescription className="text-muted-foreground mt-1 text-[11px]">
                  {analysis.maxim.desc}
                </AlertDescription>
              </Alert>

              <span className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                10 Đạo Cờ Tướng Tâm Pháp
              </span>
              <div className="flex max-h-[220px] flex-col gap-1.5 overflow-y-auto pr-1">
                {XIANGQI_MAXIMS.map((m, idx) => (
                  <Card key={idx} size="sm" className="bg-muted/15">
                    <CardHeader className="pb-0.5">
                      <CardTitle className="text-[11px] font-semibold">
                        <span className="text-primary mr-1 font-bold">
                          {idx + 1}.
                        </span>
                        {m.rule}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-[11px] leading-relaxed">
                      {m.desc}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  // Toggle or open floating Mentor window next to chessboard
  function toggleMentorFloatingPanel(forceOpen) {
    if (!mentorPanelEl) {
      createMentorFloatingPanel();
    }

    const isVisible = mentorPanelEl.style.display !== "none";
    const nextState = forceOpen !== undefined ? !!forceOpen : !isVisible;

    mentorPanelEl.style.display = nextState ? "flex" : "none";
    if (nextState && cachedAnalysis) {
      renderMentorFloatingContent(cachedAnalysis);
    }
  }

  function createMentorFloatingPanel() {
    if (mentorPanelEl) return mentorPanelEl;

    mentorPanelEl = document.createElement("div");
    mentorPanelEl.id = "ziga-mentor-floating-panel";
    mentorPanelEl.className =
      "ziga-shadcn-root fixed z-[2147483646] select-none";
    mentorPanelEl.style.display = "none";

    const canvas = document.getElementById("gameCanvas");
    if (canvas) {
      const r = canvas.getBoundingClientRect();
      mentorPanelEl.style.left = `${Math.min(window.innerWidth - 350, Math.max(10, r.right + 15))}px`;
      mentorPanelEl.style.top = `${Math.max(20, r.top)}px`;
    } else {
      mentorPanelEl.style.right = "30px";
      mentorPanelEl.style.top = "120px";
    }

    document.body.appendChild(mentorPanelEl);
    mentorRoot = createRoot(mentorPanelEl);
    mentorRoot.render(
      <MentorFloatingPanel
        initialAnalysis={cachedAnalysis}
        onClose={() => {
          if (mentorPanelEl) mentorPanelEl.style.display = "none";
        }}
      />,
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
        e.target.closest('[role="tab"]')
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
        panel.style.left = `${Math.max(10, Math.min(window.innerWidth - panel.offsetWidth - 10, initX + dx))}px`;
        panel.style.top = `${Math.max(10, Math.min(window.innerHeight - panel.offsetHeight - 10, initY + dy))}px`;
      },
      { capture: true },
    );

    window.addEventListener(
      "mouseup",
      () => {
        if (isDragging) {
          isDragging = false;
          document.body.classList.remove("ziga-is-dragging-or-resizing");
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

  // Draw plan arrow on board via tactical_drawing
  function drawPlanArrowOnBoard(plan) {
    if (!plan || !ZigaMod.drawnArrows) return;

    // Remove any previous mentor plan arrow
    const existingIdx = ZigaMod.drawnArrows.findIndex((a) => a.isMentorPlan);
    if (existingIdx >= 0) {
      ZigaMod.drawnArrows.splice(existingIdx, 1);
    }

    ZigaMod.drawnArrows.push({
      fromCol: plan.fromCol,
      fromRow: plan.fromRow,
      toCol: plan.toCol,
      toRow: plan.toRow,
      color:
        plan.type === "attack"
          ? "red"
          : plan.type === "defense"
            ? "blue"
            : "gold",
      isMentorPlan: true,
    });

    if (ZigaMod.ensureDrawingCanvas) {
      const c = ZigaMod.ensureDrawingCanvas();
      if (c && ZigaMod.redrawTacticalCanvas) {
        ZigaMod.redrawTacticalCanvas();
      }
    }
  }

  // Export to namespace
  ZigaMod.analyzeTacticalMindset = analyzeTacticalMindset;
  ZigaMod.updateMentorHud = updateMentorHud;
  ZigaMod.toggleMentorFloatingPanel = toggleMentorFloatingPanel;
})((window.ZigaMod = window.ZigaMod || {}));
