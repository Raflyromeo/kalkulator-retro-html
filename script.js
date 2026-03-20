let currentInput = "";
let previousInput = "";
let operator = null;
let calcMode = "standard";
let progBase = 10;
let exchangeRates = {};

const keypadContainer = document.getElementById("keypad-container");
const scrStd = document.getElementById("screen-std");
const scrCurr = document.getElementById("screen-currency");
const scrProg = document.getElementById("screen-prog");
const scrTemp = document.getElementById("screen-temp");

document.addEventListener("DOMContentLoaded", () => {
  if (
    localStorage.getItem("theme") === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
    updateThemeUI(true);
  }
  renderKeypad("standard");
  fetchCurrencies();
});

function toggleMenu() {
  const isMenuOpen = !document
    .getElementById("menu-backdrop")
    .classList.contains("hidden");
  if (!isMenuOpen) {
    document.getElementById("menu-backdrop").classList.remove("hidden");
    setTimeout(() => {
      document.getElementById("menu-backdrop").classList.remove("opacity-0");
      document
        .getElementById("menu-sidebar")
        .classList.remove("-translate-x-full");
    }, 10);
  } else {
    document.getElementById("menu-backdrop").classList.add("opacity-0");
    document.getElementById("menu-sidebar").classList.add("-translate-x-full");
    setTimeout(
      () => document.getElementById("menu-backdrop").classList.add("hidden"),
      300,
    );
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
  isDark
    ? document.getElementById("theme-knob").classList.add("translate-x-4")
    : document.getElementById("theme-knob").classList.remove("translate-x-4");
}

function setMode(mode) {
  calcMode = mode;
  currentInput = "";
  previousInput = "";
  operator = null;
  document.getElementById("calc-title").innerText = mode;

  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.classList.remove("bg-stripe-orange", "text-white");
    btn.classList.add(
      "bg-keypad-bg",
      "dark:bg-gray-700",
      "text-gray-800",
      "dark:text-gray-100",
    );
  });
  event.currentTarget.classList.add("bg-stripe-orange", "text-white");
  event.currentTarget.classList.remove(
    "bg-keypad-bg",
    "dark:bg-gray-700",
    "text-gray-800",
    "dark:text-gray-100",
  );

  scrStd.classList.add("hidden");
  scrCurr.classList.add("hidden");
  scrProg.classList.add("hidden");
  scrTemp.classList.add("hidden");

  if (mode === "standard" || mode === "scientific") {
    scrStd.classList.remove("hidden");
    renderKeypad(mode);
    updateDisplay();
  }
  if (mode === "currency") {
    scrCurr.classList.remove("hidden");
    renderKeypad("input_only");
    updateCurrencyUI();
  }
  if (mode === "temperature") {
    scrTemp.classList.remove("hidden");
    renderKeypad("input_only");
    updateTempUI();
  }
  if (mode === "programmer") {
    scrProg.classList.remove("hidden");
    renderKeypad("programmer");
    updateProgUI();
  }

  toggleMenu();
}

