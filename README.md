# Study Log : 알고리즘 문제 풀이 관리 웹 앱

## 프로젝트 목적과 범위
 - 프로젝트 목적<br>
   본 프로젝트는 사용자가 오답의 원인을 직접 기록하고, 'FAIL' 상태에서 'RETRY_SUCCESS' 상태로 전이되는 과정을 시각화함으로써 메타인지 기반의 자기주도적 학습을 지원하는 관리 시스템의 구축을 목표로 삼고있음.<br>
   
 - 포함 내용 <br>
   1. 인증 및 보안: JWT 기반의 회원 인증 및 Bcrypt 암호화를 통한 사용자 데이터 보호.

   2. 데이터 연동 및 최적화: Solved.ac API를 통한 문제 정보(제목, 티어) 자동 수집 및 캐싱 테이블을 활용한 서버 부하 최소화.

   3. 학습 상태 관리: SUCCESS, FAIL, RETRY_SUCCESS 3단계 상태 전이 로직 구현.

   4. UX 특화 기능: 가독성을 고려한 8개 단위의 데이터 페이징, 오답 복기 시 이전 기록 참조 UI, 중복 등록 원천 차단 로직.

   5. 통계 대시보드: 전체 풀이 현황 및 난이도별 분포 시각화.

 - 불포함 내용 <br>
   1. 백준 등의 플렛폼 내에서 문제 풀이 후 결과 제출 시 자동으로 결과를 자동적으로 가져오는 것이 아닌, 사용자가 결과를 직접 입력하도록 제한함.

   2. 모바일 앱 개발은 제외하며, PC 환경에 최적화된 웹 서비스로 구현함.
      
## 분석
 - [유스케이스와 유스케이스 명세서](docs/usecase.md "유스케이스")
 - [요구분석명세서](docs/srs.md "요구분석명세서")

## 설계

