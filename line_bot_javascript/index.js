const line = require("@line/bot-sdk");
const ws = require("ws")
const groupid = "targetgroupID"
const express = require("express");
const CONFIG = {
    channelAccessToken: "yourtokenhere",
    channelSecret: "yourkeyhere"
}

async function pushMessage_line(client, IP, userId, thumbnail_url, url) {
    // userIdを引数にとって、pushMessageを送信する関数
    const text_message = {
        type: "text",
        text: "アップローダーに画像がアップされました。送信者:" + IP,
    };
    await client.pushMessage(userId, text_message);

    const img_message = [{
        type: 'image',
        originalContentUrl: url,
        previewImageUrl: thumbnail_url
    }];
    await client.pushMessage(userId, img_message);
};



const PORT = 3223;
const client = new line.Client(CONFIG);
async function websockettoline(pushMessage) {
    const wss = new ws.Server({ port: 13375 })
    console.log("WSserver on 13375")
    await wss.on('connection', async function connection(ws) {
        await ws.on('message', async function incoming(message) {
            const message_buff = JSON.parse(message)
            console.log(message_buff)
            pushMessage_line(client, message_buff.IP, groupid, message_buff.thumbnail, message_buff.cdn);
            // console.log(message_buff)
        })
    })//コネクション.{
}
// pushMessage("C8fc6f7dcb72a96b5db246e20c47e2f2f")
// main();
main2();
async function main2() {
    await websockettoline();
    await express()
        .post("/", line.middleware(CONFIG), (req, res) => handleBot(req, res))
        .listen(PORT, () => console.log(`Listening on ${PORT}`));
}
function handleBot(req, res) {
    res.status(200).end();
    req.body.events.map((event) => {
        console.log(JSON.stringify(event))
        //     client.replyMessage(event.replyToken, { type: 'text', text: 'こんにちは！' });
    })
}
