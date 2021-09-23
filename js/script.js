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
  isExpellable: true,
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

// count how many times system was hacked
let hackCounter = 0;

window.addEventListener("DOMContentLoaded", start);

// initialize code after DOM content is loaded
function start() {
  registerEventListeners();
  loadJSON();
}

// add event listeners to static buttons/divs/inputs on the page
function registerEventListeners() {
  registerFilterEventListeners();
  registerSortEventListener();
  registerSearchEventListener();
}

// add event listeners to filter items
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

// add event listener to select element for sorting
function registerSortEventListener() {
  document.querySelector("#sort_by").addEventListener("change", filterStudents);
}

// add event listener to search input field
function registerSearchEventListener() {
  document.querySelector("#search").addEventListener("keyup", searchStudent);
}

// fetch students data and families data for calculating blood status
async function loadJSON() {
  // fetch students data
  const studentsResponse = await fetch("assets/json/students.json");
  const studentsJSON = await studentsResponse.json();

  // fetch families data
  const familiesResponse = await fetch("assets/json/families.json");
  const familiesJSON = await familiesResponse.json();

  // when loaded, prepare data objects
  prepareObjects(studentsJSON, familiesJSON);
}

// prepare array of students with proper formatted names and blood statuses
function prepareObjects(studentsJSON, familiesJSON) {
  // every object of the fetched students array run through "prepareObject" function and pass in families array as "this" for calculating of blood status
  allStudents = studentsJSON.map(prepareObject, familiesJSON);

  // display number of students in every house and for other filter fields
  displayFilterQuantities();

  // after having completed the allStudents array, calculate image source for every student
  getImageSrc();

  // prepare list of students to be displayed on the page
  buildList();
}