### 시퀀스 다이어그램
```mermaid ...
sequenceDiagram
    autonumber
    participant U as 사용자 (User)
    participant F as 프론트엔드 (React)
    participant B as 백엔드 (Node.js)
    participant DB as 데이터베이스 (MariaDB)
    participant API as Solved.ac API

    Note over U, DB: [1. 사용자 인증 단계]
    U->>F: 로그인 정보 입력
    F->>B: POST /auth/login
    B->>DB: 사용자 정보 및 비번 확인
    DB-->>B: 유효한 유저 데이터
    B-->>F: JWT 토큰 발급
    F->>F: localStorage에 토큰 저장

    Note over U, DB: [2. 대시보드 및 리스트 조회]
    F->>B: GET /main/stats (인증 토큰 포함)
    B->>DB: 상태별(SUCCESS/FAIL 등) 개수 집계
    DB-->>B: 통계 데이터 반환
    B-->>F: 200 OK (차트 데이터)
    F->>B: GET /problem/list?page=1 (8개 단위)
    B->>DB: LIMIT 8 OFFSET 0 쿼리 실행
    DB-->>B: 문제 목록 데이터
    B-->>F: 200 OK (8개 데이터 전송)

    Note over U, DB: [3. 신규 문제 등록 프로세스]
    U->>F: 문제 번호 입력 및 조회
    F->>B: GET /problem/check/:id
    B->>DB: 캐시 테이블(problem_cachetbl) 확인
    alt 캐시 데이터 없음
        B->>API: 문제 상세 정보 요청
        API-->>B: 제목 및 티어 데이터 반환
        B->>DB: INSERT INTO problem_cachetbl
    end
    B->>DB: 해당 사용자의 중복 등록 여부 확인
    DB-->>B: 중복 여부(isAlreadyAdded) 반환
    B-->>F: 문제 정보 및 중복 상태 응답
    
    alt 중복이 아닐 경우 (New)
        U->>F: 언어/메모 입력 및 등록 클릭
        F->>B: POST /problem/upload
        B->>DB: INSERT INTO problemtbl (Status: FAIL/SUCCESS)
        DB-->>B: 성공
        B-->>F: 201 Created
    end

    Note over U, DB: [4. 오답 복습 및 상태 전이]
    U->>F: 오답 노트 진입 (FAIL 필터링)
    F->>B: GET /incorrect/list
    B->>DB: SELECT * WHERE status='FAIL'
    DB-->>B: 오답 목록 반환
    U->>F: 복습 모달 열기 (기존 메모 참조)
    U->>F: 새로운 풀이 작성 및 완료 클릭
    F->>B: PUT /incorrect/update/:id
    Note over B, DB: 기존 오답 메모를 새 풀이로 교체
    B->>DB: UPDATE status='RETRY_SUCCESS' & memo=new
    DB-->>B: 수정 성공
    B-->>F: 200 OK
    F->>F: UI 리스트에서 해당 카드 제거
```
### 순서도
``` mermaid
flowchart TD
    %% 시작 및 인증
    Start([시작]) --> Login{로그인 여부}
    Login -- No --> SignIn[사용자 인증: JWT 발급]
    Login -- Yes --> Dash[메인 대시보드 진입]
    SignIn --> Dash

    %% 메인 메뉴 분기
    Dash --> Menu{기능 선택}

    %% 1. 문제 등록 프로세스
    Menu -->|등록| RegID[문제 번호 입력]
    RegID --> Cache{캐시/API 확인}
    Cache -- 신규 --> Solved[Solved.ac API 호출 및 캐싱]
    Cache -- 기존 --> Load[캐시 데이터 로드]
    Solved --> Dup{중복 등록 여부}
    Load --> Dup
    
    Dup -- 중복됨 --> Alert[경고 메시지 및 등록 차단]
    Dup -- 미등록 --> Input[언어/상태/메모 입력]
    Alert --> Dash
    Input --> Save[(DB: problemtbl 저장)]
    Save --> Dash

    %% 2. 문제 목록 조회 프로세스
    Menu -->|조회| List[전체 목록 요청]
    List --> Paging[페이지당 8개 단위 페이징 처리]
    Paging --> Search{검색/필터링}
    Search --> View[문제 리스트 출력]
    View --> Action{액션 선택}
    Action --> Detail[상세 정보 조회 모달]
    Action --> Del[데이터 삭제]
    Detail --> Dash
    Del --> Dash

    %% 3. 오답 노트 복습 프로세스
    Menu -->|오답| Note[FAIL 상태 문제 필터링]
    Note --> Select[복습할 문제 선택]
    Select --> Modal[복습 모달 팝업]
    Modal --> ShowOld[이전 오답 이유 노출: Read Only]
    ShowOld --> WriteNew[새로운 해결 방법 입력]
    WriteNew --> Finish{저장 클릭}
    
    Finish --> UpdateStatus[상태: RETRY_SUCCESS 변경]
    UpdateStatus --> UpdateMemo[메모: 신규 풀이로 갱신]
    UpdateMemo --> DBUpdate[(DB Update 실행)]
    DBUpdate --> RemoveCard[오답 리스트에서 제거]
    RemoveCard --> Dash

    %% 종료
    Dash --> Logout[로그아웃]
    Logout --> End([종료])

    %% 스타일 정의
    style Save fill:#f9f,stroke:#333,stroke-width:2px
    style DBUpdate fill:#f9f,stroke:#333,stroke-width:2px
    style Alert fill:#ff9999,stroke:#333,stroke-width:2px
    style Dash fill:#d4f1f9,stroke:#333,stroke-width:4px
    style Finish fill:#d5e8d4,stroke:#82b366,stroke-width:2px
```

## 구현
### 구현 환경
- 프론트앤드 : `react`
- 백앤드 : `node.js`
- 데이터 베이스 : `Mariadb`

### 사용 라이브러리
#### 1.Backend
- `express` : 웹 서버 프레임 워크
- `bcrypt` : 사용자 비밀번호 암호화
- `jsonwebtoken (JWT)` : 토큰 기반 사용자 인증 구현 
- `mariadb` : MariaDB 연결 및 쿼리 실행
- `dotenv` : 환경 변수 관리
- `cors` : 리소스 공유 설정

