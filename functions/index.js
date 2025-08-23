// A self-contained Firebase Cloud Function to send an email when a new
// leave record is created.

// Import necessary libraries.
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

// Initialize the Firebase Admin SDK to interact with Firestore.
admin.initializeApp();
const db = admin.firestore();

// The Cloud Function is triggered when a new document is added to the
// "leaves" collection.
exports.sendLeaveNotificationEmail = functions.firestore
    .document("artifacts/{appId}/public/data/leaves/{leaveId}")
    .onCreate(async (snap, context) => {
        // Configure the email transport using a service like Gmail, SendGrid, etc.
        // The credentials should be stored securely in Firebase environment variables.
        // Use the Firebase CLI command to set these:
        // firebase functions:config:set email.user="your-email@gmail.com"
        // firebase functions:config:set email.pass="your-password"
        const transporter = nodemailer.createTransport({
            service: "gmail", // Or "SendGrid", "Mailgun", etc.
            auth: {
                user: functions.config().email.user,
                pass: functions.config().email.pass,
            },
        });

        // Get the new leave record data from the snapshot.
        const newLeaveRecord = snap.data();

        // Retrieve the employee's email from the employee collection using their ID.
        const employeeRef = db.collection("artifacts")
            .doc(context.params.appId)
            .collection("public")
            .doc("data")
            .collection("employees")
            .where("employeeId", "==", newLeaveRecord.employeeId);

        try {
            const employeeSnapshot = await employeeRef.get();
            if (employeeSnapshot.empty) {
                console.log("No employee found with that employeeId.");
                return null;
            }

            const employee = employeeSnapshot.docs[0].data();
            const recipientEmail = employee.email;

            // Construct the email subject and body using data from the leave record.
            const mailOptions = {
                from: functions.config().email.user,
                to: recipientEmail,
                subject: `New Leave Request for ${newLeaveRecord.name} ` +
                    `${newLeaveRecord.surname}`,
                html: `
                    <div style="font-family: Arial, sans-serif; ` +
                    `line-height: 1.6; color: #333;">
                        <h2 style="color: #4A90E2;">` +
                    `New Leave Application Submitted</h2>
                        <p>Hello ${newLeaveRecord.name},</p>
                        <p>A new leave application has been submitted on ` +
                    `your behalf. Here are the details:</p>
                        <ul style="list-style-type: none; padding: 0;">
                            <li><strong>Employee:</strong> ` +
                    `${newLeaveRecord.name} ${newLeaveRecord.surname}</li>
                            <li><strong>Leave Type:</strong> ` +
                    `${newLeaveRecord.leaveType}</li>
                            <li><strong>Dates:</strong> ` +
                    `${newLeaveRecord.startDate} to ${newLeaveRecord.endDate}</li>
                            <li><strong>Calculated Days:</strong> ` +
                    `${newLeaveRecord.calculatedLeaveDays}</li>
                            <li><strong>Remaining Annual Leave:</strong> ` +
                    `${newLeaveRecord.remainingDays}</li>
                        </ul>
                        <p><strong>Manager's Message:</strong></p>
                        <p style="background-color: #f4f4f4; padding: 10px; ` +
                    `border-left: 4px solid #4A90E2;">
                            ${newLeaveRecord.message || "No message provided."}
                        </p>
                        <p>Please log in to the Leave Tracker application ` +
                    `for more details.</p>
                        <hr style="border: none; border-top: 1px solid #ddd; ` +
                    `margin: 20px 0;">
                        <p style="font-size: 12px; color: #888;">` +
                    `This is an automated message. Please do not reply.</p>
                    </div>
                `,
            };

            // Send the email.
            await transporter.sendMail(mailOptions);
            console.log("Notification email sent successfully to",
                recipientEmail);
            return { success: true };
        } catch (error) {
            console.error("There was an error while sending the email:",
                error);
            return { success: false, error: error.message };
        }
    });
