/* eslint-disable no-useless-catch */
const client = require("./client");
const bcrypt = require('bcrypt');
const SALT = 10;
// database functions

// user functions
async function createUser({ username, password }) {
  const hashedPassword = await bcrypt.hash(password, SALT);
  try{
    const {rows:[users]} = await client.query(`
    INSERT INTO users(username, password)
    VALUES( $1, $2)
    ON CONFLICT (username) DO NOTHING
    RETURNING id, username;
    `, [username, hashedPassword]);

    if(users){
      return users;
    }
  }catch(error){
    throw error;
  }
}

async function getUser({ username, password }) {
  try{
    const user = await getUserByUsername(username);
    if(!user) return;
    const hashedPassword = user.password;
    const passwordsMatch = await bcrypt.compare(password, hashedPassword);
    if(!passwordsMatch) return;
    delete user.password
    return user;
  }catch(error){
    throw error;
  }
}

async function getUserById(userId) {
  try{
    const {rows:[user]} = await client.query(`
    SELECT id, username
    FROM users
    WHERE id=$1;
    `, [userId])

    if(user){
      return user;
    }


  }catch(error){
    throw error;
  }
}

async function getUserByUsername(userName) {
  try{
    const {rows:[user]} = await client.query(`
    SELECT *
    FROM users
    WHERE username=$1;
    `, [userName]);

    if(user){
      return user;
    }
  }catch(error){
    throw error;
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
