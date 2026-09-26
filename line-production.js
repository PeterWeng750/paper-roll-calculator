/**
 * RollPack Pro — Line Production Optimizer (Unified UX)
 * Seamlessly follows RollPack Pro's 1-2-3 step layout, typography, and clean interactions.
 */

'use strict';

// -------------------------------------------------------------
// 1. Data Models & Default State
// -------------------------------------------------------------

const DEFAULT_MACHINES = {
    PM1: {
        id: 'PM1',
        name: 'PM1',
        grades: ['CA'],
        minDeckle: 1600,
        maxDeckle: 1800,
        active: true,
        startupCost: 15000,
        color: '#2563eb',
        sub: 'เกรด CA เท่านั้น'
    },
    PM2: {
        id: 'PM2',
        name: 'PM2',
        grades: ['KT', 'CA'],
        minDeckle: 2000,
        maxDeckle: 2200,
        active: true,
        startupCost: 18000,
        color: '#059669',
        sub: 'เกรด KT และ CA'
    },
    PM3: {
        id: 'PM3',
        name: 'PM3',
        grades: ['KT', 'CA'],
        minDeckle: 2500,
        maxDeckle: 2750,
        active: true,
        startupCost: 22000,
        color: '#7c3aed',
        sub: 'เกรด KT และ CA'
    },
    PM5: {
        id: 'PM5',
        name: 'PM5',
        grades: ['CA'],
        minDeckle: 2400,
        maxDeckle: 2500,
        active: true,
        startupCost: 19000,
        color: '#d97706',
        sub: 'เกรด CA เท่านั้น'
    }
};

let machines = JSON.parse(JSON.stringify(DEFAULT_MACHINES));

const SAMPLE_ORDERS = {
    mix: [
        { id: '1', grade: 'KT', width: 1100, qty: 60, name: 'KT-1100' },
        { id: '2', grade: 'KT', width: 950, qty: 50, name: 'KT-950' },
        { id: '3', grade: 'KT', width: 1250, qty: 40, name: 'KT-1250' },
        { id: '4', grade: 'CA', width: 1050, qty: 80, name: 'CA-1050' },
        { id: '5', grade: 'CA', width: 1200, qty: 60, name: 'CA-1200' },
        { id: '6', grade: 'CA', width: 750, qty: 50, name: 'CA-750' }
    ],
    'ca-only': [
        { id: '1', grade: 'CA', width: 1200, qty: 100, name: 'CA-1200' },
        { id: '2', grade: 'CA', width: 1100, qty: 80, name: 'CA-1100' },
        { id: '3', grade: 'CA', width: 950, qty: 70, name: 'CA-950' },
        { id: '4', grade: 'CA', width: 800, qty: 60, name: 'CA-800' },
        { id: '5', grade: 'CA', width: 650, qty: 50, name: 'CA-650' }
    ],
    'kt-large': [
        { id: '1', grade: 'KT', width: 1300, qty: 60, name: 'KT-1300' },
        { id: '2', grade: 'KT', width: 1250, qty: 50, name: 'KT-1250' },
        { id: '3', grade: 'KT', width: 1150, qty: 45, name: 'KT-1150' },
        { id: '4', grade: 'KT', width: 1200, qty: 40, name: 'KT-1200' }
    ],
    multi: [
        { id: '1', grade: 'KT', width: 1050, qty: 30, name: 'KT-1050' },
        { id: '2', grade: 'KT', width: 900, qty: 40, name: 'KT-900' },
        { id: '3', grade: 'KT', width: 600, qty: 50, name: 'KT-600' },
        { id: '4', grade: 'CA', width: 1250, qty: 45, name: 'CA-1250' },
        { id: '5', grade: 'CA', width: 1000, qty: 60, name: 'CA-1000' },
        { id: '6', grade: 'CA', width: 850, qty: 50, name: 'CA-850' },
        { id: '7', grade: 'CA', width: 700, qty: 40, name: 'CA-700' },
        { id: '8', grade: 'CA', width: 500, qty: 30, name: 'CA-500' }
    ]
};

let currentOrders = JSON.parse(JSON.stringify(SAMPLE_ORDERS.mix));
let currentStrategy = 'recommended'; // 'recommended', 'min-machines', 'min-waste'
let evaluatedPlans = [];
let selectedPlanIndex = 0;
let activePatternIndex = 0;
let viewMode = 'single'; // 'single' or 'all'

let startupCostWeight = 20000;
let trimCostWeight = 50;

const $ = id => document.getElementById(id);
const fmt = (n, digits = 0) => new Intl.NumberFormat('th-TH', { maximumFractionDigits: digits }).format(n);
const t = (key, params, fallback) => (window.RollPackI18n ? window.RollPackI18n.t(key, params, fallback) : (fallback || key));
const getLang = () => (window.RollPackI18n ? window.RollPackI18n.getLanguage() : 'th');

function getPlanTitle(plan) {
    const lang = getLang();
    if (plan.activeCount === 1) {
        const m = machines[plan.usedMachines[0]];
        const name = m ? m.name : plan.usedMachines[0];
        return lang === 'zh' ? `单机 ${name} 独立生产` : `เดินเครื่อง ${name} เครื่องเดียว`;
    }
    return plan.title;
}

// -------------------------------------------------------------
// 2. Cutting Stock & Machine Allocation Engine
// -------------------------------------------------------------

