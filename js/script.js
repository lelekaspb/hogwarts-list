"use strict";

// array where all the "cleaned up" students will be stored
let allStudents = [];

// student object prototype
const Student = {
  firstName: "",
  middleNane: "",
  nickName: "",
  lastName: "",
  fullName: "",
  house: "",
  gender: "",
  bloodStatus: "",
  prefect: false,
  expelled: false,
  squad: false,
  imageSource: "",
  id: 0,
};

// used for generating id for every student
let ID = 1;

// filter object where info on which filter and sort options are chosen will be stored
const filter = {
  slytherin: {
    chosen: false,
    quantity: 0,
  },
  ravenclaw: {
    chosen: false,
    quantity: 0,
  },
  hufflepuff: {
    chosen: false,
    quantity: 0,
  },
  gryffindor: {
    chosen: false,
    quantity: 0,
  },
  squad: {
    chosen: false,
    quantity: 0,
  },
  enrolled: {
    chosen: false,
    quantity: 0,
  },
  expelled: {
    chosen: false,
    quantity: 0,
  },
  sortBy: "last_name",
  all: {
    chosen: true,
    quantity: 0,
  },
};

// references between data-prefect and data-squad attibutes and text on corresponding  buttons
const reference = {
  prefect: {
    appoint: "Appoint as a prefect",
    revoke: "Revoke as a prefect",
    // change: "✓",
  },
  squad: {
    add: "Add to inquisitorial squad",
    remove: "Remove from inquisitorial squad",
  },
  crests: {
    slytherin: "assets/crests/slytherin.png",
    gryffindor: "assets/crests/gryffindor.png",
    ravenclaw: "assets/crests/ravenclaw.png",
    hufflepuff: "assets/crests/hufflepuff.png",
  },
};

window.addEventListener("DOMContentLoaded", start);

function start() {
  registerEventListeners();
  loadJSON();
}

function registerEventListeners() {
  registerFilterEventListeners();
  registerSortEventListener();
  registerSearchEventListener();
}

function registerFilterEventListeners() {
  document
    .querySelector("#filter_slytherin")
    .addEventListener("click", filterStudents);
  document
    .querySelector("#filter_ravenclaw")
    .addEventListener("click", filterStudents);
  document
    .querySelector("#filter_hufflepuff")
    .addEventListener("click", filterStudents);
  document
    .querySelector("#filter_gryffindor")
    .addEventListener("click", filterStudents);
  document
    .querySelector("#filter_squad")
    .addEventListener("click", filterStudents);
  document
    .querySelector("#filter_enrolled")
    .addEventListener("click", filterStudents);
  document
    .querySelector("#filter_expelled")
    .addEventListener("click", filterStudents);
  document
    .querySelector("#filter_all")
    .addEventListener("click", filterStudents);
}

function registerSortEventListener() {
  document.querySelector("#sort_by").addEventListener("change", filterStudents);
}

function registerSearchEventListener() {
  document.querySelector("#search").addEventListener("keyup", searchStudent);
}

async function loadJSON() {
  const studentsResponse = await fetch("assets/json/students.json");
  const studentsJSON = await studentsResponse.json();

  const familiesResponse = await fetch("assets/json/families.json");
  const familiesJSON = await familiesResponse.json();

  // when loaded, prepare data objects
  prepareObjects(studentsJSON, familiesJSON);
}

function prepareObjects(studentsJSON, familiesJSON) {
  allStudents = studentsJSON.map(prepareObject, familiesJSON);
  displayFilterQuantities();
  getImageSrc();
  buildList();
}

