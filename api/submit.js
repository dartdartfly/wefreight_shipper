
const nodemailer = require('nodemailer');

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
        let htmlBody = `
            <h1>New Credit Application Received</h1>
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
                const cid = `${key}@submission.com`;
                htmlBody += `<img src="cid:${cid}" alt="Signature" style="width: 200px; height: auto;" />`;
                attachments.push({
                    filename: `${key}.png`,
                    path: value,
                    cid,
                });
            } else {
                htmlBody += value;
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
            to: "sloan3165@gmail.com", // List of receivers
            subject: "New Commercial Credit Application", // Subject line
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
