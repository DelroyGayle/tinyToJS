/****************************************************/
/* File: scan.js                                    */
/* The scanner implementation for the TINY compiler */
/* Compiler Construction: Principles and Practice   */
/* Kenneth C. Louden                                */
/****************************************************/

// function 'getToken' returns the next token in source file

// Shared and Global Variables
// const common = require("./globals.js");
const common = require('./globals.js')
console.log(common)
console.log("ABC",common.IF, common.END)
console.log("DEF", common["IF"], common["END"])
console.log(common)

/* states in scanner DFA */
const START = 0, INASSIGN = 1, INCOMMENT = 2, INNUM = 3, INID = 4, DONE = 5;

/* lookup table of reserved words */
const reservedWords = {
                       if :     common.IF, 
                       then :   common.THEN,
                       else :   common.ELSE,
                       end :    common.END,
                       repeat : common.REPEAT,
                       until :  common.UNTIL,
                       read :   common.READ,
                       write :  common.WRITE
                      };

/*    
   'MAXTOKENLEN' is the maximum size of a token
   MAXTOKENLEN = 40

   lexeme of identifier or reserved word */
let tokenString; // A String - maximum length MAXTOKENLEN - 1

/* BUFLEN = length of the input buffer for
   source code lines */
const BUFLEN = 256;

let lineBuf = []; /* holds the current line  - Maximum length: BUFLEN */
let linepos = 0; /* current position in LineBuf */
let bufsize = 0; /* current size of buffer string */
let EOF_flag = common.FALSE; /* corrects ungetNextChar behaviour on EOF */

const switchScanTable = {'=' : common.EQ,     '<' : common.LT, 
                         '+' : common.PLUS,   '-' : common.MINUS,
                         '*' : common.TIMES,  '/' : common.OVER,
                         '(' : common.LPAREN, ')':  common.RPAREN,
                         ';' : common.SEMI
                        };

/*
    fgets( str, count );
    Reads at most count characters from the array 'common.theReadLines' 
    and return that string. Also return 'common.TRUE' to indicate success
    If 'common.theReadLines' is empty, return a null string and 'common.EOF'
*/
function fgets(count) {
     if (!common.theReadLines.length) {
          return [[], common.EOF];
     }
     return [common.theReadLines.shift().slice(0,count).split(''), common.TRUE];
}

/* getNextChar fetches the next non-blank character
   from lineBuf, reading in a new line if lineBuf is
   exhausted */
function getNextChar() {
if (linepos >= bufsize) {
    common.lineno++;
    let [lineBuf, result] = fgets(BUFLEN);
    if ( result === common.TRUE) {
          if (common.EchoSource) {
                    fprintf(common.listing,"%4d: %s",[common.lineno,lineBuf]);
          }
      bufsize = lineBuf.length;
      linepos = 0;
      return lineBuf[linepos++];
    } else { 
            EOF_flag = common.TRUE;
            return common.EOF;
      }
  }
  else 
        return lineBuf[linepos++];
}

/* ungetNextChar backtracks one character
   in lineBuf */
function ungetNextChar()
{ if (!EOF_flag) {
                  linepos-- ;
                 }
}

/* lookup an identifier to see if it is a reserved word */
function reservedLookup(s)
{ 
  return reservedWords[s] ?? common.ID;
}

/* holds current token to be returned */
 let currentToken;
/* current state - always begins at START */
 let state;
 /* flag to indicate save to tokenString */
 let save;

 function handleComment(c) {
         save = common.FALSE;
         if (c === common.EOF) {
           state = DONE;
           currentToken = common.ENDFILE;
         } else if (c === '}') {
                                  state = START;
                              }
 }

 function handleAssignment(c) {
         state = DONE;
         if (c === '=') {
            currentToken = common.ASSIGN;
         } else {
           /* backup in the input */
           ungetNextChar();
           save = common.FALSE;
           currentToken = common.ERROR;
         }
 }

 function handleNumber(c) {
         if (!isdigit(c)) {
           /* backup in the input */
           ungetNextChar();
           save = common.FALSE;
           state = DONE;
           currentToken = common.NUM;
         }
 }

 function handleIdentifier(c) {
         if (!isalpha(c)) {
           /* backup in the input */
           ungetNextChar();
           save = common.FALSE;
           state = DONE;
           currentToken = common.ID;
         }
 }

  // Alternative to SWITCH Statement
 const chooseScanAction = {};
 chooseScanAction[INCOMMENT.toString()] = handleComment;
 chooseScanAction[INASSIGN.toString()]  = handleAssignment;
 chooseScanAction[INNUM.toString()]     = handleNumber;
 chooseScanAction[INID.toString()]      = handleIdentifier;


/****************************************/
/* the primary function of the scanner  */
/****************************************/

function isdigit(c) {
    return /^[0-9]$/.test(c);
}

function isalpha(c) {
  return /^[A-Za-z]$/.test(c);
}

/* function getToken returns the 
 * next token in source file
 */
function getToken() {
   /* index for storing into tokenString */
   let tokenStringIndex = 0,
       tokenString = "",
       stateToString;
      
   /* current state - always begins at START */
   state = START;
   while (state !== DONE)
   { 
     const c = getNextChar();
     save = common.TRUE;
     
     //switch (state)
     if (state === START) {
         if (isdigit(c)) {
            state = INNUM;
         }
         else if (isalpha(c)) {
           state = INID;
         }
         else if (c === ':') {
           state = INASSIGN;
         }
         else if ((c === ' ') || (c === '\t') || (c === '\n')) {
           save = common.FALSE;
         }
         else if (c === '{') {
           save = common.FALSE;
           state = INCOMMENT;
         } else {
                 state = DONE;
                 if (c === common.EOF) {
                      save = common.FALSE;
                      currentToken = common.ENDFILE;
                 } else {
                      currentToken = c in switchScanTable ? switchScanTable[c] : common.ERROR;
                        }
           }

      } else if ((stateToString = state.toString()) in chooseScanAction) {
              chooseScanAction[stateToString](c)
      } else { /* e.g. state = DONE
                       should never happen */
              fprintf(listing,"Scanner Bug: state= %d\n",[state]);
              state = DONE;
              currentToken = common.ERROR;
     }

     if (save && tokenStringIndex <= common.MAXTOKENLEN) {
              tokenString += c;
              tokenStringIndex++;
              if (state === DONE) {
                if (currentToken === common.ID) {
                        currentToken = reservedLookup(tokenString);
                }
              }
     }
   }
   if (common.TraceScan) {
     fprintf(listing,"\t%d: ",[common.lineno]);
     printToken(currentToken,tokenString);
   }
   return currentToken;
} /* end getToken */

module.exports = {
    getToken,
}

 