function prepareObject(studentObject) {
  // console.log(this);
  // get rid of spaces at the beginning and end of the full name
  const tempName = studentObject.fullname.trim();

  // create student object
  const student = Object.create(Student);

  const firstName = getFirstName(tempName);
  const lastName = getLastName(tempName);
  const nickName = getNickName(tempName);
  const middleName = getMiddleName(tempName);

  function calculateBloodStatus(families) {
    let bloodStatus;
    if (families.pure.includes(lastName)) {
      if (families.half.includes(lastName)) {
        bloodStatus = "half-blood";
      } else {
        bloodStatus = "pure-blood";
      }
    } else if (families.half.includes(lastName)) {
      bloodStatus = "half-blood";
    } else {
      bloodStatus = "muggle-blood";
    }

    return bloodStatus;
  }

  // add properties to the student object
  student.firstName = firstName;
  student.lastName = lastName;
  student.nickName = nickName;
  student.middleName = middleName;
  student.house = capitalize(studentObject.house.trim());
  student.gender = studentObject.gender;
  student.bloodStatus = calculateBloodStatus(this);
  student.fullName = getFullName(firstName, middleName, nickName, lastName);
  student.prefect = false;
  student.expelled = false;
  student.squad = false;
  student.id = generateID();

  return student;
}

function capitalize(string) {
  let capitalizedString;
  if (string.includes(" ") || string.includes("-")) {
    // split the string in to an array with one character pr element
    let strArr = string.split("");

    // in foreach we also have a referece to an iterator and the array we're iterating over
    strArr.forEach((elm, iterator, arr) => {
      // if the element is a space or a hyphen ...
      if (elm === " " || elm === "-") {
        // ... uppercase the next letter in the array
        arr[iterator + 1] = arr[iterator + 1].toUpperCase();
      }
    });
    // Turn the array back in to a string with join! We inputted a string so we want a string back
    capitalizedString = strArr.join("");
  } else {
    capitalizedString =
      string.slice(0, 1).toUpperCase() + string.slice(1).toLowerCase();
  }
  return capitalizedString;
}

function getFirstName(fullName) {
  if (fullName.includes(" ")) {
    return capitalize(fullName.substring(0, fullName.indexOf(" ")));
  } else {
    return capitalize(fullName);
  }
}

function getLastName(fullName) {
  if (fullName.includes(" ")) {
    return capitalize(fullName.substring(fullName.lastIndexOf(" ") + 1));
  } else {
    return "";
  }
}

function getNickName(fullName) {
  const nickName = fullName.substring(
    fullName.indexOf('"') + 1,
    fullName.lastIndexOf('"')
  );
  return capitalize(nickName.trim());
}

function getMiddleName(fullName) {
  let middleName = fullName.substring(
    fullName.indexOf(" ") + 1,
    fullName.lastIndexOf(" ") + 1
  );
  if (middleName.includes('"')) {
    return "";
  } else {
    return capitalize(middleName.trim());
  }
}

function getFullName(firstName, middleName, nickName, lastName) {
  return `${firstName} ${middleName} ${nickName} ${lastName}`;
}

function generateID() {
  return ID++;
}

function getImageSrc() {
  allStudents.forEach((student) => {
    // for every student, find out whether there are more students with the same last name
    const sameLastName = allStudents.filter(
      (item) => item.lastName === student.lastName
    );

    // check whether last name consists of two words with hyphen, and, if yes, shorten it
    const shortenedLastName = shortenLastName(student.lastName);

    // if there is more than one student with the same last name
    if (sameLastName.length > 1) {
      student.imageSrc = `assets/images/${shortenedLastName.toLowerCase()}_${student.firstName.toLowerCase()}.png`;
    } else {
      // if there is only one student with this last name
      student.imageSrc = `assets/images/${shortenedLastName.toLowerCase()}_${student.firstName
        .slice(0, 1)
        .toLowerCase()}.png`;
    }
  });
}

function shortenLastName(string) {
  let shortenedString;
  if (string.includes("-")) {
    shortenedString = string.slice(string.lastIndexOf("-") + 1);
  } else {
    shortenedString = string;
  }
  return shortenedString;
}

function buildList() {
  const currentList = prepareFilteredList(allStudents);
  const sortedList = prepareSortedList(currentList);
  displayList(sortedList);
  document.querySelector(".all_students").querySelector(".badge").textContent =
    sortedList.length;
}

