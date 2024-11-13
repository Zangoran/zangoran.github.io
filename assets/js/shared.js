export function revertVisibility() {
  var elements = document.getElementsByClassName("text");
  for (var element of elements) {
    element.classList.remove("hidetext");
  }
}
