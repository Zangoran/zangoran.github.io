function debounce(func, wait) {
  var timeout;
  return function () {
    var context = this;
    var args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      func.apply(context, args);
    }, wait);
  };
}

var debouncedUpdateIframeSrc = debounce(updateIframeSrc, 50);

function isMobileLandscape() {
  const isLargeLandscape = window.innerWidth > window.innerHeight && window.matchMedia("(min-aspect-ratio: 16/9)").matches;
  const isTouchDevice = !!("ontouchstart" in window);
  return isLargeLandscape && (isTouchDevice || isMobileUserAgent());
}

function isMobileUserAgent() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function updateIframeSrc() {
  var iframe = document.querySelector("#pdfjs");
  var initialSrc = iframe.getAttribute("data-initial-src");
  var newSrc;
  if (isMobileLandscape()) {
    newSrc = initialSrc + "#zoom=page-width";
  } else {
    newSrc = initialSrc + "#zoom=page-fit";
  }
  if (iframe.src !== newSrc) {
    iframe.src = newSrc;
  }
}

function handleMoveEvent(event) {
  const viewerScrollTop = event.target.scrollTop;
  const viewerScrollHeight = event.target.scrollHeight;
  const viewerClientHeight = event.target.clientHeight;
  const pageOffsetY = sessionStorage.getItem("pageOffsetY");
  window.dispatchEvent(
    new CustomEvent("viewerScroll", {
      detail: {
        scrollTop: viewerScrollTop - pageOffsetY,
        scrollHeight: viewerScrollHeight - pageOffsetY,
        clientHeight: viewerClientHeight,
      },
    })
  );
}

window.onload = function () {
  console.log("on load");
  sessionStorage.clear();
  //debouncedUpdateIframeSrc();
  window.addEventListener("resize", function () {
    //debouncedUpdateIframeSrc();
  });
  const iframe = document.querySelector("#pdfjs");
  if (iframe.contentWindow) {
    const viewerContainer = iframe.contentDocument.querySelector("#viewerContainer");
    viewerContainer.addEventListener("scroll", handleMoveEvent);
  } else {
    console.warn("Iframe has different origin.");
  }
};

const fab = document.body.querySelector("#fab");
fab.addEventListener("click", () => {
  window.location.href = "/";
});

function addRootVariable(variableName, value) {
  const styleSheet = document.styleSheets[2];
  if (styleSheet) {
    let rootRuleIndex = -1;
    for (let i = 0; i < styleSheet.cssRules.length; i++) {
      if (styleSheet.cssRules[i].selectorText === ":root") {
        rootRuleIndex = i;
        break;
      }
    }
    if (rootRuleIndex !== -1) {
      styleSheet.cssRules[rootRuleIndex].style.setProperty(variableName, value);
    } else {
      styleSheet.insertRule(`:root { ${variableName}: ${value}; }`, styleSheet.cssRules.length);
    }
  } else {
    console.error("StyleSheet not found.");
  }
}

function handleStorageChange(event) {
  if (event.key === "verticalScrollbarWidth") {
    const verticalScrollbarWidth = sessionStorage.getItem("verticalScrollbarWidth");
    addRootVariable("--vertical-scrollbar-width", `${verticalScrollbarWidth}px`);
  } else if (event.key === "horizontalScrollbarWidth") {
    const horizontalScrollbarWidth = sessionStorage.getItem("horizontalScrollbarWidth");
    addRootVariable("--horizontal-scrollbar-width", `${horizontalScrollbarWidth}px`);
  }
}

window.addEventListener("storage", handleStorageChange);
