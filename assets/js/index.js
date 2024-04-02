function revertVisibility() {
  var elements = document.getElementsByClassName('text');
  for (var element of elements) {
    element.classList.remove('hidetext');
  }
}

function init() {
  revertVisibility();
}

window.addEventListener('load', (event) => {
  init();
});
