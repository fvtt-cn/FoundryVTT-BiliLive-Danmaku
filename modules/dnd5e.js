"use strict";

function dnd5eCommand({ content, sender }) {
    let msg = "";

    if (content?.toUpperCase() === "HP") {
        // Get only active users and their characters.
        const pcs = game.users
            .filter(x => x.active)
            .map(x => x.data?.character)
            .filter(x => x)
            .map(x => game.actors.get(x));
        if (pcs.length > 0) {
            msg += `<b>${sender.name}</b> ${game.i18n.localize("bililive.hpquery")}:<br>`;
            msg += queryHp(pcs);
        }
    } else if (content?.toUpperCase().startsWith("PC")) {
        // Player owned, unnecessary to be active.
        const pcs = game.users
            .map(x => x.data?.character)
            .filter(x => x)
            .map(x => game.actors.get(x));
        const pc = pcs.filter(x => x.name.startsWith(content.slice(2)))[0];
        if (pc) {
            msg += `<b>${sender.name}</b> ${game.i18n.localize("bililive.pcquery")} <u><b>${pc.data.name}</b></u>:<br>`;
            msg += queryPc(pc);
        }
    }

    return msg;
}

function queryHp(pcs) {
    let msg = "";

    for (let pc of pcs) {
        let hpText = `${pc.data.data.attributes.hp.value}`;
        if (pc.data.data.attributes.hp.temp && pc.data.data.attributes.hp.temp > 0) {
            hpText += `+${pc.data.data.attributes.hp.temp}`;
        }
        hpText += `/${pc.data.data.attributes.hp.max}`;
        if (pc.data.data.attributes.hp.tempmax && pc.data.data.attributes.hp.tempmax > 0) {
            hpText += `+${pc.data.data.attributes.hp.tempmax}`;
        }
        msg += `<u>${pc.data.name}</u>: ${hpText}<br>`;
    }

    return msg;
}

function queryPc(pc) {
    let msg = "";

    let hpText = `${pc.data.data.attributes.hp.value}`;
    if (pc.data.data.attributes.hp.temp && pc.data.data.attributes.hp.temp > 0) {
        hpText += `+${pc.data.data.attributes.hp.temp}`;
    }
    hpText += `/${pc.data.data.attributes.hp.max}`;
    if (pc.data.data.attributes.hp.tempmax && pc.data.data.attributes.hp.tempmax > 0) {
        hpText += `+${pc.data.data.attributes.hp.tempmax}`;
    }
    msg += `<i>${game.i18n.localize("DND5E.Race")}:</i> ${pc.data.data.details.race}<br>`;
    msg += `<i>${game.i18n.localize("DND5E.HP")}:</i> ${hpText} <i>${game.i18n.localize("DND5E.AC")}:</i> ${pc.data.data.attributes.ac.value} <i>${game.i18n.localize("DND5E.Speed")}:</i> ${pc.data.data.attributes.movement.walk}${pc.data.data.attributes.movement.units}<br>`;
    if (pc.data.data.attributes.senses.darkvision > 0) {
        msg += `<i>${game.i18n.localize("DND5E.SenseDarkvision")}:</i> ${pc.data.data.attributes.senses.darkvision}${pc.data.data.attributes.senses.units}`;
    }
    if (pc.data.data.attributes.senses.blindsight > 0) {
        msg += `<i>${game.i18n.localize("DND5E.SenseBlindsight")}:</i> ${pc.data.data.attributes.senses.blindsight}${pc.data.data.attributes.senses.units}`;
    }
    if (!msg.endsWith("<br>")) {
        msg += "<br>";
    }
    if (pc.data.data.spells.pact.max > 0 && pc.data.data.spells.pact.level > 0) {
        msg += `<i>${game.i18n.localize("DND5E.SpellLevelPact")}(${pc.data.data.spells.pact.level}):</i> ${pc.data.data.spells.pact.value}/${pc.data.data.spells.pact.max}<br>`;
    }
    let slotText = "";
    for (let i = 1; i <= 9; i++) {
        const slot = pc.data.data.spells[`spell${i}`];
        if (slot && slot.max > 0) {
            slotText += `${game.i18n.localize("DND5E.SpellLevel" + i.toString())}[${slot.value}/${slot.max}] `;
        }
    }
    if (slotText) {
        msg += `<i>${game.i18n.localize("DND5E.SpellLevel")}:</i> ${slotText}<br>`;
    }
    for (let res of Object.keys(pc.data.data.resources)) {
        const resource = pc.data.data.resources[res];
        if (resource && resource.label && resource.max > 0) {
            msg += `<i>${resource.label}:</i> ${resource.value}/${resource.max} (`;
            if (resource.sr) {
                msg += game.i18n.localize("DND5E.RestS");
            } else if (resource.lr) {
                msg += game.i18n.localize("DND5E.RestL");
            } else {
                msg += "➖";
            }
            msg += ")<br>";
        }
    }
    if (pc.data.data.attributes.death.success + pc.data.data.attributes.death.failure > 0) {
        msg += `<i>${game.i18n.localize("DND5E.DeathSave")}:</i> ${pc.data.data.attributes.death.success}:${pc.data.data.attributes.death.failure}<br>`;
    }
    msg += `<i>XP:</i> ${pc.data.data.details.xp.value}/${pc.data.data.details.xp.max}<br>`;
    const gp = pc.data.data.currency.pp * 10 + pc.data.data.currency.gp + pc.data.data.currency.pp * 0.5 + pc.data.data.currency.ep * 0.1;
    msg += `<i>${game.i18n.localize("DND5E.Currency")}:</i> ${gp.toFixed(1)}${game.i18n.localize("DND5E.CurrencyGP")}<br>`;
    msg += `<i>${game.i18n.localize("bililive.pcquery-encumbrance")}:</i> ${pc.data.data.attributes.encumbrance.value.toFixed()}/${pc.data.data.attributes.encumbrance.max.toFixed()}lbs<br>`;
    if (pc.data.data.attributes.exhaustion > 0) {
        msg += `<i><b>${game.i18n.localize("DND5E.DND5E.Exhaustion")}<b>(${pc.data.data.attributes.exhaustion})</i> `;
    }
    if (pc.data.data.attributes.inspiration === true) {
        msg += `<i><b>${game.i18n.localize("DND5E.Inspiration")}</b><i> `;
    }
    if (!msg.endsWith("<br>")) {
        msg += "<br>";
    }

    return msg;
}

export { dnd5eCommand };