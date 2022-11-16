/****************************************************/
/* File: analyse.js                                 */
/* Semantic analyzer implementation                 */
/* for the TINY compiler                            */
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

/* Procedure traverse is a generic recursive 
 * syntax tree traversal routine:
 * it applies preProc in preorder and postProc 
 * in postorder to tree pointed to by t
*/
function traverse( t, preProc, postProc) { 
    if (t !== common.NULL && t !== undefined) {
        preProc(t);
        for ( let i=0; i < MAXCHILDREN; i++) {
            traverse(t.child[i],preProc,postProc);
        }
        postProc(t);
        traverse(t.sibling,preProc,postProc);
    }
}

/* nullProc is a do-nothing procedure to 
 * generate preorder-only or postorder-only
 * traversals from traverse
*/
function nullProc(t)
{ 
}

/*
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

/* 'common.location' is a counter for variable memory locations
    Begins with the value zero */

function addToSymbolTable (t) {
    if (st_lookup(t.attr.name) === -1) {
    /* not yet in table, so treat as new definition */
              st_insert(t.attr.name,t.lineno,common.location++);
    } else {
    /* already in table, so ignore location, 
       add line number of use only */ 
              st_insert(t.attr.name,t.lineno,0);
    }    
}

/* Procedure insertNode inserts 
 * identifiers stored in t into 
 * the symbol table 
*/
function insertNode(t)
{ 
    let theNodeKind = t.nodekind;
    if (theNodeKind === StmtK) {

        let theKindOfStmt = t.kind.stmt;
        if (theKindOfStmt === AssignK || theKindOfStmt === ReadK) {
              addToSymbolTable(t);
        } else if (theNodeKind === ExpK) {
             if (t.kind.exp === IdK) {
               addToSymbolTable(t);
            }
        }
    }
}

/* Function buildSymtab constructs the symbol 
 * table by preorder traversal of the syntax tree
*/
function buildSymtab(syntaxTree)
{ traverse(syntaxTree,insertNode,nullProc);
  if (TraceAnalyse)
  { fprintf(listing,"\nSymbol table:\n\n");
    printSymTab(listing);
  }
}

function typeError(t, message)
{ fprintf(listing,"Type error at line %d: %s\n",[t.lineno,message]);
  Error = common.TRUE;
}

function checkOp(t) {
          if ((t.child[0].type !== typeInteger) ||
              (t.child[1].type !== typeInteger)) {
                    typeError(t,"Op applied to non-integer");
          }
          if ((t.attr.op === common.EQ) || (t.attr.op === common.LT)) {
            t.type = typeBoolean;
          } else {
            t.type = typeInteger;
          }
}

function constOrId(t) {
        t.type = typeInteger;
}

function checkIF(t) {
          if (t.child[0].type === typeInteger) {
            typeError(t.child[0],"if test is not typeBoolean");
          }
}

function checkAssignment(t) {
          if (t.child[0].type !== typeInteger) {
            typeError(t.child[0],"assignment of non-integer value");
          }
}

function checkWrite(t) {
          if (t.child[0].type !== typeInteger) {
            typeError(t.child[0],"write of non-integer value");
          }
}

function checkRepeat(t) {
          if (t.child[1].type === typeInteger) {
            typeError(t.child[1],"repeat test is not typeBoolean");
          }
}

  // Alternative to SWITCH Statement
  const chooseValidation = {};
  chooseValidation[common.OpK.toString()] = checkOp;
  chooseValidation[common.ConstK.toString()] = constOrId;
  chooseValidation[common.IdK.toString()] = constOrId;
  chooseValidation[common.IfK.toString()] = checkIF;
  chooseValidation[common.AssignK.toString()] = checkAssignment;
  chooseValidation[common.WriteK.toString()] = checkWrite;
  chooseValidation[common.RepeatK.toString()] = checkRepeat;

/* Procedure checkNode performs
 * type checking at a single tree node
*/
function checkNode(t) { 
    let theString = t.kind.exp.toString();
    if (theString in chooseValidation) {
        if ([OpK, ConstK, Idk].includes.t.nodekind ) {
                chooseValidation[theString](t)
        } else if ([IfK, AssignK, WriteK, RepeatK].includes.t.kind.stmt ) {
                chooseValidation[theString](t)
        }
    }
}

/* Procedure typeCheck performs type checking 
 * by a postorder syntax tree traversal
*/
function typeCheck(syntaxTree)
{ 
    traverse(syntaxTree,nullProc,checkNode);
}
