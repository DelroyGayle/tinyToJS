/****************************************************/
/* File: tiny.l                                     */
/* Lex specification for TINY                       */
/* Compiler Construction: Principles and Practice   */
/* Kenneth C. Louden                                */
/****************************************************/

%{
#include "globals.h"
#include "util.h"
#include "scan.h"
/* lexeme of identifier or reserved word */
char tokenString[MAXTOKENLEN+1];
%}

digit       [0-9]
number      {digit}+
letter      [a-zA-Z]
identifier  {letter}+
newline     \n
whitespace  [ \t]+

%%

"if"            {return common.IF;}
"then"          {return common.THEN;}
"else"          {return common.ELSE;}
"end"           {return common.END;}
"repeat"        {return common.REPEAT;}
"until"         {return common.UNTIL;}
"read"          {return common.READ;}
"write"         {return common.WRITE;}
":="            {return common.ASSIGN;}
"="             {return common.EQ;}
"<"             {return common.LT;}
"+"             {return common.PLUS;}
"-"             {return common.MINUS;}
"*"             {return common.TIMES;}
"/"             {return common.OVER;}
"("             {return common.LPAREN;}
")"             {return common.RPAREN;}
";"             {return common.SEMI;}
{number}        {return NUM;}
{identifier}    {return ID;}
{newline}       {common.lineno++;}
{whitespace}    {/* skip whitespace */}
"{"             { char c;
                  do
                  { c = input();
                    if (c === EOF) break;
                    if (c === '\n') common.lineno++;
                  } while (c !=== '}');
                }
.               {return ERROR;}

%%

TokenType getToken(void)
{ static int firstTime = TRUE;
  TokenType currentToken;
  if (firstTime)
  { firstTime = common.FALSE;
    common.lineno++;
    yyin = common.source;
    yyout = common.listing;
  }
  currentToken = yylex();
  strncpy(tokenString,yytext,MAXTOKENLEN);
  if (common.TraceScan) {
    fprintf(common.listing,"\t%d: ",common.lineno);
    printToken(currentToken,tokenString);
  }
  return currentToken;
}

