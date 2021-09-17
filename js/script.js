"use strict";

document.querySelector("#test").addEventListener("click", fadeOut);

function fadeOut(e) {
  if (e.target.classList.contains("prefect")) {
    e.target.querySelector("span").classList.add("fade_out");
    e.target.querySelector("span").addEventListener("animationend", changeText);
  } else {
    e.target.classList.add("fade_out");
    e.target.addEventListener("animationend", changeText);
  }
}

function changeText(e) {
  if (e.target.classList.contains("prefect")) {
    e.target.querySelector("span").textContent = "Revoke as a prefect";
    e.target.querySelector("span").classList.remove("fade_out");
    e.target
      .querySelector("span")
      .removeEventListener("animationend", changeText);
    e.target.querySelector("span").classList.add("fade_in");
    e.target
      .querySelector("span")
      .addEventListener("animationend", removeFadeIn);
  } else {
    e.target.removeEventListener("animationend", changeText);
    e.target.classList.remove("fade_out");
    e.target.textContent = "Revoke as a prefect";
    e.target.classList.add("fade_in");
    e.target.addEventListener("animationend", removeFadeIn);
  }
}

function removeFadeIn(e) {
  e.target.classList.remove("fade_in");
  e.target.removeEventListener("animationend", removeFadeIn);
}
