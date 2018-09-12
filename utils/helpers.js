const fs = require('fs');

const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

/* Image Upload */
AWS.config.accessKeyId = process.env.AWS_ACCESS_KEY;
AWS.config.secretAccessKey = process.env.AWS_SECRET_KEY;
AWS.config.region = process.env.AWS_REGION;

const S3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
    s3: S3,
    bucket: 'dna-edge',
    acl: 'public-read',
    key: function (req, file, callback) {
      console.log(req);
      const fname = Date.now() + '_' + file.originalname;
      callback(null, fname);
    }
  })
});

exports.upload = upload;
// exports.uploadArray = multer({storage: storageS3}).array('image', 5);


exports.getClientId = (customId) => {
  let result = -1;

  for(let i=0; i<clients.length; i++) {
    if(clients[i].customId === customId) {
      result = clients[i].clientId;
      break;
    }
  }

  return result;
}

exports.returnAuth = (token) => {
  return new Promise((resolve, reject) => {
    authModel.auth(token, (err, userData) => {
      if (err) {
        reject(err);
      } else {
        resolve(userData);
      }
    });
  });
}

exports.getCurrentDate = () => {
  var date = new Date();
 
  var year = date.getFullYear();
  var month = date.getMonth();
  var today = date.getDate();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  var milliseconds = date.getMilliseconds();
 
  return new Date(Date.UTC(year, month, today, hours, minutes, seconds, milliseconds));
}

exports.randomGeoLocation = (minLng, minLat) => {
  let lng, lat;
  console.log("minLng : " +minLng + ", minLat : " + minLat);

  if (minLng && minLat) {
    lng = Math.random()*0.1 + minLng;
    lat = Math.random()*0.1 + minLat;
  } else {
    lat = Math.random() * (38.27 - 33.06) + 33.06;
    lng = Math.random() * (131.52 - 125.04) + 125.04;
  }
  
  return [lng, lat];  
};

exports.randomNumber = (min, max) => {
  return Math.floor(Math.random() * max) + min;
};

exports.randomString = (minLength, maxLength) => {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = Math.floor(Math.random() * maxLength) + minLength;
  let text = '';
  
  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};