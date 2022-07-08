/* eslint-disable no-useless-catch */
const client = require('./client');


async function getRoutineById(id){
  try {
    const {rows: [routine]} = await client.query(`
    SELECT *
    FROM routines
    WHERE id=$1;
    `, [id])
    
    return routine;
  } catch (error) {
    throw error;
  }
}

async function getRoutinesWithoutActivities(){
  try{
    const { rows: routine} = await client.query(`
    SELECT u.id, u.username AS "creatorName", r.*
    FROM users u
    JOIN routines r ON r."creatorId" = u.id;
    `);
    return routine
  }catch(error){
    throw error;
  }
}
async function attachActivitiesToRoutines(routines) {
  try {
    const {rows} = await client.query(`
    SELECT 
    a.*, 
    ra.duration, 
    ra.count, 
    ra.id AS "routineActivityId", 
    ra."routineId"
    FROM activities a
    JOIN "routine_activities" ra ON a.id = ra."activityId"; 
    `);
    let allRoutines = [];
    for(let i = 0; i < routines.length; i++){
      let currentRoutine = routines[i];
      currentRoutine.activities = rows.filter((act)=> act.routineId === currentRoutine.id);
      allRoutines.push(currentRoutine);
    }
    return allRoutines;
  } catch (error) {
    throw error;
  }
}

async function getAllRoutines() {
  try{
    const routines = await getRoutinesWithoutActivities();
    const attachedActivities = await attachActivitiesToRoutines(routines);
    return attachedActivities;
  }catch(error){
    throw error;
  }
}

async function getAllRoutinesByUser({username}) {
  try {
    const routines = await getAllRoutines();

    const userRoutines = routines.filter(routine =>{
            if(routine.creatorName === username){
        return routine
      }
    })
    return userRoutines;
  } catch (error) {
    throw error;
  }
}

async function getPublicRoutinesByUser({username}) {
  try {
    let routines = await getAllRoutines();

    const publicUserRoutines = routines.filter(routine=>{
      if(routine.creatorName === username && routine.isPublic){
        return routine;
      }
    })
    return publicUserRoutines;
  } catch (error) {
    throw error;
  }
}

async function getAllPublicRoutines() {
  try {
    const routines = await getAllRoutines();

    const publicRoutines = routines.filter(routine =>{
      if(routine.isPublic) return routine
    })
    return publicRoutines;
  } catch (error) {
    throw error;
  }
}

async function getPublicRoutinesByActivity({id}) {
  try {
    const routines = await getAllRoutines();

    const publicRoutineByActivity = routines.filter(routine =>{
      if(routine.isPublic){
        let allRoutines = []
        for(let i = 0; i < routine.activities.length; i++){
          if(routine.activities[i].id === id){
            allRoutines.push(routine)
          }
        }
        return allRoutines
      }
    })
    return publicRoutineByActivity;
  } catch (error) {
    throw error;
  }
}

async function createRoutine({creatorId, isPublic, name, goal}) {
  try{
    const {rows:[routine]} = await client.query(`
    INSERT INTO routines("creatorId", "isPublic", name, goal)
    VALUES($1, $2, $3, $4)
    RETURNING *;
    `, [creatorId, isPublic, name, goal]);

    return routine;
  }catch(error){
    throw error;
  }
}

async function updateRoutine({id, ...fields}) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${key}" = $${ index + 1 }`
  ).join(',');

  if(setString.length === 0){
    return 
  }

  try {
    const {rows:[routine]} = await client.query(`
    UPDATE routines
    SET ${ setString }
    WHERE id= ${ id }
    RETURNING *;
    `, Object.values(fields));

    return routine
  } catch (error) {
    throw error;
  }

}

async function destroyRoutine(id) {
  try {
    await client.query(`
    DELETE 
    FROM "routine_activities" ra
    WHERE ra."routineId" =$1;
    `, [id])

    const {rows:[deletedRoutine]} = await client.query(`
    DELETE 
    FROM routines r
    WHERE r.id =$1
    RETURNING *;
    `, [id])

    return deletedRoutine
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
}