function prepareFilteredList(list) {
  let newList = list;

  if (filter.slytherin.chosen === true) {
    newList = list.filter((student) => student.house === "Slytherin");
  } else if (filter.ravenclaw.chosen === true) {
    newList = list.filter((student) => student.house === "Ravenclaw");
  } else if (filter.hufflepuff.chosen === true) {
    newList = list.filter((student) => student.house === "Hufflepuff");
  } else if (filter.gryffindor.chosen === true) {
    newList = list.filter((student) => student.house === "Gryffindor");
  } else if (filter.squad.chosen === true) {
    newList = list.filter((student) => student.squad === true);
  } else if (filter.enrolled.chosen === true) {
    newList = list.filter((student) => student.expelled === false);
  } else if (filter.expelled.chosen === true) {
    newList = list.filter((student) => student.expelled === true);
  } else if (filter.all.chosen === true) {
    newList = list;
  }

  return newList;
}

function prepareSortedList(list) {
  const newList = list.sort(sortFunc);

  function sortFunc(x, y) {
    if (filter.sortBy === "last_name") {
      let a = x.lastName.toUpperCase();
      let b = y.lastName.toUpperCase();
      return a == b ? 0 : a > b ? 1 : -1;
    } else if (filter.sortBy === "first_name") {
      let a = x.firstName.toUpperCase();
      let b = y.firstName.toUpperCase();
      return a == b ? 0 : a > b ? 1 : -1;
    } else if (filter.sortBy === "house") {
      let a = x.house.toUpperCase();
      let b = y.house.toUpperCase();
      return a == b ? 0 : a > b ? 1 : -1;
    }
  }

  return newList;
}

function displayList(list) {
  document.querySelector("#student_list").innerHTML = "";
  list.forEach(displayStudent);
}

function displayStudent(student) {
  const studentTemplate = document.querySelector("template").content;
  const studentClone = studentTemplate.cloneNode(true);

  let prefectField;
  if (student.prefect === false) {
    prefectField = "appoint";
  } else {
    prefectField = "revoke";
  }

  let squadField;
  if (student.squad === false) {
    squadField = "add";
  } else {
    squadField = "remove";
  }

  studentClone.querySelector(".student_wrapper").dataset.id = student.id;
  studentClone.querySelector(".student_wrapper").dataset.prefect = prefectField;
  studentClone.querySelector(".student_wrapper").dataset.squad = squadField;
  studentClone.querySelector("a.student .link_name").textContent =
    student.fullName;
  studentClone.querySelector("a.student .link_house").textContent =
    student.house;
  studentClone.querySelector("button.prefect > span").textContent =
    reference.prefect[prefectField];
  if (student.expelled) {
    studentClone.querySelector("button.prefect").disabled = true;
    studentClone.querySelector("button.squad").disabled = true;
  }
  studentClone
    .querySelector("button.prefect")
    .addEventListener("click", changePrefectStatus);
  studentClone.querySelector("button.squad > span").textContent =
    reference.squad[squadField];
  studentClone
    .querySelector("button.squad")
    .addEventListener("click", changeSquadStatus);
  studentClone
    .querySelector("a.student")
    .addEventListener("click", showStudentDetails);

  document.querySelector("#student_list").append(studentClone);
}