function prepareObject(studentObject) {
  // console.log(this);
  // get rid of spaces at the beginning and end of the full name
  const tempName = studentObject.fullname.trim();

  // create student object
  const student = Object.create(Student);

  // calculate name parts
  const firstName = getFirstName(tempName);
  const lastName = getLastName(tempName);
  const nickName = getNickName(tempName);
  const middleName = getMiddleName(tempName);

  // calculate blood status
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

  // assign name parts as properties to the student object
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
  // every time the "generateID" function is called, it increments ID and returns unique number
  student.id = generateID();
  student.isExpellable = true;

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

// calculate first name
function getFirstName(fullName) {
  // if full name consists of more than one word, get the first word for first name
  if (fullName.includes(" ")) {
    return capitalize(fullName.substring(0, fullName.indexOf(" ")));
  } else {
    // if full name consists of one word, assum that it's first name
    return capitalize(fullName);
  }
}

// calculate last name
function getLastName(fullName) {
  // if full name consists of more than one word, get word after the last space
  if (fullName.includes(" ")) {
    return capitalize(fullName.substring(fullName.lastIndexOf(" ") + 1));
  } else {
    // otherwise last name will be empty
    return "";
  }
}

// calculate nick name
function getNickName(fullName) {
  // get the part inside quotes '""'
  const nickName = fullName.substring(
    fullName.indexOf('"') + 1,
    fullName.lastIndexOf('"')
  );
  return capitalize(nickName.trim());
}

// calculate middle name
function getMiddleName(fullName) {
  // find part of the full name string between first space and last
  let middleName = fullName.substring(
    fullName.indexOf(" ") + 1,
    fullName.lastIndexOf(" ") + 1
  );
  // if this name part contains quotes, assign middle name to empty string
  if (middleName.includes('"')) {
    return "";
  } else {
    // otherwise capitalize and return it
    return capitalize(middleName.trim());
  }
}

// get "cleaned up" full name for search and easier output on the page
function getFullName(firstName, middleName, nickName, lastName) {
  return `${firstName} ${middleName} ${nickName} ${lastName}`;
}

// generate unique id for every student for easier search in array
function generateID() {
  return ID++;
}

// calculate image source
function getImageSrc() {
  allStudents.forEach((student) => {
    if (student.lastName !== "") {
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
    } else {
      student.imageSrc = "";
    }
  });
}

// if last name contains hyphen, get the part after hyphen for image source
function shortenLastName(string) {
  let shortenedString;
  if (string.includes("-")) {
    shortenedString = string.slice(string.lastIndexOf("-") + 1);
  } else {
    // otherwise leave it as it was
    shortenedString = string;
  }
  return shortenedString;
}

// prepare student list to be displayed on the page
function buildList() {
  // filter studenst
  const currentList = prepareFilteredList(allStudents);
  // sort the filtered list
  const sortedList = prepareSortedList(currentList);
  // display the filtered and sorted list
  displayList(sortedList);
  // display amount of students on filtered and sorted list (currently displayed students)
  document.querySelector(".all_students").querySelector(".badge").textContent =
    sortedList.length;
}

// filter students (only one filter field can be chosen at a time)
function prepareFilteredList(list) {
  let newList = list;

  // check which filter field is chosen and filter all students by the corresponding criteria
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

  // here I get filtered list of students
  return newList;
}

// sort filtered list
function prepareSortedList(list) {
  const newList = list.sort(sortFunc);

  // check which sort field is chosen and sort students by the corresponding student object property
  function sortFunc(x, y) {
    if (filter.sortBy === "last_name") {
      // compare by last name
      let a = x.lastName.toUpperCase();
      let b = y.lastName.toUpperCase();
      return a == b ? 0 : a > b ? 1 : -1;
    } else if (filter.sortBy === "first_name") {
      // compare by first name
      let a = x.firstName.toUpperCase();
      let b = y.firstName.toUpperCase();
      return a == b ? 0 : a > b ? 1 : -1;
    } else if (filter.sortBy === "house") {
      // compare by house
      let a = x.house.toUpperCase();
      let b = y.house.toUpperCase();
      return a == b ? 0 : a > b ? 1 : -1;
    }
  }

  // here I get filtered and sorted list of students
  return newList;
}

// display filtered and sorted list by one student at a time
function displayList(list) {
  document.querySelector("#student_list").innerHTML = "";
  list.forEach(displayStudent);
}

// display one student at a time
function displayStudent(student) {
  // get the template from HTML
  const studentTemplate = document.querySelector("template").content;
  // make clone
  const studentClone = studentTemplate.cloneNode(true);

  // prepare variables for data-prefect and data-squad attributes
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

  // populate HTML
  studentClone.querySelector(".student_wrapper").dataset.id = student.id;
  studentClone.querySelector(".student_wrapper").dataset.prefect = prefectField;
  studentClone.querySelector(".student_wrapper").dataset.squad = squadField;
  studentClone.querySelector("a.student .link_name").textContent =
    student.fullName;
  studentClone.querySelector("a.student .link_house").textContent =
    student.house;
  // grab text content for appoint/revoke prefect button from the "reference" object
  studentClone.querySelector("button.prefect > span").textContent =
    reference.prefect[prefectField];
  // grab text content for add to/ remove from squad button from the "reference" object
  studentClone.querySelector("button.squad > span").textContent =
    reference.squad[squadField];
  // if student is expelled, disable the "prefect" and "inquisitorial squad" buttons
  if (student.expelled) {
    studentClone.querySelector("button.prefect").disabled = true;
    studentClone.querySelector("button.squad").disabled = true;
  }
  // add event listener to "prefect" button
  studentClone
    .querySelector("button.prefect")
    .addEventListener("click", changePrefectStatus);
  // add event listener to "inquisitorial squad" button
  studentClone
    .querySelector("button.squad")
    .addEventListener("click", changeSquadStatus);
  // add event listener to student's name for opening student's details popup
  studentClone
    .querySelector("a.student")
    .addEventListener("click", showStudentDetails);

  // append clone to html
  document.querySelector("#student_list").append(studentClone);
}

// show student's details
function showStudentDetails(e) {
  // find student in the allStudents array by id
  const student = findStudent(
    parseInt(e.target.closest(".student_wrapper").dataset.id)
  );
  // grab the modal from HTML
  const popup = document.querySelector(".student_popup");
  // set data-id attribute
  popup.querySelector(".content_wrapper").dataset.id = student.id;
  // set image source for the house crest
  popup.querySelector(".crest > img").src =
    reference.crests[student.house.toLowerCase()];
  popup.querySelector(".crest > img").alt = `${student.house} crest`;

  // set the house colors
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

  // add text content for name parts
  popup.querySelector("span.first_name").textContent = student.firstName;
  popup.querySelector("span.middle_name").textContent = student.middleName;
  popup.querySelector("span.nick_name").textContent = student.nickName;
  popup.querySelector("span.last_name").textContent = student.lastName;

  // add text for blood status
  popup.querySelector("span.blood_status").textContent = student.bloodStatus;
  // prefect status
  popup.querySelector(".prefect_status").textContent = `Is${
    student.prefect === true ? " " : " not"
  } a prefect`;
  // expelled or not
  popup.querySelector(".expelled_status").textContent = `Is${
    student.expelled === true ? " " : " not"
  } expelled`;
  // if is a member of inquisitorial squad
  popup.querySelector(".squad_status").textContent = `Is${
    student.squad === true ? " " : " not"
  } a member of inquisitorial squad`;
  // add image source for student's picture
  popup.querySelector(".picture > img").src = student.imageSrc;
  popup.querySelector(
    ".picture > img"
  ).alt = `${student.firstName} ${student.lastName}`;

  // disable "expell" button if the student is already expelled
  if (student.expelled === true) {
    popup.querySelector("button.expell").disabled = true;
  } else {
    popup.querySelector("button.expell").disabled = false;
  }

  // add event listener to "expell" button
  popup.querySelector("button.expell").addEventListener("click", expellStudent);
  // add event listener for closing the popup
  window.addEventListener("click", checkForCloseStudentDetails);

  // add animation when popup is appearing
  popup.querySelector(".content_wrapper").classList.add("appear");
  popup
    .querySelector(".content_wrapper")
    .addEventListener("animationend", removeAppear);
  // display the popup
  popup.style.display = "block";
}

// expell student
function expellStudent(e) {
  // find student in the allStudents array by id
  const student = findStudent(
    parseInt(e.target.closest(".content_wrapper").dataset.id)
  );
  // if student is not the hacker, expell
  if (student.isExpellable === true) {
    // set the "expelled" student's property to true
    student.expelled = true;
    // change text on the "expell" button in order to give the user visual feedback
    changeExpellButton(
      e.target.closest(".content_wrapper").querySelector("button.expell > span")
    );
    // update quantity of expelled students on the corresponding filter field
    countBoolProperty("expelled");
    // update quantity of enrolled students on the corresponding filter field
    countEnrolled();
    // trigger redisplay of students in order to get disabled buttons (prefect and squad) for the expelled student
    buildList();
    // if student is the hacker, do not expell
  } else {
    // output message in the console that the hacker student cannot be expelled
    console.log(`${student.firstName} ${student.lastName} cannot be expelled.`);
    // add shaking animation to the button
    addShakingAnimation(
      e.target.closest(".content_wrapper").querySelector(".expell")
    );
    // play a "no go" sound
    playNoGoSound();
  }
}

// add shaking animation to "expell" button when user is trying to expell hacker
function addShakingAnimation(button) {
  button.classList.add("shake");
  button.addEventListener("animationend", removeShakingAnimation);
}

// play a "no go" sound together with shaking the "expell" button
function playNoGoSound() {
  document.querySelector("#nogo").play();
}

// remove shaking animation class when animation has ended
function removeShakingAnimation(e) {
  e.target.classList.remove("shake");
  e.target.removeEventListener("animationend", removeShakingAnimation);
}

// close student's details popup if "close" button or outer div (beyond the popup's content) was clicked
function checkForCloseStudentDetails(e) {
  // if "close" button was clicked
  if (e.target.classList.contains("close")) {
    closeStudentDetailsClickBtn(e.target);
  } else if (e.target.classList.contains("popup")) {
    // if outer div was clicked
    closeStudentDetailsClickAway(e.target);
  }
  // if click happened inside the popup's content and it was not the "close" button, do nothing
}

// change text on "expell" button and "expell status" text
function changeExpellButton(buttonText) {
  const expelledStatusText = buttonText
    .closest(".content_wrapper")
    .querySelector(".expelled_status");
  // trigger fade out animation on button
  buttonText.classList.add("fade_out");
  // trigger fade out animation on expelled/not expelled text field
  expelledStatusText.classList.add("fade_out");
  // when original text have faded out, change text and trigger fade in animation
  buttonText.addEventListener("animationend", changeTextExpell);
}

// change expelled/not expelled text and trigger fade in animation
function changeTextExpell(e) {
  // get the HTML elements to be changed
  const button = e.target;
  const expelledStatus = button
    .closest(".content_wrapper")
    .querySelector(".expelled_status");
  // change text
  expelledStatus.textContent = "Is expelled";
  button.innerHTML = `Expelled <span class="tick">✓</span>`;
  // remove fade out animation
  removeFadeOutExpell(button, expelledStatus);
  // add fade in animation
  addFadeInExpell(button, expelledStatus);
}

// remove fade out animation
function removeFadeOutExpell(button, expelledStatus) {
  button.classList.remove("fade_out");
  expelledStatus.classList.remove("fade_out");
  button.removeEventListener("animationend", changeTextExpell);
  expelledStatus.removeEventListener("animationend", changeTextExpell);
}

// add fade in animation
function addFadeInExpell(button, expelledStatus) {
  button.classList.add("fade_in");
  button.addEventListener("animationend", removeFadeIn);
  expelledStatus.classList.add("fade_in");
  expelledStatus.addEventListener("animationend", removeFadeIn);
}

// close student's details popup when user clicked beyond the popup's content
function closeStudentDetailsClickAway(element) {
  element.querySelector(".content_wrapper").classList.add("disappear");
  element
    .querySelector(".content_wrapper")
    .addEventListener("animationend", removeDisappear);
  // change expelled/not expelled text back to it's initial state for another student to be display on this popup
  changeBackStudentDetailsPopup(element.querySelector("button.expell"));
}

// close student's details popup when user clicked beyond the popup's content
function closeStudentDetailsClickBtn(element) {
  element.closest(".content_wrapper").classList.add("disappear");
  element
    .closest(".content_wrapper")
    .addEventListener("animationend", removeDisappear);
  // change expelled/not expelled text back to it's initial state for another student to be display on this popup
  changeBackStudentDetailsPopup(
    element.closest(".popup").querySelector("button.expell")
  );
}

// wait 0.3 seconds for popup disappearing animation to be over, then make changes to initial state
function changeBackStudentDetailsPopup(button) {
  setTimeout(() => {
    // change texts
    clearTextExpell(button);
    // remove event listeners
    clearEventListenersStudentDetailsPopup(button);
  }, 300);
}

// change expelled/not expelled texts
function clearTextExpell(button) {
  button.closest(".popup").querySelector(".expelled_status").textContent = "";
  button.querySelector("span").textContent = "Expell";
}

// remove event listeners and animation classes
function clearEventListenersStudentDetailsPopup(button) {
  // remove animation classes
  button.querySelector("span").className = "";
  button
    .closest(".content_wrapper")
    .querySelector(".expelled_status").className = "expelled_status";
  // remove fading in animationend event listener
  button
    .querySelector("span")
    .removeEventListener("animationend", changeTextExpell);
  // remove click event listeners for expell button and for closing popup
  button.removeEventListener("click", expellStudent);
  window.removeEventListener("click", checkForCloseStudentDetails);
}

// appoint one student and revoke another
function changePrefectStatus(e) {
  // find student in allStudents array
  const student = findStudent(
    parseInt(e.target.closest(".student_wrapper").dataset.id)
  );
  // get value data-prefect attribute of the student to be appointed
  const attr = e.target.closest(".student_wrapper").dataset.prefect;
  // get list of students in the house (of the student to be appointed)
  const houseList = filterByOneCriteria(allStudents, "house", student.house);
  // get list of prefects of the student's to be appointed house
  const housePrefects = filterByOneCriteria(houseList, "prefect", true);

  // define student to be revoked
  let studentToRevoke;
  // if student (to be appointed) is not a prefect
  if (attr === "appoint") {
    // if there are two prefects have been appointed already
    if (housePrefects.length > 1) {
      // suggest to revoke student of the same gender as the student to be appointed
      studentToRevoke = housePrefects.find(
        (prefect) => prefect.gender === student.gender
      );
      // display popup with suggestion
      showTwoPrefectsPopup(
        document.querySelector(".two_prefects"),
        student.house,
        studentToRevoke,
        student
      );
      // if there is one prefect appointed from the house
    } else if (housePrefects.length === 1) {
      // check if the already appointed prefect is of the sane gender as the student to be appointed
      if (housePrefects[0].gender === student.gender) {
        // if yes, suggest to revoke the currently appointed prefect
        studentToRevoke = housePrefects[0];
        // display popup with suggestion
        showSameGenderPopup(
          document.querySelector(".same_gender"),
          student.house,
          studentToRevoke,
          student
        );
        // if the currently appointed prefect is of opposite gender, make the change
      } else {
        // add prefect
        addPrefect(student);
        // add fading out animation for "prefect" text
        fadeOut(e, "prefect");
      }
      // if there are no prefects were appointed
    } else {
      // add prefect
      addPrefect(student);
      // add fading out animation for "prefect" text
      fadeOut(e, "prefect");
    }
    // if the "clicked" student is already a prefect, revoke him/her
  } else if (attr === "revoke") {
    // revoke student
    revokePrefect(student);
    // add fading out animation for "prefect" text
    fadeOut(e, "prefect");
  }
}

// if there are two prefects have been appointed already, suggest to revoke student of the same gender as the student to be appointed
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

  // close popup
  window.addEventListener("click", checkForClose);
}

