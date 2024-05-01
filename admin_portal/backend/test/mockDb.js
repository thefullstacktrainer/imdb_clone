// mockDb.js

const getClient = () => {
    // Mock implementation of the database client
    return {
        query: jest.fn().mockResolvedValue({
            rows: [{ id: 1, title: 'Test Movie', description: 'Test Description', genre: 'Test Genre', poster_url: 'https://example.com/test.jpg' }]
        })
    };
};


const connect = jest.fn(); // Mock the connect function

module.exports = {
    getClient,
    connect,
};
