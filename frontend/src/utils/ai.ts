import { pipeline, env } from "@xenova/transformers";

env.allowLocalModels = false;

let classifierInstance: any = null;

export const getClassifier = async (progressCallback?: (data: any) => void) => {
  if (classifierInstance) return classifierInstance;


  classifierInstance = await pipeline(
    "text-classification",
    "Xenova/mobilebert-uncased-mnli",
    { progress_callback: progressCallback } 
  );

  return classifierInstance;
};
