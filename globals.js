/****************************************************/
/* File: globals.js                                 */
/* Global types and vars for TINY compiler          */
/* must come before other include files             */
/* Compiler Construction: Principles and Practice   */
/* Kenneth C. Louden                                */
/****************************************************/

// These are all CONSTANTS :-

const common = { FALSE : 0, TRUE : 1, 

/* MAXRESERVED = the number of reserved words */
                MAXRESERVED : 8,

    /* book-keeping tokens */
                ENDFILE : 0,
                ERROR : 1,
    /* reserved words */ 
                IF : 2, 
                THEN : 3, ELSE : 4, END : 5, REPEAT : 6, UNTIL : 7, READ : 8, WRITE : 9,
    /* multicharacter tokens */
                ID : 10, NUM : 11,
    /* special symbols */
                ASSIGN : 12, EQ : 13, LT : 14, PLUS : 15, MINUS : 16, TIMES : 17,
                OVER : 18, LPAREN : 19, RPAREN : 20, SEMI : 21,

    // The above are the TokenTypes;

/**************************************************/
/***********   Syntax tree for parsing ************/
/**************************************************/

                StmtK : 0, ExpK : 1, // NodeKind;
                IfK : 0, RepeatK : 1, AssignK : 2, ReadK : 3, WriteK : 4, // StmtKind;
                OpK : 0, ConstK : 1, IdK : 2, // ExpKind;

/* ExpType is used for type checking */
                Void : 0, Integer : 1, Boolean : 2, // ExpType;

                MAXCHILDREN : 3,
                NULL : null,
                EOF : -1,
                toScreen : ":screen:",

// These are all MUTABLE :-


                source : null, /* source code text file */
                listing : null, /* listing output text file */
                code : null, /* code text file for TM simulator */

                lineno : 0, /* source line number for listing */

/**************************************************/
/***********   Flags for tracing       ************/
/**************************************************/

/* EchoSource = TRUE causes the source program to
 * be echoed to the listing file with line numbers
 * during parsing
 */
                EchoSource : null,

/* TraceScan = TRUE causes token information to be
 * printed to the listing file as each token is
 * recognized by the scanner
 */
                TraceScan : null,

/* TraceParse = TRUE causes the syntax tree to be
 * printed to the listing file in linearized form
 * (using indents for children)
 */
                TraceParse : null,

/* TraceAnalyze = TRUE causes symbol table inserts
 * and lookups to be reported to the listing file
 */
                TraceAnalyze : null,

/* TraceCode = TRUE causes comments to be written
 * to the TM code file as code is generated
 */
                TraceCode : null,

/* Error = TRUE prevents further passes if an error occurs */
                Error : null,
              
                theReadLines : null};

const sprintf = require("sprintf-js").sprintf,
      vsprintf = require("sprintf-js").vsprintf;
// https://github.com/alexei/sprintf.js 

const fprintf = (mode, string, array) => {
    const result = vsprintf(string, array);
    if (mode === toScreen) {
            process.stdout.write(string);
     } else {
            fs.write(handle, string)
     }
}


module.exports = common;
exports.fprintf = fprintf;