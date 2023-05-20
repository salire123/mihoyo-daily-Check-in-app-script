# Mihoyo Daily Check-in App Script

This script is designed to be used with Google Apps Script for automating the daily check-in process for various Mihoyo games. By using this script, you can streamline the daily check-in process and receive notifications on Discord.

## Instructions

To use this script, follow these steps:

1. Copy the content of the `mihoyo-daily-Check-in.js` file to your Google Apps Script editor.

2. Set the necessary script properties by adding the following properties to your script:

   - `COOKIE`: This property should contain the cookie value for your Mihoyo account. It is required for authentication.

   - `Discord_webhook`: This property should contain the webhook URL for your Discord server. Notifications will be sent to this webhook.

   If you have any of the following games, set their respective properties to `true`:

   - `GENSHIN`: Set to `true` if you have Genshin Impact.
   - `STARRAIL`: Set to `true` if you have Honkai: Star Rail.
   - `HONKAI`: Set to `true` if you have Honkai Impact 3rd.
   - `THEMIS`: Set to `true` if you have Tears of Themis.

3. Save the script and authorize it to run on your behalf.

4. Set up a trigger to run the script daily. You can do this by going to the "Triggers" menu in Google Apps Script and adding a new trigger for the `run` function. Choose the time of day when you want the check-in to be performed.

5. You're all set! The script will now automatically perform the daily check-in for your selected games and send notifications to your Discord server.

## Notes

- Make sure to keep your script and webhook URL confidential, as they contain sensitive information.

- This script is provided as-is, and the author takes no responsibility for any issues or damages that may arise from its usage.

- Happy gaming and enjoy your daily check-ins!
