import { JSONSchema, LLMRequest } from "../interfaces";
import { TargetLanguageLevel } from "../../models/app-settings";

export const PROMPT_COMP_SENTENCE = function (
    language: string,
    languageLevel: TargetLanguageLevel,
    inspirationWord: string
): LLMRequest {
    let levelClause = "";

    if (languageLevel === "low") {
        levelClause = `The text should be understandable for beginner learners of ${language}.`;
    }
    if (languageLevel === "medium") {
        levelClause = `The text should be understandable for non native ${language}.`;
    }

    return {
        prompt: `Generate a story approximately a paragraph in length using the word "${inspirationWord}" in the ${language} language. You do not have to use this word in the sentence. Use the character set appropriate for the ${language} language. Only return the text of the sentences. ${levelClause}

Do not include any other text except for the generated sentences.
Do not include any translations.`,
        temperature: 0.5,
    };
};

export const PROMPT_COMP_VALIDATE = function (language: string, sentence: string, input: string): LLMRequest {
    return {
        prompt: `Grade the result of a language comprehension question.

Given the following sentences in ${language}:
${sentence}

Does the following statement show that the user had some comprehension of the above text? The statement may be brief and does not need to be very detailed. The statement is:
${input}

Respond using JSON format. The JSON format is as follows:
{
    "valid": boolean,
    "explanation": string
}`,
        temperature: 0,
        format: "json",
        jsonSchema: COMPREHENSION_RESPONSE_SCHEMA,
    };
};

const COMPREHENSION_RESPONSE_SCHEMA: JSONSchema = {
    type: "object",
    properties: {
        valid: {
            type: "boolean",
            description: "Whether the user's response shows comprehension of the text"
        },
        explanation: {
            type: "string",
            description: "Explanation of why the response is valid or invalid"
        }
    },
    required: ["valid", "explanation"],
    additionalProperties: false
};
