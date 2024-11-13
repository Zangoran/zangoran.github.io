import { revertVisibility } from "./shared.js";

function getTextRect(containerNode) {
  let textRect;
  let textRange = document.createRange();
  textRange.selectNodeContents(containerNode);
  textRect = textRange.getBoundingClientRect();
  textRange.detach();
  return textRect;
}

function resizeSubheader() {
  const container = document.getElementById("header");
  const textRect = getTextRect(container);
  document.getElementById("subheaderContainer").style.width = textRect.width + "px";
}

window.addEventListener("load", () => {
  revertVisibility();
  resizeSubheader();
});
window.addEventListener("resize", () => {
  resizeSubheader();
});
