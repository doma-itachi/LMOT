// 最小サンプル

import { generateText, Output } from "ai";
import { readFileSync } from "fs";
import { codexCli } from "ai-sdk-provider-codex-cli";
import z from "zod";
import { prompts } from "./prompts";
import { bench } from "yukari-util";
import { groq } from "@ai-sdk/groq";
import { openai } from "@ai-sdk/openai";

const image = readFileSync("ss.png");

const zTranslateResult = z.object({
  originalLanguage: z.string(),
  original: z.string(),
  translated: z.string(),
});

await bench(async () => {
  const result = await generateText({
    model: codexCli("gpt-5.1-codex-mini", {
      reasoningEffort: "low",
    }),
    // model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
    output: Output.object({
      schema: zTranslateResult,
    }),
    prompt: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompts.translate,
          },
          {
            type: "image",
            image,
          },
        ],
      },
    ],
  });

  console.log(result.output);
}, "generateText");
