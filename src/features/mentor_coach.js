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
} from "lucide-react";
import { PIECE_DEFS } from "../core/constants";
import { createXiangqiWorker } from "./xiangqi_engine";

(function (ZigaMod) {
  "use strict";

  console.log(
    "[AN Mod] Master AI Mentor Coach initializing with Background Web Worker Engine...",
  );

  const asyncWorker = createXiangqiWorker();
  const engine = asyncWorker.engine;

  // Database of Xiangqi Master Maxims
  const XIANGQI_MAXIMS = [
    {
      rule: "Khuyết Sĩ kỵ Song Xe, khuyết Tượng sợ Pháo",
      desc: "Mất Sĩ hở sườn dễ bị Xe kẹp cổ; mất Tượng tạo ngòi cho Pháo công phá.",
    },
    {
      rule: "Nhất Tốt nhập cung, vạn quân kinh hãi",
      desc: "Tốt lọt vào cung Tướng đối phương uy lực ngang nửa con Xe, khóa chặt chân Tướng.",
    },
    {
      rule: "Xe mười, Pháo bảy, Mã ba",
      desc: "Xe cơ động công phá mạnh nhất; Pháo bắn tầm xa; Mã biến hóa khi cờ thoáng.",
    },
    {
      rule: "Cờ tàn Pháo hoàn, Mã nhảy xung thiên",
      desc: "Cờ tàn ít quân Pháo khó tìm ngòi; Mã thông thoáng tự do tung hoành sát cục.",
    },
    {
      rule: "Xuất Xe chậm một nước, mất quyền chủ động mười chiêu",
      desc: "Đầu ván cần xuất Xe sớm kiểm soát lộ thông (2, 4, 6, 8) chiếm thế thượng phong.",
    },
    {
      rule: "Mã điền ắt bại, chớ ham ăn mồi quên giữ thành",
      desc: "Tránh để Mã bị cản chân; không tham ăn quân nhỏ để đối phương đoạt tiên.",
    },
    {
      rule: "Pháo đầu uy chấn trung quân",
      desc: "Pháo chiếm trung lộ uy hiếp thẳng Tướng, khống chế hoàn toàn trục dọc đối phương.",
    },
    {
      rule: "Song Mã liên hoàn, vững như bàn thạch",
      desc: "Hai Mã giữ nhau ở trung lộ bảo vệ Tốt đầu và triệt tiêu đòn đột kích của địch.",
    },
  ];

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
      const pieceType = p.Ga !== undefined ? p.Ga : 6;
      const pieceColor = p.ka !== undefined ? p.ka : Math.floor(i / 16);
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
        name: def.name,
        char: pieceColor === 0 ? def.redChar : def.blackChar,
        short: def.short,
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
      hash += `${i}:${p.fa},${p.rowIndex};`;
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

  // Concise, master-level tactical description generator
  function getTacticalDescription(
    piece,
    target,
    notation,
    toCol,
    toRow,
    myColor,
    isCheck,
    isMate,
  ) {
    const tCol = myColor === 0 ? 9 - toCol : toCol + 1;

    if (isMate) {
      return {
        tacticName: "Tuyệt Kỹ Sát Cục",
        why: `Nước cờ ${notation.short} tạo thế sát cục không thể chống đỡ!`,
        tag: "Sát Cục",
      };
    }

    if (isCheck) {
      return {
        tacticName: "Chiếu Tướng Đoạt Tiên",
        why: `Chiếu Tướng ép đối thủ co cụm, giữ quyền chủ động kiểm soát.`,
        tag: "Chiếu Tướng",
      };
    }

    if (target) {
      return {
        tacticName: `Chém ${target.name} Lộ ${tCol}`,
        why: `Chém ${target.name} đoạt lợi thế vật chất và phá vỡ cấu trúc địch.`,
        tag: "Đoạt Quân",
      };
    }

    if (piece.type === 3) {
      const riverRank = myColor === 0 ? 4 : 5;
      const enemyPawnRank = myColor === 0 ? 6 : 3;
      if (toRow === riverRank) {
        return {
          tacticName: "Xe Tuần Hà",
          why: `Xe chiếm bờ sông lộ ${tCol}, kiểm soát toàn bộ tuyến giao thông.`,
          tag: "Tuần Hà",
        };
      }
      if (toRow === enemyPawnRank) {
        return {
          tacticName: "Xe Quá Hà Đè Mã",
          why: `Áp sát hàng tốt địch, đè đầu Mã và khống chế lộ sườn.`,
          tag: "Ghìm Mã",
        };
      }
      return {
        tacticName: "Xe Chiếm Lộ Thông",
        why: `Điều Xe vào lộ ${tCol} thông thoáng, làm chủ trục giao chiến.`,
        tag: "Lộ Thông",
      };
    }

    if (piece.type === 4) {
      if (toCol === 4) {
        return {
          tacticName: "Pháo Đầu Uy Chấn",
          why: `Bình Pháo trung lộ, khống chế thẳng Tướng và cột dọc đối phương.`,
          tag: "Pháo Đầu",
        };
      }
      return {
        tacticName: "Pháo Khống Chế Sườn",
        why: `Điều Pháo sang lộ ${tCol}, tạo thế gọng kìm phối hợp công kích.`,
        tag: "Pháo Sườn",
      };
    }

    if (piece.type === 5) {
      if (toCol === 2 || toCol === 6) {
        return {
          tacticName: "Mã Ngọa Tào",
          why: `Phi Mã ngọa tào, khóa góc cung Tướng dọa đòn sát phạt.`,
          tag: "Ngọa Tào",
        };
      }
      if (toCol === 3 || toCol === 5) {
        return {
          tacticName: "Song Mã Liên Hoàn",
          why: `Liên kết song Mã ở trung lộ, thế trận vững như bàn thạch.`,
          tag: "Liên Hoàn",
        };
      }
      return {
        tacticName: "Mã Vượt Sông Bàn Hà",
        why: `Mã phi qua sông đoạt điểm tựa chiến thuật, mở rộng tầm kiểm soát.`,
        tag: "Bàn Hà",
      };
    }

    if (piece.type === 6) {
      return {
        tacticName: "Binh Tiến Qua Sông",
        why: `Tiến Tốt sang sông mở đường cho Mã, ép sát trận địa đối thủ.`,
        tag: "Tốt Tiến",
      };
    }

    if (piece.type === 1 || piece.type === 2) {
      return {
        tacticName: "Củng Cố Cung Tướng",
        why: `Gia cố cung Tướng, liên kết Sĩ Tượng bịt kín ngòi nổ đối phương.`,
        tag: "Gia Cố",
      };
    }

    return {
      tacticName: "Điều Động Quân Lực",
      why: `Di chuyển ${piece.name} đến Lộ ${tCol} tạo liên kết thế trận.`,
      tag: "Điều Quân",
    };
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
    const inCheck = quickRes && !quickRes.error ? !!quickRes.inCheck : false;
    const evalPoints = (score / 100).toFixed(1);
    let evalText = "Cân bằng (0.0)";
    if (score >= 50) evalText = `+${evalPoints}đ (Bạn ưu)`;
    else if (score <= -50) evalText = `${evalPoints}đ (Địch ưu)`;

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
        title: "CẢNH BÁO CHIẾU TƯỚNG",
        move: null,
        shortMove: null,
        why: "Tướng của bạn đang bị chiếu! Cần ưu tiên hóa giải thế chiếu an toàn.",
      };
    } else if (!isMyTurn) {
      commentary = {
        type: "waiting",
        title: "LƯỢT ĐỐI THỦ",
        move: null,
        shortMove: null,
        why: "Đối thủ đang suy nghĩ nước đi...",
      };
    }

    const coachCommentary = commentary.move
      ? `Khuyên dùng ${commentary.move}! ${commentary.why}`
      : commentary.why;

    const currentMaxim = XIANGQI_MAXIMS[phase === "Khai Cuộc" ? 4 : 0];

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
      threatInfo: null,
      plans: [],
      inCheck,
      depth: 0,
      nodes: 0,
      maxim: currentMaxim,
      isQuickOnly: true,
    };
  }

  // Maps Alpha-Beta search result into rich tactical plans with opponent variations
  function buildTacticalAnalysis(searchRes, gameData, pieces) {
    if (!gameData || !pieces || pieces.length === 0 || !searchRes) return null;

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
    const evalPoints = (searchRes.score / 100).toFixed(1);
    let evalText = "Cân bằng (0.0)";
    if (searchRes.score >= 50) evalText = `+${evalPoints}đ (Bạn ưu)`;
    else if (searchRes.score <= -50) evalText = `${evalPoints}đ (Địch ưu)`;

    // Map Engine Lines into Rich Tactical Plans with 2-3 Opponent Variations
    const plans = [];

    (searchRes.lines || []).forEach((line, idx) => {
      const movingPiece = pieces.find(
        (p) =>
          p.col === line.fromCol &&
          p.row === line.fromRow &&
          p.color === myColor,
      );
      if (!movingPiece) return;

      const targetPiece = pieces.find(
        (p) =>
          p.col === line.toCol && p.row === line.toRow && p.color === oppColor,
      );

      const notation = getXiangqiNotation(
        movingPiece,
        line.fromCol,
        line.fromRow,
        line.toCol,
        line.toRow,
        myColor,
      );

      const isMate = line.delivermate || line.score >= engine.MATE - 100;
      const isCheck = searchRes.inCheck; // or checks opponent

      const desc = getTacticalDescription(
        movingPiece,
        targetPiece,
        notation,
        line.toCol,
        line.toRow,
        myColor,
        isCheck,
        isMate,
      );

      // Process 2-3 Opponent Variations
      const variations = (line.replies || []).map((rep, rIdx) => {
        const oppPiece = pieces.find(
          (p) =>
            p.col === rep.fromCol &&
            p.row === rep.fromRow &&
            p.color === oppColor,
        );
        const oppTarget = pieces.find(
          (p) =>
            p.col === rep.toCol && p.row === rep.toRow && p.color === myColor,
        );
        const oppNot = oppPiece
          ? getXiangqiNotation(
              oppPiece,
              rep.fromCol,
              rep.fromRow,
              rep.toCol,
              rep.toRow,
              oppColor,
            )
          : { short: "Địch đi", full: "Đối thủ di chuyển" };

        let oppWhy = oppTarget
          ? `Chém ${oppTarget.name} tại Lộ ${oppColor === 0 ? 9 - rep.toCol : rep.toCol + 1}.`
          : `Điều quân phản ứng củng cố.`;

        // Follow-up answer from friendly side
        let ansNot = null;
        let ansWhy = "";
        if (rep.answer) {
          const ansPiece = pieces.find(
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
            ansWhy = `Bồi thêm đòn ${ansNot.short} giữ vững thế trận.`;
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
        };
      });

      // Default to best response if variations empty
      if (variations.length === 0) {
        variations.push({
          idx: 0,
          label: "Biến 1: Địch chống đỡ",
          shortLabel: "Biến 1",
          oppNotation: { short: "Địch đi", full: "Đối thủ di chuyển" },
          oppWhy: "Đối thủ buộc phải chống đỡ nước cờ của ta.",
          fromCol: line.toCol,
          fromRow: line.toRow,
          answer: null,
        });
      }

      const planType = idx === 0 ? "attack" : idx === 1 ? "defend" : "maneuver";
      const planBadge =
        idx === 0 ? "Tối Ưu" : idx === 1 ? "Chắc Chắn" : "Đột Phá";

      plans.push({
        id: `plan_${idx}`,
        idx,
        name: `${notation.short} · ${desc.tacticName}`,
        shortNotation: notation.short,
        fullNotation: notation.full,
        type: planType,
        badge: planBadge,
        tag: desc.tag,
        why: desc.why,
        score: line.score,
        piece: movingPiece,
        fromCol: line.fromCol,
        fromRow: line.fromRow,
        toCol: line.toCol,
        toRow: line.toRow,
        variations,
      });
    });

    // Coach Dynamic Commentary - Structured & Pure Text (No raw emojis)
    let commentary = {
      type: "optimal",
      title: "GỢI Ý TỐI ƯU",
      move: plans[0] ? plans[0].fullNotation : null,
      shortMove: plans[0] ? plans[0].shortNotation : null,
      why: plans[0] ? plans[0].why : "Hãy triển khai nước cờ cẩn trọng.",
    };

    if (searchRes.inCheck) {
      commentary = {
        type: "danger",
        title: "CẢNH BÁO CHIẾU TƯỚNG",
        move: null,
        shortMove: null,
        why: "Tướng của bạn đang bị đối phương chiếu! Cần ưu tiên hóa giải thế chiếu an toàn.",
      };
    } else if (plans[0]?.tag?.includes("Sát Cục")) {
      commentary = {
        type: "mate",
        title: "ĐÒN SÁT CỤC TUYỆT KỸ",
        move: plans[0].fullNotation,
        shortMove: plans[0].shortNotation,
        why: plans[0].why,
      };
    } else if (plans[0]) {
      commentary = {
        type: "optimal",
        title: "GỢI Ý TỐI ƯU",
        move: plans[0].fullNotation,
        shortMove: plans[0].shortNotation,
        why: plans[0].why,
      };
    } else if (isMyTurn) {
      commentary = {
        type: "turn",
        title: "LƯỢT ĐI CỦA BẠN",
        move: null,
        shortMove: null,
        why: "Đến lượt bạn đi. Hãy triển khai nước cờ cẩn trọng.",
      };
    } else {
      commentary = {
        type: "waiting",
        title: "LƯỢT ĐỐI THỦ",
        move: null,
        shortMove: null,
        why: "Đối thủ đang suy nghĩ nước đi...",
      };
    }

    const coachCommentary = commentary.move
      ? `Khuyên dùng ${commentary.move}! ${commentary.why}`
      : commentary.why;

    // Threat description if opponent threatens material
    let threatInfo = null;
    if (searchRes.threat && searchRes.threat.gain >= 150) {
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

    const currentMaxim = XIANGQI_MAXIMS[phase === "Khai Cuộc" ? 4 : 0];

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
      plans,
      inCheck: searchRes.inCheck,
      depth: searchRes.depth,
      nodes: searchRes.nodes,
      maxim: currentMaxim,
      allMaxims: XIANGQI_MAXIMS,
      isQuickOnly: false,
    };
  }

  // Asynchronous Deep Engine Search via Dedicated Background Web Worker (Zero UI Lag)
  function triggerDeepAnalysis(gameData, pieces) {
    if (!gameData || !pieces || pieces.length === 0) return;
    const myColor = gameData.myColor;
    const currentHash = lastAnalysisHash;

    if (cancelWorkerSearch) {
      cancelWorkerSearch();
      cancelWorkerSearch = null;
    }

    if (cachedAnalysis && mentorSetter) {
      mentorSetter({ ...cachedAnalysis, isSearching: true });
    }

    cancelWorkerSearch = asyncWorker.analyzeAsync(
      {
        pieces,
        side: myColor,
        maxDepth: 5,
        timeMs: 260,
        multiPV: 3,
      },
      (err, searchRes) => {
        cancelWorkerSearch = null;
        if (err || !searchRes || searchRes.error) {
          console.warn("[AN Mod] Background engine search error:", err);
          return;
        }

        // Drop stale results if board state changed during search
        if (lastAnalysisHash !== currentHash) return;

        const deepAnalysis = buildTacticalAnalysis(searchRes, gameData, pieces);
        if (!deepAnalysis) return;

        cachedAnalysis = deepAnalysis;
        updateMentorHudCardText(deepAnalysis);

        if (mentorPanelEl && mentorPanelEl.style.display !== "none") {
          renderMentorFloatingContent(deepAnalysis);
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

      // Step 1: Our Move
      if (activeStep >= 1) {
        current = current.filter(
          (p) =>
            !(
              p.col === activePlan.toCol &&
              p.row === activePlan.toRow &&
              p.color !== activePlan.piece?.color
            ),
        );
        const moving = current.find(
          (p) =>
            p.col === activePlan.fromCol &&
            p.row === activePlan.fromRow &&
            p.color === activePlan.piece?.color,
        );
        if (moving) {
          moving.col = activePlan.toCol;
          moving.row = activePlan.toRow;
          moving.isMyMove = true;
        }
      }

      // Step 2: Selected Opponent Variation Move
      if (activeStep >= 2 && activeVariation) {
        const opp = activeVariation;
        current = current.filter(
          (p) =>
            !(
              p.col === opp.toCol &&
              p.row === opp.toRow &&
              p.color === myColor
            ),
        );
        const moving = current.find(
          (p) =>
            p.col === opp.fromCol &&
            p.row === opp.fromRow &&
            p.color === opp.oppPiece?.color,
        );
        if (moving) {
          moving.col = opp.toCol;
          moving.row = opp.toRow;
          moving.isOppMove = true;
        }
      }

      // Step 3: Friendly Follow-Up Move
      if (activeStep >= 3 && activeVariation?.answer) {
        const ans = activeVariation.answer;
        current = current.filter(
          (p) =>
            !(
              p.col === ans.toCol &&
              p.row === ans.toRow &&
              p.color !== myColor
            ),
        );
        const moving = current.find(
          (p) =>
            p.col === ans.fromCol &&
            p.row === ans.fromRow &&
            p.color === myColor,
        );
        if (moving) {
          moving.col = ans.toCol;
          moving.row = ans.toRow;
          moving.isFollowUpMove = true;
        }
      }

      return current;
    }, [pieces, activePlan, activeVariation, activeStep, myColor]);

    const getSquarePos = (col, row) => {
      let displayCol = col;
      let displayRow = row;

      if (myColor === 0) {
        displayRow = 9 - row;
      } else {
        displayRow = row;
        displayCol = 8 - col;
      }

      const x = ((25 + displayCol * 43.75) / 400) * 100;
      const y = ((25 + displayRow * 44.44) / 450) * 100;
      return { x, y };
    };

    // Calculate ONLY the arrow for the currently active step (prevents neon clutter!)
    const activeArrow = useMemo(() => {
      if (!activePlan) return null;

      if (activeStep === 0 || activeStep === 1) {
        const s = getSquarePos(activePlan.fromCol, activePlan.fromRow);
        const e = getSquarePos(activePlan.toCol, activePlan.toRow);
        return {
          x1: s.x,
          y1: s.y,
          x2: e.x,
          y2: e.y,
          color: "var(--primary, #06b6d4)",
          marker: "url(#clean-arrow-blue)",
          dashed: false,
        };
      }

      if (activeStep === 2 && activeVariation) {
        const s = getSquarePos(
          activeVariation.fromCol,
          activeVariation.fromRow,
        );
        const e = getSquarePos(activeVariation.toCol, activeVariation.toRow);
        return {
          x1: s.x,
          y1: s.y,
          x2: e.x,
          y2: e.y,
          color: "#f43f5e",
          marker: "url(#clean-arrow-red)",
          dashed: true,
        };
      }

      if (activeStep === 3 && activeVariation?.answer) {
        const ans = activeVariation.answer;
        const s = getSquarePos(ans.fromCol, ans.fromRow);
        const e = getSquarePos(ans.toCol, ans.toRow);
        return {
          x1: s.x,
          y1: s.y,
          x2: e.x,
          y2: e.y,
          color: "#f59e0b",
          marker: "url(#clean-arrow-gold)",
          dashed: false,
        };
      }

      return null;
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
      return null;
    }, [activePlan, activeVariation, activeStep, myColor]);

    return (
      <div className="flex flex-col gap-1.5">
        {/* SVG Board */}
        <div
          className="relative mx-auto aspect-[400/450] w-full max-w-[250px] overflow-hidden rounded-xl border shadow-md select-none"
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
            const isRed = p.color === 0;

            let borderStyle = isRed
              ? "border border-red-500/80 bg-stone-100 text-red-600"
              : "border border-zinc-700 bg-zinc-900 text-zinc-100";
            if (p.isMyMove) borderStyle += " ring-2 ring-cyan-400 z-20";
            else if (p.isOppMove) borderStyle += " ring-2 ring-rose-500 z-20";
            else if (p.isFollowUpMove)
              borderStyle += " ring-2 ring-amber-400 z-20";

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
                <span className="font-serif text-[11px] leading-none select-none">
                  {p.char}
                </span>
              </div>
            );
          })}
        </div>

        {/* Stepper Buttons (4 buttons to walk through the active line) */}
        <div className="grid grid-cols-4 gap-1 pt-0.5">
          <Button
            variant={activeStep === 0 ? "secondary" : "ghost"}
            size="xs"
            className="h-5.5 gap-0.5 px-1 text-[9px]"
            onClick={() => setActiveStep(0)}
          >
            <RotateCcw className="size-2.5" />
            <span>Ván thật</span>
          </Button>
          <Button
            variant={activeStep === 1 ? "secondary" : "ghost"}
            size="xs"
            className="h-5.5 gap-0.5 px-1 text-[9px]"
            onClick={() => setActiveStep(1)}
          >
            <Play className="size-2.5 text-cyan-400" />
            <span>1. Ta đi</span>
          </Button>
          <Button
            variant={activeStep === 2 ? "secondary" : "ghost"}
            size="xs"
            disabled={!activeVariation}
            className="h-5.5 gap-0.5 px-1 text-[9px]"
            onClick={() => setActiveStep(2)}
          >
            <Swords className="size-2.5 text-rose-400" />
            <span>2. Địch</span>
          </Button>
          <Button
            variant={activeStep === 3 ? "secondary" : "ghost"}
            size="xs"
            disabled={!activeVariation?.answer}
            className="h-5.5 gap-0.5 px-1 text-[9px]"
            onClick={() => setActiveStep(3)}
          >
            <Sparkles className="size-2.5 text-amber-400" />
            <span>3. Ta bồi</span>
          </Button>
        </div>
      </div>
    );
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

    // View modes: isCompact (true by default - non-blocking 380px) vs Studio (false - dual pane 640px)
    const [isCompact, setIsCompact] = useState(() => {
      try {
        const saved = localStorage.getItem("ziga_mentor_compact");
        if (saved !== null) return saved === "true";
      } catch (e) {}
      return true; // Default to COMPACT to NEVER cover the chessboard!
    });

    const [showMiniBoardInCompact, setShowMiniBoardInCompact] = useState(false);

    mentorSetter = (nextAnalysis) => {
      if (nextAnalysis) {
        setAnalysis(nextAnalysis);
        setActiveVariationIdx(0);
        setActiveStep(1);
      }
    };

    const activePlan = analysis?.plans?.[selectedPlanIdx] || null;
    const activeVariation =
      activePlan?.variations?.[activeVariationIdx] || null;

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
        <Card className="ziga-mentor-panel-card border-border/80 w-[340px] shadow-2xl backdrop-blur-2xl">
          <div className="ziga-mentor-drag-handle border-border/30 flex shrink-0 cursor-move items-center justify-between border-b bg-white/[0.02] px-3.5 py-2.5 select-none">
            <div className="flex items-center gap-2">
              <div
                className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/10"
                style={{ background: "rgba(255, 255, 255, 0.05)" }}
              >
                <GraduationCap className="size-4 text-cyan-400" />
              </div>
              <span className="text-foreground text-xs font-bold tracking-wider whitespace-nowrap uppercase">
                Kỳ Đạo Sư (AI Mentor)
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

    const panelWidth = isCompact ? 380 : 640;

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
        <div className="ziga-mentor-drag-handle border-border/30 flex shrink-0 cursor-move items-center justify-between border-b bg-white/[0.02] px-3.5 py-2.5 select-none">
          <div className="flex min-w-0 items-center gap-2">
            <div
              className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/10 shadow-xs"
              style={{ background: "rgba(255, 255, 255, 0.06)" }}
            >
              <GraduationCap className="size-4 text-cyan-400" />
            </div>
            <div className="flex min-w-0 flex-col">
              <div className="flex flex-nowrap items-center gap-1.5">
                <span className="text-foreground text-xs font-bold tracking-wider whitespace-nowrap uppercase">
                  Kỳ Đạo Sư
                </span>
                <span
                  className={`py-0.2 inline-flex items-center gap-0.5 rounded border px-1.5 font-mono text-[9px] font-semibold whitespace-nowrap ${
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
              </div>
              <div className="text-muted-foreground mt-0.5 flex items-center gap-1 text-[9px] whitespace-nowrap">
                <span
                  className="py-0.2 text-muted-foreground/90 rounded border border-white/[0.08] px-1 font-medium"
                  style={{ background: "rgba(255, 255, 255, 0.04)" }}
                >
                  {analysis.phase}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-medium">
                  {analysis.isMyTurn ? (
                    <>
                      <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                      <span className="font-semibold text-emerald-400">
                        Lượt bạn
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="bg-muted-foreground/50 size-1.5 rounded-full" />
                      <span>Lượt đối thủ</span>
                    </>
                  )}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-medium">
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
            </div>
          </div>

          {/* Action Buttons: Icon-only so they never collide with the title */}
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={toggleCompactMode}
              title={isCompact ? "Mở rộng 2 cột (Studio)" : "Thu gọn 1 cột"}
              className="text-muted-foreground hover:text-foreground size-7 rounded-lg border border-transparent transition-colors hover:border-white/10 hover:bg-white/[0.06]"
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
                className={`size-7 rounded-lg border transition-colors ${
                  showMiniBoardInCompact
                    ? "border-cyan-400/40 text-cyan-400"
                    : "text-muted-foreground hover:text-foreground border-transparent hover:border-white/10 hover:bg-white/[0.06]"
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
              className="text-muted-foreground hover:text-foreground size-7 rounded-lg transition-colors hover:bg-rose-500/15 hover:text-rose-400"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* TẦNG 2: HIGHLIGHT INSIGHT BANNER (LUXURY FROSTED GLASS - KHÔNG LÒE LOẸT) */}
        <div className="px-3 pt-2">
          {(() => {
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
                </div>
              </div>
            );
          })()}
        </div>

        {/* TẦNG 3: NỘI DUNG CHÍNH (COMPACT vs DUAL PANE) */}
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

              <div className="col-span-7 flex min-h-0 flex-col gap-2">
                <PlansTabsSection
                  tab={tab}
                  setTab={setTab}
                  analysis={analysis}
                  selectedPlanIdx={selectedPlanIdx}
                  setSelectedPlanIdx={setSelectedPlanIdx}
                  activeVariationIdx={activeVariationIdx}
                  setActiveVariationIdx={setActiveVariationIdx}
                  setActiveStep={setActiveStep}
                  onDrawPlan={(p, varIdx) => drawPlanArrowOnBoard(p, varIdx)}
                />
              </div>
            </div>
          ) : (
            /* Compact Mode (Single Column - Never blocks board!) */
            <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden">
              {showMiniBoardInCompact && (
                <div className="border-border/30 rounded-xl border bg-black/30 p-2">
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

              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <PlansTabsSection
                  tab={tab}
                  setTab={setTab}
                  analysis={analysis}
                  selectedPlanIdx={selectedPlanIdx}
                  setSelectedPlanIdx={setSelectedPlanIdx}
                  activeVariationIdx={activeVariationIdx}
                  setActiveVariationIdx={setActiveVariationIdx}
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
    setActiveStep,
    onDrawPlan,
  }) {
    const plans = analysis?.plans || [];

    return (
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="flex min-h-0 flex-1 flex-col"
      >
        <TabsList className="grid h-6.5 w-full shrink-0 grid-cols-2">
          <TabsTrigger value="plans" className="gap-1 text-[10px]">
            <Compass className="size-3" />
            <span>Kế Sách Thực Chiến ({plans.length})</span>
          </TabsTrigger>
          <TabsTrigger value="theory" className="gap-1 text-[10px]">
            <BrainCircuit className="size-3" />
            <span>Tâm Pháp & Lý Luận</span>
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
                  </div>
                  <span className="text-foreground text-[11px] font-bold">
                    {p.name.split("·")[1] || p.name}
                  </span>
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
                  <div className="flex flex-col gap-1.5 rounded-lg border border-white/[0.06] bg-black/25 p-2 text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-[9.5px] font-semibold">
                        Dự đoán phản ứng của địch ({p.variations.length} biến):
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
                                : "text-muted-foreground border-white/10 hover:bg-white/[0.06]"
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
                      <div className="flex flex-col gap-1 border-t border-white/[0.05] pt-1">
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
                                {currentVar.answer.notation?.full || "Nước cờ"}
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
          <div className="flex flex-1 flex-col items-center justify-center gap-2.5 p-6 text-center text-muted-foreground/80">
            <BrainCircuit
              className={`size-6 text-cyan-400 ${
                analysis?.isSearching ? "animate-pulse" : ""
              }`}
            />
            <div className="flex flex-col gap-1">
              <span className="text-foreground text-xs font-semibold">
                {analysis?.isSearching
                  ? "AI đang tính toán các biến cờ chuyên sâu..."
                  : "Đang theo dõi thế trận ván đấu..."}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {analysis?.isSearching
                  ? "Thuật toán Alpha-Beta chạy ngầm qua Web Worker (0% lag bàn cờ)."
                  : "Thực hiện nước cờ hoặc đợi đối thủ để cập nhật kế sách mới."}
              </span>
            </div>
          </div>
        )}
        </TabsContent>

        {/* TAB 2: TÂM PHÁP & LÝ LUẬN */}
        <TabsContent
          value="theory"
          className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pt-1 pr-1"
          data-scrollable="true"
        >
          <div className="border-border/40 rounded-xl border bg-white/[0.02] p-2.5">
            <span className="text-primary block text-[10.5px] font-bold">
              "{analysis.maxim.rule}"
            </span>
            <p className="text-muted-foreground mt-0.5 text-[10px] leading-snug">
              {analysis.maxim.desc}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            {XIANGQI_MAXIMS.slice(0, 5).map((m, idx) => (
              <div
                key={idx}
                className="border-border/30 bg-muted/10 rounded-lg border p-1.5 text-[9.5px] leading-snug"
              >
                <strong className="text-primary mr-1">{m.rule}:</strong>
                <span className="text-muted-foreground">{m.desc}</span>
              </div>
            ))}
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
      <MentorFloatingPanel
        initialAnalysis={cachedAnalysis}
        onClose={() => toggleMentorFloatingPanel(false)}
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
    if (stateHash === lastAnalysisHash && cachedAnalysis) {
      return;
    }
    lastAnalysisHash = stateHash;

    const pieces = getBoardState(gameData.gameLayer);
    if (!pieces || pieces.length === 0) return;

    // Instant static evaluation (<0.02ms) to update left HUD card with ZERO main thread load
    const quickRes = asyncWorker.quickEvaluate(pieces, gameData.myColor);
    const quickAnalysis = buildQuickAnalysis(quickRes, gameData, pieces);

    if (!cachedAnalysis || cachedAnalysis.isQuickOnly) {
      cachedAnalysis = quickAnalysis;
    }
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

    // If modal IS open, debounce by 140ms (let piece move animations finish), then compute in Web Worker
    if (mentorSetter) {
      mentorSetter({ ...(cachedAnalysis || quickAnalysis), isSearching: true });
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
