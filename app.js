const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');

const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

require('dotenv').config();
global.utils = require('./utils/global');
require('./routes')(app);

/* Error Handler*/
process.stdin.resume(); //so the program will not close instantly

process.on('exit',    exitHandler.bind(null, {cleanup:true}));        // 프로세스가 종료되었을 경우
process.on('SIGINT',  exitHandler.bind(null, {exit:true}));           // Ctrl+C가 눌렸을 경우
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));           // kill pid로 종료될 경우
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));
process.on('uncaughtException', exitHandler.bind(null, {exit:true})); // 기타

// 프로세스가 종료되면 연결된 소켓이 모두 끊어지므로, 
// 레디스 내에 있는 세션이 의미가 없게 되니까 자동으로 내용이 삭제되도록 합니다.
function exitHandler(options, exitCode) {
  // global.utils.redis.del("info");
  // global.utils.redis.del("clients");
  // global.utils.redis.del("geo:locations");
  // global.utils.redis.flushdb((err, result) => {
  //   console.log("[ Redis ] session datas in Redis are removed Successfully ...");
  // });
  
  if (options.exit) {
    process.exit();
  }
}

// 로컬에서 개발하는 development 모드와, 실제로 배포하는 production 모드로 나누어,
// 크로스 도메인 문제를 해결하고 production 모드의 경우 https를 적용합니다.
let server, corsOptions;
switch(process.env.NODE_ENV){
  case 'development':    
    corsOptions = {
      origin: 'http://localhost:9010',
      credentials : true
    };
    app.use(cors(corsOptions));
    server = http.Server(app);    
    break;

  case 'production':
    corsOptions = {
      origin: 'https://dna.soyoungpark.me',
      credentials : true
    };
    app.use(cors(corsOptions));
    
    try {
      const privateKey = fs.readFileSync('../SSL/privkey.pem', 'utf8');
      const certificate = fs.readFileSync('../SSL/cert.pem', 'utf8');
      const ca = fs.readFileSync('../SSL/chain.pem', 'utf8');

      const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
      };
      
      server = https.Server(credentials, app);
    } catch (error) {
      console.log(error);
    }
    break;

  default:
    return;
}

require('./utils/socket').init(server);
server.listen(process.env.PORT, process.env.HOST, () => {
  console.info('[DNA-SocketApiServer] Listening on port %s at %s', 
  process.env.PORT, process.env.HOST);
});

module.exports = app;