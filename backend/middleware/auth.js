const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => { //인증 미들웨어

    //헤더에서 토큰 꺼내옴
    const authHeader = req.headers["authorization"]; 
    const token = authHeader && authHeader.split(" ")[1];

    if(!token) { //토큰 존재하지 않을 시 로그인 안내
        res.status(400).json({
            message : "서비스 이용을 위해 로그인이 필요합니다."
        });
    }

    try{
        const decode = jwt.verify(token, process.env.JWT_SECRET); //토큰 검증

        req.user = decode; 

    } catch (err) {
        res.status(403).json({
            message : "유효하지 않은 토큰입니다."
        });
    }
}

module.exports = authMiddleware;