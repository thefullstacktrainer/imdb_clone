import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import './Signup.css'; // Import the CSS file

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [errorDialogVisible, setErrorDialogVisible] = useState(false); // State to control the display of error dialog
    const navigate = useNavigate(); // Get the navigate function from react-router-dom
    const apiUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:4001"; // Define apiUrl

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${apiUrl}/api/signup`, formData); // Use apiUrl in the API call
            console.log('Signup successful', response.data);
            // Handle successful signup (e.g., redirect to login page)
            navigate('/login'); // Redirect to the login page after successful signup
        } catch (error) {
            console.error('Error signing up:', error.response.data.error);
            setErrorDialogVisible(true); // Show error dialog on signup error
        }
    };

    const handleDialogClose = () => {
        setErrorDialogVisible(false); // Close the error dialog
    };

    return (
        <div className="signup-container">
            <h2 className="signup-title">Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} />
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Sign Up
                </button>
            </form>
            {/* Error Dialog */}
            {errorDialogVisible && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg">
                        <h2 className="text-2xl font-semibold mb-4">Error</h2>
                        <p className="text-gray-700 mb-4">There was an error during sign up. Please try again.</p>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleDialogClose}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Signup;
