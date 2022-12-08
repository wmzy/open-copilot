import * as vscode from 'vscode';
import { fetchCodeCompletionTexts } from './util';

// QHD: some code refer to
// https://github.com/kirillpanfile/ai-autocomplete/blob/cf2de2f4a32a0aee77d040364507eeef4349838c/src/extension.js

const SEARCH_END = ['.', ',', '{', '(', ' ', '-', '_', '+', '-', '*', '=', '/', '?', '<', '>'];
// Make an output channel for debug
const print = vscode.window.createOutputChannel('open-copilot');

export function activate(context: vscode.ExtensionContext) {
  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const provider: vscode.InlineCompletionItemProvider = {
    provideInlineCompletionItems: async (
      document,
      position,
      context,
      token
    ) => {
      // Grab the api key from the extension's config
      const configuration = vscode.workspace.getConfiguration('', document.uri);
      const API_KEY = configuration.get(
        'open-copilot.server',
        'http://localhost:7104/generate_multi'
      );
      const OUTPUT_MAX_LENGTH = configuration.get(
        'open-copilot.maxLines',
        '18'
      );


      const textBeforeCursor = document.getText(
        new vscode.Range(position.with(0, 0), position)
      );
      if (textBeforeCursor.trim() === '') {
        return { items: [] };
      }

      const currLineBeforeCursor = document.getText(
        new vscode.Range(position.with(undefined, 0), position)
      );

      // Check if user's state meets one of the trigger criteria
      if (
        SEARCH_END.includes(
          textBeforeCursor[textBeforeCursor.length - 1]
        ) ||
        currLineBeforeCursor.trim() === ''
      ) {
        try {
          // Fetch the code completion based on the text in the user's document
          const completions = await fetchCodeCompletionTexts(
            textBeforeCursor,
            API_KEY,
            OUTPUT_MAX_LENGTH,
            token
          );
          // Add the generated code to the inline suggestion list
          const items = completions.map(text => {
            const insertText = text.replace(/\\n/g, '\n');
            return ({
              insertText,
              range: new vscode.Range(
                position.translate(0, text.length),
                position
              ),
            }) as vscode.InlineCompletionItem;
          });
          print.appendLine(JSON.stringify(items));
          return { items };
        } catch (err) {
          if (err instanceof Error) {
            vscode.window.showErrorMessage(err.toString());
          }
        }
      }
      return { items: [] };
    },
  };

  vscode.languages.registerInlineCompletionItemProvider(
    { pattern: '**' },
    provider
  );
}
