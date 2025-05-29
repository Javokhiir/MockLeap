import OpenAI from 'openai';

// Initialize OpenAI client if API key is available
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true // Note: In production, API calls should be proxied through a backend
}) : null;

// Check if OpenAI is available
const isOpenAIAvailable = !!openai;

if (!isOpenAIAvailable) {
  console.warn('OpenAI API key not found. Using mock AI responses instead.');
}

export type WritingFeedback = {
  score: number;
  overall: string;
  grammar: {
    score: number;
    feedback: string;
    errors: Array<{
      text: string;
      correction: string;
      explanation: string;
    }>;
  };
  vocabulary: {
    score: number;
    feedback: string;
    suggestions: Array<{
      original: string;
      alternatives: string[];
      context: string;
    }>;
  };
  coherence: {
    score: number;
    feedback: string;
  };
  taskAchievement: {
    score: number;
    feedback: string;
  };
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
};

export type SpeakingFeedback = {
  score: number;
  overall: string;
  pronunciation: {
    score: number;
    feedback: string;
    errors: Array<{
      word: string;
      correction: string;
      explanation: string;
    }>;
  };
  fluency: {
    score: number;
    feedback: string;
  };
  vocabulary: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  grammar: {
    score: number;
    feedback: string;
    errors: string[];
  };
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
};

// Mock writing feedback generator
const generateMockWritingFeedback = (text: string, taskType: 'task1' | 'task2'): WritingFeedback => {
  const wordCount = text.split(/\s+/).length;
  const score = Math.min(9, Math.max(5, 6 + Math.random() * 2)); // Random score between 6-8
  
  return {
    score,
    overall: `This is a ${score >= 7 ? 'good' : 'satisfactory'} response that ${score >= 7 ? 'effectively' : 'adequately'} addresses the task.`,
    grammar: {
      score: Math.min(9, Math.max(5, score - 0.5 + Math.random())),
      feedback: "The response demonstrates a mix of simple and complex sentence structures with some grammatical errors.",
      errors: [
        {
          text: "they was",
          correction: "they were",
          explanation: "Subject-verb agreement error with plural subject"
        },
        {
          text: "more better",
          correction: "better",
          explanation: "Double comparative"
        }
      ]
    },
    vocabulary: {
      score: Math.min(9, Math.max(5, score - 0.5 + Math.random())),
      feedback: "The vocabulary used is generally appropriate with some good word choices and some imprecision.",
      suggestions: [
        {
          original: "big",
          alternatives: ["significant", "substantial", "considerable"],
          context: "This is a big problem."
        },
        {
          original: "good",
          alternatives: ["beneficial", "advantageous", "favorable"],
          context: "It has good effects on society."
        }
      ]
    },
    coherence: {
      score: Math.min(9, Math.max(5, score - 0.5 + Math.random())),
      feedback: "The response is generally well-organized with some effective use of cohesive devices."
    },
    taskAchievement: {
      score: Math.min(9, Math.max(5, score - 0.5 + Math.random())),
      feedback: taskType === 'task1' 
        ? "The response covers the main features of the graph but could include more detailed comparisons."
        : "The essay addresses the question but could develop some arguments more fully."
    },
    strengths: [
      "Clear overall structure with introduction, body paragraphs, and conclusion",
      "Good use of topic sentences to introduce main ideas",
      "Some effective use of linking words and phrases"
    ],
    weaknesses: [
      "Some grammatical errors in complex sentences",
      "Limited range of vocabulary in certain areas",
      "Some ideas could be developed more fully"
    ],
    improvements: [
      "Practice using a wider range of complex grammatical structures",
      "Expand academic vocabulary, especially for describing trends and making comparisons",
      "Develop ideas with more specific examples and details"
    ]
  };
};

