import { run as runRepl } from "./repl";
import { run as runPipeline } from "./interpreterPipeline";
import fs from "fs";

// In the case of no arguments, run the repl
if (process.argv.length === 1) {
    runRepl();
} else if (process.argv.length === 3) {
    const filename = process.argv[2];
    fs.readFile(filename, 'utf8', (err, data) => {
        if (err) {
            console.log(`Could not open file ${filename}. Aborting...`);
            return;
        }
        runPipeline(data);
    });
} else {
    console.log("Usage: monkey (<filename>)");
}

    
    