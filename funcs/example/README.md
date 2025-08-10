# Recurring CSV Lambda

This project implements the Lambda function we use to automate the periodic generation of CSV reports from data stored in MongoDB. The reports are automatically uploaded to AWS S3, and notifications are sent via AWS SES to the configured recipients.

## Overview

The Lambda queries the MongoDB database according to configurations defined in each recurring object, generates CSV files based on specified filters and fields, uploads them to an S3 bucket, and then sends emails containing links to these files.

## Configuration for Emails

Email sending configurations are retrieved directly from the MongoDB database, specifically from the `recurrentCSV` collection within each domain-specific database. Each document in this collection includes the following details:

- **emails**: A list of recipient email addresses.
- **content.subject**: Subject line for the notification email.
- **content.body**: HTML body of the email, where the list of generated CSV files will be dynamically inserted as hyperlinks.

This configuration allows customizing the email recipients, subject, and message content independently for each recurring report.

## Tech Stack

- **AWS Lambda** (Node.js runtime)
- **MongoDB** for data storage
- **AWS S3** for CSV file storage
- **AWS SES** for email notifications
- **Pino** for logging

## Prerequisites

Ensure you have:

- Node.js (v22.11.0)
- npm (v10.9.0)
- AWS Account with permissions for Lambda, S3, and SES
- MongoDB database instance

## Installation

Clone the repository and install dependencies:

```bash
npm install
```

## Environment Variables

Set up the following environment variables required by the Lambda:

| Variable                  | Description                |
| ------------------------- | -------------------------- |
| `MONGODB_URL`             | Connection URL for MongoDB |
| `AWS_S3_REGION`           | AWS S3 region              |
| `AWS_S3_ACCESSKEY`        | AWS S3 Access Key          |
| `AWS_S3_ACCESSKEY_SECRET` | AWS S3 Secret Access Key   |
| `NODEMAILER_USER`         | SMTP user for Nodemailer   |
| `NODEMAILER_PASS`         | SMTP password              |
| `NODEMAILER_HOST`         | SMTP host for Nodemailer   |
| `NODEMAILER_PORT`         | SMTP port number           |

## Building the Project

```bash
npm install
npm run build
```

## Running Locally

After building:

```bash
npm start
```

## Deploying the Lambda

Deploy using the provided CLI tool (`Dx`):

- Initialize CDK (if not done previously):

```bash
npm run deploy:init
```

- To preview the deployment:

```bash
npm run deploy:preview
```

- To deploy changes:

```bash
npm run deploy
```

## Environment Configuration

The Lambda's environment variables must be set in AWS Lambda Configuration:

- Navigate to the Lambda function in AWS Console.
- Go to **Configuration > Environment variables**.
- Enter the variables listed in the prerequisites.

## Usage

The Lambda expects two inputs:

- `recurrentId`: The MongoDB Object ID representing the report configuration.
- `domainName`: The domain name (used to select the specific database).

Example AWS Lambda event payload:

```json
{
  "recurrentId": "your-object-id",
  "domainName": "your-domain-name"
}
```

## Logging

Logs are written to AWS CloudWatch Logs using Pino.

---

© DAAxAr 2025
