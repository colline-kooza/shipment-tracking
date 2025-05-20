import { 
  Shipment, 
  Notification, 
  User, 
  Document,
  Checkpoint,
  Permission
} from '../types/shipments';

// Role-based permissions mapping
const rolePermissions: Record<User['role'], Permission[]> = {
  admin: [
    'manage_users',
    'create_shipments',
    'view_shipments',
    'edit_shipments',
    'delete_shipments',
    'verify_documents',
    'manage_settings',
    'view_reports',
    'manage_tasks',
    'view_analytics'
  ],
  staff: [
    'create_shipments',
    'view_shipments',
    'edit_shipments',
    'verify_documents',
    'manage_tasks',
    'view_reports'
  ],
  agent: [
    'view_shipments',
    'edit_shipments',
    'verify_documents',
    'manage_tasks'
  ],
  client: [
    'view_shipments',
    'view_reports'
  ]
};

// Mock users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Admin',
    email: 'admin@logistics.com',
    role: 'admin',
    permissions: rolePermissions.admin
  },
  {
    id: '2',
    name: 'Sarah Staff',
    email: 'staff@logistics.com',
    role: 'staff',
    location: 'Juba',
    permissions: rolePermissions.staff
  },
  {
    id: '3',
    name: 'Mark Agent',
    email: 'agent@logistics.com',
    role: 'agent',
    location: 'Mombasa',
    permissions: rolePermissions.agent
  },
  {
    id: '4',
    name: 'Client Company',
    email: 'client@company.com',
    role: 'client',
    permissions: rolePermissions.client
  }
];

// Mock checkpoints
export const checkpoints: Checkpoint[] = [
  { id: '1', name: 'Mombasa Port', location: 'Mombasa, Kenya', order: 1 },
  { id: '2', name: 'Malaba Kenya Border', location: 'Malaba, Kenya', order: 2 },
  { id: '3', name: 'Malaba Uganda Border', location: 'Malaba, Uganda', order: 3 },
  { id: '4', name: 'Elegu', location: 'Elegu, Uganda', order: 4 },
  { id: '5', name: 'Nimule', location: 'Nimule, South Sudan', order: 5 },
  { id: '6', name: 'Nesitu', location: 'Nesitu, South Sudan', order: 6 },
  { id: '7', name: 'Juba', location: 'Juba, South Sudan', order: 7 },
  { id: '8', name: 'Juba International Airport', location: 'Juba, South Sudan', order: 0 }
];

// Mock documents
// export const documents: Document[] = [
//   {
//     id: 'd1',
//     name: 'Commercial Invoice #12345',
//     type: 'commercial_invoice',
//     fileUrl: '/documents/invoice-12345.pdf',
//     uploadedAt: '2025-03-15T10:30:00Z',
//     uploadedBy: '4',
//     status: 'verified',
//   },
//   {
//     id: 'd2',
//     name: 'Packing List #12345',
//     type: 'packing_list',
//     fileUrl: '/documents/packing-12345.pdf',
//     uploadedAt: '2025-03-15T10:35:00Z',
//     uploadedBy: '4',
//     status: 'verified',
//   },
//   {
//     id: 'd3',
//     name: 'Bill of Lading MAEU12345678',
//     type: 'bill_of_lading',
//     fileUrl: '/documents/bl-12345678.pdf',
//     uploadedAt: '2025-03-15T11:00:00Z',
//     uploadedBy: '4',
//     status: 'verified',
//   },
//   {
//     id: 'd4',
//     name: 'Import License IL-SS-2025-001',
//     type: 'import_licence',
//     fileUrl: '/documents/import-SS-2025-001.pdf',
//     uploadedAt: '2025-03-16T09:00:00Z',
//     uploadedBy: '4',
//     status: 'pending',
//     notes: 'Need to verify with authority',
//   },
//   {
//     id: 'd5',
//     name: 'Certificate of Conformity COC-12345',
//     type: 'certificate_of_conformity',
//     fileUrl: '/documents/coc-12345.pdf',
//     uploadedAt: '2025-03-16T09:15:00Z',
//     uploadedBy: '4',
//     status: 'verified',
//   },
//   {
//     id: 'd6',
//     name: 'Tax Exemption TE-2025-123',
//     type: 'tax_exemption',
//     fileUrl: '/documents/tax-2025-123.pdf',
//     uploadedAt: '2025-03-16T10:00:00Z',
//     uploadedBy: '4',
//     status: 'verified',
//   },
//   {
//     id: 'd7',
//     name: 'Certificate of Origin CO-KE-123456',
//     type: 'certificate_of_origin',
//     fileUrl: '/documents/co-KE-123456.pdf',
//     uploadedAt: '2025-03-16T10:30:00Z',
//     uploadedBy: '4',
//     status: 'verified',
//   },
//   {
//     id: 'd8',
//     name: 'Airway Bill 123-45678901',
//     type: 'airway_bill',
//     fileUrl: '/documents/awb-123-45678901.pdf',
//     uploadedAt: '2025-03-18T08:00:00Z',
//     uploadedBy: '4',
//     status: 'verified',
//   }
// ];

