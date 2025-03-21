import fs from "fs";
import path from "path";
import { AIModel, Pricing, Category, Vendor } from "./types";

// Define the paths
const DATA_DIR = path.join(process.cwd(), "src", "data");
const VENDORS_DIR = path.join(DATA_DIR, "vendors");
const CATEGORIES_FILE = path.join(DATA_DIR, "categories.json");
const VENDORS_FILE = path.join(DATA_DIR, "vendors.json");
const OUTPUT_MODELS_FILE = path.join(DATA_DIR, "models.json");

/**
 * Validate a model's data structure
 */
function validateModel(model: AIModel, vendorFile: string): string[] {
  const errors: string[] = [];

  // Required fields
  const requiredFields = [
    "id",
    "systemName",
    "displayName",
    "categoryId",
    "parametersB",
    "vendorId",
    "host",
    "isHidden",
  ];

  for (const field of requiredFields) {
    if (model[field as keyof AIModel] === undefined) {
      errors.push(
        `Model ${
          model.id || "unknown"
        } in ${vendorFile} is missing required field: ${field}`
      );
    }
  }

  // Pricing validation
  if (!model.pricing) {
    errors.push(
      `Model ${model.id} in ${vendorFile} is missing pricing information`
    );
  } else {
    const pricing = model.pricing as Pricing;

    // Required pricing fields
    const requiredPricingFields = ["id", "modelId", "inputText", "outputText"];

    for (const field of requiredPricingFields) {
      if (pricing[field as keyof Pricing] === undefined) {
        errors.push(
          `Model ${model.id} in ${vendorFile} pricing is missing required field: ${field}`
        );
      }
    }

    // Validate modelId matches parent model id
    if (pricing.modelId !== model.id) {
      errors.push(
        `Model ${model.id} in ${vendorFile} has mismatched modelId (${pricing.modelId}) in pricing`
      );
    }

    // Pricing values should be numbers and not negative
    for (const field of [
      "inputText",
      "outputText",
      "finetuningInput",
      "finetuningOutput",
      "trainingCost",
    ]) {
      const value = pricing[field as keyof Pricing] as number | undefined;
      if (value !== undefined) {
        if (typeof value !== "number") {
          errors.push(
            `Model ${model.id} in ${vendorFile} has non-numeric ${field} price: ${value}`
          );
        } else if (value < 0) {
          errors.push(
            `Model ${model.id} in ${vendorFile} has negative ${field} price: ${value}`
          );
        } else {
          // Enhanced pricing validation
          const modelName = model.displayName || model.systemName;

          // Skip validation for models with intentionally unusual pricing
          const exceptionalModels = [
            "o1-pro",
            "O1-Pro",
            "gpt-4.5",
            "GPT-4.5",
            "GPT 4.5",
          ];
          if (
            exceptionalModels.some(
              (name) =>
                model.systemName.includes(name) ||
                (modelName && modelName.includes(name))
            )
          ) {
            continue;
          }

          // Detect prices that seem too low (likely entered as per-token instead of per-million)
          if (value > 0 && value < 0.001) {
            errors.push(
              `PRICING ERROR: ${modelName} (${field}) price of $${value} is suspiciously low. Prices should be per MILLION tokens.`
            );
          }

          // Detect unusually high prices that may indicate incorrect unit conversion
          if (
            (field === "inputText" && value > 200) ||
            (field === "outputText" && value > 500)
          ) {
            errors.push(
              `PRICING ERROR: ${modelName} (${field}) price of $${value} is unusually high. Verify this is the correct price per MILLION tokens.`
            );
          }

          // Detect typical pricing mismatch for well-known vendors
          if (
            model.host === "google" &&
            field === "inputText" &&
            value === 37.5
          ) {
            // For Google models, prices are frequently entered incorrectly
            errors.push(
              `PRICING VERIFICATION NEEDED: ${modelName} input price of $37.50 per 1M tokens may be incorrect. Google prices are typically $0.0375 per 1M characters.`
            );
          }
        }
      }
    }
  }

  // Validation for ID uniqueness is handled separately

  return errors;
}

/**
 * Main function to merge and validate all data
 */
