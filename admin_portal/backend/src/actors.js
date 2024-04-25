const express = require('express');
const bodyParser = require('body-parser');
const { getClient } = require('./db'); // Import getClient from db.js
const cors = require('cors');
const router = express.Router();

router.use(bodyParser.json());
router.use(cors());

// Connect to PostgreSQL database
const client = getClient(); // Get the PostgreSQL client

// POST endpoint to add a new actor
router.post('/', async (req, res) => {
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
router.get('/', async (req, res) => {
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
router.get('/:id', async (req, res) => {
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
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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


router.get('/:actodId/movies', async (req, res) => {
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

// Export the router
module.exports = router;
