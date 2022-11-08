/****************************************************/
/* File: tiny.js                                    */
/* Main program for TINY compiler                   */
/* Compiler Construction: Principles and Practice   */
/* Kenneth C. Louden                                */
/****************************************************/

// Include process module
const process = require('process');
// https://www.geeksforgeeks.org/node-js-process-argv-property/ 
 const fs = require('fs');
// https://nodejs.org/api/fs.html 
// https://www.w3schools.com/nodejs/nodejs_filesystem.asp 

const globals = require("./globals.js");
const { TRUE, FALSE } = require("./globals.js");
const { MAXTOKENLEN } = require("./scanHeader.js");
let { source, listing, code, lineno,  } = require("./globals.js");


/* set NO_PARSE to TRUE to get a scanner-only compiler */
const NO_PARSE = TRUE;

/* set NO_ANALYZE to TRUE to get a parser-only compiler */
const NO_ANALYZE = TRUE;

/* set NO_CODE to TRUE to get a compiler that does not
 * generate code
 */
const NO_CODE = TRUE;

/* allocate global variables */
const toSCreen = 0;
lineno = 0;

/* allocate and set tracing flags */
globals.EchoSource = FALSE;
globals.TraceScan = FALSE;
globals.TraceParse = FALSE;
globals.TraceAnalyze = FALSE;
globals.TraceCode = FALSE;

globals.Error = FALSE;

function main( )
{ let syntaxTree;
  let pgm; /* source code file name */
  const args = process.argv;
  if (args.length !== 2)
    { console.log(`usage: ${args[0]} <filename>`);
      process.exit(1);
    }
  pgm = args[1];
  if (!(/\./.test(pgm))) {
     pgm += ".tny";
  }
  fs.open(pgm, "r", function (err, source) {
            if (err) { 
                    console.log(`File ${pgm} not found`);
                    process.exit(1);
            }
                                            });

  listing = toSCreen; /* send listing to screen */
  console.log(`\nTINY COMPILATION: ${pgm}`);
  if (NO_PARSE) {
          while (getToken()!=ENDFILE)
                ;
  } else {
          syntaxTree = parse();
          if (TraceParse) {
                console.log("\nSyntax tree:");
                printTree(syntaxTree);
          }

          if (! NO_ANALYZE) {
                if (! Error) {
                    if (TraceAnalyze) {
                                        console.log("\nBuilding Symbol Table...");
                    }
                    buildSymtab(syntaxTree);

                    if (TraceAnalyze) { 
                                        console.log("\nChecking Types...");
                    }
                    typeCheck(syntaxTree);

                    if (TraceAnalyze) {
                                        console.log("\nType Checking Finished");
                    }
                }

                if (! NO_CODE) {
                        if (! Error) {
                                const fnlen = pgm.indexOf(".");
                                const codefile = pgm.substring(0,fnlen) + ".tm";
                                fs.open(codefile, "w", function (err, code) {
                                    if (err) { 
                                        console.log(`Unable to open ${codefile}`);
                                        process.exit(1);
                                    }
                                });

                                codeGen(syntaxTree,codefile);
                                fs.close(code);
                        }
                }
            }
  }

  fclose(source);
  return 0;
}

