# Using Refresh Tokens with Next-Auth.js and Drupal

This project is built on Nextjs. 
Uses NextAuth.js for authentication.
Authentication tokens are sent to the Drupal endpoint. Drupal uses the Oauth2 module.

We will first send a request to the Drupal endpoint to obtain access__token, refresh__token and expiration info. Then, with each request, we send a refresh__token, which gets us access__token from Drupal. But be careful. Refresh__token can be used only once and therefore we have to send a new refresh__token to the new request. Once refresh__token expires, the user will be logged out and must log in again.



## Tutorial

[https://next-auth.js.org/tutorials/refresh-token-rotation](https://next-auth.js.org/tutorials/refresh-token-rotation)
