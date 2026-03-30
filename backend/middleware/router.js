require('dotenv').config(); 

const express = require("express");

const axios = require('axios'); //axios로 sloved.ac 모듈 호출

const router = express.Router(); //router 객체 생성
const pool = require("../maria"); //db 연결 풀

const bcrypt = require("bcrypt"); //암호화 모듈
const jwt = require("jsonwebtoken"); //토큰 관련 모듈

const authmiddleware = require("./auth"); //인증 미들웨어 

//test
router.get("/", (req, res) => {
    res.send("서버 열렸음 ㅇㅇ");
    res.status(200);
});

//로그인, 로그아웃
router.
post("/login", async (req, res) => { //로그인
    let conn;

    try {
        const { email, password } = req.body;

        if (!email || !password) { //이메일 혹은 비밀번호 입력하지 않았을 시
            return res.status(400).json({ message: "이메일 혹은 비밀번호를 입력해주세요." });
        }

        conn = await pool.getConnection(); //db 연결

        const users = await conn.query("SELECT * FROM usertbl WHERE email = ?", [email]); //user 검색

        if (users.length === 0) {
            return res.status(401).json({ message: "가입되지 않은 이메일이거나 이메일 혹은 비밀번호가 올바르지 않습니다." });
        }

        const user = users[0]; // 첫 번째 유저 정보 꺼내기

        const isPasswordValid = await bcrypt.compare(password, user.password_hash); //비밀번호 유효성 검사
        if (!isPasswordValid) {
            return res.status(401).json({ message: "가입되지 않은 이메일이거나 이메일 혹은 비밀번호가 올바르지 않습니다." });
        }

        // Access Token 발급 (14일 유지)
        const token = jwt.sign(
            { id: user.id, email: user.email, nickname: user.nickname }, 
            process.env.JWT_SECRET, 
            { expiresIn: "14d" } 
        );

        res.status(200).json({
            success: true,
            message: `${user.nickname}님 환영합니다!`,
            token: token,
            user: {
                id: user.id,
                nickname: user.nickname
            }
        });

    } catch (err) {

        console.error(`로그인에 실패하였습니다 : ${err}`);

        res.status(500).json({ message: "서버 오류가 발생했습니다." });

    } finally {

        if (conn) {
            conn.release();
        } //db 연결 해제
    }
})
.get("/logout", async(req, res) => {
    res.status(200).json({
        message : `로그아웃에 성공했습니다.`
    });
});

//회원가입, 중복확인, 회원탈퇴

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; //정규 표현식을 이용한 비밀번호 보안성 확인(8자 이상, 대문자, 소문자 1자 이상 포함, 특수문자 포함)

