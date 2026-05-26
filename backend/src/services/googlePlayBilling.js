const { google } = require('googleapis');

const GOOGLE_PLAY_SCOPE = ['https://www.googleapis.com/auth/androidpublisher'];
const DEFAULT_PACKAGE_NAME = 'pk.shadii.app';
const DEFAULT_PRODUCT_IDS = Object.freeze({
    basic: 'pk.shadii.app.basic_1m',
    standard: 'pk.shadii.app.standard_3m',
    premium: 'pk.shadii.app.premium_6m',
    boost: 'pk.shadii.app.boost_3d',
    contact_unlock: 'pk.shadii.app.contact_unlock',
});

function parseServiceAccountCredentials() {
    if (process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_BASE64) {
        const decoded = Buffer.from(process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_BASE64, 'base64').toString('utf8');
        return JSON.parse(decoded);
    }

    if (process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON) {
        return JSON.parse(process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON);
    }

    if (process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_PRIVATE_KEY) {
        return {
            project_id: process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_PROJECT_ID || undefined,
            client_email: process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
        };
    }

    return null;
}

function hasGooglePlayVerificationConfig() {
    try {
        return Boolean(parseServiceAccountCredentials());
    } catch (_) {
        return false;
    }
}

function getGooglePlayPackageName() {
    return process.env.GOOGLE_PLAY_PACKAGE_NAME || DEFAULT_PACKAGE_NAME;
}

function getGooglePlayProductMap() {
    return {
        basic: process.env.GOOGLE_PLAY_PRODUCT_BASIC || DEFAULT_PRODUCT_IDS.basic,
        standard: process.env.GOOGLE_PLAY_PRODUCT_STANDARD || DEFAULT_PRODUCT_IDS.standard,
        premium: process.env.GOOGLE_PLAY_PRODUCT_PREMIUM || DEFAULT_PRODUCT_IDS.premium,
        boost: process.env.GOOGLE_PLAY_PRODUCT_BOOST || DEFAULT_PRODUCT_IDS.boost,
        contact_unlock: process.env.GOOGLE_PLAY_PRODUCT_CONTACT_UNLOCK || DEFAULT_PRODUCT_IDS.contact_unlock,
    };
}

function getGooglePlayProductId(plan) {
    return getGooglePlayProductMap()[plan] || null;
}

async function getAndroidPublisherClient() {
    const credentials = parseServiceAccountCredentials();

    if (!credentials) {
        throw new Error('Google Play Billing verification is not configured on the server.');
    }

    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: GOOGLE_PLAY_SCOPE,
    });

    return google.androidpublisher({ version: 'v3', auth });
}

async function verifyGooglePlayPurchase({ packageName, productId, purchaseToken }) {
    if (!productId || !purchaseToken) {
        throw new Error('Google Play purchase verification requires both productId and purchaseToken.');
    }

    const publisher = await getAndroidPublisherClient();
    const { data } = await publisher.purchases.products.get({
        packageName: packageName || getGooglePlayPackageName(),
        productId,
        token: purchaseToken,
    });

    return {
        valid: data.purchaseState === 0,
        response: data,
    };
}

module.exports = {
    DEFAULT_PRODUCT_IDS,
    getGooglePlayPackageName,
    getGooglePlayProductId,
    getGooglePlayProductMap,
    hasGooglePlayVerificationConfig,
    verifyGooglePlayPurchase,
};
