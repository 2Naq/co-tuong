import React, { useState, useEffect } from "react";
import {
  Settings,
  Palette,
  Minus,
  Plus,
  Crown,
  Sun,
  Moon,
  Compass,
  BookOpen,
  GraduationCap,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  openReactSettingsModal,
  applyGlobalThemeMode,
} from "../SettingsModal/SettingsModal";
import { useUiStore } from "../../lib/ui_store";
import { ThreatAlertCard } from "./ThreatAlertCard";
import { MaterialBarCard } from "./MaterialBarCard";
import { CoUpTrackerCard } from "./CoUpTrackerCard";
import { LostPiecesCard } from "./LostPiecesCard";
import { TacticalInspectorCard } from "./TacticalInspectorCard";
import { MoveHistoryCard } from "./MoveHistoryCard";
import { ErrorBoundary } from "../common/ErrorBoundary";
import { cn } from "../../lib/utils";

export function HudWidget() {
  const ZigaMod = window.ZigaMod || {};
  const [isMinimized, setIsMinimized] = useState(false);

  const state = useUiStore((s) => s);
  const settings = ZigaMod.userSettings || ZigaMod.DEFAULT_SETTINGS || {};
  const themeMode = state.themeMode || "dark";

  useEffect(() => {
    const widgetEl = document.getElementById("ziga-mod-widget");
    if (!widgetEl) return;
    widgetEl.classList.toggle("minimized", isMinimized);
  }, [isMinimized]);

  const handleToggleMinimize = (e) => {
    e.stopPropagation();
    const widgetEl = document.getElementById("ziga-mod-widget");
    if (widgetEl && widgetEl.__zigaJustDragged) {
      widgetEl.__zigaJustDragged = false;
      return;
    }
    setIsMinimized((prev) => !prev);
  };

  const handleOpenSettings = (e) => {
    e.stopPropagation();
    openReactSettingsModal("features");
  };

  const handleToggleTheme = (e) => {
    e.stopPropagation();
    const nextMode = themeMode === "dark" ? "light" : "dark";
    applyGlobalThemeMode(nextMode);
  };

  const handleOpenSandbox = (e) => {
    e.stopPropagation();
    if (typeof ZigaMod.openTacticalSandbox === "function") {
      ZigaMod.openTacticalSandbox();
    }
  };

  return (
    <>
      {/* Header Bar */}
      <div
        id="ziga-mod-drag-handle"
        className={cn(
          "bg-card flex cursor-grab items-center justify-between px-3.5 py-2.5 select-none active:cursor-grabbing",
          isMinimized
            ? "gap-2.5 rounded-xl px-3 py-2"
            : "border-border border-b",
        )}
      >
        <div
          id="ziga-mod-title-click"
          onClick={() => {
            if (isMinimized) {
              const widgetEl = document.getElementById("ziga-mod-widget");
              if (widgetEl && widgetEl.__zigaJustDragged) {
                widgetEl.__zigaJustDragged = false;
                return;
              }
              setIsMinimized(false);
            }
          }}
          className="flex items-center gap-2"
        >
          <span
            className="ziga-mod-badge-icon border-input/30 flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-md border"
            title="TOOLS SUPPORT"
            style={{
              width: "22px",
              height: "22px",
              maxWidth: "22px",
              maxHeight: "22px",
            }}
          >
            <img
              src={
                (typeof document !== "undefined" &&
                  document.documentElement?.dataset?.zigaLogoUrl) ||
                ""
              }
              className="ziga-mod-badge-img rounded object-contain"
              alt="Logo"
              style={{
                width: "22px",
                height: "22px",
                maxWidth: "22px",
                maxHeight: "22px",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                if (e.currentTarget.nextElementSibling) {
                  e.currentTarget.nextElementSibling.style.display =
                    "inline-block";
                }
              }}
            />
            <svg
              viewBox="0 0 512 512"
              className="ziga-sb-logo-svg-fallback hidden rounded"
              style={{
                width: "22px",
                height: "22px",
                maxWidth: "22px",
                maxHeight: "22px",
              }}
            >
              <rect width="512" height="512" rx="64" fill="#000000" />
              <path
                d="M118.141 347H76.9482L139.714 165.182H189.253L251.93 347H210.737L165.194 206.73H163.773L118.141 347ZM115.567 275.533H212.868V305.54H115.567V275.533ZM425.892 165.182V347H392.689L313.587 232.565H312.255V347H273.814V165.182H307.55L386.03 279.528H387.628V165.182H425.892Z"
                fill="#ffffff"
              />
            </svg>
          </span>
          <span className="text-foreground text-xs font-bold tracking-tight select-none">
            TOOLS SUPPORT
          </span>
        </div>

        <div className="flex items-center gap-1">
          {!isMinimized && (
            <>
              <Button
                variant="outline"
                size="icon-xs"
                id="ziga-mod-btn-theme"
                onClick={handleToggleTheme}
                title={
                  themeMode === "dark"
                    ? "Chuyển sang Giao diện Sáng (Light Mode)"
                    : "Chuyển sang Giao diện Tối (Dark Mode)"
                }
              >
                {themeMode === "dark" ? <Moon /> : <Sun />}
              </Button>
              <Button
                variant="outline"
                size="icon-xs"
                id="ziga-mod-btn-sandbox"
                onClick={handleOpenSandbox}
                title="Mở Sa Bàn Chiến Thuật (Tactical Sandbox)"
              >
                <Compass />
              </Button>
              <Button
                variant="outline"
                size="icon-xs"
                id="ziga-mod-btn-palette"
                onClick={(e) => {
                  e.stopPropagation();
                  openReactSettingsModal("hud-style");
                }}
                title="Tùy biến màu sắc & Giao diện HUD (Personalize Widget)"
              >
                <Palette />
              </Button>
              <Button
                variant="outline"
                size="icon-xs"
                id="ziga-mod-btn-settings"
                onClick={handleOpenSettings}
                title="Cài đặt tính năng & Hào quang (Aura)"
              >
                <Settings />
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="icon-xs"
            id="ziga-mod-btn-min"
            onClick={handleToggleMinimize}
            title={isMinimized ? "Mở rộng bảng" : "Thu gọn thành bong bóng"}
          >
            {isMinimized ? <Plus /> : <Minus />}
          </Button>
        </div>
      </div>

      {/* Scrollable Body Content */}
      <div
        id="ziga-mod-body"
        style={{ display: isMinimized ? "none" : "flex" }}
        className="bg-background text-foreground flex max-h-[560px] flex-col gap-2.5 overflow-x-hidden overflow-y-auto p-3"
      >
        {/* Game Status Pill */}
        <Card size="sm" className="py-2">
          <CardContent className="flex items-center gap-2 text-xs font-medium">
            <span
              className={cn(
                "size-2 shrink-0 rounded-full",
                state.inGame
                  ? "bg-primary"
                  : "bg-muted-foreground animate-pulse",
              )}
            />
            <span id="ziga-status-text" className="truncate">
              {state.statusText}
            </span>
          </CardContent>
        </Card>

        {/* Opening Recognition Banner */}
        <Card
          size="sm"
          id="ziga-opening-badge"
          style={{ display: "none" }}
          onClick={() => ZigaMod.showOpeningModal?.()}
          className="hover:bg-accent/50 cursor-pointer py-2 transition-colors"
        >
          <CardContent className="flex w-full items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <BookOpen className="text-primary size-3.5 shrink-0" />
              <span id="ziga-opening-name" className="truncate font-medium">
                Bách Khoa Khai Cuộc
              </span>
            </div>
            <Badge id="ziga-opening-cat" variant="secondary">
              Tra cứu
            </Badge>
          </CardContent>
        </Card>

        {/* Mentor Coach Card */}
        <Card
          size="sm"
          id="ziga-mentor-hud-card"
          style={{ display: "none" }}
          onClick={(e) => {
            if (e.target.closest("#ziga-btn-mentor-popout")) return;
            ZigaMod.toggleMentorFloatingPanel?.(true);
          }}
          className="hover:bg-accent/30 cursor-pointer transition-colors"
        >
          <CardHeader id="ziga-mentor-toggle-btn">
            <CardTitle className="flex items-center gap-1.5">
              <GraduationCap className="text-primary size-4" />
              <span>Gia Sư Đồng Hành</span>
            </CardTitle>
            <CardDescription id="ziga-mentor-phase-val">
              Khai Cuộc
            </CardDescription>
            <CardAction>
              <Button
                variant="outline"
                size="xs"
                id="ziga-btn-mentor-popout"
                onClick={(e) => {
                  e.stopPropagation();
                  ZigaMod.toggleMentorFloatingPanel?.(true);
                }}
                title="Mở bảng cố vấn nổi cạnh bàn cờ"
              >
                <ExternalLink />
                Cố Vấn
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p
              id="ziga-mentor-comment-val"
              className="bg-muted/50 text-muted-foreground rounded-md px-2.5 py-1.5 text-xs leading-relaxed"
            />
          </CardContent>
        </Card>

        {/* Threat Scanner Alert */}
        <ErrorBoundary>
          <ThreatAlertCard
            threats={state.threats}
            visible={!!settings.threatAlert}
          />
        </ErrorBoundary>

        {/* Material Advantage Bar */}
        <ErrorBoundary>
          <MaterialBarCard
            material={state.material}
            myName={state.myName}
            oppName={state.oppName}
            visible={!!settings.materialAdvantage}
          />
        </ErrorBoundary>

        {/* Cờ Úp Tracker */}
        <ErrorBoundary>
          <CoUpTrackerCard
            stats={state.coUpStats}
            oppName={state.oppName}
            myName={state.myName}
            visible={!!settings.showCoUpTracker}
          />
        </ErrorBoundary>

        {/* Lost Pieces Section */}
        <ErrorBoundary>
          <LostPiecesCard
            inGame={state.inGame}
            myName={state.myName}
            oppName={state.oppName}
            myColor={state.myColor}
            oppColor={state.oppColor}
            deadMyPieces={state.deadMyPieces}
            deadOppPieces={state.deadOppPieces}
            visible={!!settings.showLostPieces}
          />
        </ErrorBoundary>

        {/* Tactical Range Inspector */}
        <ErrorBoundary>
          <TacticalInspectorCard
            tactical={state.tactical}
            visible={!!settings.showTacticalHud}
          />
        </ErrorBoundary>

        {/* Move History (FEN / PGN) */}
        <ErrorBoundary>
          <MoveHistoryCard
            moves={state.moveHistory}
            visible={!!settings.showMoveHistory}
          />
        </ErrorBoundary>

        {/* Key Pieces Footer */}
        <Card
          size="sm"
          id="ziga-section-key-pieces"
          style={{ display: settings.showKeyPieces ? "flex" : "none" }}
        >
          <CardContent className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-muted/30 flex flex-col rounded-md border px-2.5 py-1.5">
              <span
                id="ziga-stat-opp-name"
                className="text-muted-foreground truncate text-xs"
              >
                {state.inGame ? state.oppName.slice(0, 12) : "Chủ lực Đối thủ:"}
              </span>
              <strong
                id="ziga-stat-opp-val"
                className="text-foreground font-semibold"
              >
                {state.keyPiecesOpp}
              </strong>
            </div>
            <div className="bg-muted/30 flex flex-col rounded-md border px-2.5 py-1.5">
              <span
                id="ziga-stat-self-name"
                className="text-muted-foreground truncate text-xs"
              >
                {state.inGame ? state.myName.slice(0, 12) : "Chủ lực Bạn:"}
              </span>
              <strong
                id="ziga-stat-self-val"
                className="text-primary font-semibold"
              >
                {state.keyPiecesSelf}
              </strong>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pure Tailwind Resize Handles */}
      {!isMinimized && (
        <>
          <div
            id="ziga-resize-edge-r"
            title="Kéo để chỉnh chiều rộng"
            className="hover:bg-primary/20 absolute top-0 right-0 bottom-4 z-50 w-2 cursor-ew-resize transition-colors"
          />
          <div
            id="ziga-resize-edge-b"
            title="Kéo để chỉnh chiều cao"
            className="hover:bg-primary/20 absolute right-4 bottom-0 left-0 z-50 h-2 cursor-ns-resize transition-colors"
          />
          <div
            id="ziga-resize-corner"
            title="Kéo để phóng to / thu nhỏ bảng"
            className="absolute right-0 bottom-0 z-50 flex size-4 cursor-nwse-resize items-end justify-end p-1 opacity-60 transition-opacity hover:opacity-100"
          >
            <span className="border-primary size-2 rounded-br-xs border-r-2 border-b-2" />
          </div>
        </>
      )}
    </>
  );
}
