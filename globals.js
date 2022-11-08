/****************************************************/
/* File: globals.h                                  */
/* Global types and vars for TINY compiler          */
/* must come before other include files             */
/* Compiler Construction: Principles and Practice   */
/* Kenneth C. Louden                                */
/****************************************************/

const { fstat } = require("fs");


const FALSE = 0;
const TRUE = 1;

/* MAXRESERVED = the number of reserved words */
const MAXRESERVED = 8;

    /* book-keeping tokens */
const ENDFILE = 0,ERROR = 1,
    /* reserved words */
    IF = 2, THEN = 3, ELSE = 4, END = 5, REPEAT = 6, UNTIL = 7, READ = 8, WRITE = 9,
    /* multicharacter tokens */
    ID = 10, NUM = 11,
    /* special symbols */
    ASSIGN = 12, EQ = 13, LT = 14, PLUS = 15, MINUS = 16, TIMES = 17,
    OVER = 18, LPAREN = 19, RPAREN = 20, SEMI = 21;
    // The above is TokenType;

let source; /* source code text file */
let listing; /* listing output text file */
let code; /* code text file for TM simulator */

let lineno; /* source line number for listing */

/**************************************************/
/***********   Syntax tree for parsing ************/
/**************************************************/

const StmtK = 0, ExpK = 1; // NodeKind;
const IfK = 0, RepeatK = 1, AssignK = 2, ReadK = 3, WriteK = 4; // StmtKind;
const OpK = 0, ConstK = 1, IdK = 2; // ExpKind;

/* ExpType is used for type checking */
const Void = 0, Integer = 1, Boolean = 2; // ExpType;

const MAXCHILDREN = 3;


/**************************************************/
/***********   Flags for tracing       ************/
/**************************************************/

/* EchoSource = TRUE causes the source program to
 * be echoed to the listing file with line numbers
 * during parsing
 */
let EchoSource;

/* TraceScan = TRUE causes token information to be
 * printed to the listing file as each token is
 * recognized by the scanner
 */
let TraceScan;

/* TraceParse = TRUE causes the syntax tree to be
 * printed to the listing file in linearized form
 * (using indents for children)
 */
let TraceParse;

/* TraceAnalyze = TRUE causes symbol table inserts
 * and lookups to be reported to the listing file
 */
let TraceAnalyze;

/* TraceCode = TRUE causes comments to be written
 * to the TM code file as code is generated
 */
let TraceCode;

/* Error = TRUE prevents further passes if an error occurs */
let Error; 

const toScreen = ":screen:";

const sprintf = require("sprintf-js").sprintf,
      vsprintf = require("sprintf-js").vsprintf;
// https://github.com/alexei/sprintf.js 

const fprintf = (mode, string, array) => {
    const result = vsprintf(string, array);
    if (mode === globals.toScreen) {
            process.stdout.write(string);
     } else {
            fs.write(handle, string)
     }
}