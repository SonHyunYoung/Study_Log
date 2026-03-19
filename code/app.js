const express = require("express"); //express 사용

const port = 3000; //포트 번호 3000
const app = express(); //express 객체 생성

app.use(express.static(path.join(__dirname, 'public')));  //정적 파일 선언(css 같은거 ㅇㅇ)

app.use(express.json()); //json 사용한다고 선언
app.use(express.urlencoded({extended : true})); //body-parser

app.use("/", require("./routes/contactRoutes.js"));

app.get("/", (req, res) => { //test
    res.send("Hello, World");
});

app.listen(port, () => { //서버 띄우기, 3000번 포트
    console.log(`${port}번 포트에서 실행 중`);
});