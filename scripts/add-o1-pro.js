const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    // Add O1-Pro model
    const model = await prisma.aIModel.create({
      data: {
        systemName: "o1-pro",
        displayName: "O1-Pro",
        parametersB: 0,
        host: "api.openai.com",
        description:
          "The o1 series of models are trained with reinforcement learning to think before they answer and perform complex reasoning. The o1-pro model uses more compute to think harder and provide consistently better answers.",
        contextWindow: 200000,
        tokenLimit: 100000,
        releaseDate: new Date("2023-09-30"),
        isOpenSource: false,
        isHidden: false,
        category: {
          connect: { id: 5 }, // Reasoning-focused category
        },
        vendor: {
          connect: { id: 1 }, // OpenAI vendor
        },
        pricing: {
          create: {
            inputText: 150.0,
            outputText: 600.0,
          },
        },
      },
    });

    console.log("Added O1-Pro model:", model);
  } catch (error) {
    console.error("Error adding model:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
