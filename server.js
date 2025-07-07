const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const Stripe = require('stripe');
const adminRoutes = require('./admin/routes/adminroutes');

const stripe = Stripe('sk_test_your_stripe_secret_key'); // Replace with your Stripe secret key

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session middleware
app.use(session({
  secret: 'your_session_secret', // Replace with a secure secret in production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Replace with your MySQL username
  password: '', // Replace with your MySQL password
  database: 'dinner_o_clock'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected');
});

// Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'Uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Admin routes
app.use('/api/admin', adminRoutes);

// API endpoint for login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const user = results[0];
    req.session.user = { id: user.id, name: user.name, email: user.email, address: user.address, phone: user.phone };
    res.json({ message: 'Login successful', user: req.session.user });
  });
});

// API endpoint for logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Failed to log out' });
    res.json({ message: 'Logout successful' });
  });
});

// API endpoint for getting current user
app.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});

// API endpoint for updating user profile
app.post('/api/user/update', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const { name, email, address, phone } = req.body;
  if (!name || !email || !address || !phone) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (!/^\d{3}-\d{3}-\d{4}$/.test(phone)) {
    return res.status(400).json({ error: 'Invalid phone number format (use 123-456-7890)' });
  }
  const checkEmailSql = 'SELECT id FROM users WHERE email = ? AND id != ?';
  db.query(checkEmailSql, [email, req.session.user.id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const updateSql = 'UPDATE users SET name = ?, email = ?, address = ?, phone = ? WHERE id = ?';
    db.query(updateSql, [name, email, address, phone, req.session.user.id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      req.session.user = { ...req.session.user, name, email, address, phone };
      res.json({ message: 'Profile updated successfully', user: req.session.user });
    });
  });
});

// API endpoint for user signup
app.post('/api/signup', (req, res) => {
  const { name, email, password, address, phone } = req.body;
  if (!name || !email || !password || !address || !phone) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  if (!/^\d{3}-\d{3}-\d{4}$/.test(phone)) {
    return res.status(400).json({ error: 'Invalid phone number format (use 123-456-7890)' });
  }
  const checkEmailSql = 'SELECT id FROM users WHERE email = ?';
  db.query(checkEmailSql, [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const sql = 'INSERT INTO users (name, email, password, address, phone) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, email, password, address, phone], (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'User registered successfully' });
    });
  });
});

// API endpoint for all menu items
app.get('/api/menu', (req, res) => {
  const sql = 'SELECT * FROM menu_items WHERE is_active = TRUE';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// API endpoint for featured menu items
app.get('/api/featured-menu', (req, res) => {
  const sql = 'SELECT * FROM menu_items WHERE is_active = TRUE AND is_featured = TRUE LIMIT 3';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// API endpoint for testimonials
app.get('/api/testimonials', (req, res) => {
  const sql = 'SELECT content, rating FROM testimonials WHERE is_active = TRUE LIMIT 3';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// API endpoint for promotions
app.get('/api/promotions', (req, res) => {
  const sql = 'SELECT title, description, image_url FROM promotions WHERE is_active = TRUE LIMIT 2';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// API endpoint for newsletter signup
app.post('/api/newsletter', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  res.json({ message: 'Subscribed successfully!' });
});

// API endpoint for order submission
app.post('/api/orders', (req, res) => {
  const { user_id, order_date, delivery_type, total_price, address, items, payment_method, payment_intent_id } = req.body;
  if (!user_id || !order_date || !delivery_type || !total_price || !items || items.length === 0 || !payment_method) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.beginTransaction(err => {
    if (err) return res.status(500).json({ error: 'Database error' });
    const orderSql = 'INSERT INTO orders (user_id, order_date, delivery_type, total_price, address) VALUES (?, ?, ?, ?, ?)';
    db.query(orderSql, [user_id, order_date, delivery_type, total_price, address], (err, result) => {
      if (err) {
        db.rollback();
        return res.status(500).json({ error: 'Database error' });
      }
      const orderId = result.insertId;
      const itemSql = 'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES ?';
      const itemValues = items.map(item => [orderId, item.menu_item_id, item.quantity, item.price]);
      db.query(itemSql, [itemValues], (err) => {
        if (err) {
          db.rollback();
          return res.status(500).json({ error: 'Database error' });
        }
        const paymentSql = 'INSERT INTO payments (order_id, payment_method, payment_status, payment_intent_id, amount) VALUES (?, ?, ?, ?, ?)';
        const paymentStatus = payment_method === 'cod' ? 'pending' : 'completed';
        db.query(paymentSql, [orderId, payment_method, paymentStatus, payment_intent_id || null, total_price], (err) => {
          if (err) {
            db.rollback();
            return res.status(500).json({ error: 'Database error' });
          }
          db.commit(err => {
            if (err) {
              db.rollback();
              return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'Order placed successfully' });
          });
        });
      });
    });
  });
});

// API endpoint for creating payment intent (Stripe)
app.post('/api/payments', async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'usd',
      payment_method_types: ['card']
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// API endpoint for subscription submission
app.post('/api/subscriptions', (req, res) => {
  const { user_id, plan_type, days, start_date } = req.body;
  if (!user_id || !plan_type || !start_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (plan_type === 'custom_days' && (!days || days.split(',').length < 3)) {
    return res.status(400).json({ error: 'Custom Days plan requires at least 3 days' });
  }
  const sql = 'INSERT INTO subscriptions (user_id, plan_type, days, start_date) VALUES (?, ?, ?, ?)';
  db.query(sql, [user_id, plan_type, days, start_date], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Subscription created successfully' });
  });
});

// API endpoint for catering request submission
app.post('/api/catering', (req, res) => {
  const { user_id, event_date, event_type, guest_count, preferences } = req.body;
  if (!user_id || !event_date || !event_type || !guest_count) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (guest_count < 1) {
    return res.status(400).json({ error: 'Guest count must be at least 1' });
  }
  const sql = 'INSERT INTO catering_requests (user_id, event_date, event_type, guest_count, preferences) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [user_id, event_date, event_type, guest_count, preferences], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Catering request submitted successfully' });
  });
});

// API endpoint for contact form submission
app.post('/api/contact', (req, res) => {
  const { user_id, name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  const sql = 'INSERT INTO contact_messages (user_id, name, email, subject, message) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [user_id || null, name, email, subject, message], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Message sent successfully' });
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));