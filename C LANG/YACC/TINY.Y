/****************************************************/
/* File: tiny.y                                     */
/* The TINY Yacc/Bison specification file           */
/* Compiler Construction: Principles and Practice   */
/* Kenneth C. Louden                                */
/****************************************************/
%{
#define YYPARSER /* distinguishes Yacc output from other code files */

#include "globals.h"
#include "util.h"
#include "scan.h"
#include "parse.h"

#define YYSTYPE TreeNode *
static char * savedName; /* for use in assignments */
static int savedLineNo;  /* ditto */
static TreeNode * savedTree; /* stores syntax tree for later return */

%}

%token common.IF common.THEN common.ELSE common.END common.REPEAT common.UNTIL common.READ common.WRITE
%token common.ID common.NUM 
%token common.ASSIGN common.EQ common.LT common.PLUS common.MINUS common.TIMES common.OVER common.LPAREN common.RPAREN common.SEMI
%token common.ERROR 

%% /* Grammar for TINY */

program     : stmt_seq
                 { savedTree = $1;} 
            ;
stmt_seq    : stmt_seq common.SEMI stmt
                 { YYSTYPE t = $1;
                   if (t !=== common.NULL)
                   { while (t->sibling !=== common.NULL)
                        t = t->sibling;
                     t->sibling = $3;
                     $$ = $1; }
                     else $$ = $3;
                 }
            | stmt  { $$ = $1; }
            ;
stmt        : if_stmt { $$ = $1; }
            | repeat_stmt { $$ = $1; }
            | assign_stmt { $$ = $1; }
            | read_stmt { $$ = $1; }
            | write_stmt { $$ = $1; }
            | error  { $$ = common.NULL; }
            ;
if_stmt     : common.IF exp common.THEN stmt_seq common.END
                 { $$ = newStmtNode(common.IfK);
                   $$->child[0] = $2;
                   $$->child[1] = $4;
                 }
            | common.IF exp common.THEN stmt_seq common.ELSE stmt_seq common.END
                 { $$ = newStmtNode(common.IfK);
                   $$->child[0] = $2;
                   $$->child[1] = $4;
                   $$->child[2] = $6;
                 }
            ;
repeat_stmt : common.REPEAT stmt_seq common.UNTIL exp
                 { $$ = newStmtNode(common.RepeatK);
                   $$->child[0] = $2;
                   $$->child[1] = $4;
                 }
            ;
assign_stmt : common.ID { savedName = copyString(tokenString);
                   savedLineNo = common.lineno; }
              common.ASSIGN exp
                 { $$ = newStmtNode(common.AssignK);
                   $$->child[0] = $4;
                   $$->attr.name = savedName;
                   $$->common.lineno = savedLineNo;
                 }
            ;
read_stmt   : common.READ common.ID
                 { $$ = newStmtNode(common.ReadK);
                   $$->attr.name =
                     copyString(tokenString);
                 }
            ;
write_stmt  : common.WRITE exp
                 { $$ = newStmtNode(common.WriteK);
                   $$->child[0] = $2;
                 }
            ;
exp         : simple_exp common.LT simple_exp 
                 { $$ = newExpNode(common.OpK);
                   $$->child[0] = $1;
                   $$->child[1] = $3;
                   $$->attr.op = common.LT;
                 }
            | simple_exp common.EQ simple_exp
                 { $$ = newExpNode(common.OpK);
                   $$->child[0] = $1;
                   $$->child[1] = $3;
                   $$->attr.op = common.EQ;
                 }
            | simple_exp { $$ = $1; }
            ;
simple_exp  : simple_exp common.PLUS term 
                 { $$ = newExpNode(common.OpK);
                   $$->child[0] = $1;
                   $$->child[1] = $3;
                   $$->attr.op = common.PLUS;
                 }
            | simple_exp common.MINUS term
                 { $$ = newExpNode(common.OpK);
                   $$->child[0] = $1;
                   $$->child[1] = $3;
                   $$->attr.op = common.MINUS;
                 } 
            | term { $$ = $1; }
            ;
term        : term common.TIMES factor 
                 { $$ = newExpNode(common.OpK);
                   $$->child[0] = $1;
                   $$->child[1] = $3;
                   $$->attr.op = common.TIMES;
                 }
            | term common.OVER factor
                 { $$ = newExpNode(common.OpK);
                   $$->child[0] = $1;
                   $$->child[1] = $3;
                   $$->attr.op = common.OVER;
                 }
            | factor { $$ = $1; }
            ;
factor      : common.LPAREN exp common.RPAREN
                 { $$ = $2; }
            | common.NUM
                 { $$ = newExpNode(common.ConstK);
                   $$->attr.val = atoi(tokenString);
                 }
            | common.ID { $$ = newExpNode(common.IdK);
                   $$->attr.name =
                         copyString(tokenString);
                 }
            | error { $$ = common.NULL; }
            ;

%%

int yyerror(char * message)
{ fprintf(common.listing,"Syntax error at line %d: %s\n",common.lineno,message);
  fprintf(common.listing,"Current token: ");
  printToken(yychar,tokenString);
  common.Error = common.TRUE;
  return 0;
}

/* yylex calls getToken to make Yacc/Bison output
 * compatible with ealier versions of the TINY scanner
 */
static int yylex()
{ return getToken(); }

TreeNode * parse()
{ yyparse();
  return savedTree;
}