function solveCuttingStock(machine, gradeOrders) {
    if (!gradeOrders || gradeOrders.length === 0) {
        return {
            machineId: machine.id,
            patterns: [],
            totalSets: 0,
            totalSlitRolls: 0,
            totalTrimMm: 0,
            totalTrimPercent: 0,
            utilization: 100,
            possible: true
        };
    }

    const { minDeckle, maxDeckle } = machine;

    for (const ord of gradeOrders) {
        if (ord.width > maxDeckle) {
            return {
                machineId: machine.id,
                patterns: [],
                totalSets: 0,
                totalTrimMm: Infinity,
                totalTrimPercent: 100,
                utilization: 0,
                possible: false,
                reason: `หน้ากว้าง ${ord.width} มม. เกินความจุ ${machine.name} (${maxDeckle} มม.)`
            };
        }
    }

    const items = gradeOrders.map((ord, idx) => ({ ...ord, idx }));
    const validPatterns = [];

    function findPatterns(startIndex, currentCut, currentWidth) {
        if (currentCut.length > 0) {
            validPatterns.push({ cuts: [...currentCut], totalWidth: currentWidth });
        }
        if (currentCut.length >= 6) return;

        for (let i = startIndex; i < items.length; i++) {
            const nextWidth = currentWidth + items[i].width;
            if (nextWidth <= maxDeckle) {
                currentCut.push(items[i].idx);
                findPatterns(i, currentCut, nextWidth);
                currentCut.pop();
            }
        }
    }

    findPatterns(0, [], 0);

    const scoredPatterns = validPatterns.map(p => {
        let deckleSetting = p.totalWidth;
        let trimMm = 0;

        if (p.totalWidth >= minDeckle) {
            deckleSetting = p.totalWidth;
            trimMm = 0;
        } else {
            deckleSetting = minDeckle;
            trimMm = minDeckle - p.totalWidth;
        }

        const wasteRatio = trimMm / deckleSetting;
        return { ...p, deckleSetting, trimMm, wasteRatio };
    });

    const remainingDemand = items.map(it => it.qty);
    const chosenPatterns = [];

    let safetyLoops = 0;
    while (remainingDemand.some(d => d > 0) && safetyLoops < 300) {
        safetyLoops++;

        let bestPat = null;
        let bestScore = -Infinity;

        for (const pat of scoredPatterns) {
            let usefulCuts = 0;
            let overProd = 0;

            for (const itemIdx of pat.cuts) {
                if (remainingDemand[itemIdx] > 0) {
                    usefulCuts += remainingDemand[itemIdx];
                } else {
                    overProd += 40;
                }
            }

            if (usefulCuts === 0) continue;

            const score = (usefulCuts * 10) - (pat.wasteRatio * 70) - overProd;
            if (score > bestScore) {
                bestScore = score;
                bestPat = pat;
            }
        }

        if (!bestPat) {
            const remIdx = remainingDemand.findIndex(d => d > 0);
            if (remIdx === -1) break;
            bestPat = scoredPatterns.find(p => p.cuts.includes(remIdx)) || scoredPatterns[0];
        }

        const patCounts = {};
        for (const idx of bestPat.cuts) patCounts[idx] = (patCounts[idx] || 0) + 1;

        let maxSets = Infinity;
        for (const idxStr of Object.keys(patCounts)) {
            const idx = Number(idxStr);
            const needed = remainingDemand[idx];
            if (needed > 0) {
                const possible = Math.ceil(needed / patCounts[idx]);
                maxSets = Math.min(maxSets, possible);
            }
        }

        const sets = Math.max(1, Number.isFinite(maxSets) ? maxSets : 1);

        for (const idxStr of Object.keys(patCounts)) {
            const idx = Number(idxStr);
            remainingDemand[idx] = Math.max(0, remainingDemand[idx] - (sets * patCounts[idx]));
        }

        chosenPatterns.push({
            machineId: machine.id,
            cuts: bestPat.cuts.map(idx => items[idx]),
            deckleSetting: bestPat.deckleSetting,
            trimMm: bestPat.trimMm,
            sets: sets,
            rollsProduced: bestPat.cuts.length * sets
        });
    }

    const consolidated = [];
    for (const pat of chosenPatterns) {
        const key = pat.cuts.map(c => c.width).sort((a, b) => a - b).join('-') + '@' + pat.deckleSetting;
        const existing = consolidated.find(cp => cp.key === key);
        if (existing) {
            existing.sets += pat.sets;
            existing.rollsProduced += pat.rollsProduced;
        } else {
            consolidated.push({ ...pat, key });
        }
    }

    let totalSets = 0;
    let totalSlitRolls = 0;
    let totalTrimMm = 0;
    let totalDeckleMm = 0;
    let totalProductiveMm = 0;

    for (const p of consolidated) {
        totalSets += p.sets;
        totalSlitRolls += p.rollsProduced;
        totalTrimMm += p.trimMm * p.sets;
        totalDeckleMm += p.deckleSetting * p.sets;
        const cutsWidthSum = p.cuts.reduce((sum, c) => sum + c.width, 0);
        totalProductiveMm += cutsWidthSum * p.sets;
    }

    const utilization = totalDeckleMm > 0 ? (totalProductiveMm / totalDeckleMm) * 100 : 100;
    const totalTrimPercent = totalDeckleMm > 0 ? (totalTrimMm / totalDeckleMm) * 100 : 0;

    return {
        machineId: machine.id,
        patterns: consolidated,
        totalSets,
        totalSlitRolls,
        totalTrimMm,
        totalTrimPercent,
        utilization,
        possible: true
    };
}

