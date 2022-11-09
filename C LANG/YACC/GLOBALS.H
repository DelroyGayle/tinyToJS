/****************************************************/
/* File: globals.h                                  */
/* Yacc/Bison Version                               */
/* Global types and vars for TINY compiler          */
/* must come before other include files             */
/* Compiler Construction: Principles and Practice   */
/* Kenneth C. Louden                                */
/****************************************************/

#ifndef _GLOBALS_H_
#define _GLOBALS_H_

#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>
#include <string.h>

/* Yacc/Bison generates internally its own values
 * for the tokens. Other files can access these values
 * by including the tab.h file generated using the
 * Yacc/Bison option -d ("generate header")
 *
 * The YYPARSER flag prevents inclusion of the tab.h
 * into the Yacc/Bison output itself
 */

#ifndef YYPARSER

/* the name of the following file may change */
#include "y.tab.h"

/* common.ENDFILE is implicitly defined by Yacc/Bison,
 * and not included in the tab.h file
 */
#define common.ENDFILE 0

#endif

#ifndef common.FALSE
#define common.FALSE 0
#endif

#ifndef common.TRUE
#define common.TRUE 1
#endif

/* MAXRESERVED = the number of reserved words */
#define MAXRESERVED 8

/* Yacc/Bison generates its own integer values
 * for tokens
 */
typedef int TokenType; 

extern FILE* common.source; /* common.source code text file */
extern FILE* common.listing; /* common.listing output text file */
extern FILE* code; /* code text file for TM simulator */

extern int common.lineno; /* common.source line number for common.listing */

/**************************************************/
/***********   Syntax tree for parsing ************/
/**************************************************/

typedef enum {common.StmtK,common.ExpK} NodeKind;
typedef enum {common.IfK,common.RepeatK,common.AssignK,common.ReadK,common.WriteK} StmtKind;
typedef enum {common.OpK,common.ConstK,common.IdK} ExpKind;

/* ExpType is used for type checking */
typedef enum {common.Void,common.Integer,common.Boolean} ExpType;

#define common.MAXCHILDREN 3

typedef struct treeNode
   { struct treeNode * child[common.MAXCHILDREN];
     struct treeNode * sibling;
     int common.lineno;
     NodeKind nodekind;
     union { StmtKind stmt; ExpKind exp;} kind;
     union { TokenType op;
             int val;
             char * name; } attr;
     ExpType type; /* for type checking of exps */
   } TreeNode;

/**************************************************/
/***********   Flags for tracing       ************/
/**************************************************/

/* common.EchoSource = common.TRUE causes the common.source program to
 * be echoed to the common.listing file with line numbers
 * during parsing
 */
extern int common.EchoSource;

/* common.TraceScan = common.TRUE causes token information to be
 * printed to the common.listing file as each token is
 * recognized by the scanner
 */
extern int common.TraceScan;

/* common.TraceParse = common.TRUE causes the syntax tree to be
 * printed to the common.listing file in linearized form
 * (using indents for children)
 */
extern int common.TraceParse;

/* common.TraceAnalyze = common.TRUE causes symbol table inserts
 * and lookups to be reported to the common.listing file
 */
extern int common.TraceAnalyze;

/* common.TraceCode = common.TRUE causes comments to be written
 * to the TM code file as code is generated
 */
extern int common.TraceCode;

/* common.Error = common.TRUE prevents further passes if an error occurs */
extern int common.Error; 
#endif