// when click is made, check which element was clicked on
function checkForClose(e) {
  if (e.target.classList.contains("close")) {
    closePopupClickBtn(e.target);
  } else if (e.target.classList.contains("popup")) {
    closePopupClickAway(e.target);
  }
}

// if there is one prefect appointed from the house, suggest to revoke him/her
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

  // close popup
  window.addEventListener("click", checkForClose);
}

// remove popup appearing animation event listener and class
function removeAppear(e) {
  e.target.classList.remove("appear");
  e.target.removeEventListener("animationend", removeAppear);
}

// remove popup disappearing animation event listener and class, hide popup
function removeDisappear(e) {
  e.target.removeEventListener("animationend", removeDisappear);
  e.target.classList.remove("disappear");
  // hide popup
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

// trigger fading out animation
function changeButtonText(textElement) {
  textElement.classList.add("fade_out");
  textElement.addEventListener("animationend", changeTextPrefect);
}

// change text on "prefect" button, trigger fading in animation
function changeTextPrefect() {
  textElement.querySelector("span").innerHTML = "&nbsp; ✓";
  textElement.querySelector("span").classList.add("tick");
  textElement.firstChild.textContent = "Revoked ";
  // remove fade out animation
  removeFadeOutPrefect();
  // add fade in animation
  addFadeInPrefect();
}

// remove fade out animation on "prefect" button
function removeFadeOutPrefect() {
  textElement.classList.remove("fade_out");
  textElement.removeEventListener("animationend", changeTextPrefect);
}

// add fade in animation on "prefect" button
function addFadeInPrefect() {
  textElement.classList.add("fade_in");
  textElement.addEventListener("animationend", addFadeInPrefect);
}

// set student's prefect property to true
function addPrefect(student) {
  student.prefect = true;
}

// set student's prefect property to false
function revokePrefect(student) {
  student.prefect = false;
}

// close "same_gender" and "two_prefects" popups on click beyond the popup's content
function closePopupClickAway(element) {
  element.querySelector(".content_wrapper").classList.add("disappear");
  element
    .querySelector(".content_wrapper")
    .addEventListener("animationend", removeDisappear);
  changeBackRevokeButton(element.querySelector(".revoke"));
}

// close "same_gender" and "two_prefects" popups on click close button
function closePopupClickBtn(element) {
  element.closest(".content_wrapper").classList.add("disappear");
  element
    .closest(".content_wrapper")
    .addEventListener("animationend", removeDisappear);

  changeBackRevokeButton(element.closest(".buttons").querySelector(".revoke"));
}

// change "prefect" button to it's original state after disappearing animation on popup is completed
function changeBackRevokeButton(button) {
  setTimeout(() => {
    // change text on button
    clearTextPrefect(button);
    // remove event listeners
    clearEventListenersPopup(button);
  }, 300);
}

// change text on "prefect" button
function clearTextPrefect(button) {
  button.querySelector(".buttonTextWrapper").innerHTML = `Revoke <span></span>`;
}

// remove event listeners from popup
function clearEventListenersPopup(button) {
  button.removeEventListener("click", changePrefect);
  button.querySelector(".buttonTextWrapper").className = "buttonTextWrapper";
  button
    .querySelector(".buttonTextWrapper")
    .removeEventListener("animationend", changeTextPrefect);

  window.removeEventListener("click", checkForClose);
}

// change inquisitorial squad status of a student
function changeSquadStatus(e) {
  // find student in allStudents array
  const student = findStudent(
    parseInt(e.target.closest(".student_wrapper").dataset.id)
  );
  // get value of data-squad attribute
  const attr = e.target.closest(".student_wrapper").dataset.squad;

  // if data-squad's attribute value is "add" (student is not a member of squad)
  if (attr === "add") {
    // check if the student to be added to squad is from Slytherin
    if (student.house === "Slytherin") {
      // if the student is from Slytherin, check he/she is of pure-blood status
      if (student.bloodStatus === "pure-blood") {
        // if yes, add student to squad
        addToSquad(student);
        // trigger fading out animation on button text
        fadeOut(e, "squad");
        // if the student is not pure-blood, ask to choose a pure blood student
      } else {
        // show popup
        showOnlyPureBloodPopup(student);
      }
      // if the student is not from Slytherin
    } else {
      // add the student to squad
      addToSquad(student);
      // trigger fading out animation on button text
      fadeOut(e, "squad");
    }
    // if student is already a member of inquisitorial squad
  } else if (attr === "remove") {
    // remove the student from squad
    removeFromSquad(student);
    // trigger fading out animation on button text
    fadeOut(e, "squad");
  }
}

// add student to inquisitorial squad
function addToSquad(student) {
  student.squad = true;
  // update display of squad's members on filter
  changeSquadQuantityDisplay();
}

// remove student to inquisitorial squad
function removeFromSquad(student) {
  student.squad = false;
  // update display of squad's members on filter
  changeSquadQuantityDisplay();
}

// show popup suggesting to choose a pure blood student to be added to squad from Slytherin house
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
  // close popup
  window.addEventListener("click", checkForClosePureBloods);
}

