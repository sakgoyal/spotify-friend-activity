import "regenerator-runtime/runtime"; // Needed for async/await.
import { render } from "preact";
import { FriendActivity, getWebAccessToken, getFriendActivity } from "./components/FriendActivity";

/**
 * Toggles the FriendActivity component on or off depending on toggleOn.
 *
 * @param {bool} toggleOn Whether to toggle the FriendActivity on or off.
 */
const toggleFriendActivity = async (toggleOn) => {
  const mainView = await waitUntilRender(".main-view-container"); // Wait for an existing Spotify DOM element to render.
  const mainViewParent = mainView.parentElement;
  const mainWindow = mainViewParent.parentElement;

  const toggleButton = document.createElement("div");
  toggleButton.classList.add("toggle-button");
  toggleButton.addEventListener("click", async () => {
    const buddyFeedStyle = document.getElementsByClassName("buddy-feed")[0];
    buddyFeedStyle.style.display = buddyFeedStyle.style.display === "none" ? "block" : "none";
  });
  const toggleButtonImg = document.createElement("img");
  toggleButtonImg.src = "https://i.imgur.com/6vi3ThF.png"; // FIXME Replace with icon in the assets folder.
  toggleButtonImg.alt = "Toggle Friend Activity";
  toggleButtonImg.style.cssText = "width: 32px; height: 32px; padding: 8px; vertical-align: middle;";
  toggleButton.appendChild(toggleButtonImg);
  const buttonArea = document.getElementsByTagName("footer")[0].children[0].children[2].children[0];
  buttonArea.insertBefore(toggleButton, buttonArea.children[0]);
  const newPlayingView = buttonArea.children[1];
  newPlayingView.addEventListener("click", () => {
    const buddyFeedStyle = document.getElementsByClassName("buddy-feed")[0];
    buddyFeedStyle.style.display = "none";
  });


  // If FriendActivity needs to toggle on.
  if (toggleOn) {
    const buddyFeed = document.createElement("div");
    buddyFeed.classList.add("buddy-feed");
    mainWindow.insertBefore(buddyFeed, mainViewParent); // Insert buddyFeed before mainViewParent.
    mainViewParent.setAttribute("style", "grid-area: main-view/main-view/main-view;");
    render(<FriendActivity />, buddyFeed); // Inject FriendActivity into buddyFeed.

  } else { // Else FriendActivity needs to toggle off.
    const buddyFeed = document.getElementsByClassName("buddy-feed")[0];
    if (buddyFeed) {
      buddyFeed.remove(); // Remove the buddyFeed element from the DOM.
      mainViewParent.setAttribute("style", "grid-area: main-view/main-view/main-view/right-sidebar;");
    }
  }
};

/**
 * Waits for an element to render specified by query.
 * Ref: https://stackoverflow.com/a/61511955.
 *
 * @param {string} query The css selector of the element to wait for.
 * @returns {Promise} Promise object representing the found element.
 */
const waitUntilRender = (query) => {
  return new Promise((resolve) => {
    const element = document.querySelector(query);
    if (element) {
      return resolve(element);
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(query);
      if (element) {
        resolve(element);
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

// Initial display render.
const initDisplay = async () => {
  // Listener that calls toggleFriendActivity when isDisplayed changes.
  chrome.storage.onChanged.addListener((changes) => {
    if ("isDisplayed" in changes) {
      toggleFriendActivity(changes.isDisplayed.newValue);
    }
  });

  // Get isDisplayed from chrome local storage.
  chrome.storage.sync.get("isDisplayed", (store) => {
    // If isDisplayed has never been set. (The user hasn't clicked the "Show friend activity" toggle yet)
    if (store.isDisplayed === undefined) {
      toggleFriendActivity(true);
    } else {
      toggleFriendActivity(store.isDisplayed);
    }
  });
};

// If the document is already loaded.
if (document.readyState !== "loading") {
  initDisplay();
} else {
  // Else wait for the document to load.
  document.addEventListener("DOMContentLoaded", () => {
    initDisplay();
  });
}
