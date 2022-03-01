"use strict";

/*
Student list URL
https://petlatkea.dk/2021/hogwarts/students.json
Family list URL
https://petlatkea.dk/2021/hogwarts/families.json
*/
const settings = {
	filter: "*",
	allStudents: null,
	filteredStudents: null,
};
window.addEventListener("DOMContentLoaded", setup);
function setup() {
	// Fetch data
	const url = "https://petlatkea.dk/2021/hogwarts/students.json";

	fetchJSON(url);

	// Set eventlisteners
	/* SEARCH FIELD */
	const searchField = document.querySelector("#search");
	searchField.addEventListener("input", searchStudents);

	/* FILTER BUTTONS */
	const filterBtns = document.querySelectorAll("[data-action=filter]");
	filterBtns.forEach((btn) => {
		btn.addEventListener("click", buildList);
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

async function fetchJSON(url) {
	const response = await fetch(url);
	const studentData = await response.json();
	// console.table(studentData);

	settings.allStudents = cleanData(studentData);
	settings.filteredStudents = settings.allStudents;

	// console.table(settings.allStudents);
	displayList(settings.allStudents);
}

function cleanData(data) {
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
	};
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
		// Uppercase House
		student.house = house.toLowerCase();

		dataList.push(student);
	});
	return dataList;
}

function buildList() {
	settings.filteredStudents = settings.allStudents;
	settings.filter = this.dataset.filter;
	let filterType = this.dataset.filterType;

	if (settings.filter === "*") {
		settings.filteredStudents = settings.allStudents;
	} else if (settings.filter === "false") {
		settings.filteredStudents = settings.allStudents.filter(filterStudentsNotExpelled);
	} else if (settings.filter === "true") {
		settings.filteredStudents = settings.allStudents.filter(filterStudentsExpelled);
	} else if (settings.filter !== "*") {
		settings.filteredStudents = settings.allStudents.filter(filterStudents);
	} else {
		settings.filteredStudents = settings.allStudents;
	}
	function filterStudents(student) {
		if (student[filterType] === settings.filter) {
			return true;
		} else {
			return false;
		}
	}
	function filterStudentsExpelled(student) {
		if (student[filterType] === true) {
			return true;
		} else {
			return false;
		}
	}
	function filterStudentsNotExpelled(student) {
		if (student[filterType] === false) {
			return true;
		} else {
			return false;
		}
	}
	displayList(settings.filteredStudents);
}

function displayList(cleanedList) {
	//Show number of results
	document.querySelector(".number_result").textContent = `Showing ${cleanedList.length} results`;
	// clear the list
	document.querySelector(".filter_container").innerHTML = "";

	const filterContainer = document.querySelector(".filter_container");
	const studentTemplate = document.querySelector("#student_template");

	cleanedList.forEach((student, idx) => {
		let clone = studentTemplate.cloneNode(true).content;
		clone.querySelector("img").src = student.imageSrc;
		clone.querySelector(".name").textContent = `${student.firstName} ${student.middleName ? student.middleName : " "} ${student.lastName}`;
		clone.querySelector(".house").textContent = student.house;

		clone.querySelector(".student_container").setAttribute("data-id", `${idx}`);
		if (student.inqSquad) {
			clone.querySelector(".student_container").setAttribute("data-squad", "true");
		}
		if (student.prefect) {
			clone.querySelector(".student_container").setAttribute("data-prefect", "true");
		}
		if (student.expelled) {
			clone.querySelector(".status").textContent = "Expelled";
		} else {
			clone.querySelector(".status").textContent = "";
		}

		// DETAILS MODAL
		clone.querySelector(".student_container").addEventListener("click", () => {
			showDetails(student);
		});

		clone.querySelector(".studentID").textContent = `Nr. ${student.studentID}`;

		filterContainer.appendChild(clone);
	});
	displayInfoNumbers();

	let testPrefect = settings.allStudents.filter((selectedStudent) => selectedStudent.prefect);
	console.log(testPrefect);
}

