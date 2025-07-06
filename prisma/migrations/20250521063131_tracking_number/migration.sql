/*
  Warnings:

  - A unique constraint covering the columns `[trackingNumber]` on the table `Shipment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "trackingNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_trackingNumber_key" ON "Shipment"("trackingNumber");
