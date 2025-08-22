<template>
  <div class="platform-container" :class="{ 'dark-mode': darkMode }">
    <link
      href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.0/font/bootstrap-icons.min.css"
      rel="stylesheet"
    />

    <div class="header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">
          <i class="bi bi-arrow-left"></i>
        </button>
        <span class="title">{{ currentTitle }}</span>
        <div class="title-decoration">
          <i class="bi bi-star-fill"></i>
        </div>
      </div>
      <div class="header-buttons">
        <button
          class="header-btn"
          v-for="button in headerButtons"
          :key="button.text"
          @click="handleHeaderButton(button.action)"
          v-html="button.text"
        ></button>
      </div>
    </div>

    <div class="content-area">
      <div class="main-content">
        <div class="lesson-frame">
          <div class="lesson-content">
            <div v-if="pdfLoading" class="pdf-loading">
              <div class="loading-spinner">
                <i class="bi bi-arrow-clockwise"></i>
              </div>
              <div class="loading-text">PDF 파일을 불러오는 중...</div>
            </div>

            <div v-else-if="pdfError" class="pdf-error">
              <div class="error-icon">
                <i class="bi bi-exclamation-triangle"></i>
              </div>
              <div class="error-text">PDF 파일을 불러올 수 없습니다.</div>
              <div class="error-details">
                파일 경로를 확인하거나 유효한 PDF 파일인지 확인해주세요.
              </div>
              <div class="error-suggestions">
                <p><strong>해결 방법:</strong></p>
                <ul>
                  <li>example.pdf 파일이 프로젝트 public 폴더에 있는지 확인</li>
                  <li>PDF 파일이 손상되지 않았는지 확인</li>
                  <li>웹 서버를 통해 접근하고 있는지 확인</li>
                </ul>
              </div>
              <button class="retry-btn" @click="loadPDF">다시 시도</button>
              <button class="demo-btn" @click="loadDemoPDF">
                데모 PDF 로드
              </button>
            </div>

            <div v-else class="pdf-viewer" ref="pdfViewer">
              <canvas
                ref="drawingCanvas"
                class="drawing-canvas"
                @mousedown="startDrawing"
                @mousemove="draw"
                @mouseup="stopDrawing"
                @mouseleave="stopDrawing"
                @touchstart.prevent="startDrawing"
                @touchmove.prevent="draw"
                @touchend.prevent="stopDrawing"
              ></canvas>

              <canvas
                ref="pdfCanvas"
                class="pdf-canvas"
                :style="canvasStyle"
              ></canvas>

              <canvas
                v-if="twoPageView && currentPage < totalPages"
                ref="pdfCanvas2"
                class="pdf-canvas pdf-canvas-second"
                :style="canvasStyle"
              ></canvas>
            </div>
          </div>
        </div>
      </div>

      <div class="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-title">
            <i class="bi bi-house-fill"></i>
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
              <i :class="'bi ' + toggleItem.icon"></i>
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

        <div class="sidebar-section">
          <div class="section-title">
            <i class="bi bi-layout-split"></i> 페이지 보기
          </div>
          <div
            class="sidebar-item"
            :class="{ active: twoPageView }"
            @click="toggleTwoPageView"
          >
            <div class="sidebar-item-content">
              <i class="bi bi-book-half"></i>
              <span class="sidebar-text">2페이지씩 보기</span>
            </div>
            <div class="toggle-switch" :class="{ active: twoPageView }">
              <div class="toggle-knob"></div>
            </div>
          </div>
        </div>

        <div class="sidebar-section" v-if="totalPages > 0">
          <div class="section-title">
            <i class="bi bi-zoom-in"></i> 화면 크기
            <span class="scale-badge">{{ Math.round(pdfScale * 100) }}%</span>
          </div>
          <div class="sidebar-item" @click="zoomOut">
            <div class="sidebar-item-content">
              <i class="bi bi-zoom-out"></i>
              <span class="sidebar-text">축소</span>
            </div>
          </div>
          <div class="sidebar-item" @click="zoomIn">
            <div class="sidebar-item-content">
              <i class="bi bi-zoom-in"></i>
              <span class="sidebar-text">확대</span>
            </div>
          </div>
          <div class="sidebar-item" @click="fitToWidth(true)">
            <div class="sidebar-item-content">
              <i class="bi bi-arrows-angle-expand"></i>
              <span class="sidebar-text">폭 맞춤</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-controls">
      <div class="nav-controls">
        <button
          class="nav-btn prev-btn"
          @click="previousPage"
          :disabled="currentPage <= 1"
        >
          <i class="bi bi-arrow-left"></i>
          이전
        </button>
        <div class="page-info">
          <span class="page-current">{{ currentPage }}</span>
          <i class="bi bi-star-fill page-divider"></i>
          <span class="page-total">{{ totalPages }}</span>
        </div>
        <button
          class="nav-btn next-btn"
          @click="nextPage"
          :disabled="currentPage >= totalPages"
        >
          다음
          <i class="bi bi-arrow-right"></i>
        </button>
      </div>

      <div class="control-buttons">
        <button
          v-if="!isToolbarVisible"
          class="control-btn"
          title="노트 필기"
          @click="toggleToolbar"
        >
          <i class="bi bi-pencil-fill"></i>
        </button>

        <div v-if="isToolbarVisible" class="drawing-toolbar">
          <button
            class="control-btn tool-btn"
            title="펜"
            :class="{ active: currentTool === 'pen' }"
            @click="selectTool('pen')"
          >
            <i class="bi bi-pencil-fill"></i>
          </button>
          <button
            class="control-btn tool-btn"
            title="지우개"
            :class="{ active: currentTool === 'eraser' }"
            @click="selectTool('eraser')"
          >
            <i class="bi bi-eraser-fill"></i>
          </button>
          <div class="tool-options">
            <input
              type="color"
              v-model="penColor"
              class="color-picker"
              title="색상 선택"
            />
            <div class="width-slider-container">
              <span>{{ penWidth }}px</span>
              <input
                type="range"
                min="1"
                max="50"
                v-model="penWidth"
                class="width-slider"
                title="굵기 조절"
              />
            </div>
          </div>
          <button class="control-btn" title="실행 취소" @click="undo">
            <i class="bi bi-arrow-counterclockwise"></i>
          </button>
          <button class="control-btn" title="다시 실행" @click="redo">
            <i class="bi bi-arrow-clockwise"></i>
          </button>
          <button
            class="control-btn"
            title="전체 삭제"
            @click="clearCurrentPage"
          >
            <i class="bi bi-trash-fill"></i>
          </button>
          <button
            class="control-btn tool-btn-close"
            title="닫기"
            @click="closeDrawing"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { markRaw, toRaw, nextTick } from "vue";