function renderKeypad(type) {
  keypadContainer.className = `grid grid-${type === "scientific" || type === "programmer" ? type : "std"} h-full`;

  const numPadHTML = `
        <button class="btn btn-round btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('7')">7</button>
        <button class="btn btn-round btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('8')">8</button>
        <button class="btn btn-round btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('9')">9</button>
        <button class="btn btn-round btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('4')">4</button>
        <button class="btn btn-round btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('5')">5</button>
        <button class="btn btn-round btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('6')">6</button>
        <button class="btn btn-round btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('1')">1</button>
        <button class="btn btn-round btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('2')">2</button>
        <button class="btn btn-round btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('3')">3</button>
    `;

  if (type === "standard") {
    keypadContainer.innerHTML = `
            <button class="btn btn-round btn-action text-white" onclick="clearDisplay()">C</button>
            <button class="btn btn-round btn-op text-white" onclick="toggleSign()">±</button>
            <button class="btn btn-round btn-op text-white" onclick="appendOperator('%')">%</button>
            <button class="btn btn-round btn-op text-white" onclick="appendOperator('/')">÷</button>
            ${numPadHTML
              .replace(/btn-round/g, "btn-round col-span-1")
              .replace(/<\/button>/g, "</button>")
              .replace(
                /9<\/button>/,
                `9</button><button class="btn btn-round btn-op text-white" onclick="appendOperator('*')">×</button>`,
              )
              .replace(
                /6<\/button>/,
                `6</button><button class="btn btn-round btn-op text-white" onclick="appendOperator('-')">-</button>`,
              )
              .replace(
                /3<\/button>/,
                `3</button><button class="btn btn-round btn-op text-white" onclick="appendOperator('+')">+</button>`,
              )}
            <button class="btn btn-wide btn-num text-text-orange dark:text-stripe-yellow col-span-2 rounded-[30px]" onclick="appendNumber('0')">0</button>
            <button class="btn btn-round btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('.')">.</button>
            <button class="btn btn-round btn-op text-white" onclick="calcResult()">=</button>
        `;
  } else if (type === "scientific") {
    keypadContainer.innerHTML = `
            <button class="btn btn-small btn-action text-white" onclick="clearDisplay()">C</button>
            <button class="btn btn-small btn-op text-white" onclick="toggleSign()">±</button>
            <button class="btn btn-small btn-op text-white" onclick="execMath('sin')">sin</button>
            <button class="btn btn-small btn-op text-white" onclick="execMath('cos')">cos</button>
            <button class="btn btn-small btn-op text-white" onclick="execMath('tan')">tan</button>

            <button class="btn btn-small btn-op text-white" onclick="execMath('sqrt')">√</button>
            <button class="btn btn-small btn-op text-white" onclick="appendOperator('^')">^</button>
            <button class="btn btn-small btn-op text-white" onclick="execMath('log')">log</button>
            <button class="btn btn-small btn-op text-white" onclick="appendNumber(Math.PI.toFixed(5))">π</button>
            <button class="btn btn-small btn-op text-white" onclick="appendOperator('/')">÷</button>

            <button class="btn btn-small btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('7')">7</button>
            <button class="btn btn-small btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('8')">8</button>
            <button class="btn btn-small btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('9')">9</button>
            <button class="btn btn-small btn-op text-white" onclick="appendOperator('%')">%</button>
            <button class="btn btn-small btn-op text-white" onclick="appendOperator('*')">×</button>

            <button class="btn btn-small btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('4')">4</button>
            <button class="btn btn-small btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('5')">5</button>
            <button class="btn btn-small btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('6')">6</button>
            <button class="btn btn-small btn-op text-white" onclick="execMath('ln')">ln</button>
            <button class="btn btn-small btn-op text-white" onclick="appendOperator('-')">-</button>

            <button class="btn btn-small btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('1')">1</button>
            <button class="btn btn-small btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('2')">2</button>
            <button class="btn btn-small btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('3')">3</button>
            <button class="btn btn-small btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('0')">0</button>
            <button class="btn btn-small btn-op text-white" onclick="appendOperator('+')">+</button>
            
            <button class="btn btn-small btn-num text-text-orange dark:text-stripe-yellow col-span-3 rounded-[20px]" onclick="appendNumber('.')">.</button>
            <button class="btn btn-small btn-op text-white col-span-2 rounded-[20px]" onclick="calcResult()">=</button>
        `;
  } else if (type === "programmer") {
    keypadContainer.innerHTML = `
            <button class="btn btn-small btn-action text-white" onclick="clearDisplay()">C</button>
            <button class="btn btn-small btn-num prog-hex text-gray-400" onclick="appendProg('A')">A</button>
            <button class="btn btn-small btn-num prog-hex text-gray-400" onclick="appendProg('B')">B</button>
            <button class="btn btn-small btn-num prog-hex text-gray-400" onclick="appendProg('C')">C</button>
            <button class="btn btn-small btn-op text-white" onclick="appendProgOp('/')">÷</button>
            <button class="btn btn-small btn-num prog-hex text-gray-400" onclick="appendProg('D')">D</button>
            <button class="btn btn-small btn-num prog-hex text-gray-400" onclick="appendProg('E')">E</button>
            <button class="btn btn-small btn-num prog-hex text-gray-400" onclick="appendProg('F')">F</button>
            <button class="btn btn-small btn-op text-white" onclick="appendProgOp('*')">×</button>
            <button class="btn btn-small btn-op text-white" onclick="appendProgOp('-')">-</button>
            <button class="btn btn-small btn-num prog-dec text-text-orange" onclick="appendProg('7')">7</button>
            <button class="btn btn-small btn-num prog-dec text-text-orange" onclick="appendProg('8')">8</button>
            <button class="btn btn-small btn-num prog-dec text-text-orange" onclick="appendProg('9')">9</button>
            <button class="btn btn-small btn-op text-white" onclick="appendProgOp('+')">+</button>
            <button class="btn btn-small btn-op text-white" onclick="calcProgResult()">=</button>
            <button class="btn btn-small btn-num prog-oct text-text-orange" onclick="appendProg('4')">4</button>
            <button class="btn btn-small btn-num prog-oct text-text-orange" onclick="appendProg('5')">5</button>
            <button class="btn btn-small btn-num prog-oct text-text-orange" onclick="appendProg('6')">6</button>
            <button class="btn btn-small btn-num prog-dec text-text-orange" onclick="appendProg('1')">1</button>
            <button class="btn btn-small btn-num prog-dec text-text-orange" onclick="appendProg('2')">2</button>
            <button class="btn btn-small btn-num prog-dec text-text-orange" onclick="appendProg('3')">3</button>
            <button class="btn btn-small btn-num prog-bin text-text-orange col-span-3 rounded-[20px]" onclick="appendProg('0')">0</button>
            <button class="btn btn-small btn-num opacity-40 cursor-not-allowed">.</button>
        `;
    refreshProgKeys();
  } else if (type === "input_only") {
    keypadContainer.innerHTML = `
            <button class="btn btn-round btn-action text-white" onclick="clearDisplay()">C</button>
            <button class="btn btn-round btn-num text-text-orange opacity-40" disabled></button>
            <button class="btn btn-round btn-num text-text-orange opacity-40" disabled></button>
            <button class="btn btn-round btn-op text-white" onclick="clearDisplay()">⌫</button>
            ${numPadHTML.replace(/btn-round/g, "btn-round col-span-1")}
            <button class="btn btn-round btn-num text-text-orange opacity-40" disabled></button>
            <button class="btn btn-round btn-num text-text-orange opacity-40" disabled></button>
            <button class="btn btn-round btn-num text-text-orange opacity-40" disabled></button>
            <button class="btn btn-wide btn-num text-text-orange dark:text-stripe-yellow col-span-2 rounded-[30px]" onclick="appendNumber('0')">0</button>
            <button class="btn btn-round btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('.')">.</button>
            <button class="btn btn-round btn-op text-white" onclick="toggleSign()">±</button>
        `;
  }
}

