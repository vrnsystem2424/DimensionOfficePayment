

const { google } = require('googleapis');
require('dotenv').config(); // dotenv yahan load kar lo

const credentials = {
  type: process.env.GOOGLE_TYPE,
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: process.env.GOOGLE_AUTH_URI,
  token_uri: process.env.GOOGLE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN,
};

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
  ],
});

const sheets = google.sheets({ version: 'v4', auth });
const drive = google.drive({ version: 'v3', auth, supportsAllDrives: true });

const spreadsheetId = process.env.SPREADSHEET_ID;
// const SPREADSHEET_ID_OFFICE_EXPENSES = process.env.SPREADSHEET_ID_OFFICE_EXPENSES;
// const Summary_ID = process.env.SPREADSHEET_ID_Summary;
// const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || 'root'; // default root
// const SPREADSHEET_GST_SHEET_ID=process.env.SPREADSHEET_GST_ID

module.exports = { 
  sheets, 
  drive, 
  spreadsheetId, 
  // SPREADSHEET_ID_OFFICE_EXPENSES,
  // GOOGLE_DRIVE_FOLDER_ID ,
  // Summary_ID,
  // SPREADSHEET_GST_SHEET_ID
};