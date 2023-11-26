import natural from "natural";
import type { NextApiRequest, NextApiResponse } from "next";
import chatbot from "~~/public/assets/data/chatbot.json";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the user prompt
  let { prompt } = req.body;

  // Create a stemmer and sentiment analyser
  const tokenizer = new natural.WordTokenizer();
  const stemmer = natural.LancasterStemmer; // PorterStemmer is a stemming algorithm for English
  const analyser = new natural.SentimentAnalyzer("English", stemmer, "afinn"); // AFINN is a list of English words rated for valence with an integer between minus five (negative) and plus five (positive).

  // Everything to lowercase
  prompt = prompt.toLowerCase();
  // Replace words in the user prompt
  const replacements = [
    {
      word: "'m",
      replacement: " am",
    },
    {
      word: "'s",
      replacement: " is",
    },
    {
      word: "'re",
      replacement: " are",
    },
    {
      word: "'ll",
      replacement: " will",
    },
    {
      word: "'ve",
      replacement: " have",
    },
    {
      word: "z",
      replacement: "s",
    },
    {
      word: "specialities",
      replacement: "specialisations",
    },
    {
      word: "best",
      replacement: "favourite",
    },
    {
      word: "alexis",
      replacement: "he",
    },
    {
      word: "she",
      replacement: "he",
    },
    {
      word: "they",
      replacement: "he",
    },
    {
      word: "them",
      replacement: "he",
    },
    {
      word: "their",
      replacement: "his",
    },
    {
      word: "theirs",
      replacement: "his",
    },
    {
      word: "at the moment",
      replacement: "now",
    },
    {
      word: "favorite",
      replacement: "favourite",
    },
  ];
  replacements.forEach(replacement => {
    prompt = prompt.replace(replacement.word, replacement.replacement);
  });
  // Tokenize the user prompt
  const promptTokenizedData = tokenizer.tokenize(prompt); // Tokenization is the process of breaking a stream of text up into words, phrases, symbols, or other meaningful elements called tokens.
  // Stem the user prompt
  const promptTokenizedStemData = promptTokenizedData?.map(natural.PorterStemmer.stem);
  // Compute the sentiment of the user prompt
  const promptSentiment = analyser.getSentiment(promptTokenizedStemData!);

  // Initialize the max score and the best match
  let maxScore = 0;
  let bestMatch = "I'm sorry, I can't answer to that yet."; // Default answer

  // Loop through the chatbot data and find the best match
  chatbot.forEach(pair => {
    // Tokenize the question
    const questionTokenizedData = tokenizer.tokenize(pair.question.toLowerCase()); // Tokenization is the process of breaking a stream of text up into words, phrases, symbols, or other meaningful elements called tokens.
    // Stem the question
    const questionTokenizedStemData = questionTokenizedData?.map(natural.PorterStemmer.stem);
    // Compare the similarity between the question and the user prompt
    const score = natural.JaroWinklerDistance(
      promptTokenizedStemData?.join(" ") || "",
      questionTokenizedStemData?.join(" ") || "",
      {},
    );
    // Get the sentiment of the question
    const questionSentiment = analyser.getSentiment(questionTokenizedStemData!);
    // Compare the sentiment of the question and the user prompt
    // Considérer null comme neutre (0)
    const promptSentimentNormalized = promptSentiment !== null ? promptSentiment : 0;
    const questionSentimentNormalized = questionSentiment !== null ? questionSentiment : 0;
    const isSamePolarity =
      (promptSentimentNormalized >= 0 && questionSentimentNormalized >= 0) ||
      Math.abs(promptSentimentNormalized - questionSentimentNormalized) < 0.3;
    // If the score is higher than the max score and the sentiment is the same, update the max score and the best match
    console.log(
      questionSentiment,
      promptSentiment,
      score,
      pair.answer,
      Math.abs(promptSentimentNormalized - questionSentimentNormalized),
    );
    if (score > maxScore && score > 0.8 && isSamePolarity) {
      maxScore = score; // Update the max score
      bestMatch = pair.answer; // Update the best match
    }
  });

  res.status(200).json({ response: bestMatch });
}