function evaluateAllMachinePlans() {
    const ktOrders = currentOrders.filter(o => o.grade === 'KT');
    const caOrders = currentOrders.filter(o => o.grade === 'CA');

    const plans = [];

    function testCandidate(planId, title, ktMachineId, caMachineId) {
        const ktMachine = machines[ktMachineId];
        const caMachine = machines[caMachineId];

        if (ktOrders.length > 0 && (!ktMachine || !ktMachine.active || !ktMachine.grades.includes('KT'))) {
            return null;
        }
        if (caOrders.length > 0 && (!caMachine || !caMachine.active || !caMachine.grades.includes('CA'))) {
            return null;
        }

        const ktResult = ktOrders.length > 0 ? solveCuttingStock(ktMachine, ktOrders) : null;
        if (ktResult && !ktResult.possible) return null;

        const caResult = caOrders.length > 0 ? solveCuttingStock(caMachine, caOrders) : null;
        if (caResult && !caResult.possible) return null;

        const usedMachines = new Set();
        if (ktResult && ktResult.patterns.length > 0) usedMachines.add(ktMachineId);
        if (caResult && caResult.patterns.length > 0) usedMachines.add(caMachineId);

        const activeCount = usedMachines.size;
        const fixedMachineCost = Array.from(usedMachines).reduce((sum, id) => sum + (machines[id].startupCost || startupCostWeight), 0);

        const totalTrimMm = (ktResult ? ktResult.totalTrimMm : 0) + (caResult ? caResult.totalTrimMm : 0);
        const totalSets = (ktResult ? ktResult.totalSets : 0) + (caResult ? caResult.totalSets : 0);
        const totalSlitRolls = (ktResult ? ktResult.totalSlitRolls : 0) + (caResult ? caResult.totalSlitRolls : 0);

        let totalDeckleUsed = 0;
        let totalWidthUsed = 0;

        const allPatterns = [];
        if (ktResult) {
            for (const p of ktResult.patterns) {
                allPatterns.push({ ...p, grade: 'KT', machineName: ktMachine.name, color: ktMachine.color });
                totalDeckleUsed += p.deckleSetting * p.sets;
                totalWidthUsed += p.cuts.reduce((s, c) => s + c.width, 0) * p.sets;
            }
        }
        if (caResult) {
            for (const p of caResult.patterns) {
                allPatterns.push({ ...p, grade: 'CA', machineName: caMachine.name, color: caMachine.color });
                totalDeckleUsed += p.deckleSetting * p.sets;
                totalWidthUsed += p.cuts.reduce((s, c) => s + c.width, 0) * p.sets;
            }
        }

        const overallUtilization = totalDeckleUsed > 0 ? (totalWidthUsed / totalDeckleUsed) * 100 : 100;
        const overallTrimPercent = 100 - overallUtilization;

        const wasteCost = totalTrimMm * (trimCostWeight / 10);
        const costIndex = fixedMachineCost + wasteCost + (totalSets * 120);

        return {
            id: planId,
            title,
            ktMachineId,
            caMachineId,
            activeCount,
            usedMachines: Array.from(usedMachines),
            fixedMachineCost,
            totalTrimMm,
            overallTrimPercent,
            totalSets,
            totalSlitRolls,
            overallUtilization,
            costIndex,
            patterns: allPatterns
        };
    }

    // 1. Single Machine Options
    if (machines.PM2.active) {
        const p2 = testCandidate('PM2-ONLY', 'เดินเครื่อง PM2 เครื่องเดียว', 'PM2', 'PM2');
        if (p2) plans.push(p2);
    }
    if (machines.PM3.active) {
        const p3 = testCandidate('PM3-ONLY', 'เดินเครื่อง PM3 เครื่องเดียว', 'PM3', 'PM3');
        if (p3) plans.push(p3);
    }

    if (ktOrders.length === 0) {
        if (machines.PM1.active) {
            const p1 = testCandidate('PM1-ONLY', 'เดินเครื่อง PM1 เครื่องเดียว', null, 'PM1');
            if (p1) plans.push(p1);
        }
        if (machines.PM5.active) {
            const p5 = testCandidate('PM5-ONLY', 'เดินเครื่อง PM5 เครื่องเดียว', null, 'PM5');
            if (p5) plans.push(p5);
        }
    }

    // 2. Dual Machine Options
    if (ktOrders.length > 0 && caOrders.length > 0) {
        const pairs = [
            ['PM2', 'PM5'], ['PM3', 'PM5'], ['PM2', 'PM1'], ['PM3', 'PM1'], ['PM2', 'PM3'], ['PM3', 'PM2']
        ];
        for (const [ktId, caId] of pairs) {
            const plan = testCandidate(`${ktId}+${caId}`, `${ktId} (KT) + ${caId} (CA)`, ktId, caId);
            if (plan) plans.push(plan);
        }
    }

    evaluatedPlans = plans;
    sortEvaluatedPlans();
}

function sortEvaluatedPlans() {
    if (!evaluatedPlans || evaluatedPlans.length === 0) return;

    if (currentStrategy === 'recommended') {
        evaluatedPlans.sort((a, b) => a.costIndex - b.costIndex);
    } else if (currentStrategy === 'min-machines') {
        evaluatedPlans.sort((a, b) => a.activeCount - b.activeCount || a.costIndex - b.costIndex);
    } else if (currentStrategy === 'min-waste') {
        evaluatedPlans.sort((a, b) => a.overallTrimPercent - b.overallTrimPercent || a.costIndex - b.costIndex);
    }

    selectedPlanIndex = 0;
    activePatternIndex = 0;
}

