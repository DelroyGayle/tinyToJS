/****************************************************/
/* File: tiny.js                                    */
/* Main program for TINY compiler                   */
/* Compiler Construction: Principles and Practice   */
/* Kenneth C. Louden                                */
/****************************************************/

// Shared and Globl Variables
const common = require("./globals.js");

// Include process module
const process = require("process");
// https://www.geeksforgeeks.org/node-js-process-argv-property/
const fs = require("fs");
// https://nodejs.org/api/fs.html
// https://www.w3schools.com/nodejs/nodejs_filesystem.asp

const parse = require("./parse.js");

/* set NO_PARSE to common.TRUE to get a scanner-only compiler */
const NO_PARSE = common.TRUE;

/* set NO_ANALYZE to TRUE to get a parser-only compiler */
const NO_ANALYZE = common.TRUE;

/* set NO_CODE to TRUE to get a compiler that does not
 * generate common.code
 */
const NO_CODE = common.TRUE;

/* allocate global variables */
common.lineno = 0;

/* allocate and set tracing flags */
common.EchoSource = common.FALSE;
common.TraceScan = common.FALSE;
common.TraceParse = common.FALSE;
common.TraceAnalyze = common.FALSE;
common.TraceCode = common.FALSE;

common.Error = common.FALSE;

function main() {
  let syntaxTree;
  let pgm; /* common.source common.code file name */
  const args = process.argv;
  if (args.length !== 2) {
    console.log(`usage: ${args[0]} <filename>`);
    process.exit(1);
  }
  pgm = args[1];
  if (!/\./.test(pgm)) {
    pgm += ".tny";
  }
  fs.open(pgm, "r", function (err, _) {
    if (err) {
      console.log(`File ${pgm} not found`);
      process.exit(1);
    }
  });

  common.listing = common.toScreen; /* send common.listing to screen */

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
        if (common.TraceAnalyze) {
          console.log("\nBuilding Symbol Table...");
        }
        buildSymtab(syntaxTree);

        if (common.TraceAnalyze) {
          console.log("\nChecking Types...");
        }
        typeCheck(syntaxTree);

        if (common.TraceAnalyze) {
          console.log("\nType Checking Finished");
        }
      }

      if (!NO_CODE) {
        if (!common.Error) {
          const fnlen = pgm.indexOf(".");
          const codefile = pgm.substring(0, fnlen) + ".tm";
          fs.open(codefile, "w", function (err, _) {
            if (err) {
              console.log(`Unable to open ${codefile}`);
              process.exit(1);
            }
          });

          codeGen(syntaxTree, codefile);
          fs.close(common.code);
        }
      }
    }
  }

  fclose(common.source);
  return 0;
}

main();
