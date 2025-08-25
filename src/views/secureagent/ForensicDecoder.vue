<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Stego 추출 · 포렌식 뷰어</h1>
    <p class="text-sm text-gray-600 mb-6">
      PNG / JPG / PDF 파일을 업로드하면 메타데이터에 삽입된 추적 정보를 복호화하여 표시합니다.
      (서버에 저장하지 않고, 메모리/임시파일에서 즉시 삭제)
    </p>

    <div
      class="border-2 border-dashed rounded-xl p-8 text-center mb-4"
      :class="dragOver ? 'border-blue-500' : 'border-gray-300'"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="onDrop"
    >
      <p class="mb-3">여기로 파일을 드래그하거나</p>
      <input ref="fileInput" type="file" class="hidden" @change="onChoose" />
      <button class="px-4 py-2 rounded-lg border" @click="$refs.fileInput.click()">파일 선택</button>
    </div>

    <div v-if="loading" class="text-sm">분석 중...</div>

    <div v-if="result" class="mt-6 space-y-3">
      <div class="text-sm text-gray-500">파일: {{ result.fileName }} ({{ result.fileType }})</div>

      <div v-if="result.ok && result.hasStego" class="p-4 rounded-lg border">
        <div class="font-semibold mb-2">복호화 결과</div>

        <div v-if="result.payloadJson">
          <pre class="text-sm overflow-auto whitespace-pre-wrap">{{ pretty(result.payloadJson) }}</pre>
        </div>
        <div v-else>
          <pre class="text-sm overflow-auto whitespace-pre-wrap">{{ result.payload }}</pre>
        </div>

        <div class="mt-3 text-xs text-gray-500">
          encPayloadB64 (메타 원문):
          <code class="block break-all">{{ result.encPayloadB64 }}</code>
        </div>

        <div class="mt-3">
          <button class="px-3 py-1 text-sm border rounded"
                  @click="copy(result.payload ?? '')">복호화 결과 복사</button>
        </div>
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
import { ref } from "vue";

const dragOver = ref(false);
const loading = ref(false);
const result = ref(null);

function pretty(obj) {
  try { return JSON.stringify(obj, null, 2); } catch { return String(obj); }
}

function friendlyReason(r) {
  if (!r) return "메타데이터 내 추적 정보가 확인되지 않았습니다.";
  if (r === "no-stego") return "메타데이터에 삽입된 추적 정보가 없습니다.";
  if (r === "unsupported-file-type") return "지원하지 않는 파일 형식입니다. PNG/JPG/PDF만 가능합니다.";
  if (r.startsWith("decode-error")) return "파일을 해석하는 중 오류가 발생했습니다.";
  if (r === "invalid-metadata") return "손상되었거나 잘못 저장된 메타데이터로 보입니다.";
  return r;
}

async function send(file) {
  loading.value = true;
  result.value = null;
  try {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/forensic/decode", { method: "POST", body: fd });
    result.value = await res.json();
  } catch (e) {
    result.value = { ok: false, reason: "network-error" };
  } finally {
    loading.value = false;
  }
}

function onChoose(e) {
  const f = e.target.files?.[0];
  if (f) send(f);
  e.target.value = "";
}

function onDrop(e) {
  dragOver.value = false;
  const f = e.dataTransfer.files?.[0];
  if (f) send(f);
}

async function copy(text) {
  try { await navigator.clipboard.writeText(text); } catch {}
}
</script>

<style scoped>
/* 최소 스타일 (Tailwind 쓴다면 위 클래스만으로 충분) */
</style>
