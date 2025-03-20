#!/usr/bin/env node

/**
 * This script merges vendor-specific model files into a single models.json file
 * with validation to ensure data integrity.
 *
 * Usage:
 *   - npm run generate-models      # Generate models.json
 *   - npm run validate-models      # Just validate without generating
 */

// Since we're directly using the TS files without compilation,
// we need to use the direct path to the TS file
const path = require("path");
const fs = require("fs");

// Check if we're just validating
const validateOnly = process.argv.includes("--validate-only");

// Define paths
const DATA_DIR = path.join(process.cwd(), "src", "data");
const VENDORS_DIR = path.join(DATA_DIR, "vendors");
const CATEGORIES_FILE = path.join(DATA_DIR, "categories.json");
const VENDORS_FILE = path.join(DATA_DIR, "vendors.json");
const OUTPUT_MODELS_FILE = path.join(DATA_DIR, "models.json");

// Simple validator function for models
function validateModel(model, vendorFile) {
  const errors = [];

  // Required fields
  const requiredFields = [
    "id",
    "systemName",
    "displayName",
    "categoryId",
    "parametersB",
    "vendorId",
    "host",
  ];

  for (const field of requiredFields) {
    if (model[field] === undefined) {
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
    const pricing = model.pricing;

    // Required pricing fields
    const requiredPricingFields = ["id", "modelId", "inputText", "outputText"];

    for (const field of requiredPricingFields) {
      if (pricing[field] === undefined) {
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
      const value = pricing[field];
      if (value !== undefined) {
        if (typeof value !== "number") {
          errors.push(
            `Model ${model.id} in ${vendorFile} has non-numeric ${field} price: ${value}`
          );
        } else if (value < 0) {
          errors.push(
            `Model ${model.id} in ${vendorFile} has negative ${field} price: ${value}`
          );
        }
      }
    }
  }

  return errors;
}

// Main function to merge and validate all data
async function mergeAndValidateData() {
  // Load categories
  let categories = [];
  try {
    const categoriesData = await fs.promises.readFile(CATEGORIES_FILE, "utf-8");
    categories = JSON.parse(categoriesData);
  } catch (error) {
    throw new Error(`Failed to load categories: ${error}`);
  }

  // Load vendors
  let vendors = [];
  try {
    const vendorsData = await fs.promises.readFile(VENDORS_FILE, "utf-8");
    vendors = JSON.parse(vendorsData);
  } catch (error) {
    throw new Error(`Failed to load vendors: ${error}`);
  }

  // Get all vendor model files
  let vendorFiles = [];
  try {
    vendorFiles = await fs.promises.readdir(VENDORS_DIR);
    vendorFiles = vendorFiles.filter((file) => file.endsWith(".json"));
  } catch (error) {
    throw new Error(`Failed to read vendor directory: ${error}`);
  }

  const allModels = [];
  const validationErrors = [];
  const modelIds = new Set();
  const pricingIds = new Set();

  // Load and validate each vendor's models
  for (const vendorFile of vendorFiles) {
    const filePath = path.join(VENDORS_DIR, vendorFile);
    try {
      const vendorModelsData = await fs.promises.readFile(filePath, "utf-8");
      const vendorModels = JSON.parse(vendorModelsData);

      // Validate each model from this vendor
      for (const model of vendorModels) {
        // Skip hidden models
        if (model.isHidden) {
          continue;
        }

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

// Function to validate only
async function validateModelsOnly() {
  try {
    const { validationErrors } = await mergeAndValidateData();
    return {
      valid: validationErrors.length === 0,
      errors: validationErrors,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [error.message],
    };
  }
}

// Function to combine all vendor files and write the merged models.json
async function writeModelsJson() {
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
      errors: [error.message],
    };
  }
}

// IIFE to use async/await
(async () => {
  if (validateOnly) {
    console.log("🔍 Validating model data...");

    try {
      const result = await validateModelsOnly();

      if (result.valid) {
        console.log("✅ All model data is valid");
      } else {
        console.error("❌ Validation errors found:");
        result.errors.forEach((error) => console.error(`  - ${error}`));
        process.exit(1);
      }
    } catch (error) {
      console.error("❌ Unhandled error:", error);
      process.exit(1);
    }
  } else {
    console.log("📊 Generating models.json from vendor files...");

    try {
      const result = await writeModelsJson();

      if (result.success) {
        console.log("✅ Successfully generated models.json");
      } else {
        console.error("❌ Failed to generate models.json:");
        result.errors.forEach((error) => console.error(`  - ${error}`));
        process.exit(1);
      }
    } catch (error) {
      console.error("❌ Unhandled error:", error);
      process.exit(1);
    }
  }
})();
