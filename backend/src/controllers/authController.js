const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario, Paciente, Psicologo } = require('../models');

const gerarToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/cadastro
const cadastrar = async (req, res) => {
  try {
    const { nome, email, senha, tipo_usuario, telefone, data_nascimento, crp, valor_consulta, descricao } = req.body;

    if (!nome || !email || !senha || !tipo_usuario) {
      return res.status(400).json({ erro: 'Campos obrigatórios: nome, email, senha, tipo_usuario.' });
    }

    const emailExiste = await Usuario.findOne({ where: { email } });
    if (emailExiste) return res.status(400).json({ erro: 'Email já cadastrado.' });

    const senhaCriptografada = await bcrypt.hash(senha, 12);

    const usuario = await Usuario.create({
      nome, email, senha: senhaCriptografada, tipo_usuario, telefone,
    });

    // Cria perfil complementar conforme o tipo
    if (tipo_usuario === 'paciente') {
      await Paciente.create({ id_usuario: usuario.id_usuario, data_nascimento });
    } else if (tipo_usuario === 'psicologo') {
      if (!crp) return res.status(400).json({ erro: 'CRP é obrigatório para psicólogos.' });
      await Psicologo.create({ id_usuario: usuario.id_usuario, crp, valor_consulta, descricao });
    }

    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso!',
      token: gerarToken(usuario.id_usuario),
      usuario: { id: usuario.id_usuario, nome, email, tipo_usuario },
    });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro interno.', detalhe: erro.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ erro: 'Informe email e senha.' });

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.status(401).json({ erro: 'Email ou senha incorretos.' });

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) return res.status(401).json({ erro: 'Email ou senha incorretos.' });

    res.json({
      mensagem: 'Login realizado com sucesso!',
      token: gerarToken(usuario.id_usuario),
      usuario: {
        id: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario,
      },
    });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro interno.' });
  }
};

// GET /api/auth/perfil
const perfil = async (req, res) => {
  res.json({ usuario: req.usuario });
};

module.exports = { cadastrar, login, perfil };
