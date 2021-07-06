# Monkey Programming Language
A Typescript **tree-walk interpreter** for the Monkey Programming Language (As specified in the "Writing an Interpreter in Go" book).

# Features
- Dynamic type system (only supporting booleans, integers, and strings at the moment)
- First-order functions
- Clojures

# Build & Run
## Requirements
- npm
## Building the project
```
$ npm install
$ npm build
```
## Running
You can either run the script with a file on in REPL mode.
```
$ npm start # REPL mode
$ npm start <filepath> # to interpret an actual monkey file
```
You can run the example file with the command `npm start example.mnk`.
