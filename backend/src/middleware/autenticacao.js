const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const proteger = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ erro: 'Token não encontrado.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.findByPk(decoded.id, {
      attributes: { exclude: ['senha'] },
    });

    if (!usuario) return res.status(401).json({ erro: 'Usuário não encontrado.' });

    req.usuario = usuario;
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
};

// Middleware para restringir por tipo de usuário
const restringir = (...tipos) => {
  return (req, res, next) => {
    if (!tipos.includes(req.usuario.tipo_usuario)) {
      return res.status(403).json({ erro: 'Acesso negado para este tipo de usuário.' });
    }
    next();
  };
};

module.exports = { proteger, restringir };