// when click is made, check which element was clicked on
function checkForClosePureBloods(e) {
  if (e.target.classList.contains("close")) {
    closePopupPureBloodsClickBtn(e.target);
  } else if (e.target.classList.contains("popup")) {
    closePopupPureBloodsClickAway(e.target);
  }
}

// close "sonly_pure_bloods" popup on button click
function closePopupPureBloodsClickBtn(element) {
  element.closest(".content_wrapper").classList.add("disappear");
  element
    .closest(".content_wrapper")
    .addEventListener("animationend", removeDisappear);

  window.removeEventListener("click", checkForClosePureBloods);
}

// close "sonly_pure_bloods" popup on click beyond the popup's content
function closePopupPureBloodsClickAway(element) {
  element.querySelector(".content_wrapper").classList.add("disappear");
  element
    .querySelector(".content_wrapper")
    .addEventListener("animationend", removeDisappear);

  window.removeEventListener("click", checkForClosePureBloods);
}

// find student by id
function findStudent(ID) {
  return allStudents.find((item) => item.id === ID);
}

// filter student by one criteria passed in to this function
function filterByOneCriteria(list, criteria, value) {
  return list.filter((student) => student[criteria] === value);
}

// count quantity of students for filter fields (by one)
function countQuantities(list, criteria, value) {
  const quantityArray = filterByOneCriteria(list, criteria, value);
  return quantityArray.length;
}

