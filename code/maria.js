const mariadb = require('mariadb'); //mariadb 모듈 사용

const pool = mariadb.createPool({ //연결 pool 생성함
    host : '127.0.0.1',
    user : 'root',
    port : 3307,
    password : '1234',
    database : 'carddb',
    connectionLimit : 4
});

module.exports = pool; //모듈 내보내기