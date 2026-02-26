const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const SAMPLE_TEXT = `
Week 1 - Memory Model

The memory model describes how your program's variables are laid out in RAM. Each variable has an address, and the stack stores local variables while the heap stores dynamically allocated data. Understanding the memory model is fundamental to debugging and understanding pointers.

Week 3 - Pointers

A pointer is a variable that stores the memory address of another variable. Use the & operator to get an address and * to dereference (access the value at that address). Pointers are essential for dynamic memory allocation and passing data by reference. When you pass a pointer to a function, the function can modify the original variable.

Week 4 - Recursion

Recursion is when a function calls itself. Every recursive function needs a base case (to stop) and a recursive case (to make progress toward the base case). Common examples include factorial, Fibonacci, and tree traversal. Each recursive call adds a new frame to the call stack, so ensure your base case is reachable to avoid stack overflow.

Week 5 - Arrays and Memory

An array is a contiguous block of memory. The array name acts like a pointer to the first element. Indexing arr[i] is equivalent to *(arr + i). Arrays can be passed to functions by reference. Multi-dimensional arrays are stored in row-major order.
`.trim();

async function main() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([612, 792]);
  const { width, height } = page.getSize();
  const margin = 50;
  const fontSize = 12;
  const lineHeight = fontSize * 1.4;

  let y = height - margin;
  const lines = SAMPLE_TEXT.split('\n');

  for (const line of lines) {
    if (y < margin) break;
    page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) });
    y -= lineHeight;
  }

  const pdfBytes = await doc.save();
  const outPath = path.join(__dirname, '..', 'data', 'sample.pdf');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, pdfBytes);
  console.log('Created:', outPath);
}

main().catch(console.error);
