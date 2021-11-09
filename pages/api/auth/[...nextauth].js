import NextAuth from "next-auth";
import Providers from "next-auth/providers";

/**
 * Takes a refresh token, and returns a new token with updated
 * `accessToken` `refreshToken` , and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token) {
  try {
    const body =
      new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      });

    const response = await fetch(process.env.BACKEND_TOKEN_ENDPOINT, {  // drupalpage.com/oauth/token
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: "POST",
      body
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token ?? null,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
    };
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export default NextAuth({
  providers: [
    Providers.Credentials({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: "Email:", type: "text", value: "nextjs.features@gmail.com" },
        password: { label: "Password:", type: "password", value: "Laad?8248asdH" }
      },
      async authorize(credentials, req) {
        const bodyData = {
          grant_type: 'password',
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          username: credentials.username,
          password: credentials.password,
        };
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
        // You can also use the `req` object to obtain additional parameters
        const res = await fetch(process.env.BACKEND_TOKEN_ENDPOINT, {
          method: 'POST',
          body: new URLSearchParams(bodyData),
          headers: { Accept: 'application/json', "Content-Type": "application/x-www-form-urlencoded" }
        })
        const userToken = await res.json();

        // If no error and we have user data, return it
        if (res.ok && userToken.access_token) {
          return { id: 1, name: 'Martin Ivanko', email: 'mtest@example.com', ...userToken }
        } else {
          // Return null if user data could not be retrieved
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt(token, user, account) {
      // Initial sign in
      if (account && user) {
        token = {
          id: user.id,
          name: user.name,
          email: user.email,
          accessToken: user.access_token,
          accessTokenExpires: Date.now() + user.expires_in * 1000,
          refreshToken: user.refresh_token
        };
      }
      // Return previous token if the access token has not expired yet
      if (Date.now() < token.accessTokenExpires) {
        return token;
      } else {
        // Access token has expired, try to update it
        return await refreshAccessToken(token);
      }
    },
    async session(session, token) {
      if (token) {
        session.accessToken = token.accessToken;
        session.error = token.error;
      }
      return session;
    },
  },
});
