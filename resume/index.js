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

var debouncedUpdateIframeZoom = debounce(updateIframeZoom, 50);

function isMobileLandscape() {
  const isLandscape = window.innerWidth > window.innerHeight;
  const isSmallScreen = window.innerWidth <= 1024; // Consider screens smaller than or equal to 1024px width as mobile/tablet
  const isTouchDevice = !!("ontouchstart" in window);
  return isLandscape && isSmallScreen && (isTouchDevice || isMobileUserAgent());
}

function isMobileUserAgent() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function updateIframeZoom() {
  const iframe = document.querySelector("#pdfjs");
  try {
    const pdfWindow = iframe.contentWindow;
    const PDFViewerApplication = pdfWindow.PDFViewerApplication;
    if (pdfWindow && PDFViewerApplication) {
      const zoomType = isMobileLandscape() ? "page-width" : "page-fit";
      iframe.contentWindow.addEventListener("webviewerloaded", function () {
        PDFViewerApplication.pdfViewer.currentScaleValue = zoomType;
      });
      PDFViewerApplication.pdfViewer.currentScaleValue = zoomType;
    } else {
      console.warn("PDF.js API is not yet available.");
    }
  } catch (error) {
    console.warn("Unable to access PDF.js API due to different origin or iframe not loaded yet.", error);
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

document.addEventListener("webviewerloaded", function () {
  const iframe = document.querySelector("#pdfjs");
  const PDFViewerApplication = iframe.contentWindow.PDFViewerApplication;
  PDFViewerApplication.initializedPromise.then(() => {
    PDFViewerApplication.eventBus.on("documentloaded", function () {
      try {
        const viewerContainer = iframe.contentDocument.querySelector("#viewerContainer");
        if (viewerContainer) {
          viewerContainer.addEventListener("scroll", handleMoveEvent);
          debouncedUpdateIframeZoom();
          window.addEventListener("resize", function () {
            debouncedUpdateIframeZoom();
          });
        } else {
          console.warn("Viewer Container not loaded yet.");
        }
      } catch (error) {
        console.warn("Unable to access iframe content due to different origin.", error);
      }
    });
  });
});

window.onload = function () {
  sessionStorage.clear();
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
