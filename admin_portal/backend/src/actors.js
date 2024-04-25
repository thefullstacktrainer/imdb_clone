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
        const { name, age, gender, bio } = req.body;

        // Insert actor details into the actors table
        const query = `
            INSERT INTO actors (name, age, gender, bio)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [name, age, gender, bio];
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
    const { name, age, gender, bio } = req.body;

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
            SET name = $1, age = $2, gender = $3, bio = $4, updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
        `;
        const updateValues = [name, age, gender, bio, actorId];
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

// Export the router
module.exports = router;