// -------------------------------------------------------------
// 3. UI Rendering & Synchronization
// -------------------------------------------------------------

function renderAll() {
    renderStep1Machines();
    renderStep2Orders();
    evaluateAllMachinePlans();
    renderStep3Results();
}

/**
 * Step 1: Render Factory Machine Presets (Matches RollPack Pro .presets)
 */
function renderStep1Machines() {
    const container = $('machine-presets');
    if (!container) return;

    const lang = getLang();
    const mmUnit = t('common.mm');

    container.innerHTML = Object.values(machines).map(m => {
        const gradesHtml = m.grades.map(g => `<span class="mach-grade-badge ${g.toLowerCase()}">${g}</span>`).join(' ');
        const rangeText = `${fmt(m.minDeckle)} – ${fmt(m.maxDeckle)}`;
        const statusText = m.active ? t('line.step1.active') : t('line.step1.inactive');

        return `
            <button type="button" class="preset" data-pm="${m.id}" aria-pressed="${m.active}">
                <div class="mach-top-row">
                    <div class="mach-name-wrap">
                        <span class="mach-name">${m.name}</span>
                        ${gradesHtml}
                    </div>
                    <span class="mach-check" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </span>
                </div>

                <div class="mach-length-section">
                    <span class="mach-length-title">${t('line.step1.deckle_title')}</span>
                    <span class="mach-length-num num">${rangeText} <span class="mach-length-unit">${mmUnit}</span></span>
                </div>

                <div class="mach-status-row">
                    <span class="mach-status-dot"></span>
                    <span>${statusText}</span>
                </div>
            </button>
        `;
    }).join('');

    container.querySelectorAll('[data-pm]').forEach(btn => {
        btn.addEventListener('click', () => {
            const pmId = btn.dataset.pm;
            machines[pmId].active = !machines[pmId].active;
            btn.setAttribute('aria-pressed', String(machines[pmId].active));
            renderAll();
            const statusLabel = machines[pmId].active ? t('line.step1.active') : t('line.step1.inactive');
            showToast(`${machines[pmId].name} · ${statusLabel}`);
        });
    });

    const activeList = Object.values(machines).filter(m => m.active);
    const summary = $('mach-summary');
    if (summary) {
        if (activeList.length > 0) {
            const activeDetails = activeList.map(m => `<strong>${m.name}</strong> (${fmt(m.minDeckle)}–${fmt(m.maxDeckle)} ${mmUnit})`).join(', ');
            summary.innerHTML = t('line.step1.active_summary', { count: activeList.length, details: activeDetails });
        } else {
            summary.innerHTML = t('line.step1.none_active');
        }
    }

    // Render Editable fields inside <details>
    const fields = $('machine-fields');
    if (fields) {
        fields.innerHTML = Object.values(machines).map(m => `
            <div style="display: grid; grid-template-columns: 85px 1fr 1fr; gap: 8px; align-items: center; background: #f8fafc; padding: 7px 12px; border-radius: 9px; border: 1px solid var(--line);">
                <div>
                    <strong style="color: var(--navy); display: block;">${m.name}</strong>
                    <div style="font-size: .6875rem; color: var(--muted);">${m.grades.join(', ')}</div>
                </div>
                <div>
                    <span style="font-size: .6875rem; color: var(--muted); display: block;">${t('line.step1.min_len')}</span>
                    <input type="number" class="mini-input num" value="${m.minDeckle}" data-pm-min="${m.id}" step="10">
                </div>
                <div>
                    <span style="font-size: .6875rem; color: var(--muted); display: block;">${t('line.step1.max_len')}</span>
                    <input type="number" class="mini-input num" value="${m.maxDeckle}" data-pm-max="${m.id}" step="10">
                </div>
            </div>
        `).join('');

        fields.querySelectorAll('input').forEach(inp => {
            inp.addEventListener('change', e => {
                const minPm = e.target.dataset.pmMin;
                const maxPm = e.target.dataset.pmMax;
                if (minPm) machines[minPm].minDeckle = Math.max(500, Number(e.target.value) || 1000);
                if (maxPm) machines[maxPm].maxDeckle = Math.max(machines[maxPm].minDeckle, Number(e.target.value) || 2000);
                renderAll();
            });
        });
    }
}

/**
 * Step 2: Render Orders Input Table
 */
function renderStep2Orders() {
    const tbody = $('orders-tbody');
    if (!tbody) return;
    const lang = getLang();
    const rollUnit = t('common.unit_roll');

    tbody.innerHTML = currentOrders.map((ord, idx) => `
        <tr data-index="${idx}">
            <td style="color: var(--muted); font-size: .75rem;">${idx + 1}</td>
            <td>
                <select class="badge-select ${ord.grade === 'KT' ? 'kt' : 'ca'}" data-field="grade">
                    <option value="KT" ${ord.grade === 'KT' ? 'selected' : ''}>KT</option>
                    <option value="CA" ${ord.grade === 'CA' ? 'selected' : ''}>CA</option>
                </select>
            </td>
            <td>
                <input type="number" class="mini-input num" value="${ord.width}" min="100" max="3000" step="5" data-field="width">
            </td>
            <td>
                <input type="number" class="mini-input num" value="${ord.qty}" min="1" max="5000" step="1" data-field="qty">
            </td>
            <td>
                <button type="button" class="del-order-btn" title="${lang === 'zh' ? '删除订单项' : 'ลบรายการ'}" data-del="${idx}">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </td>
        </tr>
    `).join('');

    tbody.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('change', onOrderFieldChange);
    });

    tbody.querySelectorAll('.del-order-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = Number(btn.dataset.del);
            currentOrders.splice(idx, 1);
            renderAll();
            showToast(lang === 'zh' ? '已删除订单项' : 'ลบออเดอร์แล้ว');
        });
    });

    const totalRolls = currentOrders.reduce((sum, o) => sum + (Number(o.qty) || 0), 0);
    const summary = $('order-quick-summary');
    if (summary) {
        summary.textContent = lang === 'zh'
            ? `订单总计 ${currentOrders.length} 项 (${fmt(totalRolls)} ${rollUnit})`
            : `รวม ${currentOrders.length} รายการ (${fmt(totalRolls)} ${rollUnit})`;
    }
}