function showStudentDetails(e) {
  const student = findStudent(
    parseInt(e.target.closest(".student_wrapper").dataset.id)
  );
  const popup = document.querySelector(".student_popup");

  popup.querySelector(".content_wrapper").dataset.id = student.id;

  popup.querySelector(".crest > img").src =
    reference.crests[student.house.toLowerCase()];
  popup.querySelector(".crest > img").alt = `${student.house} crest`;

  popup.querySelector(
    ".line1"
  ).style.backgroundColor = `var(--${student.house.toLowerCase()}-main-color)`;
  popup.querySelector(
    ".line2"
  ).style.backgroundColor = `var(--${student.house.toLowerCase()}-secondary-color)`;
  popup.querySelector(
    ".line3"
  ).style.backgroundColor = `var(--${student.house.toLowerCase()}-main-color)`;
  popup.querySelector(
    ".line4"
  ).style.backgroundColor = `var(--${student.house.toLowerCase()}-secondary-color)`;
  popup.querySelector(
    ".line5"
  ).style.backgroundColor = `var(--${student.house.toLowerCase()}-main-color)`;

  popup.querySelector("span.first_name").textContent = student.firstName;
  popup.querySelector("span.middle_name").textContent = student.middleName;
  popup.querySelector("span.nick_name").textContent = student.nickName;
  popup.querySelector("span.last_name").textContent = student.lastName;

  popup.querySelector("span.blood_status").textContent = student.bloodStatus;
  popup.querySelector(".prefect_status").textContent = `Is${
    student.prefect === true ? " " : " not"
  } a prefect`;
  popup.querySelector(".expelled_status").textContent = `Is${
    student.expelled === true ? " " : " not"
  } expelled`;
  popup.querySelector(".squad_status").textContent = `Is${
    student.squad === true ? " " : " not"
  } a member of inquisitorial squad`;
  popup.querySelector(".picture > img").src = student.imageSrc;
  popup.querySelector(
    ".picture > img"
  ).alt = `${student.firstName} ${student.lastName}`;

  if (student.expelled === true) {
    popup.querySelector("button.expell").disabled = true;
  } else {
    popup.querySelector("button.expell").disabled = false;
  }

  popup.querySelector("button.expell").addEventListener("click", expellStudent);
  window.addEventListener("click", checkForCloseStudentDetails);

  popup.querySelector(".content_wrapper").classList.add("appear");
  popup
    .querySelector(".content_wrapper")
    .addEventListener("animationend", removeAppear);
  popup.style.display = "block";
}

function expellStudent(e) {
  const student = findStudent(
    parseInt(e.target.closest(".content_wrapper").dataset.id)
  );
  student.expelled = true;
  changeExpellButton(
    e.target.closest(".content_wrapper").querySelector("button.expell > span")
  );
  countBoolProperty("expelled");
  countEnrolled();
  buildList();
}

function checkForCloseStudentDetails(e) {
  if (e.target.classList.contains("close")) {
    closeStudentDetailsClickBtn(e.target);
  } else if (e.target.classList.contains("popup")) {
    closeStudentDetailsClickAway(e.target);
  }
}

function changeExpellButton(buttonText) {
  const expelledStatusText = buttonText
    .closest(".content_wrapper")
    .querySelector(".expelled_status");
  buttonText.classList.add("fade_out");
  expelledStatusText.classList.add("fade_out");
  buttonText.addEventListener("animationend", changeTextExpell);
}

function changeTextExpell(e) {
  const button = e.target;
  const expelledStatus = button
    .closest(".content_wrapper")
    .querySelector(".expelled_status");
  expelledStatus.textContent = "Is expelled";
  button.innerHTML = `Expelled <span class="tick">✓</span>`;
  removeFadeOutExpell(button, expelledStatus);
  addFadeInExpell(button, expelledStatus);
}
function removeFadeOutExpell(button, expelledStatus) {
  button.classList.remove("fade_out");
  expelledStatus.classList.remove("fade_out");
  button.removeEventListener("animationend", changeTextExpell);
  expelledStatus.removeEventListener("animationend", changeTextExpell);
}

function addFadeInExpell(button, expelledStatus) {
  button.classList.add("fade_in");
  button.addEventListener("animationend", removeFadeIn);
  expelledStatus.classList.add("fade_in");
  expelledStatus.addEventListener("animationend", removeFadeIn);
}

function closeStudentDetailsClickAway(element) {
  element.querySelector(".content_wrapper").classList.add("disappear");
  element
    .querySelector(".content_wrapper")
    .addEventListener("animationend", removeDisappear);
  changeBackStudentDetailsPopup(element.querySelector("button.expell"));
}

function closeStudentDetailsClickBtn(element) {
  element.closest(".content_wrapper").classList.add("disappear");
  element
    .closest(".content_wrapper")
    .addEventListener("animationend", removeDisappear);
  changeBackStudentDetailsPopup(
    element.closest(".popup").querySelector("button.expell")
  );
}

