/**
 * 통계 API 유틸리티
 * - 학생/교사용 학습 통계 API 호출
 * - 요청 데이터 검증 및 변환
 * - 응답 데이터 후처리
 */

import apiClient from '@/utils/apiClient';

/**
 * 날짜 유효성 검사 및 포맷팅
 */
const validateAndFormatDates = (startDate, endDate, summaryType) => {
  let formattedStartDate = startDate;
  let formattedEndDate = endDate;

  if (!formattedEndDate) {
    formattedEndDate = formattedStartDate;
  }

  if (summaryType === 'MONTHLY' && formattedStartDate) {
    // 문자열 파싱으로 직접 처리 (Date 객체 사용 안함)
    const [year, month] = formattedStartDate.split('-');

    // 해당 월의 1일
    formattedStartDate = `${year}-${month.padStart(2, '0')}-01`;

    // 해당 월의 마지막 날 계산
    const nextMonth = parseInt(month) + 1;
    const nextYear = nextMonth > 12 ? parseInt(year) + 1 : parseInt(year);
    const actualNextMonth = nextMonth > 12 ? 1 : nextMonth;

    const lastDay = new Date(nextYear, actualNextMonth - 1, 0).getDate();
    formattedEndDate = `${year}-${month.padStart(2, '0')}-${lastDay
      .toString()
      .padStart(2, '0')}`;
  }

  return { formattedStartDate, formattedEndDate };
};

/**
 * 학생용 API 함수들
 */

// 학생 개인 학습 요약 조회
export const getStudentLearningSummary = async (params) => {
  try {
    const { classroomStudentNo, lsType, lsStartDate, lsEndDate } = params;

    if (!classroomStudentNo) {
      throw new Error('학생 정보가 필요합니다.');
    }

    const { formattedStartDate, formattedEndDate } = validateAndFormatDates(
      lsStartDate,
      lsEndDate,
      lsType
    );

    const request = {
      classroomStudentNo,
      lsType,
      lsStartDate: formattedStartDate,
      lsEndDate: formattedEndDate,
    };

    console.log('🔍 학생 학습 요약 요청:', request);
    const response = await apiClient.post(
      '/statistics/student/summary',
      request
    );
    console.log('✅ 학생 학습 요약 응답:', response);

    return response;
  } catch (error) {
    console.error('🚨 학생 학습 요약 조회 실패:', error);
    throw error;
  }
};

// 학생 단원별 성취 현황 조회
export const getStudentUnitSummary = async (params) => {
  try {
    const { classroomStudentNo, lsType, lsStartDate, lsEndDate } = params;

    if (!classroomStudentNo) {
      throw new Error('학생 정보가 필요합니다.');
    }

    const { formattedStartDate, formattedEndDate } = validateAndFormatDates(
      lsStartDate,
      lsEndDate,
      lsType
    );

    const request = {
      classroomStudentNo,
      lsType,
      lsStartDate: formattedStartDate,
      lsEndDate: formattedEndDate,
    };

    console.log('🔍 학생 단원별 요약 요청:', request);
    const response = await apiClient.post(
      '/statistics/student/unit-summary',
      request
    );
    console.log('✅ 학생 단원별 요약 응답:', response);

    return response || [];
  } catch (error) {
    console.error('🚨 학생 단원별 요약 조회 실패:', error);
    throw error;
  }
};

/**
 * 교사용 API 함수들
 */

// 클래스룸 학습 요약 조회
export const getClassroomLearningSummary = async (params) => {
  try {
    const { classroomNo, lsType, lsStartDate, lsEndDate } = params;

    if (!classroomNo) {
      throw new Error('클래스룸 정보가 필요합니다.');
    }

    const { formattedStartDate, formattedEndDate } = validateAndFormatDates(
      lsStartDate,
      lsEndDate,
      lsType
    );

    const request = {
      classroomNo,
      lsType,
      lsStartDate: formattedStartDate,
      lsEndDate: formattedEndDate,
    };

    console.log('🔍 클래스룸 학습 요약 요청:', request);
    const response = await apiClient.post(
      '/statistics/teacher/summary',
      request
    );
    console.log('✅ 클래스룸 학습 요약 응답:', response);

    return response;
  } catch (error) {
    console.error('🚨 클래스룸 학습 요약 조회 실패:', error);
    throw error;
  }
};

// 클래스룸 단원별 성취 현황 조회
export const getClassroomUnitSummary = async (params) => {
  try {
    const { classroomNo, lsType, lsStartDate, lsEndDate } = params;

    if (!classroomNo) {
      throw new Error('클래스룸 정보가 필요합니다.');
    }

    const { formattedStartDate, formattedEndDate } = validateAndFormatDates(
      lsStartDate,
      lsEndDate,
      lsType
    );

    const request = {
      classroomNo,
      lsType,
      lsStartDate: formattedStartDate,
      lsEndDate: formattedEndDate,
    };

    console.log('🔍 클래스룸 단원별 요약 요청:', request);
    const response = await apiClient.post(
      '/statistics/teacher/unit-summary',
      request
    );
    console.log('✅ 클래스룸 단원별 요약 응답:', response);

    return response || [];
  } catch (error) {
    console.error('🚨 클래스룸 단원별 요약 조회 실패:', error);
    throw error;
  }
};

