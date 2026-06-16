require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { conectarBanco } = require('./config/database');
require('./models'); // carrega todos os models e associações

const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ mensagem: '🧠 API Psicologia Online funcionando!' }));

app.use('/api', routes);

app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

conectarBanco().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
});
