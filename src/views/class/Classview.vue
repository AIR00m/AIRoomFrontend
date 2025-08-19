<template>
  <div class="platform-container" :class="{ 'dark-mode': darkMode }">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">
          <i class="bi bi-arrow-left"></i>
        </button>
        <span class="title">{{ currentTitle }}</span>
        <div class="title-decoration">
          <i class="bi bi-star-fill star-decoration"></i>
        </div>
      </div>
      <div class="header-buttons">
        <button
          class="header-btn"
          v-for="button in headerButtons"
          :key="button.text"
          @click="handleHeaderButton(button.action)"
        >
          <i :class="button.icon"></i>
          {{ button.text }}
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="content-area">
      <!-- Main Content -->
      <div class="main-content">
        <div class="lesson-frame">
          <div
            class="lesson-content"
            ref="lessonContent"
            :class="{ 'drawing-mode': isDrawingMode }"
          >
            <!-- Fabric.js Canvas -->
            <canvas
              ref="drawingCanvas"
              id="drawing-canvas"
              :class="{ 'drawing-active': isDrawingMode }"
            ></canvas>

            <!-- Drawing Tools -->
            <div v-if="isDrawingMode" class="drawing-tools">
              <div class="tool-group">
                <button
                  class="tool-btn"
                  :class="{ active: currentTool === 'pen' }"
                  @click.stop="setTool('pen')"
                  title="펜"
                >
                  <i class="bi bi-pencil"></i>
                </button>
                <button
                  class="tool-btn"
                  :class="{ active: currentTool === 'eraser' }"
                  @click.stop="setTool('eraser')"
                  title="지우개"
                  :disabled="!eraserSupported"
                >
                  <i class="bi bi-eraser"></i>
                </button>
                <button
                  class="tool-btn"
                  @click.stop="clearCanvas"
                  title="전체 지우기"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>

              <div class="tool-group">
                <label class="tool-label">굵기:</label>
                <input
                  type="range"
                  min="1"
                  max="60"
                  v-model="brushWidth"
                  @input.stop="updateBrushWidth"
                  class="width-slider"
                />
                <span class="width-display">{{ brushWidth }}px</span>
              </div>

              <div class="tool-group">
                <label class="tool-label">색상:</label>
                <div class="color-palette">
                  <button
                    v-for="color in colors"
                    :key="color"
                    class="color-btn"
                    :style="{ backgroundColor: color }"
                    :class="{ active: currentColor === color }"
                    @click.stop="setColor(color)"
                  ></button>
                </div>
              </div>

              <button
                class="close-drawing-btn"
                @click.stop="toggleDrawingMode"
                title="그리기 모드 종료"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-title">
            <i class="bi bi-journal-bookmark"></i>
            목록 접기
          </div>
        </div>

        <div class="sidebar-section">
          <div class="section-title">
            <i class="bi bi-controller"></i> 학습 모드
          </div>
          <div
            v-for="toggleItem in toggleItems"
            :key="toggleItem.id"
            class="sidebar-item"
            :class="{ active: toggleItem.enabled }"
          >
            <div class="sidebar-item-content">
              <div class="sidebar-icon">
                <i :class="toggleItem.icon"></i>
              </div>
              <span class="sidebar-text">{{ toggleItem.text }}</span>
            </div>
            <div
              v-if="toggleItem.hasToggle"
              class="toggle-switch"
              :class="{ active: toggleItem.enabled }"
              @click="toggleSwitch(toggleItem.id)"
            >
              <div class="toggle-knob"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Controls -->
    <div class="bottom-controls">
      <div class="nav-controls">
        <button
          class="nav-btn prev-btn"
          @click="previousPage"
          :disabled="currentPage <= 1"
        >
          <i class="bi bi-chevron-left"></i>
          이전
        </button>
        <div class="page-info">
          <span class="page-current">{{ currentPage }}</span>
          <span class="page-divider">
            <i class="bi bi-star-fill"></i>
          </span>
          <span class="page-total">{{ totalPages }}</span>
        </div>
        <button
          class="nav-btn next-btn"
          @click="nextPage"
          :disabled="currentPage >= totalPages"
        >
          다음
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>

      <div class="control-buttons">
        <button
          class="control-btn"
          :class="{ active: isDrawingMode }"
          title="그리기 모드"
          @click="toggleDrawingMode"
        >
          <i class="bi bi-pencil"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ClassViewPage",
  data() {
    return {
      currentTitle: "Opening",
      currentQuestion: "Do You Have a Pencil?",
      currentPage: 1,
      totalPages: 17,
      darkMode: false,

      // Drawing
      isDrawingMode: false,
      canvas: null,
      fabric: null, // v6: 모듈 객체(네임드 익스포트 모음)
      EraserBrush: null, // @erase2d/fabric 제공(또는 일부 커스텀 빌드)
      eraserSupported: false,

      currentTool: "pen",
      currentColor: "#000000",
      brushWidth: 5,
      colors: [
        "#000000",
        "#FF0000",
        "#00FF00",
        "#0000FF",
        "#FFFF00",
        "#FF00FF",
        "#00FFFF",
        "#FFA500",
        "#800080",
        "#008000",
        "#800000",
        "#000080",
      ],

      headerButtons: [
        {
          text: "전체화면",
          action: "fullscreen",
          icon: "bi bi-arrows-fullscreen",
        },
        { text: "", action: "close", icon: "bi bi-x-lg" },
      ],
      toggleItems: [
        {
          id: "focus",
          icon: "bi bi-gem",
          text: "집중학습 모드",
          hasToggle: true,
          enabled: false,
        },
        {
          id: "dark",
          icon: "bi bi-moon",
          text: "깜깜이 모드",
          hasToggle: true,
          enabled: false,
        },
        {
          id: "monitoring",
          icon: "bi bi-people",
          text: "학생별 모니터링",
          hasToggle: false,
          enabled: false,
        },
      ],
    };
  },
  async mounted() {
    document.addEventListener("click", this.handleOutsideClick);

    // 1) fabric(v6) 로드
    try {
      const mod = await import("fabric");
      // v6는 네임드 익스포트라 mod 자체에 클래스들이 붙어있습니다.
      this.fabric = mod.default || mod;
      console.log("fabric version:", this.fabric.version || "v6+ (module)");
    } catch (e) {
      console.error("fabric 로드 실패:", e);
      return;
    }

    // 2) 지우개 플러그인(@erase2d/fabric) 시도 — 설치되어 있으면 자동 활성화
    try {
      const erb = await import("@erase2d/fabric");
      this.EraserBrush = erb.EraserBrush;
      this.eraserSupported = !!this.EraserBrush;
      if (this.eraserSupported) {
        console.log("EraserBrush from @erase2d/fabric 활성화");
      }
    } catch (e) {
      // 설치가 안 되어 있으면 여기로 옵니다. (펜만 동작)
      this.eraserSupported = false;
      console.warn(
        "지우개 플러그인이 설치되어 있지 않습니다. `npm i @erase2d/fabric` 후 다시 실행하세요."
      );
    }

    // 3) 캔버스 초기화 및 리사이즈
    this.$nextTick(() => this.initializeCanvas());
    window.addEventListener("resize", this.resizeCanvas);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleOutsideClick);
    window.removeEventListener("resize", this.resizeCanvas);
    if (this.canvas) this.canvas.dispose();
  },
  methods: {
    initializeCanvas() {
      if (
        !this.fabric ||
        !this.$refs.drawingCanvas ||
        !this.$refs.lessonContent
      )
        return;

      const canvasElement = this.$refs.drawingCanvas;
      const rect = this.$refs.lessonContent.getBoundingClientRect();

      if (this.canvas) this.canvas.dispose();

      this.canvas = new this.fabric.Canvas(canvasElement, {
        isDrawingMode: false,
        selection: false,
        backgroundColor: "transparent",
        width: rect.width,
        height: rect.height,
      });

      // 방금 그린 path도 지우개 대상이 되도록
      this.canvas.on("path:created", (e) => {
        const p = e.path || e.target;
        if (p && typeof p.set === "function") p.set({ erasable: true });
      });

      this.canvas.requestRenderAll();
      this.resizeCanvas();
    },

    resizeCanvas() {
      if (!this.canvas || !this.$refs.lessonContent) return;
      const w = this.$refs.lessonContent.clientWidth;
      const h = this.$refs.lessonContent.clientHeight;
      this.canvas.setDimensions({ width: w, height: h });
      this.canvas.requestRenderAll();
    },

    toggleDrawingMode() {
      this.isDrawingMode = !this.isDrawingMode;
      if (!this.canvas) this.initializeCanvas();
      if (!this.canvas) return;

      if (this.isDrawingMode) {
        this.setTool("pen");
        this.canvas.selection = false;
      } else {
        this.canvas.isDrawingMode = false;
        this.canvas.selection = true;
      }
      this.canvas.requestRenderAll();
    },

    setTool(tool) {
      this.currentTool = tool;
      if (!this.canvas) {
        this.initializeCanvas();
        if (!this.canvas) return;
      }

      if (tool === "pen") {
        this.canvas.isDrawingMode = true;
        const brush = new this.fabric.PencilBrush(this.canvas);
        brush.color = this.currentColor;
        brush.width = parseInt(this.brushWidth);
        this.canvas.freeDrawingBrush = brush;
      } else if (tool === "eraser") {
        if (this.eraserSupported && this.EraserBrush) {
          const ebrush = new this.EraserBrush(this.canvas);
          ebrush.width = parseInt(this.brushWidth);
          this.canvas.freeDrawingBrush = ebrush;
          this.canvas.isDrawingMode = true;
        } else {
          // 플러그인 미설치 시 안내
          console.warn(
            "지우개를 사용하려면 `npm i @erase2d/fabric`를 설치하세요."
          );
          // 안전하게 펜으로 되돌림
          this.currentTool = "pen";
          this.setTool("pen");
          return;
        }
      }
      this.canvas.requestRenderAll();
    },

    setColor(color) {
      this.currentColor = color;
      if (
        this.canvas &&
        this.canvas.freeDrawingBrush &&
        this.currentTool === "pen"
      ) {
        this.canvas.freeDrawingBrush.color = color;
        this.canvas.requestRenderAll();
      }
    },

    updateBrushWidth() {
      if (!this.canvas || !this.canvas.freeDrawingBrush) return;
      this.canvas.freeDrawingBrush.width = parseInt(this.brushWidth);
      this.canvas.requestRenderAll();
    },

    clearCanvas() {
      if (!this.canvas) return;
      this.canvas.clear();
      this.canvas.backgroundColor = "transparent";
      this.canvas.requestRenderAll();
    },

    // 기타 UI
    goBack() {
      console.log("back");
    },
    handleHeaderButton(action) {
      if (action === "fullscreen") this.toggleFullscreen();
      else if (action === "close") this.closeApplication();
    },
    toggleSwitch(id) {
      const item = this.toggleItems.find((i) => i.id === id);
      if (!item || !item.hasToggle) return;
      item.enabled = !item.enabled;
      if (id === "dark") this.darkMode = item.enabled;
    },
    handleTool(toolId) {
      console.log("tool:", toolId);
    },
    previousPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    handleControlButton(a) {
      console.log("control:", a);
    },
    handleOutsideClick(e) {
      if (!e.target.closest(".dropdown")) {
      }
    },
    toggleFullscreen() {
      if (!document.fullscreenElement)
        document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    },
    closeApplication() {
      console.log("close");
    },
  },
};
</script>

