/**
 * Automated pricing validator script
 *
 * This script analyzes pricing data to find potential errors, specifically:
 * 1. Prices that are likely entered in the wrong format (per-token vs per-million tokens)
 * 2. Common vendor-specific pricing patterns that may indicate an error
 * 3. Extreme values that are likely typos or conversion errors
 */

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

// Initialize Prisma client
const prisma = new PrismaClient();

// Known pricing patterns for major vendors (used for validation)
const VENDOR_PATTERNS = {
  google: {
    // Google typically charges per million characters, not tokens
    // Common pricing pattern is $0.0375 per million characters for input
    // and $0.15 per million characters for output
    inputRanges: [0.0001, 0.1], // Expected range for Google input prices
    outputRanges: [0.0005, 0.3], // Expected range for Google output prices
    commonInputPrices: [0.0375, 0.075, 0.01875],
    commonOutputPrices: [0.15, 0.3, 0.075],
  },
  anthropic: {
    inputRanges: [0.5, 15], // Per million tokens
    outputRanges: [1.5, 30], // Per million tokens
    commonInputPrices: [0.5, 1.0, 2.0, 3.0],
    commonOutputPrices: [1.5, 3.0, 6.0, 15.0],
  },
  openai: {
    inputRanges: [0.1, 30], // Per million tokens
    outputRanges: [0.3, 120], // Per million tokens
    commonInputPrices: [0.5, 1.0, 3.0, 5.0, 10.0],
    commonOutputPrices: [1.5, 3.0, 6.0, 15.0, 30.0],
  },
};

// Models with intentionally unusual pricing that should be excluded from warnings
const PRICING_EXCEPTIONS = [
  "o1-pro", // Intentionally expensive model with correct pricing ($150/$600)
  "gpt-4.5", // Placeholder model with intentionally high pricing
];

// Pricing thresholds for generic validation
const VALIDATION_THRESHOLDS = {
  suspiciouslyLow: 0.001, // Likely entered as per-token instead of per-million
  suspiciouslyHighInput: 200, // Unusually high for input pricing
  suspiciouslyHighOutput: 500, // Unusually high for output pricing
};

async function main() {
  console.log("🔍 Starting pricing validation...");

  try {
    // Get all models with pricing data and their vendor info
    const models = await prisma.aIModel.findMany({
      include: {
        pricing: true,
        vendor: true,
      },
      where: {
        isHidden: false, // Only validate non-hidden models
      },
    });

    // Keep track of issues found
    const pricingIssues = [];
    const warnings = [];

    // Check each model's pricing
    models.forEach((model) => {
      if (!model.pricing) {
        warnings.push(
          `⚠️ Model ${model.displayName} (${model.systemName}) has no pricing data`
        );
        return;
      }

      const vendorName = model.vendor?.name?.toLowerCase() || "";
      const vendorKey = Object.keys(VENDOR_PATTERNS).find(
        (key) =>
          vendorName.includes(key) || model.host.toLowerCase().includes(key)
      );

      const vendorPatterns = vendorKey ? VENDOR_PATTERNS[vendorKey] : null;

      // Generic validation first
      validatePrice(model, "inputText", pricingIssues, warnings);
      validatePrice(model, "outputText", pricingIssues, warnings);

      // Vendor-specific validation if we have patterns for this vendor
      if (vendorPatterns) {
        vendorSpecificValidation(
          model,
          vendorPatterns,
          vendorKey,
          pricingIssues
        );
      }
    });

    // Output the results
    outputValidationResults(pricingIssues, warnings);

    // If critical issues found, also write to a log file
    if (pricingIssues.length > 0) {
      const logFile = path.join(
        __dirname,
        "..",
        "pricing-validation-errors.log"
      );
      const timestamp = new Date().toISOString();

      fs.writeFileSync(
        logFile,
        `PRICING VALIDATION ISSUES (${timestamp})\n\n${pricingIssues.join(
          "\n"
        )}\n\nWARNINGS:\n${warnings.join("\n")}`
      );

      console.log(`📄 Detailed error log written to: ${logFile}`);
    }
  } catch (error) {
    console.error("Failed to validate pricing:", error);
  } finally {
    await prisma.$disconnect();
  }
}

