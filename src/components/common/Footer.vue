<template>
  <footer class="footer-container">
    <div class="footer-inner">
      <div class="company-info">
        <div class="company-box">
          <img
            src="https://airoom.s3.ap-northeast-2.amazonaws.com/mainlogo.png"
            alt="아이룸"
            class="company-logo"
            width="200px"
            height="200px"
          />
          <div class="company-details">
            <p><strong>대표:</strong> 아이룸</p>
            <p><strong>주소:</strong> 서울시 금천구 아이룸길 54</p>
            <p><strong>사업자 등록번호:</strong> 111-22-48215</p>
          </div>
        </div>

        <div class="company-box">
          <div class="company-details">
            <div class="footer-links">
              <a href="https://www.chunjae.co.kr/" target="_blank">회사소개</a>
              <p>|</p>
              <a href="https://www.chunjae.co.kr/" target="_blank">이용약관</a>
              <p>|</p>
              <a href="https://www.chunjaetext.co.kr/" target="_blank"
                >개인정보처리방침</a
              >
              <p>|</p>
              <a href="https://www.genia.academy/" target="_blank">고객센터</a>
            </div>
            <div class="footer-links">
              <a href="https://www.chunjae.co.kr/" target="_blank">천재교육</a>
              <p>|</p>
              <a href="https://www.chunjaetext.co.kr/" target="_blank"
                >천재교과서</a
              >
              <p>|</p>
              <a href="https://www.genia.academy/" target="_blank"
                >천재IT교육센터</a
              >
            </div>
          </div>
        </div>
      </div>

      <p class="copyright">
        Copyright ©2024 By Chunjae Co.,Ltd. All Rights Reserved.
      </p>
    </div>
  </footer>
</template>

<script setup>
// Footer 컴포넌트는 별도의 로직이 필요하지 않으므로 빈 script setup
</script>

<style scoped>
/* Footer */
.footer-container {
  /* background: #f5f5f5; */
  border-top: 2px solid #e0e0e0;
  /* margin-top: 2rem; */
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.company-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.company-box {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.company-logo {
  width: 150px;
  height: 150px;
  flex-shrink: 0;
}

.company-details p {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.footer-links {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.footer-links p {
  color: #ff9800;
}

.footer-links a {
  color: #ff9800;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: #e65100;
}

.copyright {
  font-size: 0.85rem;
  color: #999;
  text-align: center;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .company-info {
    grid-template-columns: 1fr;
  }

  .footer-links {
    justify-content: center;
  }
}
</style>
