import { db } from "@/prisma/db";
import { ShipmentType } from "@prisma/client";

export async function generateShipmentReference(type: ShipmentType): Promise<string> {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  
  // Get prefix based on shipment type
  const prefix = type === 'SEA' ? 'SEA' : type === 'AIR' ? 'AIR' : 'ROAD';
  
  // Get the count of shipments for the current year and type
  const count = await db.shipment.count({
    where: {
      type,
      createdAt: {
        gte: new Date(currentDate.getFullYear(), 0, 1),
      },
    },
  });
  
  // Format: TYPE-YYYY-MM-SEQUENCE
  const sequence = String(count + 1).padStart(3, '0');
  return `${prefix}-${year}-${month}-${sequence}`;
}

// Function to get document type label
export function getDocumentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'COMMERCIAL_INVOICE': 'Commercial Invoice',
    'PACKING_LIST': 'Packing List',
    'BILL_OF_LADING': 'Bill of Lading',
    'AIRWAY_BILL': 'Airway Bill',
    'IMPORT_LICENCE': 'Import License',
    'CERTIFICATE_OF_CONFORMITY': 'Certificate of Conformity',
    'TAX_EXEMPTION': 'Tax Exemption',
    'CERTIFICATE_OF_ORIGIN': 'Certificate of Origin',
    'CMR_WAYBILL': 'CMR Waybill',
  };
  
  return labels[type] || type;
}

// Function to get document requirements based on shipment type
export function getRequiredDocuments(type: ShipmentType) {
  const baseDocuments = [
    'COMMERCIAL_INVOICE',
    'PACKING_LIST',
    'IMPORT_LICENCE',
    'CERTIFICATE_OF_CONFORMITY',
    'TAX_EXEMPTION',
    'CERTIFICATE_OF_ORIGIN'
  ];

  switch (type) {
    case 'SEA':
      return [...baseDocuments, 'BILL_OF_LADING'];
    case 'AIR':
      return [...baseDocuments, 'AIRWAY_BILL'];
    case 'ROAD':
      return [...baseDocuments, 'CMR_WAYBILL'];
    default:
      return baseDocuments;
  }
}

// Function to get document descriptions
export function getDocumentTypeDescription(type: string): string {
  const descriptions: Record<string, string> = {
    'COMMERCIAL_INVOICE': 'Bill for the goods from the seller to the buyer',
    'PACKING_LIST': 'Detailed list of items in the shipment',
    'BILL_OF_LADING': 'Receipt of goods and contract of carriage',
    'AIRWAY_BILL': 'Air transport document for international shipments',
    'IMPORT_LICENCE': 'Authorization to import restricted goods',
    'CERTIFICATE_OF_CONFORMITY': 'Confirms products meet quality standards',
    'TAX_EXEMPTION': 'Documentation for tax-exempt status',
    'CERTIFICATE_OF_ORIGIN': 'Document certifying where goods were manufactured',
    'CMR_WAYBILL': 'Contract for international road transport',
  };
  
  return descriptions[type] || '';
}

// Function to format shipment status to a readable string
export function formatShipmentStatus(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

// Function to get origin name based on shipment type
export function getDefaultOrigin(type: ShipmentType): string {
  switch (type) {
    case 'SEA':
      return 'Mombasa Port';
    case 'AIR':
      return 'Juba International Airport';
    case 'ROAD':
      return ''; 
    default:
      return '';
  }
}