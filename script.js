let currentInput = '';
let previousInput = '';
let operator = null;

const resultDisplay = document.getElementById('result');
const historyDisplay = document.getElementById('history');

function updateDisplay() {
    resultDisplay.innerText = currentInput === '' ? '0' : currentInput;
    if (operator != null) {
        let displayOp = operator === '*' ? '×' : operator === '/' ? '÷' : operator;
        historyDisplay.innerText = `${previousInput} ${displayOp}`;
    } else {
        historyDisplay.innerText = '';
    }
}

function appendNumber(number) {
    if (number === '.' && currentInput.includes('.')) return;
    if (currentInput === '0' && number !== '.') {
        currentInput = number;
    } else {
        currentInput += number;
    }
    updateDisplay();
}

function appendOperator(op) {
    if (currentInput === '' && previousInput === '') return;
    
    if (currentInput !== '' && previousInput !== '' && operator !== null) {
        calculateResult(false);
    }
    
    if (currentInput !== '') {
        previousInput = currentInput;
        currentInput = '';
    }
    operator = op;
    updateDisplay();
}

function calculateResult(isFinal = true) {
    let result;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);

    if (isNaN(prev) || isNaN(current)) return;

    switch (operator) {
        case '+': result = prev + current; break;
        case '-': result = prev - current; break;
        case '*': result = prev * current; break;
        case '/': result = current === 0 ? 'Error' : prev / current; break;
        case '%': result = prev % current; break;
        default: return;
    }

    if (isFinal) {
        let displayOp = operator === '*' ? '×' : operator === '/' ? '÷' : operator;
        historyDisplay.innerText = `${prev} ${displayOp} ${current}`;
        currentInput = result.toString();
        operator = null;
        previousInput = '';
    } else {
        currentInput = result.toString();
    }
    updateDisplay();
}

function clearDisplay() {
    currentInput = '';
    previousInput = '';
    operator = null;
    updateDisplay();
}

function toggleSign() {
    if (currentInput === '') return;
    currentInput = (parseFloat(currentInput) * -1).toString();
    updateDisplay();
}

const sidebar = document.getElementById('menu-sidebar');
const backdrop = document.getElementById('menu-backdrop');
let isMenuOpen = false;

function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    if (isMenuOpen) {
        backdrop.classList.remove('hidden');
        setTimeout(() => {
            backdrop.classList.remove('opacity-0');
            sidebar.classList.remove('-translate-x-full');
        }, 10);
    } else {
        backdrop.classList.add('opacity-0');
        sidebar.classList.add('-translate-x-full');
        setTimeout(() => {
            backdrop.classList.add('hidden');
        }, 300); 
    }
}