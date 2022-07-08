/* eslint-disable no-useless-catch */
const client = require('./client')
const {getRoutineById} = require('./routines')

async function getRoutineActivityById(id){
  try {
    const {rows:[routineActivity]} = await client.query(`
    SELECT *
    FROM "routine_activities"
    WHERE id=$1;
    `, [id]);

    return routineActivity;
  } catch (error) {
    throw error;
  }
}

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
    try{
      const {rows:[activityJoin]} = await client.query(`
      SELECT *
      FROM "routine_activities"
      WHERE "routineId"=$1 AND "activityId"=$2;
      `, [routineId, activityId])
      
      if(!activityJoin){
        const {rows:[activityForRoutine]} = await client.query(`
        INSERT INTO "routine_activities"("routineId", "activityId", count, duration)
        VALUES($1, $2, $3, $4)
        RETURNING *;
        `, [routineId, activityId, count, duration]);
        return activityForRoutine;
      }
    }catch(error){
      throw error;
    }
}

async function getRoutineActivitiesByRoutine({id}) {
  try {
    const {rows} = await client.query(`
    SELECT *
    FROM "routine_activities"
    WHERE "routineId"=$1;
    `, [id]);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function updateRoutineActivity ({id, ...fields}) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${key}" = $${index + 1}`
  ).join(',');

  if(setString.length === 0){
    return
  }

  try {
    const {rows:[updatedRow]} = await client.query(`
    UPDATE "routine_activities"
    SET ${ setString }
    WHERE id= ${ id }
    RETURNING *;
    `, Object.values(fields));

    return updatedRow
  } catch (error) {
    throw error
  }
}

async function destroyRoutineActivity(id) {
  try {

    const {rows:[activityToBeDeleted]} = await client.query(`
    DELETE FROM "routine_activities" 
    WHERE id = ${id}
    RETURNING *;
    `)

    return activityToBeDeleted

  } catch (error) {
    throw error
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
  try {
    const routineActivityInQuestion = await getRoutineActivityById(routineActivityId)
    const {creatorId} = await getRoutineById(routineActivityInQuestion.routineId)
    if(creatorId === userId){
      return true
    }else{
      return false
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
