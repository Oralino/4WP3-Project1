const express = require('express');
const mustacheExpress = require('mustache-express');
const Model = require('./app.model.js');

const app = express();
const PORT = 3000;

//Configure Mustache
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

//Middleware to parse form data
app.use(express.urlencoded({ extended: false }));


//Read All Games (`/all` route)
app.get('/all', async (req, res) => {
    try {
        const games = await Model.getAllGames();
        
        //Render the index.mustache view and pass the games data to it
        res.render('index', { 
            games: games,
            totalGames: games.length
        });
    } catch (err) {
        console.error("Error fetching games:", err);
        res.status(500).send("Internal Server Error");
    }
});



//Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});