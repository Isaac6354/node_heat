import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";

import { Server } from "socket.io";

import { router } from "./routes";

const app = express();

app.use(cors());

//quando eu subir o meu server http, meu app vai subir junto
const serverHttp = http.createServer(app);

//acessando a conexão do nosso cliente
//permite que outras fontes como front-end ou mobile, se conectem tanto com nosso http via express
//como também com nosso websocket
const io = new Server(serverHttp, {
  cors: {
    origin: "*",
  },
});

//eu consigo tanto emitir um evento, como ficar escutando um evento dentro do websocket
io.on("connection", socket => {
  console.log(`Usuário conectado no socket ${socket.id}`);
});

app.use(express.json());

app.use(router);

app.get("/github", (request, response) => {
  //redirecionando para a tela de autenticação do github
  response.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.
    GITHUB_CLIENT_ID}`
  );
});

app.get("/signin/callback", (request, response) => {
  const { code } = request.query;

  return response.json(code);
});

export { serverHttp, io };

