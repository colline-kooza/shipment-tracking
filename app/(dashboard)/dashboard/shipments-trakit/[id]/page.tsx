import { ShipmentDetail } from '@/components/Shipments/detailed-component';
import React from 'react';

interface ShipmentEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: ShipmentEditPageProps) {
  const id = (await params).id;
  
  return <ShipmentDetail id={id} />;
}