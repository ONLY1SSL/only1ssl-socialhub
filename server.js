// server.js const express = require('express'); const mongoose = require('mongoose'); const cors = require('cors'); const dotenv = require('dotenv'); const authRoutes = require('./routes/authRoutes'); const productRoutes = require('./routes/productRoutes'); const walletRoutes = require('./routes/walletRoutes');

dotenv.config();

const app = express(); app.use(cors()); app.use(express.json());

// Routes app.use('/api/auth', authRoutes); app.use('/api/products', productRoutes); app.use('/api/wallet', walletRoutes);

const PORT = process.env.PORT || 5000;

mongoose .connect(process.env.MONGO_URI) .then(() => { app.listen(PORT, () => console.log(Server running on port ${PORT})); }) .catch(err => console.error(err));

// models/User.js const mongoose = require('mongoose'); const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({ username: { type: String, required: true, unique: true }, email: { type: String, required: true, unique: true }, password: { type: String, required: true }, role: { type: String, enum: ['user', 'admin'], default: 'user' }, balance: { type: Number, default: 0 } });

userSchema.pre('save', async function (next) { if (!this.isModified('password')) return next(); this.password = await bcrypt.hash(this.password, 10); next(); });

userSchema.methods.comparePassword = function (password) { return bcrypt.compare(password, this.password); };

module.exports = mongoose.model('User', userSchema);

// routes/authRoutes.js const express = require('express'); const router = express.Router(); const { register, login } = require('../controllers/authController');

router.post('/register', register); router.post('/login', login);

module.exports = router;

// controllers/authController.js const jwt = require('jsonwebtoken'); const User = require('../models/User');

const createToken = (user) => { return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' }); };

exports.register = async (req, res) => { const { username, email, password } = req.body; try { const user = new User({ username, email, password }); await user.save(); const token = createToken(user); res.status(201).json({ token }); } catch (err) { res.status(400).json({ error: 'Registration failed', details: err.message }); } };

exports.login = async (req, res) => { const { email, password } = req.body; try { const user = await User.findOne({ email }); if (!user || !(await user.comparePassword(password))) { return res.status(401).json({ error: 'Invalid credentials' }); } const token = createToken(user); res.status(200).json({ token }); } catch (err) { res.status(500).json({ error: 'Login failed', details: err.message }); } };

  
