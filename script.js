
//Kyle//
function caesarCipher(text, shift) {
    let result = "";
    const normalizedShift = ((shift % 26) + 26) % 26;    //shift <26 %26, shift >0 +26//

    for (let i = 0; i < text.length; i++) {         //loops through text one at a time//
        let char = text[i];

        if (char.match(/[a-z]/i)) {             //checks if char is a letter
            let code = text.charCodeAt(i);          //converts to ascii//

            if (code >= 65 && code <= 90) {
                result += String.fromCharCode(((code - 65 + normalizedShift) % 26) + 65);   //%26 wraps around the alphabet//
            } else if (code >= 97 && code <= 122) {
                result += String.fromCharCode(((code - 97 + normalizedShift) % 26) + 97);
            }
        } else {
            result += char; //returns non alphabet characters as the same//
        }
    }

    return result;
}

const HILL_DEBUG = true;
function hillDebug(...args) {
    if (HILL_DEBUG) console.log("[Hill Debug]", ...args);
}

//Rex//
function getKeyMatrix() {
    const matrix = [
        [parseInt(document.getElementById("key00").value) || 3, parseInt(document.getElementById("key01").value) || 3],
        [parseInt(document.getElementById("key10").value) || 2, parseInt(document.getElementById("key11").value) || 5]
    ];
    hillDebug("getKeyMatrix:", matrix);
    return matrix;
}
//Lance//
function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}
//Cris//
function getDeterminantMod26(matrix) {
    const [[a, b], [c, d]] = matrix;
    return ((a * d - b * c) % 26 + 26) % 26;
}
//Cris//
function validateHillKey(matrix) {
    const det = getDeterminantMod26(matrix);
    const valid = gcd(det, 26) === 1;
    hillDebug("validateHillKey det mod 26:", det, "valid:", valid);
    if (!valid) {
        throw new Error("Invalid Hill key: determinant has no modular inverse mod 26.");
    }
}
//Kyle//
function calculateInverseMatrix(matrix) {
    const [[a, b], [c, d]] = matrix;
    const det = getDeterminantMod26(matrix);  //determinant must not be divisible by 2 or 13 because it will have no mod inverse//
    const detInv = modInverse(det, 26);   //mod inverse remainder 1,//
    if (detInv === null) {
        throw new Error("Invalid Hill key: determinant has no modular inverse mod 26.");
    }

    const inverseMatrix = [
        [((d * detInv) % 26 + 26) % 26, ((-b * detInv) % 26 + 26) % 26],  //for negative value add 26 till positive//
        [((-c * detInv) % 26 + 26) % 26, ((a * detInv) % 26 + 26) % 26]   //for positive value mod26 get remainder or -26 until range between 1-26//
    ];
    hillDebug("calculateInverseMatrix det:", det, "detInv:", detInv, "inverseMatrix:", inverseMatrix);
    return inverseMatrix;
}
//Lance//
function modInverse(a, m) {
    a = ((a % m) + m) % m;
    for (let i = 1; i < m; i++) {
        if ((a * i) % m === 1) return i;
    }
    return null;
}
//Rex//
function charToNum(char) {
    return char.charCodeAt(0) - 65;
}
//Rex//
function numToChar(num) {
    return String.fromCharCode(((num % 26) + 26) % 26 + 65);
}
//Rex//
function processText(text) {
    let processed = "";
    let positions = [];
    for (let char of text) {
        if (char.match(/[A-Z]/i)) {
            processed += char.toUpperCase();
            positions.push({ type: 'letter' });
        } else {
            positions.push({ type: 'non', char: char });
        }
    }
    return { processed, positions };
}
//Lance//
function extractCasing(text) {
    let casing = [];
    for (let char of text) {
        if (char.match(/[a-z]/i)) {
            casing.push(char.toLowerCase() === char ? 'lower' : 'upper');
        }
    }
    return casing;
}
//Lance//
function applyCasing(text, casing) {
    let result = "";
    let casingIndex = 0;
    for (let char of text) {
        if (char.match(/[A-Z]/)) {
            if (casingIndex < casing.length) {
                result += casing[casingIndex] === 'lower' ? char.toLowerCase() : char;
                casingIndex++;
            } else {
                result += char;
            }
        } else {
            result += char;
        }
    }
    return result;
}
//Lance//
function addPadding(text, casing) {
    if (text.length % 2 !== 0) {
        text += "X";
        casing.push('upper');
    }
    return { processed: text, casing };
}
//Cris//
function multiplyMatrix(matrix, pair) {
    const result = [
        ((matrix[0][0] * pair[0] + matrix[0][1] * pair[1]) % 26 + 26) % 26,
        ((matrix[1][0] * pair[0] + matrix[1][1] * pair[1]) % 26 + 26) % 26
    ];
    hillDebug("multiplyMatrix", pair, "=>", result, "with matrix", matrix);
    return result;
}
//Kyle//
function hillEncrypt(text) {
    hillDebug("hillEncrypt start", text);
    let keyMatrix = getKeyMatrix();
    validateHillKey(keyMatrix);
    let casing = extractCasing(text);
    let { processed, positions } = processText(text);
    hillDebug("processed text", processed, "positions", positions);
    let padded = addPadding(processed, casing);
    processed = padded.processed;
    casing = padded.casing;
    hillDebug("padded text", processed, "casing", casing);

    let encrypted = "";
    for (let i = 0; i < processed.length; i += 2) {
        let pair = [charToNum(processed[i]), charToNum(processed[i + 1])]; //converts letter to num//
        let enc = multiplyMatrix(keyMatrix, pair);
        hillDebug("encrypt pair", pair, "=>", enc);
        encrypted += numToChar(enc[0]) + numToChar(enc[1]);
    }
    hillDebug("encrypted letters", encrypted);

    let result = "";
    let letterIndex = 0;
    for (let pos of positions) {
        if (pos.type === 'letter') {
            result += encrypted[letterIndex];
            letterIndex++;
        } else {
            result += pos.char;
        }
    }

    const output = applyCasing(result, casing);
    hillDebug("hillEncrypt output", output);
    return output;
}
//Kyle//
function hillDecrypt(text) {
    hillDebug("hillDecrypt start", text);
    let keyMatrix = getKeyMatrix();
    validateHillKey(keyMatrix);
    let inverseKeyMatrix = calculateInverseMatrix(keyMatrix);
    hillDebug("inverseKeyMatrix", inverseKeyMatrix);
    let casing = extractCasing(text);
    let { processed, positions } = processText(text);
    hillDebug("processed text", processed, "positions", positions);
    let padded = addPadding(processed, casing);
    processed = padded.processed;
    casing = padded.casing;
    hillDebug("padded text", processed, "casing", casing);

    let decrypted = "";
    for (let i = 0; i < processed.length; i += 2) {
        let pair = [charToNum(processed[i]), charToNum(processed[i + 1])];
        let dec = multiplyMatrix(inverseKeyMatrix, pair);
        hillDebug("decrypt pair", pair, "=>", dec);
        decrypted += numToChar(dec[0]) + numToChar(dec[1]);
    }
    hillDebug("decrypted letters", decrypted);

    let result = "";
    let letterIndex = 0;
    for (let pos of positions) {
        if (pos.type === 'letter') {
            result += decrypted[letterIndex];
            letterIndex++;
        } else {
            result += pos.char;
        }
    }

    const output = applyCasing(result, casing);
    hillDebug("hillDecrypt output", output);
    return output;
}



document.getElementById("cipherType").addEventListener("change", function() {
    const type = this.value;
    document.getElementById("caesarFields").style.display = type === "caesar" ? "block" : "none";
    document.getElementById("hillFields").style.display = type === "hill" ? "block" : "none";
});
//Cris//
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
        try {
            result = hillEncrypt(text);
        } catch (error) {
            result = error.message;
        }
    }

    document.getElementById("DisplayResult").innerText = result;

}
//Cris//
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
        try {
            result = hillDecrypt(text);
        } catch (error) {
            result = error.message;
        }
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
    document.getElementById("resultLabel").innerText = "Encrypted message";
    document.getElementById("shiftValue").value = "";
    document.getElementById("key00").value = "0";
    document.getElementById("key01").value = "0";
    document.getElementById("key10").value = "0";
    document.getElementById("key11").value = "0";
}