// 클래스룸 단원별 상세 현황 조회 (학생별)
export const getClassroomUnitSummaryDetail = async (params) => {
  try {
    const { classroomNo, lsType, lsStartDate, lsEndDate } = params;

    if (!classroomNo) {
      throw new Error('클래스룸 정보가 필요합니다.');
    }

    const { formattedStartDate, formattedEndDate } = validateAndFormatDates(
      lsStartDate,
      lsEndDate,
      lsType
    );

    const request = {
      classroomNo,
      lsType,
      lsStartDate: formattedStartDate,
      lsEndDate: formattedEndDate,
    };

    console.log('🔍 클래스룸 단원별 상세 요약 요청:', request);
    const response = await apiClient.post(
      '/statistics/teacher/unit-summary/detail',
      request
    );
    console.log('✅ 클래스룸 단원별 상세 요약 응답:', response);

    return response || [];
  } catch (error) {
    console.error('🚨 클래스룸 단원별 상세 요약 조회 실패:', error);
    throw error;
  }
};

// 클래스룸 학습 현황 관리 (전체 학생)
export const getClassroomLearningSummaryAll = async (params) => {
  try {
    const { classroomNo, lsType, lsStartDate, lsEndDate } = params;

    if (!classroomNo) {
      throw new Error('클래스룸 정보가 필요합니다.');
    }

    const request = {
      classroomNo,
      lsType: lsType || 'MONTHLY',
      lsStartDate: lsStartDate || null,
      lsEndDate: lsEndDate || null,
    };

    console.log('🔍 클래스룸 전체 학생 현황 요청:', request);
    const response = await apiClient.post(
      '/statistics/teacher/summary/all',
      request
    );
    console.log('✅ 클래스룸 전체 학생 현황 응답:', response);

    return response || [];
  } catch (error) {
    console.error('🚨 클래스룸 전체 학생 현황 조회 실패:', error);
    throw error;
  }
};

/**
 * 공통 유틸리티 함수들
 */

// 밀리초를 시간 문자열로 변환
export const formatTime = (milliseconds) => {
  if (!milliseconds) return '0분';
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  }
  return `${minutes}분`;
};

// 점수에 따른 색상 반환
export const getScoreColor = (score) => {
  if (score >= 80) return '#4CAF50';
  if (score >= 60) return '#FF9800';
  if (score >= 40) return '#FFC107';
  return '#F44336';
};

// 점수에 따른 성능 등급 반환
export const getPerformanceGrade = (score) => {
  if (score >= 90) return { grade: 'A', text: '우수', class: 'excellent' };
  if (score >= 80) return { grade: 'B', text: '양호', class: 'good' };
  if (score >= 70) return { grade: 'C', text: '보통', class: 'fair' };
  if (score >= 60) return { grade: 'D', text: '미흡', class: 'poor' };
  return { grade: 'F', text: '개선필요', class: 'fail' };
};

// 학습 수준 분류
export const classifyLearningLevel = (avgScore, progressRate) => {
  const combinedScore = (avgScore + progressRate) / 2;

  if (combinedScore >= 75) {
    return { level: '빠른', icon: '⚡', class: 'fast' };
  } else if (combinedScore >= 50) {
    return { level: '보통', icon: '⏱️', class: 'normal' };
  } else {
    return { level: '느린', icon: '🐌', class: 'slow' };
  }
};

// 기본 날짜 범위 생성 (한 달)
export const getDefaultDateRange = () => {
  const today = new Date();
  const oneMonthAgo = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    today.getDate()
  );

  return {
    startDate: oneMonthAgo.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
  };
};

// 사용자 토큰 정보에서 필요한 값 추출
export const extractUserInfo = () => {
  try {
    const tokenInfo = localStorage.getItem('tokenInfo');
    if (!tokenInfo) {
      throw new Error('사용자 정보를 찾을 수 없습니다.');
    }

    const parsed = JSON.parse(tokenInfo);
    console.log(parsed);
    return {
      classroomStudentNo: parsed.classRoomStudentNo,
      classroomNo: parsed.classroomNo,
      userType: parsed.role || localStorage.getItem('userType'),
    };
  } catch (error) {
    console.error('사용자 정보 추출 실패:', error);
    throw new Error('로그인 정보를 확인할 수 없습니다. 다시 로그인해주세요.');
  }
};

// Chart.js 차트 기본 옵션 생성
export const getChartOptions = (type = 'bar') => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (value) {
            return Math.round(value) + '점';
          },
        },
      },
    },
  };

  if (type === 'bar') {
    baseOptions.scales.x = {
      ticks: {
        maxRotation: 45,
        minRotation: 45,
      },
    };
  }

  return baseOptions;
};
