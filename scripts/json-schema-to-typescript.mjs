
import {readFileSync} from "fs";
import { compile } from 'json-schema-to-typescript'

const items = JSON.parse(readFileSync(0, "utf-8"));
let output = "";
for (const item of items) {
  const result = await compile(item, undefined, {additionalProperties: false});
  output += result + "\n";
}

console.log(output);