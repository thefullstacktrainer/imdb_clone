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
      CREATE TABLE IF NOT EXISTS movies (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        release_date DATE,
        genre VARCHAR(100),
        poster_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

        const actor_query = `CREATE TABLE IF NOT EXISTS actors (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            age INT,
            gender VARCHAR(10),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `
        const movie_actor = `CREATE TABLE IF NOT EXISTS movie_actors (
            movie_id INT,
            actor_id INT,
            PRIMARY KEY (movie_id, actor_id),
            FOREIGN KEY (movie_id) REFERENCES movies(id),
            FOREIGN KEY (actor_id) REFERENCES actors(id)
        );
        `
        // Execute the SQL query
        await client.query(movie_actor);
        console.log('Actor <> Movie table created successfully');
    } catch (error) {
        console.error('Error creating movies table:', error);
    } finally {
        // Close the connection to the PostgreSQL server
        await client.end();
    }
}

// Call the function to create the movies table
createMoviesTable();
