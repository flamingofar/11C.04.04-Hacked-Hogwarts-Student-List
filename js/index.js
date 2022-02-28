"use strict";
console.log("Hacked");

/*
Student list URL
https://petlatkea.dk/2021/hogwarts/students.json
Family list URL
https://petlatkea.dk/2021/hogwarts/families.json
*/
function setup() {
	// Fetch data
	const url = "https://petlatkea.dk/2021/hogwarts/students.json";

	fetchJSON(url);

	// Set eventlisteners
	/* FILTER BUTTONS */
	const filterBtns = document.querySelectorAll("[data-action=filter]");
	filterBtns.forEach((btn) => {
		btn.addEventListener("click", (e) => {
			console.log(e.target.dataset.filter);
		});
	});
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

	let cleanedDataList = cleanData(studentData);
	buildList(cleanedDataList);
	console.table(cleanedDataList);
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
		student.gender = gender.substring(0, 1).toUpperCase() + gender.substring(1).toLowerCase();
		// Set Image Source
		student.imageSrc = `../assets/img/${originalName.substring(originalName.lastIndexOf(" ") + 1).toLowerCase()}_${student.firstName.charAt(0).toLowerCase()}.jpg`;
		// Uppercase House
		student.house = house.substring(0, 1).toUpperCase() + house.substring(1).toLowerCase();

		dataList.push(student);
	});
	return dataList;
}

function buildList(studentList) {
	let newArr = studentList;

	displayList(newArr);
}

function displayList(cleanedList) {
	const filterContainer = document.querySelector(".filter_container");
	const studentTemplate = document.querySelector("#student_template");

	cleanedList.forEach((student, idx) => {
		let clone = studentTemplate.cloneNode(true).content;
		clone.querySelector("img").src = student.imageSrc;
		clone.querySelector(".name").textContent = `${student.firstName} ${student.middleName ? student.middleName : " "} ${student.lastName}`;

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

		clone.querySelector(".studentID").textContent = `Nr. ${student.studentID}`;

		filterContainer.appendChild(clone);
	});
}

setup();
