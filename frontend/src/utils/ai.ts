import { pipeline, env } from "@xenova/transformers";

env.allowLocalModels = false;

// This variable stays in memory outside of any component
let classifierInstance: any = null;

export const getClassifier = async (progressCallback?: (data: any) => void) => {
  // 1. Return existing instance if already loaded
  if (classifierInstance) return classifierInstance;

  // 2. Initialize the pipeline and assign it to the top-level variable
  // REMOVE the 'const' keyword here
  classifierInstance = await pipeline(
    "text-classification",
    "Xenova/mobilebert-uncased-mnli",
    { progress_callback: progressCallback } // Pass your callback here
  );

  return classifierInstance;
};
