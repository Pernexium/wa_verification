const express = require('express');
const {
    DisconnectReason,
    useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const makeWASocket = require("@whiskeysockets/baileys").default;
const { useMySQLAuthState } = require("mysql-baileys");
const QRCode = require("qrcode");


const socks = {};

async function connectToWA(sessionName) {
    const { state, saveCreds, removeCreds } = await useMySQLAuthState({
        session: sessionName,
        host: "pernexium-db.cfioetbrvik6.us-east-2.rds.amazonaws.com",
        port: 3306,
        user: "analitica_espejel",
        password: "7s4xV8'YpK4}&I<",
        database: "analitica",
    });

    socks[sessionName] = makeWASocket({
        printQRInTerminal: true,
        auth: state,
    });

    socks[sessionName].ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update || {};
        if (qr) {
            console.log(qr);
            QRCode.toFile(`./QRCodes/${sessionName}.png`, qr);
        }

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;

            if (shouldReconnect) {
                connectToWA(sessionName);
            }
        }
    });

    socks[sessionName].ev.on("creds.update", saveCreds);
}

connectToWA("session5");

const app = express();
app.use(express.json());

app.post('/validate', async (req, res) => {
    const phoneNumber = req.body.phoneNumber;

    const [result] = await socks["session5"].onWhatsApp(phoneNumber);

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

app.listen(80, () => {
    console.log(`Servidor escuchando en el puerto ${80}`);
});
