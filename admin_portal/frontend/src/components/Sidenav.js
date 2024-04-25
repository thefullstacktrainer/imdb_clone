import React from 'react';
import { Link } from 'react-router-dom';

const Sidenav = () => {
    return (
        <div className={`fixed inset-y-0 left-0 w-64 bg-gray-800 text-white transition duration-300 ease-in-out transform lg:translate-x-0 lg:block hidden`}>
            <div className="flex justify-between items-center p-4">
                <h1 className="text-2xl font-bold">IMDB</h1>
            </div>
            <div className="mt-4">
                <Link to="/movies" className="block px-4 py-2 text-lg text-white hover:bg-gray-700">Movies</Link>
            </div>
            <div className="mt-4">
                <Link to="/actors" className="block px-4 py-2 text-lg text-white hover:bg-gray-700">Actors</Link>
            </div>
        </div>
    );
};

export default Sidenav;