// Mock timeline events
// export const timelineEvents: TimelineEvent[] = [
//   {
//     id: 'e1',
//     shipmentId: 's1',
//     status: 'document_received',
//     notes: 'All pre-alert documents received from client',
//     timestamp: '2025-03-15T12:00:00Z',
//     createdBy: '2'
//   },
//   {
//     id: 'e2',
//     shipmentId: 's1',
//     status: 'documents_sent',
//     notes: 'Documents sent to agent in Mombasa',
//     timestamp: '2025-03-16T14:30:00Z',
//     createdBy: '2'
//   },
//   {
//     id: 'e3',
//     shipmentId: 's1',
//     status: 'cargo_arrived',
//     location: 'Mombasa Port',
//     notes: 'Container MAEU1234567 arrived at Mombasa port',
//     timestamp: '2025-03-20T08:15:00Z',
//     createdBy: '3'
//   },
//   {
//     id: 'e4',
//     shipmentId: 's1',
//     status: 'delivery_confirmed',
//     notes: 'Delivery order confirmed with shipping line',
//     timestamp: '2025-03-21T10:00:00Z',
//     createdBy: '3'
//   },
//   {
//     id: 'e5',
//     shipmentId: 's1',
//     status: 'entry_registered',
//     notes: 'Entry registered with KRA',
//     timestamp: '2025-03-22T11:30:00Z',
//     createdBy: '3'
//   },
//   {
//     id: 'e6',
//     shipmentId: 's2',
//     status: 'document_received',
//     notes: 'Airway bill and supporting documents received',
//     timestamp: '2025-03-18T09:30:00Z',
//     createdBy: '2'
//   },
//   {
//     id: 'e7',
//     shipmentId: 's2',
//     status: 'documents_sent',
//     notes: 'Documents sent to Juba airport staff',
//     timestamp: '2025-03-18T11:00:00Z',
//     createdBy: '2'
//   },
//   {
//     id: 'e8',
//     shipmentId: 's2',
//     status: 'cargo_arrived',
//     location: 'Juba International Airport',
//     notes: 'Cargo arrived on flight ET-345',
//     timestamp: '2025-03-19T14:20:00Z',
//     createdBy: '2'
//   }
// ];

// Mock shipments
// export const shipments: Shipment[] = [
//   {
//     id: 's1',
//     reference: 'SUD-SEA-2025-001',
//     client: 'Global Trading Ltd',
//     origin: 'mombasa',
//     destination: 'Juba',
//     status: 'entry_registered',
//     documents: documents.slice(0, 7),
//     timeline: timelineEvents.filter(event => event.shipmentId === 's1'),
//     container: 'MAEU1234567',
//     arrivalDate: '2025-03-20T08:15:00Z',
//     invoiceStatus: 'pending',
//     createdAt: '2025-03-15T10:00:00Z'
//   },
//   {
//     id: 's2',
//     reference: 'SUD-AIR-2025-001',
//     client: 'Juba Medical Supplies',
//     origin: 'juba_airport',
//     destination: 'Juba',
//     status: 'cargo_arrived',
//     documents: [documents[7]],
//     timeline: timelineEvents.filter(event => event.shipmentId === 's2'),
//     arrivalDate: '2025-03-19T14:20:00Z',
//     invoiceStatus: 'pending',
//     createdAt: '2025-03-18T09:00:00Z'
//   }
// ];

// Mock notifications
// export const notifications: Notification[] = [
//   {
//     id: 'n1',
//     type: 'document_alert',
//     title: 'Document Verification Required',
//     message: 'Import License for shipment SUD-SEA-2025-001 requires verification',
//     isRead: false,
//     timestamp: '2025-03-16T09:05:00Z',
//     userId: '1',
//     shipmentId: 's1',
//     documentId: 'd4'
//   },
//   {
//     id: 'n2',
//     type: 'status_change',
//     title: 'Shipment Status Update',
//     message: 'Shipment SUD-SEA-2025-001 has been registered with KRA',
//     isRead: false,
//     timestamp: '2025-03-22T11:35:00Z',
//     userId: '1',
//     shipmentId: 's1'
//   },
//   {
//     id: 'n3',
//     type: 'status_change',
//     title: 'Cargo Arrived',
//     message: 'Air cargo for SUD-AIR-2025-001 has arrived at Juba International Airport',
//     isRead: true,
//     timestamp: '2025-03-19T14:25:00Z',
//     userId: '1',
//     shipmentId: 's2'
//   }
// ];

export const getRolePermissions = (role: User['role']): Permission[] => {
  return rolePermissions[role] || [];
};