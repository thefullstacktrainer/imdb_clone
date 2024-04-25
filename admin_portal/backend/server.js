const express = require('express');
const bodyParser = require('body-parser');
const db = require('./src/db');
const moviesRouter = require('./src/movies');
const actorsRouter = require('./src/actors');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to PostgreSQL database
db.connect();
const client = db.getClient(); // Get the PostgreSQL client
// Mount the movie and actor routers
app.use('/api/movies', moviesRouter);
app.use('/api/actors', actorsRouter);

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

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
