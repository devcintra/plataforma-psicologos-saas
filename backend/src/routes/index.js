const express = require('express');
const router = express.Router();
const { proteger, restringir } = require('../middleware/autenticacao');

const { cadastrar, login, perfil } = require('../controllers/authController');
const { listar: listarPsicologos, buscarPorId, atualizar: atualizarPsicologo } = require('../controllers/psicologoController');
const { agendar, listar: listarConsultas, atualizarStatus } = require('../controllers/consultaController');
const { avaliar, listarPorPsicologo } = require('../controllers/avaliacaoController');
const { enviar, historico } = require('../controllers/mensagemController');
const { listar: listarDisponibilidade, criar: criarDisponibilidade, remover: removerDisponibilidade } = require('../controllers/disponibilidadeController');

const { realizarTriagem } = require('../controllers/iaController');

// ── Auth ──────────────────────────────────────────
router.post('/auth/cadastro', cadastrar);
router.post('/auth/login', login);
router.get('/auth/perfil', proteger, perfil);

// ── Psicólogos ────────────────────────────────────
router.get('/psicologos', listarPsicologos);
router.get('/psicologos/:id', buscarPorId);
router.put('/psicologos/:id', proteger, restringir('psicologo'), atualizarPsicologo);

// ── Consultas ─────────────────────────────────────
router.post('/consultas', proteger, restringir('paciente'), agendar);
router.get('/consultas', proteger, listarConsultas);
router.patch('/consultas/:id/status', proteger, atualizarStatus);

// ── Avaliações ────────────────────────────────────
router.post('/avaliacoes', proteger, restringir('paciente'), avaliar);
router.get('/avaliacoes/psicologo/:id', listarPorPsicologo);

// ── Mensagens ─────────────────────────────────────
router.post('/mensagens', proteger, enviar);
router.get('/mensagens/:id_psicologo/:id_paciente', proteger, historico);

// ── Disponibilidade ───────────────────────────────
router.get('/disponibilidade/:id_psicologo', listarDisponibilidade);
router.post('/disponibilidade', proteger, restringir('psicologo'), criarDisponibilidade);
router.delete('/disponibilidade/:id', proteger, restringir('psicologo'), removerDisponibilidade);

// ── Inteligência Artificial ───────────────────────
router.post('/triagem-ia', proteger, realizarTriagem);

module.exports = router;