// cound number students in each house
function countHouse(house) {
  const studentsNumber = countQuantities(
    allStudents,
    "house",
    capitalize(house)
  );
  filter[house.toLowerCase()].quantity = studentsNumber;
  // update quantity on the page
  displayQuantity(house.toLowerCase());
}

// count number of expelled students and members of inquisitorial squad
function countBoolProperty(property) {
  const studentNumber = countQuantities(allStudents, property, true);
  filter[property].quantity = studentNumber;
  // update quantity on the page
  displayQuantity(property);
}

// count number of students currently enrolled
function countEnrolled() {
  const studentsNumber =
    allStudents.length - countQuantities(allStudents, "expelled", true);
  filter.enrolled.quantity = studentsNumber;
  // update quantity on the page
  displayQuantity("enrolled");
}

// count number of all students
function countAllStudents() {
  filter.all.quantity = allStudents.length;
  // update quantity on the page
  displayQuantity("all");
}

// display students' quantities in filter badges
function displayQuantity(filterProrerty) {
  const parent = document.querySelector(
    `[data-filter="${filterProrerty.toLowerCase()}"]`
  ).parentNode;
  const badge = parent.querySelector(".badge");
  // badge for number of squad members contains span inside for fade out / fade in animations
  if (badge.classList.contains("squad_badge")) {
    badge.querySelector("span").textContent =
      filter[filterProrerty.toLowerCase()].quantity;
  } else {
    badge.textContent = filter[filterProrerty.toLowerCase()].quantity;
  }
}

