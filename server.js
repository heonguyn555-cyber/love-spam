const express = require("express");

const http = require("http");

const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server);

app.use(express.static("public"));


// lưu tim từng máy
const likes = {};

io.on("connection",(socket)=>{

    // id máy
    const myId =
        socket.handshake.query.clientId;

    // nếu chưa có thì tạo
    if(!likes[myId]){

        likes[myId] = 0;

    }

    // gửi trạng thái ban đầu
    updateClient(socket);


    // bấm tim
    socket.on("like",(clientId)=>{

        if(!likes[clientId]){

            likes[clientId] = 0;

        }

        likes[clientId]++;

        updateAll();

    });


    // chat
    socket.on("sendMessage",(data)=>{

        io.emit("receiveMessage",data);

    });

});


// tính tổng tim
function getTotalLikes(){

    let total = 0;

    for(let id in likes){

        total += likes[id];

    }

    return total;

}


// update 1 client
function updateClient(client){

    const myId =
        client.handshake.query.clientId;

    const myLikes =
        likes[myId] || 0;

    const totalLikes =
        getTotalLikes();

    client.emit("updateHearts",{

        left:
            totalLikes - myLikes,

        right:
            myLikes

    });

}


// update tất cả
function updateAll(){

    io.sockets.sockets.forEach((client)=>{

        updateClient(client);

    });

}


const PORT =
    process.env.PORT || 3000;

server.listen(PORT,()=>{

    console.log("running");

});