#### 2.Frontend
- `axios` : 백엔드와 API 비동기 통신
- `react-router-dom` : 라우팅 및 페이지 관리
- `recharts` : 데이터 시각화

### 데이터 베이스 erd
``` mermaid
erDiagram
    usertbl ||--o{ problemtbl : "records"
    problem_cachetbl ||--o{ problemtbl : "is referenced by"

    usertbl {
        int id PK "AUTO_INCREMENT"
        string email UK "NOT NULL"
        string password_hash "NOT NULL"
        string nickname "NOT NULL (15자)"
        boolean is_varifide "DEFAULT FALSE"
        timestamp created_at
    }

    problem_cachetbl {
        int problem_id PK "백준 문제 번호"
        string title "NOT NULL"
        int tier "NOT NULL"
        string tags "NULL"
    }

    problemtbl {
        int id PK "AUTO_INCREMENT"
        int user_id FK "REFERENCES usertbl(id)"
        int problem_id FK "REFERENCES problem_cachetbl(problem_id)"
        string use_language "NULL"
        enum status "'SUCCESS', 'FAIL', 'RETRY_SUCCESS'"
        text memo "최종 풀이 및 오답 내용 (이전 first_memo)"
        timestamp created_at
        timestamp updated_at
    }
```

### api 명세서
- **인증 방식**: JWT (JSON Web Token)
- **인증 헤더**: 모든 인가(Authenticated) 요청은 헤더에 `Authorization: Bearer {TOKEN}`을 포함해야 함.
- **응답 형식**: JSON

#### 1. 사용자 인증 (Authentication)

| 기능 | Method | URL | 인증 | 설명 |
| :--- | :---: | :--- | :---: | :--- |
| **로그인** | `POST` | `/login` | N | 이메일/비밀번호 검증 및 토큰 발급 (14일 유지) |
| **로그아웃** | `GET` | `/logout` | N | 로그아웃 성공 메시지 반환 |
| **회원가입** | `POST` | `/register` | N | 신규 사용자 등록 (비밀번호 정책 및 닉네임 15자 제한) |
| **이메일 중복 확인** | `POST` | `/register/emailCheck` | N | 가입 전 이메일 중복 여부 확인 |

### [POST] /register (Password Policy)
- **조건**: 8자 이상, 대/소문자, 숫자, 특수문자 각 1자 이상 포함 필수.

---

#### 2. 메인 대시보드 (Main Dashboard)

| 기능 | Method | URL | 인증 | 설명 |
| :--- | :---: | :--- | :---: | :--- |
| **통계 데이터 조회** | `GET` | `/main` | Y | 4단 위젯 통계, 난이도 분포, 언어 통계, 최근 복습 목록 조회 |

- **주요 응답 데이터**:
    - `summary`: 전체, 성공, 실패, 복습완료(RETRY_SUCCESS) 개수.
    - `difficultyData`: 상(Tier 11+), 중(Tier 6-10), 하(Tier 1-5) 분포.
    - `languageData`: 사용 언어별 문제 풀이 수.
    - `reviewList`: 최근 실패(FAIL)한 문제 중 가장 최근 3건.

---

#### 3. 문제 관리 (Problem CRUD)

| 기능 | Method | URL | 인증 | 설명 |
| :--- | :---: | :--- | :---: | :--- |
| **전체 목록 조회** | `GET` | `/problem` | Y | 본인 등록 전체 데이터 (페이지당 8개 페이징 처리) |
| **문제 정보 확인** | `GET` | `/problem/check/:problemId` | Y | 캐시 확인 혹은 Solved.ac API 기반 문제 정보 조회 |
| **신규 문제 등록** | `POST` | `/problem/upload` | Y | 문제 번호, 상태, 언어, 메모 내용 저장 |
| **문제 정보 수정** | `PUT` | `/problem/update/:id` | Y | 기존 기록의 상태, 언어, 메모 업데이트 |
| **문제 데이터 삭제** | `DELETE` | `/problem/delete/:id` | Y | 특정 풀이 데이터 삭제 |

---

#### 4. 오답 노트 관리 (Incorrect Note)

