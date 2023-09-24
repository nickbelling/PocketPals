/**
 * Copyright (C) 2022, Nick Belling for Back Pocket/Lowkii.
 * Feel free to copy and use this code as you see fit.
 * 
 * Logic for the game "Order Up" as shown on Back Pocket's "Pocket Pals".
 * 
 * Assumes the object `games` already exists and it looks like this (it gets
 * created/loaded in `game.html`):
 * 
 * ```
 *  games = {
 *      '00': [
 *          { "name": "thesims", "date": "2000 - Feb 4" },
 *          { "name": "sh2", "date": "2001 - Sep 24" },
 *          // etc
 *      ],
 *      '10': [
 *          { "name": "portal2", "date": "2011 - Apr 18" },
 *          // etc
 *      ],
 *      // etc
 *  };
 * ```
 * 
 * First, we work out which decade we're playing (defaulting to 00s if not
 * defined on the URL). Then, we take the indexes of those games and randomly
 * shuffle them into an array called `randomOrder`. Each time the 
 * `showNextGame()` function is called, we take the next index from the
 * randomOrder array, look up the game from our list with that index, and show
 * that game on-screen.
 * 
 * Pressing the spacebar, or firing a browser event called `"next"` within OBS
 * will cause this to call the `showNextGame()` function.
 */

/** The decade of games currently being shown */
var decade = '00';

/** The game currently being shown */
var currentGame = undefined;

/** An array of the game numbers (0, 1, 2, 3, etc) sorted in random order
 * (e.g. 7, 3, 9, 1, 0, etc). */
var randomOrder = undefined;

/** The index of the random order array we're currently at. */
var index = 0;

/**
 * Loads up the relevant data, hooks the relevant events, and starts the game.
 */
function main() {
    // Get the "game.html?decade=XX" URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('decade')) {
        decade = urlParams.get('decade');
    } else {
        // else not set, so keep the default of '00' as defined above
        urlParams.append('decade', '00');
        window.location.search = urlParams;
    }

    // Preload the image files for this decade of games, so they don't "pop in"
    preloadImages(games[decade]);

    // Randomly shuffle the indexes of each game in the decade array into an
    // array of "random indexes". We can move through this array to show the
    // games in a random order, but still keep them in their original order in
    // the original array so that we can 
    randomOrder = Array.from(games[decade].keys());
    randomOrder = randomOrder.sort(() => (Math.random() > .5) ? 1 : -1);

    // OBS will hook a window event when you load a page as a browser source.
    // This can be used to have a browser source react to events.
    // A Python script exists next to this file that you can use to fire this
    // event by calling:
    // python fire_browser_event.py next [websocket URL] [websocket password]
    window.addEventListener('orderUpNextGame', function() {
        // When the "next" event gets fired, show the next game
        showNextGame();
    });

    // When we're not using OBS and just playing in the browser, make it react
    // to the user pressing the spacebar instead.
    document.addEventListener('keydown', function(e) {
        if (e.code == "Space") {
            // User pressed space
            showNextGame();
        }
    });

    // All data loaded, all events hooked. Show the first game
    showNextGame();
}

/**
 * Given an array of games, preloads their images.
 * @param {Game[]} games The array of games to be preloaded.
 */
function preloadImages(games) {
    games.forEach(game => {
        var img = new Image();
        img.src = decade + 's/' + game.name + 'bg.png';

        img = new Image();
        img.src = decade + 's/' + game.name + 'logo.png';
    });
}

/**
 * Given an object representing a game, sets the "current-bg" and "current-logo"
 * elements on the game page to the images for that game.
 * @param {Game} game The game to be set.
 */
function setCurrentGame(game) {
    if (game) {
        document
            .getElementById('current-bg')
            .style
            .setProperty(
                'background-image',
                'url(' + decade + 's/' + game.name + 'bg.png)');

        document
            .getElementById('current-logo')
            .src = decade + 's/' + game.name + 'logo.png';

        currentGame = game;
    } else {
        // Setting the current game to an undefined game (game is probably 
        // finished), so "hide" the current game element instead.
        var currentElement = document.getElementById('current');
        currentElement.classList.add("hidden");
    }
}

/**
 * If showing a game, moves the current game to the track, then gets the next
 * game to display in the "current game" and renders it.
 */
function showNextGame() {
    if (currentGame) {
        // Get the games we've already inserted, sorted by alphabetical order
        // (e.g. if we've displayed games 7, 3, 9 and 0, puts them in order
        // 0, 3, 7, 9).
        var gamesOnTrack = randomOrder.slice(0, index + 1).sort((a, b) => a - b);

        // Work out which position to insert the game at on the track
        var randomIndex = randomOrder[index];
        var position = gamesOnTrack.indexOf(randomIndex);

        // Render the game on the track
        addGameToTrack(currentGame, position);

        // Now increment the index so we can show the next random game
        index++;
    } else {
        // current game is undefined, because we've either finished the list
        // or not started yet.
    }

    // Get the "next" random game index
    var randomIndex = randomOrder[index];
    if (randomIndex !== undefined) {
        // Get the game matching this random index
        var game = games[decade][randomIndex];
        if (game) {
            // Show that game
            setCurrentGame(game);
        }
    } else {
        // We've gone all the way through our list of random indexes, so the
        // current game is now "undefined".
        currentGame = undefined;
        setCurrentGame(undefined);
    }
}

/**
 * Given a game and a track position, renders the HTML elements that represent
 * that game at the appropriate position in the track.
 * 
 * Because we've defined animation rules in the CSS, this will cause the entire
 * track to animate as the new element appears.
 * 
 * @param {Game} game The game to be rendered on the track
 * @param {number} position The position the game should be inserted to.
 */
function addGameToTrack(game, position) {
    // Get track
    var track = document.getElementById('track');
    
    // Make wrapper element
    var divCardWrapper = document.createElement('div');
    divCardWrapper.className = 'card-wrapper';
    
    // Make card element
    var divCard = document.createElement('div');
    divCard.className = 'card';

    // Make inner card element
    var divCardInner = document.createElement('div');
    divCardInner.className = 'card-inner';

    // Make card background element
    var cardBg = document.createElement('div');
    cardBg.className = 'card-bg';
    cardBg.style.setProperty('background-image', 'url(' + decade + 's/' + game.name + 'bg.png)');
    divCardInner.appendChild(cardBg);

    // Make img logo element
    var imgLogo = document.createElement('img');
    imgLogo.src = decade + 's/' + game.name + 'logo.png';
    divCardInner.appendChild(imgLogo);
    divCard.appendChild(divCardInner);

    // Make date label element
    var divDate = document.createElement('div');
    divDate.className = 'date';
    divDate.innerText = game.date;
    divCard.appendChild(divDate);
    divCardWrapper.appendChild(divCard);

    // Finally, add the game to the track
    if (position == -1 || position > track.children.length) {
        track.appendChild(divCardWrapper);
    } else {
        track.insertBefore(divCardWrapper, track.children[position]);
    }
}

// All functions loaded, begin
main();