require('dotenv').config(); 

const express = require("express");

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
            return res.status(401).json({ message: "가입되지 않은 이메일이거나 비밀번호가 틀렸습니다." });
        }

        const user = users[0]; // 첫 번째 유저 정보 꺼내기

        const isPasswordValid = await bcrypt.compare(password, user.password_hash); //비밀번호 유효성 검사
        if (!isPasswordValid) {
            return res.status(401).json({ message: "가입되지 않은 이메일이거나 비밀번호가 틀렸습니다." });
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
router
.post("/register", async(req, res) => {
    let conn; //db 연결 변수

    try{
        const {email, password, name} = req.body;

        if(!email || !password || !name) { //필수 값 입력 하나라도 안된 경우
            return res.status(400).json({
                err_message : `필수 값을 모두 입력해주세요.`
             });
        }

        if(name.length > 15){
            return res.status(400).json({ //
                err_message : `이름은 15자까지 입력이 가능합니다.`
            });
        }

        const hashedPw = await bcrypt.hash(password, 10);

        conn = await pool.getConnection(); //db 연결

        await conn.query(
            "INSERT INTO usertbl (email, password_hash, nickname) VALUES (?, ?, ?)",
            [email, hashedPw, name]
        ); //유저 정보 db에 등록

        res.status(201).json({ //회원가입 성공
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
                err_message : "이메일은 필수값 입니다."
            });
        }

        conn = await pool.getConnection(); //db 연결

        const exist = await conn.query("select id from usertbl where email = ?", [email]); //아매일 가입 여부 확인

        if(exist.length > 0) { //가입 된 경우
            return res.status(409).json({
                is_variable : false,
                message : "사용 중인 이메일입니다."
            });
        }
        else {
            res.status(200).json({ //가입 하지 않은 경우
                is_variable : true,
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
});

//게시물 crud
router
.post("/problems", authmiddleware, async(req, res) => { //게시물 등록

})
.get("/problems/lookup", authmiddleware, async(req, res) => {

})
.put("/problems/update", authmiddleware, async(req, res) => {

})
.delete("/problems/delete", authmiddleware, async(req, res) => {

});
//오답노트 crud
router
.post("/problems/wrong", authmiddleware, async(req, res) => {
})
.get("/problems/wrong/lookup", authmiddleware, async(req, res) => {
})
.put("/problems/wrong/update", authmiddleware, async(req, res) => {
})
.delete("/problems/wrong/sloved", authmiddleware, async(req, res) => {
});

//메인화면 

module.exports = router; //router 모듈 내보내기