| 기능 | Method | URL | 인증 | 설명 |
| :--- | :---: | :--- | :---: | :--- |
| **오답 목록 조회** | `GET` | `/incorrect` | Y | 상태가 `FAIL`인 데이터만 필터링 조회 (8개 단위) |
| **복습 완료 업데이트** | `PUT` | `/incorrect/update/:id` | Y | 풀이 기록 갱신 및 상태 `RETRY_SUCCESS`로 변경 |
| **오답 기록 삭제** | `DELETE` | `/incorrect/delete/:id` | Y | 오답 리스트 내 특정 데이터 삭제 |

- **복습 완료 로직**: 오답 노트 저장 시 상태값이 `RETRY_SUCCESS`로 강제 교정되어 데이터 무결성을 유지함.

---

#### 5. 에러 코드 및 상태 (HTTP Status Codes)

| 코드 | 의미 | 설명 |
| :--- | :--- | :--- |
| **200** | OK | 요청 성공 |
| **201** | Created | 리소스 생성 성공 (회원가입, 문제 등록 등) |
| **400** | Bad Request | 필수 값 누락 혹은 유효성 검사 실패 |
| **401** | Unauthorized | 토큰 미포함, 만료 혹은 잘못된 비밀번호 |
| **404** | Not Found | 수정/삭제 대상을 찾을 수 없음 |
| **409** | Conflict | 이미 사용 중인 이메일 주소 |
| **500** | Internal Error | 서버 내부 로직 오류 |

## 실험
- [테스트 시나리오](docs/test_scenario.md "테스트시나리오")

## 결론

## UI 구현 
### 1. 로그인 페이지
 <img width="1919" height="1031" alt="image" src="https://github.com/user-attachments/assets/a161db8c-cc1e-404e-bdaa-63d3cf454497" />

### 2. 회원가입 페이지

<img width="1918" height="1020" alt="image" src="https://github.com/user-attachments/assets/5832768d-1c04-44ed-966a-9dae23d56877" />

### 3. 메인 대시보드

<img width="1917" height="1007" alt="image" src="https://github.com/user-attachments/assets/5b27b798-71d7-4812-86e3-0c2d4bae9a1d" />


### 4. 문제 게시판

<img width="1917" height="1027" alt="image" src="https://github.com/user-attachments/assets/bf0eaff5-dde0-4716-b2d4-c8858bb4b3aa" />


### 5. 문제 등록 모달

<img width="621" height="892" alt="image" src="https://github.com/user-attachments/assets/3d6425c5-fa19-4653-9f5c-b3bbaa607ca9" />


### 6. 오답노트

<img width="1919" height="831" alt="image" src="https://github.com/user-attachments/assets/c88e9052-6ae7-4acb-8819-78d0bc60b216" />


### 7. 오답노트 등록 모달

<img width="623" height="943" alt="image" src="https://github.com/user-attachments/assets/b7d14976-354e-4ac2-aa2c-cb8e2f94a3a5" />

### - 프로젝트 요약 및 성과
- 목표 달성: 백준의 Solved.ac API를 연동한 메타인지 학습 보조 도구 'Study Log'를 성공적으로 구축함.

- 핵심 기능 구현: JWT 기반의 보안 인증, 페이징을 통한 UX 최적화, FAIL 상태에서 RETRY_SUCCESS로 이어지는 상태 전이 모델을 실제 웹 환경에서 구현함.
  
### - 추후 개선 사항
#### 1. 이메일 인증 과정 추가 <br> 
- 현재 이메일 유효성 검증 로직을 구현하지 않아, 존재하지 않는 이메일이더라고 가입이 가능. 회원 가입 시 이메일 유효성 검증 추가 필요함.
#### 2. 페이징 개선<br>
- 한 페이지의 8개의 게시글을 보여주도록 구현하려고 했지만 6게 혹은 7개의 게시물이 등록되었을때 새로운 페이지가 생성됨. 수정 필요함.
#### 3. 게이미피케이션 추가 <br> 
- 문제를 등록할때마다 문제 난이도에 따른 경험치를 부과하며, 사용자에게 본 서비스를 이용할 동기부여가 목적임. 
