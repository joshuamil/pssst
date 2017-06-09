const aws = require('aws-sdk');
const ses = new aws.SES();

exports.handler = function (event, context) {

  // Check required parameters
  if (event.message === null) {
    console.log('message body missing');
    context.fail('Bad Request: Missing required member: message');
    return;
  }

  let config = {
    "targetAddress" : "josh.miller@skookum.com",
    "fromAddress": "Joshua Miller <josh.miller@skookum.com>",
    "defaultSubject" : "Anonymous feedback submission"
  };

  // Convert newlines in the message
  if (event.message !== null) {
    event.message = event.message
      .replace("\r\n", "<br />")
      .replace("\r", "<br />")
      .replace("\n", "<br />");
  }

  let name = event.email || config.fromAddress;
  let subject = event.subject || config.defaultSubject;
  let message = `<h1>Anonymous Feedback Submission</h1>
  <p>${event.message}</p>`;

  let params = {
    Destination: {
      ToAddresses: [
        config.targetAddress
      ]
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8'
      },
      Body: {
        Html: {
          Data: message,
          Charset: 'UTF-8'
        }
      }
    },
    Source: name,
    ReplyToAddresses: [
      name
    ]
  };

  // Send the email
  ses.sendEmail(params, function (err, data) {
    if (err) {
      console.log(err, err.stack);
      context.fail('The email could not be sent.');
    } else {
      console.log(data);
      context.succeed(`The email was successfully sent to ${name}`);
    }
  });

};
