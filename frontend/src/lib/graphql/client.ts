import "server-only";
import { GraphQLClientError, type GraphQLErrorItem } from "./errors";

type GraphQLResponse<TData> = {
  data?: TData;
  errors?: GraphQLErrorItem[];
};

type GraphQLRequestOptions<TVariables> = {
  query: string;
  variables?: TVariables;
  token?: string;
  cache?: RequestCache;
  next?: {
    revalidate?: number;
    tags?: string[];
  };
};

const GRAPHQL_ENDPOINT = process.env.BACKEND_GRAPHQL_URL ?? "http://localhost:4000/graphql";

export async function graphqlRequest<
  TData,
  TVariables extends Record<string, unknown> = Record<string, never>,
>(options: GraphQLRequestOptions<TVariables>): Promise<TData> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const fetchOptions: RequestInit & {
    next?: {
      revalidate?: number;
      tags?: string[];
    };
  } = {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: options.query,
      variables: options.variables ?? {},
    }),
  };

  if (options.cache) {
    fetchOptions.cache = options.cache;
  }

  if (options.next) {
    fetchOptions.next = options.next;
  }

  if (!options.cache && !options.next) {
    fetchOptions.cache = "no-store";
  }

  const response = await fetch(GRAPHQL_ENDPOINT, fetchOptions);

  if (!response.ok) {
    throw new Error(`GraphQL HTTP error: ${response.status}`);
  }

  const json = (await response.json()) as GraphQLResponse<TData>;

  if (json.errors?.length) {
    throw new GraphQLClientError(json.errors);
  }

  if (!json.data) {
    throw new Error("GraphQL response does not contain data.");
  }

  return json.data;
}
