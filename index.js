const express = require('express');
const { DisconnectReason, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const makeWASocket = require("@whiskeysockets/baileys").default;

async function startServerAfterConnection() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state,
    });

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update || {};

        if (connection === "open") {
            const app = express();

            app.use(express.json());

            app.post('/validate', async (req, res) => {
                const phoneNumber = req.body.phoneNumber;

                const [result] = await sock.onWhatsApp(phoneNumber);

                if (result === undefined) {
                    res.send({
                        exists: false,
                        message: `El número de teléfono ${phoneNumber} no existe en WhatsApp`
                    });
                } else if (result.exists) {
                    res.send({
                        exists: true,
                        message: `El número de teléfono ${phoneNumber} existe en WhatsApp`
                    });
                } else {
                    res.send({
                        exists: false,
                        message: `El número de teléfono ${phoneNumber} no existe en WhatsApp`
                    });
                }
            });

            const PORT = process.env.PORT || 3000;

            app.listen(PORT, () => {
                console.log(`Servidor escuchando en el puerto ${PORT}`);
            });
        } else if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;

            if (shouldReconnect) {
                startServerAfterConnection();
            }
        }
    });

    sock.ev.on("messages.update", (messageInfo) => {
        console.log(messageInfo);
    });

    sock.ev.on("messages.upsert", (messageInfoUpsert) => {
        console.log(messageInfoUpsert);
    });
    sock.ev.on("creds.update", saveCreds);
}

startServerAfterConnection();
