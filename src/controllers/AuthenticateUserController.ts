import { Request, Response } from "express";
import { AuthenticateUserService } from "../services/AuthenticateUserService";



class AuthenticateUserController {
  async handle(request: Request, response: Response) {

    const { code } = request.body;

    //Instanciando essa minha camada de serviço
    const service = new AuthenticateUserService();
    try {
      const result = await service.execute(code);
      //Retornando o resultado do que ele retornou na nossa autenticação
      return response.json(result);
    } catch (err) {
      return response.json({ error: err.message });
    }
  }
}

export { AuthenticateUserController };