function onOrderFieldChange(e) {
    const row = e.target.closest('tr');
    if (!row) return;
    const idx = Number(row.dataset.index);
    const field = e.target.dataset.field;

    if (field === 'width' || field === 'qty') {
        currentOrders[idx][field] = Math.max(1, Number(e.target.value) || 0);
    } else {
        currentOrders[idx][field] = e.target.value;
    }

    renderAll();
}

/**
 * Step 3: Render Results (Dark Navy Hero + Slitting Diagram + Comparisons)
 */
function renderStep3Results() {
    if (!evaluatedPlans || evaluatedPlans.length === 0) {
        renderNoSolution();
        return;
    }

    const plan = evaluatedPlans[selectedPlanIndex] || evaluatedPlans[0];
    const lang = getLang();
    const mmUnit = t('common.mm');
    const machUnit = t('common.unit_machine');
    const rollUnit = t('common.unit_roll');
    const setUnit = t('common.unit_set');

    // 1. Result Main Banner
    const machTitle = plan.usedMachines.map(id => machines[id].name).join(' + ');
    $('result-machine').textContent = machTitle;
    $('result-machine-sub').textContent = plan.activeCount === 1
        ? t('line.step3.single_mach')
        : t('line.step3.multi_mach', { count: plan.activeCount });

    if (plan.activeCount === 1) {
        const m = machines[plan.usedMachines[0]];
        $('result-badge').textContent = t('line.step3.badge_single');
        const rangeText = m ? `${fmt(m.minDeckle)}–${fmt(m.maxDeckle)} ${mmUnit}` : '';
        $('result-detail').textContent = t('line.step3.detail_single', {
            name: m ? m.name : machTitle,
            range: rangeText,
            trim: fmt(plan.overallTrimPercent, 1)
        });
    } else {
        const andWord = lang === 'zh' ? ' 与 ' : ' และ ';
        const machDetails = plan.usedMachines.map(id => `${machines[id].name} (${fmt(machines[id].minDeckle)}–${fmt(machines[id].maxDeckle)} ${mmUnit})`).join(andWord);
        $('result-badge').textContent = t('line.step3.badge_multi');
        $('result-detail').textContent = t('line.step3.detail_multi', {
            details: machDetails,
            trim: fmt(plan.overallTrimPercent, 1)
        });
    }

    $('stat-active-machines').textContent = `${plan.activeCount} ${machUnit}`;
    $('stat-trim').textContent = `${fmt(plan.overallTrimPercent, 1)}%`;
    $('stat-sets').textContent = `${fmt(plan.totalSets)} ${rollUnit}`;
    $('stat-rolls').textContent = `${fmt(plan.totalSlitRolls)} ${rollUnit}`;
    $('stat-utilization').textContent = `${fmt(plan.overallUtilization, 1)}%`;

    const progress = $('yield-progress');
    if (progress) {
        progress.value = Math.min(100, Math.max(0, plan.overallUtilization));
    }

    // 2. Slitting Diagram & Pattern Controls
    renderDiagramAndControls(plan);

    // 3. Comparison Table (Matches RollPack Pro .comparison table)
    renderComparisonTable();

    // 4. Work Order Table
    renderWorkOrderTable(plan);

    // 5. Mobile Sticky Bar Summary
    const mobileSum = $('mobile-summary');
    if (mobileSum) {
        mobileSum.textContent = `${machTitle} · ${fmt(plan.totalSets)} ${setUnit} · Trim ${fmt(plan.overallTrimPercent, 1)}%`;
    }
}

function renderNoSolution() {
    const lang = getLang();
    $('result-machine').textContent = lang === 'zh' ? '无匹配机台' : 'ไม่พบเครื่องที่รองรับ';
    $('result-machine-sub').textContent = `0 ${t('common.unit_machine')}`;
    $('result-badge').textContent = lang === 'zh' ? '参数错误' : 'เกิดข้อผิดพลาด';
    $('result-detail').textContent = lang === 'zh'
        ? '部分订单幅宽超出已开启机台最大门幅，或无机台支持该纸种，请检查机台参数与开启状态'
        : 'ขนาดหน้ากว้างของบางออเดอร์เกินขีดจำกัดสูงสุดของเครื่องจักร หรือไม่มีเครื่องที่รองรับเกรดกระดาษที่เปิดใช้งาน โปรดตรวจสอบสเปกเครื่องจักร';
    $('stat-active-machines').textContent = '0';
    $('stat-trim').textContent = '—';
    $('stat-sets').textContent = '—';
    $('stat-rolls').textContent = '—';
    $('stat-utilization').textContent = '0%';
    $('diagram-area').innerHTML = `<div class="empty-diagram">${lang === 'zh' ? '无兼容的分切组合' : 'ไม่มีชุดการตัดที่เข้ากันได้'}</div>`;
    $('comparison-tbody').innerHTML = '';
    $('workorder-tbody').innerHTML = '';

    const mobileSum = $('mobile-summary');
    if (mobileSum) {
        mobileSum.textContent = lang === 'zh' ? '暂无可排产方案' : 'ไม่มีแผนที่รองรับ';
    }
}

