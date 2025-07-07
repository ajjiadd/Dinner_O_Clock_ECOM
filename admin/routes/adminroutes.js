const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Replace with your MySQL username
  password: '', // Replace with your MySQL password
  database: 'dinner_o_clock'
});

// Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Admin login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const sql = 'SELECT * FROM admins WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const admin = results[0];
    req.session.adminUser = { id: admin.id, name: admin.name, email: admin.email };
    res.json({ message: 'Admin login successful', admin: req.session.adminUser });
  });
});

// Admin logout
router.post('/logout', (req, res) => {
  if (req.session.adminUser) {
    req.session.destroy(err => {
      if (err) return res.status(500).json({ error: 'Failed to log out' });
      res.json({ message: 'Admin logout successful' });
    });
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});

// Admin dashboard metrics
router.get('/dashboard', (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const ordersSql = 'SELECT COUNT(*) AS totalOrders FROM orders';
  const revenueSql = 'SELECT SUM(amount) AS totalRevenue FROM payments WHERE payment_status = "completed"';
  const cateringSql = 'SELECT COUNT(*) AS pendingCatering FROM catering_requests';
  const trendsSql = 'SELECT MONTH(order_date) AS month, COUNT(*) AS count FROM orders WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 7 MONTH) GROUP BY MONTH(order_date)';

  Promise.all([
    new Promise((resolve, reject) => {
      db.query(ordersSql, (err, results) => {
        if (err) reject(err);
        else resolve(results[0].totalOrders);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(revenueSql, (err, results) => {
        if (err) reject(err);
        else resolve(results[0].totalRevenue || 0);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(cateringSql, (err, results) => {
        if (err) reject(err);
        else resolve(results[0].pendingCatering);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(trendsSql, (err, results) => {
        if (err) reject(err);
        else {
          const trends = [0, 0, 0, 0, 0, 0, 0];
          results.forEach(row => {
            trends[row.month - 1] = row.count;
          });
          resolve(trends);
        }
      });
    })
  ])
    .then(([totalOrders, totalRevenue, pendingCatering, orderTrends]) => {
      res.json({ totalOrders, totalRevenue, pendingCatering, orderTrends });
    })
    .catch(err => {
      console.error('Error fetching dashboard metrics:', err);
      res.status(500).json({ error: 'Database error' });
    });
});

// Get all menu items
router.get('/menu', (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const sql = 'SELECT * FROM menu_items';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching menu items:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log('Fetched menu items:', results);
    res.json(results);
  });
});

// Get single menu item
router.get('/menu/:id', (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const sql = 'SELECT * FROM menu_items WHERE id = ?';
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      console.error('Error fetching menu item:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) return res.status(404).json({ error: 'Menu item not found' });
    console.log('Fetched menu item:', results[0]);
    res.json(results[0]);
  });
});

// Add menu item
router.post('/menu', upload.single('image'), (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const { name, price, cuisine_type, dietary_info, description, is_active, is_featured } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }
  const image_url = req.file ? `/Uploads/${req.file.filename}` : null;
  const isActive = parseInt(is_active) === 1 ? 1 : 0;
  const isFeatured = parseInt(is_featured) === 1 ? 1 : 0;
  const sql = 'INSERT INTO menu_items (name, price, cuisine_type, dietary_info, description, is_active, is_featured, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [name, price, cuisine_type, dietary_info, description, isActive, isFeatured, image_url], (err, result) => {
    if (err) {
      console.error('Error adding menu item:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log('Added menu item:', { id: result.insertId, name, is_active: isActive });
    res.json({ message: 'Menu item added successfully', id: result.insertId });
  });
});

// Update menu item
router.put('/menu/:id', upload.single('image'), (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const { name, price, cuisine_type, dietary_info, description, is_active, is_featured } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }
  const image_url = req.file ? `/Uploads/${req.file.filename}` : req.body.image_url;
  const isActive = parseInt(is_active) === 1 ? 1 : 0;
  const isFeatured = parseInt(is_featured) === 1 ? 1 : 0;
  const sql = 'UPDATE menu_items SET name = ?, price = ?, cuisine_type = ?, dietary_info = ?, description = ?, is_active = ?, is_featured = ?, image_url = ? WHERE id = ?';
  db.query(sql, [name, price, cuisine_type, dietary_info, description, isActive, isFeatured, image_url, req.params.id], (err, result) => {
    if (err) {
      console.error('Error updating menu item:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Menu item not found' });
    console.log('Updated menu item:', { id: req.params.id, name, is_active: isActive });
    res.json({ message: 'Menu item updated successfully' });
  });
});

// Delete menu item
router.delete('/menu/:id', (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const sql = 'DELETE FROM menu_items WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error('Error deleting menu item:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Menu item not found' });
    console.log('Deleted menu item:', { id: req.params.id });
    res.json({ message: 'Menu item deleted successfully' });
  });
});

