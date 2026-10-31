import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Settings,
  Palette,
  Sparkles,
  RotateCcw,
  Save,
  Sun,
  Moon
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LivePreviewStage } from './LivePreviewStage';
import { FeaturesTab } from './FeaturesTab';
import { ThemesTab } from './ThemesTab';
import { AuraGalleryTab } from './AuraGalleryTab';
import { uiStore, useUiStore } from '../../lib/ui_store';

const AURA_KEYS = [
  'auraPreset',
  'auraScale',
  'auraSpeed',
  'auraAnimation',
  'customMyAuraColor',
  'customOppAuraColor',
  'customAuraImage'
];

export function applyGlobalThemeMode(mode) {
  const nextMode = mode === 'light' ? 'light' : 'dark';
  uiStore.setState({ themeMode: nextMode });
  try {
    localStorage.setItem('ziga_xiangqi_theme_mode', nextMode);
  } catch (e) {}

  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', nextMode === 'dark');
    const hudEl = document.getElementById('ziga-mod-widget');
    const modalHostEl = document.getElementById('ziga-react-settings-host');
    [hudEl, modalHostEl].forEach((el) => {
      if (!el) return;
      el.classList.toggle('dark', nextMode === 'dark');
    });
  }
}

export function SettingsModal({
  isOpen,
  onClose,
  initialTab = 'features'
}) {
  const ZigaMod = window.ZigaMod || {};
  const defaultSettings = ZigaMod.DEFAULT_SETTINGS || {};
  const auraPresets = ZigaMod.AURA_PRESETS || [];
  const themeMode = useUiStore((s) => s.themeMode) || 'dark';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [draft, setDraft] = useState(() => ({
    ...defaultSettings,
    ...(ZigaMod.userSettings || {})
  }));
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDraft({
        ...defaultSettings,
        ...(ZigaMod.userSettings || {})
      });
      if (initialTab) setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2200);
  }, []);

  const syncToEngineLive = useCallback((nextDraft) => {
    const mod = window.ZigaMod;
    if (!mod) return;
    mod.userSettings = { ...nextDraft };
    if (typeof mod.saveSettings === 'function') {
      mod.saveSettings();
    }
    if (typeof mod.applySettingsVisibility === 'function') {
      mod.applySettingsVisibility();
    }
    if (typeof mod.refreshBoardAuraImmediate === 'function') {
      mod.refreshBoardAuraImmediate();
    }
    const activeData =
      typeof mod.getActiveGameData === 'function' ? mod.getActiveGameData() : null;
    if (activeData && typeof mod.updateBoardAura === 'function') {
      mod.updateBoardAura(activeData);
    }
  }, []);

  const updateDraft = useCallback(
    (patch) => {
      setDraft((prev) => {
        const next = { ...prev, ...patch };
        syncToEngineLive(next);
        return next;
      });
    },
    [syncToEngineLive]
  );

  // Separate Reset #1: Reset Features Only (Preserve Aura Settings)
  const handleResetFeaturesOnly = () => {
    setDraft((prev) => {
      const next = { ...defaultSettings };
      for (const k of AURA_KEYS) {
        if (prev[k] !== undefined) next[k] = prev[k];
      }
      syncToEngineLive(next);
      return next;
    });
    showToast('Đã khôi phục mặc định các Tính Năng (Giữ nguyên Aura)!');
  };

  // Separate Reset #2: Reset Aura Only (Preserve Feature Toggles)
  const handleResetAuraOnly = () => {
    setDraft((prev) => {
      const next = { ...prev };
      for (const k of AURA_KEYS) {
        next[k] = defaultSettings[k];
      }
      syncToEngineLive(next);
      return next;
    });
    showToast('Đã khôi phục mặc định riêng phần Hào Quang (Aura)!');
  };

  const handleSaveAndClose = () => {
    syncToEngineLive(draft);
    onClose();
  };

  const toggleThemeMode = () => {
    const next = themeMode === 'dark' ? 'light' : 'dark';
    applyGlobalThemeMode(next);
    showToast(
      next === 'dark'
        ? 'Đã chuyển sang Chế độ Tối (Dark Mode)'
        : 'Đã chuyển sang Chế độ Sáng (Light Mode)'
    );
  };

  const imageCount = auraPresets.filter((p) => p.style === 'image').length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <DialogHeader className="shrink-0 flex flex-row items-center justify-between border-b pb-3 pr-8">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Settings className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <DialogTitle>Cài Đặt & Tùy Biến Mod</DialogTitle>
                <Badge variant="secondary">shadcn/ui</Badge>
              </div>
              <DialogDescription>
                Bật/tắt công cụ hỗ trợ & tùy chỉnh hào quang bàn cờ Ziga thời gian thực
              </DialogDescription>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleThemeMode}
            title="Chuyển đổi giao diện Sáng / Tối (Dark / Light Mode)"
          >
            {themeMode === 'dark' ? (
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
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-1 pr-1 flex flex-col gap-3.5">
          {activeTab !== 'features' && (
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
            <TabsList className="w-full">
              <TabsTrigger value="features">
                <Settings />
                <span>Cài Đặt Tính Năng</span>
              </TabsTrigger>
              <TabsTrigger value="themes">
                <Palette />
                <span>Chủ Đề & Màu Aura</span>
              </TabsTrigger>
              <TabsTrigger value="gallery">
                <Sparkles />
                <span>Kho {imageCount} Mẫu Aura PNG</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="features">
              <FeaturesTab draft={draft} updateDraft={updateDraft} />
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

        {/* Footer with 2 Separate Reset Buttons */}
        <DialogFooter className="shrink-0 sm:justify-between items-center">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              id="ziga-btn-reset-features"
              onClick={handleResetFeaturesOnly}
              title="Chỉ đặt lại các công tắc tính năng, giữ nguyên mẫu Hào Quang đang chọn"
            >
              <RotateCcw />
              Reset Tính Năng
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
              <span className="ml-1 text-xs font-medium text-primary">
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
  const [state, setState] = useState({ open: false, tab: 'features' });
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
    modalHost = document.getElementById('ziga-react-settings-host');
    if (!modalHost) {
      modalHost = document.createElement('div');
      modalHost.id = 'ziga-react-settings-host';
      const savedTheme =
        typeof localStorage !== 'undefined'
          ? localStorage.getItem('ziga_xiangqi_theme_mode') || 'dark'
          : 'dark';
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      modalHost.className = `ziga-shadcn-root ${savedTheme === 'dark' ? 'dark' : ''}`;
      document.body.appendChild(modalHost);
    }
    modalRoot = createRoot(modalHost);
    modalRoot.render(<ModalHostWrapper />);
  }
}

export function mountSettingsModal() {
  ensureSettingsModalMounted();
}

export function openReactSettingsModal(tab = 'features') {
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
