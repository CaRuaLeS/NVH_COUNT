// App State with Default Data
let appData = {
    hunters: [], // { id: timestamp, name: "Name", kills: { handId: count }, stock: { val1: 0, val2: 0 } }
    hands: [],   // { id: timestamp, name: "Mano 1" }
    idCounter: 0,
    stock: {
        label1: "P",
        label2: "P & E",
        mult1: 2,    // New: Multiplier 1
        mult2: 2.5   // New: Multiplier 2
    },
    total: {
        gathered: '',
        secrCount: '',
        secrPrice: 70,
        propina: '',
        pricePerdiz: 25,
        priceConejo: 13,
        countConejo: ''
    }
};

// Selectors
const tableHeader = document.getElementById('header-row');
const tableBody = document.getElementById('table-body');
const fabMain = document.getElementById('fab-main');
const fabContainer = document.querySelector('.fab-container');
const btnAddConejo = document.getElementById('btn-add-conejo');
const btnAddHand = document.getElementById('btn-add-hand');
const btnAddHunter = document.getElementById('btn-add-hunter');
const btnRemoveMode = document.getElementById('btn-remove-mode');
const hunterDialog = document.getElementById('hunter-dialog');
const hunterForm = hunterDialog.querySelector('form');
const resetBtn = document.getElementById('reset-btn');

// View Selectors
const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.nav-item');

// Stock View Selectors
const stockBody = document.getElementById('stock-body');
const headerInput1 = document.getElementById('header-input-1');
const headerInput2 = document.getElementById('header-input-2');
const headerLabel1Display = document.getElementById('header-label-1-display');
const headerLabel2Display = document.getElementById('header-label-2-display');
const colTotal1 = document.getElementById('col-total-1');
const colTotal2 = document.getElementById('col-total-2');
const colTotal3 = document.getElementById('col-total-3');
const colTotal4 = document.getElementById('col-total-4');

// Total View Selectors
const totalGatheredInput = document.getElementById('total-gathered-input');
const trackerTotalDisplay = document.getElementById('tracker-total-display');
const diffValDisplay = document.getElementById('diff-val');
const diffPerHunterDisplay = document.getElementById('diff-per-hunter');
const secrCountInput = document.getElementById('secr-count');
const secrPriceInput = document.getElementById('secr-price');
const secrPerHunterDisplay = document.getElementById('secr-per-hunter');
const propinaInput = document.getElementById('propina-amount');
const propinaPerHunterDisplay = document.getElementById('propina-per-hunter');
const pricePerdizInput = document.getElementById('price-perdiz');
const billPerdizDisplay = document.getElementById('bill-perdiz');
const perdicesCountDisplay = document.getElementById('perdices-count-display');
const countConejoInput = document.getElementById('count-conejo');
const priceConejoInput = document.getElementById('price-conejo');
const billConejoDisplay = document.getElementById('bill-conejo');
const stockPCountDisplay = document.getElementById('stock-p-count');
const billPeladasDisplay = document.getElementById('bill-peladas');
const stockPECountDisplay = document.getElementById('stock-pe-count');
const billPEDisplay = document.getElementById('bill-pe');
const billSecrDisplay = document.getElementById('bill-secr');
const grandTotalDisplay = document.getElementById('grand-total-display');

// New Total View Inputs
const totalLabel1Input = document.getElementById('total-label-1');
const totalMult1Input = document.getElementById('total-mult-1');
const totalLabel2Input = document.getElementById('total-label-2');
const totalMult2Input = document.getElementById('total-mult-2');


let isDeleteMode = false;

