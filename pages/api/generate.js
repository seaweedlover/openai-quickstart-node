import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


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
  const systemMsg = req.body.systemMessage || '';
  const chatHistory = req.body.contextMessages || [];
  if (userMsg.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid animal",
      }
    });
    return;
  }

  let context = [{'role': 'system', content: systemMsg}, ...chatHistory, {'role': 'user', content: userMsg}];

  await getCompletionFromMessages(context);

  async function getCompletionFromMessages(messages) {
    try {
      
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
        temperature: 0.6,
      });
      const result = completion.data.choices[0].message.content;

      res.status(200).json({ result: result});

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
}