function renderDiagramAndControls(plan) {
    const area = $('diagram-area');
    const subtitle = $('plan-subtitle');
    const patLabel = $('pat-label');
    if (!area || !plan || !plan.patterns || plan.patterns.length === 0) return;

    const lang = getLang();
    const mmUnit = t('common.mm');
    const setUnit = lang === 'zh' ? '组' : 'เซ็ต';
    const rollUnit = t('common.unit_roll');
    const totalPats = plan.patterns.length;
    if (activePatternIndex >= totalPats) activePatternIndex = 0;

    const activePat = plan.patterns[activePatternIndex];

    subtitle.textContent = lang === 'zh'
        ? `分切组 ${activePatternIndex + 1} / ${totalPats} (${activePat.machineName} · ${activePat.grade} 纸种)`
        : `ชุดตัดที่ ${activePatternIndex + 1} จาก ${totalPats} (${activePat.machineName} · เกรด ${activePat.grade})`;
    patLabel.textContent = `${activePatternIndex + 1} / ${totalPats}`;

    $('mini-deckle').textContent = `${fmt(activePat.deckleSetting)} ${mmUnit}`;
    $('mini-sets').textContent = `${fmt(activePat.sets)} ${setUnit}`;
    $('mini-output').textContent = `${fmt(activePat.cuts.length * activePat.sets)} ${rollUnit}`;

    const rollColors = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#ea580c'];

    function renderSingleBar(pat, idx) {
        const deckle = pat.deckleSetting;
        const trimMm = pat.trimMm;
        let pos = 0;
        const knifeMarks = [0];

        const rollBlocks = pat.cuts.map(c => {
            const pct = (c.width / deckle) * 100;
            pos += c.width;
            knifeMarks.push(pos);
            const color = rollColors[c.idx % rollColors.length];
            const tooltip = lang === 'zh'
                ? `${c.name || c.id}: ${c.width} mm (${pat.grade} 纸种)`
                : `${c.name || c.id}: ${c.width} มม. (เกรด ${pat.grade})`;
            return `
                <div class="slit-roll" style="width: ${pct}%; background: ${color};" title="${tooltip}">
                    <span class="roll-w num">${c.width}</span>
                    <span class="roll-name">${c.name || (lang === 'zh' ? '纸卷' : 'ม้วน')}</span>
                </div>
            `;
        }).join('');

        let trimBlock = '';
        if (trimMm > 0) {
            const trimPct = (trimMm / deckle) * 100;
            trimBlock = `
                <div class="trim-waste" style="width: ${trimPct}%;" title="${lang === 'zh' ? `边料: ${trimMm} mm` : `เศษริม: ${trimMm} มม.`}">
                    ${lang === 'zh' ? `边料 ${trimMm} mm` : `เศษ ${trimMm} มม.`}
                </div>
            `;
        }

        const barHeader = lang === 'zh'
            ? `<span><strong>分切组 #${idx + 1}：</strong> ${pat.machineName} (${pat.grade}) · 生产 ${fmt(pat.sets)} 组</span>
               <span class="num">母卷门幅: ${fmt(deckle)} mm</span>`
            : `<span><strong>ชุดตัด #${idx + 1}:</strong> ${pat.machineName} (${pat.grade}) · ผลิต ${fmt(pat.sets)} เซ็ต</span>
               <span class="num">หน้ากว้างแม่ม้วน: ${fmt(deckle)} มม.</span>`;

        const knifeFooter = lang === 'zh'
            ? `<span>排刀刻度: ${knifeMarks.join(' → ')} mm</span><span>边料: ${trimMm} mm</span>`
            : `<span>ตำแหน่งมีดกรีด: ${knifeMarks.join(' → ')} มม.</span><span>เศษริม: ${trimMm} มม.</span>`;

        return `
            <div class="diagram-bar-container">
                <div style="font-size: .75rem; color: var(--muted); margin-bottom: 3px; display: flex; justify-content: space-between;">
                    ${barHeader}
                </div>
                <div class="diagram-bar">
                    ${rollBlocks}
                    ${trimBlock}
                </div>
                <div class="knife-line-row num">
                    ${knifeFooter}
                </div>
            </div>
        `;
    }

    if (viewMode === 'single') {
        area.innerHTML = renderSingleBar(activePat, activePatternIndex);
    } else {
        area.innerHTML = plan.patterns.map((p, i) => renderSingleBar(p, i)).join('');
    }
}

function renderComparisonTable() {
    const tbody = $('comparison-tbody');
    if (!tbody || !evaluatedPlans) return;
    const machUnit = t('common.unit_machine');
    const rollUnit = t('common.unit_roll');

    tbody.innerHTML = evaluatedPlans.map((p, idx) => {
        const isChosen = idx === selectedPlanIndex;
        const displayTitle = getPlanTitle(p);
        return `
            <tr class="${isChosen ? 'chosen' : ''}" style="cursor: pointer;" data-plan-row="${idx}">
                <td>
                    <strong>${displayTitle}</strong>
                    ${idx === 0 && currentStrategy === 'recommended' ? `<span style="color: #b45309; font-size: .6875rem; margin-left: 6px;">${t('line.step3.recommended_tag')}</span>` : ''}
                </td>
                <td class="num">${p.activeCount} ${machUnit}</td>
                <td class="num">${fmt(p.overallTrimPercent, 1)}%</td>
                <td class="num">${fmt(p.totalSets)} ${rollUnit}</td>
                <td style="color: ${isChosen ? 'var(--blue)' : 'var(--muted)'};">
                    ${isChosen ? t('line.step3.chosen_status') : t('line.step3.click_to_view')}
                </td>
            </tr>
        `;
    }).join('');

    tbody.querySelectorAll('[data-plan-row]').forEach(row => {
        row.addEventListener('click', () => {
            selectedPlanIndex = Number(row.dataset.planRow);
            activePatternIndex = 0;
            renderStep3Results();
        });
    });
}

