const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  profession: { type: String, enum: ['lekarz', 'pielęgniarka', 'ratownik'] },
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
});

const storySchema = new mongoose.Schema({
  content: String,
  specialization: String,
  location: { type: String, enum: ['SOR', 'Oddział szpitalny', 'Przychodnia POZ'] },
  type: { type: String, enum: ['własne doświadczenie', 'zasłyszane'] },
  tags: [String],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reactions: { funny: { type: Number, default: 0 }, shocking: { type: Number, default: 0 }, embarrassing: { type: Number, default: 0 } },
});

const commentSchema = new mongoose.Schema({
  content: String,
  story: { type: mongoose.Schema.Types.ObjectId, ref: 'Story' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
});

const reportSchema = new mongoose.Schema({
  type: String,
  description: String,
  target: mongoose.Schema.Types.ObjectId,
  status: String,
});

const User = mongoose.model('User', userSchema);
const Story = mongoose.model('Story', storySchema);
const Comment = mongoose.model('Comment', commentSchema);
const Report = mongoose.model('Report', reportSchema);

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).send('Access denied');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send('Invalid token');
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).send('Admin access required');
  next();
};

// Rejestracja
app.post('/api/register', async (req, res) => {
  const { email, password, profession } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashed, profession });
  await user.save();
  res.send('User registered, awaiting verification');
});

// Logowanie
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.status !== 'verified' || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).send('Invalid credentials or not verified');
  }
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
  res.send({ token });
});

// Dodaj historię
app.post('/api/stories', authenticate, async (req, res) => {
  const story = new Story({ ...req.body, author: req.user.id });
  await story.save();
  res.send('Story submitted for moderation');
});

// Get feed
app.get('/api/stories', authenticate, async (req, res) => {
  const { sort = 'latest', specialization, location, type } = req.query;
  let query = { status: 'approved' };
  if (specialization) query.specialization = specialization;
  if (location) query.location = location;
  if (type) query.type = type;
  const stories = await Story.find(query)
    .sort(sort === 'best' ? { 'reactions.total': -1 } : { date: -1 })
    .limit(10);
  res.send(stories.map(s => ({ ...s.toObject(), author: `${s.profession ? s.profession.slice(0,4) : 'Anon'}. Anonimowy` })));
});

// Reakcje
app.post('/api/stories/:id/react', authenticate, async (req, res) => {
  const { type } = req.body;
  const story = await Story.findById(req.params.id);
  story.reactions[type] += 1;
  await story.save();
  res.send('Reaction added');
});

// Komentarze - dodaj
app.get('/api/comments/:storyId', authenticate, async (req, res) => {
  const comments = await Comment.find({ story: req.params.storyId }).sort({ date: -1 });
  res.send(comments.map(c => ({ ...c.toObject(), author: 'Anonimowy' })));
});

app.post('/api/comments', authenticate, async (req, res) => {
  const comment = new Comment({ ...req.body, author: req.user.id });
  await comment.save();
  res.send('Comment added');
});

// Admin - pending users
app.get('/api/admin/pending-users', authenticate, isAdmin, async (req, res) => {
  const users = await User.find({ status: 'pending' });
  res.send(users);
});

app.post('/api/admin/verify-user/:id', authenticate, isAdmin, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { status: 'verified' });
  res.send('User verified');
});

// Admin - pending stories
app.get('/api/admin/pending-stories', authenticate, isAdmin, async (req, res) => {
  const stories = await Story.find({ status: 'pending' });
  res.send(stories);
});

app.post('/api/admin/approve-story/:id', authenticate, isAdmin, async (req, res) => {
  await Story.findByIdAndUpdate(req.params.id, { status: 'approved' });
  res.send('Story approved');
});

// Admin - reports
app.get('/api/admin/reports', authenticate, isAdmin, async (req, res) => {
  const reports = await Report.find();
  res.send(reports);
});

app.post('/api/reports', authenticate, async (req, res) => {
  const report = new Report(req.body);
  await report.save();
  res.send('Report submitted');
});

app.listen(5000, () => console.log('Server running on 5000'));
