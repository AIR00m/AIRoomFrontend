<template>
  <Header />

  <div class="assignment-submission-app">
    <main v-if="assignment" class="main-content">
      <!-- 목록으로 이동 버튼 -->
      <button class="back-to-list-btn" @click="goBackToList">
        <i class="icon">📋</i>
        <span>{{ backButtonText }}</span>
      </button>

      <!-- 과제 정보 카드 -->
      <div class="assignment-card">
        <div class="card-header">
          <div class="card-header-top">
            <div
              class="assignment-type-badge"
              :class="assignmentTypeBadgeClass"
            >
              {{ assignmentTypeBadge }}
            </div>
            <button
              v-if="isGroup"
              class="group-board-btn"
              @click="goToGroupBoard"
            >
              👥 모둠게시판
            </button>
          </div>
          <div class="assignment-title-area">
            <h2 class="assignment-title">{{ assignment.title }}</h2>
            <div class="assignment-meta">
              <span class="registration-date">{{ dateRangeText }}</span>
            </div>
          </div>
        </div>
        <div class="card-content">
          <div class="assignment-info">
            <!-- 과제 기간 (가로 레이아웃) -->
            <div class="info-row flex-horizontal">
              <div class="info-label">📅 과제 기간</div>
              <div class="info-value period-value">
                <span class="date-label">시작일</span>
                <span class="date-value">{{
                  formatDate(assignment.startDate)
                }}</span>
                <span class="date-bar">~</span>
                <span class="date-label">마감일</span>
                <span class="date-value">{{
                  formatDate(assignment.dueDate)
                }}</span>
              </div>
            </div>

            <!-- 대상 학생 -->
            <div
              v-if="
                assignment.targetStudents &&
                assignment.targetStudents.length > 0
              "
              class="info-row"
            >
              <div class="info-label">🎯 대상 학생</div>
              <div class="info-value">
                <span
                  v-for="student in assignment.targetStudents"
                  :key="student"
                >
                  {{ student }}
                </span>
              </div>
            </div>

            <!-- 대상 모둠 -->
            <div
              v-if="
                assignment.assignedGroups &&
                assignment.assignedGroups.length > 0
              "
              class="info-row"
            >
              <div class="info-label">👥 대상 모둠</div>
              <div class="info-value">
                <span
                  v-for="group in assignment.assignedGroups"
                  :key="group.groupId"
                >
                  {{ group.groupName }}
                </span>
              </div>
            </div>

            <!-- 첨부파일 -->
            <div
              v-if="
                assignment.teacherAttachments &&
                assignment.teacherAttachments.length > 0
              "
              class="info-row"
            >
              <div class="info-label">📎 첨부파일</div>
              <div class="info-value file-list">
                <span
                  v-for="file in assignment.teacherAttachments"
                  :key="
                    file.s3Key ||
                    file.savedName ||
                    file.originalName ||
                    file.name
                  "
                  class="download-link"
                >
                  <a href="#" @click.prevent="downloadFile(file)">
                    {{ file.originalName }}
                  </a>
                </span>
              </div>
            </div>

            <!-- 과제 내용 -->
            <div class="info-row">
              <div class="info-label">📝 과제 내용</div>
              <div class="info-value">
                <div class="teacher-message">
                  <div class="message-header">
                    <span class="teacher-icon">👩‍🏫</span>
                    <span class="message-title">{{ teacherMessageTitle }}</span>
                  </div>
                  <div class="message-content">
                    <p>{{ assignment.content }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 과제 제출/확인 영역 -->
      <div
        v-if="!submittedAssignment && canModifySubmission"
        class="submission-card"
      >
        <div class="card-header">
          <h3 class="card-title">{{ submissionCardTitle }}</h3>
          <div v-if="isGroup" class="group-notice">
            👥 모둠원들과 함께 협력하여 과제를 완성해주세요!
          </div>
          <div class="privacy-notice">
            {{ privacyNoticeText }}
          </div>
        </div>
        <div class="card-content">
          <form @submit.prevent="submitAssignment">
            <div class="form-group">
              <label class="form-label">{{ contentLabel }}</label>
              <textarea
                v-model="submissionContent"
                class="submission-editor"
                :placeholder="contentPlaceholder"
                rows="6"
                required
              ></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">{{ attachmentLabel }}</label>
              <div class="file-upload-area">
                <div
                  class="file-drop-zone"
                  @dragover.prevent
                  @drop.prevent="handleFileDrop"
                  @click="triggerFileInput"
                >
                  <div class="drop-zone-content">
                    <div class="upload-icon">📁</div>
                    <p class="upload-text">
                      <button type="button" class="file-select-btn">
                        {{ fileSelectText }}
                      </button>
                      {{ dragDropText }}
                    </p>
                  </div>
                  <input
                    ref="fileInput"
                    type="file"
                    multiple
                    @change="handleFileSelect"
                    style="display: none"
                  />
                </div>
                <div v-if="hasSelectedFiles" class="file-list">
                  <div
                    v-for="(file, index) in selectedFiles"
                    :key="`file-${index}`"
                    class="file-item"
                  >
                    <span class="file-icon">📄</span>
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size"
                      >({{ formatFileSize(file.size) }})</span
                    >
                    <button
                      type="button"
                      class="file-remove-btn"
                      @click="removeFile(index)"
                      :aria-label="`${file.name} 파일 삭제`"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="submit-button-area">
              <button
                type="submit"
                class="submit-btn"
                :disabled="!canSubmit || isSubmitting"
                :class="{ disabled: !canSubmit || isSubmitting }"
              >
                {{ isSubmitting ? "⏳ 제출 중..." : submitButtonText }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 이미 제출했지만 재수정 가능한 경우 -->
      <div v-else-if="canResubmit" class="resubmission-card">
        <div class="card-header">
          <h3 class="card-title">✅ 제출 완료 (재수정 가능)</h3>
          <div class="resubmit-notice">📝 마감일 전까지 수정이 가능합니다.</div>
        </div>

        <!-- 보기 모드 -->
        <div v-if="!isEditingSubmission" class="card-content">
          <div class="submitted-info">
            <div class="info-row">
              <div class="info-label">📅 제출일</div>
              <div class="info-value">
                {{ submittedAssignment?.submissionDate || "-" }}
              </div>
            </div>
            <div class="info-row" v-if="submittedAssignment?.content">
              <div class="info-label">📝 내용</div>
              <div class="info-value">
                <div class="submitted-content">
                  {{ submittedAssignment.content }}
                </div>
              </div>
            </div>
            <div class="info-row" v-if="submittedAssignment?.files?.length">
              <div class="info-label">📎 첨부파일</div>
              <div class="info-value">
                <div
                  v-for="file in submittedAssignment.files"
                  :key="file.name"
                  class="submitted-file"
                >
                  📄 {{ file.name }}
                </div>
              </div>
            </div>
          </div>

          <div class="submit-button-area">
            <button
              type="button"
              class="submit-btn"
              @click="startEditSubmission"
            >
              ✏️ 수정하기
            </button>
          </div>
        </div>

        <!-- 수정 모드 -->
        <div v-else class="card-content">
          <form @submit.prevent="resubmitAssignment">
            <div class="form-group">
              <label class="form-label">✏️ 내용</label>
              <textarea
                v-model="submissionContent"
                class="submission-editor"
                placeholder="수정할 내용을 입력하세요..."
                rows="6"
                required
              ></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">📎 새 첨부파일 추가 (선택)</label>
              <div class="file-upload-area">
                <div
                  class="file-drop-zone"
                  @dragover.prevent
                  @drop.prevent="handleFileDrop"
                  @click="triggerFileInput"
                >
                  <div class="drop-zone-content">
                    <div class="upload-icon">📁</div>
                    <p class="upload-text">
                      <button type="button" class="file-select-btn">
                        파일 선택
                      </button>
                      또는 파일을 여기로 드래그하세요.
                    </p>
                  </div>
                  <input
                    ref="fileInput"
                    type="file"
                    multiple
                    @change="handleFileSelect"
                    style="display: none"
                  />
                </div>
                <div v-if="hasSelectedFiles" class="file-list">
                  <div
                    v-for="(file, index) in selectedFiles"
                    :key="`file-${index}`"
                    class="file-item"
                  >
                    <span class="file-icon">📄</span>
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size"
                      >({{ formatFileSize(file.size) }})</span
                    >
                    <button
                      type="button"
                      class="file-remove-btn"
                      @click="removeFile(index)"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="submit-button-area">
              <button
                type="button"
                class="submit-btn"
                @click="cancelEditSubmission"
              >
                취소
              </button>
              <button
                type="submit"
                class="submit-btn"
                :disabled="!canSubmit || isSubmitting"
                :class="{ disabled: !canSubmit || isSubmitting }"
              >
                {{ isSubmitting ? "⏳ 수정 중..." : "💾 수정 제출" }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 마감일이 지나서 수정 불가능한 경우 -->
      <div v-else-if="submittedAssignment" class="submitted-card">
        <!-- 마감 여부에 따른 안내 메시지 추가 -->
        <div v-if="isDeadlinePassed" class="deadline-notice">
          ⏰ 마감된 과제입니다. 더 이상 수정할 수 없습니다.
        </div>

        <div class="card-header">
          <h3 class="card-title">{{ submittedCardTitle }}</h3>
        </div>
        <div class="card-content">
          <div class="submitted-info">
            <!-- 제출된 내용 표시 -->
            <div
              v-for="info in submittedInfoItems"
              :key="info.key"
              class="info-row"
            >
              <div class="info-label">{{ info.label }}</div>
              <div class="info-value">
                <template v-if="info.key === 'content'">
                  <div class="submitted-content">
                    {{ submittedAssignment.content }}
                  </div>
                </template>
                <template v-else-if="info.key === 'files'">
                  <div class="submitted-files">
                    <div
                      v-for="file in submittedAssignment.files"
                      :key="file.name"
                      class="submitted-file"
                    >
                      📄 {{ file.name }}
                    </div>
                  </div>
                </template>
                <template v-else>
                  {{ info.value }}
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 아직 제출하지 않았고 마감된 경우만 readonly-card 표시 -->
      <div
        v-else-if="isDeadlinePassed && !submittedAssignment"
        class="readonly-card"
      >
        <div class="card-header">
          <h3 class="card-title">⏰ 마감된 과제</h3>
          <div class="deadline-notice">마감일이 지나 제출할 수 없습니다.</div>
        </div>
      </div>

      <div v-if="evaluation" class="evaluation-card">
        <div class="card-header">
          <h3 class="card-title">{{ evaluationCardTitle }}</h3>
        </div>
        <div class="card-content">
          <div class="evaluation-content">
            <div class="info-row">
              <div class="info-label">{{ feedbackLabel }}</div>
              <div class="info-value">
                <div class="teacher-feedback">
                  <div class="feedback-header">
                    <span class="teacher-avatar">👩‍🏫</span>
                    <span class="teacher-name">{{ teacherName }}</span>
                    <span class="feedback-date">{{ evaluation.date }}</span>
                  </div>
                  <div class="feedback-message">
                    {{ evaluation.feedback }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <div v-else class="main-content">
      <div class="loading-state">
        <div class="loading-icon">⏳</div>
        <p class="loading-text">{{ loadingText }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import Header from "@/components/common/Header.vue";
import { useAuthStore } from "@/stores/auth";
import apiClient from "@/utils/apiClient";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const isEditingSubmission = ref(false);

const assignment = ref(null);
const submissionContent = ref("");
const selectedFiles = ref([]);
const submittedAssignment = ref(null);
const evaluation = ref(null);
const fileInput = ref(null);

const isLoading = ref(false);
const isSubmitting = ref(false);
const error = ref("");

const toBool = (v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string")
    return ["true", "1", "y", "yes"].includes(v.toLowerCase());
  return false;
};

const downloading = ref({}); // 중복 클릭 방지 (선택)

const downloadFile = async (file) => {
  console.log("download param:", file); // 무엇이 넘어오는지 즉시 확인
  const key = Array.isArray(file?.s3Key) ? file.s3Key[0] : file?.s3Key;
  if (!key) {
    alert("파일 키(s3Key)가 없습니다.");
    return;
  }
  if (downloading.value[file.s3Key]) return;
  downloading.value[file.s3Key] = true;

  try {
    // 1) presigned URL 발급 (POST + JSON 바디)
    const res = await apiClient.post(
      "/presigned-url/download",
      { s3Key: file.s3Key } // DTO: { String s3Key }
    );
    // 서버가 문자열만 주거나, { presignedUrl }로 줄 수 있으니 둘 다 대응
    const presignedUrl = res;
    if (!presignedUrl) throw new Error("Presigned URL을 받지 못했습니다.");

    // 2) 실제 파일 GET
    const r = await fetch(presignedUrl);
    if (!r.ok) throw new Error("파일 응답 실패");
    const blob = await r.blob();

    // 3) 파일 저장 (원본 이름 유지)
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.originalName || file.name || "download";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error(e);
    alert(e?.message || "다운로드 실패");
  } finally {
    downloading.value[file.s3Key] = false;
  }
};

const startEditSubmission = () => {
  isEditingSubmission.value = true;
  submissionContent.value = submittedAssignment.value?.content || "";
  selectedFiles.value = []; // 기존 파일은 서버에 이미 있으므로 신규만 업로드
};

// 편집 취소
const cancelEditSubmission = () => {
  isEditingSubmission.value = false;
  submissionContent.value = "";
  selectedFiles.value = [];
};

const hasSubmitted = computed(
  () => !!submittedAssignment.value || !!assignment.value?.submitted
);

// ✅ 수정된 파일 업로드 함수 - SubjectBoardWrite 참고
const uploadFiles = async (homeworkBoardNo) => {
  const failedFiles = [];

  console.log(`총 ${selectedFiles.value.length}개 파일 업로드 시작`);

  for (let i = 0; i < selectedFiles.value.length; i++) {
    const file = selectedFiles.value[i];
    console.log(
      `파일 ${i + 1}/${selectedFiles.value.length} 업로드 시작:`,
      file.name
    );

    try {
      // 1. Presigned URL 요청
      console.log("Presigned URL 요청...");
      const presignedResponse = await apiClient.post("/presigned-url/upload", {
        boardNo: homeworkBoardNo,
        boardType: "HOMEWORK", // ✅ 과제 제출용으로 HOMEWORK 사용
        originalName: file.name,
      });

      console.log("Presigned URL 응답:", presignedResponse);
      const { presignedUrl, savedName, s3Key } = presignedResponse;

      // 2. S3에 실제 파일 업로드
      console.log("S3 업로드 시작...");
      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadRes.ok) {
        console.error(
          "S3 업로드 실패:",
          uploadRes.status,
          uploadRes.statusText
        );
        throw new Error("S3 업로드 실패");
      }
      console.log("S3 업로드 성공");

      // 3. 메타데이터 등록
      console.log("메타데이터 저장 시작...");
      const attachmentResponse = await apiClient.post(
        "/presigned-url/attachment",
        {
          boardNo: homeworkBoardNo,
          boardType: "HOMEWORK", // ✅ 과제 제출용으로 HOMEWORK 사용
          originalName: file.name,
          savedName: savedName,
          s3Key: s3Key,
        }
      );

      console.log("메타데이터 저장 성공:", attachmentResponse);
    } catch (err) {
      console.error(`파일 업로드 실패: ${file.name}`, err);
      failedFiles.push(file);
    }
  }

  if (failedFiles.length > 0) {
    console.error(
      "업로드 실패한 파일들:",
      failedFiles.map((f) => f.name)
    );
    throw new Error(
      `일부 파일 업로드에 실패했습니다: ${failedFiles
        .map((f) => f.name)
        .join(", ")}`
    );
  }

  console.log("모든 파일 업로드 완료");
};

// ✅ 수정된 재제출 함수
const resubmitAssignment = async () => {
  if (!canSubmit.value) {
    alert("내용을 입력하거나 파일을 첨부해주세요!");
    return;
  }
  if (isSubmitting.value) return;

  try {
    isSubmitting.value = true;

    const submissionData = {
      content: submissionContent.value,
    };

    console.log("재제출 요청 데이터:", submissionData);
    console.log("homeworkBoardNo:", assignment.value.homeworkBoardNo);

    // 1. 과제 내용 수정 제출
    const result = await apiClient.post(
      `/homework/student/${assignment.value.homeworkBoardNo}`,
      submissionData
    );

    console.log("과제 내용 제출 성공:", result);

    // 2. 파일이 있는 경우 파일 업로드 처리
    if (selectedFiles.value.length > 0) {
      console.log("파일 업로드 프로세스 시작");
      await uploadFiles(assignment.value.homeworkBoardNo);
      console.log("파일 업로드 프로세스 완료");
    }

    // 화면 반영
    const now = new Date();
    submittedAssignment.value = {
      content: submissionContent.value,
      files: [...selectedFiles.value], // 신규 첨부만 표시(기존 파일은 서버 응답으로 병합 가능)
      submissionDate: now.toLocaleDateString("ko-KR"),
    };
    assignment.value = { ...(assignment.value || {}), submitted: true };
    isEditingSubmission.value = false;

    alert("수정 제출되었습니다!");
  } catch (error) {
    console.error("수정 제출 실패:", error);
    alert("수정 제출에 실패했습니다: " + (error.message || "알 수 없는 오류"));
  } finally {
    isSubmitting.value = false;
  }
};

// ✅ 사용자 정보 초기화 함수
const initializeData = async (assignBoardNo) => {
  try {
    isLoading.value = true;
    error.value = null;

    // Auth Store에서 인증 상태 확인
    if (!authStore.isAuthenticated) {
      throw new Error("로그인이 필요합니다.");
    }

    // 사용자 정보 가져오기
    const userInfo = authStore.getUserInfo();

    if (!userInfo.classroomNo) {
      throw new Error("교실 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
    }

    console.log("📚 사용자 정보 확인됨:", userInfo);

    // 과제 상세 정보 로드
    await fetchAssignment(assignBoardNo, userInfo);
  } catch (err) {
    error.value = err.message;
    console.error("데이터 초기화 실패:", err);

    // 인증 오류인 경우 로그인 페이지로 리다이렉트
    if (err.message.includes("로그인") || err.message.includes("인증")) {
      router.push("/login");
    }
  } finally {
    isLoading.value = false;
  }
};

// API 호출 함수들
const fetchAssignment = async (assignBoardNo, userInfo = null) => {
  try {
    // userInfo가 없으면 Auth Store에서 가져오기
    if (!userInfo) {
      userInfo = authStore.getUserInfo();
    }

    // 필수 데이터 검증
    if (!userInfo.classroomNo) {
      throw new Error("교실 정보가 없습니다.");
    }

    console.log(`🌐 API 호출: /assign/student/${assignBoardNo}`);

    const tokenInfo = localStorage.getItem("tokenInfo");
    const studentNo = JSON.parse(tokenInfo);

    console.log(studentNo);

    // ApiClient를 통한 토큰 자동 처리
    const data = await apiClient.get(
      `/assign/${assignBoardNo}/student/${studentNo.classRoomStudentNo}`
    );

    // 과제 데이터 설정
    assignment.value = (() => {
      // 모둠 여부 신뢰도 높은 보정값들
      const hasAssignedGroups =
        Array.isArray(data.assignedGroups) && data.assignedGroups.length > 0;
      const hasGroupInTargets =
        Array.isArray(data.assignTargets) &&
        data.assignTargets.some((t) => toBool(t?.groupAssignType));

      return (assignment.value = {
        ...data,
        // 날짜/제목/내용 키 통일
        startDate: data.startDate ?? data.startTime ?? null,
        dueDate: data.dueDate ?? data.endTime ?? null,
        assignBoardTitle: data.assignBoardTitle ?? data.title ?? "",
        assignBoardContent: data.assignBoardContent ?? data.content ?? "",

        // 첨부 키 통일
        teacherAttachments:
          data.teacherAttachments ?? data.teacherAttachment ?? [],
        studentAttachments:
          data.studentAttachments ?? data.studentAttachment ?? [],

        // 모둠 여부(서버 키 반영)
        isGroupAssignment: toBool(
          data.isGroupAssignment ??
            data.isGroupAssignType ??
            data.groupAssignType
        ),
        homeworkBoardNo: data.homeworkBoardNo ?? null,
        homeworkBoardContent: data.homeworkBoardContent ?? null,
        homework: {
          boardNo: data.homeworkBoardNo ?? null,
          content:
            typeof data.homeworkBoardContent === "string"
              ? data.homeworkBoardContent
              : null,
        },

        // 제출 여부(명시 플래그 없으므로 내용/첨부로 판단)
        submitted:
          (typeof data.homeworkBoardContent === "string" &&
            data.homeworkBoardContent.trim().length > 0) ||
          (Array.isArray(data.studentAttachment) &&
            data.studentAttachment.length > 0),
      });
    })();

    // 제출 정보 처리
    if (data.mySubmission) {
      submittedAssignment.value = {
        content: data.mySubmission.content,
        files: data.mySubmission.files || [],
        submissionDate: data.mySubmission.submissionDate,
        submitter: data.mySubmission.submitter,
      };

      // 피드백 정보 설정
      if (data.mySubmission.feedback) {
        evaluation.value = {
          feedback: data.mySubmission.feedback,
          date: data.mySubmission.feedbackDate,
        };
      }
    }

    console.log("✅ 과제 상세 정보 로드 완료");
  } catch (err) {
    const errorMessage = err.message || "과제 정보를 불러오는데 실패했습니다.";
    error.value = errorMessage;
    console.error("API 호출 에러:", err);

    // 인증 에러인 경우 자동으로 처리됨 (ApiClient에서)
    if (err.status === 401) {
      console.log("🔄 토큰 만료 감지, ApiClient에서 자동 처리됨");
    } else {
      alert("과제 정보를 불러오는데 실패했습니다.");
      router.push("/assignment");
    }
  }
};

// ✅ 수정된 submitAssignmentToServer 함수
const submitAssignmentToServer = async () => {
  try {
    isSubmitting.value = true;

    const submissionData = {
      content: submissionContent.value,
    };

    console.log("제출 요청 데이터:", submissionData);
    console.log("homeworkBoardNo:", assignment.value.homeworkBoardNo);

    // 1. 과제 내용 제출
    const result = await apiClient.post(
      `/homework/student/${assignment.value.homeworkBoardNo}`,
      submissionData
    );

    console.log("과제 내용 제출 성공:", result);

    // 2. 파일이 있는 경우 파일 업로드 처리
    if (selectedFiles.value.length > 0) {
      console.log("파일 업로드 프로세스 시작");
      await uploadFiles(assignment.value.homeworkBoardNo);
      console.log("파일 업로드 프로세스 완료");
    }

    console.log("✅ 제출 성공:", result);

    // 제출 완료 처리
    const now = new Date();
    submittedAssignment.value = {
      content: submissionContent.value,
      files: [...selectedFiles.value],
      submissionDate: now.toLocaleDateString("ko-KR"),
    };

    alert("과제가 성공적으로 제출되었습니다!");
  } catch (error) {
    console.error("과제 제출 실패:", error);
    alert("과제 제출에 실패했습니다: " + error.message);
  } finally {
    isSubmitting.value = false;
  }
};

/* -------------------- computed -------------------- */

const isDeadlinePassed = computed(() => {
  const rawDue = assignment.value?.dueDate ?? assignment.value?.endTime; // ✅ fallback
  if (!rawDue) return false;
  const due = new Date(rawDue);
  if (Number.isNaN(due.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
});

const isGroup = computed(() => toBool(assignment.value?.isGroupAssignment));

const canModifySubmission = computed(() => {
  return !isDeadlinePassed.value && !hasSubmitted.value;
});

const canResubmit = computed(() => {
  return !isDeadlinePassed.value && hasSubmitted.value;
});

const dateRangeText = computed(() => {
  if (!assignment.value) return "";
  const s = assignment.value.startDate ?? assignment.value.startTime;
  const e = assignment.value.dueDate ?? assignment.value.endTime;
  return `${formatDate(s)} ~ ${formatDate(e)}`;
});

const backButtonText = computed(() => "목록으로 돌아가기");
const assignmentTypeBadge = computed(() =>
  isGroup.value ? "👥 모둠 과제" : "🧑 개별 과제"
);

const assignmentTypeBadgeClass = computed(() =>
  isGroup.value ? "group-assignment" : "individual-assignment"
);

const teacherMessageTitle = computed(() => "선생님 메시지");

const submissionCardTitle = computed(() =>
  isGroup.value ? "👥 모둠 과제 제출하기" : "🐣 과제 제출하기"
);

const privacyNoticeText = computed(
  () =>
    "💡 게시 자료는 공개될 수 있으니, 개인정보가 포함되지 않도록 유의해주세요."
);
const contentLabel = computed(() => "✏️ 내용");
const contentPlaceholder = computed(() => "과제 내용을 입력해주세요...");
const attachmentLabel = computed(() => "📎 첨부파일");
const fileSelectText = computed(() => "파일 선택");
const dragDropText = computed(() => "또는 파일을 여기로 드래그하세요.");
const hasSelectedFiles = computed(() => selectedFiles.value.length > 0);
const canSubmit = computed(() => {
  const hasText = (submissionContent.value || "").trim().length > 0;
  return hasText || hasSelectedFiles.value;
});

const submitButtonText = computed(() => "🐥 제출하기");
const submittedCardTitle = computed(() =>
  isGroup.value ? "✅ 우리 모둠이 제출한 과제" : "✅ 내가 제출한 과제"
);
const submittedInfoItems = computed(() => {
  const s = submittedAssignment.value;
  if (!s) return [];
  const items = [
    { key: "date", label: "📅 제출일", value: s.submissionDate ?? "-" },
    { key: "content", label: "📝 내용", value: s.content ?? "" },
  ];
  const files = Array.isArray(s.files) ? s.files : [];
  if (files.length > 0) {
    items.push({ key: "files", label: "📎 첨부파일", value: null });
  }
  return items;
});
const evaluationCardTitle = computed(() => "⭐ 선생님 평가");
const feedbackLabel = computed(() => "💬 피드백");
const teacherName = computed(() => "선생님");
const loadingText = computed(() => "과제 정보를 불러오는 중입니다...");

/* -------------------- 유틸리티 -------------------- */
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return String(dateString); // 렌더 중단 방지
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/* -------------------- 액션 메서드 -------------------- */
const goBackToList = () => {
  router.push("/assignment");
};
const goToGroupBoard = () => {
  const assignBoardNo =
    assignment.value?.assignBoardNo ?? parseInt(route.params.id);
  router.push(`/group-board/${assignBoardNo}`);
};

const triggerFileInput = () => {
  fileInput.value?.click();
};
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  addFiles(files);
  // 파일 입력 초기화
  event.target.value = "";
};
const handleFileDrop = (event) => {
  const files = Array.from(event.dataTransfer.files);
  addFiles(files);
};

// ✅ 파일 추가 함수 개선
const addFiles = (files) => {
  const maxFiles = 5;
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (selectedFiles.value.length + files.length > maxFiles) {
    alert(`파일은 최대 ${maxFiles}개까지 등록할 수 있습니다.`);
    return;
  }

  const oversizedFiles = files.filter((file) => file.size > maxSize);
  if (oversizedFiles.length > 0) {
    alert("10MB 이하의 파일만 업로드할 수 있습니다.");
    return;
  }

  selectedFiles.value.push(...files);
};

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
};

// 과제 제출 함수 수정
const submitAssignment = () => {
  if (!canSubmit.value) {
    alert("내용을 입력하거나 파일을 첨부해주세요!");
    return;
  }

  if (isSubmitting.value) {
    alert("제출 중입니다. 잠시만 기다려주세요.");
    return;
  }

  submitAssignmentToServer();
};

/* -------------------- 라이프사이클 -------------------- */
onMounted(() => {
  const assignBoardNo = parseInt(route.params.id);
  console.log("AssignmentDetail: assignBoardNo =", assignBoardNo);
  if (assignBoardNo) {
    initializeData(assignBoardNo); // 기존 fetchAssignment 대신 initializeData 호출
  } else {
    alert("잘못된 과제 ID입니다.");
    router.push("/assignment");
  }
});
</script>

<style scoped>
/* 전역 스타일 */
.assignment-submission-app {
  font-family: "Comic Sans MS", "Segoe UI", -apple-system, BlinkMacSystemFont,
    sans-serif;
  background: #fff9e6;
  min-height: 100vh;
  color: #333;
}

.main-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

/* 뒤로가기 버튼 */
.back-to-list-btn {
  background: white;
  border: 3px solid #fff5d6;
  border-radius: 15px;
  padding: 0.8rem 1.5rem;
  color: #ff9800;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.info-row.flex-horizontal {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  background: #fffbf0;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(255, 195, 82, 0.07);
  padding: 1.05rem 1.2rem;
  border: 2px dashed #ffe066;
}

.period-value {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
}
.date-label {
  background: #ffe8b0;
  color: #994e00;
  border-radius: 8px;
  padding: 0.15rem 0.65rem;
  font-size: 0.96em;
  margin: 0 0.18rem;
  box-shadow: 0 1px 6px rgba(255, 188, 87, 0.08);
}
.date-value {
  color: #d99300;
  font-weight: 800;
  font-size: 1em;
  margin-right: 0.42rem;
}
.date-bar {
  font-size: 1.08em;
  color: #d99300;
  font-weight: 900;
  margin: 0 0.38rem;
}

.back-to-list-btn:hover {
  background: #fffbf0;
  border-color: #ffdd29;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.2);
}

/* 공통 카드 스타일 */
.assignment-card,
.submission-card,
.submitted-card,
.evaluation-card {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  border: 3px solid #fff5d6;
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.1);
}

.card-header {
  margin-bottom: 1.5rem;
}

/* ✅ 추가: 카드 헤더 상단 영역 (배지 + 모둠게시판 버튼) */
.card-header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ff9800;
  margin: 0 0 1rem 0;
}

/* 과제 정보 카드 - 과제 타입별 배지 스타일 */
.assignment-type-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
  display: inline-block;
}

.assignment-type-badge.individual-assignment {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
}

.assignment-type-badge.group-assignment {
  background: linear-gradient(135deg, #9c27b0, #7b1fa2);
  color: white;
}

.download-link {
  display: flex;
  align-items: center;
  gap: 0.22rem;
  background: linear-gradient(90deg, #ffe3a3 85%, #ffd1bc 100%);
  border-radius: 10px;
  padding: 0.34rem 0.78rem;
  font-weight: 700;
  font-size: 1rem;
  color: #ff9800;
  box-shadow: 0 1px 4px rgba(255, 188, 87, 0.13);
  border: 1px solid #ffd79c;
  transition: background 0.2s, box-shadow 0.2s;
}
.download-link a {
  color: #ff9800;
  text-decoration: none;
  font-weight: 700;
}

.download-link:hover,
.download-link:active {
  background: linear-gradient(90deg, #ffd26a 88%, #ffbfa7 100%);
  color: #ffd740;
  box-shadow: 0 6px 12px rgba(255, 188, 87, 0.18);
}

.download-link::before {
  content: "📎";
  font-size: 1.16em;
  margin-right: 0.18em;
  vertical-align: middle;
}

/* ✅ 추가: 모둠게시판 버튼 스타일 */
.group-board-btn {
  background: linear-gradient(135deg, #4caf50, #388e3c);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.group-board-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  background: linear-gradient(135deg, #388e3c, #2e7d32);
}

/* 재수정 카드 */
.resubmission-card {
  background: linear-gradient(135deg, #fff8e1, #fff3e0);
  border-color: #ffcc80;
}

.resubmit-notice {
  background: #fff3e0;
  border: 2px solid #ffcc80;
  border-radius: 15px;
  padding: 1rem 1.5rem;
  font-size: 0.9rem;
  color: #e65100;
  line-height: 1.5;
  margin-top: 1rem;
  font-weight: 600;
}

/* 읽기 전용 카드 */
.readonly-card {
  background: linear-gradient(135deg, #f5f5f5, #eeeeee);
  border-color: #bdbdbd;
}

.deadline-notice {
  background: #ffebee;
  border: 2px solid #ef5350;
  border-radius: 15px;
  padding: 1rem 1.5rem;
  font-size: 0.9rem;
  color: #c62828;
  line-height: 1.5;
  margin-top: 1rem;
  font-weight: 600;
}

.assignment-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #8c6d32;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.assignment-meta {
  color: #ffb74d;
  font-size: 0.9rem;
  font-weight: 600;
}
/* 정보 행 자체를 구분감 있게 */
.info-row {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 1.25rem;
  background: #fffbf0;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(255, 195, 82, 0.07);
  padding: 1.05rem 1.2rem;
  border: 2px dashed #ffe066;
  transition: background 0.24s, box-shadow 0.18s;
}

.info-label {
  min-width: 110px;
  font-weight: 750;
  color: #e65100;
  font-size: 1.07rem;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
}

.info-value {
  flex: 1;
  color: #7b4200;
  font-size: 1rem;
  line-height: 1.45;
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  align-items: center;
}

.info-value span {
  background: #fafafa;
  border: 1px solid #ffe1ac;
  padding: 0.16rem 0.52rem;
  border-radius: 7px;
  font-size: 0.96em;
  color: #db880a;
  margin-right: 0.15em;
  margin-bottom: 2px;
  box-shadow: 0 2px 6px rgba(255, 195, 82, 0.08);
}

.info-value span:hover {
  background: #ffe8b0;
  color: #e65100;
}

.status-badge {
  background: #fff5d6;
  color: #f57c00;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 0.75rem;
}

.teacher-message {
  background: #fffbf0;
  border-radius: 16px;
  padding: 1.5rem;
  border: 2px dashed #ffe066;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.teacher-icon {
  font-size: 1.3rem;
}

.message-title {
  font-weight: 700;
  color: #f57c00;
  font-size: 1rem;
}

.message-content {
  color: #8c6d32;
  line-height: 1.7;
  font-size: 0.95rem;
}

/* ✅ 추가: 모둠과제 안내 메시지 */
.group-notice {
  background: #f3e5f5;
  border: 2px solid #ce93d8;
  border-radius: 15px;
  padding: 1rem 1.5rem;
  font-size: 0.9rem;
  color: #7b1fa2;
  line-height: 1.5;
  margin-bottom: 1rem;
  font-weight: 600;
}

/* 개인정보 안내 */
.privacy-notice {
  background: #fff9e6;
  border-radius: 15px;
  padding: 1rem 1.5rem;
  font-size: 0.9rem;
  color: #f57c00;
  line-height: 1.5;
  border: 2px dashed #ffe066;
}

/* 폼 스타일 */
.form-group {
  margin-bottom: 2rem;
}

.form-label {
  display: block;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #ff9800;
  font-size: 1.1rem;
}

.submission-editor {
  width: 100%;
  border: 3px solid #fff5d6;
  border-radius: 15px;
  padding: 1rem 1.2rem;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  min-height: 150px;
  background: white;
  transition: all 0.3s ease;
}

.submission-editor:focus {
  outline: none;
  border-color: #ffdd29;
  box-shadow: 0 0 0 3px rgba(255, 221, 41, 0.1);
}

/* 파일 업로드 */
.file-drop-zone {
  border: 3px dashed #ffe066;
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fffbf0;
}

.file-drop-zone:hover {
  border-color: #ffdd29;
  background: white;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.1);
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  font-size: 2.5rem;
}

.upload-text {
  color: #8c6d32;
  font-size: 0.95rem;
  margin: 0;
}

.file-select-btn {
  background: linear-gradient(135deg, #ffdd29, #ffb74d);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 0.5rem;
}

.file-select-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(255, 221, 41, 0.3);
}

.file-list {
  display: flex;
  gap: 0.85rem;
  flex-wrap: wrap;
  margin-top: 0.3rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 15px;
  background: white;
  border: 2px solid #fff5d6;
  transition: all 0.3s ease;
}

.file-item:hover {
  border-color: #ffe066;
  box-shadow: 0 2px 8px rgba(255, 221, 41, 0.1);
}

.file-icon {
  font-size: 1.2rem;
}

.file-name {
  flex: 1;
  font-weight: 600;
  color: #8c6d32;
}

.file-size {
  color: #ffb74d;
  font-size: 0.9rem;
}

.file-remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.file-remove-btn:hover {
  background: #ffebee;
  transform: scale(1.1);
}

/* 제출 버튼 */
.submit-button-area {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid #fff5d6;
}

.submit-btn {
  background: linear-gradient(135deg, #ffdd29, #ffb74d);
  color: white;
  border: none;
  padding: 1.2rem 2.5rem;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
  margin: 0 0.5rem;
}

.submit-btn:hover:not(.disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.4);
}

.submit-btn.disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 제출된 과제 카드 */
.submitted-card {
  background: linear-gradient(135deg, #f0fff0, #e8f5e8);
  border-color: #c8e6c9;
}

.submitted-card .card-title {
  color: #2e7d32;
}

.submitted-content {
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  white-space: pre-wrap;
  line-height: 1.7;
  border: 2px solid #e8f5e9;
  color: #2e7d32;
}

.submitted-files {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.submitted-file {
  background: white;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid #e8f5e9;
  font-weight: 600;
  color: #2e7d32;
}

/* 평가 카드 */
.evaluation-card {
  background: linear-gradient(135deg, #fff8e1, #fff3e0);
  border-color: #ffcc80;
}

.evaluation-card .card-title {
  color: #e65100;
}

.teacher-feedback {
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  border: 2px solid #ffe0b2;
}

.feedback-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #fff3e0;
}

.teacher-avatar {
  font-size: 1.3rem;
}

.teacher-name {
  font-weight: 700;
  color: #e65100;
}

.feedback-date {
  color: #ff8f00;
  font-size: 0.9rem;
  margin-left: auto;
}

.feedback-message {
  color: #bf360c;
  line-height: 1.6;
  font-size: 0.95rem;
}

/* 로딩 상태 */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  border: 3px solid #fff5d6;
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.1);
}

.loading-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: spin 2s linear infinite;
}

.loading-text {
  color: #ff9800;
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .assignment-card,
  .submission-card,
  .submitted-card,
  .evaluation-card {
    padding: 1.5rem;
  }

  /* ✅ 추가: 모바일에서 헤더 상단 영역 세로 정렬 */
  .card-header-top {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .group-board-btn {
    align-self: flex-end;
  }

  .info-row {
    flex-direction: column;
    gap: 0.5rem;
  }

  .info-label {
    min-width: auto;
  }

  .assignment-title {
    font-size: 1.5rem;
  }

  .file-drop-zone {
    padding: 1.5rem;
  }

  .upload-icon {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .assignment-title {
    font-size: 1.3rem;
  }

  .card-title {
    font-size: 1.3rem;
  }

  .file-item {
    padding: 0.75rem;
  }

  .submit-btn {
    padding: 1rem 2rem;
    font-size: 1rem;
  }

  .back-to-list-btn {
    padding: 0.7rem 1.2rem;
    font-size: 0.85rem;
  }
}
</style>
