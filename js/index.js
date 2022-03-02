"use strict";

/*
Student list URL
https://petlatkea.dk/2021/hogwarts/students.json
Family list URL
https://petlatkea.dk/2021/hogwarts/families.json
*/
const settings = {
	filter: "*",
	filterType: "",
	allStudents: null,
	filteredStudents: null,
	blood: null,
	wasHacked: null,
};
const Student = {
	studentID: null,
	firstName: "",
	lastName: "",
	middleName: null,
	nickName: null,
	gender: "",
	imageSrc: "",
	house: "",
	prefect: false,
	inqSquad: false,
	bloodLine: null,
	expelled: false,
	cantBeExpelled: false,
};
window.addEventListener("DOMContentLoaded", setup);
async function setup() {
	getKeys();
	// Fetch data
	const urlStudent = "https://petlatkea.dk/2021/hogwarts/students.json";
	const urlBlood = "https://petlatkea.dk/2021/hogwarts/families.json";

	await fetchJSON(urlStudent, urlBlood);

	// Set eventlisteners
	/* SEARCH FIELD */
	const searchField = document.querySelector("#search");
	searchField.addEventListener("input", searchStudents);

	/* FILTER BUTTONS */
	const filterBtns = document.querySelectorAll("[data-action=filter]");
	filterBtns.forEach((btn) => {
		btn.addEventListener("click", (e) => {
			settings.filter = e.target.dataset.filter;
			settings.filterType = e.target.dataset.filterType;
			buildList();
		});
	});
	/* SORT SELECT */
	const sortSelect = document.querySelector("#sort");
	sortSelect.addEventListener("change", sortingFunction);
	/* PREFECT BUTTON */
	const prefects = document.querySelector(".button.prefects");
	prefects.addEventListener("click", () => {
		console.log("PREFECTS");
	});
	/* INQ SQUAD BUTTON */
	const inqSquad = document.querySelector(".button.inq_squad");
	inqSquad.addEventListener("click", () => {
		console.log("Inquisitorial Squad");
	});

	// Build list
}

/********************************************* FETCHING JSON *********************************************/
async function fetchJSON(studentURL, bloodURL) {
	//Student Fetch
	const responseUrl1 = await fetch(studentURL);
	const studentData = await responseUrl1.json();

	const responseUrl2 = await fetch(bloodURL);
	const bloodData = await responseUrl2.json();

	settings.blood = bloodData;
	settings.allStudents = cleanData(studentData);
	settings.filteredStudents = settings.allStudents;

	buildList();
}

/********************************************* CLEANING JSON OBJECTS *********************************************/
function cleanData(data) {
	let dataList = [];
	data.forEach((el, idx) => {
		const student = Object.create(Student);

		//Trimmed data
		let originalName = el.fullname.trim();
		let originalMiddleName = originalName.substring(originalName.indexOf(" "), originalName.lastIndexOf(" ")).trim();
		let house = el.house.trim();
		let gender = el.gender.trim();

		// Setting Object Property Values
		// Student ID by idx
		student.studentID = idx + 1;
		student.expelled = false;
		student.bloodLine = "";

		// Firstname: Check if name conatins a space
		if (originalName.includes(" ")) {
			student.firstName = originalName.substring(0, 1).toUpperCase() + originalName.substring(1, originalName.indexOf(" "));
		} else {
			student.firstName = originalName.substring(0, 1).toUpperCase() + originalName.substring(1);
		}
		// Last Name: Check if name conatins a space
		if (originalName.includes(" ")) {
			student.lastName =
				originalName.substring(originalName.lastIndexOf(" ") + 1, originalName.lastIndexOf(" ") + 2).toUpperCase() + originalName.substring(originalName.lastIndexOf(" ") + 2).toLowerCase();
		}
		// Middle Name and Nick Name: Check if it contains ""
		if (!originalName.includes('"')) {
			student.middleName = originalMiddleName.substring(0, 1).toUpperCase() + originalMiddleName.substring(1).toLowerCase();
		}

		// Middle Name and Nick Name: Check if it contains ""
		if (originalName.includes('"')) {
			student.nickName = originalName.substring(originalName.indexOf('"') + 1, originalName.lastIndexOf('"'));
		}

		// Uppercase Gender
		student.gender = gender.toLowerCase();
		// Set Image Source
		student.imageSrc = `../assets/img/${originalName.substring(originalName.lastIndexOf(" ") + 1).toLowerCase()}_${student.firstName.charAt(0).toLowerCase()}.jpg`;
		//House
		student.house = house.substring(0, 1).toUpperCase() + house.substring(1).toLowerCase();
		student.bloodLine = whichBlood(student.lastName);

		dataList.push(student);
	});
	return dataList;
}

