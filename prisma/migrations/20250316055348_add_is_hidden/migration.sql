-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AIModel" (
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
    "isOpenSource" BOOLEAN DEFAULT false,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" INTEGER NOT NULL,
    "vendorId" INTEGER NOT NULL,
    CONSTRAINT "AIModel_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AIModel_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AIModel" ("categoryId", "contextWindow", "description", "displayName", "host", "id", "isOpenSource", "parametersB", "precision", "releaseDate", "systemName", "tokenLimit", "vendorId") SELECT "categoryId", "contextWindow", "description", "displayName", "host", "id", "isOpenSource", "parametersB", "precision", "releaseDate", "systemName", "tokenLimit", "vendorId" FROM "AIModel";
DROP TABLE "AIModel";
ALTER TABLE "new_AIModel" RENAME TO "AIModel";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
