const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");

const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

const debtsPath = path.resolve(__dirname, "contracts", "Debts.sol");
const source = fs.readFileSync(debtsPath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    "Debts.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

// const aa = JSON.parse(solc.compile(JSON.stringify(input))).contracts[
//     'Debts.sol'
//   ].Debts;

//   console.log(aa);
const output = JSON.parse(solc.compile(JSON.stringify(input))).contracts[
  "Debts.sol"
].Debts;

fs.ensureDirSync(buildPath);


  fs.outputJsonSync(
    path.resolve(buildPath, 'Debts' + ".json"),
    output
  );

