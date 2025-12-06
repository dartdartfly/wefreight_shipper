
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const data = req.body;

        // --- NODEMAILER CONFIGURATION ---
        // It's recommended to use environment variables for security.
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD 
            }
        });


        // --- EMAIL CONTENT ---
        const mailOptions = {
            from: '"Credit App Form" <no-reply@yourdomain.com>', // Sender address
            to: "aray4702@gmail.com", // List of receivers
            subject: "New Commercial Credit Application", // Subject line
            html: `
                <h1>New Credit Application Received</h1>
                <p>Here is the submitted data:</p>
                <pre>${JSON.stringify(data, null, 2)}</pre>
            `
        };

        // --- SEND EMAIL ---
        await transporter.sendMail(mailOptions);

        res.status(200).send('Application submitted successfully.');

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Internal Server Error');
    }
};
