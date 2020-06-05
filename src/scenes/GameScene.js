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
const YELLOW_POTION = {
  key: "yellow",
  dimensions: POTION_DIMENSIONS,
};
const BLUE_POTION = {
  key: "blue",
  dimensions: POTION_DIMENSIONS,
};
const RED_POTION = {
  key: "red",
  dimensions: POTION_DIMENSIONS,
};
const PURPLE_POTION = {
  key: "purple",
  dimensions: POTION_DIMENSIONS,
};
const SLOT_CONTAINER = {
  key: "container",
  dimensions: {
    width: 800,
    height: 568,
  },
};
const BG_MUSIC_KEY = "BG_Music";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("game-scene");
    this.btn = undefined;
    this.isSpinning = false;
  }

  preload() {
    this.load.image(BUTTON_SPIN.key, "assets/button_spin.png");
    this.load.image(BUTTON_STOP.key, "assets/button_stop.png");
    this.load.image(YELLOW_POTION.key, "assets/yellow_potion.png");
    this.load.image(BLUE_POTION.key, "assets/blue_potion.png");
    this.load.image(RED_POTION.key, "assets/red_potion.png");
    this.load.image(PURPLE_POTION.key, "assets/purple_potion.png");
    this.load.image(SLOT_CONTAINER.key, "assets/slotContainer.png");

    this.load.audio(BG_MUSIC_KEY, "assets/BG_Music.wav");
  }

  create() {
    // Music_BG should play in a loop in the background
    this.playBackgroundMusic();

    this.add.image(
      GAME_DIMENSIONS.width / 2,
      GAME_DIMENSIONS.height / 2,
      SLOT_CONTAINER.key
    );

    // Add spin button
    this.addSpinBtn();
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
    this.btn.on("pointerdown", this.handleClickEvent.bind(this));
  }

  handleClickEvent() {
    console.log("Button clicked");

    // By clicking the spin button while the slot is moving it should change to Stop
    if (this.isSpinning) {
      console.log(`Slot is moving, change button to stop`);
      this.btn.setTexture(BUTTON_STOP.key);
    } else {
      console.log(`Slot is starting to move`);
      console.log(`Disabling the button for 1 sec`);
      this.isSpinning = true;
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
    }
  }
}
