

// =====================
// CAESAR CIPHER
// =====================
function caesarCipher(text, shift) {
    let result = "";

    for (let i = 0; i < text.length; i++) {
        let char = text[i];

        if (char.match(/[a-z]/i)) {
            let code = text.charCodeAt(i);

            if (code >= 65 && code <= 90) {
                result += String.fromCharCode(((code - 65 + shift + 26) % 26) + 65);
            } else if (code >= 97 && code <= 122) {
                result += String.fromCharCode(((code - 97 + shift + 26) % 26) + 97);
            }
        } else {
            result += char;
        }
    }

    return result;
}

// =====================
// HILL CIPHER
// =====================

function getKeyMatrix() {
    return [
        [parseInt(document.getElementById("key00").value) || 3, parseInt(document.getElementById("key01").value) || 3],
        [parseInt(document.getElementById("key10").value) || 2, parseInt(document.getElementById("key11").value) || 5]
    ];
}

function calculateInverseMatrix(matrix) {
    const [[a, b], [c, d]] = matrix;
    const det = (a * d - b * c) % 26;
    const detInv = modInverse(det, 26);

    return [
        [(d * detInv) % 26, (-b * detInv) % 26],
        [(-c * detInv) % 26, (a * detInv) % 26]
    ];
}

function modInverse(a, m) {
    for (let i = 1; i < m; i++) {
        if ((a * i) % m === 1) return i;
    }
    return 1;
}

function charToNum(char) {
    return char.charCodeAt(0) - 65;
}

function numToChar(num) {
    return String.fromCharCode((num % 26) + 65);
}

function processText(text) {
    return text.toUpperCase().replace(/[^A-Z]/g, "");
}

function extractCasing(text) {
    let casing = [];
    for (let char of text) {
        if (char.match(/[a-z]/i)) {
            casing.push(char.toLowerCase() === char ? 'lower' : 'upper');
        }
    }
    return casing;
}

function applyCasing(text, casing) {
    let result = "";
    let casingIndex = 0;

    for (let char of text) {
        if (casingIndex < casing.length) {
            if (casing[casingIndex] === 'lower') {
                result += char.toLowerCase();
            } else {
                result += char.toUpperCase();
            }
            casingIndex++;
        } else {
            result += char;
        }
    }

    return result;
}

function addPadding(text, casing) {
    if (text.length % 2 !== 0) {
        text += "X";
        casing.push('upper');      
    }
    return { text, casing };
}

function multiplyMatrix(matrix, pair) {
    return [
        (matrix[0][0] * pair[0] + matrix[0][1] * pair[1]) % 26,
        (matrix[1][0] * pair[0] + matrix[1][1] * pair[1]) % 26
    ];
}

function hillEncrypt(text) {
    let keyMatrix = getKeyMatrix();
    let casing = extractCasing(text);
    text = processText(text);
    let padded = addPadding(text, casing);
    text = padded.text;
    casing = padded.casing;

    let result = "";

    for (let i = 0; i < text.length; i += 2) {
        let pair = [charToNum(text[i]), charToNum(text[i+1])];
        let encrypted = multiplyMatrix(keyMatrix, pair);

        result += numToChar(encrypted[0]);
        result += numToChar(encrypted[1]);
    }

    return applyCasing(result, casing);
}

function hillDecrypt(text) {
    let keyMatrix = getKeyMatrix();
    let inverseKeyMatrix = calculateInverseMatrix(keyMatrix);
    let casing = extractCasing(text);
    text = processText(text);
    let padded = addPadding(text, casing);
    text = padded.text;
    casing = padded.casing;

    let result = "";

    for (let i = 0; i < text.length; i += 2) {
        let pair = [charToNum(text[i]), charToNum(text[i+1])];
        let decrypted = multiplyMatrix(inverseKeyMatrix, pair);

        result += numToChar(decrypted[0]);
        result += numToChar(decrypted[1])
    }

    return applyCasing(result, casing);
}

// =====================
// MAIN CONTROL LOGIC
// =====================
document.getElementById("cipherType").addEventListener("change", function() {
    const type = this.value;
    document.getElementById("caesarFields").style.display = type === "caesar" ? "block" : "none";
    document.getElementById("hillFields").style.display = type === "hill" ? "block" : "none";
});

function encrypt() {
    let text = document.getElementById("textInput").value;
    let type = document.getElementById("cipherType").value;
    let result = "";

    document.getElementById("inputLabel").innerText = "Plain Text";
    document.getElementById("resultLabel").innerText = "Encrypted message";

    if (type === "caesar") {
        const shift = parseInt(document.getElementById("shiftValue").value) || 3;
        result = caesarCipher(text, shift);
    } else if (type === "hill") {
        result = hillEncrypt(text);
    }

    document.getElementById("DisplayResult").innerText = result;
}

function decrypt() {
    let text = document.getElementById("textInput").value;
    let type = document.getElementById("cipherType").value;
    let result = "";

    document.getElementById("inputLabel").innerText = "Encrypted message";
    document.getElementById("resultLabel").innerText = "Plain Text";

    if (type === "caesar") {
        const shift = parseInt(document.getElementById("shiftValue").value) || 3;
        result = caesarCipher(text, -shift);
    } else if (type === "hill") {
        result = hillDecrypt(text);
    }

    document.getElementById("DisplayResult").innerText = result;
}

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("caesarFields").style.display = "block";
});

function clearAll() {
    document.getElementById("textInput").value = "";
    document.getElementById("DisplayResult").innerText = "";
    document.getElementById("inputLabel").innerText = "Plain Text";
    document.getElementById("resultLabel").innerText = "Decrypted message";
    document.getElementById("shiftValue").value = "";
    document.getElementById("key00").value = "0";
    document.getElementById("key01").value = "0";
    document.getElementById("key10").value = "0";
    document.getElementById("key11").value = "0";
}