function changeBackStudentDetailsPopup(button) {
  setTimeout(() => {
    clearTextExpell(button);
    clearEventListenersStudentDetailsPopup(button);
  }, 300);
}

function clearTextExpell(button) {
  button.closest(".popup").querySelector(".expelled_status").textContent = "";
  button.querySelector("span").textContent = "Expell";
}

function clearEventListenersStudentDetailsPopup(button) {
  button.querySelector("span").className = "";
  button
    .closest(".content_wrapper")
    .querySelector(".expelled_status").className = "expelled_status";
  button
    .querySelector("span")
    .removeEventListener("animationend", changeTextExpell);

  button.removeEventListener("click", expellStudent);
  window.removeEventListener("click", checkForCloseStudentDetails);
}

function changePrefectStatus(e) {
  const student = findStudent(
    parseInt(e.target.closest(".student_wrapper").dataset.id)
  );
  const attr = e.target.closest(".student_wrapper").dataset.prefect;
  const houseList = filterByOneCriteria(allStudents, "house", student.house);
  const housePrefects = filterByOneCriteria(houseList, "prefect", true);
  let studentToRevoke;

  if (attr === "appoint") {
    if (housePrefects.length > 1) {
      studentToRevoke = housePrefects.find(
        (prefect) => prefect.gender === student.gender
      );
      showTwoPrefectsPopup(
        document.querySelector(".two_prefects"),
        student.house,
        studentToRevoke,
        student
      );
    } else if (housePrefects.length === 1) {
      if (housePrefects[0].gender === student.gender) {
        studentToRevoke = housePrefects[0];
        showSameGenderPopup(
          document.querySelector(".same_gender"),
          student.house,
          studentToRevoke,
          student
        );
      } else {
        addPrefect(student);
        fadeOut(e, "prefect");
      }
    } else {
      addPrefect(student);
      fadeOut(e, "prefect");
    }
  } else if (attr === "revoke") {
    revokePrefect(student);
    fadeOut(e, "prefect");
  }
}

function showTwoPrefectsPopup(popup, house, studentToRevoke, studentToAppoint) {
  popup.querySelector("span.house").textContent = house;
  popup.querySelector(
    "button.revoke  span"
  ).innerHTML = `&nbsp; ${studentToRevoke.firstName} ${studentToRevoke.lastName}`;
  popup.querySelector(".content_wrapper").dataset.revoke_id =
    studentToRevoke.id;
  popup.querySelector(".content_wrapper").dataset.appoint_id =
    studentToAppoint.id;
  popup.querySelector(
    "p:nth-child(2)"
  ).textContent = `Revoke ${studentToRevoke.firstName} ${studentToRevoke.lastName} in order to appoint ${studentToAppoint.firstName} ${studentToAppoint.lastName}.`;
  popup.querySelector(".content_wrapper").classList.add("appear");
  popup
    .querySelector(".content_wrapper")
    .addEventListener("animationend", removeAppear);
  popup.style.display = "block";
  popup.querySelector("button.revoke").addEventListener("click", changePrefect);

  window.addEventListener("click", checkForClose);
}

function checkForClose(e) {
  if (e.target.classList.contains("close")) {
    closePopupClickBtn(e.target);
  } else if (e.target.classList.contains("popup")) {
    closePopupClickAway(e.target);
  }
}

