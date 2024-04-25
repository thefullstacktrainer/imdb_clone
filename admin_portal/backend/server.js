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

// POST endpoint to add a new actor
app.post('/api/actors', async (req, res) => {
    try {
        const { name, age, gender } = req.body;

        // Insert actor details into the actors table
        const query = `
            INSERT INTO actors (name, age, gender)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const values = [name, age, gender];
        const result = await client.query(query, values);

        // Return the inserted actor details as the response
        const insertedActor = result.rows[0];
        res.status(201).json({ success: true, actor: insertedActor });
    } catch (error) {
        console.error('Error storing actor details:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// GET endpoint to fetch all actors
app.get('/api/actors', async (req, res) => {
    try {
        // Query to fetch all actors from the actors table
        const query = 'SELECT * FROM actors';
        const result = await client.query(query);

        // Return the list of actors as the response
        const actors = result.rows;
        res.status(200).json({ success: true, actors });
    } catch (error) {
        console.error('Error fetching actors:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// GET endpoint to fetch an actor by ID
app.get('/api/actors/:id', async (req, res) => {
    const actorId = req.params.id;

    try {
        // Query to fetch an actor by its ID
        const query = 'SELECT * FROM actors WHERE id = $1';
        const result = await client.query(query, [actorId]);

        // Check if the actor with the specified ID exists
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Actor not found' });
        }

        // Return the actor details as the response
        const actor = result.rows[0];
        res.status(200).json({ success: true, actor });
    } catch (error) {
        console.error('Error fetching actor by ID:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// PUT endpoint to update an actor by ID
app.put('/api/actors/:id', async (req, res) => {
    const actorId = req.params.id;
    const { name, age, gender } = req.body;

    try {
        // Check if the actor with the specified ID exists
        const checkQuery = 'SELECT * FROM actors WHERE id = $1';
        const checkResult = await client.query(checkQuery, [actorId]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Actor not found' });
        }

        // Update the actor details in the database
        const updateQuery = `
            UPDATE actors
            SET name = $1, age = $2, gender = $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
        `;
        const updateValues = [name, age, gender, actorId];
        await client.query(updateQuery, updateValues);

        // Return success response
        res.status(200).json({ success: true, message: 'Actor updated successfully' });
    } catch (error) {
        console.error('Error updating actor by ID:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// DELETE endpoint to delete an actor by ID
app.delete('/api/actors/:id', async (req, res) => {
    const actorId = req.params.id;

    try {
        // Check if the actor with the specified ID exists
        const checkQuery = 'SELECT * FROM actors WHERE id = $1';
        const checkResult = await client.query(checkQuery, [actorId]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Actor not found' });
        }

        // Delete the actor from the database
        const deleteQuery = 'DELETE FROM actors WHERE id = $1';
        await client.query(deleteQuery, [actorId]);

        // Return success response
        res.status(200).json({ success: true, message: 'Actor deleted successfully' });
    } catch (error) {
        console.error('Error deleting actor by ID:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// API endpoint to associate multiple actors with a movie
app.post('/api/movies/:movieId/actors', async (req, res) => {
    const movieId = req.params.movieId;
    const { actorIds } = req.body;

    try {
        // Check if the movie exists
        const checkMovieQuery = 'SELECT * FROM movies WHERE id = $1';
        const movieResult = await client.query(checkMovieQuery, [movieId]);
        if (movieResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Movie not found' });
        }

        // Check if the actors exist
        const checkActorsQuery = 'SELECT * FROM actors WHERE id = ANY($1)';
        const actorsResult = await client.query(checkActorsQuery, [actorIds]);
        if (actorsResult.rows.length !== actorIds.length) {
            return res.status(404).json({ success: false, error: 'One or more actors not found' });
        }

        // Associate actors with the movie
        const existingAssociationsQuery = 'SELECT actor_id FROM movie_actors WHERE movie_id = $1 AND actor_id = ANY($2)';
        const existingAssociationsResult = await client.query(existingAssociationsQuery, [movieId, actorIds]);
        const existingActorIds = existingAssociationsResult.rows.map(row => row.actor_id);

        const newActorIds = actorIds.filter(actorId => !existingActorIds.includes(actorId));
        const associateQuery = 'INSERT INTO movie_actors (movie_id, actor_id) VALUES ($1, $2)';
        const associatePromises = newActorIds.map(actorId => client.query(associateQuery, [movieId, actorId]));
        await Promise.all(associatePromises);

        res.status(201).json({ success: true, message: 'Actors associated with the movie successfully', existingActorIds, newActorIds });
    } catch (error) {
        console.error('Error associating actors with movie:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// API endpoint to update associations between actors and a movie
app.put('/api/movies/:movieId/actors', async (req, res) => {
    const movieId = req.params.movieId;
    const { addActorIds, removeActorIds } = req.body;

    try {
        // Check if the movie exists
        const checkMovieQuery = 'SELECT * FROM movies WHERE id = $1';
        const movieResult = await client.query(checkMovieQuery, [movieId]);
        if (movieResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Movie not found' });
        }

        // Add new associations
        if (addActorIds && addActorIds.length > 0) {
            // Check if the actors exist
            const checkActorsQuery = 'SELECT * FROM actors WHERE id = ANY($1)';
            const actorsResult = await client.query(checkActorsQuery, [addActorIds]);
            if (actorsResult.rows.length !== addActorIds.length) {
                return res.status(404).json({ success: false, error: 'One or more actors not found' });
            }

            // Associate new actors with the movie
            const existingAssociationsQuery = 'SELECT actor_id FROM movie_actors WHERE movie_id = $1 AND actor_id = ANY($2)';
            const existingAssociationsResult = await client.query(existingAssociationsQuery, [movieId, addActorIds]);
            const existingActorIds = existingAssociationsResult.rows.map(row => row.actor_id);

            const newActorIds = addActorIds.filter(actorId => !existingActorIds.includes(actorId));
            const associateQuery = 'INSERT INTO movie_actors (movie_id, actor_id) VALUES ($1, $2)';
            const associatePromises = newActorIds.map(actorId => client.query(associateQuery, [movieId, actorId]));
            await Promise.all(associatePromises);
        }

        // Remove existing associations
        if (removeActorIds && removeActorIds.length > 0) {
            const removeQuery = 'DELETE FROM movie_actors WHERE movie_id = $1 AND actor_id = ANY($2)';
            await client.query(removeQuery, [movieId, removeActorIds]);
        }

        res.status(200).json({ success: true, message: 'Associations updated successfully' });
    } catch (error) {
        console.error('Error updating associations between actors and movie:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// API endpoint to get association details of actors with movies
app.get('/api/actors-movies', async (req, res) => {
    try {
        // Query to fetch association details of actors with movies
        const query = `
            SELECT m.id AS movie_id, m.title AS movie_title, m.description AS movie_description, m.release_date AS movie_release_date, 
                   m.genre AS movie_genre, m.poster_url AS movie_poster_url, 
                   a.id AS actor_id, a.name AS actor_name, a.age AS actor_age, a.gender AS actor_gender
            FROM movies m
            INNER JOIN movie_actors ma ON m.id = ma.movie_id
            INNER JOIN actors a ON ma.actor_id = a.id
        `;
        const result = await client.query(query);

        // Organize the data into an object where each movie contains associated actors
        const moviesWithActors = {};
        result.rows.forEach(row => {
            const movieId = row.movie_id;
            const actorDetails = {
                id: row.actor_id,
                name: row.actor_name,
                age: row.actor_age,
                gender: row.actor_gender
            };

            if (!moviesWithActors[movieId]) {
                moviesWithActors[movieId] = {
                    id: movieId,
                    title: row.movie_title,
                    description: row.movie_description,
                    release_date: row.movie_release_date,
                    genre: row.movie_genre,
                    poster_url: row.movie_poster_url,
                    actors: [actorDetails]
                };
            } else {
                moviesWithActors[movieId].actors.push(actorDetails);
            }
        });

        // Convert the object into an array of movies with associated actors
        const moviesWithActorsArray = Object.values(moviesWithActors);

        res.status(200).json({ success: true, moviesWithActors: moviesWithActorsArray });
    } catch (error) {
        console.error('Error fetching association details of actors with movies:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// API endpoint to get association details of actors with a specific movie by its ID
app.get('/api/movies/:movieId/actors', async (req, res) => {

    const movieId = parseInt(req.params.movieId);
    try {
        // Query to fetch association details of actors with the specified movie
        const query = `
            SELECT m.id AS movie_id, m.title AS movie_title, m.description AS movie_description, 
                   m.release_date AS movie_release_date, m.genre AS movie_genre,
                   a.id AS actor_id, a.name AS actor_name, a.age AS actor_age, a.gender AS actor_gender
            FROM movies m
            INNER JOIN movie_actors ma ON m.id = ma.movie_id
            INNER JOIN actors a ON a.id = ma.actor_id
            WHERE m.id = $1
        `;
        const result = await client.query(query, [movieId]);

        // Extract movie details and association details of actors
        const movieDetails = {
            id: result.rows[0].movie_id,
            title: result.rows[0].movie_title,
            description: result.rows[0].movie_description,
            release_date: result.rows[0].movie_release_date,
            genre: result.rows[0].movie_genre
        };
        const actors = result.rows.map(row => ({
            id: row.actor_id,
            name: row.actor_name,
            age: row.actor_age,
            gender: row.actor_gender
        }));

        // Return movie details and association details of actors with the specified movie
        res.status(200).json({ success: true, movie: movieDetails, actors });
    } catch (error) {
        console.error('Error fetching association details of actors with movie by ID:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

app.get('/api/actors/:actodId/movies', async (req, res) => {
    const actorId = parseInt(req.params.actodId);

    try {
        // Query to fetch all movies associated with the specified actor along with actor details
        const query = `
            SELECT m.id AS movie_id, m.title AS movie_title, m.description AS movie_description, 
                   m.release_date AS movie_release_date, m.genre AS movie_genre,
                   a.id AS actor_id, a.name AS actor_name, a.age AS actor_age, a.gender AS actor_gender
            FROM movies m
            INNER JOIN movie_actors ma ON m.id = ma.movie_id
            INNER JOIN actors a ON a.id = ma.actor_id
            WHERE a.id = $1
        `;
        const result = await client.query(query, [actorId]);

        // Extract movie and actor details associated with the actor
        const movies = result.rows.map(row => ({
            id: row.movie_id,
            title: row.movie_title,
            description: row.movie_description,
            release_date: row.movie_release_date,
            genre: row.movie_genre,
        }));

        // Extract actor details
        const actorDetails = {
            id: result.rows[0].actor_id,
            name: result.rows[0].actor_name,
            age: result.rows[0].actor_age,
            gender: result.rows[0].actor_gender
        };

        // Return movies associated with the specified actor along with actor details
        res.status(200).json({ success: true, actor: actorDetails, movies });
    } catch (error) {
        console.error('Error fetching movies by actor ID:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
