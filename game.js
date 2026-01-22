let player = {
    name: "Сталкер",
    location: "Свалка",
    hp: 100,
    maxHp: 100,
    radiation: 0,
    inventory: [
        "Нож",
        "Пистолет Макарова",
        "Обрез",
        "Бронежилет Дуб",
        "Шлем СВ",
        "Артефакт — Слизь",
        "Артефакт — Жгут",
        "Аптечка",
        "Фляга с водой"
    ],
    equipment: {
        weapon: null,
        pistol: null,
        armor: null,
        helmet: null,
        artefact1: null,
        artefact2: null,
        artefact3: null
    },
    stats: {
        damage: 10,
        armorReduction: 0,
        hpBonus: 0
    }
};

const itemDatabase = {
    "Обрез": { type: "weapon", damage: 30, icon: "💥" },
    "Пистолет Макарова": { type: "pistol", damage: 10, icon: "🔫" },
    "Нож": { type: "pistol", damage: 8, icon: "🔪" },
    "Бронежилет Дуб": { type: "armor", reduce: 30, icon: "🛡️" },
    "Шлем СВ": { type: "helmet", reduce: 15, icon: "🪖" },
    "Слизь": { type: "artefact", hpBonus: 20, radiation: 5, icon: "🟢" },
    "Жгут": { type: "artefact", hpBonus: 15, radiation: 3, icon: "🔴" },
    "Метеорит": { type: "artefact", hpBonus: 40, radiation: 10, icon: "⚫" }
};

function init() {
    const user = window.Telegram?.WebApp.initDataUnsafe.user;
    if (user) player.name = user.first_name;

    window.Telegram?.WebApp.expand();
    loadPlayer();
    updateUI();
}

function updateUI() {
    document.getElementById("player-name").textContent = player.name;
    document.getElementById("location").textContent = player.location;
    document.getElementById("hp").textContent = player.hp;
    document.getElementById("rad").textContent = player.radiation;

    for (const slot in player.equipment) {
        document.getElementById(`slot-${slot}`).textContent = player.equipment[slot] || "—";
    }

    updateInventory();
}

function updateInventory() {
    const list = document.getElementById("inventory-list");
    list.innerHTML = "";

    player.inventory.forEach(itemName => {
        const item = createItemObject(itemName);
        const li = document.createElement("li");
        li.innerHTML = `
            ${item.icon || "📦"} ${itemName}
            <button onclick="equip('${itemName}')">⚡ Экипировать</button>
        `;
        list.appendChild(li);
    });
}

function createItemObject(name) {
    const key = name.includes(" — ") ? name.split(" — ")[1] : name;
    return { ...itemDatabase[key], name };
}

function equip(itemName) {
    const item = createItemObject(itemName);
    let slot = item.type;

    if (!slot) return alert("Нельзя экипировать этот предмет.");

    if (slot === "artefact" && !player.equipment.artefact1) slot = "artefact1";
    else if (slot === "artefact" && !player.equipment.artefact2) slot = "artefact2";
    else if (slot === "artefact" && !player.equipment.artefact3) slot = "artefact3";
    else if (player.equipment[slot]) {
        player.inventory.push(player.equipment[slot]);
        player.equipment[slot] = null;
    }

    player.equipment[slot] = itemName;
    player.inventory = player.inventory.filter(i => i !== itemName);

    recalculateStats();
    updateUI();
}

function unequip(slot) {
    if (!player.equipment[slot]) return;
    player.inventory.push(player.equipment[slot]);
    player.equipment[slot] = null;
    recalculateStats();
    updateUI();
}

function recalculateStats() {
    player.stats = { damage: 10, armorReduction: 0, hpBonus: 0 };
    player.radiation = 0;

    for (const slot in player.equipment) {
        const itemName = player.equipment[slot];
        if (!itemName) continue;

        const key = itemName.includes(" — ") ? itemName.split(" — ")[1] : itemName;
        const item = itemDatabase[key];
        if (!item) continue;

        if (item.damage) player.stats.damage += item.damage;
        if (item.reduce) player.stats.armorReduction += item.reduce;
        if (item.hpBonus) player.stats.hpBonus += item.hpBonus;
        if (item.radiation) player.radiation += item.radiation;
    }

    player.maxHp = 100 + player.stats.hpBonus;
    if (player.hp > player.maxHp) player.hp = player.maxHp;
    document.getElementById("hp").textContent = player.hp;
    document.getElementById("rad").textContent = player.radiation;
}

function toggleSearch() {
    if (Math.random() < 0.7) {
        const loot = ["Аптечка", "Патроны", "Фляга", "Артефакт — Слизь", "Артефакт — Жгут", "Нож"];
        const item = loot[Math.floor(Math.random() * loot.length)];
        player.inventory.push(item);
        alert(`🎉 Нашли: ${item}!`);
    } else {
        alert("📦 Ничего не нашли...");
    }
    updateUI();
}

function savePlayer() {
    localStorage.setItem("stalker_player", JSON.stringify(player));
}

function loadPlayer() {
    const saved = localStorage.getItem("stalker_player");
    if (saved) {
        const loaded = JSON.parse(saved);
        Object.assign(player, loaded);
    }
}

window.addEventListener("beforeunload", savePlayer);
window.onload = init;
