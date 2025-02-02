const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const fetchUser = async (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    console.log('Token from request:', token);

    if (!token) return res.status(401).json({ error: 'No token found' });

    if (token.startsWith('gho_')) {
        try {
            const githubUser = await axios.get('https://api.github.com/user', {
                headers: {
                    Authorization: `token ${token}`,
                },
            });
       
            const emailResponse = await axios.get('https://api.github.com/user/emails', {
                headers: {
                    Authorization: `token ${token}`,
                },
            });

            const { id, login, avatar_url, email, bio, name } = githubUser.data;

            // Find a valid primary email
            const primaryEmail = emailResponse.data.find(email => email.primary)?.email || 'No email provided';

            let user = await User.findOne({ githubId: id });
            if (!user) {
                user = await User.create({
                    githubId: id,
                    name: name || login || 'No name provided',
                    email: primaryEmail,
                    profilePicture: avatar_url || '',
                    bio: bio || 'No bio provided',
                    password: '',
                    interest: ''
                });
            } else {
                // Update user with profile picture, bio, name, and email if they were missing before
                user.email = user.email || primaryEmail;
                user.name = user.name || name || login || 'No name provided';
                user.profilePicture = user.profilePicture || avatar_url || '';
                user.bio = user.bio || bio || 'No bio provided';
                user.interest = user.interest || '';
                await user.save();
            }

            req.user = user;
            next();
        } catch (error) {
            console.error('GitHub token verification failed:', error.message);
            return res.status(401).json({ error: 'Invalid GitHub token' });
        }
    } else {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            console.log('Decoded token:', decoded);

            // Access userId correctly from the decoded token
            const userId = decoded.id || decoded.userId;
            req.user = await User.findById(userId);
            console.log('User from decoded token:', req.user);
    
            if (!req.user) {
                return res.status(404).json({ error: 'User not found' });
            }
            if (req.user.isAdmin) {
                req.isAdmin = true;
            }
            next();
        } catch (error) {
            console.error('JWT verification failed:', error.message);
            return res.status(401).json({ error: 'Invalid token' });
        }
    }
};


module.exports = fetchUser;