// change text content of squad badge in filter
function changeSquadQuantityDisplay() {
  // count squad members
  const squadNumber = countQuantities(allStudents, "squad", true);
  // update squad quantity of filter object
  filter.squad.quantity = squadNumber;
  // trigger fading out animation
  const squadBadge = document.querySelector(".badge.squad_badge");
  squadBadge.querySelector("span").className = "";
  squadBadge.querySelector("span").classList.add("fade_out");
  squadBadge
    .querySelector("span")
    .addEventListener("animationend", changeSquadQuantityAnimation);

  // remove fading out animation and trigger fading in animation
  function changeSquadQuantityAnimation(e) {
    // remove fading out animation
    e.target.classList.remove("fade_out");
    e.target.removeEventListener("animationend", changeSquadQuantityAnimation);
    // change text inside squad badge
    changeText(e.target);
    // trigger fading in animation
    e.target.classList.add("fade_in");
    e.target.addEventListener("animationend", removeFadeIn);
  }

  // change text inside squad badge
  function changeText(element) {
    element.textContent = filter.squad.quantity;
  }
}

// display number of students for every filter field on page load
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

// trigger filtering process
function filterStudents(e) {
  // if "sort by" field of filter was changed
  if (e.target.nodeName === "SELECT") {
    // update sortBy property of filter object
    updateSort(e.target.value);
    // if one of filter divs was clicked
  } else {
    // highlight the newly changed div
    changeActiveClass(e.target.closest("li"));
    // update filter object
    updateFilterObject(e.target.dataset.filter);
  }
  // trigger re-display of students
  buildList();
}

