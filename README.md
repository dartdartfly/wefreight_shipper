# wefreight_shipper

## Setup

This project uses a Vercel Serverless Function to send an email with the form data. To make this work, you need to configure your Gmail account and set up environment variables.

### 1. Create a Gmail App Password

If you use 2-Step Verification on your Gmail account (which is highly recommended), you'll need to create an "App Password" for this application.

1.  Go to your Google Account settings: [https://myaccount.google.com/](https://myaccount.google.com/)
2.  Go to **Security**.
3.  Under "Signing in to Google," select **App passwords**. You may need to sign in again.
4.  At the bottom, choose **Select app** and choose **Other (Custom name)**.
5.  Enter a name for the app (e.g., "Wefreight Shipper Form") and click **Generate**.
6.  You will see a 16-character password. **Copy this password.** You will need it in the next step.

### 2. Set Environment Variables

You need to set two environment variables to store your Gmail credentials securely.

*   `GMAIL_USER`: Your Gmail address (e.g., `your-email@gmail.com`).
*   `GMAIL_APP_PASSWORD`: The 16-character App Password you generated in the previous step.

#### For Local Development

You can set these variables in the `vercel.json` file.

**IMPORTANT:** Do not commit the `vercel.json` file with your real credentials to a public repository.

```json
{
  "env": {
    "GMAIL_USER": "your-gmail-username@gmail.com",
    "GMAIL_APP_PASSWORD": "your-gmail-app-password"
  },
  ...
}
```

#### For Production (on Vercel)

For your deployed application on Vercel, you should set these environment variables in your project settings:

1.  Go to your project on Vercel.
2.  Go to the **Settings** tab.
3.  Click on **Environment Variables**.
4.  Add `GMAIL_USER` and `GMAIL_APP_PASSWORD` with their respective values.

This is the most secure way to handle your credentials.