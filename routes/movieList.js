const express = require('express');
const MovieList = require('../models/movie');
const jwt = require('jsonwebtoken');
const router = express.Router();

const auth = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }
    
    const accessToken = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SEC);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Token is not valid' });
    }
};


router.get('/', auth, async (req, res) => {
    try {
        console.log('User ID:', req.user.id);
        const lists = await MovieList.find({ userId: req.user.id });
        res.json(lists);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const list = await MovieList.findById(req.params.id);
        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }
        if (!list.isPublic && (!req.user || req.user.id !== list.userId.toString())) {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json(list);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', auth, async (req, res) => {
    const { name, public } = req.body;
    console.log('Create List Request:', req.body); 
    try {
        const newList = new MovieList({ 
            name, 
            userId: req.user.id, 
            movies: [], 
            isPublic: public 
        });
        await newList.save();
        res.json(newList);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/:id', auth, async (req, res) => {
    const {movies} = req.body;
    try {
        const updatedList = await MovieList.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { movies: { $each: movies } } },
            { new: true }
        );
        res.json(updatedList);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        await MovieList.findByIdAndDelete(req.params.id);
        res.json({ message: 'List deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
