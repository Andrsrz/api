require('dotenv').load()
const jwt = require('jsonwebtoken')
const tokenKey = process.env.TOKEN_KEY || "Este es la key del token"

module.exports = {
  validate_token(token) {
    return jwt.verify(token, tokenKey)
  }
}