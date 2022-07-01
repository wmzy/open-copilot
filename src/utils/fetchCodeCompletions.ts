import fetch from "node-fetch";

export type FetchCodeCompletions = {
    completions: Array<string>
}

// const API_URL = 'http://localhost:8000/api/codegen'
const headers = { "Content-Type": "application/json" }

export async function fetchCodeCompletionTexts(prompt: string, API_URL: string, OUTPUT_MAX_LENGTH: string): Promise<FetchCodeCompletions> {
    // Send post request to inference API
    const res = await fetch(API_URL, {
        method: "post",
        body: JSON.stringify({
            "inputs": prompt,
            "parameters": {
                "output_max_length": Number(OUTPUT_MAX_LENGTH)
            }
        }),
        headers: headers
    })
    const json = await res.json()
    if (Array.isArray(json)) {
        const completions = Array<string>()
        for (let i=0; i < json.length; i++) {
            const completion =  json[i].generated_text.trimStart()
            if (completion.trim() === "") continue

            completions.push(
                completion
            )
        }
        console.log(completions)
        return { completions }
    }
    else {
        throw new Error(json["error"])
    }
}
