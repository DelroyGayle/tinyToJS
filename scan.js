/****************************************************/
/* File: scan.c                                     */
/* The scanner implementation for the TINY compiler */
/* Compiler Construction: Principles and Practice   */
/* Kenneth C. Louden                                */
/****************************************************/

// Shared and Globl Variables
const common = require("./globals.js");
const { fprintf } = require('./globals.js')

#include "globals.h"
#include "util.h"
#include "scan.h"

/* states in scanner DFA */
const START = 0, INASSIGN = 1, INCOMMENT = 2, INNUM = 3, INID = 4, DONE = 5;

/* lookup table of reserved words */
const reservedWords = {
                       if : common.IF, 
                       then : common.THEN,
                       else : common.ELSE,
                       end : common.END,
                       repeat : common.REPEAT,
                       until : common.UNTIL,
                       read : READ,
                       write : WRITE
                      };

/* lexeme of identifier or reserved word */
let tokenString; // [MAXTOKENLEN+1];

/* BUFLEN = length of the input buffer for
   source code lines */
const BUFLEN = 256;

const lineBuf = []; // [BUFLEN]; /* holds the current line */
let linepos = 0; /* current position in LineBuf */
let bufsize = 0; /* current size of buffer string */
let EOF_flag = common.FALSE; /* corrects ungetNextChar behaviour on EOF */

/*
    fgets( str, count );
    Reads at most count characters from the array 'common.theReadLines' 
    and return that string. Also return 'common.TRUE' to indicate success
    If 'common.theReadLines' is empty, return a null string and 'common.EOF'
*/
function fgets(count) {
     if (!common.theReadData.length) {
          return ["", common.EOF];
     }
     return [common.theReadLines.shift().slice(0,count), common.TRUE];
}

/* getNextChar fetches the next non-blank character
   from lineBuf, reading in a new line if lineBuf is
   exhausted */
function getNextChar() {
if (linepos >= bufsize) {
    lineno++;
    let [lineBuf, result] = fgets(BUFLEN);
    if ( result === common.TRUE) {
          if (common.EchoSource) {
                    fprintf(common.listing,"%4d: %s",common.lineno,lineBuf);
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
function reservedLookup (s)
{ 
  return reservedWords[s] ?? common.ID;
}

/****************************************/
/* the primary function of the scanner  */
/****************************************/


/* function getToken returns the 
 * next token in source file
 */
function getToken() {
   /* index for storing into tokenString */
   let tokenStringIndex = 0;
   /* holds current token to be returned */
   let currentToken;
   /* current state - always begins at START */
   let state = START;
   /* flag to indicate save to tokenString */
   let save;
   while (state != DONE)
   { c = getNextChar();
     save = common.TRUE;
     switch (state)
     { case START:
         if (isdigit(c))
           state = INNUM;
         else if (isalpha(c))
           state = INID;
         else if (c == ':')
           state = INASSIGN;
         else if ((c == ' ') || (c == '\t') || (c == '\n'))
           save = common.FALSE;
         else if (c == '{')
         { save = common.FALSE;
           state = INCOMMENT;
         }
         else
         { state = DONE;
           switch (c)
           { case common.EOF:
               save = common.FALSE;
               currentToken = common.ENDFILE;
               break;
             case '=':
               currentToken = common.EQ;
               break;
             case '<':
               currentToken = common.LT;
               break;
             case '+':
               currentToken = common.PLUS;
               break;
             case '-':
               currentToken = common.MINUS;
               break;
             case '*':
               currentToken = common.TIMES;
               break;
             case '/':
               currentToken = common.OVER;
               break;
             case '(':
               currentToken = common.LPAREN;
               break;
             case ')':
               currentToken = common.RPAREN;
               break;
             case ';':
               currentToken = common.SEMI;
               break;
             default:
               currentToken = common.ERROR;
               break;
           }
         }
         break;
       case INCOMMENT:
         save = common.FALSE;
         if (c == common.EOF)
         { state = DONE;
           currentToken = common.ENDFILE;
         }
         else if (c == '}') state = START;
         break;
       case INASSIGN:
         state = DONE;
         if (c == '=')
           currentToken = common.ASSIGN;
         else
         { /* backup in the input */
           ungetNextChar();
           save = common.FALSE;
           currentToken = common.ERROR;
         }
         break;
       case INNUM:
         if (!isdigit(c))
         { /* backup in the input */
           ungetNextChar();
           save = common.FALSE;
           state = DONE;
           currentToken = common.NUM;
         }
         break;
       case INID:
         if (!isalpha(c))
         { /* backup in the input */
           ungetNextChar();
           save = common.FALSE;
           state = DONE;
           currentToken = common.ID;
         }
         break;
       case DONE:
       default: /* should never happen */
         fprintf(listing,"Scanner Bug: state= %d\n",state);
         state = DONE;
         currentToken = common.ERROR;
         break;
     }
     if ((save) && (tokenStringIndex <= MAXTOKENLEN))
       tokenString[tokenStringIndex++] = (char) c;
     if (state == DONE)
     { tokenString[tokenStringIndex] = '\0';
       if (currentToken == common.ID)
         currentToken = reservedLookup(tokenString);
     }
   }
   if (TraceScan) {
     fprintf(listing,"\t%d: ",lineno);
     printToken(currentToken,tokenString);
   }
   return currentToken;
} /* end getToken */

