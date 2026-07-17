import { graphqlRequest } from "../graphql/client";
import { LOGIN_MUTATION, REGISTER_MUTATION, ME_QUERY } from "../graphql/documents";
import type { LoginResult, RegisterResult, MeResult, AuthPayload } from "../graphql/types";

export async function loginStudent(input: { email: string; password: string }): Promise<AuthPayload> {
  const data = await graphqlRequest<LoginResult, { email: string; password: string }>({
    query: LOGIN_MUTATION,
    variables: input,
    cache: "no-store",
  });
  return data.login;
}

export async function createStudent(input: { name: string; email: string; password: string; role?: string }): Promise<AuthPayload> {
  const data = await graphqlRequest<RegisterResult, { name: string; email: string; password: string; role?: string }>({
    query: REGISTER_MUTATION,
    variables: input,
    cache: "no-store",
  });
  return data.register;
}

export async function getMe(token: string) {
  const data = await graphqlRequest<MeResult>({
    query: ME_QUERY,
    token,
    cache: "no-store",
  });
  return data.me;
}
