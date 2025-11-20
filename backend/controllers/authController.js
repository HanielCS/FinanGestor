import { prisma } from '../prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Realiza o cadastro de um novo usuário.
 * Verifica duplicidade de e-mail e criptografa a senha antes de salvar.
 */
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Verifica se o usuário já existe
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: 'Este e-mail já está em uso.' });
    }

    // Criptografa a senha (Hash)
    const hashPassword = await bcrypt.hash(password, 8);

    // Cria o usuário no banco
    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashPassword 
      }
    });

    // Retorna os dados do usuário (sem a senha)
    return res.status(201).json({ 
      id: user.id, 
      name: user.name, 
      email: user.email 
    });

  } catch (error) {
    console.error("Erro no controller de registro:", error);
    return res.status(500).json({ error: 'Falha interna ao cadastrar usuário.' });
  }
};

/**
 * Realiza o login do usuário.
 * Verifica credenciais e gera o token de acesso (JWT).
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Busca usuário pelo e-mail
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
    }

    // Compara a senha enviada com o hash salvo no banco
    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    // Gera o Token JWT
    // Nota: Em produção, 'SEU_TOKEN...' deve vir de process.env.JWT_SECRET
    const token = jwt.sign({ id: user.id }, 'SEU_TOKEN', {
      expiresIn: '7d',
    });

    return res.json({
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email 
      },
      token
    });

  } catch (error) {
    console.error("Erro no controller de login:", error);
    return res.status(500).json({ error: 'Falha interna ao realizar login.' });
  }
};