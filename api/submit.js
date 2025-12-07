
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { Translate } = require('@google-cloud/translate'); // The v2 client

const translationClient = new Translate();

async function translateToEnglish(text) {
    if (!text || typeof text !== 'string') {
        return text; // Return as is if not valid text
    }

    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.GCP_PROJECT; 
    
    if (!projectId) {
        console.warn('GOOGLE_CLOUD_PROJECT_ID or GCP_PROJECT not set. Skipping actual translation and using original text.');
        return `(Translation skipped: Google Cloud Project ID not configured)`;
    }

    try {
        // First, detect the language of the original text
        const [detectionResponse] = await translationClient.detectLanguage({
            parent: `projects/${projectId}`,
            content: text,
        });

        const detections = detectionResponse.detections;
        let detectedLanguageCode = 'unknown';

        if (detections && detections.length > 0) {
            // Find the most confident detection
            const mostConfidentDetection = detections.reduce((prev, current) => 
                (prev.confidence > current.confidence) ? prev : current);
            detectedLanguageCode = mostConfidentDetection.languageCode;
        }

        // If the detected language is English, return the original text
        if (detectedLanguageCode === 'en') {
            return text;
        }

        // Otherwise, proceed with translation
        const request = {
            parent: `projects/${projectId}`,
            contents: [text],
            targetLanguageCode: 'en',
        };
        const [translationResponse] = await translationClient.translateText(request);
        const translation = translationResponse.translations[0];
        return translation ? translation.translatedText : text;

    } catch (error) {
        console.error('Error during Google Translate API call (detect or translate):', error);
        // Return a helpful message if translation fails
        return `(Translation failed: ${error.message})`;
    }
}



module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const data = req.body;

        // --- NODEMAILER CONFIGURATION ---
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        const attachments = [];

        // --- EMAIL CONTENT ---
        const ip = req.headers['x-forwarded-for'] || 'N/A';
        const userAgent = req.headers['user-agent'] || 'N/A';
        let htmlBody = `
            <h1>New Application Received</h1>
            <p>
                <b>Received at:</b> ${new Date().toString()}<br>
                <b>Applicant IP:</b> ${ip}<br>
                <b>Applicant Device:</b> ${userAgent}<br>
            </p>
            <p>Here is the submitted data:</p>
            <table style="width: 100%; border-collapse: collapse;">
                <thead style="background-color: #f4f4f4;">
                    <tr>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Field</th>
                        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Value</th>
                    </tr>
                </thead>
                <tbody>
        `;

        for (const [key, value] of Object.entries(data)) {
            htmlBody += `
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>${key}</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">`;
            
            if ((key === 'signature_data_1' || key === 'signature_data_2') && value) {
                const cid = crypto.randomUUID();
                htmlBody += `<div style="display: inline-block;"><img src="cid:${cid}" alt="Signature" style="width: 200px; height: auto; filter: invert(1);" /></div>`;
                attachments.push({
                    filename: `${key}.png`,
                    path: value,
                    cid,
                });
            } else {
                // Translate non-signature user-filled content to English
                const englishTranslation = await translateToEnglish(value);
                // If the translation is different from the original, append both.
                // Otherwise (content was already English), just append the original.
                if (englishTranslation !== value) {
                    htmlBody += `${value}<br/>//English Translation of Original<br/>${englishTranslation}`;
                } else {
                    htmlBody += value;
                }
            }

            htmlBody += `</td>
                </tr>
            `;
        }
        
        htmlBody += `
                </tbody>
            </table>
        `;

        const mailOptions = {
            from: '"Credit App Form" <no-reply@yourdomain.com>', // Sender address
            to: process.env.EMAIL_RECIPIENTS, // List of receivers
            subject: "New Yeti Credit Application", // Subject line
            html: htmlBody,
            attachments: attachments,
        };

        // --- SEND EMAIL ---
        await transporter.sendMail(mailOptions);

        res.status(200).send('Application submitted successfully.');

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Internal Server Error');
    }
};