router
.post("/register", async(req, res) => { //회원가입
    let conn; //db 연결 변수

    try{
        const {email, password, confirmpassword, name} = req.body; //입력 받을 값 이메일, 비밀번호, 비밀번호 확인, 이름

        if(!email || !password || !confirmpassword || !name) { //필수 값 입력 하나라도 안된 경우
            return res.status(400).json({
                message : `필수 값을 모두 입력해주세요.`
             });
        }

        if (!PASSWORD_REGEX.test(password)) {
         return res.status(400).json({ 
            success: false, 
            message: "비밀번호가 보안 정책에 맞지 않습니다. (8자 이상, 대소문자, 숫자, 특수문자 포함)" 
        });
  }
        if(password != confirmpassword){ //비밀번호와 확인용 
            return res.status(400).json({
                   message : `비밀번호가 일치하지 않습니다.`
            });
        }

        if(name.length > 15){ //이름을 15자 이상 입력한 경우. 
            return res.status(400).json({ 
            message : `이름은 15자까지 입력이 가능합니다.`
            });
        }

        const hashedPw = await bcrypt.hash(password, 10); //비밀번호 hash로 암호화

        conn = await pool.getConnection(); //db 연결

        await conn.query(
            "INSERT INTO usertbl (email, password_hash, nickname) VALUES (?, ?, ?)",
            [email, hashedPw, name]
        ); //유저 정보 db에 등록

        res.status(201).json({ //회원가입 성공
            success : true,
            message : `회원가입에 성공하였습니다.`
        });

    } catch(err) {
        console.log(`회원가입 실패 : ${err}`); //오류 로그 띄움

        res.status(500).json({ //상태 500으로 지정.
            err_message : `서버 오류입니다.`
        });

    } finally {
        if(conn) {
            conn.release(); //db 연결 해제
        }
    }
})
.post("/register/emailCheck", async(req, res) => { //이메일 중복 여부 체크
    const {email} = req.body; //body에서 email 가져옴

    let conn; //db 연결 변수
    
    try{
        if(!email){ //이메일을 입력하지 않고 시도했을 경우
            res.status(400).json({
                success : false,
                err_message : "이메일은 필수값 입니다."
            });
        }

        conn = await pool.getConnection(); //db 연결

        const exist = await conn.query("select id from usertbl where email = ?", [email]); //아매일 가입 여부 확인

        if(exist.length > 0) { //가입 된 경우
            return res.status(409).json({
                success : false,
                message : "사용 중인 이메일입니다."
            });
        }
        else {
            res.status(200).json({ //가입 하지 않은 경우
                success : true,
                message : "사용 가능한 이메일입니다."
            });
        }

    } catch(err) {
        console.log(`이메일 중복 여부 체크 실패 : ${err}`); //오류 로그 띄움

        res.status(500).json({ //상태 500으로 지정.
            err_message : `서버 오류입니다.`
        });

    } finally {
        if(conn) {
            conn.release(); //db 연결 해제
        }
    }
})
.delete("/Delete_Account", authmiddleware, async(req, res) => {
    const { password } = req.body;
    const user_id = req.user_id;

    let conn;
    
    try {
        if(!password) { //비밀번호 입력하지 않을 시 오류
            res.status(400).json({
                err_message : `비밀번호를 입력해주세요.`
            });
        }

        conn = await pool.getConnection(); //db 연결

        const [user] = await conn.query("select password from usertbl where id = ?", [user_id]); //유저 정보 체크
        
        const isMatch = await bcrypt.compare(password, user.password); //비밀번호 검증
        if(!isMatch) { //입력한 비밀번호가 일치하지 않았을 때
            res.status(401).json({
                err_message : `비밀번호가 일치하지 않습니다.`
            });
        }

        await conn.query('delete from usertbl where id = ?', [user_id]); //db에서 유저 정보 삭제, problemtbl은 user 정보가 사라지면 같이 삭제되도록 설정되어 있음.

        res.status(200).json({
            message : `회원탈퇴에 성공하였습니다. 그동안 서비스를 이용해 주셔서 감사합니다.`
        });

    } catch (err) {
        console.log(`회원 탈퇴 오류 발생 : ${err}`); //오류 로그 띄움
        
        res.status(500).json({ //상태를 500으로 지정, 오류 메시지 보냄
            err_message : `서버 오류 입니다.`
        });

    } finally {
        if(conn) {
            conn.release();
        }
    }
});

//메인 페이지 데이터 관련 
router
.get("/main", async(req, res) => {
    let conn; //db 연결 변수

    try{
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ success: false, message: "인증 필요" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        conn = await pool.getConnection();

        // 1. 유저 정보 (nickname)
        const userRows = await conn.query("SELECT nickname FROM usertbl WHERE id = ?", [userId]);
        const userData = (userRows && userRows.length > 0) ? userRows[0] : { nickname: "test" };

        // 2. 상단 요약 (BigInt -> Number 변환)
        const summaryRows = await conn.query(
            `SELECT COUNT(*) as total,
                COUNT(CASE WHEN status IN ('SUCCESS', 'RETRY_SUCCESS') THEN 1 END) as correct,
                COUNT(CASE WHEN status = 'FAIL' THEN 1 END) as incorrect
             FROM problemtbl WHERE user_id = ?`, [userId]
        );
        const s = summaryRows[0] || { total: 0, correct: 0, incorrect: 0 };

        // 3. 차트 데이터 (BigInt -> Number 변환)
        const diffRaw = await conn.query(
            `SELECT c.tier as name, COUNT(p.id) as value FROM problemtbl p 
             JOIN problem_cachetbl c ON p.problem_id = c.problem_id 
             WHERE p.user_id = ? GROUP BY c.tier`, [userId]
        );

        const langRaw = await conn.query(
            `SELECT use_language as name, COUNT(*) as problems FROM problemtbl 
             WHERE user_id = ? AND use_language IS NOT NULL GROUP BY use_language ORDER BY problems DESC`, [userId]
        );

        const reviewList = await conn.query(
            `SELECT p.id, c.title, c.tier as diff FROM problemtbl p
             JOIN problem_cachetbl c ON p.problem_id = c.problem_id
             WHERE p.user_id = ? AND p.status = 'FAIL' ORDER BY p.updated_at DESC LIMIT 3`, [userId]
        );

        // JSON 응답 시 BigInt 에러 방지를 위해 Number() 강제 변환
        res.status(200).json({
            success: true,
            user: userData,
            stats: {
                summary: {
                    total: Number(s.total),
                    correct: Number(s.correct),
                    incorrect: Number(s.incorrect)
                },
                difficultyData: diffRaw.map(d => ({ name: d.name, value: Number(d.value) })),
                languageData: langRaw.map(l => ({ name: l.name, problems: Number(l.problems) })),
                reviewList: reviewList || []
            }
        });
    } catch(err) {
        console.log(`데이터 읽어오는 중 오류 발생 : ${err}`);

        res.status(500).json({
            err_message : `서버 오류 입니다.`
        });

    } finally {
        if(conn) {
            conn.release();
        }
    }
})

