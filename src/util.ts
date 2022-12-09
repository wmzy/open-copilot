// TODO: node v16.15.0 support fetch api
import fetch from "node-fetch";
import { CancellationToken } from "vscode";

export type FetchCodeCompletions = {
    completions: Array<string>
}

// const API_URL = 'http://localhost:8000/api/codegen'
const headers = { "Content-Type": "application/json" };

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchCodeCompletionTexts(prompt: string, API_URL: string, OUTPUT_MAX_LENGTH: string, token: CancellationToken): Promise<string[]> {
    await sleep(300);
    const controller = new AbortController();
    token.onCancellationRequested(() => controller.abort());
    // Send post request to inference API
    const res = await fetch(API_URL, {
        // @ts-expect-error 这个版本的 node 类型定义有问题？升级后再试。
        signal: controller.signal,
        method: "post",
        body: JSON.stringify({
            "inputs": prompt,
            "parameters": {
                "output_max_length": Number(OUTPUT_MAX_LENGTH)
            }
        }),
        headers: headers
    });
    const json = await res.json();
    if (Array.isArray(json)) {
        return json.map(r => r.generated_text.trimStart()).filter(t => t.trim());
    }
    else {
        throw new Error((json as {error: string}).error);
    }
}
