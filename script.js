let currentInput = "";
let previousInput = "";
let operator = null;
let calcMode = "standard";
let historyData = [];

const resultDisplay = document.getElementById("result");
const historyDisplay = document.getElementById("history");
const historyList = document.getElementById("history-list");
const btnSpecial = document.getElementById("btn-special");
const calcTitle = document.getElementById("calc-title");

document.addEventListener("DOMContentLoaded", () => {
  if (
    localStorage.getItem("theme") === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
    updateThemeUI(true);
  }
});

const sidebar = document.getElementById("menu-sidebar");
const backdrop = document.getElementById("menu-backdrop");
let isMenuOpen = false;

function toggleMenu() {
  isMenuOpen = !isMenuOpen;
  if (isMenuOpen) {
    backdrop.classList.remove("hidden");
    setTimeout(() => {
      backdrop.classList.remove("opacity-0");
      sidebar.classList.remove("-translate-x-full");
    }, 10);
  } else {
    backdrop.classList.add("opacity-0");
    sidebar.classList.add("-translate-x-full");
    setTimeout(() => backdrop.classList.add("hidden"), 300);
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  updateThemeUI(isDark);
}

function updateThemeUI(isDark) {
  document.getElementById("theme-text").innerText = isDark
    ? "Light Mode"
    : "Dark Mode";
  const knob = document.getElementById("theme-knob");
  isDark
    ? knob.classList.add("translate-x-4")
    : knob.classList.remove("translate-x-4");
}

function setMode(mode) {
  calcMode = mode;
  calcTitle.innerText = mode;

  const btnStd = document.getElementById("btn-std");
  const btnSci = document.getElementById("btn-sci");

  if (mode === "standard") {
    btnSpecial.innerText = "%";
    btnStd.className =
      "text-left p-3 rounded-xl bg-stripe-orange text-white font-medium shadow-md transition-colors";
    btnSci.className =
      "text-left p-3 rounded-xl bg-keypad-bg dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-medium transition-colors";
  } else {
    btnSpecial.innerText = "√";
    btnSci.className =
      "text-left p-3 rounded-xl bg-stripe-orange text-white font-medium shadow-md transition-colors";
    btnStd.className =
      "text-left p-3 rounded-xl bg-keypad-bg dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-medium transition-colors";
  }
  toggleMenu(); 
}

function addToHistory(equation, result) {
  historyData.push(`${equation} = ${result}`);
  renderHistory();
}

function renderHistory() {
  if (historyData.length === 0) {
    historyList.innerHTML =
      '<span class="opacity-50 italic">No history yet...</span>';
    return;
  }
  historyList.innerHTML = historyData
    .map(
      (item) =>
        `<div class="border-b border-gray-300 dark:border-gray-600 pb-1 mb-1 last:border-0">${item}</div>`,
    )
    .reverse()
    .join("");
}

function clearHistory() {
  historyData = [];
  renderHistory();
}

function updateDisplay() {
  resultDisplay.innerText = currentInput === "" ? "0" : currentInput;
  if (operator != null) {
    let displayOp = operator === "*" ? "×" : operator === "/" ? "÷" : operator;
    historyDisplay.innerText = `${previousInput} ${displayOp}`;
  } else {
    historyDisplay.innerText = "";
  }
}

function appendNumber(number) {
  if (number === "." && currentInput.includes(".")) return;
  if (currentInput === "0" && number !== ".") currentInput = number;
  else currentInput += number;
  updateDisplay();
}

function appendOperator(op) {
  if (currentInput === "" && previousInput === "") return;
  if (currentInput !== "" && previousInput !== "" && operator !== null)
    calculateResult(false);

  if (currentInput !== "") {
    previousInput = currentInput;
    currentInput = "";
  }
  operator = op;
  updateDisplay();
}

function handleSpecialOp() {
  if (currentInput === "") return;
  let prevVal = parseFloat(currentInput);
  if (calcMode === "standard") {
    currentInput = (prevVal / 100).toString();
  } else {
    if (prevVal < 0) currentInput = "Error";
    else currentInput = Math.sqrt(prevVal).toString();
  }
  updateDisplay();
}

function calculateResult(isFinal = true) {
  const prev = parseFloat(previousInput);
  const current = parseFloat(currentInput);
  if (isNaN(prev) || isNaN(current)) return;

  let result;
  switch (operator) {
    case "+":
      result = prev + current;
      break;
    case "-":
      result = prev - current;
      break;
    case "*":
      result = prev * current;
      break;
    case "/":
      result = current === 0 ? "Error" : prev / current;
      break;
    default:
      return;
  }

  result = Math.round(result * 100000000) / 100000000;

  if (isFinal) {
    let displayOp = operator === "*" ? "×" : operator === "/" ? "÷" : operator;
    let equation = `${prev} ${displayOp} ${current}`;
    addToHistory(equation, result);
    currentInput = result.toString();
    operator = null;
    previousInput = "";
  } else {
    currentInput = result.toString();
  }
  updateDisplay();
}

function clearDisplay() {
  currentInput = "";
  previousInput = "";
  operator = null;
  updateDisplay();
}

function toggleSign() {
  if (currentInput === "") return;
  currentInput = (parseFloat(currentInput) * -1).toString();
  updateDisplay();
}