// Get all orders with details
router.get('/orders', (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const sql = `
    SELECT o.id, o.user_id, u.name AS user_name, o.order_date, o.delivery_type, o.status, o.total_price, o.address
    FROM orders o
    JOIN users u ON o.user_id = u.id
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log('Fetched orders:', results);
    res.json(results);
  });
});

// Get single order with details
router.get('/orders/:id', (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const orderSql = `
    SELECT o.id, o.user_id, u.name AS user_name, o.order_date, o.delivery_type, o.status, o.total_price, o.address,
           p.payment_method, p.payment_status
    FROM orders o
    JOIN users u ON o.user_id = u.id
    JOIN payments p ON o.id = p.order_id
    WHERE o.id = ?
  `;
  const itemsSql = `
    SELECT oi.quantity, oi.price, m.name
    FROM order_items oi
    JOIN menu_items m ON oi.menu_item_id = m.id
    WHERE oi.order_id = ?
  `;
  Promise.all([
    new Promise((resolve, reject) => {
      db.query(orderSql, [req.params.id], (err, results) => {
        if (err) reject(err);
        else if (results.length === 0) reject(new Error('Order not found'));
        else resolve(results[0]);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(itemsSql, [req.params.id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    })
  ])
    .then(([order, items]) => {
      console.log('Fetched order details:', { order, items });
      res.json({ ...order, items });
    })
    .catch(err => {
      console.error('Error fetching order details:', err);
      res.status(err.message === 'Order not found' ? 404 : 500).json({ error: err.message });
    });
});

// Update order status
router.put('/orders/:id', (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const { status } = req.body;
  if (!['pending', 'confirmed', 'delivered', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const sql = 'UPDATE orders SET status = ? WHERE id = ?';
  db.query(sql, [status, req.params.id], (err, result) => {
    if (err) {
      console.error('Error updating order status:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Order not found' });
    console.log('Updated order status:', { id: req.params.id, status });
    res.json({ message: 'Order status updated successfully' });
  });
});

// Get all catering requests
router.get('/catering', (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const sql = `
    SELECT c.id, c.user_id, u.name AS user_name, c.event_date, c.event_type, c.guest_count, c.preferences, c.status
    FROM catering_requests c
    JOIN users u ON c.user_id = u.id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// Get single catering request
router.get('/catering/:id', (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const sql = `
    SELECT c.id, c.user_id, u.name AS user_name, c.event_date, c.event_type, c.guest_count, c.preferences, c.status
    FROM catering_requests c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'Catering request not found' });
    res.json(results[0]);
  });
});

// Update catering status
router.put('/catering/:id', (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const { status } = req.body;
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const sql = 'UPDATE catering_requests SET status = ? WHERE id = ?';
  db.query(sql, [status, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Catering request not found' });
    res.json({ message: 'Catering request status updated successfully' });
  });
});


// Get all users
router.get('/users', (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const sql = 'SELECT id, name, email, phone, address FROM users';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log('Fetched users:', results);
    res.json(results);
  });
});

// Get single user
router.get('/users/:id', (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const sql = 'SELECT id, name, email, phone, address FROM users WHERE id = ?';
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    console.log('Fetched user:', results[0]);
    res.json(results[0]);
  });
});

// Add user
router.post('/users', (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const { name, email, password, phone, address } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  const sql = 'INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [name, email, password, phone, address], (err, result) => {
    if (err) {
      console.error('Error adding user:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: 'Database error' });
    }
    console.log('Added user:', { id: result.insertId, name, email });
    res.json({ message: 'User added successfully', id: result.insertId });
  });
});

// Update user
router.put('/users/:id', (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const { name, email, password, phone, address } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  let sql = 'UPDATE users SET name = ?, email = ?, phone = ?, address = ?';
  const params = [name, email, phone, address];
  if (password) {
    sql += ', password = ?';
    params.push(password);
  }
  sql += ' WHERE id = ?';
  params.push(req.params.id);
  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Error updating user:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    console.log('Updated user:', { id: req.params.id, name, email });
    res.json({ message: 'User updated successfully' });
  });
});

// Delete user
router.delete('/users/:id', (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const sql = 'DELETE FROM users WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    console.log('Deleted user:', { id: req.params.id });
    res.json({ message: 'User deleted successfully' });
  });
});


// Get all subscriptions
router.get('/subscriptions', (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const sql = `
    SELECT s.id, s.user_id, u.name AS user_name, s.plan_type, s.days, s.start_date, s.end_date, s.status
    FROM subscriptions s
    JOIN users u ON s.user_id = u.id
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching subscriptions:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log('Fetched subscriptions:', results);
    res.json(results);
  });
});

