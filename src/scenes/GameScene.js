import Phaser from "phaser";

const GAME_DIMENSIONS = {
  width: 1280,
  height: 720,
};
const POTION_DIMENSIONS = {
  width: 139,
  height: 139,
};
const BUTTON_DIMENSIONS = {
  width: 150,
  height: 50,
};
const BUTTON_SPIN = {
  key: "spin",
  dimensions: BUTTON_DIMENSIONS,
};
const BUTTON_STOP = {
  key: "stop",
  dimensions: BUTTON_DIMENSIONS,
};
const SLOT_CONTAINER = {
  key: "container",
  dimensions: {
    width: 800,
    height: 568,
  },
};
const BG_MUSIC_KEY = "BG_Music";
const SPIN_MUSIC_KEY = "Spin_Music";
const BACKGROUND_IMG_KEY = "background";
const NUM_OF_REELS = 5;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("game-scene");
    this.btn = undefined;
    this.isSpinning = false;
    this.btnDisplay = "Spin";
    this.reelsStoppedState = undefined;
  }

  preload() {
    this.load.image(SLOT_CONTAINER.key, "assets/slotContainer.png");
    this.load.image(BUTTON_SPIN.key, "assets/button_spin.png");
    this.load.image(BUTTON_STOP.key, "assets/button_stop.png");
    this.load.image(BACKGROUND_IMG_KEY, "assets/background.png");
    this.load.audio(BG_MUSIC_KEY, "assets/BG_Music.wav");
    this.load.audio(SPIN_MUSIC_KEY, "assets/Spin.wav");

    this.loadReels();
    console.log("REACHEDDD");
  }

  loadReels() {
    for (let i = 1; i < NUM_OF_REELS + 1; i++) {
      this.load.multiatlas(
        `reel${i}`,
        `assets/reel${i}/frames.json`,
        `assets/reel${i}`
      );
    }
  }

  create() {
    // Play music background in a loop
    this.playBackgroundMusic();

    // Add background and slot container images
    this.addImg();

    // Add spin button
    this.addSpinBtn();

    // Add reels
    this.addReels();

    // Create reels spinning animation
    this.createReelSpinAnim();
  }

  addImg() {
    this.add.image(
      GAME_DIMENSIONS.width / 2,
      GAME_DIMENSIONS.height / 2,
      BACKGROUND_IMG_KEY
    );
    this.add.image(
      GAME_DIMENSIONS.width / 2,
      GAME_DIMENSIONS.height / 2,
      SLOT_CONTAINER.key
    );
  }

  createReelSpinAnim() {
    // Create Frame Names for each reel
    this.frameNames = [];
    for (let i = 1; i < NUM_OF_REELS + 1; i++) {
      this.frameNames[i] = this.anims.generateFrameNames(`reel${i}`, {
        start: 1,
        end: 4,
        prefix: "frame",
        suffix: ".png",
      });
    }

    // Create animation for each reel
    for (let i = 1; i < NUM_OF_REELS + 1; i++) {
      this.anims.create({
        key: `reel${i}Animation`,
        frames: this.frameNames[i],
        frameRate: 10,
        repeat: -1,
      });
    }
  }

  addReels() {
    this.reels = [];
    let offsetX = 3;
    let offsetY = 35;
    for (let i = 1; i < NUM_OF_REELS + 1; i++) {
      this.reels.push(
        this.add.sprite(
          0.5 * (GAME_DIMENSIONS.width - SLOT_CONTAINER.dimensions.width) +
            (i - 0.5) * POTION_DIMENSIONS.width +
            offsetX,
          0.5 * (GAME_DIMENSIONS.height - SLOT_CONTAINER.dimensions.height) +
            0.5 * POTION_DIMENSIONS.height +
            offsetY,
          `reel${i}`,
          `frame1.png`
        )
      );
    }
  }

  playBackgroundMusic() {
    let backgroundMusic = this.sound.add(BG_MUSIC_KEY, { loop: true });
    backgroundMusic.play();
  }

  addSpinBtn() {
    this.btn = this.add
      .sprite(
        GAME_DIMENSIONS.width / 2,
        GAME_DIMENSIONS.height / 2 + SLOT_CONTAINER.dimensions.height / 2,
        BUTTON_SPIN.key
      )
      .setInteractive();
    // Handle click event on btn
    this.btn.on("pointerdown", this.handleClickEvent.bind(this));
  }

  handleClickEvent() {
    console.log("Button clicked");

    // Clicking the button while the slot is spinning
    if (this.isSpinning) {
      // Change the button to stop
      if (this.btnDisplay === "Spin") {
        console.log(`Slot is moving, button changed to stop`);
        this.btnDisplay = "Stop";
        this.btn.setTexture(BUTTON_STOP.key);
      }
      // Clicking the stop button while the slot is moving
      else {
        // Stop all reels together
        this.stopReelsTogether();
        // Return the button to its initial state
        this.initBtn();
      }
    } else {
      console.log(`Slot begins to move`);
      console.log(`Disabling the button for 1 sec`);
      this.isSpinning = true;
      this.playSpinningAnimations();
      this.playSpinningMusic();
      this.btn.disableInteractive();
      this.btn.setAlpha(0.5);
      this.time.addEvent({
        delay: 1000,
        callback: () => {
          this.btn.setAlpha(1);
          this.btn.setInteractive();
          console.log(`Enabling the button`);
        },
      });
      this.time.addEvent({
        delay: 2000,
        callback: this.stopReelsOneByOne.bind(this),
      });
    }
  }

  stopReelsOneByOne() {
    console.log("2 Seconds have passed");
    this.reels.forEach((reel, i) => {
      reel.anims.stopAfterDelay((i + 1) * 300);
    });
    this.initBtn();
    this.isSpinning = false;
  }

  // When stopped, the first row should be with yello potions, second row with red potions and third row with purple potions
  stopReelsTogether() {
    this.reels.forEach((reel) => {
      reel.anims.stop();
      reel.setFrame("frame4.png");
    });
    this.isSpinning = false;
  }
  // Return the button to its initial state
  initBtn() {
    this.btn.setTexture(BUTTON_SPIN.key);
    this.btnDisplay = "Spin";
  }
  playSpinningMusic() {
    let spinMusic = this.sound.add(SPIN_MUSIC_KEY);
    spinMusic.play();
  }
  playSpinningAnimations() {
    this.reels.forEach((reel, i) => {
      reel.play(`reel${i + 1}Animation`);
    });
  }
}