function renderWorkOrderTable(plan) {
    const tbody = $('workorder-tbody');
    if (!tbody || !plan || !plan.patterns) return;
    const mmUnit = t('common.mm');

    tbody.innerHTML = plan.patterns.map((pat, idx) => {
        const cutsStr = pat.cuts.map(c => `${c.width} ${mmUnit}`).join(' + ');
        let pos = 0;
        const knives = [0];
        pat.cuts.forEach(c => {
            pos += c.width;
            knives.push(pos);
        });

        return `
            <tr>
                <td class="num" style="font-weight: 700;">#${idx + 1}</td>
                <td><strong>${pat.machineName}</strong></td>
                <td><span style="font-weight: 700; color: ${pat.grade === 'KT' ? '#b45309' : '#047857'};">${pat.grade}</span></td>
                <td class="num"><strong>${fmt(pat.deckleSetting)} ${mmUnit}</strong></td>
                <td class="num">${cutsStr}</td>
                <td class="num" style="font-size: .75rem; color: var(--muted);">${knives.join(' → ')}</td>
                <td class="num" style="font-weight: 700; color: var(--blue);">${fmt(pat.sets)}</td>
                <td class="num" style="color: ${pat.trimMm > 0 ? '#dc2626' : 'var(--success)'};">${pat.trimMm}</td>
            </tr>
        `;
    }).join('');
}

// -------------------------------------------------------------
// 4. Event Handlers & Initializers
// -------------------------------------------------------------

