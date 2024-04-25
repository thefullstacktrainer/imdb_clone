const { Client } = require('pg');
require('dotenv').config(); // Load environment variables from .env file

// PostgreSQL connection configuration
const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432, // Default PostgreSQL port
    ssl: {
        rejectUnauthorized: false, // Set to false if using self-signed certificates
    },
});

module.exports = {
    connect: async () => {
        try {
            await client.connect();
            console.log('Connected to PostgreSQL');
        } catch (error) {
            console.error('Error connecting to PostgreSQL:', error);
        }
    },
    getClient: () => {
        return client;
    }
};
