const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');
require('dotenv').config(); // Load environment variables from .env file
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;

// PostgreSQL connection configuration
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

// Middleware for parsing JSON bodies
app.use(bodyParser.json());
app.use(cors());

// Connect to PostgreSQL database
client.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(error => console.error('Error connecting to PostgreSQL:', error));
 
// API endpoint to store movie details
app.post('/api/actors',async (req , res)=> {
    try{
        const {name , age} = req.body;
        const query = `INSERT INTO actors (name , age) VALUES($1 , $2) RETURNING *`;
        const values =[name , age];
        const result = await client.query(query, values);

        const insertedActors = result.rows[0];
        res.status(201).json({ success: true, actor: insertedActors });
    } catch (error) {
        console.error('Error storing actor details:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
})
// API endpoint to store movie details
app.post('/api/movies', async (req, res) => {
    try {
        const { title, description, release_date, genre, poster_url } = req.body;

        // Insert movie details into the movies table
        const query = `
      INSERT INTO movies (title, description, release_date, genre, poster_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
        const values = [title, description, release_date, genre, poster_url];
        const result = await client.query(query, values);

        // Return the inserted movie details as the response
        const insertedMovie = result.rows[0];
        res.status(201).json({ success: true, movie: insertedMovie });
    } catch (error) {
        console.error('Error storing movie details:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

app.get("/api/actors", async (req, res)=>{
try{
    const query ='SELECT * FROM actors';
    const result = await client.query(query);
    const actors = result.rows;
    res.status(200).json({ success: true, actors });
}
     catch (error) {
        console.error('Error fetching actors:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
    
})
// GET endpoint to fetch all movies
app.get('/api/movies', async (req, res) => {
    try {
        // Query to fetch all movies from the movies table
        const query = 'SELECT * FROM movies';
        const result = await client.query(query);

        // Return the list of movies as the response
        const movies = result.rows;
        res.status(200).json({ success: true, movies });
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
app.get("/api/actors/:id", async (req, res)=>{
const actorId = req.params.id;
try {
    const query = 'SELECT * FROM actors WHERE id = $1';
        const result = await client.query(query, [actorId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Actor not found' });
        }
        const actor = result.rows[0];
        res.status(200).json({ success: true, actor });
}
catch (error){
    console.error('Error fetching actor by ID:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
}
    
})

// GET endpoint to fetch a movie by ID
app.get('/api/movies/:id', async (req, res) => {
    const movieId = req.params.id;

    try {
        // Query to fetch a movie by its ID
        const query = 'SELECT * FROM movies WHERE id = $1';
        const result = await client.query(query, [movieId]);

        // Check if the movie with the specified ID exists
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Movie not found' });
        }

        // Return the movie details as the response
        const movie = result.rows[0];
        res.status(200).json({ success: true, movie });
    } catch (error) {
        console.error('Error fetching movie by ID:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

app.put("/api/actors/:id", async (req, res)=>{
const actorID = req.params.id;
const {name , age} = req.body;
try{
    const checkQuery = 'SELECT * FROM actors WHERE id = $1';
        const checkResult = await client.query(checkQuery, [actorID]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'actor not found' });
        }
        const updateQuery = `
        UPDATE actors
        SET name = $1, age = $2
        WHERE id = $3
      `;
          const updateValues = [name , age, actorID];
          await client.query(updateQuery, updateValues);
  
          // Return success response
          res.status(200).json({ success: true, message: 'ACtor updated successfully' });
      } catch (error) {
          console.error('Error updating actor by ID:', error);
          res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
  });
   


// PUT endpoint to update a movie by ID
app.put('/api/movies/:id', async (req, res) => {
    const movieId = req.params.id;
    const { title, description, release_date, genre, poster_url } = req.body;

    try {
        // Check if the movie with the specified ID exists
        const checkQuery = 'SELECT * FROM movies WHERE id = $1';
        const checkResult = await client.query(checkQuery, [movieId]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Movie not found' });
        }

        // Update the movie details in the database
        const updateQuery = `
      UPDATE movies
      SET title = $1, description = $2, release_date = $3, genre = $4, poster_url = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
    `;
        const updateValues = [title, description, release_date, genre, poster_url, movieId];
        await client.query(updateQuery, updateValues);

        // Return success response
        res.status(200).json({ success: true, message: 'Movie updated successfully' });
    } catch (error) {
        console.error('Error updating movie by ID:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

app.delete('/api/actors/:id',async(req , res)=>{
    const actorID = req.params.id;
    try{
        const checkQuery ='SELECT * FROM actor WHERE id = $1';
        const checkResult = await client.query(checkQuery, [actorID]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Movie not found' });
            
        }
        const deleteQuery = 'DELETE FROM actors WHERE id = $1';
        await client.query(deleteQuery, [actorID]);
        res.status(200).json({ success: true, message: 'actor deleted successfully' });

    }
    catch(erro){
        console.error('Error deleting actor by ID:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });

    }
})
// DELETE endpoint to delete a movie by ID
app.delete('/api/movies/:id', async (req, res) => {
    const movieId = req.params.id;

    try {
        // Check if the movie with the specified ID exists
        const checkQuery = 'SELECT * FROM movies WHERE id = $1';
        const checkResult = await client.query(checkQuery, [movieId]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Movie not found' });
        }

        // Delete the movie from the database
        const deleteQuery = 'DELETE FROM movies WHERE id = $1';
        await client.query(deleteQuery, [movieId]);

        // Return success response
        res.status(200).json({ success: true, message: 'Movie deleted successfully' });
    } catch (error) {
        console.error('Error deleting movie by ID:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
