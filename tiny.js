/****************************************************/
/* File: tiny.js                                    */
/* Main program for TINY compiler                   */
/* Compiler Construction: Principles and Practice   */
/* Kenneth C. Louden                                */
/****************************************************/

// Shared and Global Variables
const common = require("./globals.js");

// Include process module
const process = require("process");
// https://www.geeksforgeeks.org/node-js-process-argv-property/
const fs = require("fs");
// https://nodejs.org/api/fs.html
// https://www.w3schools.com/nodejs/nodejs_filesystem.asp

const parse = require("./parse.js");

/* set NO_PARSE to TRUE to get a scanner-only compiler */
const NO_PARSE = common.TRUE;

/* set NO_ANALYZE to TRUE to get a parser-only compiler */
const NO_ANALYZE = common.TRUE;

/* set NO_CODE to TRUE to get a compiler that does not
 * generate code
 */
const NO_CODE = common.TRUE;

/* allocate global variables */
common.lineno = 0;

/* allocate and set tracing flags */
common.EchoSource = common.FALSE;
common.TraceScan = common.FALSE;
common.TraceParse = common.FALSE;
common.TraceAnalyse = common.FALSE;
common.TraceCode = common.FALSE;

common.Error = common.FALSE;

function main() {
  let syntaxTree;
  let pgm; /* source code file name */

  const args = process.argv;
  // Check that the program has been invoked properly
  let pattern = /tiny(.js)?$/i;
  let tempIndex = args.findIndex((element) => pattern.test(element));
  let temp = tempIndex;
  while (temp-- > 0) {
    // ignore prior arguments
    args.shift();
  }
  if (args.length !== 2 || tempIndex < 0) {
    console.log(`usage: ${args[0]} <filename>`);
    process.exit(1);
  }
  pgm = args[1];
  if (!/\./.test(pgm)) {
    pgm += ".tny";
  }
  common.source = pgm;

  // Read the entire input file and split it up into the lines
  let theReadData;
  fs.readFileSync(pgm, "utf8", function (err, theReadData) {
    if (err) {
      console.log(`File ${pgm} not found`);
      process.exit(1);
    }
  });
  common.theReadLines = theReadData.split(/\r?\n/);

  common.listing = common.toScreen; /* send listing to screen */

  console.log(`\nTINY COMPILATION: ${pgm}`);
  if (NO_PARSE) {
    while (getToken() !== common.ENDFILE);
  } else {
    syntaxTree = parse();
    if (common.TraceParse) {
      console.log("\nSyntax tree:");
      printTree(syntaxTree);
    }

    if (!NO_ANALYZE) {
      if (!common.Error) {
        if (common.TraceAnalyse) {
          console.log("\nBuilding Symbol Table...");
        }
        buildSymtab(syntaxTree);

        if (common.TraceAnalyse) {
          console.log("\nChecking Types...");
        }
        typeCheck(syntaxTree);

        if (common.TraceAnalyse) {
          console.log("\nType Checking Finished");
        }
      }

      if (!NO_CODE) {
        if (!common.Error) {
          const fnlen = pgm.indexOf(".");
          const codefile = pgm.substring(0, fnlen) + ".tm";
          codeGen(syntaxTree, codefile);
          fs.close(code);
        }
      }
    }
  }

  return 0;
}

main();
