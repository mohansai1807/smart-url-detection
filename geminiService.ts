import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { UrlAnalysis } from '../types';

// --- 1. Schema Definition with Enum Constraint ---
const CLASSIFICATION_TYPES = ['Benign', 'Phishing', 'Malware', 'Defacement', 'Suspicious'] as const;

// Helper function to create the model object properties, keeping the schema DRY
const createModelProperties = (modelName: string) => ({
    classification: { 
        type: SchemaType.STRING, 
        description: `Classification based on ${modelName} model.`,
        enum: CLASSIFICATION_TYPES, // Enforce strict classification values
    },
    confidence: { 
        type: SchemaType.NUMBER, 
        description: `Confidence score from 0 to 100 for the ${modelName} analysis.` 
    },
    reasoning: { 
        type: SchemaType.STRING, 
        description: `Brief reasoning for the ${modelName} classification in 1-2 sentences.` 
    }
});

const analysisSchema = {
    type: SchemaType.OBJECT,
    properties: {
        lstm: {
            type: SchemaType.OBJECT,
            properties: createModelProperties("LSTM"),
            required: ["classification", "confidence", "reasoning"]
        },
        randomForest: {
            type: SchemaType.OBJECT,
            properties: createModelProperties("Random Forest"),
            required: ["classification", "confidence", "reasoning"]
        },
        xgboost: {
            type: SchemaType.OBJECT,
            properties: createModelProperties("XGBoost"),
            required: ["classification", "confidence", "reasoning"]
        },
        hybrid: {
            type: SchemaType.OBJECT,
            properties: createModelProperties("Hybrid Algorithm"),
            required: ["classification", "confidence", "reasoning"]
        },
        svm: {
            type: SchemaType.OBJECT,
            properties: createModelProperties("SVM"),
            required: ["classification", "confidence", "reasoning"]
        },
        neuralNetwork: {
            type: SchemaType.OBJECT,
            properties: createModelProperties("Neural Network"),
            required: ["classification", "confidence", "reasoning"]
        },
    },
    required: ["lstm", "randomForest", "xgboost", "hybrid", "svm", "neuralNetwork"]
} as const;

// --- 2. Main Analysis Function ---
export const analyzeUrl = async (url: string): Promise<UrlAnalysis> => {
    
    // Use the explicit environment variable name for clarity
    const apiKey = process.env.GEMINI_API_KEY; 
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable not set.");
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-1.5-flash-latest for better stability and availability
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 

    const prompt = `Analyze the URL: "${url}" by simulating the output of six different machine learning models (LSTM, Random Forest, XGBoost, Hybrid, SVM, and Neural Network) used for URL classification. For each model, provide a classification, a confidence score (0-100), and a brief reasoning. The classifications MUST be strictly one of: ${CLASSIFICATION_TYPES.join(', ')}. Return the result ONLY as a JSON object matching the provided schema.`;

    let result;
    try {
        result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            // *** FIX APPLIED HERE ***: Used 'generationConfig' instead of 'config'
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema as any,
            },
        });

    } catch (apiError) {
        console.error("Gemini API call failed:", apiError);
        throw new Error(`Gemini API call failed. Check API key, model name, and schema syntax. Error: ${apiError.message}`);
    }

    // --- 3. Parsing and Validation ---
    const rawText = result.text;
    let parsedJson: UrlAnalysis;
    
    try {
        // Parse the JSON string from result.text
        parsedJson = JSON.parse(rawText) as UrlAnalysis;
    } catch (error) {
        console.error("Failed to parse JSON from API response. Raw text:", rawText, "Error:", error);
        throw new Error("The API returned a response that was not valid JSON. Please try again.");
    }
    
    // Final check for core structure (less strict since schema handles most)
    if (!parsedJson.hybrid || !parsedJson.svm || !parsedJson.neuralNetwork) {
        console.error("Received an incomplete response structure:", parsedJson);
        throw new Error("Received an incomplete response structure from the API, missing model data.");
    }
    
    return parsedJson;
};

// --- 4. Example Usage (for testing) ---
const testUrl = "https://www.official-bank.com/secure-login-portal-xyz"; // Example suspicious URL

// Self-invoking function to run the test
(async () => {
    // NOTE: This part requires a valid GEMINI_API_KEY environment variable set to run successfully.
    // console.log(`Starting analysis for: ${testUrl}`);
    // try {
    //     const analysis = await analyzeUrl(testUrl);
    //     console.log("\n*** SUCCESSFUL ANALYSIS RESULT ***");
    //     console.log(JSON.stringify(analysis, null, 2));
    //     console.log("*********************************");
    // } catch (error) {
    //     console.error("\n*** FAILED TO COMPLETE ANALYSIS ***");
    //     console.error((error as Error).message);
    //     console.error("*********************************");
    // }
})();