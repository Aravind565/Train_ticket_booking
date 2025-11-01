const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization']; // safer than req.header()
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No token provided'); // 🔍 debug
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // 🔍 debug
    req.user = { id: decoded.id || decoded._id };
    next();
  } catch (error) {
    console.log('JWT verification failed:', error.message); // 🔍 debug
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = verifyToken;
