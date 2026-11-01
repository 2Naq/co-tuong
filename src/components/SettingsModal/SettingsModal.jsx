import React, { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import {
  Settings,
  Palette,
  Sparkles,
  Sliders,
  RotateCcw,
  Save,
  Sun,
  Moon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LivePreviewStage } from "./LivePreviewStage";
import { FeaturesTab } from "./FeaturesTab";
import { HudStyleTab } from "./HudStyleTab";
import { ThemesTab } from "./ThemesTab";
import { AuraGalleryTab } from "./AuraGalleryTab";
import { PRESET_AURAS } from "../../aura/aura_presets";
import { DEFAULT_HUD_STYLE } from "../../core/constants";
import { applyHudStyle, saveHudStyleToStorage } from "../../ui/hud_theme";
import { uiStore, useUiStore } from "../../lib/ui_store";

const AURA_KEYS = [
  "auraPreset",
  "auraScale",
  "auraSpeed",
  "auraAnimation",
  "customMyAuraColor",
  "customOppAuraColor",
  "customAuraImage",
];

export function applyGlobalThemeMode(mode) {
  const nextMode = mode === "light" ? "light" : "dark";
  uiStore.setState({ themeMode: nextMode });
  try {
    localStorage.setItem("ziga_xiangqi_theme_mode", nextMode);
  } catch (e) {}

  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", nextMode === "dark");
    const hudEl = document.getElementById("ziga-mod-widget");
    const modalHostEl = document.getElementById("ziga-react-settings-host");
    [hudEl, modalHostEl].forEach((el) => {
      if (!el) return;
      el.classList.toggle("dark", nextMode === "dark");
    });
  }
}

