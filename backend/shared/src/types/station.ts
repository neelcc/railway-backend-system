export interface  Station {
    id? : string;
    name: string;
    code: string;
    city: string;
    state: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }

  export interface getAllStationParams {
    search?: string | undefined ;
    page?: string | undefined ;
    limit?: string | undefined;
}