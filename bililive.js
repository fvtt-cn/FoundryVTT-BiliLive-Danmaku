const MODULE_NAME = "bililive";
const danmaku = {
    client: null,
    giftPublic: false,
    danmakuPublic: false,
    commandPublic: false
};

import { dnd5eCommand } from "./modules/dnd5e.js";

Hooks.on("init", () => registerSettings());
Hooks.on("ready", () => setupDanmakuClient());

function setupDanmakuClient() {
    try {
        danmaku.client?.terminate();
    } catch (ex) {
        console.error("Bililive | Danmaku Client Termination failed!", ex);
    }

    // Get configs.
    const roomId = Number(getSetting("roomId")) || 0;
    danmaku.giftPublic = Boolean(getSetting("giftPublic")) || false;
    danmaku.danmakuPublic = Boolean(getSetting("danmakuPublic")) || false;
    danmaku.commandPublic = Boolean(getSetting("commandPublic")) || false;

    // Get Main GM.
    const gm = game.users.find(u => u.isGM && u.active);

    if (roomId > 0 && gm && game.user === gm) {
        console.log("Bililive | Living Room confirmed", roomId);

        danmaku.client = new DanmakuClient(roomId);

        danmaku.client.on("open", () => console.log("Bililive | listening Bilibili Danmaku..."));
        danmaku.client.on("close", () => console.log("Bililive | Terminated Bilibili Danmaku."));

        // Danmaku event dispatcher.
        danmaku.client.on("event", ({ name, content }) => {
            if (name === "danmaku") {
                if (content.content?.startsWith("/")) {
                    onCommand(content);
                } else {
                    onDanmaku(content);
                }
            } else if (name === "gift") {
                onGift(content);
            }
        });

        danmaku.client.start();
    }
}

function onDanmaku({ content, sender }) {
    const chatMessage = {
        content: `<b>${sender.name}</b>: ${content}`,
        type: 1,
        speaker: ChatMessage.getSpeaker({ alias: game.i18n.localize("bililive.speaker") })
    };

    if (!danmaku.danmakuPublic) {
        chatMessage.whisper = ChatMessage.getWhisperRecipients("GM");
    }

    ChatMessage.create(chatMessage);
}

function onGift({ gift, num, sender }) {
    const chatMessage = {
        content: `<b>${sender.name}</b>: ${gift.name} * ${num}`,
        type: 1,
        speaker: ChatMessage.getSpeaker({ alias: game.i18n.localize("bililive.donar") })
    };

    if (!danmaku.giftPublic) {
        chatMessage.whisper = ChatMessage.getWhisperRecipients("GM");
    }

    ChatMessage.create(chatMessage);
}

function onCommand({ content, sender }) {
    let msg = "";
    switch (game.system.data.name) {
        case "dnd5e":
            // D&D 5e only currently.
            msg = dnd5eCommand({ content: content?.slice(1), sender: sender });
            break;
    }

    if (msg) {
        const chatMessage = {
            content: msg,
            type: 1,
            speaker: ChatMessage.getSpeaker({ alias: game.i18n.localize("bililive.command") })
        };

        if (!danmaku.commandPublic) {
            chatMessage.whisper = ChatMessage.getWhisperRecipients("GM");
        }

        ChatMessage.create(chatMessage);
    } else {
        // Invalid command, redirect to onDanmaku.
        onDanmaku({ content, sender });
    }
}

function getSetting(key) {
    return game.settings.get(MODULE_NAME, key);
}

function registerSettings() {
    const settings = [
        {
            key: "roomId",
            options: {
                name: game.i18n.localize("bililive.settings.room.name"),
                hint: game.i18n.localize("bililive.settings.room.hint"),
                scope: "world",
                config: true,
                type: String,
                default: ""
            }
        },
        {
            key: "giftPublic",
            options: {
                name: game.i18n.localize("bililive.settings.giftPublic.name"),
                hint: game.i18n.localize("bililive.settings.giftPublic.hint"),
                scope: "world",
                config: true,
                type: Boolean,
                default: false
            }
        },
        {
            key: "danmakuPublic",
            options: {
                name: game.i18n.localize("bililive.settings.danmakuPublic.name"),
                hint: game.i18n.localize("bililive.settings.danmakuPublic.hint"),
                scope: "world",
                config: true,
                type: Boolean,
                default: false
            }
        },
        {
            key: "commandPublic",
            options: {
                name: game.i18n.localize("bililive.settings.commandPublic.name"),
                hint: game.i18n.localize("bililive.settings.commandPublic.hint"),
                scope: "world",
                config: true,
                type: Boolean,
                default: false
            }
        },
    ];

    settings.forEach(s => {
        s.options.onChange = () => setupDanmakuClient();
        game.settings.register(MODULE_NAME, s.key, s.options);
    });
}