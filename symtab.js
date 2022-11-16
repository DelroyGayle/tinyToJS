/****************************************************/
/* File: symtab.js                                  */
/* Symbol table implementation for the TINY compiler*/
/* (allows only one symbol table)                   */
/* Symbol table is implemented as a chained         */
/* hash table                                       */
/* Compiler Construction: Principles and Practice   */
/* Kenneth C. Louden                                */
/****************************************************/

// Shared and Global Variables
const common = require("./globals.js");
const { fprintf } = require('./globals.js')

/* the list of line numbers of the source 
 * code in which a variable is referenced
 
typedef struct LineListRec
   { int lineno;
     struct LineListRec * next;
   } * LineList;

/* The record in the bucket lists for
 * each variable, including name, 
 * assigned memory location, and
 * the list of line numbers in which
 * it appears in the source code
 
typedef struct BucketListRec
   { char * name;
     LineList lines;
     int memloc ; /* memory location for variable 
     struct BucketListRec * next;
   } * BucketList;
*/

/* Procedure st_insert inserts line numbers and
 * memory locations into the symbol table
 * loc = memory location is inserted only the
 * first time, otherwise ignored
 */
function st_insert(name, lineno, loc ) { 
    if (!common.symbolTable.has(name)) {
    /* variable not yet in table */
        const newLineNo = new Map();
        newLineNo.set("location",loc)
        newLineNo.set("linenos_list") = [lineno];
        common.symbolTable.set(name, newLineNo);
    } else { 
    /* found in table, so just add line number */
        const newEntry = common.symbolTable.get(name);
        newEntry.get("linenos_list").push(lineno);
            }
} /* st_insert */

/* Function st_lookup returns the memory 
 * location of a variable or -1 if not found
 */
function st_lookup (name) {
    if (!common.symbolTable.has(name)) {
            return -1
    }

    return common.symbolTable.get(name).get("location");
}

/* Procedure printSymTab prints a formatted 
 * listing of the symbol table contents 
 * to the listing file
*/
function printSymTab(listing) { 
  let i;
  fprintf(listing,"Variable Name  Location   Line Numbers\n");
  fprintf(listing,"-------------  --------   ------------\n");
  for (const [name, eachEntry] of common.symbolTable.entries) {
        fprintf(listing,"%-14s ",name);
        fprintf(listing,"%-8d  ",eachEntry.location);
        eachEntry.linenos_list.forEach( lineno => {
                fprintf(listing,"%4d ",lineno);
        });
        fprintf(listing,"\n");
  }
} /* printSymTab */