export function SettingsModal({ isOpen, onClose, initialTab = "features" }) {
  const ZigaMod = window.ZigaMod || {};
  const defaultSettings = ZigaMod.DEFAULT_SETTINGS || {};
  const auraPresets =
    Array.isArray(ZigaMod.PRESET_AURAS) && ZigaMod.PRESET_AURAS.length > 0
      ? ZigaMod.PRESET_AURAS
      : PRESET_AURAS;
  const themeMode = useUiStore((s) => s.themeMode) || "dark";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [draft, setDraft] = useState(() => ({
    ...defaultSettings,
    ...(ZigaMod.userSettings || {}),
    auraCustom: {
      ...(defaultSettings.auraCustom || {}),
      ...((ZigaMod.userSettings && ZigaMod.userSettings.auraCustom) || {}),
    },
    hudStyle: {
      ...(defaultSettings.hudStyle || DEFAULT_HUD_STYLE),
      ...((ZigaMod.userSettings && ZigaMod.userSettings.hudStyle) || {}),
    },
  }));
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDraft({
        ...defaultSettings,
        ...(ZigaMod.userSettings || {}),
        auraCustom: {
          ...(defaultSettings.auraCustom || {}),
          ...((ZigaMod.userSettings && ZigaMod.userSettings.auraCustom) || {}),
        },
        hudStyle: {
          ...(defaultSettings.hudStyle || DEFAULT_HUD_STYLE),
          ...((ZigaMod.userSettings && ZigaMod.userSettings.hudStyle) || {}),
        },
      });
      if (initialTab) setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2200);
  }, []);

  const syncToEngineLive = useCallback(
    (nextDraft) => {
      const mod = window.ZigaMod;
      if (!mod) return;
      mod.userSettings = {
        ...nextDraft,
        auraCustom: {
          ...(mod.DEFAULT_SETTINGS?.auraCustom || {}),
          ...(nextDraft.auraCustom || {}),
        },
        hudStyle: {
          ...(mod.DEFAULT_SETTINGS?.hudStyle || DEFAULT_HUD_STYLE),
          ...(nextDraft.hudStyle || {}),
        },
      };
      if (typeof mod.saveSettings === "function") {
        mod.saveSettings();
      }
      if (typeof mod.applySettingsVisibility === "function") {
        mod.applySettingsVisibility();
      }
      if (typeof mod.applyHudStyle === "function" && nextDraft.hudStyle) {
        mod.applyHudStyle(nextDraft.hudStyle, themeMode);
      }
      if (
        typeof mod.saveHudStyleToStorage === "function" &&
        nextDraft.hudStyle
      ) {
        mod.saveHudStyleToStorage(nextDraft.hudStyle);
      }
      if (typeof mod.reloadAuraTextures === "function") {
        mod.reloadAuraTextures();
      }
      if (typeof mod.refreshBoardAuraImmediate === "function") {
        mod.refreshBoardAuraImmediate();
      }
      const activeData =
        typeof mod.getActiveGameData === "function"
          ? mod.getActiveGameData()
          : null;
      if (activeData && typeof mod.updateBoardAura === "function") {
        mod.updateBoardAura(activeData);
      }
    },
    [themeMode],
  );

  const updateDraft = useCallback(
    (patch) => {
      setDraft((prev) => {
        let next;
        if (patch.auraCustom) {
          next = {
            ...prev,
            ...patch,
            auraCustom: {
              ...prev.auraCustom,
              ...patch.auraCustom,
            },
          };
        } else if (patch.hudStyle) {
          next = {
            ...prev,
            ...patch,
            hudStyle: {
              ...prev.hudStyle,
              ...patch.hudStyle,
            },
          };
        } else {
          next = { ...prev, ...patch };
        }
        syncToEngineLive(next);
        return next;
      });
    },
    [syncToEngineLive],
  );

  // Separate Reset #1: Reset Features Only (Preserve Aura Settings)
  const handleResetFeaturesOnly = () => {
    setDraft((prev) => {
      const next = {
        ...defaultSettings,
        auraCustom: {
          ...(prev.auraCustom || defaultSettings.auraCustom || {}),
        },
        hudStyle: {
          ...(prev.hudStyle || defaultSettings.hudStyle || DEFAULT_HUD_STYLE),
        },
      };
      syncToEngineLive(next);
      return next;
    });
    showToast("Đã khôi phục mặc định các Tính Năng!");
  };

  // Separate Reset #2: Reset Aura Only (Preserve Feature Toggles)
  const handleResetAuraOnly = () => {
    setDraft((prev) => {
      const next = {
        ...prev,
        auraCustom: { ...(defaultSettings.auraCustom || {}) },
      };
      syncToEngineLive(next);
      return next;
    });
    showToast("Đã khôi phục mặc định riêng phần Hào Quang (Aura)!");
  };

  // Separate Reset #3: Reset HUD Style Only
  const handleResetHudStyleOnly = () => {
    setDraft((prev) => {
      const next = {
        ...prev,
        hudStyle: { ...DEFAULT_HUD_STYLE },
      };
      syncToEngineLive(next);
      return next;
    });
    showToast("Đã khôi phục mặc định Giao Diện HUD!");
  };

  const handleSaveAndClose = () => {
    syncToEngineLive(draft);
    onClose();
  };

  const toggleThemeMode = () => {
    const next = themeMode === "dark" ? "light" : "dark";
    applyGlobalThemeMode(next);
    showToast(
      next === "dark"
        ? "Đã chuyển sang Chế độ Tối (Dark Mode)"
        : "Đã chuyển sang Chế độ Sáng (Light Mode)",
    );
  };

  const imageCount = auraPresets.length;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      modal={false}
    >
      <DialogContent className="flex max-h-[88vh] flex-col overflow-hidden sm:max-w-3xl">
        {/* Header */}
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between border-b pr-8 pb-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
              <Settings className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <DialogTitle>Cài Đặt & Tùy Biến Mod</DialogTitle>
                <Badge variant="secondary">shadcn/ui</Badge>
              </div>
              <DialogDescription>
                Bật/tắt công cụ hỗ trợ & tùy chỉnh hào quang bàn cờ Ziga thời
                gian thực
              </DialogDescription>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleThemeMode}
            title="Chuyển đổi giao diện Sáng / Tối (Dark / Light Mode)"
          >
            {themeMode === "dark" ? (
              <>
                <Moon />
                <span>Dark</span>
              </>
            ) : (
              <>
                <Sun />
                <span>Light</span>
              </>
            )}
          </Button>
        </DialogHeader>

        {/* Scrollable Content Body */}
        <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-x-hidden overflow-y-auto py-1 pr-1">
          {(activeTab === "themes" || activeTab === "gallery") && (
            <LivePreviewStage
              draft={draft}
              updateDraft={updateDraft}
              auraPresets={auraPresets}
            />
          )}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1 sm:grid-cols-4">
              <TabsTrigger value="features">
                <Settings />
                <span>Cài Đặt Tính Năng</span>
              </TabsTrigger>
              <TabsTrigger value="hud-style">
                <Sliders />
                <span>Giao Diện HUD</span>
              </TabsTrigger>
              <TabsTrigger value="themes">
                <Palette />
                <span>Chủ Đề & Màu Aura</span>
              </TabsTrigger>
              <TabsTrigger value="gallery">
                <Sparkles />
                <span>Kho {imageCount} Mẫu PNG</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="features">
              <FeaturesTab draft={draft} updateDraft={updateDraft} />
            </TabsContent>

            <TabsContent value="hud-style">
              <HudStyleTab draft={draft} updateDraft={updateDraft} />
            </TabsContent>

            <TabsContent value="themes">
              <ThemesTab
                draft={draft}
                updateDraft={updateDraft}
                auraPresets={auraPresets}
              />
            </TabsContent>

            <TabsContent value="gallery">
              <AuraGalleryTab
                draft={draft}
                updateDraft={updateDraft}
                auraPresets={auraPresets}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer with 3 Separate Reset Buttons */}
        <DialogFooter className="shrink-0 items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              id="ziga-btn-reset-features"
              onClick={handleResetFeaturesOnly}
              title="Chỉ đặt lại các công tắc tính năng, giữ nguyên mẫu Hào Quang và giao diện HUD"
            >
              <RotateCcw />
              Reset Tính Năng
            </Button>

            <Button
              variant="outline"
              size="sm"
              id="ziga-btn-reset-hud-style"
              onClick={handleResetHudStyleOnly}
              title="Chỉ đặt lại kiểu dáng & màu sắc của bảng HUD về mặc định"
            >
              <Sliders />
              Reset Style HUD
            </Button>

            <Button
              variant="outline"
              size="sm"
              id="ziga-btn-reset-aura"
              onClick={handleResetAuraOnly}
              title="Chỉ đặt lại riêng phần Hào Quang (Aura) về mặc định, giữ nguyên các tính năng khác"
            >
              <Sparkles />
              Reset Riêng Aura
            </Button>

            {toastMsg && (
              <span className="text-primary ml-1 text-xs font-medium">
                {toastMsg}
              </span>
            )}
          </div>

          <Button
            variant="default"
            size="sm"
            id="ziga-btn-save-close"
            onClick={handleSaveAndClose}
          >
            <Save />
            Đóng & Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Singleton Imperative Mounter for ZigaMod
