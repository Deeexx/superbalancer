// SPDX-FileCopyrightText: 2026 Daionys <support@daionys.com>
// SPDX-License-Identifier: LicenseRef-Proprietary


let appData = {
    user1: [],
    user2: [],
    names: { user1: "Jane", user2: "Joe" }
};
let activeEdit = { id: null, owner: null, scorer: null };

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    buildRadialMenu();
    renderAll();
    applyNames();

    // Load title
    const savedTitle = localStorage.getItem('superBalancer_title');
    if (savedTitle) document.getElementById('app-title').innerText = savedTitle;

    // Attach event listeners
    document.getElementById('header-user1').addEventListener('blur', saveNames);
    document.getElementById('header-user2').addEventListener('blur', saveNames);
    document.getElementById('app-title').addEventListener('blur', saveTitle);

    document.getElementById('new-user1').addEventListener('keypress', (e) => handleEnter(e, 'user1'));
    document.getElementById('new-user2').addEventListener('keypress', (e) => handleEnter(e, 'user2'));

    document.querySelector('.user1-btn').onclick = () => addItem('user1');
    document.querySelector('.user2-btn').onclick = () => addItem('user2');

    document.getElementById('reset-btn').onclick = () => {
        if (confirm('Alles wissen?')) {
            localStorage.clear();
            location.reload();
        }
    };

    document.getElementById('menu-overlay').onclick = (e) => closeMenu(e);
    document.querySelector('.menu-cancel').onclick = () => closeMenu(null, true);

    // Drag and Drop Listeners for Columns
    ['user1', 'user2'].forEach(owner => {
        const listEl = document.getElementById(`list-${owner}`);
        listEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            listEl.classList.add('drag-over');
        });
        listEl.addEventListener('dragleave', () => {
            listEl.classList.remove('drag-over');
        });
        listEl.addEventListener('drop', (e) => handleDrop(e, owner));
    });

    // Global paste handler for contenteditable cleanliness
    document.addEventListener('paste', (e) => {
        const target = e.target;
        if (target.isContentEditable) {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text');
            document.execCommand('insertText', false, text);
        }
    });
});

function applyNames() {
    document.getElementById('header-user1').innerText = appData.names.user1;
    document.getElementById('header-user2').innerText = appData.names.user2;
}

function saveNames() {
    appData.names.user1 = document.getElementById('header-user1').innerText;
    appData.names.user2 = document.getElementById('header-user2').innerText;
    saveData();
    renderAll();
}

/* --- DATA & STORAGE LOGIC --- */

function addItem(owner) {
    const input = document.getElementById(`new-${owner}`);
    const text = input.value.trim();
    if (!text) return;

    const newItem = {
        id: Date.now(),
        text: text,
        score1: 5,
        score2: 5
    };

    appData[owner].push(newItem);
    input.value = '';
    saveData();
    renderAll();
    input.focus();
}

window.deleteItem = function (id, owner) {
    if (confirm("Verwijderen?")) {
        appData[owner] = appData[owner].filter(i => i.id !== id);
        saveData();
        renderAll();
    }
}

function updateScore(value) {
    const { id, owner, scorer } = activeEdit;
    const list = appData[owner];
    const item = list.find(i => i.id === id);

    if (item) {
        if (scorer === '1') item.score1 = value;
        if (scorer === '2') item.score2 = value;
        saveData();
        renderAll();
    }
    closeMenu(null, true);
}

window.updateItemText = function (id, owner, element) {
    const newText = element.innerText.trim();
    const item = appData[owner].find(i => i.id === id);

    if (item) {
        if (newText === "") {
            // Revert empty edits to stored value
            element.innerText = item.text;
        } else {
            item.text = newText;
            saveData();
        }
    }
}

function saveTitle() {
    const title = document.getElementById('app-title').innerText;
    localStorage.setItem('superBalancer_title', title);
}

function saveData() {
    localStorage.setItem('superBalancer_data', JSON.stringify(appData));
}

function loadData() {
    const stored = localStorage.getItem('superBalancer_data');

    if (stored) {
        const parsed = JSON.parse(stored);
        appData = parsed;
        // Ensure names object exists
        if (!appData.names) appData.names = { user1: "Jane", user2: "Joe" };
    }
}

/* --- DRAG & DROP LOGIC --- */

function handleDragStart(e, id, owner) {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id, owner }));
    e.currentTarget.classList.add('dragging');
}

