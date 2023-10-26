import { OpenAI } from 'openai';
import readline from 'readline';

// OpenAI APIキーを設定
const openai = new OpenAI({
  apiKey: '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', // defaults to process.env["OPENAI_API_KEY"]
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const SYSTEM_PROMPT = `
You are an excellent and friendly engineering supporter.
`

async function generateCode(prompt: string) {
  // OpenAIのAPIを使用してコードを生成
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{role: 'system', content: SYSTEM_PROMPT },{role: 'user', content: prompt }],
    temperature: 0.5,
  });

  // 生成されたコードを返す
  return response.choices[0].message.content as string;
}

async function main() {
  let code = '';
  while (true) {
    // ユーザーからの入力を受け取る
    const userInput = await new Promise(resolve => {
      rl.question('What code do you want to generate or update? \n', resolve);
    }) as string;

    // 入力が'quit'の場合、ループを終了
    if (userInput.toLowerCase() === 'quit') {
      break;
    }

    const prompt = `
Source code according to the user's wishes and existing code.
If there are any required library installations, etc., please let us know that as well.

User Request:
${userInput}

${code !== '' && 'Existing code:'}
${code}

Please output only Json that matches the following format:
{
  "code": "[source code]",
  "advice": "[supplementary explanations(string)]"
}

Please use \\n for line breaks so that they can be parsed by Json.parse.
Please output the source code in an executable language, with supplementary explanations in Japanese.
`

    // コードを生成または更新
    const responce = await generateCode(prompt);

    const responceJson = JSON.parse(responce);

    code = responceJson.code;
    const advice = responceJson.advice;

const terminalOutput = `
コード：
${code}

アドバイス：
${advice}

#####################
`
    // 生成または更新されたコードを出力
    console.log(terminalOutput);
  }

  rl.close();
}

main().catch(console.error);