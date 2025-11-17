import { TargetLanguageLevel } from "../../models/app-settings";
import { JSONSchema, LLMChatMessage, LLMRequest } from "../interfaces";

export const SYSTEM_PROMPT_CONVERSATION_STARTER = function (
    language: string,
    languageLevel: TargetLanguageLevel,
    inspirationWord: string
): LLMChatMessage {
    let levelClause = "";

    if (languageLevel === "low") {
        levelClause = `Your responses should be understandable for beginner learners of ${language}.`;
    }
    if (languageLevel === "medium") {
        levelClause = `Your responses should be understandable for non native speakers of ${language}.`;
    }
    if (languageLevel === "high") {
        levelClause = `The user is an advanced level learner of ${language}, so you do not need to avoid using advanced vocabulary.`;
    }

    return {
        role: "system",
        content: `You are a conversation partner for the user who is trying to practice speaking ${language}. ${levelClause}

The topic of the conversation should be about "${inspirationWord}". Only if the conversation is not remotely related to "${inspirationWord}" in the slightlest, the AI should try to change the topic. Loosely related topics are fine.

Keep responses concise and engaging. Focus on asking the user questions and engaging in conversation.
Use the character set appropriate for the ${language} language.
Do not include any translations.
Do not complement the user on their language skill or offer any corrections.`,
    };
};

export interface ConversationAnalysis {
    noFeedback: boolean;
    corrections?: {
        messageIndex: number;
        original: string;
        suggestedText: string;
        explanation: string;
    }[];
}

export const PROMPT_CONVERSATION_ANALYSIS = function (language: string, history: LLMChatMessage[]): LLMRequest {
    const messages = history
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((message, index) => {
            if (message.role === "assistant") {
                return `#${index} AI: ${message.content}`;
            }
            return `#${index} User: ${message.content}`;
        })
        .join("\n");

    return {
        prompt: `Analyze the following conversation in the ${language} language and give a feedback in JSON format.

Only analyze the content of the user's messages. Do not analyze the content of the AI's messages.

${messages}

----------------------

Corrections should be about mistakes in the language used by the user, such as grammar, spelling, word choice, etc. Do not make corrections about the content or accuracy of the user's comments.

Do not make trivial corrections. Do not try to correct the users level of politeness, match your corrections to the intent of the user. If you have no suggestions to make, set noFeedback to true.

The JSON format is as follows:
{
    "noFeedback": boolean,
    "corrections": {
        "messageIndex": number,
        "original": string,
        "suggestedText": string,
        "explanation": string
    }[]
}`,
        temperature: 0.5,
        format: "json",
        jsonSchema: CONVERSATION_ANALYSIS_SCHEMA,
    };
};

const CONVERSATION_ANALYSIS_SCHEMA: JSONSchema = {
    type: "object",
    properties: {
        noFeedback: {
            type: "boolean",
            description: "True if there are no corrections to suggest"
        },
        corrections: {
            type: "array",
            description: "Array of corrections for user messages",
            items: {
                type: "object",
                properties: {
                    messageIndex: {
                        type: "number",
                        description: "Index of the message being corrected"
                    },
                    original: {
                        type: "string",
                        description: "The original text that needs correction"
                    },
                    suggestedText: {
                        type: "string",
                        description: "The suggested corrected text"
                    },
                    explanation: {
                        type: "string",
                        description: "Explanation of why this correction is suggested"
                    }
                },
                required: ["messageIndex", "original", "suggestedText", "explanation"],
                additionalProperties: false
            }
        }
    },
    required: ["noFeedback"],
    additionalProperties: false
}