/********************************************* FILTERING *********************************************/
function buildList() {
	//TODO: Fix rest of filter
	// settings.filteredStudents = settings.allStudents;

	switch (settings.filter) {
		case "*":
			settings.filteredStudents = settings.allStudents;
			break;
		case "false":
			settings.filteredStudents = settings.allStudents.filter(filterStudentsNotExpelled);
			break;
		case "true":
			settings.filteredStudents = settings.allStudents.filter(filterStudentsExpelled);
			break;
		default:
			settings.filteredStudents = settings.allStudents.filter(filterStudents);
			break;
	}

	function filterStudents(student) {
		if (student[settings.filterType].toLowerCase() === settings.filter.toLowerCase()) {
			return true;
		} else {
			return false;
		}
	}
	function filterStudentsExpelled(student) {
		if (student[settings.filterType] === true) {
			return true;
		} else {
			return false;
		}
	}
	function filterStudentsNotExpelled(student) {
		if (student[settings.filterType] === false) {
			return true;
		} else {
			return false;
		}
	}
	displayList(settings.filteredStudents);
}

/********************************************* DISPLAYING STUDENTS *********************************************/
function displayList(students) {
	//Show number of results
	document.querySelector(".number_result").textContent = `Showing ${students.length} results`;
	// clear the list
	document.querySelector(".filter_container").innerHTML = "";

	const filterContainer = document.querySelector(".filter_container");
	const studentTemplate = document.querySelector("#student_template");

	students.forEach((student, idx) => {
		let clone = studentTemplate.cloneNode(true).content;
		//TODO: BILLEDER
		clone.querySelector("img").src = student.imageSrc;
		clone.querySelector(".name").textContent = `${student.firstName} ${student.middleName ? student.middleName : " "} ${student.lastName}`;
		clone.querySelector(".house").textContent = student.house;

		clone.querySelector(".student_container").setAttribute("data-id", `${idx}`);
		// IF Student is in Inquisitorial Squad
		if (student.inqSquad) {
			clone.querySelector(".student_container").setAttribute("data-squad", "true");
		}
		// If student is prefect
		if (student.prefect) {
			clone.querySelector(".student_container").setAttribute("data-prefect", "true");
		}
		// If student is expelled
		if (student.expelled) {
			clone.querySelector(".status").textContent = "Expelled";
		} else {
			clone.querySelector(".status").textContent = "";
		}

		// DETAILS MODAL
		clone.querySelector(".student_container").addEventListener("click", detailsClick);
		function detailsClick() {
			console.log("Details  Click: ", student);
			showDetails(student);
		}

		clone.querySelector(".studentID").textContent = `Nr. ${student.studentID}`;

		filterContainer.appendChild(clone);
	});
	displayInfoNumbers();
}

/********************************************* SEARCH *********************************************/
function searchStudents(e) {
	displayList(
		settings.allStudents.filter((elm) => {
			// comparing in uppercase so that m is the same as M
			return (
				elm.firstName.toUpperCase().includes(e.target.value.toUpperCase()) ||
				elm.lastName.toUpperCase().includes(e.target.value.toUpperCase()) ||
				elm.house.toUpperCase().includes(e.target.value.toUpperCase()) ||
				elm.bloodLine.toUpperCase().includes(e.target.value.toUpperCase())
			);
		})
	);
}

/********************************************* SORT *********************************************/
function sortingFunction() {
	let sortParam = this.value;

	function sortFunction() {
		settings.filteredStudents.sort(compare);

		buildList();
	}

	function compare(a, b) {
		if (a[sortParam] < b[sortParam]) {
			return -1;
		} else {
			return 1;
		}
	}
	function compareReverse(a, b) {
		if (a[sortParam] > b[sortParam]) {
			return -1;
		} else {
			return 1;
		}
	}
	sortFunction();
}

