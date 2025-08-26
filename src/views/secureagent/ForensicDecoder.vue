<template>
  <div class="forensic-page">
    <!-- 헤더 영역 -->
    <header class="forensic-header">
      <div class="header-content">
        <div class="logo-section">
          <div class="logo-icon">🔍</div>
          <div class="header-text">
            <h1 class="page-title">디지털 포렌식 분석기</h1>
            <p class="page-subtitle">보안 관리자 도구</p>
          </div>
        </div>
        <div class="security-badge">
          <span class="badge-icon">🛡️</span>
          <span>SECURE ACCESS</span>
        </div>
      </div>
    </header>

    <!-- 메인 컨테이너 -->
    <div class="forensic-container">
      <!-- 업로드 영역 -->
      <section class="upload-section">
        <div class="upload-card">
          <div class="card-header">
            <h2 class="section-title">📁 파일 분석</h2>
            <div class="supported-formats">
              <span class="format-label">지원 형식:</span>
              <span class="format-tags">
                <span class="format-tag">PNG</span>
                <span class="format-tag">JPG</span>
                <span class="format-tag">PDF</span>
              </span>
            </div>
          </div>

          <div 
            class="dropzone"
            :class="{ 
              'drag-over': isDragOver,
              'processing': isProcessing,
              'has-result': hasAnalysisResult
            }"
            @drop="handleDrop"
            @dragover.prevent="handleDragOver"
            @dragleave="handleDragLeave"
            @click="triggerFileInput"
          >
            <!-- 드래그 앤 드롭 UI -->
            <div v-if="!isProcessing && !hasAnalysisResult" class="drop-content">
              <div class="drop-icon">📎</div>
              <h3 class="drop-title">파일을 여기로 드래그하세요</h3>
              <p class="drop-subtitle">또는 클릭하여 파일을 선택하세요</p>
              <div class="drop-note">
                <span class="note-icon">ℹ️</span>
                메타데이터에서 추적 정보를 추출하여 분석합니다
              </div>
            </div>

            <!-- 처리 중 UI -->
            <div v-if="isProcessing" class="processing-content">
              <div class="processing-spinner"></div>
              <h3 class="processing-title">분석 진행 중...</h3>
              <p class="processing-subtitle">파일의 메타데이터를 검사하고 있습니다</p>
              <div class="processing-steps">
                <div class="step" :class="{ active: currentStep >= 1 }">1. 파일 업로드</div>
                <div class="step" :class="{ active: currentStep >= 2 }">2. 메타데이터 추출</div>
                <div class="step" :class="{ active: currentStep >= 3 }">3. 분석 완료</div>
              </div>
            </div>

            <!-- 결과 표시 UI -->
            <div v-if="hasAnalysisResult && !isProcessing" class="result-preview">
              <div class="result-header">
                <div class="file-info">
                  <span class="file-icon">📄</span>
                  <span class="file-name">{{ analysisResult.fileName }}</span>
                </div>
                <button class="new-analysis-btn" @click="resetAnalysis">
                  🔄 새로 분석하기
                </button>
              </div>
            </div>

            <input 
              ref="fileInput" 
              type="file" 
              accept=".png,.jpg,.jpeg,.pdf"
              style="display: none"
              @change="handleFileSelect"
            />
          </div>

          <!-- 보안 알림 -->
          <div class="security-notice">
            <div class="notice-icon">🔒</div>
            <div class="notice-content">
              <p><strong>보안 안내:</strong> 분석된 파일은 서버에 저장되지 않으며, 메모리에서 즉시 삭제됩니다.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 분석 결과 영역 -->
      <section v-if="hasAnalysisResult" class="result-section">
        <div class="result-card">
          <div class="result-card-header">
            <h2 class="section-title">🔍 분석 결과</h2>
            <div class="result-actions">
              <button class="action-btn export-btn" @click="exportResults">
                📊 결과 내보내기
              </button>
              <button class="action-btn clear-btn" @click="clearResults">
                🗑️ 결과 지우기
              </button>
            </div>
          </div>

          <!-- 메타데이터 분석 결과 -->
          <div class="analysis-content">
            <div class="metadata-container">
              <h3 class="metadata-title">📋 추출된 메타데이터</h3>
              
              <!-- JSON 형태로 표시 -->
              <div class="json-display">
                <pre class="json-content">{{ pretty(analysisResult.raw) }}</pre>
              </div>

              <!-- 주요 정보 하이라이트 -->
              <div v-if="analysisResult.highlights" class="highlights-section">
                <h4 class="highlights-title">⚠️ 주의 사항</h4>
                <div class="highlights-list">
                  <div 
                    v-for="(highlight, index) in analysisResult.highlights" 
                    :key="index"
                    class="highlight-item"
                    :class="highlight.severity"
                  >
                    <span class="highlight-icon">{{ getHighlightIcon(highlight.severity) }}</span>
                    <span class="highlight-text">{{ highlight.message }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 히스토리 영역 -->
      <section v-if="analysisHistory.length > 0" class="history-section">
        <div class="history-card">
          <h2 class="section-title">📚 분석 기록</h2>
          <div class="history-list">
            <div 
              v-for="(record, index) in analysisHistory" 
              :key="index"
              class="history-item"
              @click="loadHistoryRecord(record)"
            >
              <div class="history-info">
                <span class="history-file">{{ record.fileName }}</span>
                <span class="history-time">{{ record.timestamp }}</span>
              </div>
              <span class="history-arrow">→</span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 플로팅 장식 (팀 컨셉 유지) -->
    <div class="floating-decorations">
      <div class="floating-item item1">🔍</div>
      <div class="floating-item item2">🛡️</div>
      <div class="floating-item item3">⚙️</div>
      <div class="floating-item item4">🔒</div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'

export default {
  name: 'ForensicDecoder',
  setup() {
    const isDragOver = ref(false)
    const isProcessing = ref(false)
    const currentStep = ref(0)
    const fileInput = ref(null)

    const analysisResult = reactive({
      fileName: '',
      raw: null,          // 서버 복호화 결과(JSON) 그대로
      highlights: []
    })

    const analysisHistory = ref([])

    const hasAnalysisResult = computed(() => analysisResult.raw !== null)

    /* ---------- drag & drop ---------- */
    const handleDragOver = (e) => { e.preventDefault(); isDragOver.value = true }
    const handleDragLeave = (e) => { e.preventDefault(); isDragOver.value = false }
    const handleDrop = async (e) => {
      e.preventDefault(); isDragOver.value = false
      const files = Array.from(e.dataTransfer.files || [])
      if (files.length > 0) await processFile(files[0])
    }

    /* ---------- file input ---------- */
    const triggerFileInput = () => { if (!isProcessing.value) fileInput.value?.click() }
    const handleFileSelect = async (e) => {
      const file = e.target.files?.[0]
      if (file) await processFile(file)
      // 같은 파일을 다시 선택해도 change가 트리거 되도록 초기화
      e.target.value = ''
    }

    /* ---------- backend wire ---------- */
    const processFile = async (file) => {
      if (!isValidFileType(file)) {
        alert('지원되지 않는 파일 형식입니다. PNG, JPG 또는 PDF 파일을 업로드해주세요.')
        return
      }

      resetAnalysis()

      isProcessing.value = true
      currentStep.value = 1
      analysisResult.fileName = file.name

      try {
        // 단계 표시 연출
        await step(800); currentStep.value = 2

        // 실제 분석 호출
        const result = await analyzeFile(file)

        await step(600); currentStep.value = 3

        if (result.noStego) {
          analysisResult.raw = {
            status: 'no-stego',
            reason: result.reason,
            fileType: result.fileType,
          }
          analysisResult.highlights = [{
            severity: 'info',
            message: '스테가노그래피 추적 정보가 없습니다.',
          }]
        } else {
          // payloadJson(있으면) 우선, 없으면 payload(JSON 파싱)
          const p = result.payloadJson || safeParseJson(result.payload)
          analysisResult.raw = p
          analysisResult.highlights = generateHighlightsFromPayload(p)
        }

        addToHistory({
          fileName: file.name,
          timestamp: new Date().toLocaleString(),
          result: analysisResult.raw
        })

      } catch (err) {
        console.error(err)
        alert('분석 중 오류가 발생했습니다.')
      } finally {
        isProcessing.value = false
      }
    }

const analyzeFile = async (file) => {
  const fd = new FormData();
  fd.append('file', file);

  const base = import.meta.env.DEV
    ? 'http://localhost:8080'
    : 'http://43.200.2.244:8080';

  const resp = await fetch(`${base}/api/forensic/decode`, {
    method: 'POST',
    body: fd,
  });

  const text = await resp.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}

  if (!resp.ok) {
    // 서버 사유를 그대로 띄워서 디버깅에 도움
    throw new Error(json?.reason || `HTTP ${resp.status} ${text}`);
  }

  if (!json.hasStego) {
    return {
      noStego: true,
      reason: json.reason || 'no-stego',
      fileType: json.fileType || 'unknown',
    };
  }
  return {
    payloadJson: json.payloadJson || null,
    payload: json.payload || null,
  };
};


    const isValidFileType = (file) => {
      // 일부 브라우저는 drag&drop 시 type 빈 문자열을 줄 수 있음 → 확장자도 체크
      const typeOk = ['image/png', 'image/jpeg', 'application/pdf'].includes(file.type)
      if (typeOk) return true
      const name = (file.name || '').toLowerCase()
      return name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.pdf')
    }

    const step = (ms) => new Promise(r => setTimeout(r, ms))
    const safeParseJson = (text) => { try { return JSON.parse(text) } catch { return { raw: text } } }

    /* ---------- highlights ---------- */
    const generateHighlightsFromPayload = (p) => {
      if (!p || typeof p !== 'object') return []
      const hs = []

      // VM 의심
      if (p.vm === true) {
        hs.push({ severity: 'error', message: '가상 환경(또는 랜덤 MAC) 의심(VM Suspect=true)' })
      }
      // MAC 품질
      if (p.macQuality && String(p.macQuality).toUpperCase() !== 'GOOD') {
        hs.push({ severity: 'warning', message: `MAC 품질: ${p.macQuality}` })
      }
      // 앱 버전(예: 0.9.0은 구버전 경고)
      if (typeof p.app === 'string' && /\/0\.9\.0\b/.test(p.app)) {
        hs.push({ severity: 'warning', message: `에이전트 버전이 낮습니다: ${p.app}` })
      }
      // 기본 필드 확인
      ['uid','deviceId','action','ts'].forEach(k => {
        if (!p[k] || String(p[k]).trim() === '-') {
          hs.push({ severity: 'info', message: `필드 누락/미설정: ${k}` })
        }
      })
      return hs
    }

    /* ---------- utils ---------- */
    const pretty = (obj) => obj ? JSON.stringify(obj, null, 2) : ''

    const getHighlightIcon = (severity) => {
      switch (severity) {
        case 'error': return '🚨'
        case 'warning': return '⚠️'
        case 'info': return 'ℹ️'
        default: return '📋'
      }
    }

    const resetAnalysis = () => {
      analysisResult.fileName = ''
      analysisResult.raw = null
      analysisResult.highlights = []
      currentStep.value = 0
    }

    const clearResults = () => resetAnalysis()

    const exportResults = () => {
      if (!analysisResult.raw) return
      const dataStr = JSON.stringify(analysisResult.raw, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
      const exportName = `forensic_${analysisResult.fileName || 'result'}_${Date.now()}.json`
      const a = document.createElement('a'); a.href = dataUri; a.download = exportName; a.click()
    }

    const addToHistory = (record) => {
      analysisHistory.value.unshift(record)
      if (analysisHistory.value.length > 10) {
        analysisHistory.value = analysisHistory.value.slice(0, 10)
      }
    }

    const loadHistoryRecord = (record) => {
      analysisResult.fileName = record.fileName
      analysisResult.raw = record.result
      analysisResult.highlights = generateHighlightsFromPayload(record.result)
    }

    return {
      isDragOver, isProcessing, currentStep, fileInput,
      analysisResult, analysisHistory,
      hasAnalysisResult,
      handleDragOver, handleDragLeave, handleDrop,
      triggerFileInput, handleFileSelect,
      pretty, getHighlightIcon, resetAnalysis, clearResults, exportResults, loadHistoryRecord
    }
  }
}

</script>

<style scoped>
/* 전역 스타일 */
.forensic-page {
  font-family: "Comic Sans MS", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #f8f9fa 100%);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* 헤더 */
.forensic-header {
  background: linear-gradient(135deg, #495057, #6c757d);
  color: white;
  padding: 2rem;
  border-bottom: 4px solid #adb5bd;
  position: relative;
  overflow: hidden;
}

.forensic-header::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: headerSparkle 4s ease-in-out infinite;
}

@keyframes headerSparkle {
  0%, 100% {
    opacity: 0.3;
    transform: rotate(0deg);
  }
  50% {
    opacity: 0.7;
    transform: rotate(180deg);
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #17a2b8, #138496);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  animation: logoSpin 3s ease-in-out infinite;
}

@keyframes logoSpin {
  0%, 100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(10deg);
  }
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.page-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 600;
}

.security-badge {
  background: linear-gradient(135deg, #dc3545, #c82333);
  padding: 0.8rem 1.2rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.9rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  animation: badgePulse 2s ease-in-out infinite;
}

@keyframes badgePulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(220, 53, 69, 0);
  }
}

/* 메인 컨테이너 */
.forensic-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* 카드 공통 스타일 */
.upload-card,
.result-card,
.history-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  border: 3px solid #e9ecef;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}

.card-header,
.result-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #495057;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 지원 형식 */
.supported-formats {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.format-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 600;
}

.format-tags {
  display: flex;
  gap: 0.5rem;
}

.format-tag {
  background: linear-gradient(135deg, #17a2b8, #138496);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 700;
}

/* 드롭존 */
.dropzone {
  border: 3px dashed #ced4da;
  border-radius: 15px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  position: relative;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropzone.drag-over {
  border-color: #17a2b8;
  background: linear-gradient(135deg, #e1f7fe, #f0f8ff);
  transform: scale(1.02);
}

.dropzone.processing {
  border-color: #ffc107;
  background: linear-gradient(135deg, #fff8e1, #fffbf0);
  cursor: not-allowed;
}

.dropzone.has-result {
  border-color: #28a745;
  background: linear-gradient(135deg, #e8f5e9, #f1f8e9);
}

/* 드롭 컨텐츠 */
.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.drop-icon {
  font-size: 4rem;
  animation: dropBounce 2s ease-in-out infinite;
}

@keyframes dropBounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.drop-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #495057;
  margin: 0;
}

.drop-subtitle {
  font-size: 1rem;
  color: #6c757d;
  font-weight: 600;
  margin: 0;
}

.drop-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #17a2b8;
  background: rgba(23, 162, 184, 0.1);
  padding: 0.8rem 1.2rem;
  border-radius: 10px;
  font-weight: 600;
}

/* 처리 중 컨텐츠 */
.processing-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.processing-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ffc107;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.processing-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #495057;
  margin: 0;
}

.processing-subtitle {
  font-size: 1rem;
  color: #6c757d;
  font-weight: 600;
  margin: 0;
}

.processing-steps {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.step {
  background: #e9ecef;
  color: #6c757d;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.step.active {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  transform: scale(1.05);
}

/* 결과 미리보기 */
.result-preview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-weight: 600;
  color: #495057;
}

.file-icon {
  font-size: 1.5rem;
}

.new-analysis-btn {
  background: linear-gradient(135deg, #17a2b8, #138496);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.new-analysis-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(23, 162, 184, 0.3);
}

/* 보안 알림 */
.security-notice {
  display: flex;
  gap: 1rem;
  background: linear-gradient(135deg, #e3f2fd, #f0f9ff);
  padding: 1rem 1.5rem;
  border-radius: 10px;
  border: 2px solid #bbdefb;
  margin-top: 1.5rem;
}

.notice-icon {
  font-size: 1.3rem;
  flex-shrink: 0;
}

.notice-content p {
  margin: 0;
  font-size: 0.9rem;
  color: #1565c0;
  font-weight: 600;
  line-height: 1.4;
}

/* 결과 액션 */
.result-actions {
  display: flex;
  gap: 0.8rem;
}

.action-btn {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.export-btn {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(40, 167, 69, 0.3);
}

.clear-btn {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
}

.clear-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(220, 53, 69, 0.3);
}

/* JSON 표시 */
.metadata-container {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1.5rem;
  border: 2px solid #e9ecef;
}

.metadata-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #495057;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.json-display {
  background: #2d3748;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 2px solid #4a5568;
}

.json-content {
  color: #e2e8f0;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  overflow-x: auto;
}

/* 하이라이트 */
.highlights-section {
  margin-top: 1.5rem;
}

.highlights-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #495057;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.highlights-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.highlight-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  font-weight: 600;
}

.highlight-item.error {
  background: #ffeaea;
  border: 2px solid #ffcdd2;
  color: #c62828;
}

.highlight-item.warning {
  background: #fff8e1;
  border: 2px solid #ffecb3;
  color: #f57c00;
}

.highlight-item.info {
  background: #e3f2fd;
  border: 2px solid #bbdefb;
  color: #1565c0;
}

/* 히스토리 */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #e9ecef;
}

.history-item:hover {
  background: #e9ecef;
  border-color: #17a2b8;
  transform: translateX(5px);
}

.history-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.history-file {
  font-weight: 700;
  color: #495057;
}

.history-time {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 600;
}

.history-arrow {
  font-size: 1.2rem;
  color: #17a2b8;
  font-weight: 700;
}

/* 플로팅 장식 */
.floating-decorations {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.floating-item {
  position: absolute;
  font-size: 1.5rem;
  opacity: 0.3;
  animation: floatAround 8s ease-in-out infinite;
}

.item1 {
  top: 15%;
  left: 10%;
  animation-delay: 0s;
}

.item2 {
  top: 75%;
  right: 15%;
  animation-delay: 2s;
}

.item3 {
  top: 45%;
  left: 5%;
  animation-delay: 4s;
}

.item4 {
  top: 25%;
  right: 25%;
  animation-delay: 6s;
}

@keyframes floatAround {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-15px) rotate(90deg);
  }
  50% {
    transform: translateY(0px) rotate(180deg);
  }
  75% {
    transform: translateY(-8px) rotate(270deg);
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .forensic-container {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .dropzone {
    padding: 2rem 1rem;
  }
  
  .processing-steps {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .card-header,
  .result-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .result-actions {
    flex-wrap: wrap;
  }
  
  .floating-item {
    font-size: 1.2rem;
  }
}

/* 애니메이션 감소 설정 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
