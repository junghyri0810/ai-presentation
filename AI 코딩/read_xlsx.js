const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const folder = 'C:/Users/정혜리/Desktop/AI 코딩/사례 1 로그인 페이지/로그인페이지 디베롧';
const xlsxFile = fs.readdirSync(folder).find(f => f.endsWith('.xlsx'));
const xlsxPath = path.join(folder, xlsxFile);
console.log('Reading:', xlsxPath);

// Read xlsx (zip) as buffer and find XML content
const buf = fs.readFileSync(xlsxPath);

// Find sharedStrings.xml by searching for the filename in the zip
// Look for text content between XML tags
const str = buf.toString('latin1');

// Find sharedStrings - look for <si><t> patterns
const ssStart = str.indexOf('xl/sharedStrings.xml');
console.log('sharedStrings offset:', ssStart);

// Try to extract readable text - search for UTF-8 encoded Korean text patterns
// Xlsx stores strings in sharedStrings.xml which is a zip-compressed entry
// Let's find all local file headers and their content

let offset = 0;
const entries = [];
while (offset < buf.length - 4) {
  // ZIP local file header signature: PK\x03\x04
  if (buf[offset] === 0x50 && buf[offset+1] === 0x4B && buf[offset+2] === 0x03 && buf[offset+3] === 0x04) {
    const compression = buf.readUInt16LE(offset + 8);
    const compSize = buf.readUInt32LE(offset + 18);
    const uncompSize = buf.readUInt32LE(offset + 22);
    const fnLen = buf.readUInt16LE(offset + 26);
    const extraLen = buf.readUInt16LE(offset + 28);
    const filename = buf.slice(offset + 30, offset + 30 + fnLen).toString('utf8');
    const dataStart = offset + 30 + fnLen + extraLen;
    const data = buf.slice(dataStart, dataStart + compSize);

    entries.push({ filename, compression, compSize, uncompSize, dataStart, data });
    offset = dataStart + compSize;
  } else {
    offset++;
  }
}

console.log('Entries:', entries.map(e => e.filename));

// Find and decompress sharedStrings.xml
const ssEntry = entries.find(e => e.filename === 'xl/sharedStrings.xml');
const shEntry = entries.find(e => e.filename === 'xl/worksheets/sheet1.xml');

function decompress(entry) {
  if (entry.compression === 0) {
    return entry.data.toString('utf8');
  } else if (entry.compression === 8) {
    return zlib.inflateRawSync(entry.data).toString('utf8');
  }
  return null;
}

if (ssEntry) {
  const xml = decompress(ssEntry);
  console.log('=SS=');
  console.log(xml ? xml.substring(0, 8000) : 'Could not decompress');
}

if (shEntry) {
  const xml = decompress(shEntry);
  console.log('=SHEET=');
  console.log(xml ? xml.substring(0, 5000) : 'Could not decompress');
}
