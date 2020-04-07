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
    // create main elements
    this.elements.game = document.createElement('div');

    this.elements.gameProperties = document.createElement('div');
    this.elements.mixButton = document.createElement('button');
    this.elements.stopButton = document.createElement('button');
    this.elements.stepsCount = document.createElement('div');
    this.elements.timer = document.createElement('div');

    const buttons = document.createElement('div');
    const timeAndStepCount = document.createElement('div');

    this.elements.gameField = document.createElement('div');

    // add content
    this.elements.mixButton.textContent = 'mix and start';
    this.elements.stopButton.textContent = 'stop';


    if (!localStorage.time) {
      localStorage.setItem('time', '00:00');
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
    this.elements.mixButton.classList.add('button', 'mix-button');
    this.elements.stopButton.classList.add('button', 'stop-button');
    this.elements.stepsCount.classList.add('steps-counter');
    this.elements.timer.classList.add('timer');
    buttons.classList.add('property-line');
    timeAndStepCount.classList.add('property-line');

    this.elements.gameField.appendChild(this.createGameBlocks());
    buttons.appendChild(this.elements.mixButton);
    buttons.appendChild(this.elements.stopButton);
    timeAndStepCount.appendChild(this.elements.stepsCount);
    timeAndStepCount.appendChild(this.elements.timer);
    this.elements.gameProperties.appendChild(buttons);
    this.elements.gameProperties.appendChild(timeAndStepCount);
    this.elements.game.appendChild(this.elements.gameProperties);
    this.elements.game.appendChild(this.elements.gameField);

    // add to DOM
    document.body.appendChild(this.elements.game);

    document.querySelector('.steps-counter').textContent = `steps: ${localStorage.steps}`;
    this.elements.timer.textContent = 'time: '+ localStorage.time;

    this.elements.gameBlocks = document.querySelectorAll('.game-field__block__content');
  },

  createGameBlocks() {
    const fragment = document.createDocumentFragment();

    const mixedBlocks = JSON.parse(localStorage.getItem('mixedBlocks'));

    for (let i = 0; i < this.properties.gameFieldSize; i += 1) {
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
    const mixButton = document.querySelector('.mix-button');

    mixButton.addEventListener('click', () => {
      // make steps and time equal to 0
      localStorage.min = 0;
      localStorage.sec = 0;
      localStorage.steps = 0;

      // change content of stepCount block
      document.querySelector('.steps-counter').textContent = `steps: ${localStorage.steps}`;

      // if we start the game for the first time
      if (!localStorage.mixedBlocks) {
        localStorage.setItem('mixedBlocks', JSON.stringify(this.properties.gameBlocksContent.slice()));
      }

      const mixedBlocks = JSON.parse(localStorage.getItem('mixedBlocks'));

      // change places of blocks
      for (let i = mixedBlocks.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [mixedBlocks[i], mixedBlocks[j]] = [mixedBlocks[j], mixedBlocks[i]];
      }

      // save value of the new array
      localStorage.mixedBlocks = JSON.stringify(mixedBlocks);

      this.elements.gameBlocks.forEach((block, index) => {
        const gameBlock = block;
        // remove styles
        gameBlock.style.top = '0px';
        gameBlock.style.left = '0px';
        gameBlock.classList.remove('empty');

        // add new content
        gameBlock.textContent = mixedBlocks[index];

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
    const gameField = document.querySelector('.game-field');
    const moving = document.querySelector('.game-field__block').offsetWidth;

    gameField.addEventListener('click', (event) => {
      const clickedBlock = event.target;
      if (clickedBlock.classList.contains('game-field__block__content')) {
        const mixedBlocks = JSON.parse(localStorage.getItem('mixedBlocks'));

        // get coordinates of empty block
        const emptyPositionInRow = (mixedBlocks.indexOf(0) % 4) + 1;
        const emptyPositionInCol = Math.floor(mixedBlocks.indexOf(0) / 4);

        // get coordinates of clicked block
        const elemPositionInRow = (mixedBlocks.indexOf(Number(clickedBlock.textContent))
        % 4) + 1;
        const elemPositionInCol = Math.floor(mixedBlocks.indexOf(Number(clickedBlock.textContent))
         / 4);

        // if the clicked block and the empty block are on equal column
        if (emptyPositionInRow === elemPositionInRow) {
          // get positions of clicked and empty block
          let elemTop = Number(getComputedStyle(clickedBlock).top.replace('px', ''));
          let emptyTop = Number(getComputedStyle(document.querySelector('.empty')).top.replace('px', ''));

          // add 1 to stepCount
          localStorage.steps = Number(localStorage.steps) + 1;
          document.querySelector('.steps-counter').textContent = `steps: ${localStorage.steps}`;

          // if empty block upper than clicked block
          if (mixedBlocks.indexOf(0) - mixedBlocks.indexOf(Number(clickedBlock.textContent))
          === 4) {
            // change places
            elemTop += moving;
            emptyTop -= moving;
            clickedBlock.style.top = `${elemTop}px`;
            document.querySelector('.empty').style.top = `${emptyTop}px`;

            // change places in array of positions
            const indexOfClickedElem = mixedBlocks.indexOf(Number(clickedBlock.textContent));
            [mixedBlocks[mixedBlocks.indexOf(0)],
              mixedBlocks[indexOfClickedElem]] = [mixedBlocks[indexOfClickedElem],
              mixedBlocks[mixedBlocks.indexOf(0)]];

            // save the array of positions
            localStorage.mixedBlocks = JSON.stringify(mixedBlocks);
          } else if (mixedBlocks.indexOf(Number(clickedBlock.textContent)) - mixedBlocks.indexOf(0)
          === 4) {
            // change places
            elemTop -= moving;
            emptyTop += moving;
            clickedBlock.style.top = `${elemTop}px`;
            document.querySelector('.empty').style.top = `${emptyTop}px`;

            // change places in array of positions
            [mixedBlocks[mixedBlocks.indexOf(Number(clickedBlock.textContent))],
              mixedBlocks[mixedBlocks.indexOf(0)]] = [mixedBlocks[mixedBlocks.indexOf(0)],
              mixedBlocks[mixedBlocks.indexOf(Number(clickedBlock.textContent))]];

            // save the array of positions
            localStorage.mixedBlocks = JSON.stringify(mixedBlocks);
          } // if the clicked block and the empty block are on equal row
        } else if (emptyPositionInCol === elemPositionInCol) {
          // get positions of clicked and empty block
          let elemLeft = Number(getComputedStyle(clickedBlock).left.replace('px', ''));
          let emptyLeft = Number(getComputedStyle(document.querySelector('.empty')).left.replace('px', ''));

          // add 1 to stepCount
          localStorage.steps = Number(localStorage.steps) + 1;
          document.querySelector('.steps-counter').textContent = `steps: ${localStorage.steps}`;

          // if empty block is to the right if clicked block
          if (mixedBlocks.indexOf(0) - mixedBlocks.indexOf(Number(clickedBlock.textContent))
          === 1) {
            // change places
            elemLeft += moving;
            emptyLeft -= moving;
            clickedBlock.style.left = `${elemLeft}px`;
            document.querySelector('.empty').style.left = `${emptyLeft}px`;

            // change places in array of positions
            const indexOfClickedElem = mixedBlocks.indexOf(Number(clickedBlock.textContent));
            [mixedBlocks[mixedBlocks.indexOf(0)],
              mixedBlocks[indexOfClickedElem]] = [mixedBlocks[indexOfClickedElem],
              mixedBlocks[mixedBlocks.indexOf(0)]];

            // save the array of positions
            localStorage.mixedBlocks = JSON.stringify(mixedBlocks);
          } else if (mixedBlocks.indexOf(Number(clickedBlock.textContent)) - mixedBlocks.indexOf(0)
          === 1) {
            // change places
            elemLeft -= moving;
            emptyLeft += moving;
            clickedBlock.style.left = `${elemLeft}px`;
            document.querySelector('.empty').style.left = `${emptyLeft}px`;

            // change places in array of positions
            [mixedBlocks[mixedBlocks.indexOf(Number(clickedBlock.textContent))],
              mixedBlocks[mixedBlocks.indexOf(0)]] = [mixedBlocks[mixedBlocks.indexOf(0)],
              mixedBlocks[mixedBlocks.indexOf(Number(clickedBlock.textContent))]];

            // save the array of positions
            localStorage.mixedBlocks = JSON.stringify(mixedBlocks);
          }
        }
        // if assemble the puzzle
        if (JSON.stringify(this.properties.gameBlocksContent) === JSON.stringify(mixedBlocks)) {
          setTimeout(() => alert(`Ура! Вы решили головоломку за ${localStorage.time} и ${this.properties.steps} ходов`), 4000); // eslint-disable-line no-alert
        }
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

      localStorage.sec = Number(localStorage.sec) + 1;

      if (localStorage.sec >= 60) {
        localStorage.min = Number(localStorage.min) + 1;
        localStorage.sec = Number(localStorage.sec) - 60;
      } else if (localStorage.sec < 10) {
        if (localStorage.min < 10) {
          localStorage.time = `0${localStorage.min}:0${localStorage.sec}`;
        } else {
          localStorage.time = `${localStorage.min}:0${localStorage.sec}`;
        }
      } else if (localStorage.sec < 10) {
        localStorage.time = `0${localStorage.min}:${localStorage.sec}`;
      } else {
        localStorage.time = `${localStorage.min}:${localStorage.sec}`;
      }
      // change time visually
      document.querySelector('.timer').innerHTML = `time: ${localStorage.time}`;
    }

  },

  stopTimer() {
    // if stop button clicked
    this.elements.stopButton.addEventListener('click', () => {
      const gameField = document.querySelector('.game-field');

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
    });
  },
};

window.addEventListener('DOMContentLoaded', () => {
  GemPuzzle.init();
  GemPuzzle.mixGameBlocks();
  GemPuzzle.changePlaces();
  GemPuzzle.stopTimer();
});
