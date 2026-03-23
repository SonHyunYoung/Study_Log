require('dotenv').config(); 
const mariadb = require('mariadb'); //mariadb 모듈 사용

const pool = mariadb.createPool({ //연결 pool 생성함
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    port : parseInt(process.env.DB_PORT),
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
    connectionLimit : 4
});

module.exports = pool; //모듈 내보내기