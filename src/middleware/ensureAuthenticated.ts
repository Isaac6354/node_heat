import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

interface IPayload {
  sub: string;
}

export function ensureAuthenticated(request: Request, response: Response, next: NextFunction) {
  const authToken = request.headers.authorization;

  //Verificando se tem alguma coisa preenchida dentro do meu token
  //se eu não tiver, retorno um erro 401, e digo que meu usuário não tem autorização
  if (!authToken) {
    return response.status(401).json({
      errorCode: "token.invalid",
    });
  }
  //Se o token tiver preenchido, eu preciso verificar se ele é válido
  //Bearer 564654654dfdf54df475454dfdf54f
  //[0] Bearer
  //[1] 564654654dfdf54df475454dfdf54f
  const [, token] = authToken.split(" ");

  try {
    //O que tiver dentro do meu verify, o retorno vai ser do tipo IPayload
    const { sub } = verify(token, process.env.JWT_SECRET) as IPayload

    request.user_id = sub;
    //passando o meu middleware pra frente
    return next();

  } catch (err) {
    return response.status(401).json({ errorCode: "token.expired" });
  }
}