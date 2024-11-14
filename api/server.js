import express from 'express'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()

app.use(express.json())


//adicionar usuários
// Adicionar usuários
app.post('/users', async (req, res) => {
    try {
      // Verificar se os campos obrigatórios foram enviados
      if (!req.body.name_user || !req.body.username || !req.body.position_job || !req.body.user_password || !req.body.RG) {
        return res.status(400).json({ error: 'Campos obrigatórios não fornecidos.' });
      }
  
      // Criação do usuário no banco de dados
      const user = await prisma.users.create({
        data: {
          name_user: req.body.name_user,
          username: req.body.username,
          position_job: req.body.position_job,
          user_password: req.body.user_password,
          RG: req.body.RG,
        },
      });
  
      // Retornar o usuário criado com status 201
      res.status(201).json(user);  // Retorna o objeto criado com os dados e o ID
    } catch (error) {
      console.error('Erro ao adicionar o usuário:', error); // Logar o erro completo no console
  
      // Verificar se o erro é relacionado à violação de alguma constraint (ex: username ou RG duplicado)
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Usuário ou RG já existe.' });
      }
  
      // Caso seja um erro inesperado
      res.status(500).json({ error: 'Erro ao adicionar o usuário.' });
    }
  });
  


//listar usuários
// Listar usuários com filtros usando query params e dados do corpo da requisição
app.get('/users', async (req, res) => {
    try {
      // Pega os filtros da query (URL) e do corpo da requisição (POST)
      const { name_user, username, position_job } = req.query;
      const { user_password, RG } = req.body;
  
      // Construir a consulta com base nos filtros passados, se fornecidos
      const users = await prisma.users.findMany({
        where: {
          // Filtros da query params (URL)
          name_user: name_user ? { contains: name_user, mode: 'insensitive' } : undefined,
          username: username ? { contains: username, mode: 'insensitive' } : undefined,
          position_job: position_job ? { contains: position_job, mode: 'insensitive' } : undefined,
  
          // Filtros do corpo da requisição
          user_password: user_password ? { equals: user_password } : undefined,
          RG: RG ? { equals: RG } : undefined,
        },
      });
  
      // Retorna os usuários encontrados com status 200
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao listar os usuários.' });
    }
  });
  

  //editar usuários
  app.put('/users/:codigo_id', async (req, res) => {
    console.log('Requisição PUT recebida para o código:', req.params.codigo_id); // Depuração
    try {
      const user = await prisma.users.update({
        where: {
          codigo_id: parseInt(req.params.codigo_id),  // Certifique-se que o tipo é numérico
        },
        data: {
          name_user: req.body.name_user,
          username: req.body.username,
          position_job: req.body.position_job,
          user_password: req.body.user_password,
          RG: req.body.RG,
        },
      });
  
      res.status(200).json(user);  // Retorna o usuário atualizado
    } catch (error) {
      console.error(error);  // Log do erro para depuração
      res.status(500).json({ error: 'Erro ao editar o usuário.' });
    }
  });
  

// Deletar usuário
app.delete('/users/:codigo_id', async (req, res) => {
    try {
      const deletedUser = await prisma.users.delete({
        where: {
          codigo_id: parseInt(req.params.codigo_id), // Encontrando o usuário pelo código
        },
      });
  
      // Retorna o usuário deletado (opcional, pode retornar apenas um status)
      res.status(200).json(deletedUser);
    } catch (error) {
      console.error(error);  // Log do erro para depuração
      res.status(500).json({ error: 'Erro ao deletar o usuário.' });
    }
  });
  


app.listen(3000)