<!-- Bootstrap Icons CDN -->
<style>
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css");
</style>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.platform-container {
  font-family: "Comic Sans MS", "Segoe UI", -apple-system, BlinkMacSystemFont,
    sans-serif;
  background: #fff9e6;
  height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    "header header"
    "content sidebar"
    "bottom bottom";
  transition: 0.3s;
}
.platform-container.dark-mode {
  background: #2c3e50;
}

.header {
  grid-area: header;
  background: #ff9800;
  color: #fff;
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 0.25rem 1.25rem rgba(255, 152, 0, 0.3);
  border-bottom: 0.1875rem solid #ffe066;
  z-index: 400;
  min-height: 4.375rem;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}
.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 15px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: 0.3s;
}
.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
}
.title {
  font-size: 20px;
  font-weight: 800;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}
.star-decoration {
  animation: sparkle 2s ease-in-out infinite;
}
@keyframes sparkle {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    opacity: 0.8;
  }
}
.header-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.header-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 10px 18px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: 0.3s;
  font-weight: 600;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
}
.header-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
}

.content-area {
  grid-area: content;
  display: flex;
  min-height: 0;
}
.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
}

.lesson-frame {
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 25px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(255, 152, 0, 0.2);
  border: 4px solid #ffe066;
  position: relative;
  animation: bounceIn 0.8s ease;
}
@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.lesson-content {
  width: 100%;
  height: 100%;
  background: #f0f8ff;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* ---------- Fabric 캔버스 클릭/그리기 패치 (scoped + :deep) ---------- */
.lesson-content :deep(.canvas-container) {
  position: absolute;
  inset: 0;
  z-index: 20;
}
.lesson-content.drawing-mode * {
  pointer-events: none !important;
}
.lesson-content.drawing-mode :deep(.canvas-container),
.lesson-content.drawing-mode :deep(.upper-canvas),
.lesson-content.drawing-mode :deep(.lower-canvas),
.lesson-content.drawing-mode .drawing-tools,
.lesson-content.drawing-mode .drawing-tools * {
  pointer-events: auto !important;
}
.lesson-content.drawing-mode :deep(.upper-canvas) {
  cursor: crosshair;
}
.drawing-tools {
  z-index: 30;
}
/* -------------------------------------------------------------------- */

#drawing-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.drawing-tools {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 2px solid #ffe066;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  max-width: calc(100% - 40px);
}
.tool-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.tool-btn {
  background: #f0f0f0;
  border: 2px solid #ddd;
  color: #333;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  transition: 0.3s;
  min-width: 40px;
}
.tool-btn[disabled] {
  opacity: 0.45;
  cursor: not-allowed;
}
.tool-btn:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
}
.tool-btn.active {
  background: #3498db;
  border-color: #2980b9;
  color: #fff;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}
.tool-label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  white-space: nowrap;
}
.width-slider {
  width: 120px;
  margin: 0 5px;
}
.width-display {
  font-size: 11px;
  font-weight: 600;
  color: #666;
  min-width: 36px;
  text-align: center;
}
.color-palette {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.color-btn {
  width: 24px;
  height: 24px;
  border: 2px solid #ddd;
  border-radius: 50%;
  cursor: pointer;
  transition: 0.3s;
  position: relative;
}
.color-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
.color-btn.active {
  border-color: #333;
  transform: scale(1.2);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.3);
}
.color-btn.active::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}
.close-drawing-btn {
  background: #e74c3c;
  border: 2px solid #c0392b;
  color: #fff;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: 0.3s;
  margin-left: auto;
}
.close-drawing-btn:hover {
  background: #c0392b;
  transform: scale(1.05);
}