// Init
function init() {
    loadData();
    render(); // Initial load of Main Table
    renderStock(); // Initial load of Stock Table
    renderTotalInputs();

    // Event Listeners
    fabMain.addEventListener('click', toggleFabMenu);

    btnAddHand.addEventListener('click', () => {
        addHand();
        toggleFabMenu();
    });

    if (btnAddConejo) {
        btnAddConejo.addEventListener('click', () => {
            addConejo();
            toggleFabMenu();
        });
    }

    btnAddHunter.addEventListener('click', () => {
        hunterDialog.showModal();
        toggleFabMenu();
    });

    btnRemoveMode.addEventListener('click', () => {
        isDeleteMode = !isDeleteMode;
        document.body.classList.toggle('deleting', isDeleteMode);
        render();
        toggleFabMenu();
    });

    hunterForm.addEventListener('submit', (e) => {
        const nameInput = document.getElementById('new-hunter-name');
        addHunter(nameInput.value);
        nameInput.value = '';
    });

    document.getElementById('cancel-hunter').addEventListener('click', () => {
        hunterDialog.close();
    });

    resetBtn.addEventListener('click', () => {
        if (confirm('¿Reiniciar todo? Se borrarán todos los datos.')) {
            resetData();
        }
    });

    // Delegate inputs
    tableBody.addEventListener('input', handleScoreChange);
    stockBody.addEventListener('input', handleStockChange);

    // Delegate clicks
    tableHeader.addEventListener('click', handleHeaderClick);
    tableBody.addEventListener('click', handleRowClick);

    // Nav Listeners
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const button = item.closest('.nav-item');
            const targetId = button.dataset.target;
            switchView(targetId);
        });
    });

    // Stock Header Listeners (Sync to Total Labels)
    headerInput1.addEventListener('input', (e) => {
        appData.stock.label1 = e.target.value;
        headerLabel1Display.textContent = e.target.value;
        if (totalLabel1Input) totalLabel1Input.value = e.target.value; // Sync
        saveData();
    });
    headerInput2.addEventListener('input', (e) => {
        appData.stock.label2 = e.target.value;
        headerLabel2Display.textContent = e.target.value;
        if (totalLabel2Input) totalLabel2Input.value = e.target.value; // Sync
        saveData();
    });

    setupTotalListeners();
}

// Data Logic
function loadData() {
    const saved = localStorage.getItem('cazaTrackerData');
    if (saved) {
        const parsed = JSON.parse(saved);
        appData = { ...appData, ...parsed };

        // Migration
        if (!appData.stock) appData.stock = { label1: "P", label2: "P & E", mult1: 2, mult2: 2.5 };
        // Ensure new props exist if migrating from older version
        if (appData.stock.mult1 === undefined) appData.stock.mult1 = 2;
        if (appData.stock.mult2 === undefined) appData.stock.mult2 = 2.5;

        if (!appData.total) appData.total = {
            gathered: '', secrCount: '', secrPrice: 70, propina: '', pricePerdiz: 25, priceConejo: 13, countConejo: ''
        };
        appData.hunters.forEach(h => {
            if (!h.stock) h.stock = { val1: '', val2: '' };
            if (h.perdizPrice === undefined) h.perdizPrice = '';
        });
    } else {
        addHand();
    }
}

function saveData() {
    localStorage.setItem('cazaTrackerData', JSON.stringify(appData));
}

function resetData() {
    appData = {
        hunters: [],
        hands: [],
        idCounter: 0,
        stock: { label1: "P", label2: "P & E", mult1: 2, mult2: 2.5 },
        total: { gathered: '', secrCount: '', secrPrice: 70, propina: '', pricePerdiz: 25, priceConejo: 13, countConejo: '' }
    };
    addHand();
    saveData();
    render();
    renderStock();
    renderTotalInputs();
    calculateTotalSection();
}

function addHand() {
    const id = Date.now().toString();
    const num = appData.hands.length + 1;
    appData.hands.push({ id: id, name: `${num}` });
    saveData();
    render();
    setTimeout(() => {
        const wrapper = document.querySelector('.data-table-wrapper');
        if (wrapper) wrapper.scrollLeft = wrapper.scrollWidth;
    }, 50);
}

function addConejo() {
    // Check if distinct Conejo column exists
    const exists = appData.hands.find(h => h.id === 'conejo');
    if (exists) {
        alert('Ya existe la columna de Conejo.');
        return;
    }
    appData.hands.push({ id: 'conejo', name: 'Conejo' });
    saveData();
    render();
    setTimeout(() => {
        const wrapper = document.querySelector('.data-table-wrapper');
        if (wrapper) wrapper.scrollLeft = wrapper.scrollWidth;
    }, 50);
}

function addHunter(name) {
    const id = Date.now().toString();
    appData.hunters.push({
        id: id,
        name: name,
        kills: {},
        stock: { val1: '', val2: '' },
        perdizPrice: ''
    });
    saveData();
    render();
    renderStock();
    if (document.getElementById('view-total').classList.contains('active-view')) {
        calculateTotalSection();
    }
    setTimeout(() => {
        const wrapper = document.querySelector('.data-table-wrapper');
        if (wrapper) wrapper.scrollTop = wrapper.scrollHeight;
    }, 50);
}

function removeHand(handId) {
    if (!confirm('¿Eliminar esta mano y todos sus datos?')) return;
    appData.hands = appData.hands.filter(h => h.id !== handId);
    appData.hunters.forEach(hunter => {
        delete hunter.kills[handId];
    });
    saveData();
    render();
}

