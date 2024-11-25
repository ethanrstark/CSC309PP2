import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Secret keys, expiry times, and salt rounds from environment variables
const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10);

const JWT_SECRET_ACCESS = process.env.JWT_SECRET_ACCESS;
const JWT_EXPIRES_IN_ACCESS = process.env.JWT_EXPIRES_IN_ACCESS;

const JWT_SECRET_REFRESH = process.env.JWT_SECRET_REFRESH;
const JWT_EXPIRES_IN_REFRESH = process.env.JWT_EXPIRES_IN_REFRESH;


// Function to hash the user's password before saving it to the database
export async function hashPassword(password) {
  return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

// Function to compare the plain text password with the hashed password stored in the database
export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Function to generate an access token
export function generateAccessToken(user) {
  const payload = {
    id: user.id,
    userName: user.userName,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET_ACCESS, { expiresIn: JWT_EXPIRES_IN_ACCESS });
}

// Function to generate a refresh token
export function generateRefreshToken(user) {
  const payload = {
    id: user.id,
    userName: user.userName,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET_REFRESH, { expiresIn: JWT_EXPIRES_IN_REFRESH });
}

// Function to generate both access and refresh tokens
export function generateBothToken(user) {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
}

// Function to verify the refresh token from the authorization request header
export function verifyRefreshToken(refreshToken) {
  if (!refreshToken) {
    return null;
  } else if (refreshToken.startsWith("Bearer ")) {
    refreshToken = refreshToken.split(" ")[1];
  }

  try {
    return jwt.verify(refreshToken, JWT_SECRET_REFRESH);
  } catch (err) {
    return null;
  }
}

// Function to verify the access token from the authorization request header
export function verifyAccessToken(accessToken) {
  if (!accessToken) {
    return null;
  } else if (accessToken.startsWith("Bearer ")) {
    accessToken = accessToken.split(" ")[1];
  }

  try {
    return jwt.verify(accessToken, JWT_SECRET_ACCESS);
  } catch (err) {
    return null;
  }
}

// Function to refresh the access token using a valid refresh token
export function refreshToken(refreshToken) {
  if (!refreshToken) {
    return null;
  }

  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    return null;
  }

  const newAccessToken = generateAccessToken(payload);
  return newAccessToken;
}