function showSameGenderPopup(popup, house, studentToRevoke, studentToAppoint) {
  popup.querySelector("span.house").textContent = house;
  popup.querySelector(
    "p:nth-child(1)"
  ).innerHTML = `There is already one ${studentToAppoint.gender} appointed as prefect from the
  <span class="house">${house}</span> house.`;
  popup.querySelector("p:nth-child(2)").innerHTML = ` Revoke ${
    studentToRevoke.firstName
  } ${studentToRevoke.lastName} in order to appoint ${
    studentToAppoint.firstName
  } ${studentToAppoint.lastName} or choose a ${
    studentToAppoint.gender === "girl" ? "boy" : "girl"
  } as
  second prefect.`;
  popup.querySelector(
    "button.revoke  span"
  ).innerHTML = `&nbsp; ${studentToRevoke.firstName} ${studentToRevoke.lastName}`;
  popup.querySelector(".content_wrapper").dataset.revoke_id =
    studentToRevoke.id;
  popup.querySelector(".content_wrapper").dataset.appoint_id =
    studentToAppoint.id;
  popup.querySelector(".content_wrapper").classList.add("appear");
  popup
    .querySelector(".content_wrapper")
    .addEventListener("animationend", removeAppear);
  popup.style.display = "block";
  popup.querySelector("button.revoke").addEventListener("click", changePrefect);

  window.addEventListener("click", checkForClose);
}

function removeAppear(e) {
  e.target.classList.remove("appear");
  e.target.removeEventListener("animationend", removeAppear);
}

function removeDisappear(e) {
  e.target.removeEventListener("animationend", removeDisappear);
  e.target.classList.remove("disappear");
  e.target.closest(".popup").style.display = "none";
}

function changePrefect(e) {
  // define text element to be changed (text on the button)
  const textElement = e.target
    .closest(".buttons")
    .querySelector(".buttonTextWrapper");

  // find which student should be revoked and which appointed
  const studentToRevoke = findStudent(
    parseInt(e.target.closest(".content_wrapper").dataset.revoke_id)
  );
  const studentToAppoint = findStudent(
    parseInt(e.target.closest(".content_wrapper").dataset.appoint_id)
  );

  //revoke student as a prefect
  revokePrefect(studentToRevoke);

  // appoint new prefect
  addPrefect(studentToAppoint);

  // build list of students for populating html
  buildList();

  // give visual feedback (change text on button)
  changeButtonText(textElement);
}

function changeButtonText(textElement) {
  textElement.classList.add("fade_out");
  textElement.addEventListener("animationend", changeTextPrefect);
}

function changeTextPrefect() {
  textElement.querySelector("span").innerHTML = "&nbsp; ✓";
  textElement.querySelector("span").classList.add("tick");
  textElement.firstChild.textContent = "Revoked ";
  removeFadeOutPrefect();
  addFadeInPrefect();
}

function removeFadeOutPrefect() {
  textElement.classList.remove("fade_out");
  textElement.removeEventListener("animationend", changeTextPrefect);
}

function addFadeInPrefect() {
  textElement.classList.add("fade_in");
  textElement.addEventListener("animationend", addFadeInPrefect);
}

function addPrefect(student) {
  student.prefect = true;
}

function revokePrefect(student) {
  student.prefect = false;
}

function closePopupClickAway(element) {
  element.querySelector(".content_wrapper").classList.add("disappear");
  element
    .querySelector(".content_wrapper")
    .addEventListener("animationend", removeDisappear);
  changeBackRevokeButton(element.querySelector(".revoke"));
}

function closePopupClickBtn(element) {
  element.closest(".content_wrapper").classList.add("disappear");
  element
    .closest(".content_wrapper")
    .addEventListener("animationend", removeDisappear);

  changeBackRevokeButton(element.closest(".buttons").querySelector(".revoke"));
}

function changeBackRevokeButton(button) {
  setTimeout(() => {
    clearTextPrefect(button);
    clearEventListenersPopup(button);
  }, 300);
}

function clearTextPrefect(button) {
  button.querySelector(".buttonTextWrapper").innerHTML = `Revoke <span></span>`;
}

function clearEventListenersPopup(button) {
  button.removeEventListener("click", changePrefect);
  button.querySelector(".buttonTextWrapper").className = "buttonTextWrapper";
  button
    .querySelector(".buttonTextWrapper")
    .removeEventListener("animationend", changeTextPrefect);

  window.removeEventListener("click", checkForClose);
}

