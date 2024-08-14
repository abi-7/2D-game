import { k } from "./kaboom";

//load character
//slice sheet into frames needed
k.loadSprite("spritesheet", "./spritesheet.png", {
    sliceX: 39,
    sliceY: 31,
    //attach names to animations
    anims: {
      "idle-down": 936,
      "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
      "idle-side": 975,
      "walk-side": { from: 975, to: 978, loop: true, speed: 8 },
      "idle-up": 1014,
      "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 },
    },
  });
  
  //load map
  k.loadSprite("map", "./map.png");
  
  k.setBackground(k.Color.fromHex("#311047"));
  