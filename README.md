# Study Log : 알고리즘 문제 풀이 관리 웹 앱

## 프로젝트 목적과 범위
 - 프로젝트 목적<br>
   본 프로젝트는~~<br>
 - 범위<br>
   범위~~!
 
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

## 실험
- [테스트 시나리오](docs/test_scenario.md "테스트시나리오")

## 결론