function changeSquadStatus(e) {
  const student = findStudent(
    parseInt(e.target.closest(".student_wrapper").dataset.id)
  );
  const attr = e.target.closest(".student_wrapper").dataset.squad;

  if (attr === "add") {
    if (student.house === "Slytherin") {
      if (student.bloodStatus === "pure-blood") {
        addToSquad(student);
        fadeOut(e, "squad");
      } else {
        showOnlyPureBloodPopup(student);
      }
    } else {
      addToSquad(student);
      fadeOut(e, "squad");
    }
  } else if (attr === "remove") {
    removeFromSquad(student);
    fadeOut(e, "squad");
  }
}

function addToSquad(student) {
  student.squad = true;
  changeSquadQuantityDisplay();
}

function removeFromSquad(student) {
  student.squad = false;
  changeSquadQuantityDisplay();
}

function showOnlyPureBloodPopup(student) {
  document
    .querySelector(".only_pure_bloods")
    .querySelector(
      "p:nth-child(1)"
    ).textContent = `${student.firstName} ${student.lastName} is not a pure-blood.`;
  document.querySelector(".only_pure_bloods").style.display = "block";
  document
    .querySelector(".only_pure_bloods")
    .querySelector(".content_wrapper")
    .classList.add("appear");
  document
    .querySelector(".only_pure_bloods")
    .querySelector(".content_wrapper")
    .addEventListener("animationend", removeAppear);

  window.addEventListener("click", checkForClosePureBloods);
}

function checkForClosePureBloods(e) {
  if (e.target.classList.contains("close")) {
    closePopupPureBloodsClickBtn(e.target);
  } else if (e.target.classList.contains("popup")) {
    closePopupPureBloodsClickAway(e.target);
  }
}

function closePopupPureBloodsClickBtn(element) {
  element.closest(".content_wrapper").classList.add("disappear");
  element
    .closest(".content_wrapper")
    .addEventListener("animationend", removeDisappear);

  window.removeEventListener("click", checkForClosePureBloods);
}

function closePopupPureBloodsClickAway(element) {
  element.querySelector(".content_wrapper").classList.add("disappear");
  element
    .querySelector(".content_wrapper")
    .addEventListener("animationend", removeDisappear);

  window.removeEventListener("click", checkForClosePureBloods);
}

function findStudent(ID) {
  return allStudents.find((item) => item.id === ID);
}

function filterByOneCriteria(list, criteria, value) {
  return list.filter((student) => student[criteria] === value);
}

function countQuantities(list, criteria, value) {
  const quantityArray = filterByOneCriteria(list, criteria, value);
  return quantityArray.length;
}

function countHouse(house) {
  const studentsNumber = countQuantities(
    allStudents,
    "house",
    capitalize(house)
  );
  filter[house.toLowerCase()].quantity = studentsNumber;
  displayQuantity(house.toLowerCase());
}

function countBoolProperty(property) {
  const studentNumber = countQuantities(allStudents, property, true);
  filter[property].quantity = studentNumber;
  displayQuantity(property);
}

function countEnrolled() {
  const studentsNumber =
    allStudents.length - countQuantities(allStudents, "expelled", true);
  filter.enrolled.quantity = studentsNumber;
  displayQuantity("enrolled");
}

function countAllStudents() {
  filter.all.quantity = allStudents.length;
  displayQuantity("all");
}

function displayQuantity(filterProrerty) {
  const parent = document.querySelector(
    `[data-filter="${filterProrerty.toLowerCase()}"]`
  ).parentNode;
  const badge = parent.querySelector(".badge");
  if (badge.classList.contains("squad_badge")) {
    badge.querySelector("span").textContent =
      filter[filterProrerty.toLowerCase()].quantity;
  } else {
    badge.textContent = filter[filterProrerty.toLowerCase()].quantity;
  }
}