//게시물 데이터 전처리
/*
  solved.ac 레벨을 상/중/하로 변환
  하: Bronze (1~5) | 중: Silver (6~10) | 상: Gold 이상 (11~31)
 */
const getSimpleTier = (level) => {
    if (level === 0) return 'Unrated';
    if (level <= 5) return '하'; 
    if (level <= 10) return '중';
    return '상'; 
};

//게시물 crud
router
.get("/problem", authmiddleware, async(req, res) => {
    let conn;

    try{
       const userId = req.user.id;
        conn = await pool.getConnection();

        // 1. 유저 정보 (테이블명 usertbl로 수정!)
        const userRows = await conn.query("SELECT nickname FROM usertbl WHERE id = ?", [userId]);
        // MariaDB 드라이버는 결과가 바로 배열일 수 있으므로 체크
        const nickname = (userRows && userRows.length > 0) ? 
                         (userRows[0].nickname || userRows[0][0]?.nickname) : "사용자";

        // 2. 게시물 데이터
        const sql = `
            SELECT p.id, p.problem_id, c.title, c.tier, p.status, p.created_at 
            FROM problemtbl p 
            JOIN problem_cachetbl c ON p.problem_id = c.problem_id 
            WHERE p.user_id = ? 
            ORDER BY p.created_at DESC
        `;
        const rows = await conn.query(sql, [userId]);

        // ⭐️ 터미널에 이게 찍히는지 보세요!
        console.log(`[BACKEND] 데이터 조회 완료: ${rows.length}건`);

        // ⭐️ 응답을 '반드시' 보냅니다.
        return res.status(200).json({ 
            success: true, 
            data: Array.isArray(rows) ? rows : [rows], // 배열 보장
            user: { nickname }
        });

    } catch(err) {
        console.error(`게시물 조회 중 오류 발생 : ${err}`);

        res.status(500).json({
            err_message : "서버 오류가 발생했습니다."
        });
    } finally {
        if(conn) { //db 연결 해제
            conn.release();
        }
    }
})
.post("/problem/upload", authmiddleware, async(req, res) => {
    
    const { problem_id, title, tier, status, use_language } = req.body;
    const userId = req.user.id;

    let conn;

    try{
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // 1-1. 캐시 테이블 확인
        const cacheCheck = await conn.query(
            "SELECT title, tier FROM problem_cachetbl WHERE problem_id = ?", 
            [problem_id]
        );

        let title, tier;

        if (cacheCheck.length > 0) {
            title = cacheCheck[0].title;
            tier = cacheCheck[0].tier;
        } else {
            // 1-2. 캐시에 없으면 solved.ac API 호출
            const response = await axios.get(`https://solved.ac/api/v3/problem/show?problemId=${problem_id}`);
            title = response.data.titleKo;
            tier = getSimpleTier(response.data.level); // 상/중/하 매핑

            await conn.query(
                "INSERT INTO problem_cachetbl (problem_id, title, tier) VALUES (?, ?, ?)",
                [problem_id, title, tier]
            );
        }

        // 1-3. 유저 기록 저장
        await conn.query(
            "INSERT INTO problemtbl (user_id, problem_id, status, use_language, review) VALUES (?, ?, ?, ?, ?)",
            [userId, problem_id, status, use_language, review || null]
        );

        await conn.commit();
        res.status(201).json({ 
            success: true, 
            message: "등록 완료", data: { title, tier } });

    } catch(err) {
        console.error(`게시물 조회 중 오류 발생 : ${err}`);

        res.status(500).json({
            err_message : "서버 오류가 발생했습니다."
        });
    } finally {
        if(conn) { //db 연결 해제
            conn.release();
        }
    }
})
.put("/problem/update/:id", authmiddleware, async(req, res) => {
    
    const { id } = req.params;
    const { status, use_language } = req.body; // 수정할 데이터들
    const userId = req.user.id;

    let conn;

    try{
        conn = await pool.getConnection();
        
        const sql = `
            UPDATE problemtbl 
            SET status = ?, use_language = ?, updated_at = NOW() 
            WHERE id = ? AND user_id = ?
        `;
        
        const result = await conn.query(sql, [status, use_language, id, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "수정할 대상을 찾을 수 없거나 권한이 없습니다." });
        }

        res.status(200).json({ 
            success: true, 
            message: "수정을 성공하였습니다." });

    } catch(err) {
        console.error(`게시물 조회 중 오류 발생 : ${err}`);

        res.status(500).json({
            err_message : "서버 오류가 발생했습니다."
        });
    } finally {
        if(conn) { //db 연결 해제
            conn.release();
        }
    }
})
.delete("/problem/delete/:id", authmiddleware, async(req, res) => {
    
    const { id } = req.params;
    const userId = req.user.id;
    
    let conn;

    try{
        conn = await pool.getConnection();
        
        // mariadb 모듈의 삭제 결과 확인
        const result = await conn.query(
            "DELETE FROM problemtbl WHERE id = ? AND user_id = ?", 
            [id, userId]
        );

        // affectedRows로 삭제 여부 확인
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "삭제 대상을 찾을 수 없습니다." });
        }
        res.status(200).json({ 
            success: true, 
            message: "삭제 성공" });

    } catch(err) {
        console.error(`게시물 조회 중 오류 발생 : ${err}`);

        res.status(500).json({
            err_message : "서버 오류가 발생했습니다."
        });
    } finally {
        if(conn) { //db 연결 해제
            conn.release();
        }
    }
});

