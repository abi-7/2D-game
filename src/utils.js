export function displayDialogue(text, onDisplayEnd) {
  const dialogueUI = document.getElementById("textbox-container");
  const dialogue = document.getElementById("dialogue");

  //to show dialogue - makes textbox visible
  dialogueUI.style.display = "block";

  let currentText = "";
  currentText += text;
  dialogue.innerHTML = currentText;
  

  // let index = 0;
  // let currentText = "";
  // //function runs every 5 secs
  // const intervalRef = setInterval(() => {
  //   if (index < text.length) {
  //     currentText += text[index];
  //     dialogue.innerHTML = currentText; //helps render links as clickable links
  //     index++;
  //     return;
  //   }
  // }, speed);

  const closeBtn = document.getElementById("close");

  //close the dialogue box
  function onCloseBtnClick() {
    onDisplayEnd();
    dialogueUI.style.display = "none";
    dialogue.innerHTML - "";
    clearInterval(intervalRef);
    closeBtn.removeEventListener("click", onCloseBtnClick);
  }

  closeBtn.addEventListener("click", onCloseBtnClick);
}

//set scaling of the camera
export function setCamScale(k) {
  const resizeFactor = k.width() / k.height();
  if (resizeFactor < 1) {
    k.camScale(k.vec2(1));
  } else {
    k.camScale(k.vec2(1.5));
  }
}
