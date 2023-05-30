const express = require('express');
const app = express();
const multer = require("multer");
const fs = require('fs');
const ws = require('ws')
const sharp = require("sharp");
const server = require('https').createServer({
    key: fs.readFileSync('/yourkeypath/privkey.pem'),
    cert: fs.readFileSync('/yourkeypath/cert.pem'),
}, app)
const filePath = './upload/';

app.post('/file_upload', multer({ dest: filePath }).single('file'), (req, res) => {
    console.log(req.socket.remoteAddress)
    // multerが/tmp/samplefup/配下にファイルを作成

    // req.file.pathでmulterが作成したファイルのパスを取得可能
    const importPath = filePath + req.file.originalname;
    console.log(req.file.path)
    fs.rename(req.file.path, importPath, (err) => {
        if (err) {
            throw err;
        }
        console.log("rename finish!");
        console.log({ importPath, filePath, originalname: req.file.originalname });
    })
    const cdnpath = "https://yourdomain/cdn?name=" + req.file.originalname
    res.end(cdnpath);


    //画像かどうか判断
    const ispng = req.file.originalname.indexOf(".png")
    const isjpg = req.file.originalname.indexOf(".jpg")
    const isjpeg = req.file.originalname.indexOf(".jpeg")
    const iswebp = req.file.originalname.indexOf(".webp")
    const isheic = req.file.originalname.indexOf(".heic")
    if (ispng !== -1 || isjpeg !== -1 || isjpg !== -1 || iswebp !== -1 || isheic !== -1) {
        //サムネイルを生成する
        sharp("./upload/" + req.file.originalname)
            .resize(600)
            .toFile("./upload/" + "thumbnail_" + req.file.originalname)
            .then(data => {
                const data2 = {
                    thumbnail: "https://yourdomain/cdn?name=thumbnail_" + req.file.originalname,
                    cdn: cdnpath,
                    IP: req.socket.remoteAddress,
                }
                console.log("ISIMAZE!")
                //LINE鯖に向かって送る
                const url = "ws://localhost:13375"
                const wss = new ws(url);
                wss.on('open', () => {
                    wss.send(JSON.stringify(data2));
                    wss.close;
                });
            })
            .catch(err => {
                console.error(err);
            });

    }

});

app.get('/upload', (req, res) => {
    res.sendFile(__dirname + "/" + "index.html");
});
app.get('/cdn', (req, res) => {

    res.sendFile(__dirname + "/upload/" + req.query.name);
});


server.listen(443, () => {
    console.log("listening at port %s", server.address().port);
});
