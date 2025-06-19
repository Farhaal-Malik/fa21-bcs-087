import mongoose from 'mongoose';


const movieSchema = new mongoose.Schema({}, { collection: 'sample_mflix/movies' });
export const Movie = mongoose.model('Movie', movieSchema);