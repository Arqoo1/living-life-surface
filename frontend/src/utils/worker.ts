import { pipeline, env } from "@xenova/transformers";

env.allowLocalModels = false;
env.useBrowserCache = true;

class ClassifierSingleton {
  static instance: any = null;
  static discoveryInstance: any = null;

  static async getInstance(progress_callback?: any) {
    if (!this.instance) {
      this.instance = await pipeline(
        "zero-shot-classification",
        "Xenova/mobilebert-uncased-mnli",
        { progress_callback }
      );
    }
    return this.instance;
  }

  static async getDiscoveryInstance() {
    if (!this.discoveryInstance) {
      this.discoveryInstance = await pipeline(
        "token-classification",
        "Xenova/bert-base-NER"
      );
    }
    return this.discoveryInstance;
  }
}

self.onmessage = async (event: MessageEvent<any>) => {
  const { content, categories, type, status } = event.data;

  if (status === "init") {
    try {
      await ClassifierSingleton.getInstance((data: any) => {
        if (data.status === "progress") {
          self.postMessage({ status: "progress", progress: data.progress });
        }
      });
      self.postMessage({ status: "ready" });
    } catch (err: any) {
      self.postMessage({ status: "error", error: err.message });
    }
    return;
  }

  try {
    if (type === "discovery") {
      const ner = await ClassifierSingleton.getDiscoveryInstance();
      const entities = await ner(content);
      console.log("🔍 Discovery NER raw entities:", entities);
      self.postMessage({
        status: "complete",
        type: "discovery",
        results: entities,
      });
    } else {
      const classifier = await ClassifierSingleton.getInstance();
      const output = await classifier(content, categories, {
        hypothesis_template: "This text is about {}.",
      });
      console.log(
        `📊 AI ${type} Match:`,
        output.labels[0],
        `(Score: ${output.scores[0].toFixed(3)})`
      );
      self.postMessage({ status: "complete", type, results: output });
    }
  } catch (error: any) {
    self.postMessage({ status: "error", error: error.message });
  }
};