/********************************************* DISPLAYING NUMBERS *********************************************/
function displayInfoNumbers() {
	/* SETTING NUMBERS OF STUDENTS PER HOUSE */
	let slytheringAmount = settings.allStudents.filter((student) => {
		return student.house.toLowerCase() === "slytherin";
	});
	let hufflepuffAmount = settings.allStudents.filter((student) => {
		return student.house.toLowerCase() === "hufflepuff";
	});
	let ravenclawAmount = settings.allStudents.filter((student) => {
		return student.house.toLowerCase() === "ravenclaw";
	});
	let gryffindorAmount = settings.allStudents.filter((student) => {
		return student.house.toLowerCase() === "gryffindor";
	});
	document.querySelector(".slytherin_amount").textContent = slytheringAmount.length;
	document.querySelector(".hufflepuff_amount").textContent = hufflepuffAmount.length;
	document.querySelector(".ravenclaw_amount").textContent = ravenclawAmount.length;
	document.querySelector(".gryffindor_amount").textContent = gryffindorAmount.length;
	/* SETTING TOTAL NUMBER OF STUDENTS */
	let notExpelled = settings.allStudents.filter((student) => {
		return student.expelled === false;
	});
	let expelled = settings.allStudents.filter((student) => {
		return student.expelled === true;
	});
	document.querySelector(".not_expelled").textContent = notExpelled.length;
	document.querySelector(".expelled").textContent = expelled.length;
}

/********************************************* EXPELL STUDENT *********************************************/
function expellStudent(studentToExpell) {
	// Set Expelled to true
	studentToExpell.expelled = true;
	studentToExpell.inqSquad = false;
	studentToExpell.prefect = false;
	buildList();
}

/********************************************* DETAILS POPUP  *********************************************/
function showDetails(student) {
	//TODO Set color and crest
	console.log(student);
	const modal = document.querySelector(".details_modal");
	const backdrop = document.querySelector(".backdrop");

	modal.classList.remove("hide");

	modal.querySelector("img").src = student.imageSrc;
	modal.querySelector(".firstname span").textContent = student.firstName;
	modal.querySelector(".middlename span").textContent = student.middleName || student.nickName;
	modal.querySelector(".lastname span").textContent = student.lastName;
	modal.querySelector(".house span").textContent = student.house;
	modal.querySelector(".blood span").textContent = student.bloodLine;

	// Expell button
	modal.querySelector(".expell_btn").addEventListener("click", expellClick);

	function expellClick() {
		modal.querySelector(".expell_btn").removeEventListener("click", expellClick);
		expellStudent(student);
		closeClick();
	}
	// If Expelled
	if (student.expelled) {
		modal.classList.add("expelled");
	}
	/******************************************** MAKE PREFECT *********************************************/
	// Set prefect visual
	if (student.prefect) {
		modal.querySelector(".left").setAttribute("data-prefect", "true");
	} else {
		modal.querySelector(".left").setAttribute("data-prefect", "false");
	}

	//Prefect
	if (student.prefect) {
		modal.querySelector("#prefect").textContent = "Remove Prefect";
	} else {
		modal.querySelector("#prefect").textContent = "Make Prefect";
	}
	modal.querySelector("#prefect").addEventListener("click", prefectClick);

	function prefectClick() {
		console.log("Selected Student: ", student);
		modal.querySelector("#prefect").removeEventListener("click", prefectClick);
		if (student.prefect === true) {
			student.prefect = false;
			buildList();
		} else {
			makePrefect(student);
		}
		closeClick();
	}

	/******************************************** MAKE INQUISITORIAL SQUAD*********************************************/
	// Set InqSquad visul
	if (student.inqSquad) {
		modal.querySelector(".left").setAttribute("data-squad", "true");
	} else {
		modal.querySelector(".left").setAttribute("data-squad", "false");
	}

	if (student.inqSquad) {
		modal.querySelector("#inq_squad").textContent = "Remove from Inq. Squad";
	} else {
		modal.querySelector("#inq_squad").textContent = "Add to Inq. Squad";
	}
	modal.querySelector("#inq_squad").addEventListener("click", inqSquadClick);

	function inqSquadClick() {
		modal.querySelector("#inq_squad").removeEventListener("click", inqSquadClick);

		if (student.inqSquad === true) {
			console.log("Setting to false");
			student.inqSquad = false;
			buildList();
		} else {
			console.log("Making InqSquad");

			makeInqSquad(student);
		}
		closeClick();
	}

	// Backdrop Close
	backdrop.addEventListener("click", closeClick);
	// Close button
	modal.querySelector(".close_btn").addEventListener("click", closeClick);
	function closeClick() {
		modal.classList.add("hide");
		modal.querySelector(".close_btn").removeEventListener("click", closeClick);
		modal.querySelector(".expell_btn").removeEventListener("click", expellClick);
		modal.querySelector("#prefect").removeEventListener("click", prefectClick);
		modal.querySelector("#inq_squad").removeEventListener("click", inqSquadClick);

		backdrop.removeEventListener("click", closeClick);
	}
}

