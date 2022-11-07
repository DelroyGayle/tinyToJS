/****************************************************/
/* File: tiny.js                                    */
/* Main program for TINY compiler                   */
/* Compiler Construction: Principles and Practice   */
/* Kenneth C. Louden                                */
/****************************************************/

const globals = require("./globals.js");


/* set NO_PARSE to TRUE to get a scanner-only compiler */
const NO_PARSE = TRUE;

/* set NO_ANALYZE to TRUE to get a parser-only compiler */
const NO_ANALYZE = TRUE;

/* set NO_CODE to TRUE to get a compiler that does not
 * generate code
 */
const NO_CODE = TRUE;

const scan = require("./scan.js");

/* allocate global variables */
const lineno = 0;
let source;
let listing;
let code;
a
/* allocate and set tracing flags */
const EchoSource = FALSE;
const TraceScan = FALSE;
const TraceParse = FALSE;
const TraceAnalyze = FALSE;
const TraceCode = FALSE;

const Error = FALSE;

function main( argc, argv )
{ let syntaxTree;
  let pgm; /* source code file name */
  if (argc != 2)
    { fprintf(stderr,"usage: %s <filename>\n",argv[0]);
      exit(1);
    }
  strcpy(pgm,argv[1]) ;
  if (strchr (pgm, '.') == NULL)
     strcat(pgm,".tny");
  source = fopen(pgm,"r");
  if (source==NULL)
  { fprintf(stderr,"File %s not found\n",pgm);
    exit(1);
  }
  listing = stdout; /* send listing to screen */
  fprintf(listing,"\nTINY COMPILATION: %s\n",pgm);
#if NO_PARSE
  while (getToken()!=ENDFILE);
#else
  syntaxTree = parse();
  if (TraceParse) {
    fprintf(listing,"\nSyntax tree:\n");
    printTree(syntaxTree);
  }
#if !NO_ANALYZE
  if (! Error)
  { if (TraceAnalyze) fprintf(listing,"\nBuilding Symbol Table...\n");
    buildSymtab(syntaxTree);
    if (TraceAnalyze) fprintf(listing,"\nChecking Types...\n");
    typeCheck(syntaxTree);
    if (TraceAnalyze) fprintf(listing,"\nType Checking Finished\n");
  }
#if !NO_CODE
  if (! Error)
  { char * codefile;
    int fnlen = strcspn(pgm,".");
    codefile = (char *) calloc(fnlen+4, sizeof(char));
    strncpy(codefile,pgm,fnlen);
    strcat(codefile,".tm");
    code = fopen(codefile,"w");
    if (code == NULL)
    { printf("Unable to open %s\n",codefile);
      exit(1);
    }
    codeGen(syntaxTree,codefile);
    fclose(code);
  }
#endif
#endif
#endif
  fclose(source);
  return 0;
}