function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
}

function handleDrop(e, toOwner) {
    e.preventDefault();
    const listEl = document.getElementById(`list-${toOwner}`);
    listEl.classList.remove('drag-over');

    try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        const { id, owner: fromOwner } = data;

        if (fromOwner !== toOwner) {
            moveItem(id, fromOwner, toOwner);
        }
    } catch (err) {
        console.error("Drop failed:", err);
    }
}

function moveItem(id, fromOwner, toOwner) {
    const itemIndex = appData[fromOwner].findIndex(i => i.id === id);
    if (itemIndex > -1) {
        const [item] = appData[fromOwner].splice(itemIndex, 1);
        appData[toOwner].push(item);
        saveData();
        renderAll();
    }
}

/* --- UI LOGIC --- */

window.openMenu = function (id, owner, scorer, currentVal) {
    activeEdit = { id, owner, scorer };

    const menuEl = document.getElementById('radial-menu');
    const overlay = document.getElementById('menu-overlay');
    const titleEl = document.getElementById('menu-title');

    menuEl.className = 'radial-menu ' + (scorer === '1' ? 'theme-user1' : 'theme-user2');
    titleEl.textContent = (scorer === '1' ? appData.names.user1 : appData.names.user2);

    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (parseInt(btn.dataset.val) === currentVal) {
            btn.classList.add('selected');
        }
    });

    overlay.classList.add('active');
}

function closeMenu(e, force = false) {
    if (force || e.target.id === 'menu-overlay' || e.target.classList.contains('menu-cancel')) {
        document.getElementById('menu-overlay').classList.remove('active');
        activeEdit = { id: null, owner: null, scorer: null };
    }
}

function buildRadialMenu() {
    const menu = document.getElementById('radial-menu');
    const radius = 90;
    const totalItems = 11;

    for (let i = 0; i < totalItems; i++) {
        const btn = document.createElement('div');
        btn.className = 'menu-btn';
        btn.textContent = i;
        btn.dataset.val = i;
        btn.onclick = (e) => {
            e.stopPropagation();
            updateScore(i);
        };

        const angleDeg = (i * (360 / totalItems)) - 90;
        const angleRad = angleDeg * (Math.PI / 180);

        const offsetX = radius * Math.cos(angleRad);
        const offsetY = radius * Math.sin(angleRad);

        btn.style.left = `calc(50% + ${offsetX}px)`;
        btn.style.top = `calc(50% + ${offsetY}px)`;

        menu.appendChild(btn);
    }
}

function renderAll() {
    renderList('user1');
    renderList('user2');
}

function renderList(owner) {
    const listEl = document.getElementById(`list-${owner}`);
    // We don't remember scroll position because re-render often happens after sorting
    listEl.innerHTML = '';

    const sortedItems = [...appData[owner]].sort((a, b) => {
        const totalA = (a.score1 || 0) + (a.score2 || 0);
        const totalB = (b.score1 || 0) + (b.score2 || 0);
        return totalB - totalA;
    });

    sortedItems.forEach(item => {
        const total = (item.score1 || 0) + (item.score2 || 0);
        const li = document.createElement('li');
        li.className = 'list-item';
        li.draggable = true;

        li.ondragstart = (e) => handleDragStart(e, item.id, owner);
        li.ondragend = (e) => handleDragEnd(e);

        li.innerHTML = `
            <div class="score-trigger is-user1" onclick="openMenu(${item.id}, '${owner}', '1', ${item.score1})" role="button" aria-label="Set User 1 Score">
                ${item.score1}
            </div>
            
            <div class="item-content">
                <div class="item-text" contenteditable="true" 
                     onblur="updateItemText(${item.id}, '${owner}', this)"
                     onkeydown="if(event.key==='Enter'){event.preventDefault(); this.blur();}"
                     aria-label="Item name"
                >${item.text}</div>
                <span class="total-badge">Σ ${total}</span>
            </div>

            <div class="score-trigger is-user2" onclick="openMenu(${item.id}, '${owner}', '2', ${item.score2})" role="button" aria-label="Set User 2 Score">
                ${item.score2}
            </div>
            
            <button class="delete-btn" onclick="deleteItem(${item.id}, '${owner}')" aria-label="Delete item">&times;</button>
        `;
        listEl.appendChild(li);
    });
}

function handleEnter(e, owner) {
    if (e.key === 'Enter') addItem(owner);
}
