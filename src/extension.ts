import * as vscode from 'vscode'
import CSConfig from './config'
import { fetchCodeCompletionTexts } from './utils/fetchCodeCompletions'

// QHD: some code refer to
// https://github.com/kirillpanfile/ai-autocomplete/blob/cf2de2f4a32a0aee77d040364507eeef4349838c/src/extension.js

// Make an output channel for debug
const print = vscode.window.createOutputChannel("codegen")

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand(
        'extension.codegen-settings',
        () => {
            vscode.window.showInformationMessage('Show settings')
        }
    )

    context.subscriptions.push(disposable)


    function sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    let lastRequest = null

    const provider: vscode.InlineCompletionItemProvider<vscode.InlineCompletionItem> = {
        provideInlineCompletionItems: async (document, position, context, token) => {
            // Grab the api key from the extension's config
            const configuration = vscode.workspace.getConfiguration('', document.uri)
            const API_KEY = configuration.get("conf.resource.codegen", "http://localhost:8000/api/codegen")

            // on request last change
            let requestId = new Date().getTime()
            lastRequest = requestId
            await sleep(1000)
            if (lastRequest !== requestId) {
                return { items: [] }
            }

            vscode.comments.createCommentController
            const textBeforeCursor = document.getText()
            if (textBeforeCursor.trim() === "") {
                return { items: [] }
            }

            const currLineBeforeCursor = document.getText(
                new vscode.Range(position.with(undefined, 0), position)
            )

            // Check if user's state meets one of the trigger criteria
            if (CSConfig.SEARCH_PHARSE_END.includes(textBeforeCursor[textBeforeCursor.length - 1]) || currLineBeforeCursor.trim() === "") {
                let rs = null

                try {
                    // Fetch the code completion based on the text in the user's document
                    rs = await fetchCodeCompletionTexts(textBeforeCursor, API_KEY)
                } catch (err) {
                    if (err instanceof Error) {
                        vscode.window.showErrorMessage(err.toString())
                    }
                    return { items: [] }
                }

                if (!rs) {
                    return { items: [] }
                }

                // Add the generated code to the inline suggestion list
                const items = new Array<vscode.InlineCompletionItem>()
                for (const text of rs.completions) {
                    const insertText = text.replace(/\\n/g, '\n');
                    items.push({
                        insertText,
                        range: new vscode.Range(position.translate(0, text.length), position),
                    })
                }
                print.appendLine(JSON.stringify(items))
                return { items }
            }
            return { items: [] }
        },
    }

    vscode.languages.registerInlineCompletionItemProvider({ pattern: "**" }, provider)
}
