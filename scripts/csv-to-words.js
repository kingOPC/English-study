const fs = require("fs");
const path = require("path");

const input = process.argv[2] || path.join(__dirname, "../data/word-template.csv");
const output = process.argv[3] || path.join(__dirname, "../utils/words.generated.js");

function parseCsvLine(line) {
  const cells = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === "\"" && quoted && next === "\"") {
      current += "\"";
      index += 1;
    } else if (char === "\"") {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    return headers.reduce((row, header, index) => {
      row[header] = cells[index] || "";
      return row;
    }, {});
  });
}

const rows = parseCsv(fs.readFileSync(input, "utf8"));
const levels = Array.from(new Set(rows.map((row) => row.level)));
const books = levels.map((level) => ({
  id: level,
  name: rows.find((row) => row.level === level).book,
  description: ""
}));

const file = `const words = ${JSON.stringify(rows, null, 2)};\n\nconst books = ${JSON.stringify(books, null, 2)};\n\nmodule.exports = {\n  words,\n  books\n};\n`;

fs.writeFileSync(output, file);
console.log(`Generated ${rows.length} words: ${output}`);
