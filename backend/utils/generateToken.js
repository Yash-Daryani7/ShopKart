const jwt = require('jsonwebtoken');
const jwtSecret = require('../config/jwtSecret');

const generateTokenAndSetCookie = (res, customerId) => {
  const token = jwt.sign({ id: customerId }, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  };

  res.cookie('token', token, cookieOptions);

  return token;
};

module.exports = generateTokenAndSetCookie;