/********************************************* MAKE PREFECT *********************************************/
function makePrefect(selectedStudent) {
	const prefects = settings.allStudents.filter((selectedStudent) => selectedStudent.prefect);
	const sameHouse = prefects.filter((student) => student.house === selectedStudent.house);
	const sameGender = sameHouse.filter((student) => student.gender === selectedStudent.gender);
	// console.log("Prefects: ", prefects);
	// console.log("Same house", sameHouse);
	// console.log("Same house same gender", sameGender);

	// console.log(sameHouse);
	if (sameHouse.length > 0) {
		if (sameGender.length > 0) {
			removeSameGender(sameGender[0]);
		} else {
			addPrefect(selectedStudent);
			buildList();
		}
	} else {
		addPrefect(selectedStudent);
		buildList();
	}

	// Does the array contain same house
	//If no, addPrefect

	//If Yes, is it same gender?
	//If ignore, do nothing

	//If same gender
	function removeSameGender(sameGender) {
		const sameGenderPU = document.querySelector(".same_gender_popup");
		sameGenderPU.classList.remove("hide");

		sameGenderPU.querySelector(".gender").textContent = sameGender.gender;
		sameGenderPU.querySelector(".house").textContent = sameGender.house;
		sameGenderPU.querySelector(".name").textContent = selectedStudent.firstName;
		sameGenderPU.querySelector(".gender2").textContent = selectedStudent.gender;

		// Eventlisteners

		sameGenderPU.querySelector(".close_btn").addEventListener("click", () => {
			sameGenderPU.classList.add("hide");
			document.querySelector(".details_modal").classList.add("hide");
		});
		sameGenderPU.querySelector(".yes").addEventListener("click", removeSameClick);
		sameGenderPU.querySelector(".no").addEventListener("click", () => {
			sameGenderPU.classList.add("hide");
			document.querySelector(".details_modal").classList.add("hide");
		});

		function removeSameClick() {
			removeOne(sameGender);
			addPrefect(selectedStudent);
			sameGenderPU.classList.add("hide");
			document.querySelector(".details_modal").classList.add("hide");
			buildList();
			sameGenderPU.querySelector(".yes").removeEventListener("click", removeSameClick);

			console.log(prefects);
		}
	}

	function addPrefect(student) {
		student.prefect = true;
	}

	function removeOne(student) {
		student.prefect = false;
	}
}

/********************************************* GET BLOODLINE *********************************************/
function whichBlood(lastName) {
	let pureblood = settings.blood.pure;
	let halfblood = settings.blood.half;
	if (pureblood.includes(lastName) && halfblood.includes(lastName)) {
		return "Halfblood";
	} else if (pureblood.includes(lastName) && !halfblood.includes(lastName)) {
		return "Pureblood";
	} else {
		return "Muggle";
	}
}

/********************************************* MAKE INQUISITORIAL SQUAD *********************************************/
function makeInqSquad(selectedStudent) {
	if (selectedStudent.house === "slytherin" || selectedStudent.bloodLine === "Pureblood") {
		selectedStudent.inqSquad = true;
		buildList();
	} else {
		//TODO: Make popup alert for not eligable inqsquad
		console.log("HOLD UP!");
	}
}

/********************************************* GET KEYSTROKES *********************************************/
function getKeys() {
	// Stroke Capture
	let buffer = [];
	// Time of last key pressed
	let lastKeyTime = Date.now();

	document.addEventListener("keyup", (e) => {
		const charList = "abcdefghijklmnopqrstuvwxyz0123456789";
		const key = e.key.toLowerCase();

		// Only interested in alphanumeric keys (Letters and Numbers)
		if (charList.indexOf(key) === -1) return;

		// Current Time
		const currentTime = Date.now();

		if (currentTime - lastKeyTime > 1000) {
			buffer = [];
		}
		buffer.push(key);
		lastKeyTime = currentTime;

		console.log(buffer);
		console.log(lastKeyTime);
		if (buffer.join("") === "hackme") {
			hackTheSystem();
		}
	});
}

/********************************************* HACKING *********************************************/
function hackTheSystem() {
	if (settings.wasHacked) {
		console.log("Can't Be hacked again");
	} else {
		settings.wasHacked = true;
		addSelf();
		console.log("Hacking started");
	}
}

function addSelf() {
	const self = Object.create(Student);
	self.studentID = "69";
	self.firstName = "Malte";
	self.middleName = "Tambo";
	self.lastName = "Skjoldager";
	self.gender = "boy";
	self.house = "Gryffindor";
	self.imageSrc = "./assets/img/mig.jpg";
	self.cantBeExpelled = true;

	console.log(self);
	settings.allStudents.push(self);
	buildList();
	console.log(settings.allStudents);
}
