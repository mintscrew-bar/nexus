# NEXUS - 리그 오브 레전드 내전 플랫폼

React + TypeScript + Vite로 구축된 리그 오브 레전드 내전 플랫폼입니다.

## 🚀 주요 기능

- **내전 참가/모집**: 리그 오브 레전드 내전을 쉽게 참가하고 모집할 수 있습니다
- **유저 DB**: 플레이어 정보를 관리하고 조회할 수 있습니다
- **랭킹 시스템**: 내전 성적에 따른 랭킹을 제공합니다
- **커뮤니티**: 자유게시판을 통해 소통할 수 있습니다
- **이메일 인증**: Gmail을 통한 안전한 이메일 인증 시스템

## 🛠️ 기술 스택

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: CSS3, CSS Variables
- **Icons**: React Icons
- **Routing**: React Router DOM
- **Email**: Nodemailer, Gmail SMTP

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. Gmail 이메일 인증 설정

#### Gmail 앱 비밀번호 생성

1. [Google 계정 설정](https://myaccount.google.com/)에 접속
2. **보안** → **2단계 인증** 활성화
3. **앱 비밀번호** 생성:
   - 앱 선택: **메일**
   - 기기 선택: **기타 (맞춤 이름)**
   - 이름 입력: **NEXUS**
4. 생성된 16자리 비밀번호를 복사

#### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 입력:

```env
# Gmail 설정
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-digit-app-password

# 서버 포트 (선택사항)
PORT=4000
```

### 3. 개발 서버 실행

#### 프론트엔드 (React)

```bash
npm run dev
```

#### 백엔드 (이메일 서버)

```bash
node mail-server.js
```

## 📁 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── common/         # 공통 컴포넌트
│   ├── Header/         # 헤더 관련 컴포넌트
│   ├── Footer/         # 푸터 관련 컴포넌트
│   └── layouts/        # 레이아웃 컴포넌트
├── contexts/           # React Context
├── hooks/              # 커스텀 훅
├── pages/              # 페이지 컴포넌트
├── services/           # API 서비스
├── styles/             # CSS 스타일
├── utils/              # 유틸리티 함수
└── tests/              # 테스트 파일
```

## 🎨 디자인 시스템

- **폰트**: Noto Sans
- **색상**: CSS Variables를 통한 테마 시스템
- **반응형**: 모바일, 태블릿, 데스크톱 지원
- **다크모드**: 라이트/다크 테마 전환 지원

## 🔧 개발 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 코드 린팅
npm run lint

# 빌드 미리보기
npm run preview
```

## 📧 이메일 인증 API

### 인증번호 발송

```http
POST /api/send-email-code
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

### 서버 상태 확인

```http
GET /api/health
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.
