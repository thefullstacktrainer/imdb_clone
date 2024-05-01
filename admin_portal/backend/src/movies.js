const express = require('express');
const bodyParser = require('body-parser');
const { getClient } = require('./db'); // Import getClient from db.js
const cors = require('cors');
const router = express.Router();

router.use(bodyParser.json());
router.use(cors());

// Connect to PostgreSQL database
const client = getClient(); // Get the PostgreSQL client

// Define the Movie schema
/**
 * @swagger
 * components:
 *   schemas:
 *     Movie:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier of the movie
 *         rating:
 *           type: number
 *           nullable: true
 *           description: The rating of the movie
 *         title:
 *           type: string
 *           description: The title of the movie
 *         description:
 *           type: string
 *           description: A brief description of the movie
 *         release_date:
 *           type: string
 *           format: date-time
 *           description: The release date of the movie
 *         genre:
 *           type: string
 *           description: The genre(s) of the movie
 *         poster_url:
 *           type: string
 *           format: uri
 *           description: The URL to the poster image of the movie
 *         created_by:
 *           type: string
 *           nullable: true
 *           description: The creator of the movie entry
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The creation timestamp of the movie entry
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The last update timestamp of the movie entry
 */

// API endpoint to store movie details
/**
 * @swagger
 * /api/movies:
 *   post:
 *     summary: Add a new movie
 *     description: Add a new movie with title, description, release date, genre, and poster URL.
 *     tags: [Movies]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the movie.
 *               description:
 *                 type: string
 *                 description: A brief description of the movie.
 *               release_date:
 *                 type: string
 *                 format: date-time
 *                 description: The release date of the movie.
 *               genre:
 *                 type: string
 *                 description: The genre(s) of the movie.
 *               poster_url:
 *                 type: string
 *                 format: uri
 *                 description: The URL to the poster image of the movie.
 *     responses:
 *       201:
 *         description: Movie created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the request was successful.
 *                 movie:
 *                   $ref: '#/components/schemas/Movie'
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the request was successful.
 *                 error:
 *                   type: string
 *                   description: Error message.
 */
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
 *   get:
 *     summary: Get a list of movies
 *     description: Returns a list of movies
 *     responses:
 *       200:
 *         description: A list of movies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the request was successful
 *                 movies:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Movie'
 *     tags:
 *       - Movies
 *     security:
 *       - apiKeyAuth: []
 *     examples:
 *       application/json:
 *         success: true
 *         movies:
 *           - id: 1
 *             rating: null
 *             title: "The Shawshank Redemption"
 *             description: "Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion."
 *             release_date: "1994-01-09T18:30:00.000Z"
 *             genre: "Drama"
 *             poster_url: "https://m.media-amazon.com/images/M/MV5BMTM0NjUxMDk5MF5BMl5BanBnXkFtZTcwNDMxNDY3Mw@@._V1_FMjpg_UX1800_.jpg"
 *             created_by: null
 *             created_at: "2024-04-13T02:08:26.278Z"
 *             updated_at: "2024-04-26T14:27:11.382Z"
 *           - id: 2
 *             rating: null
 *             title: "Life Is Beautiful"
 *             description: "When an open-minded Jewish waiter and his son become victims of the Holocaust, he uses a perfect mixture of will, humor and imagination to protect his son from the dangers around their camp."
 *             release_date: "1997-07-29T18:30:00.000Z"
 *             genre: "Romance, Drama, Comedy"
 *             poster_url: "https://m.media-amazon.com/images/M/MV5BMjE3MTM0Mjg2NV5BMl5BanBnXkFtZTYwOTI1NDM3._V1_FMjpg_UX480_.jpg"
 *             created_by: null
 *             created_at: "2024-04-13T02:09:57.349Z"
 *             updated_at: "2024-04-26T14:28:39.169Z"
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

/**
 * @swagger
 * /api/movies/{id}:
 *   get:
 *     summary: Get a movie by ID
 *     description: Fetches details of a movie by its unique identifier.
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the movie to fetch
 *         schema:
 *           type: integer
 *           format: int64
 *     responses:
 *       '200':
 *         description: Movie details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the request was successful
 *                 movie:
 *                   $ref: '#/components/schemas/Movie'
 *       '404':
 *         description: Movie not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the request was successful
 *                 error:
 *                   type: string
 *                   description: Error message indicating movie not found
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the request was successful
 *                 error:
 *                   type: string
 *                   description: Error message indicating internal server error
 */
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
