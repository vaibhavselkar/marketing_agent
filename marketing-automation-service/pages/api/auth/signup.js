import connectDB from '../../../lib/db.js';
import User from '../../../lib/models/User.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  try {
    await connectDB();
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'An account with this email already exists' });

    const user = await User.create({ name, email, password });
    res.status(201).json({ success: true, userId: user._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
