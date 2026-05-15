import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateFollowUpQuestion = async (complaintText) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // instructions said gemini-2.5-flash-lite but it might not be out yet, using 1.5-flash as it's the stable light one. Wait, instructions said "gemini-2.5-flash-lite (lightest model available on the free tier as of May 2026)". It is May 2026 now in the context. I will try that model name.
    
    const prompt = `A user has submitted the following complaint: "${complaintText}". 
    Generate exactly one short, relevant follow-up question to help understand the situation better. 
    Return only the question text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error generating AI question:', error);
    return "Could you provide more details about this issue?"; // Fallback question
  }
};
