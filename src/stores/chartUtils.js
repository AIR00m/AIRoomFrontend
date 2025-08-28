/**
 * Chart.js 유틸리티
 * - 차트 설정 및 옵션 생성
 * - 데이터 변환 및 포맷팅
 * - 반응형 차트 관리
 */

import { Chart, registerables } from "chart.js";
import { statisticsUtils } from "./statisticsService";

// Chart.js 플러그인 등록
Chart.register(...registerables);

/**
 * 기본 차트 색상 팔레트
 */
export const chartColors = {
  primary: "#FF9800",
  secondary: "#FFC107",
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
  info: "#2196F3",
  light: "#FFF5D6",
  dark: "#333333",

  // 성과별 색상
  excellent: "#4CAF50",
  good: "#8BC34A",
  fair: "#FFC107",
  poor: "#FF9800",
  critical: "#F44336",

  // 그라데이션 색상
  gradients: {
    orange: ["#FF9800", "#FFC107"],
    green: ["#4CAF50", "#8BC34A"],
    blue: ["#2196F3", "#03A9F4"],
    red: ["#F44336", "#FF5722"],
  },
};

/**
 * 기본 차트 옵션 생성
 */
export const createBaseOptions = (type = "bar", customOptions = {}) => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: "600",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: chartColors.primary,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 12,
        },
        padding: 12,
      },
    },
    scales: {},
    interaction: {
      intersect: false,
      mode: "index",
    },
    animation: {
      duration: 800,
      easing: "easeInOutQuart",
    },
  };

  // 차트 타입별 기본 스케일 설정
  if (["bar", "line", "area"].includes(type)) {
    baseOptions.scales = {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          font: {
            size: 11,
          },
          color: "#666",
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: "#666",
          callback: function (value) {
            return value + "%";
          },
        },
        max: 100,
      },
    };
  }

  // 커스텀 옵션 병합
  return mergeDeep(baseOptions, customOptions);
};

/**
 * 성취도 차트 옵션 생성
 */
export const createAchievementChartOptions = (customOptions = {}) => {
  return createBaseOptions("bar", {
    plugins: {
      tooltip: {
        callbacks: {
          title: function (context) {
            return context[0].label;
          },
          label: function (context) {
            const dataIndex = context.dataIndex;
            const dataset = context.dataset;
            const value = dataset.data[dataIndex];

            return [
              `정답률: ${value}%`,
              `총 문제: ${dataset.totalProblems?.[dataIndex] || 0}개`,
              `정답: ${dataset.correctProblems?.[dataIndex] || 0}개`,
            ];
          },
        },
      },
    },
    ...customOptions,
  });
};

/**
 * 시간 추이 차트 옵션 생성
 */
export const createTimeSeriesChartOptions = (customOptions = {}) => {
  return createBaseOptions("line", {
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
          displayFormats: {
            day: "MM/DD",
          },
        },
        title: {
          display: true,
          text: "날짜",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "점수 (%)",
        },
      },
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
      },
      line: {
        tension: 0.3,
        borderWidth: 3,
      },
    },
    ...customOptions,
  });
};

/**
 * 도넛 차트 옵션 생성
 */
