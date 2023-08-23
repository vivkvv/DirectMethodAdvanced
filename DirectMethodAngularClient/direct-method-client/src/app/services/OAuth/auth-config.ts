import {AuthConfig} from "angular-oauth2-oidc";

import { google_environment } from "src/environments/environment";

export const googleAuthConfig: AuthConfig = {
    issuer: 'https://accounts.google.com',
    clientId: '1056330085698-p14refckgcbhs0533767eq2non7597nf.apps.googleusercontent.com',
    scope: 'openid profile email',
    clearHashAfterLogin: false,
    strictDiscoveryDocumentValidation: false,
    redirectUri: google_environment.redirectUri,
    // ClientSecret = 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
    //responseType: 'code'
};