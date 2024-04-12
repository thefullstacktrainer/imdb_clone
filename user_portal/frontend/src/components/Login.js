import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import './Login.css'; // Import the CSS file

const Login = () => {
    const [formData, setFormData] = useState({
        usernameOrEmail: '', // Change the state field name to usernameOrEmail
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
            const response = await axios.post(`${apiUrl}/api/login`, formData); // Use apiUrl in the API call
            console.log('Login successful', response.data);
            // Handle successful login (e.g., redirect to dashboard)
            navigate('/'); // Redirect to the dashboard page
        } catch (error) {
            console.error('Error logging in:', error.response.data.error);
            setErrorDialogVisible(true); // Show error dialog on login error
        }
    };

    const handleDialogClose = () => {
        setErrorDialogVisible(false); // Close the error dialog
    };

    return (
        <div className="login-container">
            <h2 className="login-title">Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="usernameOrEmail">Email or Username</label> {/* Change label text */}
                    <input type="text" id="usernameOrEmail" name="usernameOrEmail" value={formData.usernameOrEmail} onChange={handleChange} /> {/* Change input type */}
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} />
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Login
                </button>

            </form>
            {/* Error Dialog */}
            {errorDialogVisible && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg">
                        <h2 className="text-2xl font-semibold mb-4">Error</h2>
                        <p className="text-gray-700 mb-4">There was an error during login. Please try again.</p>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleDialogClose}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
