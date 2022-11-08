/****************************************************/
/* File: parse.c                                    */
/* The parser implementation for the TINY compiler  */
/* Compiler Construction: Principles and Practice   */
/* Kenneth C. Louden                                */
/****************************************************/

const { ENDFILE, ERROR, IF, THEN, ELSE, END, 
  REPEAT, UNTIL, READ, WRITE,
  ID, NUM, ASSIGN, EQ, LT, PLUS, MINUS, TIMES, OVER,
  LPAREN, RPAREN, SEMI, TRUE, } = require("./globals.js");

const chooseStatement = {};
console.log(IF,ENDFILE,NUM)
chooseStatement[IF.toString()] = if_stmt;
chooseStatement[REPEAT.toString()] = repeat_stmt;
chooseStatement[ID.toString()] = assign_stmt;
chooseStatement[READ.toString()] = read_stmt;
chooseStatement[WRITE.toString()] = write_stmt;

    
let token; /* holds current token */

/* function prototypes for recursive calls */
/*
static TreeNode * stmt_sequence();
static TreeNode * statement();
static TreeNode * if_stmt();
static TreeNode * repeat_stmt();
static TreeNode * assign_stmt();
static TreeNode * read_stmt();
static TreeNode * write_stmt();
static TreeNode * exp();
static TreeNode * simple_exp();
static TreeNode * term();
static TreeNode * factor();

typedef struct treeNode
   { struct treeNode * child[MAXCHILDREN];
     struct treeNode * sibling;
     int lineno;
     NodeKind nodekind;
     union { StmtKind stmt; ExpKind exp;} kind;
     union { TokenType op;
             int val;
             char * name; } attr;
     ExpType type; / * for type checking of exps * /
   } TreeNode;

*/

function syntaxError(message)
{ 
  fprintf(listing,"\n>>> ", []);
  fprintf(listing,"Syntax error at line %d: %s",[globals.lineno,message]);
  globals.Error = TRUE;
}

function match(expected)
{ if (token  ===  expected) {
        token = getToken();
    } else {
    syntaxError("unexpected token -> ");
    printToken(token,tokenString);
    fprintf(listing,"      ", []);
  }
}

function stmt_sequence()
{ 
  let t = statement();
  let p = t;
  while ((token !== ENDFILE) && (token !== END) &&
         (token !== ELSE) && (token !== UNTIL))
  { let q;
    match(SEMI);
    q = statement();
    if (q !== NULL) {
      if (t === NULL) {
                        t = p = q;
      } else { /* now p cannot be NULL either */
      { p.sibling = q;
        p = q;
      }
    }
  }
  return t;
}

const if_stmt = () => { 
  const t = newStmtNode(IfK);
  match(IF);
  if (t !== NULL) {
                    t.child[0] = exp();
  }
  match(THEN);
  if (t !== NULL) {
                    t.child[1] = stmt_sequence();
  }
  if (token === ELSE) {
                        match(ELSE);
                        if (t !== NULL) {
                            t.child[2] = stmt_sequence();
                        }
  }
  match(END);
  return t;
}

const repeat_stmt = () => {
  const t = newStmtNode(RepeatK);
  match(REPEAT);
  if (t !== NULL) t.child[0] = stmt_sequence();
  match(UNTIL);
  if (t !== NULL) t.child[1] = exp();
  return t;
}

const assign_stmt = () => {
  const t = newStmtNode(AssignK);
  if ((t !== NULL) && (token === ID)) {
            t.attr.name = copyString(tokenString);
  }
  match(ID);
  match(ASSIGN);
  if (t !== NULL) {
                    t.child[0] = exp();
  }
  return t;
}

const read_stmt = () => {
  const t = newStmtNode(ReadK);
  match(READ);
  if ((t !== NULL) && (token === ID)) {
    t.attr.name = copyString(tokenString);
  }
  match(ID);
  return t;
}

const write_stmt = () => {
  const t = newStmtNode(WriteK);
  match(WRITE);
  if (t !== NULL) {
            t.child[0] = exp();
  }
  return t;
}

// Alternative to SWITCH Statement
const chooseStatement = {};
chooseStatement[IF.toString()] = if_stmt;
chooseStatement[REPEAT.toString()] = repeat_stmt;
chooseStatement[ID.toString()] = assign_stmt;
chooseStatement[READ.toString()] = read_stmt;
chooseStatement[WRITE.toString()] = write_stmt;

function statement()
{ 
  let t = NULL;
  const strToken = token.toString();
  if (strToken in chooseStatement) {
        t = chooseStatement[strToken]();
  } else {
              syntaxError("unexpected token -> ");
              printToken(token,tokenString);
              token = getToken();   
  }
  return t;
}

function exp()
{ 
  let t = simple_exp();
  if ((token === LT)||(token === EQ)) {
    const p = newExpNode(OpK);
    if (p !== NULL) {
      p.child[0] = t;
      p.attr.op = token;
      t = p;
    }
    match(token);
    if (t !== NULL)
      t.child[1] = simple_exp();
  }
  return t;
}

function simple_exp() {
  let t = term();
  while ((token === PLUS)||(token === MINUS)) {
    const p = newExpNode(OpK);
    if (p !== NULL) {
      p.child[0] = t;
      p.attr.op = token;
      t = p;
      match(token);
      t.child[1] = term();
    }
  }
  return t;
}

function term()
{ 
  let t = factor();
  while ((token === TIMES)||(token === OVER)) {
    const p = newExpNode(OpK);
    if (p !== NULL) {
      p.child[0] = t;
      p.attr.op = token;
      t = p;
      match(token);
      p.child[1] = factor();
    }
  }
  return t;
}

function factor_NUM(t, token) {
      t = newExpNode(ConstK);
      if ((t !== NULL) && (token === NUM)) {
        t.attr.val = atoi(tokenString);    
      }
      match(NUM);
      return t;
}

function factor_ID(t, token) {
      t = newExpNode(IdK);
      if ((t !== NULL) && (token === ID)) {
        t.attr.name = copyString(tokenString);
      };
      match(ID);    
      return t;
}

function factor_LPAREN(t, _) {
      match(LPAREN);
      t = exp();
      match(RPAREN);   
      return t;
}

// Alternative to SWITCH Statement
const chooseFactorRoutine = {};
chooseFactorRoutine[NUM.toString()] = factor_NUM;
chooseFactorRoutine[ID.toString()] = factor_ID;
chooseFactorRoutine[LPAREN.toString()] = factor_LPAREN;

function factor() {
  let t = NULL;
  const strToken = t.toString();
  if (strToken in chooseFactorRoutine) {
        t = chooseFactorRoutine[strToken]();
  } else {
      syntaxError("unexpected token -> ");
      printToken(token,tokenString);
      token = getToken();
  }
  return t;
}


/****************************************/
/* the primary function of the parser   */
/****************************************/
/* Function parse returns the newly 
 * constructed syntax tree
*/
function parse() {
  let t;
  token = getToken();
  t = stmt_sequence();
  if (token !== ENDFILE) {
    syntaxError("Code ends before file\n");
  }
  return t;
}}