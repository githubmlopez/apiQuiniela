/*

import { Sequelize } from 'sequelize';
import { Request, Response, NextFunction } from 'express';

const handleRegister = (sequelize: Sequelize, otroParametro: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Usa sequelize y otroParametro aquí
      console.log('Sequelize instance:', sequelize);
      console.log('Otro parámetro:', otroParametro);
      const userData = req.body;
      // Lógica para registrar al usuario usando sequelize
      res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
      next(error);
    }
  };
};

// En tu archivo principal donde defines las rutas:
import express, { Express } from 'express';
const app: Express = express();
const sequelizeInstance = new Sequelize('...your config...');
const miOtroParametro = { valor: 'algo' };

app.post('/register', handleRegister(sequelizeInstance, miOtroParametro));

// ... el resto de tu configuración de la app ...




   
   async function regUsuario(user : string, password : string) {

    const hashedPassword = await hashPassword(password);

    // En un esquema productivo se tendría que sustituir por
    // el llamado a una función que de de alta en la base de datos
    const usuarioEncontrado = await buscaUsuario(Usuario, username);

    if (usuarioEncontrado) {
      next(new regUsuarioError('El usuario ya se encuentra registrado'));
    } else {
      Usuario.push({ username: username, password: hashedPassword });

      console.log('continue con el proceso');
      res.status(201).json({ message: 'El usuario fue registrado con Exito' });
    }
  } catch (error) {
    console.log(error);
    next(new regUsuarioError('Error interno de aplicacion ***'));
  }
};

function hashPassword (password : string) {
  const hash = await _hash(password);
  return hash;
}

async function buscaUsuario (
  ejecFuncion(
  fn,
  infReq,
  logger,
  sequelize, 
  contexto,
  ...args) {

  }
  
const usuarioEncontrado = await buscaUsuario(Usuario, username);

  if (!usuarioEncontrado) {
    // Al invocar un error se llama mediante next al middleware
    // app.use((err, req, res, next)
    next(new autenticError('El usuario no existe'));
  } else {
    verifyPassword(usuarioEncontrado, password).then((isMatch) => {
      try {
        if (isMatch) {
          const token = _sign(
            { username: usuarioEncontrado.username },
            process.env.PASS_SECRET,
            {
              expiresIn: '1h',
            }
          );
          // Regresa el token al cliente
          res.status(200).json({ token });
        } else {
          res.status(401).json({ error: 'Error en la autenticacion' });
        }
      } catch (error) {
        next(new autenticError('Error interno de aplicacion **'));
      }
    });
  }

  async function verifyPassword(foundUser, password) {
  try {
    const isMatch = await _verify(foundUser.password, password);
    return isMatch;
  } catch (error) {
    return kFalso;
  }
} */

  
