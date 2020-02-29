const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

/**
 * delete 'build' folder
 * compile .sol file
 * create two file into 'build' folder
 * 1. EducationLoan.json
 * 2. CreateLoan.json
 */

// 'build' folder path
const buildPath = path.resolve(__dirname, 'build');
// source contract file path
const sourcePath = path.resolve(__dirname, 'contracts', 'EducationLoan.sol');

fs.removeSync(buildPath);

const source = fs.readFileSync(sourcePath, 'utf8');

const output = solc.compile(source, 1).contracts;

fs.ensureDirSync(buildPath);

for(let contract in output){

    fs.outputJSONSync(
        path.resolve(buildPath, `${contract.substring(1)}.json`),
        output[contract]
    );
}
