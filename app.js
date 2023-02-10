let express = require("express");
let sqlite3 = require("sqlite3");
let { open } = require("sqlite");
let path = require("path");

let app = express();
app.use(express.json());

let dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Db Error: ${e.messaage}`);
    process.exit(1);
  }
};

initializeDbAndServer();

function caseConversion(obj) {
  return {
    playerId: obj.player_id,
    playerName: obj.player_name,
    jerseyNumber: obj.jersey_number,
    role: obj.role,
  };
}

// GET Players
app.get("/players/", async (request, response) => {
  const playersQuery = `
    SELECT 
        * 
     FROM 
        cricket_team
     ORDER BY 
        player_id;`;

  const playersArray = await db.all(playersQuery);
  response.send(playersArray.map((eachObj) => caseConversion(eachObj)));
});

// POST Players
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = ` 
    INSERT INTO
    cricket_team (player_name, jersey_number, role)
    VALUES 
    ('${playerName}', ${jerseyNumber}, '${role}');`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//GET Player
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = ` 
    SELECT 
        *
     FROM
        cricket_team
     WHERE
        player_id = ${playerId};`;

  const player = await db.get(getPlayerQuery);
  response.send(caseConversion(player));
});

// UPDATE details of a Player
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuey = ` 
    UPDATE
        cricket_team
    SET
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
    WHERE
        player_id = ${playerId};`;
  await db.run(updatePlayerQuey);
  response.send("Player Details Updated");
});

// DELETE a Player
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = ` 
    DELETE FROM
        cricket_team
     WHERE 
        player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
