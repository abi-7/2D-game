import { dialogueData, scaleFactor } from "./constant";
import { k } from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";

var modal = document.getElementById("myModal");
var btn = document.getElementById("modal-close");
var modalContent = document.getElementById("content");

//close the modal
btn.onclick = function () {
  modal.style.display = "none";
};

const sprites = {
  boyBrownHair: k.loadSprite("boy", "./spritesheet.png", {
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
  }),
  Ghost: k.loadSprite("ghost", "./spritesheet.png", {
    sliceX: 39,
    sliceY: 31,
    //attach names to animations
    anims: {
      "idle-down": 862,
      "walk-down": { from: 862, to: 863, loop: true, speed: 8 },
      "idle-side": 864,
      "walk-side": { from: 864, to: 865, loop: true, speed: 8 },
      "idle-up": 901,
      "walk-up": { from: 901, to: 902, loop: true, speed: 8 },
    },
  }),
};

//user will choose from list of sprites
//display content in modal
function displaySprites() {
  modalContent.innerHTML = ""; // Clear the modal content

  //create a list of sprite options
  Object.keys(sprites).forEach((spriteName) => {
    const spriteOption = document.createElement("div");
    spriteOption.classList.add("sprite-option");

    //add a label with the sprite name
    const label = document.createElement("p");
    label.textContent = spriteName;
    spriteOption.appendChild(label);

    //add a preview of the sprite
    //create a small Kaboom instance to render the sprite preview
    k.drawSprite({
      sprite: spriteName,
      pos: k.vec2(100, 200),
      frame: "idle-down",
    });

    //handle sprite selection
    spriteOption.onclick = () => {
      selectSprite(spriteName);
    };

    modalContent.appendChild(spriteOption);
  });

  modal.style.display = "block"; // Show the modal
}

//when modal is showing display options
function showModal() {
  if (modal.style.display !== "block") {
    displaySprites();
  }
}

showModal();

//get what user chose
function selectSprite(spriteName) {
  console.log(`Selected sprite: ${spriteName}`);

  //use the selected sprite to update the player sprite later in the main scene.
  selectedSprite = spriteName;
  modal.style.display = "none";
}

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

  //create player
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
          //check collision with the player and the boundaray tag
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

  setCamScale(k);

  k.onResize(() => {
    setCamScale(k);
  });
  //control camer follows player
  k.onUpdate(() => {
    k.camPos(player.pos.x, player.pos.y + 100);
  });

  //moving the player
  k.onMouseDown((mouseBtn) => {
    if (mouseBtn !== "left" || player.isInDialogue) return;

    //get world mouse pos
    //moveTo moves the player
    const worldMousePos = k.toWorld(k.mousePos());
    //target pos at what speed - params
    player.moveTo(worldMousePos, player.speed);

    const mouseAngle = player.pos.angle(worldMousePos);

    const lowerBound = 50;
    const upperBound = 125;

    if (
      mouseAngle > lowerBound &&
      mouseAngle < upperBound &&
      player.curAnim() !== "walk-up"
    ) {
      player.play("walk-up");
      player.direction = "up";
      return;
    }

    if (
      mouseAngle < -lowerBound &&
      mouseAngle > -upperBound &&
      player.curAnim() !== "walk-down"
    ) {
      player.play("walk-down");
      player.direction = "down";
      return;
    }

    if (Math.abs(mouseAngle) > upperBound) {
      player.flipX = false; //when player is flipped changes from true/flase
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
      return;
    }

    if (Math.abs(mouseAngle) < lowerBound) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
      return;
    }
  });

  //when no movement is happening player is in 'idle' mode
  k.onMouseRelease(() => {
    if (player.direction === "down") {
      player.play("idle-down");
      return;
    }
    if (player.direction === "up") {
      player.play("idle-up");
      return;
    }

    player.play("idle-side");
  });
});

k.go("main"); //go to main scene
