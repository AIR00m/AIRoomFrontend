// @/api/api.js
const API_BASE_URL = "http://localhost:8080";
let jwtToken = null;

/**
 * 토큰 발급 후 저장
 */
export async function issueToken(memberId, textbookNo) {
  const res = await fetch(`${API_BASE_URL}/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ memberId, textbookNo }),
  });

  if (!res.ok) {
    throw new Error(`토큰 발급 실패: HTTP ${res.status}`);
  }

  const data = await res.json();
  jwtToken = data.Access_Token;
  localStorage.setItem("jwtToken", jwtToken);

  return jwtToken;
}

/**
 * 게시글 목록 조회
 */
export async function fetchSubjectBoardList(classroomNo) {
  const token = jwtToken || localStorage.getItem("jwtToken");

  const res = await fetch(`${API_BASE_URL}/subject-board/list/${classroomNo}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`게시글 조회 실패: HTTP ${res.status}`);
  }

  return res.json();
}
