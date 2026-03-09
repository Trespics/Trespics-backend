const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
require('dotenv').config();

const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if admin already exists
    const { data: existingAdmin, error: fetchError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create admin
    const { data: newAdmin, error: insertError } = await supabase
      .from('admins')
      .insert([{ 
        full_name: fullName, 
        email, 
        password_hash: passwordHash,
        username: email // Using email as username for now or we can add username field
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    const token = jwt.sign({ id: newAdmin.id, email: newAdmin.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, admin: { id: newAdmin.id, fullName: newAdmin.full_name, email: newAdmin.email } });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const identifier = username || email;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Username/Email and password are required' });
    }

    // Check against DB first (search by email or username)
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .or(`email.eq.${identifier},username.eq.${identifier}`)
      .single();

    if (admin) {
      const isMatch = await bcrypt.compare(password, admin.password_hash);
      if (isMatch) {
        const token = jwt.sign({ id: admin.id, email: admin.email, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token, admin: { id: admin.id, fullName: admin.full_name, email: admin.email, username: admin.username } });
      }
    }

    // Fallback to env variables (for initial setup)
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@trespics.com';
    const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

    if (identifier === ADMIN_USERNAME || identifier === ADMIN_EMAIL) {
      const isMatch = ADMIN_PASSWORD_HASH 
        ? await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
        : password === 'trespics2026';

      if (isMatch) {
        const token = jwt.sign({ username: ADMIN_USERNAME, email: ADMIN_EMAIL }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token });
      }
    }

    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, register };
