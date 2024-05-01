const getClient = () => {
    // Mock implementation of the database client
    return {
        query: jest.fn(),
    };
};

const connect = jest.fn(); // Mock the connect function

module.exports = {
    getClient,
    connect,
};
