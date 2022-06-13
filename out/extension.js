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
exports.activate = void 0;
const vscode = require("vscode");
const config_1 = require("./config");
const fetchCodeCompletions_1 = require("./utils/fetchCodeCompletions");
// QHD: some code refer to
// https://github.com/kirillpanfile/ai-autocomplete/blob/cf2de2f4a32a0aee77d040364507eeef4349838c/src/extension.js
// Make an output channel for debug
const print = vscode.window.createOutputChannel("codegen");
function activate(context) {
    const disposable = vscode.commands.registerCommand('extension.codegen-settings', () => {
        vscode.window.showInformationMessage('Show settings');
    });
    context.subscriptions.push(disposable);
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    let lastRequest = null;
    const provider = {
        provideInlineCompletionItems: (document, position, context, token) => __awaiter(this, void 0, void 0, function* () {
            // Grab the api key from the extension's config
            const configuration = vscode.workspace.getConfiguration('', document.uri);
            const API_KEY = configuration.get("conf.resource.codegen", "http://localhost:8000/api/codegen-t5");
            // on request last change
            let requestId = new Date().getTime();
            lastRequest = requestId;
            yield sleep(1000);
            if (lastRequest !== requestId) {
                return { items: [] };
            }
            vscode.comments.createCommentController;
            const textBeforeCursor = document.getText();
            if (textBeforeCursor.trim() === "") {
                return { items: [] };
            }
            const currLineBeforeCursor = document.getText(new vscode.Range(position.with(undefined, 0), position));
            // Check if user's state meets one of the trigger criteria
            if (config_1.default.SEARCH_PHARSE_END.includes(textBeforeCursor[textBeforeCursor.length - 1]) || currLineBeforeCursor.trim() === "") {
                let rs = null;
                try {
                    // Fetch the code completion based on the text in the user's document
                    rs = yield (0, fetchCodeCompletions_1.fetchCodeCompletionTexts)(textBeforeCursor, API_KEY);
                }
                catch (err) {
                    if (err instanceof Error) {
                        vscode.window.showErrorMessage(err.toString());
                    }
                    return { items: [] };
                }
                if (!rs) {
                    return { items: [] };
                }
                // Add the generated code to the inline suggestion list
                const items = new Array();
                for (const text of rs.completions) {
                    const insertText = text.replace(/\\n/g, '\n');
                    items.push({
                        insertText,
                        range: new vscode.Range(position.translate(0, text.length), position),
                    });
                }
                print.appendLine(JSON.stringify(items));
                return { items };
            }
            return { items: [] };
        }),
    };
    vscode.languages.registerInlineCompletionItemProvider({ pattern: "**" }, provider);
}
exports.activate = activate;
