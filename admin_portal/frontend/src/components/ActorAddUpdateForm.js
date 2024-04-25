import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ActorAddUpdateForm = ({ actor, onUpdate, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
    });
    const apiUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

    useEffect(() => {
        if (actor) {
            setFormData({
                name: actor.name,
                bio: actor.bio,
            });
        }
    }, [actor]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (actor) {
                await axios.put(`${apiUrl}/api/actors/${actor.id}`, formData);
            } else {
                await axios.post(`${apiUrl}/api/actors`, formData);
            }
            onUpdate();
            setFormData({
                name: '',
                bio: '',
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleCancel = () => {
        onCancel();
        setFormData({
            name: '',
            bio: '',
        });
    };

    return (
        <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-semibold mb-4">{actor ? 'Update Actor' : 'Add Actor'}</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
                <textarea name="bio" placeholder="Bio" value={formData.bio} onChange={handleChange} required className="mt-4 p-2 border border-gray-300 rounded-md w-full" ></textarea>
                <div className="mt-4 flex justify-end">
                    <button type="button" className="bg-gray-400 text-white py-2 px-4 rounded-md mr-2" onClick={handleCancel}>Cancel</button>
                    <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">{actor ? 'Update Actor' : 'Add Actor'}</button>
                </div>
            </form>
        </div>
    );
};

export default ActorAddUpdateForm;
