const express = require("express");

const router = express.Router(); //router 객체 생성
const pool = require("../maria"); //db 연결 풀

router.get("/", (req, res) => {
    res.send("서버 열렸음 ㅇㅇ");
    res.status(200);
});

//로그인

//회원가입 

//게시물 crud

//오답노트 crud

//메인화면 

//로그아웃

module.exports = router;