// update sortBy property of filter object
function updateSort(sortBy) {
  filter.sortBy = sortBy;
}

// update filter object
function updateFilterObject(filterProrerty) {
  // toggle value of corresponding to clicked div filter property
  filter[filterProrerty].chosen = !filter[filterProrerty].chosen;

  // make sure that all other filter properties are not chosen
  const keys = Object.keys(filter);
  keys.forEach((key) => {
    if (key !== filterProrerty && key !== "sortBy") {
      filter[key].chosen = false;
    }
  });
}

// add "active" class to clicked div and make sure that the other divs don't have "active" class
function changeActiveClass(element) {
  document.querySelectorAll(".filter_list li").forEach((item) => {
    item.classList.remove("active");
  });
  element.classList.add("active");
}

// search students matching to the entered into input field text
function searchStudent(e) {
  // change chosen filter property to all students
  updateFilterObject("all");
  // highlight "All students" filter field
  changeActiveClass(document.querySelector("#filter_all").parentNode);
  // store searched text to string variable
  const searchedText = e.target.value.toLowerCase();
  // create array for storing students matching to the searched text
  const matchingStudents = [];
  // loop through all students and push students that match searched text to the array
  allStudents.forEach((student) => {
    const itemText = student.fullName.toLowerCase();
    if (itemText.indexOf(searchedText) != -1) {
      matchingStudents.push(student);
    }
  });
  // update number of students currently displayed
  document.querySelector(".all_students > .badge").textContent =
    matchingStudents.length;
  // display matching students
  displayList(matchingStudents);
  // when search input is out of focus, clear it
  e.target.addEventListener("blur", clearInput);
}

