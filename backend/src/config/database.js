const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // mude para console.log para ver as queries SQL
    define: {
      timestamps: false, // desativa createdAt/updatedAt por padrão
      freezeTableName: true, // usa o nome exato da tabela
    },
  }
);

const conectarBanco = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL conectado com sucesso!');
    await sequelize.sync({ alter: false }); // use { force: true } para recriar tabelas
    console.log('✅ Tabelas sincronizadas!');
  } catch (erro) {
    console.error('❌ Erro ao conectar ao banco:', erro.message);
    process.exit(1);
  }
};

module.exports = { sequelize, conectarBanco };
