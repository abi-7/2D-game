import kaboom from "kaboom";

export const k = kaboom({
    global: false,
    //translates all touch events to click events
    touchToMouse: true,
    //give this canvas to kaboom to use
    canvas: document.getElementById("game"),
})