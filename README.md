# WA Verification

This is a project to verify if the phone number is registered on WhatsApp.

## Installation

Instructions on how to install and set up the project.

- Clone the repository (if is necessary)
- Install the dependencies with npm install or yarn install.
  - express
  - @whiskeysockets/baileys
  - qrcode-terminal
- Run the project (npm test or yarn test)
- Scan the QR code with your phone

## Usage

This project is a simple API that runs on port 3000 and has only one route: /verify. It receives a POST request with a JSON body containing the phone number to be verified and returns a JSON response with the result of the verification.