export default {
  name: "PDFViewerPlatform",
  data() {
    return {
      currentTitle: "PDF Viewer", //pdf 제목
      currentPage: 1, //현재 페이지
      totalPages: 0, //총 페이지
      darkMode: false, //깜깜이 모드
      twoPageView: false, //2페이지씩 보기 여부
      twoPageGap: 20, //2페이지씩 보기 간격
      fitMode: "auto", //폭 맞춤
      fitFactor: 0.7, //여백 비율
      pdfDoc: null, //pdf 문서 객체
      pdfLoading: true, //pdf 로딩중 여부
      pdfError: false, //pdf 로딩 실패 여부
      pdfScale: 1.0, //현재 페이지 크기
      initialScale: 0.5, //현재 pdf 크기
      currentRenderTask: null, //첫번째 페이지
      currentRenderTask2: null, //두번째 페이지
      pdfjsLib: null, //pdfjs 기본세팅
      isDrawing: false, //그리기 여부(현재 그리고 있는지)
      drawingContext: null, //CanvasRenderingContext2D객체
      currentTool: "pen", //선택 도구
      penColor: "#e74c3c", //펜 색상
      penWidth: 5, //펜 굵기
      allDrawings: {}, //페이지별 드로잉 저장소
      currentPath: null, //현재 그리고 있는 획
      lastPosition: { x: 0, y: 0 }, //그리는중일 때 직전 마우스 위치 좌표
      isToolbarVisible: false, //그리기 기능 그림 보일지 말지
      secondPageStartX: null, // 두 번째 페이지가 오버레이 안에서 시작하는 X좌표(Y좌표는 어차피 같기 때문에 필요없음)
      activeDrawingPage: 1, // Undo/Redo 대상 페이지
      headerButtons: [
        {
          text: '<i class="bi bi-arrows-fullscreen"></i> 전체화면',
          action: "fullscreen",
        },
        { text: '<i class="bi bi-x-lg"></i>', action: "close" },
      ], //닫기버튼, 전체화면 버튼
      toggleItems: [
        {
          id: "focus",
          icon: "bi-gem",
          text: "집중학습 모드",
          hasToggle: true,
          enabled: false,
        },
        {
          id: "dark",
          icon: "bi-moon-fill",
          text: "깜깜이 모드",
          hasToggle: true,
          enabled: false,
        },
        {
          id: "monitoring",
          icon: "bi-people-fill",
          text: "학생별 모니터링",
          hasToggle: false,
          enabled: false,
        },
      ],
    };
  },
  computed: {
    canvasStyle() {
      return { display: "block" };
    },
    currentPageDrawings() {
      return (
        this.allDrawings[this.currentPage] || { undoStack: [], redoStack: [] }
      );
    },
  },
  async mounted() {
    await this.loadPDFJS();
    this.initDrawingCanvas();
    window.addEventListener("resize", this.handleResize);
    this.$nextTick(() => setTimeout(async () => await this.loadPDF(), 100));
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
    if (this.currentRenderTask) toRaw(this.currentRenderTask).cancel();
    if (this.currentRenderTask2) toRaw(this.currentRenderTask2).cancel();
    this.saveDrawingsToLocal(); // 페이지 떠날 때 저장
    this.cleanup();
  },
  methods: {
    // ===== 공통 유틸 =====
    getStorageKey() {
      const documentId = "unique-pdf-document-id-123";
      const userId = "current-logged-in-user-id-456";
      return `drawing-${documentId}-${userId}`;
    },
    getPageDrawings(pageNo) {
      if (!this.allDrawings[pageNo]) {
        this.allDrawings[pageNo] = { undoStack: [], redoStack: [] };
      }
      return this.allDrawings[pageNo];
    },

    // ===== 저장/로드 =====
    saveDrawingsToLocal() {
      try {
        const hasDrawings = Object.values(this.allDrawings || {}).some(
          (p) => (p?.undoStack?.length || 0) > 0
        );
        const key = this.getStorageKey();
        if (hasDrawings) {
          localStorage.setItem(key, JSON.stringify(this.allDrawings));
        } else {
          localStorage.removeItem(key);
        }
      } catch (e) {
        console.error("로컬 스토리지 저장 중 오류:", e);
      }
    },
    loadDrawingsFromLocal() {
      const key = this.getStorageKey();
      try {
        const savedData = localStorage.getItem(key);
        if (savedData) {
          this.allDrawings = JSON.parse(savedData);
          this.$nextTick(() => this.syncDrawingCanvas());
        } else {
          this.allDrawings = {};
        }
      } catch (error) {
        console.error("로컬 스토리지 불러오기 중 오류 발생:", error);
        this.allDrawings = {};
      }
    },

    // ===== 툴바 토글 동작 =====
    showDrawingUI() {
      this.isToolbarVisible = true;
      this.loadDrawingsFromLocal();
      this.$nextTick(() => {
        this.syncDrawingCanvas();
        const c = this.$refs.drawingCanvas;
        if (c) {
          c.style.pointerEvents = "auto";
          c.style.visibility = "visible";
        }
      });
    },
    closeDrawing() {
      this.saveDrawingsToLocal();
      this.isToolbarVisible = false;
      this.isDrawing = false;
      const c = this.$refs.drawingCanvas;
      if (c) {
        c.style.visibility = "hidden";
        c.style.pointerEvents = "none";
        c.width = 0;
        c.height = 0;
      }
    },
    toggleToolbar() {
      if (this.isToolbarVisible) this.closeDrawing();
      else this.showDrawingUI();
    },

    // ===== PDF 배치/스케일 계산 =====
    async computeFitToWidthScale() {
      const canvas = await this.waitForCanvas();
      const container = canvas?.parentElement;
      const doc = toRaw(this.pdfDoc);
      if (!doc || !container) return null;
      const page = await doc.getPage(this.currentPage);
      const viewport1 = page.getViewport({ scale: 1.0 });
      const available = container.clientWidth;
      const gap = this.twoPageView ? this.twoPageGap : 0;
      let baseWidth = this.twoPageView
        ? viewport1.width * 2 + gap
        : viewport1.width;
      page.cleanup();
      return available / baseWidth;
    },

    async computeFitToPageScale() {
      const canvas = await this.waitForCanvas();
      const container = canvas?.parentElement;
      const doc = toRaw(this.pdfDoc);
      if (!doc || !container) return null;
      const page = await doc.getPage(this.currentPage);
      const viewport1 = page.getViewport({ scale: 1.0 });
      const viewerW = container.clientWidth;
      const viewerH = container.clientHeight;
      const gap = this.twoPageView ? this.twoPageGap : 0;
      let widthNeeded = this.twoPageView
        ? viewport1.width * 2 + gap
        : viewport1.width;
      const scale = Math.min(viewerW / widthNeeded, viewerH / viewport1.height);
      page.cleanup();
      return scale;
    },

    async applyFit() {
      try {
        if (this.fitMode === "fit-page") return await this.fitToPage();
        if (this.fitMode === "fit-width") return await this.fitToWidth();
        const container = this.$refs.pdfViewer;
        if (!container) return;
        const aspect =
          container.clientWidth / Math.max(1, container.clientHeight);
        await (aspect >= 1.35 ? this.fitToWidth() : this.fitToPage());
      } catch (e) {
        console.error("applyFit 오류:", e);
      }
    },

    cleanup() {
      if (this.pdfDoc)
        toRaw(this.pdfDoc)
          .destroy()
          .catch(() => {});
      this.pdfDoc = null;
    },

    async handleResize() {
      this.fitMode === "manual"
        ? await this.renderPage(this.currentPage)
        : await this.applyFit();
    },

    async loadPDFJS() {
      if (window.pdfjsLib) return;
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js";
        script.onload = () => {
          this.pdfjsLib = markRaw(window.pdfjsLib);
          this.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
          resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    },

    async loadPDF() {
      this.pdfLoading = true;
      this.pdfError = false;
      this.cleanup();
      try {
        await this.loadPDFJS();
        const pdfPaths = ["./example.pdf", "/example.pdf"];
        let pdfDoc = null;
        for (const path of pdfPaths) {
          try {
            pdfDoc = await this.pdfjsLib.getDocument({
              url: path,
              cMapUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/cmaps/",
              cMapPacked: true,
            }).promise;
            break;
          } catch (e) {}
        }
        if (!pdfDoc) throw new Error("PDF 파일을 찾을 수 없습니다.");
        this.pdfDoc = markRaw(pdfDoc);
        this.totalPages = pdfDoc.numPages;
        this.currentPage = 1;
        this.activeDrawingPage = 1;
        this.pdfScale = this.initialScale;
        this.pdfLoading = false;
        await this.$nextTick();
        setTimeout(() => this.applyFit(), 100);
      } catch (error) {
        console.error("PDF 로드 오류:", error);
        this.pdfError = true;
        this.pdfLoading = false;
      }
    },

    async renderPage(pageNum) {
      const doc = toRaw(this.pdfDoc);
      if (!doc || pageNum < 1 || pageNum > this.totalPages || this.pdfLoading)
        return;
      const canvas = await this.waitForCanvas();
      if (!canvas) return;
      try {
        const page = await doc.getPage(pageNum);
        const viewport = page.getViewport({ scale: this.pdfScale });
        const dpr = window.devicePixelRatio || 1;
        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        if (this.currentRenderTask) toRaw(this.currentRenderTask).cancel();
        const renderContext = {
          canvasContext: canvas.getContext("2d"),
          viewport,
          transform: [dpr, 0, 0, dpr, 0, 0],
        };
        this.currentRenderTask = markRaw(page.render(renderContext));
        await this.currentRenderTask.promise;
        this.currentRenderTask = null;
        if (this.twoPageView && pageNum < this.totalPages) {
          await this.renderSecondPage(pageNum + 1);
        } else {
          const canvas2 = this.$refs.pdfCanvas2;
          if (canvas2)
            canvas2
              .getContext("2d")
              .clearRect(0, 0, canvas2.width, canvas2.height);
        }
        await this.$nextTick();
        this.syncDrawingCanvas();
        // 보이는 첫 페이지를 활성 페이지로 초기화
        this.activeDrawingPage = this.currentPage;
        page.cleanup();
      } catch (error) {
        if (error.name !== "RenderingCancelledException")
          console.error("페이지 렌더링 오류:", error);
      }
    },

    async renderSecondPage(pageNum) {
      const doc = toRaw(this.pdfDoc);
      if (!doc || pageNum > this.totalPages) return;
      const canvas = await this.waitForSecondCanvas();
      if (!canvas) return;
      try {
        const page = await doc.getPage(pageNum);
        const viewport = page.getViewport({ scale: this.pdfScale });
        const dpr = window.devicePixelRatio || 1;
        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        if (this.currentRenderTask2) toRaw(this.currentRenderTask2).cancel();
        const renderContext = {
          canvasContext: canvas.getContext("2d"),
          viewport,
          transform: [dpr, 0, 0, dpr, 0, 0],
        };
        this.currentRenderTask2 = markRaw(page.render(renderContext));
        await this.currentRenderTask2.promise;
        this.currentRenderTask2 = null;
        page.cleanup();
      } catch (error) {
        console.error("두 번째 페이지 렌더링 오류:", error);
      }
    },

    async waitForCanvas(timeout = 2000) {
      for (let i = 0; i < timeout / 50; i++) {
        const canvas = this.$refs.pdfCanvas;
        if (canvas?.getContext) return canvas;
        await new Promise((r) => setTimeout(r, 50));
      }
      return null;
    },

    async waitForSecondCanvas(timeout = 2000) {
      for (let i = 0; i < timeout / 50; i++) {
        const canvas = this.$refs.pdfCanvas2;
        if (canvas?.getContext) return canvas;
        await new Promise((r) => setTimeout(r, 50));
      }
      return null;
    },

    async previousPage() {
      if (this.currentPage > 1) {
        this.currentPage -= this.twoPageView ? 2 : 1;
        await this.renderPage(this.currentPage);
      }
    },

    async nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage += this.twoPageView ? 2 : 1;
        await this.renderPage(this.currentPage);
      }
    },

    async toggleTwoPageView() {
      this.twoPageView = !this.twoPageView;
      if (this.twoPageView && this.currentPage % 2 === 0)
        this.currentPage = Math.max(1, this.currentPage - 1);
      await nextTick();
      await this.applyFit();
    },

    async zoomIn() {
      this.fitMode = "manual";
      this.pdfScale += 0.1;
      await this.renderPage(this.currentPage);
    },

    async zoomOut() {
      this.fitMode = "manual";
      this.pdfScale = Math.max(0.1, this.pdfScale - 0.1);
      await this.renderPage(this.currentPage);
    },

    async fitToPage(explicit = false) {
      const scale = await this.computeFitToPageScale();
      if (scale == null) return;
      const factor = this.twoPageView ? 0.3 : this.fitFactor; //기본 페이지 보기 크기 조정(소수점 바꾸면 됨)
      this.pdfScale = scale * (1 - factor);
      if (explicit) this.fitMode = "fit-page";
      await this.renderPage(this.currentPage);
    },

    async fitToWidth(explicit = false) {
      const scale = await this.computeFitToWidthScale();
      if (scale == null) return;
      const factor = this.twoPageView ? 0.4 : this.fitFactor; //2페이지씩 보기 크기 조정(소수점 바꾸면 됨)
      this.pdfScale = scale * (1 - factor);
      if (explicit) this.fitMode = "fit-width";
      await this.renderPage(this.currentPage);
    },

    // ===== 상단/사이드 UI =====
    goBack() {
      console.log("Going back...");
    },
    handleHeaderButton(action) {
      if (action === "fullscreen") this.toggleFullscreen();
      if (action === "close") this.closeWindow();
    },
    toggleSwitch(itemId) {
      const item = this.toggleItems.find((i) => i.id === itemId);
      if (item?.hasToggle) {
        item.enabled = !item.enabled;
        if (itemId === "dark") this.darkMode = item.enabled;
      }
    },
    toggleFullscreen() {
      document.fullscreenElement
        ? document.exitFullscreen()
        : document.documentElement.requestFullscreen();
    },

    // ===== 닫기 버튼(앱 수준) =====
    closeWindow() {
      try {
        // 팝업/새창으로 열린 경우
        if (window.opener && !window.opener.closed) {
          window.close();
          return;
        }
        // 일부 브라우저 우회 시도
        window.open("", "_self");
        window.close();

        // 스크립트로 연 열린 창이 아니라서 닫기 실패한 경우 대비 (fallback)
        if (!document.hidden) {
          if (history.length > 1) {
            history.back(); // 이전 페이지로
          } else {
            window.location.href = "/"; // 홈으로 이동 등 원하는 경로
          }
        }
      } catch (e) {
        console.error("창 닫기 실패:", e);
      }
    },

    async loadDemoPDF() {},

    // ===== 드로잉 로직 =====
    initDrawingCanvas() {
      const canvas = this.$refs.drawingCanvas;
      if (canvas) this.drawingContext = canvas.getContext("2d");
    },

    syncDrawingCanvas() {
      const drawingCanvas = this.$refs.drawingCanvas;
      if (!drawingCanvas) return;

      // 툴바가 닫혀 있으면 계속 숨김 유지
      if (!this.isToolbarVisible) {
        drawingCanvas.style.visibility = "hidden";
        drawingCanvas.style.pointerEvents = "none";
        return;
      }

      if (!this.drawingContext) {
        this.drawingContext = drawingCanvas.getContext("2d");
        if (!this.drawingContext) return;
      }
      const firstCanvas = this.$refs.pdfCanvas;
      if (!firstCanvas) {
        drawingCanvas.style.visibility = "hidden";
        return;
      }
      drawingCanvas.style.visibility = "visible";
      const dpr = window.devicePixelRatio || 1;
      const secondCanvas = this.$refs.pdfCanvas2;
      const top = firstCanvas.offsetTop;
      const left = firstCanvas.offsetLeft;
      let totalWidth = firstCanvas.offsetWidth;
      let totalHeight = firstCanvas.offsetHeight;
      let secondStartX = null;
      if (this.twoPageView && secondCanvas) {
        totalWidth = secondCanvas.offsetLeft + secondCanvas.offsetWidth - left;
        totalHeight = Math.max(totalHeight, secondCanvas.offsetHeight);
        secondStartX = secondCanvas.offsetLeft - left;
      }
      drawingCanvas.style.top = `${top}px`;
      drawingCanvas.style.left = `${left}px`;
      drawingCanvas.style.width = `${totalWidth}px`;
      drawingCanvas.style.height = `${totalHeight}px`;
      drawingCanvas.width = totalWidth * dpr;
      drawingCanvas.height = totalHeight * dpr;
      this.drawingContext.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 두 번째 페이지 시작 위치 저장 (오버레이 기준)
      this.secondPageStartX = secondStartX;

      this.redrawAllPaths();
    },

    getRelativePosition(event) {
      const drawingCanvas = this.$refs.drawingCanvas;
      const rect = drawingCanvas.getBoundingClientRect();
      const isTouchEvent = event.touches?.length > 0;
      const clientX = isTouchEvent ? event.touches[0].clientX : event.clientX;
      const clientY = isTouchEvent ? event.touches[0].clientY : event.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    },

    // 현재 포인터가 어느 페이지에 있는지 계산 (오버레이 좌표계 기준 x)
    resolvePageFromX(x) {
      if (this.twoPageView && this.secondPageStartX != null) {
        return x >= this.secondPageStartX
          ? this.currentPage + 1
          : this.currentPage;
      }
      return this.currentPage;
    },

    // 페이지 기준 x로 변환 (두 번째 페이지면 시작 오프셋 제거)
    toLocalX(x, pageNo) {
      if (
        this.twoPageView &&
        this.secondPageStartX != null &&
        pageNo === this.currentPage + 1
      ) {
        return x - this.secondPageStartX;
      }
      return x;
    },

    startDrawing(event) {
      if (!this.isToolbarVisible) return; // 보호
      const pos = this.getRelativePosition(event);
      const pageNo = this.resolvePageFromX(pos.x);
      this.activeDrawingPage = pageNo;
      const pageDrawings = (self = this.getPageDrawings(pageNo));

      this.isDrawing = true;
      this.lastPosition = pos;

      const localX = this.toLocalX(pos.x, pageNo);
      const normalizedPos = {
        x: localX / this.pdfScale,
        y: pos.y / this.pdfScale,
      };
      this.currentPath = {
        page: pageNo,
        tool: this.currentTool,
        color: this.penColor,
        width: this.penWidth / this.pdfScale,
        points: [normalizedPos],
      };
    },

    draw(event) {
      if (!this.isDrawing || !this.isToolbarVisible) return;
      const pos = this.getRelativePosition(event);

      // 화면에 즉시 그리기 (오버레이 좌표)
      const ctx = this.drawingContext;
      ctx.beginPath();
      ctx.moveTo(this.lastPosition.x, this.lastPosition.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.globalCompositeOperation =
        this.currentTool === "eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle = this.penColor;
      ctx.lineWidth = this.penWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      this.lastPosition = pos;

      // 저장 좌표는 선택된 페이지 좌표계로
      const pageNo = this.currentPath?.page ?? this.activeDrawingPage;
      const localX = this.toLocalX(pos.x, pageNo);
      const normalizedPos = {
        x: localX / this.pdfScale,
        y: pos.y / this.pdfScale,
      };
      this.currentPath.points.push(normalizedPos);
    },

    stopDrawing() {
      if (!this.isDrawing) return;
      self = this;
      this.isDrawing = false;
      if (this.currentPath?.points.length > 1) {
        const pageNo = this.currentPath.page ?? this.activeDrawingPage;
        const stack = this.getPageDrawings(pageNo);
        stack.undoStack.push(this.currentPath);
        stack.redoStack = [];
      }
      this.currentPath = null;
    },

    // 현재 보이는 두 페이지 모두 다시 그리기
    redrawAllPaths() {
      const canvas = this.$refs.drawingCanvas;
      if (!canvas || !this.drawingContext) return;
      const dpr = window.devicePixelRatio || 1;
      const ctx = this.drawingContext;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      const drawStackForPage = (pageNo, offsetX = 0) => {
        const store = this.allDrawings[pageNo];
        if (!store?.undoStack?.length) return;
        store.undoStack.forEach((path) => {
          ctx.beginPath();
          const startPoint = path.points[0];
          if (!startPoint) return;
          ctx.moveTo(
            startPoint.x * this.pdfScale + offsetX,
            startPoint.y * this.pdfScale
          );
          for (let i = 1; i < path.points.length; i++) {
            const p = path.points[i];
            ctx.lineTo(p.x * this.pdfScale + offsetX, p.y * this.pdfScale);
          }
          ctx.globalCompositeOperation =
            path.tool === "eraser" ? "destination-out" : "source-over";
          ctx.strokeStyle = path.color;
          ctx.lineWidth = path.width * this.pdfScale;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.stroke();
        });
      };

      // 첫 페이지(왼쪽)
      drawStackForPage(this.currentPage, 0);

      // 두 번째 페이지(오른쪽)
      if (
        this.twoPageView &&
        this.currentPage < this.totalPages &&
        this.secondPageStartX != null
      ) {
        drawStackForPage(this.currentPage + 1, this.secondPageStartX);
      }

      ctx.globalCompositeOperation = "source-over";
    },

    selectTool(tool) {
      this.currentTool = tool;
    },

    undo() {
      const pageNo = this.activeDrawingPage || this.currentPage;
      const store = this.getPageDrawings(pageNo);
      if (store.undoStack.length > 0) {
        store.redoStack.push(store.undoStack.pop());
        this.redrawAllPaths();
      }
    },
    redo() {
      const pageNo = this.activeDrawingPage || this.currentPage;
      const store = this.getPageDrawings(pageNo);
      if (store.redoStack.length > 0) {
        store.undoStack.push(store.redoStack.pop());
        this.redrawAllPaths();
      }
    },
    clearCurrentPage() {
      const pageNo = this.activeDrawingPage || this.currentPage;
      const store = this.getPageDrawings(pageNo);
      store.undoStack = [];
      store.redoStack = [];
      this.redrawAllPaths();
    },
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.platform-container {
  overflow: hidden;
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
  transition: all 0.3s ease;
}

.platform-container.dark-mode {
  background: #2c3e50;
}

.header {
  grid-area: header;
  background: #ff9800;
  color: white;
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 0.25rem 1.25rem rgba(255, 152, 0, 0.3);
  border-bottom: 0.1875rem solid #ffe066;
  z-index: 400;
  height: auto;
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
  color: white;
  font-size: 16px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 15px;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.3);
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

.title-decoration i {
  animation: sparkle 2s ease-in-out infinite;
  color: #ffeb3b;
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
  color: white;
  padding: 10px 18px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  white-space: nowrap;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
}

.content-area {
  min-width: 0;
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
  background: white;
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
  overflow: auto;
  padding: 20px;
}

/* PDF 관련 스타일 */
.pdf-loading,
.pdf-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  color: #ff9800;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  max-width: 600px;
}

.loading-spinner i,
.error-icon i {
  font-size: 48px;
  animation: spin 1s linear infinite;
}

.error-icon i {
  animation: none;
  color: #e74c3c;
}

.error-details {
  font-size: 14px;
  color: #7f8c8d;
  margin-top: 10px;
}

.error-suggestions {
  background: rgba(52, 152, 219, 0.1);
  padding: 15px;
  border-radius: 10px;
  border-left: 4px solid #3498db;
  font-size: 13px;
  text-align: left;
  max-width: 500px;
}

.error-suggestions p {
  margin: 0 0 10px 0;
  color: #3498db;
  font-weight: 700;
}

.error-suggestions ul {
  margin: 0;
  padding-left: 20px;
  color: #2c3e50;
}

.error-suggestions li {
  margin-bottom: 5px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.retry-btn,
.demo-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  margin: 5px;
}

.demo-btn {
  background: #27ae60;
}

.retry-btn:hover {
  background: #5dade2;
  transform: translateY(-2px);
}

.demo-btn:hover {
  background: #2ecc71;
  transform: translateY(-2px);
}

.pdf-viewer {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: auto;
  position: relative;
}

.pdf-canvas {
  border: 2px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  background: white;
  flex-shrink: 0;
  pointer-events: none;
}

.sidebar {
  grid-area: sidebar;
  width: 25vw;
  min-width: 15rem;
  max-width: 20rem;
  background: #2c3e50;
  color: white;
  padding: 1rem;
  overflow-y: auto;
  border-left: 0.25rem solid #3498db;
  box-shadow: -0.3rem 0 1.25rem rgba(52, 73, 94, 0.3);
  position: relative;
  right: 0;
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
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  border-radius: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;
  border: 0.125rem solid transparent;
  position: relative;
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

.sidebar-item-content i {
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
  transition: all 0.3s ease;
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
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  transition: all 0.3s ease;
  box-shadow: 0 0.125rem 0.3125rem rgba(0, 0, 0, 0.2);
}

.toggle-switch.active .toggle-knob {
  transform: translateX(1.5rem);
}

.bottom-controls {
  grid-area: bottom;
  background: #34495e;
  color: white;
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 0.1875rem solid #3498db;
  box-shadow: 0 -0.3125rem 1.25rem rgba(52, 73, 94, 0.3);
  height: auto;
  min-height: 4.5rem;
  position: relative;
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
  color: white;
  padding: 12px 20px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.3s ease;
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
  transform: none;
  box-shadow: none;
  opacity: 0.6;
}

.nav-btn i {
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

.platform-container.dark-mode .lesson-frame {
  background: #2c3e50;
  border-color: #3498db;
}

.platform-container.dark-mode .lesson-content {
  background: #34495e;
}

.platform-container.dark-mode .pdf-canvas {
  border-color: #3498db;
}

@media (max-width: 1200px) {
  .platform-container {
    overflow: hidden;
    grid-template-rows: 70px 1fr 120px auto;
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

  .pdf-viewer {
    flex-direction: column;
    align-items: center;
  }

  .pdf-canvas-second {
    margin-left: 0;
    margin-top: 20px;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 8px 15px;
    height: 60px;
  }

  .header-btn {
    font-size: 12px;
    padding: 6px 12px;
  }

  .platform-container {
    overflow: hidden;
    grid-template-rows: 60px 1fr 100px auto;
  }

  .bottom-controls {
    flex-direction: column;
    height: auto;
    padding: 10px;
  }

  .control-buttons {
    position: static;
    margin-top: 10px;
  }

  .sidebar {
    height: 120px;
    padding: 10px 15px;
  }

  .nav-btn {
    padding: 8px 15px;
    font-size: 12px;
    min-width: 70px;
  }

  .control-btn {
    width: 35px;
    height: 35px;
  }

  .control-btn i {
    font-size: 14px;
  }

  .lesson-content {
    padding: 10px;
  }
}

.content-area,
.main-content,
.lesson-frame,
.lesson-content {
  min-width: 0;
}

.scale-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
  background: rgba(52, 152, 219, 0.15);
  border: 1px solid rgba(52, 152, 219, 0.4);
  color: #3498db;
  vertical-align: middle;
}

/* --- NEW OR MODIFIED STYLES FOR DRAWING --- */

.drawing-canvas {
  position: absolute;
  z-index: 10;
  touch-action: none;
  pointer-events: auto;
  visibility: hidden;
}

.pdf-canvas {
  pointer-events: none;
}

.control-buttons {
  position: absolute;
  right: 20px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.control-btn {
  background: #e74c3c;
  border: 2px solid #e67e22;
  color: white;
  padding: 12px;
  border-radius: 50%;
  cursor: pointer;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.control-btn:hover {
  background: #ec7063;
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 8px 20px rgba(231, 76, 60, 0.4);
}

.control-btn i {
  font-size: 18px;
  z-index: 2;
}

.drawing-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #2c3e50;
  padding: 8px;
  border-radius: 99px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.tool-btn.active {
  background-color: #3498db;
  border-color: #5dade2;
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(52, 152, 219, 0.5);
}

.tool-options {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 0 10px;
  border-left: 1px solid #4a627a;
  border-right: 1px solid #4a627a;
  margin: 0 5px;
}

.color-picker {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 30px;
  height: 30px;
  background-color: transparent;
  border: none;
  cursor: pointer;
}
.color-picker::-webkit-color-swatch {
  border-radius: 50%;
  border: 2px solid white;
}
.color-picker::-moz-color-swatch {
  border-radius: 50%;
  border: 2px solid white;
}

.width-slider-container {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-size: 12px;
}

.width-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 80px;
  height: 5px;
  background: #7f8c8d;
  outline: none;
  opacity: 0.7;
  transition: opacity 0.2s;
  border-radius: 5px;
}

.width-slider:hover {
  opacity: 1;
}

.width-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 15px;
  height: 15px;
  background: #3498db;
  cursor: pointer;
  border-radius: 50%;
  border: 2px solid white;
}

.width-slider::-moz-range-thumb {
  width: 15px;
  height: 15px;
  background: #3498db;
  cursor: pointer;
  border-radius: 50%;
  border: 2px solid white;
}

.tool-btn-close {
  background-color: #95a5a6;
  border-color: #7f8c8d;
}
.tool-btn-close:hover {
  background-color: #b3bcc1;
}
</style>