function removeHunter(hunterId) {
    if (!confirm('¿Eliminar a este cazador?')) return;
    appData.hunters = appData.hunters.filter(h => h.id !== hunterId);
    saveData();
    render();
    renderStock();
    if (document.getElementById('view-total').classList.contains('active-view')) {
        calculateTotalSection();
    }
}

function updateKill(hunterId, handId, value) {
    const hunter = appData.hunters.find(h => h.id === hunterId);
    if (hunter) {
        hunter.kills[handId] = value === '' ? 0 : parseInt(value);
        saveData();
        renderTotalsOnly(hunterId);
    }
}

function updateStock(hunterId, field, value) {
    const hunter = appData.hunters.find(h => h.id === hunterId);
    if (hunter) {
        hunter.stock[field] = value === '' ? '' : parseInt(value);
        saveData();
        updateStockRowAndFooter(hunter);
    }
}

// --- View Logic ---
function switchView(viewId) {
    views.forEach(view => {
        if (view.id === viewId) {
            view.classList.add('active-view');
        } else {
            view.classList.remove('active-view');
        }
    });

    navItems.forEach(item => {
        if (item.dataset.target === viewId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    if (viewId === 'view-stock') {
        renderStock();
    } else if (viewId === 'view-total') {
        renderTotalInputs(); // Ensure labels/mults are fresh if changed elsewhere
        calculateTotalSection();
    }
}

// --- Stock Logic ---
function renderStock() {
    headerInput1.value = appData.stock.label1 || "P";
    headerInput2.value = appData.stock.label2 || "P & E";
    headerLabel1Display.textContent = appData.stock.label1 || "P";
    headerLabel2Display.textContent = appData.stock.label2 || "P & E";

    // Also init Header spans with mult info if needed? 
    // The columns are just "Total P" but values depend on mult.

    stockBody.innerHTML = '';
    appData.hunters.forEach(hunter => {
        const tr = document.createElement('tr');
        tr.id = `stock-row-${hunter.id}`;

        const tdName = document.createElement('td');
        tdName.className = 'cell-name';
        tdName.textContent = hunter.name;
        tr.appendChild(tdName);

        const td1 = document.createElement('td');
        const input1 = document.createElement('input');
        input1.type = 'number';
        input1.inputMode = 'numeric';
        input1.className = 'stock-cell-input';
        const val1 = (hunter.stock.val1 === '' || hunter.stock.val1 === 0 || hunter.stock.val1 === null) ? '' : hunter.stock.val1;
        input1.value = val1;
        input1.placeholder = '0';
        input1.dataset.hunterId = hunter.id;
        input1.dataset.field = 'val1';
        td1.appendChild(input1);
        tr.appendChild(td1);

        const td2 = document.createElement('td');
        const input2 = document.createElement('input');
        input2.type = 'number';
        input2.inputMode = 'numeric';
        input2.className = 'stock-cell-input';
        const val2 = (hunter.stock.val2 === '' || hunter.stock.val2 === 0 || hunter.stock.val2 === null) ? '' : hunter.stock.val2;
        input2.value = val2;
        input2.placeholder = '0';
        input2.dataset.hunterId = hunter.id;
        input2.dataset.field = 'val2';
        td2.appendChild(input2);
        tr.appendChild(td2);

        const td3 = document.createElement('td');
        td3.className = 'col-stock-res';
        td3.id = `stock-res1-${hunter.id}`;
        tr.appendChild(td3);

        const td4 = document.createElement('td');
        td4.className = 'col-stock-res';
        td4.id = `stock-res2-${hunter.id}`;
        tr.appendChild(td4);

        stockBody.appendChild(tr);
        updateRowTexts(hunter);
    });

    calculateStockFooter();
}

function updateRowTexts(hunter) {
    const v1 = parseInt(hunter.stock.val1) || 0;
    const v2 = parseInt(hunter.stock.val2) || 0;
    const m1 = parseFloat(appData.stock.mult1) || 0;
    const m2 = parseFloat(appData.stock.mult2) || 0;

    const r1 = v1 * m1;
    const r2 = v2 * m2;

    const el1 = document.getElementById(`stock-res1-${hunter.id}`);
    const el2 = document.getElementById(`stock-res2-${hunter.id}`);

    if (el1) el1.textContent = Number.isInteger(r1) ? r1 : r1.toFixed(1);
    if (el2) el2.textContent = Number.isInteger(r2) ? r2 : r2.toFixed(1);
}

function updateStockRowAndFooter(hunter) {
    updateRowTexts(hunter);
    calculateStockFooter();
}

function calculateStockFooter() {
    let total1 = 0;
    let total2 = 0;
    let total3 = 0;
    let total4 = 0;
    const m1 = parseFloat(appData.stock.mult1) || 0;
    const m2 = parseFloat(appData.stock.mult2) || 0;

    appData.hunters.forEach(h => {
        const v1 = parseInt(h.stock.val1) || 0;
        const v2 = parseInt(h.stock.val2) || 0;

        total1 += v1;
        total2 += v2;
        total3 += (v1 * m1);
        total4 += (v2 * m2);
    });

    if (colTotal1) colTotal1.textContent = total1;
    if (colTotal2) colTotal2.textContent = total2;
    if (colTotal3) colTotal3.textContent = Number.isInteger(total3) ? total3 : total3.toFixed(1);
    if (colTotal4) colTotal4.textContent = Number.isInteger(total4) ? total4 : total4.toFixed(1);
}

function handleStockChange(e) {
    if (e.target.classList.contains('stock-cell-input')) {
        const id = e.target.dataset.hunterId;
        const field = e.target.dataset.field;
        updateStock(id, field, e.target.value);
    }
}

// --- Total Section Logic ---
function setupTotalListeners() {
    // Existing Total Inputs...
    totalGatheredInput.addEventListener('input', (e) => {
        appData.total.gathered = e.target.value;
        saveData();
        calculateTotalSection();
    });
    secrCountInput.addEventListener('input', (e) => {
        appData.total.secrCount = e.target.value;
        saveData();
        calculateTotalSection();
    });
    secrPriceInput.addEventListener('input', (e) => {
        appData.total.secrPrice = e.target.value;
        saveData();
        calculateTotalSection();
    });
    propinaInput.addEventListener('input', (e) => {
        appData.total.propina = e.target.value;
        saveData();
        calculateTotalSection();
    });
    pricePerdizInput.addEventListener('input', (e) => {
        appData.total.pricePerdiz = e.target.value;
        saveData();
        calculateTotalSection();
    });
    countConejoInput.addEventListener('input', (e) => {
        appData.total.countConejo = e.target.value;
        saveData();
        calculateTotalSection();
    });
    priceConejoInput.addEventListener('input', (e) => {
        appData.total.priceConejo = e.target.value;
        saveData();
        calculateTotalSection();
    });

    // New Dynamic Labels/Mults
    if (totalLabel1Input) {
        totalLabel1Input.addEventListener('input', (e) => {
            appData.stock.label1 = e.target.value;
            // Sync Stock Header input if exists
            if (headerInput1) headerInput1.value = e.target.value;
            if (headerLabel1Display) headerLabel1Display.textContent = e.target.value;
            saveData();
        });
    }
    if (totalMult1Input) {
        totalMult1Input.addEventListener('input', (e) => {
            appData.stock.mult1 = e.target.value;
            saveData();
            calculateTotalSection(); // Updates Bill Total
            // Note: Does NOT auto-update Stock View rows until switchView is called or we trigger it.
            // But calculateTotalSection accesses Stock data which is fine. When user goes to Stock, renderStock() uses new mult.
        });
    }

    if (totalLabel2Input) {
        totalLabel2Input.addEventListener('input', (e) => {
            appData.stock.label2 = e.target.value;
            if (headerInput2) headerInput2.value = e.target.value;
            if (headerLabel2Display) headerLabel2Display.textContent = e.target.value;
            saveData();
        });
    }
    if (totalMult2Input) {
        totalMult2Input.addEventListener('input', (e) => {
            appData.stock.mult2 = e.target.value;
            saveData();
            calculateTotalSection();
        });
    }
}

function renderTotalInputs() {
    totalGatheredInput.value = appData.total.gathered;
    secrCountInput.value = appData.total.secrCount;
    secrPriceInput.value = appData.total.secrPrice;
    propinaInput.value = appData.total.propina;
    pricePerdizInput.value = appData.total.pricePerdiz;
    countConejoInput.value = appData.total.countConejo;
    priceConejoInput.value = appData.total.priceConejo;

    if (totalLabel1Input) totalLabel1Input.value = appData.stock.label1 || "P";
    if (totalMult1Input) totalMult1Input.value = appData.stock.mult1;

    if (totalLabel2Input) totalLabel2Input.value = appData.stock.label2 || "P & E";
    if (totalMult2Input) totalMult2Input.value = appData.stock.mult2;
}

function calculateTotalSection() {
    const hunterCount = appData.hunters.length || 1;

    // 1. Comparison
    let trackerTotal = 0;
    appData.hands.forEach(hand => {
        if (hand.id === 'conejo') return; // Exclude Conejo from Perdices comparison
        appData.hunters.forEach(hunter => {
            trackerTotal += (hunter.kills[hand.id] || 0);
        });
    });
    trackerTotalDisplay.textContent = trackerTotal;

    const realGathered = parseInt(appData.total.gathered) || 0;
    const diff = realGathered - trackerTotal;

    diffValDisplay.textContent = diff > 0 ? `+${diff}` : diff;
    diffValDisplay.style.color = diff > 0 ? 'var(--md-sys-color-primary)' : diff < 0 ? 'var(--md-sys-color-error)' : 'inherit';

    const pricePerdiz = parseFloat(appData.total.pricePerdiz) || 0;
    const diffCost = diff * pricePerdiz;
    const diffPerHunter = Math.round(diffCost / hunterCount);

    diffPerHunterDisplay.textContent = diffPerHunter.toFixed(0) + ' €';

    // 2. Expenses
    const secrCount = parseInt(appData.total.secrCount) || 0;
    const secrPrice = parseFloat(appData.total.secrPrice) || 0;
    const secrTotal = secrCount * secrPrice;
    const secrPerHunter = Math.round(secrTotal / hunterCount);

    secrPerHunterDisplay.textContent = secrPerHunter.toFixed(0) + ' €';

    const propina = parseFloat(appData.total.propina) || 0;
    const propinaPerHunter = Math.round(propina / hunterCount);

    propinaPerHunterDisplay.textContent = propinaPerHunter.toFixed(0) + ' €';



    // const pricePerdiz = parseFloat(appData.total.pricePerdiz) || 0; // Already declared above
    const totalPerdiz = realGathered * pricePerdiz;
    billPerdizDisplay.textContent = totalPerdiz.toFixed(2) + ' €';
    if (perdicesCountDisplay) perdicesCountDisplay.textContent = realGathered;

    // Calculate Global Conejo Count from Tracker
    let globalConejoCount = 0;
    const conejoHand = appData.hands.find(h => h.id === 'conejo');
    if (conejoHand) {
        appData.hunters.forEach(h => {
            globalConejoCount += (h.kills['conejo'] || 0);
        });
    }

    // Conejo Bill Row (Use Global Count if available, otherwise manual input mostly ignored now but kept for fallback?)
    // Actually, plan says: "Update 'Conejo' bill row to be read-only (displaying sum from Tracker)."
    // Let's update the display. We should probably update the input value too to reflect reality or make it readonly.
    // Ideally we replace the input with a span or make input readonly. For now, let's just update the input value visually and calc price.

    if (countConejoInput) {
        countConejoInput.value = globalConejoCount;
        countConejoInput.readOnly = true; // Make it read-only
        appData.total.countConejo = globalConejoCount; // Sync to state
        // We probably shouldn't set appData here repeatedly if it triggers saves, but it's part of calculation. 
        // Better: Just use the value for calculation.
    }

    const priceConejo = parseFloat(appData.total.priceConejo) || 0;
    const totalConejo = globalConejoCount * priceConejo;
    billConejoDisplay.textContent = totalConejo.toFixed(2) + ' €';

    // Stock
    let stockPCount = 0;
    let stockPECount = 0;
    appData.hunters.forEach(h => {
        stockPCount += (parseInt(h.stock.val1) || 0);
        stockPECount += (parseInt(h.stock.val2) || 0);
    });

    stockPCountDisplay.textContent = stockPCount;
    stockPECountDisplay.textContent = stockPECount;

    const m1 = parseFloat(appData.stock.mult1) || 0;
    const m2 = parseFloat(appData.stock.mult2) || 0;

    const totalPeladas = stockPCount * m1;
    const totalPE = stockPECount * m2;

    billPeladasDisplay.textContent = totalPeladas.toFixed(2) + ' €';
    billPEDisplay.textContent = totalPE.toFixed(2) + ' €';

    // Secretarios (Total)
    billSecrDisplay.textContent = secrTotal.toFixed(2) + ' €';

    // Grand Total
    const grandTotal = totalPerdiz + totalConejo + totalPeladas + totalPE + secrTotal;
    // Propina excluded 

    grandTotalDisplay.textContent = grandTotal.toFixed(2) + ' €';

    renderHunterBreakdownList();
}

function renderHunterBreakdownList() {
    const container = document.getElementById('hunter-list-container');
    if (!container) return;
    container.innerHTML = '';

    const hunterCount = appData.hunters.length || 1;
    const pricePerdiz = parseFloat(appData.total.pricePerdiz) || 0;
    const priceConejo = parseFloat(appData.total.priceConejo) || 0;
    const m1 = parseFloat(appData.stock.mult1) || 0;
    const m2 = parseFloat(appData.stock.mult2) || 0;

    // Comparison Diff Share
    let trackerTotal = 0;
    appData.hands.forEach(hand => {
        if (hand.id === 'conejo') return;
        appData.hunters.forEach(hunter => {
            trackerTotal += (hunter.kills[hand.id] || 0);
        });
    });
    const realGathered = parseInt(appData.total.gathered) || 0;
    const diff = realGathered - trackerTotal;
    const diffShare = diff / hunterCount;

    // Secretarios
    const secrCount = parseInt(appData.total.secrCount) || 0;
    const secrPrice = parseFloat(appData.total.secrPrice) || 0;
    const secrTotal = secrCount * secrPrice;
    const secrPerHunter = secrTotal / hunterCount;

    // Propina
    const propina = parseFloat(appData.total.propina) || 0;
    const propinaPerHunter = propina / hunterCount;

    appData.hunters.forEach(hunter => {
        // Perdices
        let hunterPerdizCount = 0;
        appData.hands.forEach(hand => {
            if (hand.id === 'conejo') return;
            hunterPerdizCount += (hunter.kills[hand.id] || 0);
        });

        // Use custom price if set, else global
        const activePerdizPrice = (hunter.perdizPrice !== '' && hunter.perdizPrice !== null)
            ? parseFloat(hunter.perdizPrice)
            : pricePerdiz;

        const costPerdices = hunterPerdizCount * activePerdizPrice;

        // Diff Cost (Extra) - Share of diff * Global Price (Fixed as per request? Or should extra also use custom price? 
        // usually 'Extra' is distributed birds * price. If price is custom, maybe extra birds also pay custom price?
        // User said: "show the extra cost per hunter on a line under perdoces total... instead of adding to the perdices total".
        // Let's assume Extra is calculated with Global Price for consistency unless specified, 
        // OR better, Extra is just "Share of Diff Birds" * "Price". 
        // If hunter has custom price, they likely pay custom price for ALL their birds, including extra share.
        // BUT user said "extra cost... instead of adding".
        // Let's implement: Extra Cost = DiffShare * ActivePrice (or Global? let's stick to Global for Extra to be safe, or Active if easier. 
        // Plan said: "Share of Diff Cost (calculated using Global Price) displayed separately." -> adhering to plan.
        // Plan said: "Share of Diff Cost (calculated using Global Price) displayed separately." -> adhering to plan.
        const costExtra = Math.round(diffShare * pricePerdiz);

        // Conejo
        const hunterConejoCount = (hunter.kills['conejo'] || 0);
        const costConejo = hunterConejoCount * priceConejo;

        // Stock
        const v1 = parseInt(hunter.stock.val1) || 0;
        const v2 = parseInt(hunter.stock.val2) || 0;
        const costStock = (v1 * m1) + (v2 * m2);

        // Round shared costs for list total to match popup
        const secrRounded = Math.round(secrPerHunter);
        const propinaRounded = Math.round(propinaPerHunter);

        const totalCost = costPerdices + costExtra + costConejo + costStock + secrRounded + propinaRounded;

        const item = document.createElement('div');
        item.className = 'hunter-list-item';
        item.innerHTML = `
            <span class="hunter-name-display">${hunter.name}</span>
            <span class="hunter-total-display">${totalCost.toFixed(2)} €</span>
        `;
        item.addEventListener('click', () => showHunterBreakdown(hunter.id));
        container.appendChild(item);
    });
}

function showHunterBreakdown(hunterId) {
    const hunter = appData.hunters.find(h => h.id === hunterId);
    if (!hunter) return;

    const dialog = document.getElementById('hunter-breakdown-dialog');
    const content = dialog.querySelector('.breakdown-content');
    const title = dialog.querySelector('h3');
    title.textContent = hunter.name;
    content.innerHTML = '';

    const hunterCount = appData.hunters.length || 1;
    const pricePerdiz = parseFloat(appData.total.pricePerdiz) || 0;
    const priceConejo = parseFloat(appData.total.priceConejo) || 0;
    const m1 = parseFloat(appData.stock.mult1) || 0;
    const m2 = parseFloat(appData.stock.mult2) || 0;
    const l1 = appData.stock.label1 || "P";
    const l2 = appData.stock.label2 || "P & E";

    // Perdices
    let hunterPerdizCount = 0;
    appData.hands.forEach(hand => {
        if (hand.id === 'conejo') return;
        hunterPerdizCount += (hunter.kills[hand.id] || 0);
    });

    // Custom Price Logic - REMOVED per user request
    const activePerdizPrice = pricePerdiz;
    const costPerdices = hunterPerdizCount * activePerdizPrice;

    // Diff Calculation again locally
    let trackerTotal = 0;
    appData.hands.forEach(hand => {
        if (hand.id === 'conejo') return;
        appData.hunters.forEach(h => {
            trackerTotal += (h.kills[hand.id] || 0);
        });
    });
    const realGathered = parseInt(appData.total.gathered) || 0;
    const diff = realGathered - trackerTotal;
    // Round per-hunter diff cost
    const costExtra = Math.round((diff * pricePerdiz) / hunterCount);
    // Diff share is just for display, maybe we don't need it or just calculate it for info?
    const diffShare = diff / hunterCount;

    // Conejo
    const hunterConejoCount = (hunter.kills['conejo'] || 0);
    const costConejo = hunterConejoCount * priceConejo;

    // Stock
    const v1 = parseInt(hunter.stock.val1) || 0;
    const v2 = parseInt(hunter.stock.val2) || 0;
    const costStock1 = v1 * m1;
    const costStock2 = v2 * m2;

    // Shared Costs - Rounded
    const secrCount = parseInt(appData.total.secrCount) || 0;
    const secrPrice = parseFloat(appData.total.secrPrice) || 0;
    const secrTotal = secrCount * secrPrice;
    const secrPerHunter = Math.round(secrTotal / hunterCount);

    const propina = parseFloat(appData.total.propina) || 0;
    const propinaPerHunter = Math.round(propina / hunterCount);

    const total = costPerdices + costExtra + costConejo + costStock1 + costStock2 + secrPerHunter + propinaPerHunter;

    // Helper to create row
    const createRow = (label, valHtml) => {
        const div = document.createElement('div');
        div.className = 'breakdown-row';
        div.innerHTML = `<span>${label}</span><span>${valHtml}</span>`;
        return div;
    };

    // Removed Price Input Row

    // Perdices Line
    content.appendChild(createRow('Perdices (Propia)', `${hunterPerdizCount} x ${activePerdizPrice} = <b>${costPerdices.toFixed(2)} €</b>`));

    // Extra Line
    if (diffShare !== 0) {
        content.appendChild(createRow('Extra (Diff) (Est.)', `${diffShare > 0 ? '+' : ''}${diffShare.toFixed(2)} p. (Est.) = <b>${costExtra.toFixed(0)} €</b>`));
    }

    content.appendChild(createRow('Conejos', `${hunterConejoCount} x ${priceConejo} = <b>${costConejo.toFixed(2)} €</b>`));
    content.appendChild(createRow(l1, `${v1} x ${m1} = <b>${costStock1.toFixed(2)} €</b>`));
    content.appendChild(createRow(l2, `${v2} x ${m2} = <b>${costStock2.toFixed(2)} €</b>`));
    content.appendChild(createRow('Secretarios (Est.)', `<b>${secrPerHunter.toFixed(0)} €</b>`));
    content.appendChild(createRow('Propina (Est.)', `<b>${propinaPerHunter.toFixed(0)} €</b>`));

    const totalRow = document.createElement('div');
    totalRow.className = 'breakdown-total-row';
    totalRow.innerHTML = `<span>Total</span><span>${total.toFixed(2)} €</span>`;
    content.appendChild(totalRow);

    dialog.showModal();
}

// Rendering Main Tracker
function render() {
    const staticFirst = tableHeader.firstElementChild;
    const staticLast = tableHeader.lastElementChild;

    tableHeader.innerHTML = '';
    tableHeader.appendChild(staticFirst);

    // Sort hands: Normal hands first (numeric/time), then Conejo last
    const sortedHands = [...appData.hands].sort((a, b) => {
        if (a.id === 'conejo') return 1;
        if (b.id === 'conejo') return -1;
        return 0; // Keep original order for others
    });

    sortedHands.forEach(hand => {
        const th = document.createElement('th');
        th.className = 'col-hand';
        if (hand.id === 'conejo') {
            th.classList.add('col-conejo');
        }
        th.textContent = hand.name;
        th.dataset.handId = hand.id;
        if (isDeleteMode) th.title = "Click to Delete Hand/Column";
        tableHeader.appendChild(th);
    });

    tableHeader.appendChild(staticLast);

    const emptyState = document.getElementById('tracker-empty-state');
    const tableWrapper = document.querySelector('.data-table-wrapper');

    if (appData.hunters.length === 0) {
        if (emptyState) emptyState.style.display = 'flex';
        if (tableWrapper) tableWrapper.style.display = 'none';
    } else {
        if (emptyState) emptyState.style.display = 'none';
        if (tableWrapper) tableWrapper.style.display = 'block'; // or flex/initial depending on CSS
        // Let's rely on CSS class if feasible, but block is fine for wrapper
    }

    tableBody.innerHTML = '';
    appData.hunters.forEach(hunter => {
        const tr = document.createElement('tr');
        tr.dataset.hunterId = hunter.id;

        const tdName = document.createElement('td');
        tdName.className = 'cell-name';
        tdName.textContent = hunter.name;
        tr.appendChild(tdName);

        let total = 0;
        // Re-sort for row rendering too
        const sortedHandsRow = [...appData.hands].sort((a, b) => {
            if (a.id === 'conejo') return 1;
            if (b.id === 'conejo') return -1;
            return 0;
        });

        sortedHandsRow.forEach(hand => {
            const td = document.createElement('td');
            td.className = 'cell-hand';
            if (hand.id === 'conejo') td.classList.add('cell-conejo');

            const val = hunter.kills[hand.id] || 0;
            // Only add to Total if NOT conejo
            if (hand.id !== 'conejo') {
                total += val;
            }

            if (!isDeleteMode) {
                const input = document.createElement('input');
                input.type = 'number';
                input.inputMode = 'numeric';
                input.className = 'score-input';
                input.value = val === 0 ? '' : val;
                input.placeholder = '0';
                input.dataset.hunterId = hunter.id;
                input.dataset.handId = hand.id;
                td.appendChild(input);
            } else {
                td.textContent = val;
            }
            tr.appendChild(td);
        });

        const tdTotal = document.createElement('td');
        tdTotal.className = 'cell-total';
        tdTotal.textContent = total;
        tdTotal.id = `total-${hunter.id}`;
        tr.appendChild(tdTotal);

        tableBody.appendChild(tr);
    });

    renderFooter();
}

function renderTotalsOnly(hunterId) {
    const hunter = appData.hunters.find(h => h.id === hunterId);
    if (!hunter) return;
    let total = 0;
    appData.hands.forEach(hand => {
        if (hand.id === 'conejo') return; // Exclude conejo from row total update
        total += (hunter.kills[hand.id] || 0);
    });
    const cell = document.getElementById(`total-${hunterId}`);
    if (cell) cell.textContent = total;
    renderFooter();
}

function renderFooter() {
    const footerRow = document.querySelector('#table-footer .footer-row');
    if (!footerRow) return;
    const firstCell = footerRow.firstElementChild;
    const lastCell = footerRow.lastElementChild;
    footerRow.innerHTML = '';
    footerRow.appendChild(firstCell);

    let grandTotal = 0;
    const sortedHandsFooter = [...appData.hands].sort((a, b) => {
        if (a.id === 'conejo') return 1;
        if (b.id === 'conejo') return -1;
        return 0;
    });

    sortedHandsFooter.forEach(hand => {
        let handTotal = 0;
        appData.hunters.forEach(hunter => {
            handTotal += (hunter.kills[hand.id] || 0);
        });

        // Add to grand total ONLY if not Conejo (for the "Total" column in footer)
        if (hand.id !== 'conejo') {
            grandTotal += handTotal;
        }

        const td = document.createElement('td');
        td.className = 'cell-hand footer-total';
        if (hand.id === 'conejo') td.classList.add('cell-conejo');
        td.textContent = handTotal;
        td.style.fontWeight = 'bold';
        td.style.textAlign = 'center';
        footerRow.appendChild(td);
    });

    footerRow.appendChild(lastCell);
    const grandTotalCell = document.getElementById('grand-total');
    if (grandTotalCell) grandTotalCell.textContent = grandTotal;
}

function toggleFabMenu() {
    fabContainer.classList.toggle('open');
    const icon = fabMain.querySelector('svg');
    if (fabContainer.classList.contains('open')) {
        icon.style.transform = 'rotate(45deg)';
    } else {
        icon.style.transform = 'rotate(0deg)';
    }
}

function handleScoreChange(e) {
    if (e.target.classList.contains('score-input')) {
        const hId = e.target.dataset.hunterId;
        const handId = e.target.dataset.handId;
        updateKill(hId, handId, e.target.value);
        if (document.getElementById('view-total').classList.contains('active-view')) {
            calculateTotalSection();
        }
    }
}

function handleHeaderClick(e) {
    if (!isDeleteMode) return;
    const th = e.target.closest('th');
    if (th && th.dataset.handId) {
        removeHand(th.dataset.handId);
    }
}

function handleRowClick(e) {
    if (!isDeleteMode) return;
    const tdName = e.target.closest('.cell-name');
    if (tdName) {
        const tr = tdName.parentElement;
        removeHunter(tr.dataset.hunterId);
    }
}

init();
