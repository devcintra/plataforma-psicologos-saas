require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { conectarBanco } = require('./config/database');

require('./models');

const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


app.get('/', (req, res) => {
  res.json({ mensagem: '🧠 API Psicologia Online funcionando!' });
});

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

const iniciarServidor = () => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
};

conectarBanco()
  .then(() => iniciarServidor())
  .catch((err) => {
    console.error('❌ Erro ao conectar no banco:', err.message);
    process.exit(1);
  });