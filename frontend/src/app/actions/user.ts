'use server';

import { graphqlRequest } from '@/lib/graphql/client';
import { revalidatePath } from 'next/cache';

const ADD_SAVED_PASSENGER_MUTATION = `
  mutation AddSavedPassenger($name: String!, $email: String!, $phone: String!) {
    addSavedPassenger(name: $name, email: $email, phone: $phone) {
      id
      name
      email
      phone
    }
  }
`;

const GET_SAVED_PASSENGERS_QUERY = `
  query GetSavedPassengers {
    savedPassengers {
      id
      name
      email
      phone
    }
  }
`;

export async function getSavedPassengersAction() {
  try {
    const data = await graphqlRequest<{ savedPassengers: any[] }>(
      { query: GET_SAVED_PASSENGERS_QUERY }
    );
    return { success: true, passengers: data?.savedPassengers || [] };
  } catch (error: any) {
    console.error('getSavedPassengersAction failed:', error);
    return { success: false, error: error.message || 'Failed to fetch saved passengers' };
  }
}

export async function addSavedPassengerAction(name: string, email: string, phone: string) {
  try {
    const data = await graphqlRequest<{ addSavedPassenger: any }>(
      { query: ADD_SAVED_PASSENGER_MUTATION, variables: { name, email, phone } }
    );
    revalidatePath('/booking/[tripId]', 'page');
    return { success: true, passenger: data?.addSavedPassenger };
  } catch (error: any) {
    console.error('addSavedPassengerAction failed:', error);
    return { success: false, error: error.message || 'Failed to add saved passenger' };
  }
}