// Update subscription status
router.put('/subscriptions/:id', (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const { status } = req.body;
  if (!['active', 'paused', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const sql = 'UPDATE subscriptions SET status = ? WHERE id = ?';
  db.query(sql, [status, req.params.id], (err, result) => {
    if (err) {
      console.error('Error updating subscription status:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Subscription not found' });
    console.log('Updated subscription status:', { id: req.params.id, status });
    res.json({ message: 'Subscription status updated successfully' });
  });
});

// Get all promotions
router.get('/promotions', (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const sql = 'SELECT id, title, description, image_url, is_active FROM promotions';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching promotions:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log('Fetched promotions:', results);
    res.json(results);
  });
});

// Get single promotion
router.get('/promotions/:id', (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const sql = 'SELECT id, title, description, image_url, is_active FROM promotions WHERE id = ?';
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      console.error('Error fetching promotion:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) return res.status(404).json({ error: 'Promotion not found' });
    console.log('Fetched promotion:', results[0]);
    res.json(results[0]);
  });
});

// Add promotion
router.post('/promotions', upload.single('image'), (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const { title, description, is_active } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }
  const image_url = req.file ? `/Uploads/${req.file.filename}` : null;
  const isActive = parseInt(is_active) === 1 ? 1 : 0;
  const sql = 'INSERT INTO promotions (title, description, image_url, is_active) VALUES (?, ?, ?, ?)';
  db.query(sql, [title, description, image_url, isActive], (err, result) => {
    if (err) {
      console.error('Error adding promotion:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log('Added promotion:', { id: result.insertId, title, is_active: isActive });
    res.json({ message: 'Promotion added successfully', id: result.insertId });
  });
});

// Update promotion
router.put('/promotions/:id', upload.single('image'), (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const { title, description, is_active, image_url } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }
  const newImageUrl = req.file ? `/Uploads/${req.file.filename}` : image_url;
  const isActive = parseInt(is_active) === 1 ? 1 : 0;
  const sql = 'UPDATE promotions SET title = ?, description = ?, image_url = ?, is_active = ? WHERE id = ?';
  db.query(sql, [title, description, newImageUrl, isActive, req.params.id], (err, result) => {
    if (err) {
      console.error('Error updating promotion:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Promotion not found' });
    console.log('Updated promotion:', { id: req.params.id, title, is_active: isActive });
    res.json({ message: 'Promotion updated successfully' });
  });
});

// Delete promotion
router.delete('/promotions/:id', (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const sql = 'DELETE FROM promotions WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error('Error deleting promotion:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Promotion not found' });
    console.log('Deleted promotion:', { id: req.params.id });
    res.json({ message: 'Promotion deleted successfully' });
  });
});


// Get all contact messages
router.get('/messages', (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const sql = 'SELECT id, user_id, name, email, subject, message, status, created_at FROM contact_messages';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching messages:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log('Fetched messages:', results);
    res.json(results);
  });
});

// Get single contact message
router.get('/messages/:id', (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const sql = 'SELECT id, user_id, name, email, subject, message, status, created_at FROM contact_messages WHERE id = ?';
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      console.error('Error fetching message:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) return res.status(404).json({ error: 'Message not found' });
    console.log('Fetched message:', results[0]);
    res.json(results[0]);
  });
});

// Update message status
router.put('/messages/:id', (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const { status } = req.body;
  if (!['unread', 'read', 'responded'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const sql = 'UPDATE contact_messages SET status = ? WHERE id = ?';
  db.query(sql, [status, req.params.id], (err, result) => {
    if (err) {
      console.error('Error updating message status:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Message not found' });
    console.log('Updated message status:', { id: req.params.id, status });
    res.json({ message: 'Message status updated successfully' });
  });
});

// Delete contact message
router.delete('/messages/:id', (req, res) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const sql = 'DELETE FROM contact_messages WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error('Error deleting message:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Message not found' });
    console.log('Deleted message:', { id: req.params.id });
    res.json({ message: 'Message deleted successfully' });
  });
});

module.exports = router;