function validatePrice(model, priceField, issues, warnings) {
  const price = model.pricing[priceField];

  if (price === undefined || price === null) {
    warnings.push(`⚠️ ${model.displayName} is missing ${priceField} price`);
    return;
  }

  // Skip validation for models in the exceptions list
  if (PRICING_EXCEPTIONS.includes(model.systemName)) {
    return;
  }

  // Check for extremely low values (likely entered as per-token)
  if (price > 0 && price < VALIDATION_THRESHOLDS.suspiciouslyLow) {
    issues.push(
      `🚨 CRITICAL: ${model.displayName} ${priceField} price of $${price} is suspiciously low. Should be in dollars per MILLION tokens.`
    );
  }

  // Check for extremely high values
  const highThreshold =
    priceField === "inputText"
      ? VALIDATION_THRESHOLDS.suspiciouslyHighInput
      : VALIDATION_THRESHOLDS.suspiciouslyHighOutput;

  if (price > highThreshold) {
    issues.push(
      `🚨 CRITICAL: ${model.displayName} ${priceField} price of $${price} is unusually high. Verify this is correct per MILLION tokens.`
    );
  }
}

function vendorSpecificValidation(model, vendorPatterns, vendorName, issues) {
  // Skip validation for models in the exceptions list
  if (PRICING_EXCEPTIONS.includes(model.systemName)) {
    return;
  }

  const inputPrice = model.pricing.inputText;
  const outputPrice = model.pricing.outputText;

  // Check against vendor-specific ranges
  if (inputPrice && vendorPatterns.inputRanges) {
    const [min, max] = vendorPatterns.inputRanges;
    if (inputPrice < min || inputPrice > max) {
      issues.push(
        `⚠️ ${model.displayName} input price of $${inputPrice} is outside the typical range for ${vendorName} (${min}-${max})`
      );
    }
  }

  if (outputPrice && vendorPatterns.outputRanges) {
    const [min, max] = vendorPatterns.outputRanges;
    if (outputPrice < min || outputPrice > max) {
      issues.push(
        `⚠️ ${model.displayName} output price of $${outputPrice} is outside the typical range for ${vendorName} (${min}-${max})`
      );
    }
  }

  // For Google specifically, check for common pricing confusion
  if (vendorName === "google") {
    // Google's prices are typically much lower when expressed as per-million
    // so check if they're likely entered as per-million tokens instead of per-million characters
    if (inputPrice > 10 && inputPrice < 50) {
      issues.push(
        `🚨 Google pricing issue detected: ${model.displayName} input price of $${inputPrice} is likely wrong. Google typically prices around $0.0375 per million CHARACTERS for input, not tokens.`
      );
    }

    if (outputPrice > 100 && outputPrice < 200) {
      issues.push(
        `🚨 Google pricing issue detected: ${model.displayName} output price of $${outputPrice} is likely wrong. Google typically prices around $0.15 per million CHARACTERS for output, not tokens.`
      );
    }
  }
}

function outputValidationResults(issues, warnings) {
  console.log("\n=== PRICING VALIDATION RESULTS ===\n");

  if (issues.length === 0) {
    console.log("✅ No critical pricing issues found!");
  } else {
    console.log(`🚨 Found ${issues.length} potential pricing issues:\n`);
    issues.forEach((issue) => console.log(issue));
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️ ${warnings.length} warnings (not critical):`);
    warnings.slice(0, 5).forEach((warning) => console.log(warning));

    if (warnings.length > 5) {
      console.log(`... and ${warnings.length - 5} more warnings`);
    }
  }

  console.log("\n✨ Validation complete!");
}

// Run the validation
main();