//오답노트 crud
router
.get("/incorrect", authmiddleware, async(req, res) => {
    let conn;

    try{
        const userId = req.user.id;
        conn = await pool.getConnection();
        
        // 1. 유저 닉네임 조회 (usertbl)
        const [userRows] = await conn.query("SELECT nickname FROM usertbl WHERE id = ?", [userId]);
        const nickname = (userRows && userRows.length > 0) ? userRows[0].nickname : "사용자";

        // 2. 오답 데이터 조회 (p.status = 'FAIL' 조건 추가)
        const sql = `
            SELECT p.id, p.problem_id, c.title, c.tier, p.created_at 
            FROM problemtbl p 
            JOIN problem_cachetbl c ON p.problem_id = c.problem_id 
            WHERE p.user_id = ? AND p.status = 'FAIL' 
            ORDER BY p.created_at DESC
        `;
        const [rows] = await conn.query(sql, [userId]);
        
        console.log(`[Incorrect] User: ${nickname}, 오답: ${rows.length}개`);

        // 3. 최종 응답 (MainDashboard와 동일한 규격)
        return res.status(200).json({ 
            success: true, 
            data: rows,      // 오답 목록
            user: { nickname } 
        });

    } catch(err) {
        console.error(`오답노트 정보 수신 중 오류 발생 : ${err}`);
        
        res.status(500).json({
            err_message : "서버 오류가 발생하였습니다."
        });

    } finally {

        if(conn){
            conn.release();
        }
    }
})
.put("/incorrect/update/:id", authmiddleware, async(req, res) => {
    
    const { id } = req.params;
    const { review, status } = req.body; // review(오답 이유), status(재풀이 성공 시 SUCCESS로 변경 가능)
    const userId = req.user.id;
    
    let conn;

    try{
        conn = await pool.getConnection();
        
        // review 내용과 status를 동시에 업데이트할 수 있게 구성
        const sql = `
            UPDATE problemtbl 
            SET review = ?, status = ?, updated_at = NOW() 
            WHERE id = ? AND user_id = ?
        `;

        const result = await conn.query(sql, [review, status || 'FAIL', id, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "수정할 대상을 찾을 수 없습니다." });
        }
        res.status(200).json({
             success: true, 
             message: "오답 노트가 업데이트되었습니다!" });  

    } catch(err) {
        console.error(`오답노트 업데이트 실패 : ${err}`);

        res.status(500).json({
            err_message : "서버 오류가 발생하였습니다."
        });

    } finally {
        if(conn) {
            conn.release();
        }
    }
})
.delete("/incorrect/delete/:id", authmiddleware, async(req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    let conn;

    try{
        conn = await pool.getConnection();
        const result = await conn.query("DELETE FROM problemtbl WHERE id = ? AND user_id = ?", [id, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "삭제할 대상을 찾을 수 없습니다." });
        }

        res.status(200).json({
             success: true, 
             message: "기록이 삭제되었습니다." });
             
    } catch (err) {
        console.error(`오답노트 삭제 실패 : ${err}`);

        res.status(500).json({
            err_message : "서버 오류가 발생하였습니다."
        });

    } finally {
        if(conn) {
            conn.release();
        }
    }
})


module.exports = router; //router 모듈 내보내기