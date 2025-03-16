-- CreateTable
CREATE TABLE "Vendor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "pricingUrl" TEXT NOT NULL,
    "modelsListUrl" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AIModel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "systemName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "parametersB" REAL NOT NULL,
    "host" TEXT NOT NULL,
    "precision" TEXT,
    "description" TEXT,
    "contextWindow" INTEGER,
    "tokenLimit" INTEGER,
    "releaseDate" DATETIME,
    "categoryId" INTEGER NOT NULL,
    "vendorId" INTEGER NOT NULL,
    CONSTRAINT "AIModel_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AIModel_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pricing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "inputText" REAL NOT NULL,
    "outputText" REAL NOT NULL,
    "finetuningInput" REAL,
    "finetuningOutput" REAL,
    "trainingCost" REAL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modelId" INTEGER NOT NULL,
    CONSTRAINT "Pricing_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AIModel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PricingHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inputText" REAL NOT NULL,
    "outputText" REAL NOT NULL,
    "finetuningInput" REAL,
    "finetuningOutput" REAL,
    "trainingCost" REAL,
    "modelId" INTEGER NOT NULL,
    CONSTRAINT "PricingHistory_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AIModel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Pricing_modelId_key" ON "Pricing"("modelId");
