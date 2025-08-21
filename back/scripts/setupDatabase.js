const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const setupDatabase = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connexion à la base de données...');
    
    // Exécuter create-tables.sql
    const createTablesSQL = fs.readFileSync(
      path.join(__dirname, '../src/sql/create-tables.sql'), 
      'utf8'
    );
    console.log('Création des tables...');
    await pool.query(createTablesSQL);
    
    // Exécuter seed.sql
    const seedSQL = fs.readFileSync(
      path.join(__dirname, '../src/sql/seed.sql'), 
      'utf8'
    );
    console.log('Insertion des données...');
    await pool.query(seedSQL);
    
    console.log('Base de données initialisée !');
    
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

setupDatabase();