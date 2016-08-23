//Hangman game
(function() {
    //variables
    var randomWord;
    var usersInput = [];
    var matchedLetters = [];
    var unMatchedLetters = [];
    var responseText;
    var wordReceived = true;
    var words = ['hangman','academy' ,'javascript' , 'computer' , 'berlin'];
    var startButton = document.getElementById('startButton');
    var startAgain = document.getElementById('startAgain');
    var userInputButton = document.getElementById('inputButton');
    var usersInputField = document.getElementById('inputLetter');
    var guessWordButton = document.getElementById('guessaWordButton');
    var inputFieldForGuessing = document.getElementById('inputGuess');
    var questionMessage = document.getElementById('questionMessage');
    var yes = document.getElementById('yes');
    var no = document.getElementById('no');
    var askForWord = document.getElementById('askForWord');
    var askForletter = document.getElementById('askForLetter');
    var submitaWord = document.getElementById('submitaWord');


    var stick = document.getElementById('stickFigure');
    var bodyParts = stick.getElementsByTagName('div');
    //initial state (invisible) of stick figure
    for (i = 0; i < bodyParts.length; i++) {
        bodyParts[i].style.display = 'none';
    };
    var unique = {};
    var uniqueArray = [];
    //initially majority of buttons and fields is set to be invisible
    inputFieldForGuessing.style.display = 'none';
    usersInputField.style.display = 'none';
    userInputButton.style.display = 'none';
    questionMessage.style.display = 'none';
    yes.style.display = 'none';
    no.style.display = 'none';
    askForWord.style.display = 'none';
    askForletter.style.display = 'none';
    submitaWord.style.display = 'none';
    startAgain.style.display = 'none';

    //starting a game by pressing a start button
    startButton.addEventListener('click', function () {
        startButton.style.display = 'none';
        document.getElementById('end').classList.remove('over');
        //setting random word
        getRandomWordFromAPI();
        //asking user if he wants to guess word or start guessing letters
        document.getElementById('questionMessage').style.display = 'block';
        //displaying 'yes' and 'no' buttons
        yes.style.display = 'block';
        no.style.display = 'block';
        //event handler for yes button
        yes.addEventListener('click', function () {
            no.style.display = 'none';
            questionMessage.style.display = 'none';
            yes.style.display = 'none';
            inputFieldForGuessing.style.display = 'block';
            askForWord.style.display = 'block';
            submitaWord.style.display = 'block';
            submitaWord.addEventListener('click', function () {
                usersInput.push(inputFieldForGuessing.value);
                console.log(usersInput);
                matchLetters();
                if (usersInput != randomWord) {
                    document.getElementById('end').classList.add('over');
                    document.getElementById('end').innerHTML = 'YOU LOST!';
                    startAgain.style.top = '150px';
                    startAgain.style.display = 'block';
                }
            })
        });
        //event handler for no button
        no.addEventListener('click', function() {
            usersInputField.style.display = 'block';
            userInputButton.style.display = 'block';
            askForletter.style.display = 'block';
            questionMessage.style.display = 'none';
            yes.style.display = 'none';
            no.style.display = 'none';
            userInputButton.addEventListener('click', function() {
                usersInput.push(usersInputField.value);
                usersInputField.value = '';
                console.log(usersInput);
                matchLetters();
            });
        })
    });
    //receiving input letters from  user
    function matchLetters() {
        for (var i = 0; randomWord[i]; i++) {
            if (usersInput.indexOf(randomWord[i]) > -1 && matchedLetters.indexOf(randomWord[i]) == -1) {
                matchedLetters.push(randomWord[i]);
                showLetter(randomWord[i]);
            }
        }
        unMatchedLetters = usersInput.filter(function(letter) {
            return matchedLetters.indexOf(letter) == -1;
        });
        document.getElementById('wrongLetters').innerHTML = unMatchedLetters;
        for (var i = 0; unMatchedLetters[i]; i++) {
            bodyParts[i].style.display = 'block';
        }
        if (unMatchedLetters.length == bodyParts.length) {
            document.getElementById('end').classList.add('over');
            document.getElementById('end').innerHTML = 'YOU LOST!';
            startAgain.style.top = '150px';
            startAgain.style.display = 'block';
        }
        if (usersInput.toString() == uniqueArray.toString() || usersInput == randomWord) {
            document.getElementById('end').classList.add('gameWon');
            document.getElementById('end').innerHTML = 'YOU WON!';
            startAgain.style.top = '150px';
            startAgain.style.display = 'block';
        }
    }
    //function that display a matched letter on blanks
    function showLetter(letter) {
        console.log(letter);
        var elems = document.getElementsByClassName('blank');
        for (var i = 0; elems[i]; i++) {
            if (randomWord[i] == letter) {
                elems[i].innerHTML = letter;
                elems[i].style.fontSize = '30px';
                elems[i].style.fontStyle = 'normal';
            }
        }
    }
    // getting random word from API
    function getRandomWordFromAPI() {
        var xhr = new XMLHttpRequest;
        xhr.addEventListener('readystatechange', function() {
            if (xhr.readyState != XMLHttpRequest.DONE) {
                return;
            }
            var status;
            try {
                status = xhr.status;
            } catch(e) {
                console.log('Processing... Please wait');
                setRandomWord();
                return;
            }
            if (status != 200) {
                console.log('Something is wrong');
                setRandomWord();
                //set words from array
                return;
            }
            responseText = xhr.responseText;
            // do something with responseText
            wordReceived = true;
            setRandomWord();
            for (var i = 0; randomWord[i]; i++) {
                unique[randomWord[i]] = 1;
            }
            for ( n in unique) {
                uniqueArray.push(n);
            }
        });
        var randomnumber = Math.floor(Math.random() * (12 - 6 + 1)) + 6;
        xhr.open('GET', 'http://randomword.setgetgo.com/get.php?len=' + randomnumber);
        xhr.send();
    };
    //setting random word from array
    function setRandomWord() {
        if (wordReceived == true) {
            randomWord = responseText.toLowerCase();
        } else {
            randomWord = words[Math.floor(Math.random() * words.length)];
        }
        console.log(randomWord);
        createBlanks();
    };
    //creating blank spaces for number of letters of random word
    function createBlanks() {
        var html = '';
        var i;
        for (i = 0; i < randomWord.length; i++) {
            html += '<div class="blank"></div>';
        }
        document.getElementById('blanks').innerHTML = html;
    }
})();

//how to start new game?
//create a function? setting conditions for new game?