.sidebar {
  grid-area: sidebar;
  width: 25vw;
  min-width: 15rem;
  max-width: 20rem;
  background: #2c3e50;
  color: #fff;
  padding: 1rem;
  overflow-y: auto;
  border-left: 0.25rem solid #3498db;
  box-shadow: -0.3rem 0 1.25rem rgba(52, 73, 94, 0.3);
}
.sidebar-header {
  margin-bottom: 30px;
}
.sidebar-title {
  color: #3498db;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: rgba(52, 152, 219, 0.1);
  border-radius: 15px;
  border: 2px solid rgba(52, 152, 219, 0.3);
}
.sidebar-section {
  margin-bottom: 30px;
}
.section-title {
  color: #3498db;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 15px;
  padding: 10px 15px;
  background: rgba(52, 152, 219, 0.1);
  border-radius: 10px;
  border-left: 4px solid #3498db;
  display: flex;
  align-items: center;
  gap: 8px;
}
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  border-radius: 0.875rem;
  cursor: pointer;
  transition: 0.3s;
  margin-bottom: 0.5rem;
  border: 0.125rem solid transparent;
  justify-content: space-between;
}
.sidebar-item-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}
.sidebar-item:hover {
  background: rgba(52, 152, 219, 0.1);
  transform: translateX(5px);
  border-color: rgba(52, 152, 219, 0.3);
}
.sidebar-item.active {
  background: #3498db;
  border-color: #5dade2;
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
}
.sidebar-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}
.sidebar-text {
  flex: 1;
  font-weight: 600;
  font-size: 14px;
}
.toggle-switch {
  width: 3rem;
  height: 1.5rem;
  background: #7f8c8d;
  border-radius: 1.5rem;
  position: relative;
  cursor: pointer;
  transition: 0.3s;
  border: 0.125rem solid #95a5a6;
  flex-shrink: 0;
}
.toggle-switch.active {
  background: #27ae60;
  border-color: #2ecc71;
  box-shadow: 0 0 10px rgba(39, 174, 96, 0.3);
}
.toggle-knob {
  width: 1.25rem;
  height: 1.25rem;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  transition: 0.3s;
  box-shadow: 0 0.125rem 0.3125rem rgba(0, 0, 0, 0.2);
}
.toggle-switch.active .toggle-knob {
  transform: translateX(1.5rem);
}

