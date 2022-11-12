/****************************************************/
/* File: parse.js                                   */
/* The parser implementation for the TINY compiler  */
/* Compiler Construction: Principles and Practice   */
/* Kenneth C. Louden                                */
/****************************************************/

/*
   A token is generated via the Parsing process and kept in a tree structure.
   The structure of each tree node keeps the token information is as follows:
   1) Up to 'MAXCHILDREN = 3' children      ==> .child[0-2]
   2) A sibling                             ==> .sibling
   3) Source Line Number                    ==> .lineno
   4) Its 'kind' whether statement or expression	
                                            ==> .kind, .kind.stmt, .kind.exp
   5) The token attribute which consists of ==> .attrib 					 
   6) The attribute's operator type         ==> .attrib.op					 
   7) The attribute's value                 ==> .attrib.val
   8) The attribute's name                  ==> .attrib.name
   9) Expression type                       ==> .type
*/
  

// Shared and Global Variables
const common = require("./globals.js");

let token; /* holds current token */

function syntaxError(message) {
  fprintf(common.listing, "\n>>> ", []);
  fprintf(common.listing, "Syntax error at line %d: %s", [
    common.lineno,
    message,
  ]);
  common.Error = common.TRUE;
}

function match(expected) {
  if (token === expected) {
    token = getToken();
  } else {
    syntaxError("unexpected token -> ");
    printToken(token, tokenString);
    fprintf(common.listing, "      ", []);
  }
}

function stmt_sequence() {
  let t = statement();
  let p = t;
  while (
    token !== common.ENDFILE &&
    token !== common.END &&
    token !== common.ELSE &&
    token !== common.UNTIL
  ) {
    let q;
    match(common.SEMI);
    q = statement();
    if (q !== common.NULL) {
      if (t === common.NULL) {
        t = p = q;
      } else {
        /* now p cannot be NULL either */
        {
          p.sibling = q;
          p = q;
        }
      }
    }
  }
  return t;
}

  const if_stmt = () => {
    const t = newStmtNode(common.IfK);
    match(common.IF);
    if (t !== common.NULL) {
      t.child[0] = exp();
    }
    match(common.THEN);
    if (t !== common.NULL) {
      t.child[1] = stmt_sequence();
    }
    if (token === common.ELSE) {
      match(common.ELSE);
      if (t !== common.NULL) {
        t.child[2] = stmt_sequence();
      }
    }
    match(common.END);
    return t;
  };

  const repeat_stmt = () => {
    const t = newStmtNode(common.RepeatK);
    match(common.REPEAT);
    if (t !== common.NULL) t.child[0] = stmt_sequence();
    match(common.UNTIL);
    if (t !== common.NULL) t.child[1] = exp();
    return t;
  };

  const assign_stmt = () => {
    const t = newStmtNode(common.AssignK);
    if (t !== common.NULL && token === common.ID) {
      t.attr.name = tokenString;
    }
    match(common.ID);
    match(common.ASSIGN);
    if (t !== common.NULL) {
      t.child[0] = exp();
    }
    return t;
  };

  const read_stmt = () => {
    const t = newStmtNode(common.ReadK);
    match(common.READ);
    if (t !== common.NULL && token === common.ID) {
      t.attr.name = tokenString;
    }
    match(common.ID);
    return t;
  };

  const write_stmt = () => {
    const t = newStmtNode(common.WriteK);
    match(common.WRITE);
    if (t !== common.NULL) {
      t.child[0] = exp();
    }
    return t;
  };

  // Alternative to SWITCH Statement
  const chooseStatement = {};
  chooseStatement[common.IF.toString()] = if_stmt;
  chooseStatement[common.REPEAT.toString()] = repeat_stmt;
  chooseStatement[common.ID.toString()] = assign_stmt;
  chooseStatement[common.READ.toString()] = read_stmt;
  chooseStatement[common.WRITE.toString()] = write_stmt;

  function statement() {
    let t = common.NULL;
    const strToken = token.toString();
    if (strToken in chooseStatement) {
      t = chooseStatement[strToken]();
    } else {
      syntaxError("unexpected token -> ");
      printToken(token, tokenString);
      token = getToken();
    }
    return t;
  }

  function exp() {
    let t = simple_exp();
    if (token === common.LT || token === common.EQ) {
      const p = newExpNode(common.OpK);
      if (p !== common.NULL) {
        p.child[0] = t;
        p.attr.op = token;
        t = p;
      }
      match(token);
      if (t !== common.NULL) t.child[1] = simple_exp();
    }
    return t;
  }

  function simple_exp() {
    let t = term();
    while (token === common.PLUS || token === common.MINUS) {
      const p = newExpNode(common.OpK);
      if (p !== common.NULL) {
        p.child[0] = t;
        p.attr.op = token;
        t = p;
        match(token);
        t.child[1] = term();
      }
    }
    return t;
  }

  function term() {
    let t = factor();
    while (token === common.TIMES || token === common.OVER) {
      const p = newExpNode(common.OpK);
      if (p !== common.NULL) {
        p.child[0] = t;
        p.attr.op = token;
        t = p;
        match(token);
        p.child[1] = factor();
      }
    }
    return t;
  }

  function factor_num(t, token) {
    t = newExpNode(common.ConstK);
    if (t !== common.NULL && token === common.NUM) {
      t.attr.val = Number(tokenString);
    }
    match(common.NUM);
    return t;
  }

  function factor_ID(t, token) {
    t = newExpNode(common.IdK);
    if (t !== common.NULL && token === common.ID) {
      t.attr.name = tokenString;
    }
    match(common.ID);
    return t;
  }

  function factor_LPAREN(t, _) {
    match(common.LPAREN);
    t = exp();
    match(common.RPAREN);
    return t;
  }

  // Alternative to SWITCH Statement
  const chooseFactorRoutine = {};
  chooseFactorRoutine[common.NUM.toString()] = factor_num;
  chooseFactorRoutine[common.ID.toString()] = factor_ID;
  chooseFactorRoutine[common.LPAREN.toString()] = factor_LPAREN;

  function factor() {
    let t = common.NULL;
    const strToken = t.toString();
    if (strToken in chooseFactorRoutine) {
      t = chooseFactorRoutine[strToken]();
    } else {
      syntaxError("unexpected token -> ");
      printToken(token, tokenString);
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
    if (token !== common.ENDFILE) {
      syntaxError("Code ends before file\n");
    }
    return t;
}
