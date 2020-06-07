import Phaser from "phaser";

import * as constants from "../constants";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("game-scene");
    this.backgroundMusic = undefined;
    this.spinMusic = undefined;
    this.btn = undefined;
    this.btnDisplay = undefined;
    this.isReelsSpinning = false;
    this.reelsStopTimedEvent = undefined;
    this.frameNames = undefined;
    this.reels = undefined;
    this.resultText = undefined;
  }

  preload() {
    // Load image files
    this.load.image(constants.SLOT_CONTAINER.key, "images/slotContainer.png");
    this.load.image(constants.BUTTON_SPIN.key, "images/button_spin.png");
    this.load.image(constants.BUTTON_STOP.key, "images/button_stop.png");
    this.load.image(constants.BACKGROUND_IMG_KEY, "images/background.png");

    // Load audio files
    this.load.audio(constants.BG_MUSIC_KEY, "music/BG_Music.wav");
    this.load.audio(constants.SPIN_MUSIC_KEY, "music/Spin.wav");

    // Load texture atlas for the reels spinning animations
    this.loadTextureAtlas();
  }

  create() {
    // Play background music in a loop
    this.playBackgroundMusic();

    // Add background and slot container images
    this.addImages();

    // Add spin button
    this.addSpinButton();

    // Add reels
    this.addReels();

    // Create reels spinning animation
    this.createReelSpinAnim();

    // Add the result text
    this.addResultText();
  }

  // Foreach reel, load texture atlas to create the reels spinning animation
  loadTextureAtlas() {
    for (let i = 1; i < constants.NUM_OF_REELS + 1; i++) {
      this.load.multiatlas(
        `reel${i}`,
        `texture_atlas/reel${i}/frames.json`,
        `texture_atlas/reel${i}`
      );
    }
  }

  playBackgroundMusic() {
    this.backgroundMusic = this.sound.add(constants.BG_MUSIC_KEY, {
      loop: true,
    });
    this.backgroundMusic.play();
  }

  addImages() {
    this.add.image(
      constants.GAME_DIMENSIONS.width / 2,
      constants.GAME_DIMENSIONS.height / 2,
      constants.BACKGROUND_IMG_KEY
    );
    this.add.image(
      constants.GAME_DIMENSIONS.width / 2,
      constants.GAME_DIMENSIONS.height / 2,
      constants.SLOT_CONTAINER.key
    );
  }

  addResultText() {
    this.resultText = this.add.text(
      constants.GAME_DIMENSIONS.width / 2 -
        constants.SLOT_CONTAINER.dimensions.width / 2,
      constants.GAME_DIMENSIONS.height / 2 -
        constants.SLOT_CONTAINER.dimensions.height / 2 +
        constants.RESULT_TEXT_OFFSET_Y,
      "Result: 0",
      {
        fontSize: "32px",
        fill: "#fff",
      }
    );
  }

  createReelSpinAnim() {
    // Create frame names for each reel
    this.createFrameNames();

    // Create animation for each reel
    this.createAnimations();
  }

  createAnimations() {
    for (let i = 1; i < constants.NUM_OF_REELS + 1; i++) {
      this.anims.create({
        key: `reel${i}Animation`,
        frames: this.frameNames[i],
        frameRate: 12,
        repeat: -1,
      });
    }
  }

  createFrameNames() {
    this.frameNames = [];
    for (let i = 1; i < constants.NUM_OF_REELS + 1; i++) {
      this.frameNames[i] = this.anims.generateFrameNames(`reel${i}`, {
        start: 1,
        end: 4,
        prefix: "frame",
        suffix: ".png",
      });
    }
  }

  addSpinButton() {
    this.btnDisplay = "Spin";
    this.btn = this.add
      .sprite(
        constants.GAME_DIMENSIONS.width / 2,
        constants.GAME_DIMENSIONS.height / 2 +
          constants.SLOT_CONTAINER.dimensions.height / 2,
        constants.BUTTON_SPIN.key
      )
      .setInteractive();
    // Handle button click event
    this.btn.on("pointerdown", this.handleClickEvent.bind(this));
  }

  handleClickEvent() {
    // Clicking the button while the reels are spinning
    if (this.isReelsSpinning) {
      if (this.btnDisplay === "Spin") {
        // Change the button display to Stop
        this.btnDisplay = "Stop";
        this.btn.setTexture(constants.BUTTON_STOP.key);
      }
      // Clicking the stop button while the reels are spinning
      else {
        // Stop all reels together
        this.stopReelsTogether();
      }
    }
    // Clicking the button while the reels are not spinning
    else {
      this.disableButton();
      this.startReelsSpinning();
      this.addReelsStopEvent();
    }
  }

  // When the player presses Spin, after 2 seconds the slot should stop the reels 1 by 1.
  addReelsStopEvent() {
    this.reelsStopTimedEvent = this.time.addEvent({
      delay: constants.STOP_REELS_DELAY,
      callback: this.stopReelsOneByOne.bind(this),
    });
  }

  // When stopped, the first row should be with yellow potions, second row with red potions and third row with purple potions.
  stopReelsTogether() {
    // Stop each reel on frame with first row = yellow, second row = red and third row = purple
    this.reels.forEach((reel) => {
      reel.anims.stopOnFrame(
        reel.anims.currentAnim.frames[constants.STOP_REELS_FRAME_INDEX]
      );
    });
    this.initSlotMachine();
  }

  // Initiallize the slot machine
  initSlotMachine() {
    this.isReelsSpinning = false;
    this.initBtn();
    this.stopSpinningMusic();
    // Remove the event which after 2 seconds the slot should stop the reels 1 by 1
    this.reelsStopTimedEvent.remove();
  }

  startReelsSpinning() {
    this.isReelsSpinning = true;
    this.playSpinningAnimations();
    this.playSpinningMusic();
  }

  disableButton() {
    this.btn.disableInteractive();
    // Set button opacity to 50%
    this.btn.setAlpha(0.5);
    this.addButtonEnabledEvent();
  }

  // After 1 second from clicking play the button become enabled again
  addButtonEnabledEvent() {
    this.time.addEvent({
      delay: constants.BUTTON_ENABLE_DELAY,
      callback: () => {
        this.btn.setInteractive();
        // Set button opacity to 100%
        this.btn.setAlpha(1);
      },
    });
  }

  // Add the potions reels to the slot container
  addReels() {
    this.reels = [];

    for (let i = 1; i < constants.NUM_OF_REELS + 1; i++) {
      this.reels.push(
        this.add.sprite(
          0.5 *
            (constants.GAME_DIMENSIONS.width -
              constants.SLOT_CONTAINER.dimensions.width) +
            (i - 0.5) * constants.POTION_DIMENSIONS.width +
            constants.REELS_OFFSET_X,
          0.5 *
            (constants.GAME_DIMENSIONS.height -
              constants.SLOT_CONTAINER.dimensions.height) +
            0.5 * constants.POTION_DIMENSIONS.height +
            constants.REELS_OFFSET_Y,
          `reel${i}`,
          `frame1.png`
        )
      );
    }
  }

  // Stop the reels one by one after delay interval
  stopReelsOneByOne() {
    this.reels.forEach((reel, i) => {
      reel.anims.stopAfterDelay((i + 1) * constants.STOP_REELS_INTERVAL_DELAY);
    });

    this.initSlotMachine();
  }

  stopSpinningMusic() {
    this.spinMusic.stop();
  }

  // Return the button to its initial state
  initBtn() {
    this.btn.setTexture(constants.BUTTON_SPIN.key);
    this.btnDisplay = "Spin";
  }

  playSpinningMusic() {
    this.spinMusic = this.sound.add(constants.SPIN_MUSIC_KEY);
    this.spinMusic.play();
  }

  // Foreach reel, play its spinning animation
  playSpinningAnimations() {
    this.reels.forEach((reel, i) => {
      reel.play(`reel${i + 1}Animation`);
    });
  }
}
