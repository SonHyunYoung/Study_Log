const express = require("express");

const router = express.router(); //router 객체 생성

const pool = require("./maria"); //db 연결 풀