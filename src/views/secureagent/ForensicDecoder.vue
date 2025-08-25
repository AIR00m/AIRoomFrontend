<template>
  <!-- Install.vue에서 쓰는 Spinner 재사용 -->
  <Spinner
    :is-loading="loading"
    loading-text="분석 중..."
    size="large"
    overlay-type="fullscreen"
    :backdrop-blur="true"
  />

  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Stego 추출 · 포렌식 뷰어</h1>
    <p class="text-sm text-gray-600 mb-6">
      PNG / JPG / PDF 파일을 업로드하면 메타데이터에 삽입된 추적 정보를 복호화하여 표시합니다.
      (서버에 저장하지 않고, 메모리/임시파일에서 즉시 삭제)
    </p>

    <!-- 드래그&드랍 존 -->
    <div
      class="border-2 border-dashed rounded-xl p-8 text-center mb-4 transition-colors"
      :class="dragOver ? 'border-blue-500 bg-blue-50/40' : 'border-gray-300'"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="onDrop"
    >
      <p class="mb-3 text-sm text-gray-700">
        <strong>여기로 파일을 드래그하면 즉시 추출이 시작</strong>됩니다.
      </p>
      <input ref="fileInput"
             type="file"
             accept=".png,.jpg,.jpeg,.pdf"
             class="hidden"
             @change="onChoose" />
      <button class="px-4 py-2 rounded-lg border" @click="fileInput?.click()">파일 선택</button>
      <div class="mt-2 text-xs text-gray-500">한 번에 1개 파일만 처리합니다.</div>
    </div>

    <!-- 결과 -->
    <div v-if="result" class="mt-6 space-y-3">
      <div class="text-sm text-gray-500">
        파일: {{ result.fileName }} <span v-if="result.fileType">({{ result.fileType }})</span>
      </div>

      <div v-if="result.ok && result.hasStego && summary" class="p-4 rounded-lg border">
        <div class="font-semibold mb-3">복호화 결과</div>

        <!-- 핵심 필드 요약 -->
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div class="flex gap-2"><dt class="text-gray-500 w-24">앱</dt><dd class="flex-1 break-all">{{ summary.app }}</dd></div>
          <div class="flex gap-2"><dt class="text-gray-500 w-24">사용자</dt><dd class="flex-1 break-all">{{ summary.uid }}</dd></div>
          <div class="flex gap-2"><dt class="text-gray-500 w-24">DeviceID</dt><dd class="flex-1 break-all">{{ summary.deviceId }}</dd></div>
          <div class="flex gap-2"><dt class="text-gray-500 w-24">MAC 품질</dt><dd class="flex-1">{{ summary.macQuality }}</dd></div>
          <div class="flex gap-2"><dt class="text-gray-500 w-24">VM 의심</dt><dd class="flex-1">{{ String(summary.vm) }}</dd></div>
          <div class="flex gap-2"><dt class="text-gray-500 w-24">Action</dt><dd class="flex-1">{{ summary.action }}</dd></div>
          <div class="flex gap-2"><dt class="text-gray-500 w-24">시각</dt><dd class="flex-1">{{ summary.ts }}</dd></div>
          <div class="flex gap-2 sm:col-span-2"><dt class="text-gray-500 w-24">ContentID</dt><dd class="flex-1 break-all">{{ summary.contentId }}</dd></div>
        </dl>

        <!-- 원문 JSON 토글 -->
        <details class="mt-4">
          <summary class="cursor-pointer text-sm text-gray-600">원문 JSON 보기</summary>
          <pre class="mt-2 text-xs overflow-auto whitespace-pre-wrap">{{ pretty(summary.raw) }}</pre>
        </details>
      </div>

      <div v-else class="p-4 rounded-lg border bg-gray-50">
        <div class="font-semibold mb-1">스테가노그래피 정보 없음</div>
        <div class="text-sm text-gray-600">
          {{ friendlyReason(result?.reason) }}
        </div>
      </div>
    </div>

    <div class="mt-10 text-xs text-gray-400">
      * 지원 형식: .png, .jpg/.jpeg, .pdf
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Spinner from '@/components/common/Spinner.vue'

const fileInput = ref(null)
const dragOver = ref(false)
const loading  = ref(false)
const result   = ref(null)

// 보기 좋은 JSON
function pretty(obj) {
  try { return JSON.stringify(obj, null, 2) } catch { return String(obj) }
}

// 사유 문구
function friendlyReason(r) {
  if (!r) return "메타데이터 내 추적 정보가 확인되지 않았습니다."
  if (r === "no-stego") return "메타데이터에 삽입된 추적 정보가 없습니다."
  if (r === "unsupported-file-type") return "지원하지 않는 파일 형식입니다. PNG/JPG/PDF만 가능합니다."
  if (r.startsWith?.("decode-error")) return "파일을 해석하는 중 오류가 발생했습니다."
  if (r === "invalid-metadata") return "손상되었거나 잘못 저장된 메타데이터로 보입니다."
  if (r === "network-error") return "네트워크 오류가 발생했습니다."
  return r
}

// 새 업로드 시 화면 리셋
function resetUI() {
  result.value = null
}

// 서버 응답 → 요약 객체로 변환
function toSummary(r) {
  const p = r?.payloadJson ?? (r?.payload ? JSON.parse(r.payload) : null)
  if (!p) return null
  return {
    app: p.app, uid: p.uid, deviceId: p.deviceId,
    macQuality: p.macQuality, vm: p.vm,
    action: p.action, ts: p.ts, contentId: p.contentId,
    raw: p
  }
}
const summary = computed(() => toSummary(result.value))

async function send(file) {
  resetUI()
  loading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/forensic/decode', { method:'POST', body: fd })
    result.value = await res.json()
  } catch {
    result.value = { ok:false, reason:'network-error' }
  } finally {
    loading.value = false
    if (fileInput.value) fileInput.value.value = '' // input 리셋
  }
}

function onChoose(e) {
  const f = e.target.files?.[0]
  if (f) send(f)
}
function onDrop(e) {
  dragOver.value = false
  const f = e.dataTransfer.files?.[0]
  if (f) send(f)
}
</script>

<style scoped>
/* Tailwind 사용 시 추가 스타일 불필요 */
</style>