.bottom-controls {
  grid-area: bottom;
  background: #34495e;
  color: #fff;
  padding: 1.125rem 1.25rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 0.1875rem solid #3498db;
  box-shadow: 0 -0.3125rem 1.25rem rgba(52, 73, 94, 0.3);
  min-height: 5.3125rem;
}
.nav-controls {
  display: flex;
  align-items: center;
  gap: 25px;
  justify-content: center;
}
.nav-btn {
  background: #3498db;
  border: 2px solid #5dade2;
  color: #fff;
  padding: 12px 20px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  transition: 0.3s;
  min-width: 100px;
  justify-content: center;
}
.nav-btn:hover:not(:disabled) {
  background: #5dade2;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(52, 152, 219, 0.4);
}
.nav-btn:disabled {
  background: #7f8c8d;
  border-color: #95a5a6;
  cursor: not-allowed;
  opacity: 0.6;
}
.nav-icon {
  font-size: 16px;
}
.page-info {
  background: rgba(52, 152, 219, 0.2);
  padding: 12px 20px;
  border-radius: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 2px solid rgba(52, 152, 219, 0.3);
  min-width: 120px;
  justify-content: center;
}
.page-current {
  color: #3498db;
  font-size: 18px;
}
.page-divider {
  font-size: 14px;
  animation: sparkle 2s ease-in-out infinite;
}
.page-total {
  color: #ecf0f1;
  font-size: 16px;
}

