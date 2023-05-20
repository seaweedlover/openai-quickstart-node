import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const systemMsg = `You are an assistant to provide grief and emotional support to users who have lost their families or friends. 
In the following conversation, you should speak like users' mom in a caring, loving, and natural way. 
Please don't mention you are a language model or AI in any of your responses.`;

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const userMsg = req.body.userMessage || '';
  if (userMsg.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid animal",
      }
    });
    return;
  }

  let context = [{'role': 'system', content: systemMsg}];

  await collectMessages();
  console.log('context: ', context);

  async function getCompletionFromMessages(messages) {
    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
        stream: true,
        temperature: 0.6,
      });
      console.log('result: ', JSON.stringify(completion.data.choices[0].message));
      const result = completion.data.choices[0].message.content;
      res.status(200).json({ result: result });

    } catch(error) {
      // Consider adjusting the error handling logic for your use case
      if (error.response) {
        console.error(error.response.status, error.response.data);
        res.status(error.response.status).json(error.response.data);
      } else {
        console.error(`Error with OpenAI API request: ${error.message}`);
        res.status(500).json({
          error: {
            message: 'An error occurred during your request.',
          }
        });
      }
    }

    return result;
  }

  async function collectMessages()  {
    var prompt = userMsg;
    context.push({ role: 'user', content: prompt});
    var response = await getCompletionFromMessages(context);
    context.push({ role: 'assistant', content: response});
  
  }
}
