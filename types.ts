
export interface EquipmentData {
  id: number;
  name: string;
  startValue: number | '';
  endValue: number | '';
  isOpen: boolean;
}

export type PointType = 'Ponto 1' | 'Ponto 2';

export interface OperationState {
  city: string;
  points: {
    [key in PointType]: EquipmentData[];
  };
}
