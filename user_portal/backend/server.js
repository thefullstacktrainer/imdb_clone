// server.js

const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables from .env file
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4001;

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

// Helper function to hash passwords
const hashPassword = async (password) => {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
};

// Helper function to compare passwords
const comparePasswords = async (plainPassword, hashedPassword) => {
    return bcrypt.compare(plainPassword, hashedPassword);
};

// Helper function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
        }
        req.userId = decoded.userId;
        next();
    });
};

// GET endpoint to fetch all movies with average rating
app.get('/api/public/movies', async (req, res) => {
    try {
        // Query to fetch all movies with their average ratings
        const query = `
            SELECT m.*, COALESCE(CAST(AVG(r.rating) AS NUMERIC(10, 2)), 0) AS rating
            FROM movies m
            LEFT JOIN movie_ratings r ON m.id = r.movie_id
            GROUP BY m.id
        `;
        const result = await client.query(query);

        // Return the list of movies with average ratings as the response
        const movies = result.rows;
        res.status(200).json({ success: true, movies });
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// POST endpoint for user registration (signup)
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if the username or email already exists
        const userExistsQuery = 'SELECT * FROM users WHERE username = $1 OR email = $2';
        const userExistsResult = await client.query(userExistsQuery, [username, email]);
        if (userExistsResult.rows.length > 0) {
            return res.status(400).json({ success: false, error: 'Username or email already exists' });
        }

        // Insert the new user into the users table
        const createUserQuery = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *';
        const hashedPassword = await hashPassword(password);
        const createUserResult = await client.query(createUserQuery, [username, email, hashedPassword]);

        const newUser = createUserResult.rows[0];
        const token = generateToken(newUser.id);
        res.status(201).json({ success: true, user: newUser, token });
    } catch (error) {
        console.error('Error signing up:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// POST endpoint for user authentication (login)
app.post('/api/login', async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body;

        // Check if the username or email exists
        const getUserQuery = 'SELECT * FROM users WHERE username = $1 OR email = $2';
        const getUserResult = await client.query(getUserQuery, [usernameOrEmail, usernameOrEmail]);
        const user = getUserResult.rows[0];
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid username or email or password' });
        }

        // Compare the provided password with the hashed password stored in the database
        const passwordMatch = await comparePasswords(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, error: 'Invalid username or email or password' });
        }

        // Generate JWT token and return it along with user information
        const token = generateToken(user.id);
        res.status(200).json({ success: true, user, token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// POST endpoint to add or update a rating for a movie
app.post('/api/movies/:movieId/rating', verifyToken, async (req, res) => {
    try {
        const { movieId } = req.params;
        const { rating } = req.body;
        const userId = req.userId;

        // Check if the rating is a valid number
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, error: 'Invalid rating. Rating must be an integer between 1 and 5.' });
        }

        // Check if the user has already rated the movie
        const existingRatingQuery = 'SELECT * FROM movie_ratings WHERE movie_id = $1 AND user_id = $2';
        const existingRatingResult = await client.query(existingRatingQuery, [movieId, userId]);

        if (existingRatingResult.rows.length > 0) {
            // User has already rated the movie, update the existing rating
            const updateRatingQuery = 'UPDATE movie_ratings SET rating = $1 WHERE movie_id = $2 AND user_id = $3 RETURNING *';
            const updateRatingResult = await client.query(updateRatingQuery, [rating, movieId, userId]);
            const updatedRating = updateRatingResult.rows[0];
            return res.status(200).json({ success: true, rating: updatedRating });
        }

        // Insert a new rating into the movie_ratings table
        const insertRatingQuery = 'INSERT INTO movie_ratings (movie_id, user_id, rating) VALUES ($1, $2, $3) RETURNING *';
        const insertRatingResult = await client.query(insertRatingQuery, [movieId, userId, rating]);
        const newRating = insertRatingResult.rows[0];
        res.status(201).json({ success: true, rating: newRating });
    } catch (error) {
        console.error('Error adding or updating rating:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
