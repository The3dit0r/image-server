const ytdl = require("ytdl-core");
const proc = require("process");
const axios = require("axios");
const sharp = require("sharp");
const exp = require("express");
const cors = require("cors");
const fs = require("fs");

const app = exp();

app.listen(3030, () => {
  console.log("Running");
  proc.on('uncaughtException', (err, origin) => {
    // Do nothing
  });
});

app.get("/status", cors(), (req, res) => {
  res.sendStatus(201);
});

app.get("/zygo", (req, res) =>  {
  res.sendFile(__dirname + "/FRBnyuFaUAE2kP5.png");
});

app.get("/loux", (req, res) =>  {
  res.sendFile(__dirname + "/91813046_p0-min.jpg");
});

app.get("/", cors(), (req, res) => {
  res.sendStatus(201);
});

app.get("/cover/:type/:id", cors(), async (req, res) => {
  const fail = () => res.status(404).send("Failed");

  const _type = {
    "sd169": ["hqdefault", 480, 270, 45, 0],
    "maxresdefault": ["maxresdefault", 720, 720, 0, 280],
    "sddefault": ["sddefault", 360, 360, 60, 140],
    "hqdefault": ["hqdefault", 270, 270, 45, 105],
    "mqdefault": ["mqdefault", 180, 180, 0, 70],
    "default": ["default", 66, 66, 13, 28],

    "maxresoriginal": ["maxresdefault", 1280, 720, 0, 0],
    "sdoriginal": ["sddefault", 640, 480, 0, 0],
    "hqoriginal": ["hqdefault", 480, 360, 0, 0],
    "mqoriginal": ["mqdefault", 320, 180, 0, 0],
    "original": ["default", 120, 90, 0, 0]
  }

  const { id, type } = req.params;

  if (!ytdl.validateID(id)) {
    console.log("Invalid ID !! - " + id);
    return fail();
  }

  if (_type[type]) {
    [t, width, height, top, left] = _type[type];
  } else {
    return fail();
  }

  try {
    if (fs.existsSync(`./temp/crop/${type}-${id}.jpg`)) {
      res.sendFile(__dirname + `/temp/crop/${type}-${id}.jpg`);
      return;
    }
  } catch (err) { }

  download_image(id, t, width, height, top, left, type)
    .then((l) => {
      return res.status(200).sendFile(__dirname + l);
    }).catch((e) => {
      console.log(e)
      return fail();
    });
});


const download_image = (id, type, width, height, top, left, t_) => new Promise((resolve, reject) => {
  axios({
    url: `https://img.youtube.com/vi/${id}/${type}.jpg`,
    responseType: 'stream',
  }).then(response => {
    response.data.pipe(fs.createWriteStream(`./temp/img/${t_}-${id}.jpg`))
      .on('finish', () => {
        sharp(`./temp/img/${t_}-${id}.jpg`)
          .extract({ width: width, height: height, left: left, top: top })
          .toFile(`./temp/crop/${t_}-${id}.jpg`)
          .then(() => {
            resolve(`/temp/crop/${t_}-${id}.jpg`);
          })
          .catch((err) => {
            reject(err);
          });
      })
      .on('error', (err) => {
        reject(err);
      });
  })
    .catch((err) => {
      reject(err);
    });
});

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
