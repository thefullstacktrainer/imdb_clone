// Actors.js
import React, { useState, useEffect } from 'react';
import ActorAddUpdateForm from './ActorAddUpdateForm'; // You'll need to create this component
import axios from 'axios';

const Actors = () => {
    const [actors, setActors] = useState([]);
    const [updateActor, setUpdateActor] = useState(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [actorToDelete, setActorToDelete] = useState(null);
    const apiUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";
    useEffect(() => {
        fetchActors();
    }, []);

    const fetchActors = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/actors`);
            setActors(response.data.actors);
        } catch (error) {
            console.error('Error fetching actors:', error);
        }
    };

    const handleAddOrUpdateActor = async () => {
        setUpdateActor(null);
        await fetchActors();
    };

    const handleCancel = () => {
        setUpdateActor(null);
        setShowConfirmationModal(false); // Ensure the modal is closed when canceling
    };

    const handleDeleteActor = async (id) => {
        setActorToDelete(id);
        setShowConfirmationModal(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`${apiUrl}/api/actors/${actorToDelete}`);
            await fetchActors();
        } catch (error) {
            console.error('Error deleting actor:', error);
        }
        setShowConfirmationModal(false);
        setActorToDelete(null);
    };

    const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
        return (
            <div className={`${isOpen ? '' : 'hidden'} fixed z-50 inset-0 overflow-y-auto`}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="fixed inset-0 bg-black opacity-50"></div>
                    <div className="bg-white rounded-lg p-8 mx-auto z-50">
                        <div className="text-center mb-4">{message}</div>
                        <div className="flex justify-center">
                            <button onClick={onConfirm} className="bg-red-500 text-white py-2 px-4 rounded-md mr-2">Confirm</button>
                            <button onClick={onClose} className="bg-gray-400 text-white py-2 px-4 rounded-md">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div><h1 className="text-3xl font-semibold mb-6">Actors</h1></div>
            <ActorAddUpdateForm actor={updateActor} onUpdate={handleAddOrUpdateActor} onCancel={handleCancel} />
            <div className="mt-8">
                {actors.map((actor) => (
                    <div key={actor.id} className="bg-white shadow-md rounded-md p-4 mb-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-semibold">{actor.name}</h2>
                                <p className="text-gray-700">{actor.bio}</p>
                            </div>
                            <div>
                                <p className="text-gray-700">Age: {actor.age}</p>
                                <p className="text-gray-700">Gender: {actor.gender}</p>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-between">
                            <button className="bg-blue-500 text-white py-2 px-4 rounded-md" onClick={() => setUpdateActor(actor)}>Update</button>
                            <button className="bg-red-500 text-white py-2 px-4 rounded-md" onClick={() => handleDeleteActor(actor.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
            <ConfirmationModal
                isOpen={showConfirmationModal}
                onClose={() => setShowConfirmationModal(false)}
                onConfirm={confirmDelete}
                message="Are you sure you want to delete this actor?"
            />
        </div>
    );
};

export default Actors;
