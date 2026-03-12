export type Level = "beginner" | "intermediate" | "expert";

export const SENTENCES: Record<Level, string[]> = {
  beginner: [
    "Good morning, how are you?",
    "Can I have a glass of water?",
    "What is your name?",
    "I like to read books.",
    "Where is the nearest bus stop?",
    "Thank you very much for your help.",
    "The weather is beautiful today.",
    "I would like a cup of coffee, please.",
    "How much does this cost?",
    "My favorite color is blue.",
    "She is my best friend.",
    "We go to school every day.",
    "I am happy to meet you.",
    "Can you help me, please?",
    "The cat is sleeping on the couch.",
    "I need to go to the store.",
  ],
  intermediate: [
    "The conference was postponed because several speakers canceled at the last minute.",
    "I have been trying to improve my pronunciation for the past few months.",
    "Could you repeat that more slowly? I didn't quite catch what you said.",
    "The restaurant around the corner has great food and excellent service.",
    "Technology is changing the way we communicate with each other every day.",
    "She sells seashells by the seashore and collects them in a basket.",
    "The quick brown fox jumps over the lazy dog that was sleeping in the yard.",
    "I have been studying English for two years and I still have a lot to learn.",
    "What time does the meeting start tomorrow? I need to prepare my presentation.",
    "Practice makes perfect, so keep trying and don't give up on your goals.",
    "The library has a wonderful collection of books on history and science.",
    "We should consider all the options before making a final decision on this matter.",
    "He thought thoroughly about the theory before presenting it to the committee.",
    "The traffic was terrible this morning because of the construction on the highway.",
    "Learning a new language requires patience, dedication, and consistent practice.",
    "The museum exhibition featured artwork from several different countries and time periods.",
  ],
  expert: [
    "The entrepreneur thoroughly analyzed the pharmaceutical company's quarterly earnings before restructuring the investment portfolio.",
    "Despite the overwhelming bureaucratic obstacles, the archaeological expedition persevered through particularly treacherous circumstances.",
    "The distinguished professor's comprehensive analysis of contemporary literature received unprecedented recognition from international scholars.",
    "Technological advancements in artificial intelligence have fundamentally transformed how organizations approach strategic decision-making processes.",
    "The photographer's extraordinary exhibition showcased breathtaking landscapes from previously inaccessible mountainous regions throughout the world.",
    "Conscientious environmentalists have consistently advocated for sustainable manufacturing practices throughout the pharmaceutical industry.",
    "The neurological research demonstrated that bilingual individuals exhibit measurably different cognitive processing patterns compared to monolingual counterparts.",
    "Although the architectural renovation encountered unforeseen complications, the engineers collaboratively devised an ingenious structural solution.",
    "The statistician's thorough investigation revealed a correlation between socioeconomic variables and educational achievement across multiple demographics.",
    "Contemporary philosophical discourse increasingly emphasizes the interconnectedness of epistemological frameworks and their practical implications.",
    "The meteorologist's sophisticated prediction models accurately forecasted the unprecedented weather phenomena that affected the southeastern coastline.",
    "Pharmaceutical researchers are cautiously optimistic about the therapeutic potential of recently synthesized compounds for neurological disorders.",
    "The geopolitical ramifications of the international trade agreement were extensively debated by economists and political analysts throughout the legislature.",
    "Her meticulous choreography seamlessly integrated classical ballet techniques with contemporary improvisational movement across three extraordinary performances.",
    "The comprehensive environmental impact assessment necessitated collaboration between ecologists, hydrologists, and urban development specialists.",
    "Entrepreneurial innovation thrives in ecosystems that simultaneously encourage calculated risk-taking and provide robust institutional support mechanisms.",
  ],
};

export function getRandomSentence(level: Level, exclude?: string): string {
  const pool = SENTENCES[level];
  if (pool.length <= 1) return pool[0];
  let next = exclude;
  while (next === exclude) {
    next = pool[Math.floor(Math.random() * pool.length)];
  }
  return next!;
}
