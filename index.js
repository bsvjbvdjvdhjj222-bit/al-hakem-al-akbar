const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const P = require('pino')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info')
    const sock = makeWASocket({
        auth: state,
        logger: P({ level: 'silent' }),
        printQRInTerminal: true
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            if(shouldReconnect) startBot()
        } else if(connection === 'open') {
            console.log('✅ بوت الحاكم الأكبر اشتغل!')
        }
    })

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message || msg.key.fromMe) return
        const from = msg.key.remoteJid
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
        
        if (!from.endsWith('@g.us')) return

        if(text.includes('!حاكم')) {
            await sock.sendMessage(from, { text: '👑 أوامر الحاكم الأكبر:\n\n!حاكم - القائمة\n!قوة - كلام عن القوة\nسلام - ترحيب ملوكي' })
        }
        if(text.toLowerCase().includes('سلام')) {
            await sock.sendMessage(from, { text: '👑 وعليكم السلام يا مملكة الحاكم!' })
        }
        if(text.includes('!قوة')) {
            await sock.sendMessage(from, { text: '💪 القوة هي أساس الملك يا حاكم!' })
        }
    })
}

startBot()
