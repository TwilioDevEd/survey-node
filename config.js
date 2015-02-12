module.exports = {
    // HTTP port
    port: process.env.PORT || 3000,

    // MongoDB connection string - MONGO_URL is for local dev,
    // MONGOLAB_URI is for the MongoLab add-on for Heroku deployment
    mongoUrl: process.env.MONGOLAB_URI || process.env.MONGO_URL
};