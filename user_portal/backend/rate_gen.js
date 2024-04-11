const { Client } = require('pg');
require('dotenv').config(); // Load environment variables from .env file
// Create a new PostgreSQL client instance
const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432, // Default PostgreSQL port
    ssl: {
        rejectUnauthorized: false, // Set to false if using self-signed certificates
        // You may need to provide other SSL options such as ca, cert, and key
        // Example:
        // ca: fs.readFileSync('path/to/ca-certificate.crt'),
        // cert: fs.readFileSync('path/to/client-certificate.crt'),
        // key: fs.readFileSync('path/to/client-certificate.key')
    },
});

async function createMoviesTable() {
    try {
        // Connect to the PostgreSQL server
        await client.connect();

        // Define the SQL query to create the movies table
        const query = `
        CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS movie_ratings(
            id SERIAL PRIMARY KEY,
            movie_id INTEGER REFERENCES movies(id),
            user_id INTEGER REFERENCES users(id), --Optional, if you want to track who rated the movie
            rating INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

    `;
        // Execute the SQL query
        await client.query(query);
        console.log('Users and Movie Ratings tables created successfully');
    } catch (error) {
        console.error('Error creating movies table:', error);
    } finally {
        // Close the connection to the PostgreSQL server
        await client.end();
    }
}

// Call the function to create the movies table
createMoviesTable();
