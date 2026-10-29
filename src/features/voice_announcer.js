// src/features/voice_announcer.js - Vietnamese Voice Announcer & Web Audio Timer Heartbeat
(function (ZigaMod) {
  'use strict';

  console.log('[AN Mod] Voice Announcer module initializing...');

  let audioCtx = null;
  let lastSpokenText = '';
  let lastSpokenTime = 0;
  let lastAnnouncedSecond = -1;
  let heartbeatTimer = null;

  // Web Audio Context Synthesizer (Zero External MP3s)
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Play realistic low-frequency double heartbeat thump
  function playHeartbeatSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // First thump (LUB)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(80, now);
      osc1.frequency.exponentialRampToValueAtTime(45, now + 0.1);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Second thump (DUB) after 140ms
      setTimeout(() => {
        if (!ctx) return;
        const t2 = ctx.currentTime;
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(65, t2);
        osc2.frequency.exponentialRampToValueAtTime(40, t2 + 0.14);
        gain2.gain.setValueAtTime(0.38, t2);
        gain2.gain.exponentialRampToValueAtTime(0.01, t2 + 0.15);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(t2);
        osc2.stop(t2 + 0.15);
      }, 140);
    } catch (e) { }
  }

  // Play wooden piece click thump
  function playPieceClickSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.05);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) { }
  }

  // Speak text using Web Speech Synthesis API
  function speakVietnamese(text, priority) {
    const userSettings = ZigaMod.userSettings || {};
    if (userSettings.voiceAnnouncer === false) return;

    if (!('speechSynthesis' in window)) return;

    const now = Date.now();
    // Anti-spam debounce: do not repeat exact same sentence within 2.5s unless high priority
    if (!priority && text === lastSpokenText && (now - lastSpokenTime) < 2500) {
      return;
    }

    lastSpokenText = text;
    lastSpokenTime = now;

    try {
      if (priority) {
        window.speechSynthesis.cancel(); // Cancel queued low-priority speech
      }

      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'vi-VN';
      utter.rate = 1.05; // Slightly faster for game responsiveness
      utter.pitch = 1.0;
      utter.volume = 0.9;

      // Select Vietnamese voice if available
      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => v.lang === 'vi-VN' || v.lang.startsWith('vi'));
      if (viVoice) {
        utter.voice = viVoice;
      }

      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn('[AN Mod] Speech error:', e);
    }
  }

  // Announce key game events
  function announceCapture(pieceType, isMyCapture) {
    const names = {
      3: 'Bắt Xe!',
      4: 'Bắt Pháo!',
      5: 'Bắt Mã!',
      0: 'Chiếu Tướng!'
    };
    if (names[pieceType]) {
      const prefix = isMyCapture ? 'Tuyệt chiêu ' : 'Cẩn thận ';
      speakVietnamese(names[pieceType], true);
    }
  }

  function announceCheck() {
    speakVietnamese('Chiếu tướng!', true);
  }

  function announceThreatKing() {
    speakVietnamese('Nguy hiểm! Cảnh báo sát cuộc!', true);
  }

  // Check and run timer countdown alert
  function updateTimerAlerts(gameLayer) {
    const userSettings = ZigaMod.userSettings || {};
    if (userSettings.timerAlertVoice === false) return;

    if (!gameLayer || !gameLayer.T) return;

    try {
      const timerObj = gameLayer.T();
      if (!timerObj || timerObj.Fb !== 2) return; // Only active during in-turn state

      const isMyTurn = (gameLayer.Yc === gameLayer.Nj);
      if (!isMyTurn) return; // Only alert for player's turn

      const remainSeconds = Math.floor(timerObj.mc || 0);

      // Heartbeat between 6 and 15 seconds
      if (remainSeconds > 5 && remainSeconds <= 15) {
        if (remainSeconds !== lastAnnouncedSecond) {
          lastAnnouncedSecond = remainSeconds;
          playHeartbeatSound();
        }
      }

      // Voice countdown 5, 4, 3, 2, 1
      if (remainSeconds >= 1 && remainSeconds <= 5) {
        if (remainSeconds !== lastAnnouncedSecond) {
          lastAnnouncedSecond = remainSeconds;
          speakVietnamese(`${remainSeconds}`, true);
        }
      }
    } catch (e) { }
  }

  // Export to namespace
  ZigaMod.speakVietnamese = speakVietnamese;
  ZigaMod.announceCapture = announceCapture;
  ZigaMod.announceCheck = announceCheck;
  ZigaMod.announceThreatKing = announceThreatKing;
  ZigaMod.playPieceClickSound = playPieceClickSound;
  ZigaMod.playHeartbeatSound = playHeartbeatSound;
  ZigaMod.updateTimerAlerts = updateTimerAlerts;

})(window.ZigaMod = window.ZigaMod || {});
