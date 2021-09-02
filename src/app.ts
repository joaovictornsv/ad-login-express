/* eslint-disable no-unused-vars */
import express from 'express';
import 'dotenv/config';
import * as msal from '@azure/msal-node';

const app = express();

const config = {
  auth: {
    clientId: process.env.CLIENT_ID,
    authority: process.env.AUTHORITY,
    clientSecret: process.env.CLIENT_SECRET,
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel: any, message: any, containsPii: any) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: msal.LogLevel.Verbose,
    },
  },
};

const cca = new msal.ConfidentialClientApplication(config);

app.get('/', async (req, res) => {
  const authCodeUrlParameters = {
    scopes: ['user.read'],
    redirectUri: 'http://localhost:3333/redirect',
  };

  // get url to sign user in and consent to scopes needed for application
  cca.getAuthCodeUrl(authCodeUrlParameters).then((response) => {
    res.redirect(response);
  }).catch((error) => console.log(error));
});

app.get('/redirect', (req, res) => {
  const tokenRequest = {
    code: req.query.code,
    scopes: ['user.read'],
    redirectUri: 'http://localhost:3333/redirect',
  } as msal.AuthorizationCodeRequest;

  cca.acquireTokenByCode(tokenRequest).then((response) => {
    console.log('\nResponse: \n:', response);
    res.sendStatus(200);
  }).catch((error) => {
    console.log(error);
    res.status(500).send(error);
  });
});

export { app };