function changeSquadQuantityDisplay() {
  const squadNumber = countQuantities(allStudents, "squad", true);
  filter.squad.quantity = squadNumber;
  const squadBadge = document.querySelector(".badge.squad_badge");
  squadBadge.querySelector("span").className = "";
  squadBadge.querySelector("span").classList.add("fade_out");
  squadBadge
    .querySelector("span")
    .addEventListener("animationend", changeSquadQuantityAnimation);

  function changeSquadQuantityAnimation(e) {
    e.target.classList.remove("fade_out");
    e.target.removeEventListener("animationend", changeSquadQuantityAnimation);
    changeText(e.target);
    e.target.classList.add("fade_in");
    e.target.addEventListener("animationend", removeFadeIn);
  }

  function changeText(element) {
    element.textContent = filter.squad.quantity;
  }
}

function displayFilterQuantities() {
  countHouse("slytherin");
  countHouse("ravenclaw");
  countHouse("hufflepuff");
  countHouse("gryffindor");
  countBoolProperty("squad");
  countBoolProperty("expelled");
  countEnrolled();
  countAllStudents();
}

function filterStudents(e) {
  if (e.target.nodeName === "SELECT") {
    updateSort(e.target.value);
  } else {
    changeActiveClass(e.target.closest("li"));
    updateFilterObject(e.target.dataset.filter);
  }
  buildList();
}

function updateSort(sortBy) {
  filter.sortBy = sortBy;
}

function updateFilterObject(filterProrerty) {
  filter[filterProrerty].chosen = !filter[filterProrerty].chosen;

  const keys = Object.keys(filter);
  keys.forEach((key) => {
    if (key !== filterProrerty && key !== "sortBy") {
      filter[key].chosen = false;
    }
  });
}

function changeActiveClass(element) {
  document.querySelectorAll(".filter_list li").forEach((item) => {
    item.classList.remove("active");
  });
  element.classList.add("active");
}

function searchStudent(e) {
  updateFilterObject("all");
  changeActiveClass(document.querySelector("#filter_all").parentNode);
  const searchedText = e.target.value.toLowerCase();
  const matchingStudents = [];
  allStudents.forEach((student) => {
    const itemText = student.fullName.toLowerCase();
    if (itemText.indexOf(searchedText) != -1) {
      matchingStudents.push(student);
    }
  });
  document.querySelector(".all_students > .badge").textContent =
    matchingStudents.length;
  displayList(matchingStudents);
}

// add fading out animation to span inside button
function fadeOut(e, buttonClass) {
  const ancestor = e.target.closest(".student_wrapper");
  ancestor.querySelector(`.${buttonClass} > span`).classList.add("fade_out");
  ancestor
    .querySelector(`.${buttonClass} > span`)
    .addEventListener("animationend", changeButton);
}

// change text on the button
function changeButton(e) {
  // find out whether prefect button was clicked or squad button
  const attr = e.target.closest("button").dataset.field;

  // find ancestor where prefect and squad statuses of the student are stored in data attributes
  const ancestor = e.target.closest(".student_wrapper");

  // change prefect or squad status to the opposite
  if (attr === "prefect") {
    changePrefectAttribute(ancestor, ancestor.dataset[attr]);
    // change text inside button
    e.target.textContent = reference.prefect[ancestor.dataset[attr]];
  } else if (attr === "squad") {
    changeSquadAttribute(ancestor, ancestor.dataset[attr]);
    // change text inside button
    e.target.textContent = reference.squad[ancestor.dataset[attr]];
  }

  changeAnimation(e.target);
}

function changePrefectAttribute(element, attr) {
  if (attr === "appoint") {
    element.dataset.prefect = "revoke";
  } else if (attr === "revoke") {
    element.dataset.prefect = "appoint";
  }
}

function changeSquadAttribute(element, attr) {
  if (attr === "add") {
    element.dataset.squad = "remove";
  } else if (attr === "remove") {
    element.dataset.squad = "add";
  }
}

// remove fade_out class and animationend event listener, add fade_in
function changeAnimation(element) {
  element.classList.remove("fade_out");
  element.removeEventListener("animationend", changeButton);
  element.classList.add("fade_in");
  element.addEventListener("animationend", removeFadeIn);
}

// remove fade_in animationend event listener
function removeFadeIn(e) {
  e.target.classList.remove("fade_in");
  e.target.removeEventListener("animationend", removeFadeIn);
}
