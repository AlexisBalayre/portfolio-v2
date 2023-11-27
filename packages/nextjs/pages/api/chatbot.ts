import natural from "natural";
import type { NextApiRequest, NextApiResponse } from "next";
import chatbot from "~~/public/assets/data/chatbot.json";

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
const analyser = new natural.SentimentAnalyzer("English", stemmer, "afinn");

// Fonction pour le traitement du texte
function processText(text: string) {
  const replacements: { [key: string]: string } = {
    "'m": " am",
    "'s": " is",
    "'re": " are",
    "'ll": " will",
    "'ve": " have",
    z: "s",
    specialities: "specialisations",
    best: "favourite",
    alexis: "he",
    she: "he",
    they: "he",
    them: "he",
    their: "his",
    theirs: "his",
    its: "his",
    "at the moment": "now",
    favorite: "favourite",
  };

  // Remplacer en utilisant une expression régulière
  const regex = new RegExp(Object.keys(replacements).join("|"), "gi");
  text = text.toLowerCase().replace(regex, matched => replacements[matched]);

  // Tokenize et Stem
  const tokens = tokenizer.tokenize(text);
  return tokens?.map(stemmer.stem);
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt } = req.body;
  const promptProcessed = processText(prompt);

  let maxScore = 0;
  let bestMatch = "I'm sorry, I can't answer to that yet.";

  chatbot.forEach(pair => {
    const questionProcessed = processText(pair.question);

    const score = natural.JaroWinklerDistance(
      promptProcessed?.join(" ") || "",
      questionProcessed?.join(" ") || "",
      {}, // Add empty options object as the third argument
    );

    const promptSentiment = analyser.getSentiment(promptProcessed as string[]);
    const questionSentiment = analyser.getSentiment(questionProcessed as string[]);
    const isSamePolarity =
      (promptSentiment >= 0 && questionSentiment >= 0) ||
      (promptSentiment < 0 && questionSentiment < 0) ||
      Math.abs(promptSentiment - questionSentiment) < 0.5;

    if (score > maxScore && score > 0.85 && isSamePolarity) {
      maxScore = score;
      bestMatch = pair.answer;
    }
  });

  res.status(200).json({ response: bestMatch });
}

export const config = {
  runtime: "edge",
};