let modalRoot = null;
let modalHost = null;
let setModalStateExternal = null;

function ModalHostWrapper() {
  const [state, setState] = useState({ open: false, tab: "features" });
  useEffect(() => {
    setModalStateExternal = setState;
  }, []);

  return (
    <SettingsModal
      isOpen={state.open}
      initialTab={state.tab}
      onClose={() => setState((s) => ({ ...s, open: false }))}
    />
  );
}

export function ensureSettingsModalMounted() {
  if (!modalHost) {
    modalHost = document.getElementById("ziga-react-settings-host");
    if (!modalHost) {
      modalHost = document.createElement("div");
      modalHost.id = "ziga-react-settings-host";
      modalHost.style.position = "fixed";
      modalHost.style.top = "0";
      modalHost.style.left = "0";
      modalHost.style.width = "0";
      modalHost.style.height = "0";
      modalHost.style.overflow = "visible";
      modalHost.style.pointerEvents = "none";
      const savedTheme =
        typeof localStorage !== "undefined"
          ? localStorage.getItem("ziga_xiangqi_theme_mode") || "dark"
          : "dark";
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
      modalHost.className = `ziga-shadcn-root fixed inset-0 pointer-events-none z-[2147483647] ${savedTheme === "dark" ? "dark" : ""}`;
      document.body.appendChild(modalHost);
    }
    modalRoot = createRoot(modalHost);
    modalRoot.render(<ModalHostWrapper />);
  }
}

export function mountSettingsModal() {
  ensureSettingsModalMounted();
}

export function openReactSettingsModal(tab = "features") {
  ensureSettingsModalMounted();
  setTimeout(() => {
    if (setModalStateExternal) {
      setModalStateExternal({ open: true, tab });
    }
  }, 0);
}

export function closeReactSettingsModal() {
  if (setModalStateExternal) {
    setModalStateExternal((s) => ({ ...s, open: false }));
  }
}