// clear search input value when it's not in focus
function clearInput(e) {
  e.target.value = "";
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

// toggle value of data-prefect attribute for HTML
function changePrefectAttribute(element, attr) {
  if (attr === "appoint") {
    element.dataset.prefect = "revoke";
  } else if (attr === "revoke") {
    element.dataset.prefect = "appoint";
  }
}

// toggle value of data-squad attribute for HTML
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

// hacking
function hackTheSystem() {
  // if the system has not been hacked, hack it
  if (hackCounter === 0) {
    enrollHacker(hackCounter);
    bringDownBloodStatuses(hackCounter);
    bringDownInquisitorialSquadSystem(hackCounter);

    // if the system has beed hacked, do not hack it
  } else {
    console.log("The system has already been hacked...");
  }
  // increment hack counter variable
  hackCounter++;
}

// add hacker to the student list
function enrollHacker() {
  // create hacker object from Student object
  createHackerObject();
  // display new list of students including hacker
  displayHackedStudentList();
}

// create hacker object
function createHackerObject() {
  const hacker = Object.create(Student);
  hacker.firstName = "Olga";
  hacker.lastName = "Baeva";
  hacker.nickName = "";
  hacker.middleName = "";

  hacker.house = "Ravenclaw";
  hacker.gender = "";
  hacker.bloodStatus = "muggle-blood";
  hacker.fullName = `${hacker.firstName} ${hacker.lastName}`;
  hacker.imageSrc = "";
  hacker.prefect = false;
  hacker.expelled = false;
  hacker.squad = false;
  hacker.isExpellable = false;
  hacker.id = generateID();

  // push hacker into allStudents array
  allStudents.push(hacker);
}

// trigger redisplay of altered student list
function displayHackedStudentList() {
  buildList();
  // update number of all students and currently displayed students
  countAllStudents();
}

// mess with blood statuses
function bringDownBloodStatuses() {
  // change blood status for every student
  allStudents.forEach(changeBloodStatus);
}

// change blood status for a student
function changeBloodStatus(student) {
  student.bloodStatus = getrandomBloodStatus();
}

// generate random blood status
function getrandomBloodStatus() {
  const bloodStatuses = ["pure-blood", "half-blood", "muggle-blood"];
  const randomBloodStatus = bloodStatuses[randomNumber()];
  return randomBloodStatus;
}

// generate random number from 0 to 2
function randomNumber() {
  return Math.floor(Math.random() * 3);
}

function bringDownInquisitorialSquadSystem() {
  console.log("bringDownInquisitorialSquadSystem");
  // const squadMembers = allStudents.filter(student => student.squad === true);'

  Object.defineProperty(Student, "squad", {
    set: function (value) {
      this.squad = value;
      changeSquadStatusOnHack();
    },
    get: function () {
      return this._myVar;
    },
  });
}

function changeSquadStatusOnHack() {
  console.log("changeSquadStatusOnHack");
}
