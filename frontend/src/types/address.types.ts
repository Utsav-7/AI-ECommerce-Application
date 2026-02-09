export interface Address {
  id: number;
  userId: number;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateAddressRequest {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
}

export interface UpdateAddressRequest extends CreateAddressRequest {}
