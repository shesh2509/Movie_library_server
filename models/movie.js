const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MovieSchema = new Schema({
  imdbID: { type: String, required: true },
  title: { type: String, required: true },
  poster: { type: String },
  type: {type: String},
  year: {type: String}
});

const MovieListSchema = new Schema({
  name: { type: String, required: true },
  movies: [MovieSchema],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  isPublic: { type: Boolean, default: false }
});

module.exports = mongoose.model('MovieList', MovieListSchema);
