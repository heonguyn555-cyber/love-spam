const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server);

app.use(express.static("public"));

const likes = {};

io.on("connection",(socket)=>{

    console.log("1 người đã vào");

    socket.on("sendMessage",(data)=>{

        io.emit("receiveMessage",data);

    });

    socket.on("like",(clientId)=>{

        if(!likes[clientId]){

            likes[clientId] = 0;

        }

        likes[clientId]++;

        let totalLikes = 0;

        for(let id in likes){

            totalLikes += likes[id];

        }

        io.sockets.sockets.forEach((client)=>{

            const myId =
                client.handshake.query.clientId;

            const myLikes =
                likes[myId] || 0;

            client.emit("updateHearts",{

                left:
                    totalLikes - myLikes,

                right:
                    myLikes

            });

        });

    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT,()=>{

    console.log("server running");

});
