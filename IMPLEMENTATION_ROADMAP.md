# 🗺️ Secret Rooms Implementation Roadmap

**Based on**: `SONIC_CODEX_MASTER_PLAN.md`  
**Current Status**: See `SECRET_ROOMS_IMPLEMENTATION_STATUS.md`

---

## 🎯 Quick Start Guide

### Phase 1: Get Core Features Working (Week 1-2)

#### Day 1-2: Sonic Codex Foundation
1. ✅ **Setup Complete**: FastAPI backend structure exists
2. 🔄 **Next**: Implement actual Whisper transcription
   ```bash
   pip install faster-whisper
   ```
   - Update `backend/modules/sonic/transcription/whisper_engine.py` with real model loading
   - Test with sample audio file

3. 🔄 **Next**: Create Wizard Flow UI
   - Build `src/components/trapdoor/sonic/WizardFlow.tsx`
   - Implement step-by-step flow (Import → Metadata → Enhance → Transcribe → Review → Export)

#### Day 3-4: URL Extraction
4. 🔄 **Next**: Add yt-dlp integration
   ```bash
   pip install yt-dlp
   ```
   - Update `backend/modules/sonic/extractor.py` to use yt-dlp
   - Create `URLPull.tsx` component

#### Day 5-7: Job Management
5. 🔄 **Next**: Build Job Library screen
   - Create `JobLibrary.tsx` with grid/list view
   - Add search and filter functionality
   - Connect to `/api/v1/trapdoor/sonic/jobs` endpoint

6. 🔄 **Next**: Build Job Details screen
   - Create `JobDetails.tsx` with audio player
   - Add transcript viewer with click-to-jump
   - Implement export buttons

---

### Phase 2: Enhancement & Polish (Week 3-4)

#### Week 3: Audio Enhancement
7. 🔄 **Next**: Complete noise reduction
   ```bash
   pip install noisereduce librosa
   ```
   - Update `preprocess.py` with full noise reduction
   - Add RMS normalization

8. 🔄 **Next**: Add Wavesurfer.js waveform
   ```bash
   npm install wavesurfer.js
   ```
   - Create `Waveform.tsx` component
   - Integrate with audio player

9. 🔄 **Next**: Add spectrogram visualization
   - Create `Spectrogram.tsx` component
   - Use Canvas or WebGL for rendering

#### Week 4: Advanced Features
10. 🔄 **Next**: Speaker diarization
    ```bash
    pip install pyannote.audio
    ```
    - Configure HuggingFace token
    - Update `diarization.py` with real implementation

11. 🔄 **Next**: WebSocket heartbeat
    - Add auto-reconnect logic
    - Implement resume in-flight jobs

---

### Phase 3: Ghost Codex Completion (Week 5)

12. 🔄 **Next**: Complete canary tokens
    - Implement HTML beacon in `canary.py`
    - Create `CanaryDashboard.tsx` component

13. 🔄 **Next**: Folder sweep
    - Add recursive folder processing to `shredder.py`

---

### Phase 4: Pandora Codex Chain-Breaker (Week 6)

14. 🔄 **Next**: Apple device detection
    - Add VID/PID constants to `detector.py`
    - Implement DFU mode identification

15. 🔄 **Next**: Chain-Breaker UI
    - Create all UI components (DevicePulse, ExploitSelector, ConsoleLog, SafetyInterlock)
    - Build `ChainBreakerDashboard.tsx`
    - Apply Night-Ops theme

---

## 🚀 Immediate Action Items

### This Week

1. **Install missing Python dependencies**:
   ```bash
   pip install faster-whisper yt-dlp noisereduce librosa webrtcvad
   ```

2. **Implement Whisper transcription**:
   - Edit `backend/modules/sonic/transcription/whisper_engine.py`
   - Load Whisper-Large-v3 model
   - Test with sample audio

3. **Create Wizard Flow component**:
   - Start with `src/components/trapdoor/sonic/WizardFlow.tsx`
   - Use Zustand for state management
   - Implement 6-step flow

4. **Add URL extraction**:
   - Update `extractor.py` to use yt-dlp
   - Create `URLPull.tsx` component

---

## 📦 Dependencies Checklist

### Python (requirements.txt)
- [x] fastapi, uvicorn
- [x] pyaudio, soundfile, numpy, scipy
- [x] openai-whisper
- [x] Pillow
- [x] pyusb
- [ ] faster-whisper ⚠️ **NEEDS INSTALL**
- [ ] yt-dlp ⚠️ **NEEDS INSTALL**
- [ ] noisereduce ⚠️ **NEEDS INSTALL**
- [ ] librosa ⚠️ **NEEDS INSTALL**
- [ ] webrtcvad ⚠️ **NEEDS INSTALL**
- [ ] pyannote.audio (optional, requires HuggingFace token)

### Node.js (package.json)
- [ ] wavesurfer.js ⚠️ **NEEDS INSTALL** (for waveform visualization)

### System Dependencies
- [ ] FFmpeg (for audio/video processing)
- [ ] PortAudio (for PyAudio)
- [ ] LibUSB (for PyUSB)

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] Audio enhancement functions
- [ ] File naming logic
- [ ] Manifest generation

### Integration Tests
- [ ] Full pipeline: Upload → Enhance → Transcribe → Export
- [ ] WebSocket reconnection
- [ ] Job state transitions

### E2E Tests
- [ ] Complete wizard flow
- [ ] Job library navigation
- [ ] Export package download

---

## 📝 Documentation Tasks

- [ ] API documentation (OpenAPI/Swagger)
- [ ] User guide for each Secret Room
- [ ] Developer setup guide
- [ ] Troubleshooting guide
- [ ] Performance optimization notes

---

## 🎨 UI/UX Polish Tasks

- [ ] Loading states for all async operations
- [ ] Error handling and user-friendly messages
- [ ] Responsive design for mobile
- [ ] Dark mode consistency
- [ ] Animation transitions
- [ ] Accessibility (ARIA labels, keyboard navigation)

---

## 🔒 Security Tasks

- [ ] Phoenix Key authentication implementation
- [ ] MAC address lock for Pandora Codex
- [ ] Rate limiting on API endpoints
- [ ] File upload size limits
- [ ] Input sanitization

---

## 📊 Progress Tracking

**Use this checklist to track weekly progress:**

### Week 1 Goals
- [ ] Whisper transcription working
- [ ] Wizard Flow UI complete
- [ ] URL extraction functional
- [ ] Job Library screen done

### Week 2 Goals
- [ ] Job Details screen complete
- [ ] Waveform visualization working
- [ ] Noise reduction enhanced
- [ ] WebSocket heartbeat stable

### Week 3 Goals
- [ ] Speaker diarization working
- [ ] Spectrogram visualization
- [ ] Canary tokens complete
- [ ] Ghost Codex polished

### Week 4 Goals
- [ ] Chain-Breaker UI complete
- [ ] DFU detection working
- [ ] All tests passing
- [ ] Documentation updated

---

**Remember**: Start with core functionality, then add polish. Don't try to implement everything at once!
