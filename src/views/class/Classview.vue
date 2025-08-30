<template>
  <div
    class="platform-container"
    :class="{ 'dark-mode': darkMode, 'sidebar-collapsed': isSidebarCollapsed }"
  >
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
          :data-action="button.action"
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

            <div
              class="pdf-viewer"
              :class="{ 'two-page': twoPageView }"
              ref="pdfViewer"
            >
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

      <div class="sidebar" :class="{ collapsed: isSidebarCollapsed }">
        <div class="sidebar-header">
          <div class="sidebar-title" @click="toggleSidebar">
            <template v-if="!isSidebarCollapsed">
              <i class="bi bi-arrow-right-square-fill"></i>
              <span>목록 접기</span>
            </template>
            <template v-else>
              <i class="bi bi-arrow-left-square-fill"></i>
            </template>
          </div>
        </div>

        <template v-if="!isSidebarCollapsed">
          <div class="sidebar-section" v-if="isTeacher">
            <div class="section-title">
              <i class="bi bi-controller"></i> 학습 모드
            </div>
            <div
              v-for="toggleItem in toggleItems"
              :key="toggleItem.id"
              class="sidebar-item"
              :class="{ active: toggleItem.enabled }"
              @click="onToggleItemClick(toggleItem)"
            >
              <div class="sidebar-item-content">
                <i :class="'bi ' + toggleItem.icon"></i>
                <span class="sidebar-text">{{ toggleItem.text }}</span>
              </div>
              <div
                v-if="toggleItem.hasToggle"
                class="toggle-switch"
                :class="{ active: toggleItem.enabled }"
                @click.stop="toggleSwitch(toggleItem.id)"
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
        </template>
      </div>
    </div>

    <div class="bottom-controls">
      <div class="nav-controls">
        <button class="nav-btn save-btn" @click="saveProgress">
          <i class="bi bi-save-fill"></i>
          진도 저장
        </button>
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

    <div class="monitoring-panel" :class="{ open: showMonitoringPanel }">
      <div class="monitoring-header">
        <div class="monitoring-title">
          <i class="bi bi-people-fill"></i>
          <span>학생별 모니터링</span>
        </div>
        <div class="monitoring-actions">
          <button
            class="monitoring-btn"
            @click="refreshMonitoring"
            :disabled="monitoringLoading"
            title="새로고침"
          >
            <i class="bi bi-arrow-clockwise"></i>
          </button>
          <button
            class="monitoring-btn close"
            @click="closeMonitoringPanel"
            title="닫기"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>

      <div class="monitoring-body">
        <div v-if="monitoringLoading" class="monitoring-loading">
          <i class="bi bi-arrow-clockwise"></i> 불러오는 중...
        </div>

        <div v-else-if="!monitoringStudents.length" class="monitoring-empty">
          학생 데이터가 없습니다.
        </div>

        <ul v-else class="student-list">
          <li
            v-for="s in sortedStudents"
            :key="s.memberId"
            class="student-item"
          >
            <span class="status-dot" :class="{ online: s.online }"></span>
            <span class="student-name">{{ s.name }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { markRaw, toRaw, nextTick } from "vue";
import presenceClient from "@/utils/presenceClient";
import apiClient from "@/utils/apiClient";
import { useRoute, useRouter } from "vue-router";
import { useAiChat } from "@/composables/useAiChat";

export default {
  name: "PDFViewerPlatform",
  data() {
    return {
      route: null,
      router: null,
      currentTitle: "PDF Viewer",
      currentPage: 1,
      totalPages: 0,
      darkMode: false,
      twoPageView: false,
      twoPageGap: 20,
      fitMode: "auto",
      fitFactor: 0.6,
      pdfDoc: null,
      pdfLoading: true,
      pdfError: false,
      pdfScale: 1.0,
      initialScale: 0.5,
      currentRenderTask: null,
      currentRenderTask2: null,
      pdfjsLib: null,
      isDrawing: false,
      drawingContext: null,
      currentTool: "pen",
      penColor: "#e74c3c",
      penWidth: 5,
      allDrawings: {},
      currentPath: null,
      lastPosition: { x: 0, y: 0 },
      isToolbarVisible: false,
      secondPageStartX: null,
      activeDrawingPage: 1,
      isTeacher: false,
      isSidebarCollapsed: false,
      viewerResizeObs: null,
      headerButtons: [
        {
          text: '<i class="bi"></i> 🤖학습 도우미',
          action: "aichat",
        },
        {
          text: '<i class="bi bi-arrows-fullscreen"></i> 전체화면',
          action: "fullscreen",
        },
        { text: '<i class="bi bi-x-lg"></i>', action: "close" },
      ],
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
      showMonitoringPanel: false,
      monitoringStudents: [],
      monitoringLoading: false,
      monitoringInterval: null,
      highestPageReached: 1,
    };
  },
  watch: {
    currentPage(newPage) {
      if (newPage > this.highestPageReached) {
        this.highestPageReached = newPage;
      }
    },
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
    sortedStudents() {
      const arr = [...this.monitoringStudents];
      arr.sort((a, b) => {
        if (a.online !== b.online) return a.online ? -1 : 1;
        const an = (a.name || a.memberId || "").toString();
        const bn = (b.name || b.memberId || "").toString();
        return an.localeCompare(bn, "ko");
      });
      return arr;
    },
  },
  async mounted() {
    this.route = useRoute();
    this.router = useRouter();
    this.isTeacher = localStorage.getItem("userType") === "teacher";
    await this.loadPDFJS();
    this.initDrawingCanvas();
    window.addEventListener("resize", this.handleResize);

    this.$nextTick(() => {
      const viewer = this.$refs.pdfViewer;
      if (viewer && "ResizeObserver" in window) {
        this.viewerResizeObs = new ResizeObserver(() => {
          if (this.isToolbarVisible) this.syncDrawingCanvas();
        });
        this.viewerResizeObs.observe(viewer);
      }
      setTimeout(async () => await this.loadPDF(), 100);
    });
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
    if (this.currentRenderTask) toRaw(this.currentRenderTask).cancel();
    if (this.currentRenderTask2) toRaw(this.currentRenderTask2).cancel();
    if (this.viewerResizeObs) {
      try {
        this.viewerResizeObs.disconnect();
      } catch (_) {}
      this.viewerResizeObs = null;
    }
    this.saveDrawingsToLocal();
    this.cleanup();
  },
  setup() {
    const { toggleAiChat, closeAiChat } = useAiChat();
    
    return {
      toggleAiChat,
      closeAiChat
    }
  },
  methods: {
    async saveProgress() {
      const tokenInfoString = localStorage.getItem("tokenInfo");
      if (!tokenInfoString) {
        alert("로그인 정보가 없어 진도를 저장할 수 없습니다.");
        return;
      }

      const tokenInfo = JSON.parse(tokenInfoString);
      const classRoomStudentNo = tokenInfo?.classRoomStudentNo;
      const unitNo = Number(this.$route.params.unitNo);

      if (!classRoomStudentNo || !unitNo || !this.highestPageReached) {
        alert("진도율 저장을 위한 정보가 부족합니다.");
        return;
      }

      const progressData = {
        classRoomStudentNo: classRoomStudentNo,
        unitNo: unitNo,
        progressLastPage: this.highestPageReached,
      };

      try {
        await apiClient.put("/api/textbooks/progress/lastpage", progressData);
        alert(
          `현재까지의 진도(최고 ${this.highestPageReached}페이지)가 저장되었습니다!`
        );
      } catch (error) {
        console.error("진도율 저장 중 오류 발생:", error);
        alert("진도율 저장에 실패했습니다. 다시 시도해주세요.");
      }
    },
    getMemberId() {
      const id = localStorage.getItem("memberId");
      return id ? id : undefined;
    },
    getClassNo() {
      try {
        const tokeninfo = JSON.parse(localStorage.getItem("tokenInfo") || "{}");
        const raw =
          tokeninfo?.classroomNo ??
          tokeninfo?.classroomNO ??
          tokeninfo?.classNo;
        if (raw == null) return undefined;
        const n = Number(raw);
        return Number.isFinite(n) ? n : undefined;
      } catch {
        return undefined;
      }
    },
    getAuthHeaderMaybe() {
      try {
        const tk = JSON.parse(localStorage.getItem("tokenInfo") || "{}");
        const at =
          tk?.accessToken || tk?.token || localStorage.getItem("accessToken");
        return at ? { Authorization: `Bearer ${at}` } : {};
      } catch {
        return {};
      }
    },
    async fetchClassroomStudents() {
      const classNo = this.getClassNo();
      if (!classNo) {
        console.warn("학생 목록을 조회할 classNo가 없습니다.");
        this.monitoringStudents = [];
        return;
      }

      this.monitoringLoading = true;
      try {
        const studentList = await apiClient.get(`/api/presence/${classNo}`);

        if (!Array.isArray(studentList)) {
          console.error("서버 응답이 배열 형태가 아닙니다:", studentList);
          this.monitoringStudents = [];
          return;
        }

        this.monitoringStudents = studentList.map((student) => ({
          memberId: student.userId,
          name: student.userName,
          online: student.online,
          lastSeen: student.lastSeen,
        }));

        console.log("✅ 학생 목록 로딩 및 변환 완료:", this.monitoringStudents);
      } catch (error) {
        console.error("반 학생 목록을 불러오는 데 실패했습니다:", error);
        this.monitoringStudents = [];
      } finally {
        this.monitoringLoading = false;
      }
    },
    applyPresenceEvent(evt) {
      const type = (evt.type || evt.eventType || "").toUpperCase();
      const userId = evt.userId ?? evt.id ?? evt.memberId;
      if (userId == null) return;

      const idx = this.monitoringStudents.findIndex(
        (s) => String(s.memberId) === String(userId)
      );

      if (idx === -1) return;

      if (type === "ENTER" || type === "ONLINE" || type === "HEARTBEAT") {
        this.monitoringStudents[idx].online = true;
      } else if (
        type === "LEAVE" ||
        type === "OFFLINE" ||
        type === "DISCONNECT"
      ) {
        this.monitoringStudents[idx].online = false;
      }
    },
    async openMonitoringPanel() {
      this.showMonitoringPanel = true;
      if (this.isTeacher) {
        await this.fetchClassroomStudents();

        const memberId = this.getMemberId();
        const classNo = this.getClassNo();

        if (presenceClient && memberId && classNo) {
          presenceClient.connect(
            {
              classNo: classNo,
              userId: memberId,
              role: "teacher",
            },
            {
              onEvent: (eventData) => {
                console.log("🔄 실시간 이벤트 수신:", eventData);
                this.applyPresenceEvent(eventData);
              },
            }
          );
        }
        this.monitoringInterval = setInterval(() => {
          this.fetchClassroomStudents();
        }, 15000);
      }
    },
    closeMonitoringPanel() {
      this.showMonitoringPanel = false;
      if (presenceClient) {
        presenceClient.disconnect();
      }
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = null;
      }
    },
    async refreshMonitoring() {
      if (this.isTeacher) {
        await this.fetchClassroomStudents();
      }
    },
    async loadPDFJS() {
      if (window.pdfjsLib) {
        this.pdfjsLib = markRaw(window.pdfjsLib);
        return;
      }
      await new Promise((resolve, reject) => {
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
    cleanup() {
      try {
        if (this.pdfDoc) toRaw(this.pdfDoc).destroy();
      } catch {}
      this.pdfDoc = null;
    },
    normalizeS3Url(raw) {
      if (!raw) return null;
      if (raw.startsWith("s3://")) {
        const bucketAndPath = raw.substring("s3://".length);
        const idx = bucketAndPath.indexOf("/");
        if (idx === -1) return null;
        const bucket = bucketAndPath.substring(0, idx);
        const path = bucketAndPath.substring(idx + 1);
        return `https://${bucket}.s3.ap-northeast-2.amazonaws.com/${encodeURI(
          path
        )}`;
      }
      return raw;
    },
    async fetchUnitPdfUrl() {
      const unitNo = Number(this.$route.params.unitNo);

      try {
        const responseData = await apiClient.get(
          `/api/textbooks/units/pdf/${unitNo}`
        );

        if (!Array.isArray(responseData) || responseData.length === 0) {
          console.error(
            "오류: 서버에서 유효한 단원 정보를 받지 못했습니다.",
            responseData
          );
          this.currentTitle = "정보 없음";
          return null;
        }

        const unitInfo = responseData[0];
        this.currentTitle = unitInfo.unitTitle || "PDF 뷰어";
        const s3Url = unitInfo.unitPdfUrl;
        const pdfUrl = this.normalizeS3Url(s3Url);
        return pdfUrl;
      } catch (error) {
        console.error("PDF 정보를 가져오는 데 실패했습니다:", error);
        this.currentTitle = "오류 발생";
        return null;
      }
    },
    async loadPDF() {
      this.pdfLoading = true;
      this.pdfError = false;
      this.cleanup();

      try {
        await this.loadPDFJS();

        let primaryUrl = null;
        try {
          primaryUrl = await this.fetchUnitPdfUrl();
        } catch (err) {
          console.warn("단원 PDF URL 조회 실패(대체 경로 시도):", err);
        }

        const pdfPaths = [];
        if (primaryUrl) pdfPaths.push(primaryUrl);
        pdfPaths.push("./example.pdf", "/example.pdf");

        let pdfDoc = null;
        let lastErr = null;

        for (const url of pdfPaths) {
          if (!url) continue;
          try {
            pdfDoc = await this.pdfjsLib.getDocument({
              url,
              cMapUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/cmaps/",
              cMapPacked: true,
            }).promise;
            break;
          } catch (err) {
            lastErr = err;
          }
        }

        if (!pdfDoc) {
          throw new Error("PDF 파일을 찾을 수 없습니다.");
        }

        this.pdfDoc = markRaw(pdfDoc);
        this.totalPages = pdfDoc.numPages;
        this.currentPage = 1;
        this.activeDrawingPage = 1;
        this.pdfScale = this.initialScale;
        this.pdfLoading = false;
        await this.$nextTick();
        setTimeout(() => this.fitToWidth(), 80);
      } catch (error) {
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
        this.activeDrawingPage = this.currentPage;
        page.cleanup();
      } catch (error) {
        if (error.name !== "RenderingCancelledException") {
          console.error("페이지 렌더링 오류:", error);
        }
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
      if (this.twoPageView && this.currentPage % 2 === 0) {
        this.currentPage = Math.max(1, this.currentPage - 1);
      }
      await nextTick();
      await this.fitToWidth();
    },
    async computeFitToWidthScale() {
      const canvas = await this.waitForCanvas();
      const container = canvas?.parentElement;
      const doc = toRaw(this.pdfDoc);
      if (!doc || !container) return null;
      const page = await doc.getPage(this.currentPage);
      const viewport1 = page.getViewport({ scale: 1.0 });
      const available = container.clientWidth;
      const gap = this.twoPageView ? this.twoPageGap : 0;
      const baseWidth = this.twoPageView
        ? viewport1.width * 2 + gap
        : viewport1.width;
      page.cleanup();
      return available / baseWidth;
    },
    async fitToWidth(explicit = false) {
      const scale = await this.computeFitToWidthScale();
      if (scale == null) return;
      const factor = this.twoPageView ? 0.2 : this.fitFactor;
      this.pdfScale = scale * (1 - factor);
      if (explicit) this.fitMode = "fit-width";
      await this.renderPage(this.currentPage);
    },
    async applyFit() {
      return this.fitToWidth();
    },
    async handleResize() {
      this.fitMode === "manual"
        ? await this.renderPage(this.currentPage)
        : await this.applyFit();
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
    goBack() {
      console.log("Going back...");
    },
    handleHeaderButton(action) {
      if (action === "fullscreen") this.toggleFullscreen();
      if (action === "close") this.closeWindow();
      if (action === "aichat") this.toggleAiChat();
    },
    toggleSwitch(itemId) {
      const item = this.toggleItems.find((i) => i.id === itemId);
      if (item?.hasToggle) {
        item.enabled = !item.enabled;
        if (itemId === "dark") this.darkMode = item.enabled;
      }
    },
    onToggleItemClick(item) {
      if (item.id === "monitoring") {
        this.openMonitoringPanel();
        return;
      }
    },
    toggleFullscreen() {
      document.fullscreenElement
        ? document.exitFullscreen()
        : document.documentElement.requestFullscreen();
    },
    closeWindow() {
      try {
        if (window.opener && !window.opener.closed) {
          window.close();
          return;
        }
        window.open("", "_self");
        window.close();
        if (!document.hidden) {
          if (history.length > 1) history.back();
          else window.location.href = "/";
        }
      } catch (e) {
        console.error("창 닫기 실패:", e);
      }
    },
    async loadDemoPDF() {
      try {
        await this.loadPDFJS();
        const demoUrl = "/example.pdf";
        const pdfDoc = await this.pdfjsLib.getDocument({
          url: demoUrl,
          cMapUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/cmaps/",
          cMapPacked: true,
        }).promise;
        this.currentTitle = "Demo PDF";
        this.pdfDoc = markRaw(pdfDoc);
        this.totalPages = pdfDoc.numPages;
        this.currentPage = 1;
        this.activeDrawingPage = 1;
        this.pdfScale = this.initialScale;
        this.pdfLoading = false;
        await this.$nextTick();
        setTimeout(() => this.fitToWidth(), 80);
      } catch (e) {
        this.pdfError = true;
      }
    },
    initDrawingCanvas() {
      const canvas = this.$refs.drawingCanvas;
      if (canvas) this.drawingContext = canvas.getContext("2d");
    },
    syncDrawingCanvas() {
      const drawingCanvas = this.$refs.drawingCanvas;
      if (!drawingCanvas) return;

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

      this.secondPageStartX = secondStartX;
      this.redrawAllPaths();
    },
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
        this.allDrawings = {};
      }
    },
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
    getRelativePosition(event) {
      const drawingCanvas = this.$refs.drawingCanvas;
      const rect = drawingCanvas.getBoundingClientRect();
      const isTouchEvent = event.touches?.length > 0;
      const clientX = isTouchEvent ? event.touches[0].clientX : event.clientX;
      const clientY = isTouchEvent ? event.touches[0].clientY : event.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    },
    resolvePageFromX(x) {
      if (this.twoPageView && this.secondPageStartX != null) {
        return x >= this.secondPageStartX
          ? this.currentPage + 1
          : this.currentPage;
      }
      return this.currentPage;
    },
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
      if (!this.isToolbarVisible) return;
      const pos = this.getRelativePosition(event);
      const pageNo = this.resolvePageFromX(pos.x);
      this.activeDrawingPage = pageNo;
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
      this.isDrawing = false;
      if (this.currentPath?.points.length > 1) {
        const pageNo = this.currentPath.page ?? this.activeDrawingPage;
        const stack = this.getPageDrawings(pageNo);
        stack.undoStack.push(this.currentPath);
        stack.redoStack = [];
      }
      this.currentPath = null;
    },
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

      drawStackForPage(this.currentPage, 0);

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
  width: 100%;
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
    transform: rotate(0);
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
  overflow-x: hidden;
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

.sidebar {
  transition: all 0.3s ease-in-out;
}
.sidebar-title {
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.sidebar-title:hover {
  background: rgba(52, 152, 219, 0.2);
}
.sidebar-title span {
  margin-left: 10px;
}
.sidebar.collapsed {
  width: 60px;
  min-width: 60px;
  padding: 1rem 0;
}
.sidebar.collapsed .sidebar-title {
  justify-content: center;
  padding: 15px 0;
}

.monitoring-panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 20rem;
  max-width: 95vw;
  background: #1f2a38;
  color: #ecf0f1;
  border-left: 0.25rem solid #3498db;
  box-shadow: -0.75rem 0 2rem rgba(0, 0, 0, 0.35);
  z-index: 600;
  transform: translateX(100%);
  transition: transform 0.25s ease;
  display: flex;
  flex-direction: column;
}
.monitoring-panel.open {
  transform: translateX(0);
}
.monitoring-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1rem;
  background: #273444;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.monitoring-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 800;
  color: #5dade2;
}
.monitoring-actions {
  display: flex;
  gap: 0.5rem;
}
.monitoring-btn {
  background: rgba(255, 255, 255, 0.08);
  color: #ecf0f1;
  border: 1px solid rgba(255, 255, 255, 0.15);
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.monitoring-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}
.monitoring-btn.close {
  background: rgba(231, 76, 60, 0.15);
  border-color: rgba(231, 76, 60, 0.35);
}
.monitoring-body {
  padding: 0.75rem 1rem 1rem;
  overflow-y: auto;
  flex: 1;
}
.monitoring-loading,
.monitoring-empty {
  padding: 1rem;
  color: #bdc3c7;
  font-size: 0.95rem;
}
.student-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.student-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.5rem;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
}
.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #95a5a6;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.04);
}
.status-dot.online {
  background: #27ae60;
  box-shadow: 0 0 8px rgba(39, 174, 96, 0.55);
}
.student-name {
  font-weight: 700;
  color: #ecf0f1;
}

/* AI챗봇 버튼 스타일 */
.header-btn[data-action="aichat"] {
  background: linear-gradient(135deg, #ffeb3b 0%, #ffd54f 50%, #ffc107 100%);
  border-color: rgba(255, 235, 59, 0.5);
  color: #5a3c00;
  font-weight: 800;
  box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
}

.header-btn[data-action="aichat"]:hover {
  background: linear-gradient(135deg, #ffc107 0%, #ff8f00 50%, #f57c00 100%);
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 193, 7, 0.4);
}

.header-btn[data-action="aichat"] i {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-3px);
  }
  60% {
    transform: translateY(-2px);
  }
}
</style>
