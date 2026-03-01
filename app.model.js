const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite');

//Function to initialize the database connection
async function initDB() {
    const db = await sqlite.open({
        filename: 'database.db',
        driver: sqlite3.Database
    });

    //Create the Games table if it doesn't already exist
    await db.exec(`
        CREATE TABLE IF NOT EXISTS Games (
            title TEXT,
            playtime_hours REAL,
            status TEXT,
            personal_rating INTEGER,
            date_added TEXT
        )
    `);

    //Check if the table is empty. If it is, insert a starter record.
    const gameCount = await db.get('SELECT COUNT(*) as count FROM Games');
    if (gameCount.count === 0) {
        await db.exec(`
            INSERT INTO Games (title, playtime_hours, status, personal_rating, date_added) 
            VALUES ('Elden Ring', 120.5, 'Completed', 10, '2026-03-01')
        `);
        console.log("Inserted default starter game into the database.");
    }

    return db;
}

//Model to retrieve all games
async function getAllGames() {
    const db = await initDB();
    const results = await db.all("SELECT rowid, * FROM Games");
    return results;
}


//Function to add a new game to the database
async function addGame(title, playtime_hours, status, personal_rating) {
    const db = await initDB();
    const date_added = new Date().toISOString().split('T')[0]; 

    //Insert the new record
    await db.run(`
        INSERT INTO Games (title, playtime_hours, status, personal_rating, date_added) 
        VALUES (?, ?, ?, ?, ?)
    `, [title, playtime_hours, status, personal_rating, date_added]);
}


//Function to delete a game
async function deleteGame(id){
    const db = await initDB();
    await db.run('DELETE FROM Games WHERE rowid = ?', [id]);
}

//Function to grab single game by ID
async function getGameById(id){
    const db = await initDB();
    const game = await db.get("SELECT rowid, * FROM Games WHERE rowid = ?", [id]);
    return game;
}


//Function to update existing game
async function updateGame(id, title, playtime_hours, status, personal_rating) {
    const db = await initDB();
    await db.run(`
        UPDATE Games 
        SET title = ?, playtime_hours = ?, status = ?, personal_rating = ?
        WHERE rowid = ?
    `, [title, playtime_hours, status, personal_rating, id]);
}

//Function to get all games sorted by a specific column
async function getGamesSorted(column) {
    const db = await initDB();
    
    //Whitelist
    const validColumns = ['playtime_hours', 'personal_rating', 'title'];
    const sortCol = validColumns.includes(column) ? column : 'rowid';

    //Sort rating and playtime highest-to-lowest (DESC), but title alphabetically (ASC)
    const order = (sortCol === 'title') ? 'ASC' : 'DESC';

    const results = await db.all(`SELECT rowid, * FROM Games ORDER BY ${sortCol} ${order}`);
    return results;
}

//Export the functions so the controller can use them
module.exports = {
    getAllGames,
    addGame,
    deleteGame,
    getGameById,
    updateGame,
    getGamesSorted
};