// Mock speaking feedback generator
const generateMockSpeakingFeedback = (): SpeakingFeedback => {
  const score = Math.min(9, Math.max(5, 6 + Math.random() * 2)); // Random score between 6-8
  
  return {
    score,
    overall: "The candidate demonstrates a good command of spoken English with some limitations.",
    pronunciation: {
      score: Math.min(9, Math.max(5, score - 0.5 + Math.random())),
      feedback: "Generally clear pronunciation with occasional errors that don't impede understanding.",
      errors: [
        {
          word: "development",
          correction: "dɪˈveləpmənt",
          explanation: "Stress should be on the second syllable"
        },
        {
          word: "comfortable",
          correction: "ˈkʌmf(ə)təb(ə)l",
          explanation: "Often mispronounced as 'comf-ter-bull'"
        }
      ]
    },
    fluency: {
      score: Math.min(9, Math.max(5, score - 0.5 + Math.random())),
      feedback: "Speaks at a reasonable pace with some hesitation but maintains flow."
    },
    vocabulary: {
      score: Math.min(9, Math.max(5, score - 0.5 + Math.random())),
      feedback: "Uses a mix of simple and complex vocabulary with some imprecision.",
      suggestions: [
        "Consider using 'significant' instead of 'big'",
        "Try 'perspective' instead of 'point of view'",
        "Use 'beneficial' instead of 'good for'"
      ]
    },
    grammar: {
      score: Math.min(9, Math.max(5, score - 0.5 + Math.random())),
      feedback: "Generally good control of grammar with some errors in complex structures.",
      errors: [
        "Incorrect use of present perfect tense",
        "Subject-verb agreement error in complex sentence",
        "Inconsistent use of articles"
      ]
    },
    strengths: [
      "Good ability to express opinions",
      "Effective use of examples",
      "Clear organization of ideas",
      "Good range of connecting words"
    ],
    weaknesses: [
      "Limited range of complex structures",
      "Some imprecision in vocabulary",
      "Occasional pronunciation errors",
      "Hesitation when discussing abstract topics"
    ],
    improvements: [
      "Practice using a wider range of tenses",
      "Work on stress patterns in multisyllabic words",
      "Expand vocabulary related to the topic",
      "Practice speaking about abstract concepts"
    ]
  };
};

// Mock AI assistant response generator
const generateMockAIResponse = (question: string): string => {
  const responses = [
    "To improve your IELTS score, focus on practicing with authentic test materials and getting feedback on your performance. Regular reading in English will help expand your vocabulary and improve your comprehension skills.",
    
    "When preparing for the IELTS speaking test, practice speaking English daily, record yourself to identify areas for improvement, and learn to elaborate on your answers with examples and explanations.",
    
    "For IELTS writing Task 1, make sure you analyze the key features of the graph or chart, use appropriate language to describe trends, and include an overview paragraph that summarizes the main patterns.",
    
    "Time management is crucial in the IELTS reading test. Spend about 20 minutes on each passage, and don't spend too long on any single question. If you're stuck, move on and come back to it later if you have time.",
    
    "To improve your listening skills, practice with a variety of English accents and contexts. The IELTS test includes speakers from different English-speaking countries, so exposure to different accents is beneficial.",
    
    "When writing an IELTS Task 2 essay, make sure you fully address all parts of the question, organize your ideas logically with clear paragraphs, and support your arguments with relevant examples or evidence.",
    
    "For the IELTS speaking test, it's important to speak at a natural pace - not too fast and not too slow. Focus on fluency rather than trying to use overly complex vocabulary that might cause you to stumble."
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

export const analyzeWriting = async (
  text: string,
  taskType: 'task1' | 'task2',
  prompt?: string
): Promise<WritingFeedback> => {
  try {
    // Use mock response if OpenAI is not available
    if (!isOpenAIAvailable) {
      return generateMockWritingFeedback(text, taskType);
    }
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an IELTS writing examiner. Analyze the following ${
            taskType === 'task1' ? 'Task 1 (graph/chart description)' : 'Task 2 (essay)'
          } response and provide detailed feedback. ${
            prompt ? `The task was: ${prompt}` : ''
          }`
        },
        {
          role: 'user',
          content: text
        }
      ],
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result as WritingFeedback;
  } catch (error) {
    console.error('Error analyzing writing:', error);
    // Fallback to mock response in case of error
    return generateMockWritingFeedback(text, taskType);
  }
};

export const analyzeSpeaking = async (
  audioUrl: string,
  questionType: string,
  question: string
): Promise<SpeakingFeedback> => {
  try {
    // Always use mock response for speaking analysis
    // In a real implementation with OpenAI key, we would:
    // 1. Convert the audio to text using OpenAI's Whisper API
    // 2. Send the transcription to GPT-4 for analysis
    return generateMockSpeakingFeedback();
  } catch (error) {
    console.error('Error analyzing speaking:', error);
    return generateMockSpeakingFeedback();
  }
};

export const askAIAssistant = async (question: string, context?: string): Promise<string> => {
  try {
    // Use mock response if OpenAI is not available
    if (!isOpenAIAvailable) {
      return generateMockAIResponse(question);
    }
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant helping users prepare for IELTS exams. ${
            context ? `Context: ${context}` : ''
          }`
        },
        {
          role: 'user',
          content: question
        }
      ]
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error asking AI assistant:', error);
    // Fallback to mock response in case of error
    return generateMockAIResponse(question);
  }
};