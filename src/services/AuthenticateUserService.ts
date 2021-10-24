import axios from 'axios';
import prismaClient from "../prisma";
import { sign } from 'jsonwebtoken';

/**
 * Receber code(string)
 * Recuperar o access_token no github
 * Recuperar informações o usuário no github
 * Verificar se o usuário existe no DB
 * Se ele existir, a gente gera um token
 * Se ele não existir, a gente cria no DB e gera token
 * Retornar o token com as informações do usuário logado
 */

interface IAccessTokenResponse {
  access_token: string
}

interface IUserResponse {
  avatar_url: string;
  login: string;
  id: number;
  name: string;
}

class AuthenticateUserService {
  async execute(code: string) {
    //url para acessar nosso access_token
    const url = "https://github.com/login/oauth/access_token";

    const { data: accessTokenResponse } = await axios.post<IAccessTokenResponse>(url, null, {
      params: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      //Retornando as informações como um JSON
      headers: {
        "Accept": "application/json",
      },
    });

    //Pegando todas as informações do usuário que ta logado na aplicação
    const response = await axios.get<IUserResponse>("https://api.github.com/user", {
      headers: {
        authorization: `Bearer ${accessTokenResponse.access_token}`,
      },
    });

    const { login, id, avatar_url, name } = response.data;

    //Aqui eu faço um select onde o github_id seja igual ao id
    let user = await prismaClient.user.findFirst({
      where: {
        github_id: id,
      },
    });

    if (!user) {
      user = await prismaClient.user.create({
        data: {
          github_id: id,
          login,
          avatar_url,
          name,
        },
      });
    }

    const token = sign(
      {
        user: {
          name: user.name,
          avatar_ur: user.avatar_url,
          id: user.id,
        },
      },
      //O segundo parâmetro que ele espera receber esse sign, é uma secret que ele vai utilizar
      //tanto pra gente criar o nosso token quanto pra gente validar se o token e válido
      //se o usuário pode de fato se autenticar na aplicação 
      process.env.JWT_SECRET,
      {
        subject: user.id,
        expiresIn: "1d",
      }
    );

    return { token, user };
  }
}

export { AuthenticateUserService };