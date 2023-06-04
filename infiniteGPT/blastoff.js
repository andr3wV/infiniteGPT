const openai = require('openai');
const gptTokenizer = require('gpt-tokenizer');
const fs = require('fs');

(async () => {
  // Add your own OpenAI API key
  openai.apiKey = 'sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

  const loadText = (filePath) => {
    return fs.readFileSync(filePath, 'utf-8');
  };

  const saveToFile = (responses, outputFile) => {
    fs.writeFileSync(outputFile, responses.join('\n'));
  };

  const callOpenaiApi = async (chunk) => {
    try {
      const response = await openai.ChatCompletion.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'PASS IN ANY ARBITRARY SYSTEM VALUE TO GIVE THE AI AN IDENITY',
          },
          { role: 'user', content: `YOUR DATA TO PASS IN: ${chunk}.` },
        ],
        max_tokens: 500,
        n: 1,
        stop: null,
        temperature: 0.5,
      });
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error(error);
      return '';
    }
  };

  const splitIntoChunks = (text, tokens = 500) => {
    const words = gptTokenizer.encode(text);
    const chunks = [];
    for (let i = 0; i < words.length; i += tokens) {
      chunks.push(gptTokenizer.decode(words.slice(i, i + tokens)).join(' '));
    }
    return chunks;
  };

  const processChunks = async (inputFile, outputFile) => {
    const text = loadText(inputFile);
    const chunks = splitIntoChunks(text);

    const responses = await Promise.all(chunks.map(callOpenaiApi));

    saveToFile(responses, outputFile);
  };

  // Specify your input and output files
  if (require.main === module) {
    const inputFile = 'test_input.txt';
    const outputFile = 'output_og.txt';
    await processChunks(inputFile, outputFile);
  }
})();

// Can take up to a few minutes to run depending on the size of your data input