export async function mergeAndValidateData(): Promise<{
  models: AIModel[];
  validationErrors: string[];
}> {
  // Load categories
  let categories: Category[] = [];
  try {
    const categoriesData = await fs.promises.readFile(CATEGORIES_FILE, "utf-8");
    categories = JSON.parse(categoriesData);
  } catch (error) {
    throw new Error(`Failed to load categories: ${error}`);
  }

  // Load vendors
  let vendors: Vendor[] = [];
  try {
    const vendorsData = await fs.promises.readFile(VENDORS_FILE, "utf-8");
    vendors = JSON.parse(vendorsData);
  } catch (error) {
    throw new Error(`Failed to load vendors: ${error}`);
  }

  // Get all vendor model files
  let vendorFiles: string[] = [];
  try {
    vendorFiles = await fs.promises.readdir(VENDORS_DIR);
    vendorFiles = vendorFiles.filter((file) => file.endsWith(".json"));
  } catch (error) {
    throw new Error(`Failed to read vendor directory: ${error}`);
  }

  const allModels: AIModel[] = [];
  const validationErrors: string[] = [];
  const modelIds = new Set<number>();
  const pricingIds = new Set<number>();

  // Load and validate each vendor's models
  for (const vendorFile of vendorFiles) {
    const filePath = path.join(VENDORS_DIR, vendorFile);
    try {
      const vendorModelsData = await fs.promises.readFile(filePath, "utf-8");
      const vendorModels: AIModel[] = JSON.parse(vendorModelsData);

      // Validate each model from this vendor
      for (const model of vendorModels) {
        // Validate structure
        const modelErrors = validateModel(model, vendorFile);
        validationErrors.push(...modelErrors);

        // Check for duplicate IDs
        if (modelIds.has(model.id)) {
          validationErrors.push(
            `Duplicate model ID ${model.id} found in ${vendorFile}`
          );
        } else {
          modelIds.add(model.id);
        }

        // Check for duplicate pricing IDs
        if (model.pricing && pricingIds.has(model.pricing.id)) {
          validationErrors.push(
            `Duplicate pricing ID ${model.pricing.id} found in ${vendorFile}`
          );
        } else if (model.pricing) {
          pricingIds.add(model.pricing.id);
        }

        // Verify category exists
        if (!categories.some((c) => c.id === model.categoryId)) {
          validationErrors.push(
            `Model ${model.id} in ${vendorFile} references non-existent category ID: ${model.categoryId}`
          );
        }

        // Verify vendor exists
        if (!vendors.some((v) => v.id === model.vendorId)) {
          validationErrors.push(
            `Model ${model.id} in ${vendorFile} references non-existent vendor ID: ${model.vendorId}`
          );
        }

        // Add to all models
        allModels.push(model);
      }
    } catch (error) {
      validationErrors.push(`Error processing ${vendorFile}: ${error}`);
    }
  }

  // Sort models by ID for consistency
  allModels.sort((a, b) => a.id - b.id);

  return {
    models: allModels,
    validationErrors,
  };
}

/**
 * Function to combine all vendor files and write the merged models.json
 */
export async function writeModelsJson(): Promise<{
  success: boolean;
  errors: string[];
}> {
  try {
    const { models, validationErrors } = await mergeAndValidateData();

    if (validationErrors.length > 0) {
      console.error("Validation errors found:");
      validationErrors.forEach((error) => console.error(`- ${error}`));
      return { success: false, errors: validationErrors };
    }

    // Write the combined models file
    await fs.promises.writeFile(
      OUTPUT_MODELS_FILE,
      JSON.stringify(models, null, 2),
      "utf-8"
    );

    return { success: true, errors: [] };
  } catch (error) {
    console.error("Error writing models.json:", error);
    return {
      success: false,
      errors: [(error as Error).message],
    };
  }
}

/**
 * Just validate the models without writing the output file
 */
export async function validateModelsOnly(): Promise<{
  valid: boolean;
  errors: string[];
}> {
  try {
    const { validationErrors } = await mergeAndValidateData();
    return {
      valid: validationErrors.length === 0,
      errors: validationErrors,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [(error as Error).message],
    };
  }
}

// If this file is executed directly
if (require.main === module) {
  const validateOnly = process.argv.includes("--validate-only");

  if (validateOnly) {
    validateModelsOnly()
      .then((result) => {
        if (result.valid) {
          console.log("✅ All model data is valid");
        } else {
          console.error("❌ Validation errors found:");
          result.errors.forEach((error) => console.error(`- ${error}`));
          process.exit(1);
        }
      })
      .catch((error) => {
        console.error("Unhandled error:", error);
        process.exit(1);
      });
  } else {
    writeModelsJson()
      .then((result) => {
        if (result.success) {
          console.log(
            "✅ Successfully merged vendor model files into models.json"
          );
        } else {
          console.error("❌ Failed to generate models.json");
          result.errors.forEach((error) => console.error(`- ${error}`));
          process.exit(1);
        }
      })
      .catch((error) => {
        console.error("Unhandled error:", error);
        process.exit(1);
      });
  }
}
