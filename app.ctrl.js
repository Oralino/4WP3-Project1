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

//Redirect root to /all
app.get('/', (req, res) => {
    res.redirect('/all');
});


app.get('/add', (req, res) => {
    res.render('add', { error: null }); 
});


app.get('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id; //Grab the ID from the URL
        await Model.deleteGame(id); //Delete
        res.redirect('/all'); //Refresh the dashboard
    } catch (err) {
        console.error("Error deleting game:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/create', async (req, res) => {
    const { title, playtime_hours, status, personal_rating } = req.body;
    let errorMessage = null;

    const playtime = parseFloat(playtime_hours);
    const rating = parseInt(personal_rating, 10);

    //Form Validation
    if (!title || title.trim() === "") {
        errorMessage = "Title cannot be empty.";
    } else if (isNaN(playtime) || playtime < 0) {
        errorMessage = "Playtime must be a numeric value greater than or equal to 0.";
    } else if (isNaN(rating) || rating < 1 || rating > 10) {
        errorMessage = "Personal Rating must be a whole number between 1 and 10.";
    }

    //If validation fails
    if (errorMessage) {
        return res.render('add', { 
            error: errorMessage, 
            title: title, 
            playtime_hours: playtime_hours, 
            personal_rating: personal_rating 
        });
    }

    //If validation passes
    try {
        await Model.addGame(title, playtime, status, rating);
        res.redirect('/all');
    } catch (err) {
        console.error("Error adding game:", err);
        res.status(500).send("Internal Server Error");
    }
});


//Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});