const GemPuzzle = {
    elements: {
        game: null,
        gameField: null,
        gameBlocks: [],
        mixButton: null,
        stopButton: null,
        stepsCount: null,
        timer: null,
    },

    properties: {
        gameFieldSize: 16,
        gameBlocksContent: [],
        timer: false,
    },

    init() {
        // localStorage.removeItem('mixedBlocks');
        // localStorage.removeItem('steps');
        // localStorage.removeItem('time');

        // create main elements
        this.elements.game = document.createElement('div');

        this.elements.gameProperties = document.createElement('div');
        this.elements.mixButton = document.createElement('button');
        this.elements.stopButton = document.createElement('button');
        this.elements.stepsCount = document.createElement('div');
        this.elements.timer = document.createElement('div');

        let buttons = document.createElement('div');
        let timeAndStepCount = document.createElement('div');

        this.elements.gameField = document.createElement('div');

        // add content
        this.elements.mixButton.textContent = 'mix and start';
        this.elements.stopButton.textContent = 'stop';


        if (!localStorage.time) {
            localStorage.setItem('time ', '00:00');
        }
        if (!localStorage.steps) {
            localStorage.setItem('steps', 0);
        }
        if (localStorage.mixedBlocks) {
            this.timer();
        }

        // setup main elements
        this.elements.game.classList.add('game');
        this.elements.gameField.classList.add('game-field');
        this.elements.gameProperties.classList.add('game-properties');
        this.elements.mixButton.classList.add('button','mix-button');
        this.elements.stopButton.classList.add('button','stop-button');
        this.elements.stepsCount.classList.add('steps-counter');
        this.elements.timer.classList.add('timer');
        buttons.classList.add('property-line');
        timeAndStepCount.classList.add('property-line')

        this.elements.gameField.appendChild(this.createGameBlocks());
        buttons.appendChild(this.elements.mixButton);
        buttons.appendChild(this.elements.stopButton);
        timeAndStepCount.appendChild(this.elements.stepsCount);
        timeAndStepCount.appendChild(this.elements.timer);
        // this.elements.gameProperties.appendChild(this.elements.mixButton);
        // this.elements.gameProperties.appendChild(this.elements.stepsCount);
        // this.elements.gameProperties.appendChild(this.elements.timer);
        // this.elements.gameProperties.appendChild(this.elements.stopButton);
        this.elements.gameProperties.appendChild(buttons);
        this.elements.gameProperties.appendChild(timeAndStepCount);
        this.elements.game.appendChild(this.elements.gameProperties);
        this.elements.game.appendChild(this.elements.gameField);

        // add to DOM
        document.body.appendChild(this.elements.game);

        document.querySelector('.steps-counter').textContent = 'steps: ' + localStorage.steps;
        this.elements.timer.textContent = 'time ' + localStorage.time;

        this.elements.gameBlocks = document.querySelectorAll('.game-field__block__content');
    },

    createGameBlocks() {
        const fragment = document.createDocumentFragment();

        let mixedBlocks = JSON.parse(localStorage.getItem('mixedBlocks'));

        for (let i = 0; i < this.properties.gameFieldSize; i++) {
            // creating array of our blocks numbers
            this.properties.gameBlocksContent.push(i);

            // creating block for each number
            const gameBlock = document.createElement('div');
            const gameBlockContent = document.createElement('div');
            gameBlock.appendChild(gameBlockContent);

            // adding styles
            gameBlock.classList.add('game-field__block');
            gameBlockContent.classList.add('game-field__block__content');
            gameBlockContent.style.top = '0px';
            gameBlockContent.style.left = '0px';

            // if continuing game we need to save previous result
            if (localStorage.mixedBlocks) {

                gameBlockContent.textContent = mixedBlocks[i];

                if (!mixedBlocks[i]) {
                    gameBlockContent.classList.add('empty');
                }
            } else { // if we start the game for the first time

                gameBlockContent.textContent = i;

                if (!i) {
                    gameBlockContent.classList.add('empty');
                }
            }
            fragment.appendChild(gameBlock);
        }
        return fragment;
    },

    mixGameBlocks() {
        let mixButton = document.querySelector('.mix-button');

        mixButton.addEventListener('click', () => {
            // make steps and time equal to 0
            localStorage.min = 0;
            localStorage.sec = 0;
            localStorage.steps = 0;

            // change content of stepCount block
            document.querySelector('.steps-counter').textContent = 'steps: ' + localStorage.steps;

            // if we start the game for the first time
            if (!localStorage.mixedBlocks) {
                localStorage.setItem('mixedBlocks', JSON.stringify(this.properties.gameBlocksContent.slice()));
            }

            let mixedBlocks = JSON.parse(localStorage.getItem('mixedBlocks'));

            // change places of blocks
            for (let i = mixedBlocks.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [mixedBlocks[i], mixedBlocks[j]] =
                    [mixedBlocks[j], mixedBlocks[i]];
            }

            // save value of the new array 
            localStorage.mixedBlocks = JSON.stringify(mixedBlocks);

            this.elements.gameBlocks.forEach((block, index) => {
                // remove styles
                block.style.top = '0px';
                block.style.left = '0px';
                block.classList.remove('empty');

                // add new content
                block.textContent = mixedBlocks[index];

                // add styles to empty block
                if (mixedBlocks[index] === 0) {
                    block.classList.add('empty');
                }
            });
            // turn on the timer
            if (!this.properties.timer) {
                this.timer();
            }
        });
    },

    changePlaces() {

        let gameField = document.querySelector('.game-field');
        let moving = document.querySelector('.game-field__block').offsetWidth;

        gameField.addEventListener('click', (event) => {
            if (event.target.classList.contains('game-field__block__content')) {

                let mixedBlocks = JSON.parse(localStorage.getItem('mixedBlocks'));

                // get coordinates of empty block
                let emptyPositionInRow = mixedBlocks.indexOf(0) % 4 + 1;
                let emptyPositionInColumn = Math.floor(mixedBlocks.indexOf(0) / 4);

                // get coordinates of clicked block
                let elementPositionInRow = mixedBlocks.indexOf(Number(event.target.textContent)) % 4 + 1;
                let elementPositionInColumn = Math.floor(mixedBlocks.indexOf(Number(event.target.textContent)) / 4);

                // if the clicked block and the empty block are on equal column
                if (emptyPositionInRow === elementPositionInRow) {

                    // get positions of clicked and empty block
                    let elemTop = Number(getComputedStyle(event.target).top.replace('px', ''));
                    let emptyTop = Number(getComputedStyle(document.querySelector('.empty')).top.replace('px', ''));

                    // add 1 to stepCount
                    localStorage.steps = Number(localStorage.steps) + 1;
                    document.querySelector('.steps-counter').textContent = 'steps: ' + localStorage.steps;

                    // if empty block upper than clicked block
                    if (mixedBlocks.indexOf(0) - mixedBlocks.indexOf(Number(event.target.textContent)) === 4) {

                        // change places
                        elemTop += moving;
                        emptyTop -= moving;
                        event.target.style.top = `${elemTop}px`;
                        document.querySelector('.empty').style.top = `${emptyTop}px`;

                        // change places in array of positions
                        [mixedBlocks[mixedBlocks.indexOf(0)], mixedBlocks[mixedBlocks.indexOf(Number(event.target.textContent))]] =
                            [mixedBlocks[mixedBlocks.indexOf(Number(event.target.textContent))], mixedBlocks[mixedBlocks.indexOf(0)]];

                        // save the array of positions
                        localStorage.mixedBlocks = JSON.stringify(mixedBlocks);

                    } else if (mixedBlocks.indexOf(Number(event.target.textContent)) - mixedBlocks.indexOf(0) === 4) {

                        // change places
                        elemTop -= moving;
                        emptyTop += moving;
                        event.target.style.top = `${elemTop}px`;
                        document.querySelector('.empty').style.top = `${emptyTop}px`;

                        // change places in array of positions
                        [mixedBlocks[mixedBlocks.indexOf(Number(event.target.textContent))], mixedBlocks[mixedBlocks.indexOf(0)]] =
                            [mixedBlocks[mixedBlocks.indexOf(0)], mixedBlocks[mixedBlocks.indexOf(Number(event.target.textContent))]];

                        // save the array of positions
                        localStorage.mixedBlocks = JSON.stringify(mixedBlocks);
                    }
                } else if (emptyPositionInColumn === elementPositionInColumn) { // if the clicked block and the empty block are on equal row

                    // get positions of clicked and empty block
                    let elemLeft = Number(getComputedStyle(event.target).left.replace('px', ''));
                    let emptyLeft = Number(getComputedStyle(document.querySelector('.empty')).left.replace('px', ''));

                    // add 1 to stepCount
                    localStorage.steps = Number(localStorage.steps) + 1;
                    document.querySelector('.steps-counter').textContent = 'steps: ' + localStorage.steps;

                    // if empty block is to the right if clicked block
                    if (mixedBlocks.indexOf(0) - mixedBlocks.indexOf(Number(event.target.textContent)) === 1) {

                        // change places
                        elemLeft += moving;
                        emptyLeft -= moving;
                        event.target.style.left = `${elemLeft}px`;
                        document.querySelector('.empty').style.left = `${emptyLeft}px`;

                        // change places in array of positions
                        [mixedBlocks[mixedBlocks.indexOf(0)], mixedBlocks[mixedBlocks.indexOf(Number(event.target.textContent))]] =
                            [mixedBlocks[mixedBlocks.indexOf(Number(event.target.textContent))], mixedBlocks[mixedBlocks.indexOf(0)]];

                        // save the array of positions
                        localStorage.mixedBlocks = JSON.stringify(mixedBlocks);
                    }
                    else if (mixedBlocks.indexOf(Number(event.target.textContent)) - mixedBlocks.indexOf(0) === 1) {

                        // change places
                        elemLeft -= moving;
                        emptyLeft += moving;
                        event.target.style.left = `${elemLeft}px`;
                        document.querySelector('.empty').style.left = `${emptyLeft}px`;

                        // change places in array of positions
                        [mixedBlocks[mixedBlocks.indexOf(Number(event.target.textContent))], mixedBlocks[mixedBlocks.indexOf(0)]] =
                            [mixedBlocks[mixedBlocks.indexOf(0)], mixedBlocks[mixedBlocks.indexOf(Number(event.target.textContent))]];

                        // save the array of positions
                        localStorage.mixedBlocks = JSON.stringify(mixedBlocks);
                    }
                }
                // if assemble the puzzle
                if (JSON.stringify(this.properties.gameBlocksContent) == JSON.stringify(mixedBlocks)) {
                    setTimeout(() => alert('Ура! Вы решили головоломку за' + localStorage.time + 'и' + this.properties.steps + 'ходов'), 4000);
                };
            }
        });
    },

    timer() {
        this.properties.timer = true;
        this.properties.time = setInterval(tick, 1000);

        function tick() {

            if (!localStorage.time && !localStorage.min) {
                localStorage.setItem('min', 0);
                localStorage.setItem('sec', 0);
            }

            localStorage.sec++;

            if (localStorage.sec >= 60) { 
                localStorage.min++;
                localStorage.sec -= 60;
            }
            else if (localStorage.sec < 10) { 
                if (localStorage.min < 10) {
                    localStorage.time = '0' + localStorage.min + ':0' + localStorage.sec;
                } else {
                    localStorage.time = localStorage.min + ':0' + localStorage.sec;
                }
            } else {
                if (localStorage.sec < 10) {
                    localStorage.time = '0' + localStorage.min + ':' + localStorage.sec;
                } else {
                    localStorage.time = localStorage.min + ':' + localStorage.sec;
                }
            }
            // change time visually
            document.querySelector('.timer').innerHTML = 'time ' + localStorage.time;
        }
    },

    stopTimer() {
        // if stop button clicked
        this.elements.stopButton.addEventListener('click', () => {

            let gameField = document.querySelector('.game-field'); 

            // stop the timer
            clearInterval(this.properties.time);
            this.properties.timer = false;
            
            // if timer stop and each of the blocks is clicked
            gameField.addEventListener('click', () => {
                // continue timer
                if (!this.properties.timer) {
                    this.timer();
                }
            });
        })
    }
}

window.addEventListener('DOMContentLoaded', () => {
    GemPuzzle.init();
    GemPuzzle.mixGameBlocks();
    GemPuzzle.changePlaces();
    GemPuzzle.stopTimer();
});