const express = require('express');
const bodyParser = require('body-parser');
const { getClient } = require('./db'); // Import getClient from db.js
const cors = require('cors');
const router = express.Router();

router.use(bodyParser.json());
router.use(cors());

// Connect to PostgreSQL database
const client = getClient(); // Get the PostgreSQL client

// API endpoint to store movie details
router.post('/', async (req, res) => {
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

/**
 * @swagger
 * /api/movies:
 *  get:
 *    description: API to Get All Movies
 *    responses:
 *      '200':
 *        description: A successful response
 */
// GET endpoint to fetch all movies
router.get('/', async (req, res) => {
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
router.get('/:id', async (req, res) => {
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
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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

// API endpoint to update associations between actors and a movie
router.put('/:movieId/actors', async (req, res) => {
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


// API endpoint to get association details of actors with a specific movie by its ID
router.get('/:movieId/actors', async (req, res) => {

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


// API endpoint to associate multiple actors with a movie
router.post('/:movieId/actors', async (req, res) => {
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

module.exports = router;
