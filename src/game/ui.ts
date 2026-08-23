import Phaser from 'phaser';

interface ButtonOptions {
  width?: number;
  height?: number;
  background?: number;
  disabled?: boolean;
}

export function button(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  options: ButtonOptions = {},
): Phaser.GameObjects.Container {
  const width = options.width ?? 220;
  const height = options.height ?? 56;
  const background = options.disabled ? 0x343943 : (options.background ?? 0xe9b949);

  const rect = scene.add.rectangle(0, 0, width, height, background, 1).setStrokeStyle(2, 0xffffff, 0.12);
  const text = scene.add.text(0, 0, label, {
    fontFamily: 'Arial, sans-serif',
    fontSize: '20px',
    fontStyle: 'bold',
    color: options.disabled ? '#858b96' : '#101216',
    align: 'center',
  }).setOrigin(0.5);

  const container = scene.add.container(x, y, [rect, text]);

  if (!options.disabled) {
    rect.setInteractive({ useHandCursor: true });
    rect.on('pointerover', () => rect.setAlpha(0.86));
    rect.on('pointerout', () => rect.setAlpha(1));
    rect.on('pointerdown', () => rect.setScale(0.98));
    rect.on('pointerup', () => {
      rect.setScale(1);
      onClick();
    });
  }

  return container;
}
