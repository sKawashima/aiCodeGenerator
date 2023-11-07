import { OpenAI } from 'openai';
import readline from 'readline';
import dotenv from 'dotenv';
import { highlight } from'cli-highlight';

dotenv.config();

// OpenAI APIキーを設定
const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"]
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
    model: "gpt-4-1106-preview",
    messages: [{role: 'system', content: SYSTEM_PROMPT },{role: 'user', content: prompt }],
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  // 生成されたコードを返す
  return response.choices[0].message.content as string;
}

async function main() {
  let code = '';
  console.log('SYSTEM> 何のコードを生成しますか？')
  while (true) {
    // ユーザーからの入力を受け取る
    const userInput = await new Promise(resolve => {
      rl.question('YOU> ', resolve);
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

    const outputResponce = async () => {
      try{
    const responce = await generateCode(prompt);
    const responceJson = JSON.parse(responce);

    code = responceJson.code;
    const advice = responceJson.advice;

    const terminalOutput = `
SYSTEM> コード：

${highlight(code)}

SYSTEM> ${advice}

SYSTEM> 他にリクエストはありますか？終了させる場合は'quit'と入力してください。
`
    // 生成または更新されたコードを出力
    console.log(terminalOutput);
      }catch{
        console.log('SYSTEM> エラー。リトライします。')
        await outputResponce()
      }
    }

    await outputResponce()
  }
  rl.close();
}

main().catch(console.error);
