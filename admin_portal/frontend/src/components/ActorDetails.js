// ActorDetails.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ActorDetails.css'; // Import the CSS file

const ActorDetails = () => {
    const { id } = useParams();
    const [actor, setActor] = useState(null);
    const apiUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

    useEffect(() => {
        const fetchActor = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/actors/${id}`);
                setActor(response.data.actor);
            } catch (error) {
                console.error('Error fetching actor:', error);
            }
        };

        fetchActor();
    }, [id, apiUrl]);

    return (
        <div className="container">
            {actor && (
                <div className="actor-details">
                    <h1>{actor.name}</h1>
                    <p>{actor.bio}</p>
                    <p>Age: {actor.age}</p>
                    <p>Gender: {actor.gender}</p>
                </div>
            )}
        </div>
    );
};

export default ActorDetails;
