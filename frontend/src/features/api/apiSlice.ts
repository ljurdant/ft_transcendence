import { User } from "interfaces";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "user", // reducer path
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BACK_URL,
    credentials: "include",
  }), // base query
  tagTypes: ["User"],
  endpoints(builder) {
    return {
      fetchUser: builder.query<User, string | void>({
        query(id: string) {
          if (id) {
            return `/users/${id}`;
          } else {
            return `/users/me`;
          }
        },
        providesTags: ["User"],
      }),

      fetchUsers: builder.query<User[], void>({
        query() {
          return `/users`;
        },
      }),

      updateUser: builder.mutation({
        query: (user: any) => ({
          url: `/users/me`,
          method: "PATCH",
          body: user,
        }),
        invalidatesTags: ["User"],
      }),
    };
  },
});

export const { useFetchUserQuery, useFetchUsersQuery, useUpdateUserMutation } =
  apiSlice;
