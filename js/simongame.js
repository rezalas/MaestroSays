
var CBGames = CBGames || {};
CBGames.SimonGame = CBGames.SimonGame || {
    isGameActive: false,
    isPaused: true,
    colorBlockMarker: "simonBlock",
    colorList: ["red","yellow","green","blue"],
    currentRound: 0,
    redSound: new Howl({src:["./sound/1cMONO16.wav"],
                        onplay: function() { CBGames.SimonGame.toggleColor("red"); },
                        onend: function() { CBGames.SimonGame.playOnEnd(); },
                        buffer: true }), //onplay: toggleColor("red"),
    yellowSound: new Howl({src:["./sound/2gMONO16.wav"],
                        onplay: function() { CBGames.SimonGame.toggleColor("yellow"); },
                        onend: function() { CBGames.SimonGame.playOnEnd(); },
                        buffer: true }),
    greenSound: new Howl({src:["./sound/3AminMONO16.wav"],
                        onplay: function() { CBGames.SimonGame.toggleColor("green"); },
                        onend: function() { CBGames.SimonGame.playOnEnd(); },
                        buffer: true }),
    blueSound: new Howl({src:["./sound/4fMONO16.wav"],
                        onplay: function() { CBGames.SimonGame.toggleColor("blue"); },
                        onend: function() { CBGames.SimonGame.playOnEnd(); },
                        buffer: true }),
    maxRounds: 10,
    
    generatedPattern: [],
    playlist: [],
    playerSequence: [],

    buildPattern: function() {
        this.generatedPattern.splice(0,this.generatedPattern.length); // clear() function workaround for ECMA arrays, now with zero performance impact!
        
        for(var i = 0; i < this.maxRounds; i++) { //build the pattern cap based on the max rounds, enabling difficulty selection
            this.generatedPattern.push(Math.floor(Math.random() * 4));
        }
        //console.log(this.generatedPattern);
    },
    nextRound: function() {
        if(this.validatePlayerSequence()) {
            this.playerSequence.splice(0,this.playerSequence.length);
            this.currentRound++;
            if(this.currentRound < this.maxRounds) { // keep going!
                
                this.PlaySequenceToNumber(this.currentRound + 1);

            } else { // you win, stop already!
                this.isPaused = true;
                this.isGameActive = false;

                var banner = document.getElementsByClassName("statusBanner")[0];
                var ptext = banner.getElementsByTagName("p")[0]
                ptext.innerText = "You Win! You've completed " + (this.currentRound) + " rounds, you're epic!";
                banner.show();
            }
        } else { // flash an error color to let the player know the sequence was wrong
             this.playerSequence.splice(0,this.playerSequence.length);
             errorElement = document.getElementById("submitit");
             errorElement.classList.add("errorBtnColor");
             setTimeout(function() {
               errorElement.classList.remove("errorBtnColor");
                setTimeout(function() {
                    CBGames.SimonGame.PlaySequenceToNumber(CBGames.SimonGame.currentRound + 1);
                },200);
            },300);          
            // start the round over           
        }
    },

    playGame: function() {
        if(this.isGameActive) {
            // notify player the game is active, and prompt for restart option
        } else {
            // reset the round count, build a new pattern for the game, start the game, notify the player the round started, and play the first sequence
            this.currentRound = 0; 
            this.buildPattern();
            this.isGameActive = true;
            this.isPaused = false;
            this.PlaySequenceToNumber(this.currentRound + 1);
        }
    },

    playOnEnd: function(e) {
        if(this.playlist.length > 0) {
            var soundId = this.playlist.shift();
            switch(soundId) {
                case 0:
                    this.redSound.play();
                    break;
                case 1:
                    this.yellowSound.play();
                    break;
                case 2:
                    this.greenSound.play();
                    break;
                case 3:
                    this.blueSound.play();
                    break;
            }
        }
    },

    PlaySequenceToNumber: function(num) {
        
        if(this.redSound.playing() || this.yellowSound.playing() || this.greenSound.playing() || this.blueSound.playing()) { 
            // don't start a sequence if audio is still playing, preventing runaway triggers. Will try again after the timeout.
            setTimeout(function() { CBGames.SimonGame.PlaySequenceToNumber(num); }, 150);
            return;
        }
        if(num > this.generatedPattern.length) {
            num = this.generatedPattern.length;
        }
        this.playlist.splice(0,this.playlist.length); // this works in place of a clear() function with ECMA arrays.

        for(var i = 0; i < num; i++) {
            this.playlist.push(this.generatedPattern[i]);   
        }
        //console.log(this.playlist);
        this.playOnEnd(0);
    },

    PlaySound: function(colorId) {
        var id = this.colorList.indexOf(colorId);
        switch(id) {
            case 0:
                this.redSound.play();
                break;
            case 1:
                this.yellowSound.play();
            break;
            case 2:
                this.greenSound.play();
                break;
            case 3:
                this.blueSound.play();
                break;
        }
    },

    showGameMenu: function() {
        this.isPaused = true;
        document.getElementById("freePlay").classList.add("hidden");
        document.getElementsByClassName("statusBanner")[0].classList.add("hidden");
        document.getElementById("gameMenu").classList.remove("hidden");
    },

    toggleColor: function(buttonId) {       
        elem = document.getElementById(buttonId);
        elem.animate({"opacity": 0.75 },200)
        elem.animate({"opacity": 1 },200);        
    },

    /**
     * Summary: Verify if the player sequence is correct first by checking length, then by performing a sequence check.
     */
    validatePlayerSequence: function() {
        this.isPaused = true; // disable player button presses while validating.
        var successfulRepeat = true;
        var roundLen = this.currentRound + 1;
        if( roundLen == this.playerSequence.length) {
            for(var i = 0; i < roundLen; i++) {
                if(this.playerSequence[i] != this.generatedPattern[i]) {
                    successfulRepeat = false;
                }
            }
        } else {
            successfulRepeat = false;
        }

        this.isPaused = false; // enable player button presses when done validating.
        return successfulRepeat;
    }

};

