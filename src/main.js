import Phaser from 'phaser'

import GameScene from './scenes/GameScene'

const config = {
	type: Phaser.AUTO,
	width: 1280,
	height: 720,
	scene: [GameScene]
}

export default new Phaser.Game(config)
