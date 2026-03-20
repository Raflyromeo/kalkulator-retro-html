let currentInput = "";
let previousInput = "";
let operator = null;
let calcMode = "standard";
let progBase = 10;
let exchangeRates = {};
let historyData = [];

const keypadContainer = document.getElementById("keypad-container");
const scrStd = document.getElementById("screen-std");
const scrCurr = document.getElementById("screen-currency");
const scrProg = document.getElementById("screen-prog");
const scrTemp = document.getElementById("screen-temp");
const historyList = document.getElementById("history-list");

document.addEventListener("DOMContentLoaded", () => {
  if (
    localStorage.getItem("theme") === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
    updateThemeUI(true);
  }
  setupEvents();
  renderKeypad("standard");
  fetchCurrencies();
});

function setupEvents() {
  document
    .getElementById("open-menu-btn")
    .addEventListener("click", toggleMenu);
  document
    .getElementById("close-menu-btn")
    .addEventListener("click", toggleMenu);
  document
    .getElementById("menu-backdrop")
    .addEventListener("click", toggleMenu);
  document
    .getElementById("theme-toggle-btn")
    .addEventListener("click", toggleTheme);
  document
    .getElementById("clear-history-btn")
    .addEventListener("click", clearHistory);
  document
    .getElementById("open-modal-btn")
    .addEventListener("click", toggleModal);
  document
    .getElementById("close-modal-btn")
    .addEventListener("click", toggleModal);

  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", (e) =>
      setMode(e.currentTarget.getAttribute("data-mode")),
    );
  });

  document.querySelectorAll(".base-selector").forEach((selector) => {
    selector.addEventListener("click", (e) =>
      setProgBase(parseInt(e.currentTarget.getAttribute("data-base"))),
    );
  });

  document.querySelectorAll(".custom-dropdown").forEach((dropdown) => {
    const btn = dropdown.querySelector(".select-btn");
    const optionsContainer = dropdown.querySelector(".options");
    const chevron = dropdown.querySelector(".chevron");

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".custom-dropdown .options").forEach((opt) => {
        if (opt !== optionsContainer) {
          opt.classList.add("hidden");
          opt.parentElement
            .querySelector(".chevron")
            .classList.remove("rotate-180");
        }
      });
      optionsContainer.classList.toggle("hidden");
      chevron.classList.toggle("rotate-180");
    });

    optionsContainer.addEventListener("click", (e) => {
      const option = e.target.closest(".option");
      if (!option) return;
      const value = option.getAttribute("data-value");
      const text = option.innerText;
      dropdown.setAttribute("data-value", value);
      dropdown.querySelector(".sBtn-text").innerText = text;
      optionsContainer.classList.add("hidden");
      chevron.classList.remove("rotate-180");
      if (dropdown.id.startsWith("curr")) updateCurrencyUI();
      if (dropdown.id.startsWith("temp")) updateTempUI();
    });
  });

  document.addEventListener("click", () => {
    document
      .querySelectorAll(".custom-dropdown .options")
      .forEach((opt) => opt.classList.add("hidden"));
    document
      .querySelectorAll(".custom-dropdown .chevron")
      .forEach((chev) => chev.classList.remove("rotate-180"));
  });
}

