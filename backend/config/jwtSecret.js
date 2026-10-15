const crypto = require('crypto');

const jwtSecret = process.env.JWT_SECRET || (
  process.env.NODE_ENV === 'production'
    ? ''
    : crypto.randomBytes(32).toString('hex')
);

module.exports = jwtSecret;