export const createDoughnutChartOptions = (customOptions = {}) => {
  return createBaseOptions("doughnut", {
    cutout: "60%",
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value}명 (${percentage}%)`;
          },
        },
      },
    },
    ...customOptions,
  });
};

/**
 * 데이터셋 생성 함수들
 */
export const createDataset = {
  /**
   * 막대 차트 데이터셋
   */
  bar: (data, options = {}) => ({
    type: "bar",
    data: data,
    backgroundColor: options.backgroundColor || chartColors.primary,
    borderColor: options.borderColor || chartColors.primary,
    borderWidth: options.borderWidth || 2,
    borderRadius: options.borderRadius || 4,
    borderSkipped: false,
    ...options,
  }),

  /**
   * 선 차트 데이터셋
   */
  line: (data, options = {}) => ({
    type: "line",
    data: data,
    borderColor: options.borderColor || chartColors.primary,
    backgroundColor: options.backgroundColor || `${chartColors.primary}20`,
    borderWidth: options.borderWidth || 3,
    tension: options.tension || 0.3,
    fill: options.fill || false,
    pointBackgroundColor: options.pointColor || chartColors.primary,
    pointBorderColor: "#fff",
    pointBorderWidth: 2,
    pointRadius: 4,
    pointHoverRadius: 6,
    ...options,
  }),

  /**
   * 영역 차트 데이터셋
   */
  area: (data, options = {}) => ({
    ...createDataset.line(data, { fill: true, ...options }),
    backgroundColor: options.backgroundColor || `${chartColors.primary}30`,
  }),
};

/**
 * 단원별 성취도 차트 생성
 */
export const createUnitAchievementChart = (canvasRef, unitData) => {
  if (!canvasRef || !unitData.length) return null;

  const ctx = canvasRef.getContext("2d");

  // 기존 차트 제거
  Chart.getChart(ctx)?.destroy();

  const data = {
    labels: unitData.map((unit) => `${unit.unitNum}. ${unit.unitTitle}`),
    datasets: [
      {
        ...createDataset.bar(
          unitData.map((unit) => unit.lsAvgAccuracyRate || 0),
          {
            backgroundColor: unitData.map((unit) => {
              const score = unit.lsAvgAccuracyRate || 0;
              return statisticsUtils.getScoreColor(score);
            }),
            borderColor: unitData.map((unit) => {
              const score = unit.lsAvgAccuracyRate || 0;
              return statisticsUtils.getScoreColor(score);
            }),
            totalProblems: unitData.map(
              (unit) => unit.lsTotalProblemsSolved || 0
            ),
            correctProblems: unitData.map(
              (unit) => unit.lsTotalCorrectProblems || 0
            ),
          }
        ),
      },
    ],
  };

  return new Chart(ctx, {
    type: "bar",
    data,
    options: createAchievementChartOptions(),
  });
};

/**
 * 학생별 성과 차트 생성
 */
export const createStudentPerformanceChart = (canvasRef, studentData) => {
  if (!canvasRef || !studentData.length) return null;

  const ctx = canvasRef.getContext("2d");

  // 기존 차트 제거
  Chart.getChart(ctx)?.destroy();

  const data = {
    labels: studentData.map(
      (student) => student.usClassroomStudentName || student.studentName
    ),
    datasets: [
      {
        ...createDataset.bar(
          studentData.map(
            (student) =>
              student.usAvgAccuracyRate || student.studentAvgExamScore || 0
          ),
          {
            backgroundColor: studentData.map((student) => {
              const score =
                student.usAvgAccuracyRate || student.studentAvgExamScore || 0;
              return statisticsUtils.getScoreColor(score);
            }),
          }
        ),
      },
    ],
  };

  return new Chart(ctx, {
    type: "bar",
    data,
    options: createAchievementChartOptions({
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const student = studentData[context.dataIndex];
              return [
                `정답률: ${context.parsed.y}%`,
                `총 문제: ${
                  student.usTotalProblemsSolved ||
                  student.studentTotalProblemSolved ||
                  0
                }개`,
                `정답: ${
                  student.usTotalCorrectProblems ||
                  student.studentTotalCorrectProblems ||
                  0
                }개`,
              ];
            },
          },
        },
      },
    }),
  });
};

/**
 * 시간별 학습 추이 차트 생성
 */
export const createLearningTrendChart = (canvasRef, timeData) => {
  if (!canvasRef || !timeData.length) return null;

  const ctx = canvasRef.getContext("2d");

  // 기존 차트 제거
  Chart.getChart(ctx)?.destroy();

  const data = {
    labels: timeData.map((item) => item.date),
    datasets: [
      {
        label: "정답률",
        ...createDataset.line(
          timeData.map((item) => item.accuracyRate),
          {
            borderColor: chartColors.primary,
            backgroundColor: `${chartColors.primary}20`,
          }
        ),
      },
      {
        label: "학습시간 (분)",
        ...createDataset.line(
          timeData.map((item) => item.learningTime / 60000),
          {
            borderColor: chartColors.secondary,
            backgroundColor: `${chartColors.secondary}20`,
            yAxisID: "y1",
          }
        ),
      },
    ],
  };

  return new Chart(ctx, {
    type: "line",
    data,
    options: createTimeSeriesChartOptions({
      scales: {
        y: {
          type: "linear",
          display: true,
          position: "left",
          title: {
            display: true,
            text: "정답률 (%)",
          },
        },
        y1: {
          type: "linear",
          display: true,
          position: "right",
          title: {
            display: true,
            text: "학습시간 (분)",
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    }),
  });
};

/**
 * 수준별 학생 분포 차트 생성
 */
export const createLevelDistributionChart = (canvasRef, levelData) => {
  if (!canvasRef || !levelData) return null;

  const ctx = canvasRef.getContext("2d");

  // 기존 차트 제거
  Chart.getChart(ctx)?.destroy();

  const data = {
    labels: ["빠른 수준", "보통 수준", "느린 수준"],
    datasets: [
      {
        data: [levelData.fast || 0, levelData.normal || 0, levelData.slow || 0],
        backgroundColor: [
          chartColors.excellent,
          chartColors.fair,
          chartColors.poor,
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  return new Chart(ctx, {
    type: "doughnut",
    data,
    options: createDoughnutChartOptions(),
  });
};

/**
 * 차트 반응형 관리
 */
export const createResponsiveChart = (canvasRef, config, options = {}) => {
  if (!canvasRef) return null;

  const ctx = canvasRef.getContext("2d");

  // 기존 차트 제거
  Chart.getChart(ctx)?.destroy();

  // 반응형 옵션 추가
  const responsiveConfig = {
    ...config,
    options: {
      ...config.options,
      responsive: true,
      maintainAspectRatio: false,
      onResize: options.onResize || (() => {}),
      ...config.options,
    },
  };

  const chart = new Chart(ctx, responsiveConfig);

  // 윈도우 리사이즈 시 차트 업데이트
  const handleResize = () => {
    if (chart && !chart.destroyed) {
      chart.resize();
    }
  };

  window.addEventListener("resize", handleResize);

  // 클린업 함수 반환
  chart.cleanup = () => {
    window.removeEventListener("resize", handleResize);
    chart.destroy();
  };

  return chart;
};

/**
 * 차트 애니메이션 제어
 */
export const animateChart = {
  /**
   * 차트 데이터 업데이트 (애니메이션 포함)
   */
  updateData: (chart, newData, animationDuration = 800) => {
    if (!chart || chart.destroyed) return;

    chart.data = newData;
    chart.update({
      duration: animationDuration,
      easing: "easeInOutQuart",
    });
  },

  /**
   * 차트 숨기기/보이기
   */
  toggleVisibility: (chart, datasetIndex, visible) => {
    if (!chart || chart.destroyed) return;

    chart.setDatasetVisibility(datasetIndex, visible);
    chart.update();
  },

  /**
   * 차트 하이라이트
   */
  highlightData: (chart, elementIndex, datasetIndex = 0) => {
    if (!chart || chart.destroyed) return;

    const meta = chart.getDatasetMeta(datasetIndex);
    const element = meta.data[elementIndex];

    if (element) {
      element.options.backgroundColor = chartColors.secondary;
      chart.update();
    }
  },
};

/**
 * 유틸리티 함수들
 */

/**
 * 깊은 병합 (Deep Merge)
 */
function mergeDeep(target, source) {
  const result = { ...target };

  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      result[key] = mergeDeep(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

/**
 * 색상 유틸리티
 */
export const colorUtils = {
  /**
   * 색상을 투명도와 함께 반환
   */
  withOpacity: (color, opacity) => {
    if (color.startsWith("#")) {
      const hex = color.slice(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  },

  /**
   * 그라데이션 생성
   */
  createGradient: (ctx, colors, direction = "vertical") => {
    const gradient =
      direction === "vertical"
        ? ctx.createLinearGradient(0, 0, 0, 400)
        : ctx.createLinearGradient(0, 0, 400, 0);

    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });

    return gradient;
  },

  /**
   * 점수 기반 색상 배열 생성
   */
  getScoreColors: (scores) => {
    return scores.map((score) => statisticsUtils.getScoreColor(score));
  },
};

/**
 * 차트 내보내기
 */
export const exportChart = {
  /**
   * 이미지로 내보내기
   */
  toImage: (chart, format = "png") => {
    if (!chart || chart.destroyed) return null;
    return chart.toBase64Image(`image/${format}`);
  },

  /**
   * PDF로 내보내기 (jsPDF 필요)
   */
  toPDF: async (chart, filename = "chart.pdf") => {
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF();
      const imgData = exportChart.toImage(chart);

      if (imgData) {
        pdf.addImage(imgData, "PNG", 10, 10, 190, 100);
        pdf.save(filename);
      }
    } catch (error) {
      console.error("PDF 내보내기 실패:", error);
    }
  },
};

/**
 * 기본 내보내기
 */
export default {
  chartColors,
  createBaseOptions,
  createAchievementChartOptions,
  createTimeSeriesChartOptions,
  createDoughnutChartOptions,
  createDataset,
  createUnitAchievementChart,
  createStudentPerformanceChart,
  createLearningTrendChart,
  createLevelDistributionChart,
  createResponsiveChart,
  animateChart,
  colorUtils,
  exportChart,
};