function updateDisplay() {
  if (calcMode !== "standard" && calcMode !== "scientific") return;
  document.getElementById("result").innerText = currentInput || "0";
  document.getElementById("history").innerText = operator
    ? `${previousInput} ${operator}`
    : "";
}
function appendNumber(num) {
  if (num === "." && currentInput.includes(".")) return;
  currentInput = currentInput === "0" && num !== "." ? num : currentInput + num;
  if (calcMode === "standard" || calcMode === "scientific") updateDisplay();
  if (calcMode === "currency") updateCurrencyUI();
  if (calcMode === "temperature") updateTempUI();
}
function appendOperator(op) {
  if (!currentInput && !previousInput) return;
  if (currentInput && previousInput && operator) calcResult(false);
  if (currentInput) {
    previousInput = currentInput;
    currentInput = "";
  }
  operator = op;
  updateDisplay();
}
function execMath(func) {
  if (!currentInput) return;
  let val = parseFloat(currentInput);
  switch (func) {
    case "sin":
      currentInput = Math.sin(val).toFixed(8);
      break;
    case "cos":
      currentInput = Math.cos(val).toFixed(8);
      break;
    case "tan":
      currentInput = Math.tan(val).toFixed(8);
      break;
    case "sqrt":
      currentInput = Math.sqrt(val).toString();
      break;
    case "log":
      currentInput = Math.log10(val).toString();
      break;
    case "ln":
      currentInput = Math.log(val).toString();
      break;
  }
  currentInput = parseFloat(currentInput).toString();
  updateDisplay();
}
function calcResult(isFinal = true) {
  const prev = parseFloat(previousInput);
  const curr = parseFloat(currentInput);
  if (isNaN(prev) || isNaN(curr)) return;
  let res;
  switch (operator) {
    case "+":
      res = prev + curr;
      break;
    case "-":
      res = prev - curr;
      break;
    case "*":
      res = prev * curr;
      break;
    case "/":
      res = curr === 0 ? "Error" : prev / curr;
      break;
    case "%":
      res = prev % curr;
      break;
    case "^":
      res = Math.pow(prev, curr);
      break;
  }
  res = typeof res === "number" ? Math.round(res * 1e8) / 1e8 : res;
  if (isFinal) {
    currentInput = res.toString();
    operator = null;
    previousInput = "";
  } else {
    currentInput = res.toString();
  }
  updateDisplay();
}
function clearDisplay() {
  currentInput = "";
  previousInput = "";
  operator = null;
  updateDisplay();
  updateProgUI();
  updateCurrencyUI();
  updateTempUI();
}
function toggleSign() {
  if (!currentInput) return;
  currentInput = (parseFloat(currentInput) * -1).toString();
  updateDisplay();
  updateTempUI();
}