function toggleMenu() {
  const backdrop = document.getElementById("menu-backdrop");
  const sidebar = document.getElementById("menu-sidebar");
  const isMenuOpen = !backdrop.classList.contains("hidden");
  if (!isMenuOpen) {
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

function toggleModal() {
  const modal = document.getElementById("info-modal");
  const card = document.getElementById("info-card");
  const isModalOpen = !modal.classList.contains("hidden");
  if (!isModalOpen) {
    modal.classList.remove("hidden");
    setTimeout(() => {
      modal.classList.remove("opacity-0");
      card.classList.remove("scale-95");
    }, 10);
  } else {
    modal.classList.add("opacity-0");
    card.classList.add("scale-95");
    setTimeout(() => modal.classList.add("hidden"), 300);
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

function addToHistory(equation, result) {
  historyData.push(`${equation} = ${result}`);
  renderHistory();
}

function renderHistory() {
  if (historyData.length === 0) {
    historyList.innerHTML =
      '<span class="opacity-50 italic text-xs">No history yet...</span>';
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
  const activeBtn = document.querySelector(`.mode-btn[data-mode="${mode}"]`);
  activeBtn.classList.add("bg-stripe-orange", "text-white");
  activeBtn.classList.remove(
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
  let gridClass =
    type === "input_only"
      ? "grid-input"
      : type === "scientific"
        ? "grid-sci"
        : "grid-std";
  keypadContainer.className = `grid ${gridClass} h-full gap-2 md:gap-3`;

  if (type === "standard") {
    keypadContainer.innerHTML = `
            <button class="btn btn-round btn-action text-lg md:text-2xl text-white" onclick="clearDisplay()">C</button>
            <button class="btn btn-round btn-op text-lg md:text-2xl text-white" onclick="toggleSign()">±</button>
            <button class="btn btn-round btn-op text-lg md:text-2xl text-white" onclick="appendOperator('%')">%</button>
            <button class="btn btn-round btn-op text-lg md:text-2xl text-white" onclick="appendOperator('/')">÷</button>
            <button class="btn btn-round btn-num text-lg md:text-2xl text-text-orange dark:text-stripe-yellow" onclick="appendNumber('7')">7</button>
            <button class="btn btn-round btn-num text-lg md:text-2xl text-text-orange dark:text-stripe-yellow" onclick="appendNumber('8')">8</button>
            <button class="btn btn-round btn-num text-lg md:text-2xl text-text-orange dark:text-stripe-yellow" onclick="appendNumber('9')">9</button>
            <button class="btn btn-round btn-op text-lg md:text-2xl text-white" onclick="appendOperator('*')">×</button>
            <button class="btn btn-round btn-num text-lg md:text-2xl text-text-orange dark:text-stripe-yellow" onclick="appendNumber('4')">4</button>
            <button class="btn btn-round btn-num text-lg md:text-2xl text-text-orange dark:text-stripe-yellow" onclick="appendNumber('5')">5</button>
            <button class="btn btn-round btn-num text-lg md:text-2xl text-text-orange dark:text-stripe-yellow" onclick="appendNumber('6')">6</button>
            <button class="btn btn-round btn-op text-lg md:text-2xl text-white" onclick="appendOperator('-')">-</button>
            <button class="btn btn-round btn-num text-lg md:text-2xl text-text-orange dark:text-stripe-yellow" onclick="appendNumber('1')">1</button>
            <button class="btn btn-round btn-num text-lg md:text-2xl text-text-orange dark:text-stripe-yellow" onclick="appendNumber('2')">2</button>
            <button class="btn btn-round btn-num text-lg md:text-2xl text-text-orange dark:text-stripe-yellow" onclick="appendNumber('3')">3</button>
            <button class="btn btn-round btn-op text-lg md:text-2xl text-white" onclick="appendOperator('+')">+</button>
            <button class="btn btn-wide btn-num text-lg md:text-2xl text-text-orange dark:text-stripe-yellow col-span-2 rounded-[20px] md:rounded-[30px]" onclick="appendNumber('0')">0</button>
            <button class="btn btn-round btn-num text-lg md:text-2xl text-text-orange dark:text-stripe-yellow" onclick="appendNumber('.')">.</button>
            <button class="btn btn-round btn-op text-lg md:text-2xl text-white" onclick="calcResult()">=</button>
        `;
  } else if (type === "scientific") {
    keypadContainer.innerHTML = `
            <button class="btn text-sm md:text-lg btn-op text-white py-2" onclick="execMath('sin')">sin</button>
            <button class="btn text-sm md:text-lg btn-action text-white" onclick="clearDisplay()">C</button>
            <button class="btn text-sm md:text-lg btn-op text-white" onclick="toggleSign()">±</button>
            <button class="btn text-sm md:text-lg btn-op text-white" onclick="appendOperator('%')">%</button>
            <button class="btn text-sm md:text-lg btn-op text-white" onclick="appendOperator('/')">÷</button>
            
            <button class="btn text-sm md:text-lg btn-op text-white py-2" onclick="execMath('cos')">cos</button>
            <button class="btn text-sm md:text-lg btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('7')">7</button>
            <button class="btn text-sm md:text-lg btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('8')">8</button>
            <button class="btn text-sm md:text-lg btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('9')">9</button>
            <button class="btn text-sm md:text-lg btn-op text-white" onclick="appendOperator('*')">×</button>
            
            <button class="btn text-sm md:text-lg btn-op text-white py-2" onclick="execMath('tan')">tan</button>
            <button class="btn text-sm md:text-lg btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('4')">4</button>
            <button class="btn text-sm md:text-lg btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('5')">5</button>
            <button class="btn text-sm md:text-lg btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('6')">6</button>
            <button class="btn text-sm md:text-lg btn-op text-white" onclick="appendOperator('-')">-</button>
            
            <button class="btn text-sm md:text-lg btn-op text-white py-2" onclick="execMath('log')">log</button>
            <button class="btn text-sm md:text-lg btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('1')">1</button>
            <button class="btn text-sm md:text-lg btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('2')">2</button>
            <button class="btn text-sm md:text-lg btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('3')">3</button>
            <button class="btn text-sm md:text-lg btn-op text-white" onclick="appendOperator('+')">+</button>
            
            <button class="btn text-sm md:text-lg btn-op text-white py-2" onclick="execMath('sqrt')">√</button>
            <button class="btn text-sm md:text-lg btn-num text-text-orange dark:text-stripe-yellow col-span-2 rounded-[20px]" onclick="appendNumber('0')">0</button>
            <button class="btn text-sm md:text-lg btn-num text-text-orange dark:text-stripe-yellow" onclick="appendNumber('.')">.</button>
            <button class="btn text-sm md:text-lg btn-op text-white" onclick="calcResult()">=</button>
        `;
  } else if (type === "programmer") {
    keypadContainer.innerHTML = `
            <button class="btn text-sm md:text-xl btn-num prog-hex text-gray-400 py-2" onclick="appendProg('A')">A</button>
            <button class="btn text-sm md:text-xl btn-num prog-hex text-gray-400" onclick="appendProg('B')">B</button>
            <button class="btn text-sm md:text-xl btn-num prog-hex text-gray-400" onclick="appendProg('C')">C</button>
            <button class="btn text-sm md:text-xl btn-num prog-hex text-gray-400" onclick="appendProg('D')">D</button>
            
            <button class="btn text-sm md:text-xl btn-num prog-hex text-gray-400 py-2" onclick="appendProg('E')">E</button>
            <button class="btn text-sm md:text-xl btn-num prog-hex text-gray-400" onclick="appendProg('F')">F</button>
            <button class="btn text-sm md:text-xl btn-action text-white" onclick="clearDisplay()">C</button>
            <button class="btn text-sm md:text-xl btn-op text-white" onclick="backspace()">⌫</button>
            
            <button class="btn text-sm md:text-xl btn-num prog-dec text-text-orange py-2" onclick="appendProg('7')">7</button>
            <button class="btn text-sm md:text-xl btn-num prog-dec text-text-orange" onclick="appendProg('8')">8</button>
            <button class="btn text-sm md:text-xl btn-num prog-dec text-text-orange" onclick="appendProg('9')">9</button>
            <button class="btn text-sm md:text-xl btn-op text-white" onclick="appendProgOp('÷')">÷</button>
            
            <button class="btn text-sm md:text-xl btn-num prog-oct text-text-orange py-2" onclick="appendProg('4')">4</button>
            <button class="btn text-sm md:text-xl btn-num prog-oct text-text-orange" onclick="appendProg('5')">5</button>
            <button class="btn text-sm md:text-xl btn-num prog-oct text-text-orange" onclick="appendProg('6')">6</button>
            <button class="btn text-sm md:text-xl btn-op text-white" onclick="appendProgOp('×')">×</button>
            
            <button class="btn text-sm md:text-xl btn-num prog-dec text-text-orange py-2" onclick="appendProg('1')">1</button>
            <button class="btn text-sm md:text-xl btn-num prog-dec text-text-orange" onclick="appendProg('2')">2</button>
            <button class="btn text-sm md:text-xl btn-num prog-dec text-text-orange" onclick="appendProg('3')">3</button>
            <button class="btn text-sm md:text-xl btn-op text-white" onclick="appendProgOp('-')">-</button>
            
            <button class="btn text-sm md:text-xl btn-num prog-bin text-text-orange col-span-2 rounded-[20px] py-2" onclick="appendProg('0')">0</button>
            <button class="btn text-sm md:text-xl btn-op text-white" onclick="calcProgResult()">=</button>
            <button class="btn text-sm md:text-xl btn-op text-white" onclick="appendProgOp('+')">+</button>
        `;
    refreshProgKeys();
  } else if (type === "input_only") {
    keypadContainer.innerHTML = `
            <button class="btn btn-round btn-action text-lg md:text-2xl text-white" onclick="clearDisplay()">C</button>
            <button class="btn btn-round btn-op text-lg md:text-2xl text-white" onclick="toggleSign()">±</button>
            <button class="btn btn-round btn-op text-lg md:text-2xl text-white" onclick="backspace()">⌫</button>
            
            <button class="btn btn-round btn-num text-lg md:text-2xl text-text-orange dark:text-stripe-yellow" onclick="appendNumber('7')">7</button>
            <button class="btn btn-round btn-num text-lg md:text-2xl text-text-orange dark:text-stripe-yellow" onclick="appendNumber('8')">8</button>
            <button class="btn btn-round btn-num text-lg md:text-2xl text-text-orange dark:text-stripe-yellow" onclick="appendNumber('9')">9</button>
            
            <button class="btn btn-round btn-num text-lg md:text-2xl text-text-orange dark:text-stripe-yellow" onclick="appendNumber('4')">4</button>
            <button class="btn btn-round btn-num text-lg md:text-2xl text-text-orange dark:text-stripe-yellow" onclick="appendNumber('5')">5</button>
            <button class="btn btn-round btn-num text-lg md:text-2xl text-text-orange dark:text-stripe-yellow" onclick="appendNumber('6')">6</button>
            
            <button class="btn btn-round btn-num text-lg md:text-2xl text-text-orange dark:text-stripe-yellow" onclick="appendNumber('1')">1</button>
            <button class="btn btn-round btn-num text-lg md:text-2xl text-text-orange dark:text-stripe-yellow" onclick="appendNumber('2')">2</button>
            <button class="btn btn-round btn-num text-lg md:text-2xl text-text-orange dark:text-stripe-yellow" onclick="appendNumber('3')">3</button>
            
            <button class="btn btn-wide btn-num text-lg md:text-2xl text-text-orange dark:text-stripe-yellow col-span-2 rounded-[20px] md:rounded-[30px]" onclick="appendNumber('0')">0</button>
            <button class="btn btn-round btn-num text-lg md:text-2xl text-text-orange dark:text-stripe-yellow" onclick="appendNumber('.')">.</button>
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
  let original = currentInput;
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
  }
  currentInput = parseFloat(currentInput).toString();
  addToHistory(`${func}(${original})`, currentInput);
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
  }
  res = typeof res === "number" ? Math.round(res * 1e8) / 1e8 : res;

  if (isFinal) {
    addToHistory(`${prev} ${operator} ${curr}`, res);
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
  updateCurrencyUI();
}

function backspace() {
  if (!currentInput) return;
  currentInput = currentInput.slice(0, -1);
  if (currentInput === "" || currentInput === "-") currentInput = "";
  updateDisplay();
  updateProgUI();
  updateCurrencyUI();
  updateTempUI();
}

function setProgBase(base) {
  progBase = base;
  let baseNames = { 16: "HEX", 10: "DEC", 8: "OCT", 2: "BIN" };
  document.querySelectorAll("#screen-prog > div").forEach((el) => {
    el.classList.remove(
      "text-stripe-orange",
      "font-bold",
      "text-sm",
      "md:text-base",
    );
  });
  let activeRow = document.querySelector(`.base-selector[data-base="${base}"]`);
  activeRow.classList.add(
    "text-stripe-orange",
    "font-bold",
    "text-sm",
    "md:text-base",
  );
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
  let logicalOp = op === "×" ? "*" : op === "÷" ? "/" : op;
  if (previousInput && operator) calcProgResult();
  previousInput = currentInput;
  currentInput = "";
  operator = logicalOp;
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
    const fromOpts = document.querySelector("#curr-from-dropdown .options");
    const toOpts = document.querySelector("#curr-to-dropdown .options");
    let html = "";
    Object.keys(exchangeRates).forEach((currency) => {
      html += `<li class="option px-2 py-1.5 text-xs md:text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-medium" data-value="${currency}">${currency}</li>`;
    });
    fromOpts.innerHTML = html;
    toOpts.innerHTML = html;
    document
      .getElementById("curr-from-dropdown")
      .setAttribute("data-value", "USD");
    document.querySelector("#curr-from-dropdown .sBtn-text").innerText = "USD";
    document
      .getElementById("curr-to-dropdown")
      .setAttribute("data-value", "IDR");
    document.querySelector("#curr-to-dropdown .sBtn-text").innerText = "IDR";
  } catch (e) {
    document.getElementById("curr-output").innerText = "API Error";
  }
}

function updateCurrencyUI() {
  if (calcMode !== "currency") return;
  let val = parseFloat(currentInput || "0");
  document.getElementById("curr-input").innerText = val.toLocaleString("en-US");
  const fromVal =
    document.getElementById("curr-from-dropdown").getAttribute("data-value") ||
    "USD";
  const toVal =
    document.getElementById("curr-to-dropdown").getAttribute("data-value") ||
    "IDR";
  const fromRate = exchangeRates[fromVal] || 1;
  const toRate = exchangeRates[toVal] || 1;
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
  const fromType = document
    .getElementById("temp-from-dropdown")
    .getAttribute("data-value");
  const toType = document
    .getElementById("temp-to-dropdown")
    .getAttribute("data-value");
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
