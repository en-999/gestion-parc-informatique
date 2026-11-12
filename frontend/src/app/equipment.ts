export interface Equipment {
  id: number;
  inventoryNumber: string;
  name: string;
  type: string;
  status: string;
  provenance: string;
  description: string;
  createdAt: string | null;
}

export type EquipmentPayload = Omit<Equipment, 'id' | 'inventoryNumber' | 'createdAt'>;