function setProgBase(base) {
  progBase = base;
  let baseNames = { 16: "HEX", 10: "DEC", 8: "OCT", 2: "BIN" };
  document.querySelectorAll("#screen-prog > div").forEach((el) => {
    el.classList.remove("text-stripe-orange", "font-bold", "text-base");
  });
  let activeRow = document.getElementById(
    `prog-${baseNames[base].toLowerCase()}`,
  ).parentElement;
  activeRow.classList.add("text-stripe-orange", "font-bold", "text-base");

  if (currentInput && currentInput !== "Error") {
    let decimalValue = parseInt(
      currentInput,
      [16, 10, 8, 2].includes(progBase) ? window.prevBase || 10 : 10,
    );
    if (!isNaN(decimalValue))
      currentInput = decimalValue.toString(progBase).toUpperCase();
  }
  window.prevBase = progBase;
  refreshProgKeys();
  updateProgUI();
}
function refreshProgKeys() {
  document
    .querySelectorAll(".prog-hex, .prog-dec, .prog-oct, .prog-bin")
    .forEach((btn) => (btn.disabled = true));
  document
    .querySelectorAll(".prog-bin")
    .forEach((btn) => (btn.disabled = false));
  if (progBase <= 8)
    document.querySelectorAll(".prog-oct").forEach((btn) => {
      if (parseInt(btn.innerText) < progBase) btn.disabled = false;
    });
  if (progBase <= 10)
    document.querySelectorAll(".prog-dec, .prog-oct").forEach((btn) => {
      if (parseInt(btn.innerText) < progBase) btn.disabled = false;
    });
  if (progBase === 16)
    document
      .querySelectorAll(".prog-hex, .prog-dec, .prog-oct")
      .forEach((btn) => (btn.disabled = false));
}
function appendProg(char) {
  currentInput = currentInput === "0" ? char : currentInput + char;
  updateProgUI();
}
function appendProgOp(op) {
  if (!currentInput) return;
  if (previousInput && operator) calcProgResult();
  previousInput = currentInput;
  currentInput = "";
  operator = op;
}
function calcProgResult() {
  const prev = parseInt(previousInput, progBase);
  const curr = parseInt(currentInput, progBase);
  if (isNaN(prev) || isNaN(curr)) return;
  let res = 0;
  switch (operator) {
    case "+":
      res = prev + curr;
      break;
    case "-":
      res = prev - curr;
      break;
    case "*":
      res = prev * curr;
      break;
    case "/":
      res = Math.floor(prev / curr);
      break;
  }
  currentInput = res.toString(progBase).toUpperCase();
  operator = null;
  previousInput = "";
  updateProgUI();
}
function updateProgUI() {
  if (calcMode !== "programmer") return;
  let decVal = parseInt(currentInput || "0", progBase);
  if (isNaN(decVal)) decVal = 0;
  document.getElementById("prog-hex").innerText = decVal
    .toString(16)
    .toUpperCase();
  document.getElementById("prog-dec").innerText = decVal.toString(10);
  document.getElementById("prog-oct").innerText = decVal.toString(8);
  document.getElementById("prog-bin").innerText = decVal.toString(2);
}

async function fetchCurrencies() {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    const data = await res.json();
    exchangeRates = data.rates;
    const fromSel = document.getElementById("curr-from");
    const toSel = document.getElementById("curr-to");
    Object.keys(exchangeRates).forEach((currency) => {
      let optionClass =
        "bg-calc-bg dark:bg-gray-800 text-gray-800 dark:text-white";
      fromSel.innerHTML += `<option class="${optionClass}" value="${currency}" ${currency === "USD" ? "selected" : ""}>${currency}</option>`;
      toSel.innerHTML += `<option class="${optionClass}" value="${currency}" ${currency === "IDR" ? "selected" : ""}>${currency}</option>`;
    });
    fromSel.addEventListener("change", updateCurrencyUI);
    toSel.addEventListener("change", updateCurrencyUI);
  } catch (e) {
    document.getElementById("curr-output").innerText = "API Error";
  }
}
function updateCurrencyUI() {
  if (calcMode !== "currency") return;
  let val = parseFloat(currentInput || "0");
  document.getElementById("curr-input").innerText = val.toLocaleString("en-US");
  const fromRate =
    exchangeRates[document.getElementById("curr-from").value] || 1;
  const toRate = exchangeRates[document.getElementById("curr-to").value] || 1;
  let converted = (val / fromRate) * toRate;
  document.getElementById("curr-output").innerText = converted.toLocaleString(
    "en-US",
    { maximumFractionDigits: 2 },
  );
}

function updateTempUI() {
  if (calcMode !== "temperature") return;
  let val = parseFloat(currentInput || "0");
  document.getElementById("temp-input").innerText = currentInput || "0";
  const fromType = document.getElementById("temp-from").value;
  const toType = document.getElementById("temp-to").value;

  let celsius;
  if (fromType === "C") celsius = val;
  else if (fromType === "F") celsius = ((val - 32) * 5) / 9;
  else if (fromType === "K") celsius = val - 273.15;

  let converted;
  if (toType === "C") converted = celsius;
  else if (toType === "F") converted = (celsius * 9) / 5 + 32;
  else if (toType === "K") converted = celsius + 273.15;

  document.getElementById("temp-output").innerText = converted.toLocaleString(
    "en-US",
    { maximumFractionDigits: 2 },
  );
}
