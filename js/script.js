"use strict";

const reference = {
  prefect: {
    appoint: "Appoint as a prefect",
    revoke: "Revoke as a prefect",
  },
  squad: {
    add: "Add to inquisitorial squad",
    remove: "Remove from inquisitorial squad",
  },
};

document.querySelector("#test").addEventListener("click", fadeOut);

function fadeOut(e) {
  if (e.target.classList.contains("prefect")) {
    e.target.querySelector("span").classList.add("fade_out");
    e.target
      .querySelector("span")
      .addEventListener("animationend", changeButton);
  } else {
    e.target.classList.add("fade_out");
    e.target.addEventListener("animationend", changeButton);
  }
}

function changeButton(e) {
  if (e.target.classList.contains("prefect")) {
    changeDataAttribute(
      e.target.querySelector("span"),
      e.target.querySelector("span").dataset.prefect
    );
    e.target.querySelector("span").textContent =
      reference.prefect[e.target.querySelector("span").dataset.prefect];
    changeAnimation(e.target.querySelector("span"));
  } else {
    changeDataAttribute(e.target, e.target.dataset.prefect);
    e.target.textContent = reference.prefect[e.target.dataset.prefect];
    changeAnimation(e.target);
  }

  function changeDataAttribute(element, attr) {
    if (attr === "appoint") {
      element.dataset.prefect = "revoke";
    } else if (attr === "revoke") {
      element.dataset.prefect = "appoint";
    }
  }
}

function changeAnimation(element) {
  element.classList.remove("fade_out");
  element.removeEventListener("animationend", changeButton);
  element.classList.add("fade_in");
  element.addEventListener("animationend", removeFadeIn);
}

function removeFadeIn(e) {
  e.target.classList.remove("fade_in");
  e.target.removeEventListener("animationend", removeFadeIn);
}