function searchStudents(e) {
	displayList(
		settings.allStudents.filter((elm) => {
			// comparing in uppercase so that m is the same as M
			return (
				elm.firstName.toUpperCase().includes(e.target.value.toUpperCase()) ||
				elm.lastName.toUpperCase().includes(e.target.value.toUpperCase()) ||
				elm.house.toUpperCase().includes(e.target.value.toUpperCase())
			);
		})
	);
}

function sortingFunction() {
	let sortParam = this.value;

	function sortFunction() {
		settings.filteredStudents.sort(compare);

		displayList(settings.filteredStudents);
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

function displayInfoNumbers() {
	/* SETTING NUMBERS OF STUDENTS PER HOUSE */
	let slytheringAmount = settings.allStudents.filter((student) => {
		return student.house === "slytherin";
	});
	let hufflepuffAmount = settings.allStudents.filter((student) => {
		return student.house === "hufflepuff";
	});
	let ravenclawAmount = settings.allStudents.filter((student) => {
		return student.house === "ravenclaw";
	});
	let gryffindorAmount = settings.allStudents.filter((student) => {
		return student.house === "gryffindor";
	});
	document.querySelector(".slytherin_amount").textContent = slytheringAmount.length;
	document.querySelector(".hufflepuff_amount").textContent = hufflepuffAmount.length;
	document.querySelector(".ravenclaw_amount").textContent = ravenclawAmount.length;
	document.querySelector(".gryffindor_amount").textContent = gryffindorAmount.length;
	/* SETTING TOTAL NUMBER OF STUDENTS */
	let notExpelled = settings.allStudents.filter((student) => {
		return student.expelled === true;
	});
	let expelled = settings.allStudents.filter((student) => {
		return student.expelled === false;
	});
	document.querySelector(".not_expelled").textContent = notExpelled.length;
	document.querySelector(".expelled").textContent = expelled.length;
}

function expellStudent(student) {
	// Get clicked student id
	let studentIdx = student.studentID - 1;
	// Set Expelled to true
	settings.allStudents[studentIdx].expelled = true;
	displayList(settings.filteredStudents);
}

function showDetails(student) {
	const modal = document.querySelector(".details_modal");
	modal.classList.remove("hide");

	modal.querySelector("img").src = student.imageSrc;
	modal.querySelector(".firstname span").textContent = student.firstName;
	modal.querySelector(".middlename span").textContent = student.middleName || student.nickName;
	modal.querySelector(".lastname span").textContent = student.lastName;
	modal.querySelector(".house span").textContent = student.house;
	modal.querySelector(".blood span").textContent = student.bloodLine;
	// Close button
	modal.querySelector(".close_btn").addEventListener("click", () => {
		modal.classList.add("hide");
	});
	// Expell button
	modal.querySelector(".expell_btn").addEventListener("click", () => {
		expellStudent(student);
		modal.classList.add("hide");
	});
	// If Expelled
	if (student.expelled) {
		modal.classList.add("expelled");
	}

	//Prefect
	modal.querySelector("#prefect").addEventListener("click", prefectClick);

	function prefectClick() {
		console.log("hej");
		if (student.prefect === true) {
			student.prefect = false;
			displayList(settings.filteredStudents);
		} else {
			makePrefect(student);
		}
		modal.classList.add("hide");
		modal.querySelector("#prefect").removeEventListener("click", prefectClick);
	}
}

function makePrefect(selectedStudent) {
	const prefects = settings.allStudents.filter((selectedStudent) => selectedStudent.prefect);
	const sameGender = prefects.filter((student) => student.gender === selectedStudent.gender).shift();
	const sameHouse = prefects.filter((student) => student.house === selectedStudent.house).shift();
	//TESTING
	// addPrefect(selectedStudent);
	//TODO: fix bug!
	if (sameHouse !== undefined) {
		if (sameGender !== undefined && sameGender.gender === selectedStudent.gender) {
			removeSameGender(sameGender);
		} else {
			addPrefect(selectedStudent);
			displayList(settings.filteredStudents);
		}
	} else {
		addPrefect(selectedStudent);
		displayList(settings.filteredStudents);
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
			displayList(settings.filteredStudents);
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
