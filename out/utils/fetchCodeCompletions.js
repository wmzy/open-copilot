"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCodeCompletionTexts = void 0;
const node_fetch_1 = require("node-fetch");
// const API_URL = 'http://localhost:8000/api/codegen'
const headers = { "Content-Type": "application/json" };
function fetchCodeCompletionTexts(prompt, API_URL, OUTPUT_MAX_LENGTH) {
    return __awaiter(this, void 0, void 0, function* () {
        // Send post request to inference API
        const res = yield (0, node_fetch_1.default)(API_URL, {
            method: "post",
            body: JSON.stringify({
                "inputs": prompt,
                "parameters": {
                    "output_max_length": Number(OUTPUT_MAX_LENGTH)
                }
            }),
            headers: headers
        });
        const json = yield res.json();
        if (Array.isArray(json)) {
            const completions = Array();
            for (let i = 0; i < json.length; i++) {
                const completion = json[i].generated_text.trimStart();
                if (completion.trim() === "")
                    continue;
                completions.push(completion);
            }
            console.log(completions);
            return { completions };
        }
        else {
            throw new Error(json["error"]);
        }
    });
}
exports.fetchCodeCompletionTexts = fetchCodeCompletionTexts;