[].slice.call(document.getElementsByClassName("simonBlock")).forEach(item => 
    item.onclick = function() {
    if(CBGames.SimonGame.isPaused == false) {
        var pressedId = this.id;

        CBGames.SimonGame.PlaySound(pressedId);
        if(CBGames.SimonGame.isGameActive) {
            CBGames.SimonGame.playerSequence.push(CBGames.SimonGame.colorList.indexOf(pressedId));
        } else {
            CBGames.SimonGame.generatedPattern.push(CBGames.SimonGame.colorList.indexOf(pressedId));
        }
    }
});

document.getElementById("playit").onclick = function() {
    CBGames.SimonGame.PlaySequenceToNumber(CBGames.SimonGame.maxRounds);
};

document.getElementById("submitit").onclick = function() {
    if(CBGames.SimonGame.isGameActive) {
        CBGames.SimonGame.nextRound();
    }    
};

document.getElementById("startGame").onclick = function() {
    if(CBGames.SimonGame.isGameActive == false) {
        var difficulty = parseInt((document.getElementById("difficultySetting").value));
        if(difficulty == 0) {
            // selected free play, don't start the game just move the bar out of the way.
            document.getElementById("gameMenu").classList.add("hidden")
            document.getElementById("freePlay").classList.remove("hidden");
            CBGames.SimonGame.isPaused = false;
        } else {
            CBGames.SimonGame.maxRounds = difficulty;
            document.getElementById("gameMenu").classList.add("hidden");
            CBGames.SimonGame.playGame();
        }
        
    }    
};

[].slice.call(document.getElementsByClassName("showGameMenu")).forEach(item => item.onclick = function() {
    CBGames.SimonGame.showGameMenu();
});

document.getElementById("clearMix").onclick = function(){
    CBGames.SimonGame.generatedPattern.splice(0,CBGames.SimonGame.generatedPattern.length);
};

document.getElementById("playMix").onclick = function() {
    CBGames.SimonGame.PlaySequenceToNumber(CBGames.SimonGame.generatedPattern.length);
};