.control-buttons {
  position: absolute;
  right: 20px;
  display: flex;
  gap: 12px;
}
.control-btn {
  background: #e74c3c;
  border: 2px solid #e67e22;
  color: #fff;
  padding: 12px;
  border-radius: 50%;
  cursor: pointer;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.3s;
}
.control-btn:hover {
  background: #ec7063;
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 8px 20px rgba(231, 76, 60, 0.4);
}
.control-btn.active {
  background: #27ae60;
  border-color: #2ecc71;
  box-shadow: 0 0 20px rgba(39, 174, 96, 0.5);
}
.control-icon {
  font-size: 20px;
}

.platform-container.dark-mode .lesson-frame {
  background: #2c3e50;
  border-color: #3498db;
}
.platform-container.dark-mode .lesson-content {
  background: #34495e;
}
.platform-container.dark-mode .drawing-tools {
  background: rgba(44, 62, 80, 0.95);
  border-color: #3498db;
  color: #fff;
}
.platform-container.dark-mode .tool-btn {
  background: #34495e;
  border-color: #3498db;
  color: #fff;
}
.platform-container.dark-mode .tool-btn:hover {
  background: #2c3e50;
}
.platform-container.dark-mode .tool-label,
.platform-container.dark-mode .width-display {
  color: #ecf0f1;
}

@media (max-width: 1200px) {
  .platform-container {
    grid-template-rows: 70px 1fr 150px 85px;
    grid-template-areas:
      "header header"
      "content content"
      "sidebar sidebar"
      "bottom bottom";
  }
  .sidebar {
    width: 100%;
    height: 150px;
    padding: 15px 20px;
    overflow-x: auto;
    overflow-y: hidden;
  }
  .sidebar-section {
    display: flex;
    gap: 15px;
    margin-bottom: 10px;
  }
  .sidebar-item {
    min-width: 180px;
    flex-shrink: 0;
    padding: 10px;
  }
  .drawing-tools {
    position: fixed;
    top: 80px;
    left: 10px;
    right: 10px;
    max-width: none;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 8px 15px;
    min-height: 60px;
  }
  .header-btn {
    font-size: 12px;
    padding: 6px 12px;
  }
  .platform-container {
    grid-template-rows: 60px 1fr 120px 70px;
  }
  .sidebar {
    height: 120px;
    padding: 10px 15px;
  }
  .bottom-controls {
    padding: 10px 15px;
  }
  .nav-btn {
    padding: 8px 15px;
    font-size: 12px;
    min-width: 80px;
  }
  .control-btn {
    width: 40px;
    height: 40px;
  }
  .drawing-tools {
    top: 70px;
    left: 5px;
    right: 5px;
    padding: 10px;
    gap: 8px;
  }
  .tool-btn {
    padding: 6px 8px;
    font-size: 14px;
    min-width: 30px;
  }
  .width-slider {
    width: 60px;
  }
  .color-btn {
    width: 20px;
    height: 20px;
  }
}
</style>
