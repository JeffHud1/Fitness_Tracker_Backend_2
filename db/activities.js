/* eslint-disable no-useless-catch */
const client = require("./client")

// database functions
async function getAllActivities() {
  try{
    const { rows: activity } = await client.query(`
    SELECT * FROM activities;
    `)
    return activity
  }catch(error){
    throw error;
  }
}

async function getActivityById(id) {
try {
  const {rows : [activity]} = await client.query(`
  SELECT *
  FROM activities
  WHERE id=$1;
  `, [id])
  if(activity){
    return activity;
  }
} catch (error) {
  throw error;
}
}

async function getActivityByName(name) {
try {
  const {rows : [activity]} = await client.query(`
  SELECT * 
  FROM activities
  WHERE name=$1;
  `, [name]);

  if(activity){
    return activity;
  }
} catch (error) {
  throw error;
}
}

// async function attachActivitiesToRoutines(routines) {
//   try {
//     const {rows} = await client.query(`
//     SELECT *
//     FROM activities a
//     JOIN routineactivities ra ON a.id = ra."activityId"; 
//     `)
//     return rows
//   } catch (error) {
//     throw error;
//   }
// }

// select and return an array of all activities
async function createActivity({ name, description }) {
  try{

    const {rows:[activity]} = await client.query(`
    INSERT INTO activities(name, description)
    VALUES ($1, $2)
    ON CONFLICT (name) DO NOTHING
    RETURNING *
    `, [name, description]);

    return activity;
  }catch(error){
    throw error;
  }

}

// return the new activity
async function updateActivity({ id, ...fields }) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${key}" = $${index+1}`
  ).join(', ')
  try {
    if(setString.length > 0){
      const {rows:[activity]} = await client.query(`
      UPDATE activities
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
      `, Object.values(fields));

      return activity;
    }
  } catch (error) {
    throw error;
  }

}

// don't try to update the id
// do update the name and description
// return the updated activity
module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  createActivity,
  updateActivity,
}
