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

//defines scene
k.scene("main", async () => {
  //load & add map to screen
  const mapData = await (await fetch("./map.json")).json();
  const layers = mapData.layers; //extract layers from file
  console.log(mapData);
  const map = k.add([
    k.sprite("map"),
    k.pos(0),
    k.scale(scaleFactor), //scale up map since its pixel art
  ]);

  const player = k.make([
    k.sprite("spritesheet", { anim: "idle-down" }),
    k.area({ shape: new k.Rect(k.vec2(0, 3), 10, 10) }),
    k.body(),
    k.anchor("center"), //drawn in center not top corner
    k.pos(),
    k.scale(scaleFactor),
    { z: 10 },
    {
      speed: 250,
      direction: "down",
      isInDialogue: false,
    },
    "player",
  ]);

  for (const layer of layers) {
    if (layer.name === "boundaries") {
      for (const boundary of layer.objects) {
        map.add([
          //comes from tiled
          //hit box
          //position of game object - pos of hit box for game object (area)
          k.area({
            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
          }),
          //makes sure that  the player won't be able to pass over it, overlap
          k.body({ isStatic: true }),
          k.pos(boundary.x, boundary.y),
          boundary.name,
        ]);

        if (boundary.name) {
          //set collisoon events
          //check collision withs the player and the boundaray tag
          player.onCollide(boundary.name, () => {
            //runs when colision occurs
            //prevent player from moving when diagloue is in view
            player.isInDialogue = true;
            displayDialogue(
              dialogueData[boundary.name],
              () => (player.isInDialogue = false)
            );
          });
        }
      }
      continue;
    }

    if (layer.name === "spawnpoints") {
      for (const entity of layer.objects) {
        if (entity.name === "player") {
          player.pos = k.vec2(
            (map.pos.x + entity.x) * scaleFactor,
            (map.pos.y + entity.y) * scaleFactor
          );
          k.add(player);
        }
      }
    }
  }
});