function initEventHandlers() {
    // Add Order
    $('add-order-btn')?.addEventListener('click', () => {
        const nextId = String(currentOrders.length + 1);
        currentOrders.push({
            id: nextId,
            grade: 'KT',
            width: 1000,
            qty: 50,
            name: `ORD-${nextId}`
        });
        renderAll();
        showToast(getLang() === 'zh' ? '已添加新订单项' : 'เพิ่มรายการออเดอร์ใหม่แล้ว');
    });

    // Sample Order Presets
    document.querySelectorAll('[data-sample]').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.sample;
            if (SAMPLE_ORDERS[key]) {
                currentOrders = JSON.parse(JSON.stringify(SAMPLE_ORDERS[key]));
                renderAll();
                showToast(`${getLang() === 'zh' ? '已加载示例' : 'โหลดตัวอย่าง'}: ${btn.textContent}`);
            }
        });
    });

    // Strategy Buttons (Segmented)
    document.querySelectorAll('[data-strategy]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-strategy]').forEach(b => b.setAttribute('aria-pressed', 'false'));
            btn.setAttribute('aria-pressed', 'true');
            currentStrategy = btn.dataset.strategy;

            const helpText = {
                recommended: t('line.step2.help_rec'),
                'min-machines': t('line.step2.help_min_mach'),
                'min-waste': t('line.step2.help_min_waste')
            }[currentStrategy];

            $('strategy-help').textContent = helpText;
            sortEvaluatedPlans();
            renderStep3Results();
        });
    });

    // Pattern Stepper (‹ and ›)
    $('pat-prev')?.addEventListener('click', () => {
        const plan = evaluatedPlans[selectedPlanIndex];
        if (!plan || !plan.patterns || plan.patterns.length <= 1) return;
        activePatternIndex = (activePatternIndex - 1 + plan.patterns.length) % plan.patterns.length;
        renderDiagramAndControls(plan);
    });

    $('pat-next')?.addEventListener('click', () => {
        const plan = evaluatedPlans[selectedPlanIndex];
        if (!plan || !plan.patterns || plan.patterns.length <= 1) return;
        activePatternIndex = (activePatternIndex + 1) % plan.patterns.length;
        renderDiagramAndControls(plan);
    });

    // View Mode Toggle
    $('view-mode-single')?.addEventListener('click', () => {
        viewMode = 'single';
        $('view-mode-single').setAttribute('aria-pressed', 'true');
        $('view-mode-all').setAttribute('aria-pressed', 'false');
        $('pattern-controls').style.display = 'flex';
        renderStep3Results();
    });

    $('view-mode-all')?.addEventListener('click', () => {
        viewMode = 'all';
        $('view-mode-single').setAttribute('aria-pressed', 'false');
        $('view-mode-all').setAttribute('aria-pressed', 'true');
        $('pattern-controls').style.display = 'none';
        renderStep3Results();
    });

    // Excel Paste Box
    $('apply-paste-btn')?.addEventListener('click', () => {
        const text = $('paste-textarea').value.trim();
        if (!text) return;

        const lines = text.split('\n');
        const imported = [];

        lines.forEach((line, i) => {
            const parts = line.split(/[\t,;]+/).map(p => p.trim()).filter(Boolean);
            if (parts.length >= 2) {
                let grade = 'KT';
                let width = 0;
                let qty = 50;
                let name = `ORD-${i + 1}`;

                for (const p of parts) {
                    const up = p.toUpperCase();
                    if (up === 'KT' || up === 'CA') {
                        grade = up;
                    } else if (!width && !isNaN(Number(p)) && Number(p) > 200) {
                        width = Number(p);
                    } else if (width && !isNaN(Number(p))) {
                        qty = Number(p);
                    } else {
                        name = p;
                    }
                }

                if (width > 0) {
                    imported.push({ id: String(i + 1), grade, width, qty, name });
                }
            }
        });

        if (imported.length > 0) {
            currentOrders = imported;
            renderAll();
            showToast(t('toast.import_success', { count: imported.length }, `นำเข้าสำเร็จ ${imported.length} รายการ`));
            $('paste-textarea').value = '';
            $('paste-details').open = false;
        } else {
            alert(getLang() === 'zh' ? '未找到符合格式的数据（需包含纸种 KT/CA、幅宽 mm 及卷数）' : 'ไม่พบข้อมูลที่ตรงรูปแบบ (ต้องมีเกรด KT/CA, หน้ากว้าง มม. และจำนวนม้วน)');
        }
    });

    // Header Actions
    const copyHandler = () => {
        if (!evaluatedPlans || evaluatedPlans.length === 0) return;
        const plan = evaluatedPlans[selectedPlanIndex];
        const lang = getLang();

        let text = lang === 'zh'
            ? `RollPack Pro · 原纸生产排产与分切方案总结\n=========================================\n`
            : `RollPack Pro · สรุปแผนการผลิตและชุดตัดม้วนกระดาษ\n=========================================\n`;

        text += (lang === 'zh' ? `推荐生产机台: ` : `เครื่องจักรที่แนะนำ: `) + `${plan.usedMachines.map(id => machines[id].name).join(' + ')} (${plan.activeCount} ${t('common.unit_machine')})\n`;
        text += (lang === 'zh' ? `幅宽利用率: ` : `อัตราการใช้หน้ากระดาษ: `) + `${fmt(plan.overallUtilization, 1)}% | ` + (lang === 'zh' ? `边料 Trim: ` : `เศษ Trim: `) + `${fmt(plan.overallTrimPercent, 1)}%\n`;
        text += (lang === 'zh' ? `制造轮次 (Sets): ` : `จำนวนรอบผลิต (Sets): `) + `${fmt(plan.totalSets)} ${t('common.unit_roll')} | ` + (lang === 'zh' ? `产出卷数: ` : `ม้วนที่ได้: `) + `${fmt(plan.totalSlitRolls)} ${t('common.unit_roll')}\n\n`;
        text += (lang === 'zh' ? `分切排刀方案:\n` : `ผังชุดตัด:\n`);

        plan.patterns.forEach((pat, idx) => {
            const cuts = pat.cuts.map(c => `${c.width}${t('common.mm')}`).join(' + ');
            if (lang === 'zh') {
                text += `${idx + 1}. [${pat.machineName} · ${pat.grade}] 门幅 ${pat.deckleSetting} mm -> ${cuts} | ${pat.sets} 组 (边料 ${pat.trimMm} mm)\n`;
            } else {
                text += `${idx + 1}. [${pat.machineName} · ${pat.grade}] หน้ากว้าง ${pat.deckleSetting} มม. -> ${cuts} | ${pat.sets} เซ็ต (เศษ ${pat.trimMm} มม.)\n`;
            }
        });

        navigator.clipboard.writeText(text).then(() => {
            showToast(t('toast.copied', null, lang === 'zh' ? '生产方案明细已复制到剪贴板' : 'คัดลอกรายละเอียดแผนลงคลิปบอร์ดแล้ว'));
        });
    };

    $('copy-spec-btn')?.addEventListener('click', copyHandler);
    $('copy-spec-btn-header')?.addEventListener('click', copyHandler);

    $('print-btn')?.addEventListener('click', () => window.print());
    $('print-btn-header')?.addEventListener('click', () => window.print());

    $('reset-button')?.addEventListener('click', () => {
        const confirmMsg = t('confirm.reset', null, getLang() === 'zh' ? '确定要将所有数据重置为默认值吗？' : 'ต้องการรีเซ็ตข้อมูลทั้งหมดกลับสู่ค่าเริ่มต้นหรือไม่?');
        if (confirm(confirmMsg)) {
            machines = JSON.parse(JSON.stringify(DEFAULT_MACHINES));
            currentOrders = JSON.parse(JSON.stringify(SAMPLE_ORDERS.mix));
            currentStrategy = 'recommended';
            renderAll();
            showToast(t('toast.reset_success', null, getLang() === 'zh' ? '已恢复初始默认数据' : 'รีเซ็ตข้อมูลเริ่มต้นเรียบร้อยแล้ว'));
        }
    });

    $('jump-results')?.addEventListener('click', () => {
        const resultsEl = $('results') || $('results-section');
        if (resultsEl) {
            resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Re-render immediately when language is changed via header buttons
    window.addEventListener('languageChanged', () => {
        renderAll();
        const helpText = {
            recommended: t('line.step2.help_rec'),
            'min-machines': t('line.step2.help_min_mach'),
            'min-waste': t('line.step2.help_min_waste')
        }[currentStrategy];
        if ($('strategy-help')) $('strategy-help').textContent = helpText;
    });
}

function showToast(msg) {
    const toast = $('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => toast.classList.remove('show'), 2400);
}

// -------------------------------------------------------------
// 5. Initialize Application
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    initEventHandlers();
    renderAll();
});
