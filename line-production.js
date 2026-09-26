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

    container.innerHTML = Object.values(machines).map(m => {
        const gradesHtml = m.grades.map(g => `<span class="mach-grade-badge ${g.toLowerCase()}">${g}</span>`).join(' ');
        const rangeText = `${fmt(m.minDeckle)} – ${fmt(m.maxDeckle)}`;
        const statusText = m.active ? 'พร้อมเดินเครื่อง' : 'ปิดซ่อมบำรุง';

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
                    <span class="mach-length-title">ความยาวผลิต (หน้ากว้าง)</span>
                    <span class="mach-length-num num">${rangeText} <span class="mach-length-unit">มม.</span></span>
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
            showToast(`${machines[pmId].name} ${machines[pmId].active ? 'เปิดใช้งาน' : 'ปิดซ่อมบำรุง'}`);
        });
    });

    const activeList = Object.values(machines).filter(m => m.active);
    const summary = $('mach-summary');
    if (summary) {
        const activeDetails = activeList.length > 0
            ? activeList.map(m => `<strong>${m.name}</strong> (${fmt(m.minDeckle)}–${fmt(m.maxDeckle)} มม.)`).join(', ')
            : '<span style="color:#ef4444; font-weight:600;">ไม่มีเครื่องจักรที่เปิดใช้งาน (กรุณาเปิดอย่างน้อย 1 เครื่อง)</span>';
        summary.innerHTML = `เปิดใช้งาน <strong>${activeList.length} จาก 4 เครื่อง</strong>: ${activeDetails}`;
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
                    <span style="font-size: .6875rem; color: var(--muted); display: block;">ความยาวต่ำสุด (มม.)</span>
                    <input type="number" class="mini-input num" value="${m.minDeckle}" data-pm-min="${m.id}" step="10">
                </div>
                <div>
                    <span style="font-size: .6875rem; color: var(--muted); display: block;">ความยาวสูงสุด (มม.)</span>
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
                <button type="button" class="del-order-btn" title="ลบรายการ" data-del="${idx}">
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
            showToast('ลบออเดอร์แล้ว');
        });
    });

    const totalRolls = currentOrders.reduce((sum, o) => sum + (Number(o.qty) || 0), 0);
    const summary = $('order-quick-summary');
    if (summary) {
        summary.textContent = `รวม ${currentOrders.length} รายการ (${fmt(totalRolls)} ม้วน)`;
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

    // 1. Result Main Banner
    const machTitle = plan.usedMachines.map(id => machines[id].name).join(' + ');
    $('result-machine').textContent = machTitle;
    $('result-machine-sub').textContent = plan.activeCount === 1 ? 'เดินเครื่องเดียว' : `${plan.activeCount} เครื่องพร้อมกัน`;

    if (plan.activeCount === 1) {
        const m = machines[plan.usedMachines[0]];
        $('result-badge').textContent = '✓ คุ้มค่าสูงสุด (เดินเครื่องเดียว)';
        $('result-detail').textContent = `รวบรวมคำสั่งผลิตทั้งหมดมารันบน ${m ? m.name : machTitle} [ช่วงความยาวหน้ากว้าง ${m ? `${fmt(m.minDeckle)}–${fmt(m.maxDeckle)} มม.` : ''}] เพียงเครื่องเดียว ช่วยประหยัดต้นทุนค่าเปิดเครื่องจักรสูงสุด พร้อมรักษาเศษ Trim Loss รวมเพียง ${fmt(plan.overallTrimPercent, 1)}%`;
    } else {
        const machDetails = plan.usedMachines.map(id => `${machines[id].name} (${fmt(machines[id].minDeckle)}–${fmt(machines[id].maxDeckle)} มม.)`).join(' และ ');
        $('result-badge').textContent = '2 เครื่อง (ตามขนาดหน้ากว้าง)';
        $('result-detail').textContent = `แบ่งการผลิตตามช่วงความยาวหน้ากว้างของ ${machDetails} ช่วยลดเศษ Trim Loss รวมเหลือเพียง ${fmt(plan.overallTrimPercent, 1)}%`;
    }

    $('stat-active-machines').textContent = `${plan.activeCount} เครื่อง`;
    $('stat-trim').textContent = `${fmt(plan.overallTrimPercent, 1)}%`;
    $('stat-sets').textContent = `${fmt(plan.totalSets)} ม้วน`;
    $('stat-rolls').textContent = `${fmt(plan.totalSlitRolls)} ม้วน`;
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
}

function renderNoSolution() {
    $('result-machine').textContent = 'ไม่พบเครื่องที่รองรับ';
    $('result-machine-sub').textContent = '0 เครื่อง';
    $('result-badge').textContent = 'เกิดข้อผิดพลาด';
    $('result-detail').textContent = 'ขนาดหน้ากว้างของบางออเดอร์เกินขีดจำกัดสูงสุดของเครื่องจักร หรือไม่มีเครื่องที่รองรับเกรดกระดาษที่เปิดใช้งาน โปรดตรวจสอบสเปกเครื่องจักร';
    $('stat-active-machines').textContent = '0';
    $('stat-trim').textContent = '—';
    $('stat-sets').textContent = '—';
    $('stat-rolls').textContent = '—';
    $('stat-utilization').textContent = '0%';
    $('diagram-area').innerHTML = '<div class="empty-diagram">ไม่มีชุดการตัดที่เข้ากันได้</div>';
    $('comparison-tbody').innerHTML = '';
    $('workorder-tbody').innerHTML = '';
}

function renderDiagramAndControls(plan) {
    const area = $('diagram-area');
    const subtitle = $('plan-subtitle');
    const patLabel = $('pat-label');
    if (!area || !plan || !plan.patterns || plan.patterns.length === 0) return;

    const totalPats = plan.patterns.length;
    if (activePatternIndex >= totalPats) activePatternIndex = 0;

    const activePat = plan.patterns[activePatternIndex];

    subtitle.textContent = `ชุดตัดที่ ${activePatternIndex + 1} จาก ${totalPats} (${activePat.machineName} · เกรด ${activePat.grade})`;
    patLabel.textContent = `${activePatternIndex + 1} / ${totalPats}`;

    $('mini-deckle').textContent = `${fmt(activePat.deckleSetting)} มม.`;
    $('mini-sets').textContent = `${fmt(activePat.sets)} เซ็ต`;
    $('mini-output').textContent = `${fmt(activePat.cuts.length * activePat.sets)} ม้วน`;

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
            return `
                <div class="slit-roll" style="width: ${pct}%; background: ${color};" title="${c.name || c.id}: ${c.width} มม. (เกรด ${pat.grade})">
                    <span class="roll-w num">${c.width}</span>
                    <span class="roll-name">${c.name || 'ม้วน'}</span>
                </div>
            `;
        }).join('');

        let trimBlock = '';
        if (trimMm > 0) {
            const trimPct = (trimMm / deckle) * 100;
            trimBlock = `
                <div class="trim-waste" style="width: ${trimPct}%;" title="เศษริม: ${trimMm} มม.">
                    เศษ ${trimMm} มม.
                </div>
            `;
        }

        return `
            <div class="diagram-bar-container">
                <div style="font-size: .75rem; color: var(--muted); margin-bottom: 3px; display: flex; justify-content: space-between;">
                    <span><strong>ชุดตัด #${idx + 1}:</strong> ${pat.machineName} (${pat.grade}) · ผลิต ${fmt(pat.sets)} เซ็ต</span>
                    <span class="num">หน้ากว้างแม่ม้วน: ${fmt(deckle)} มม.</span>
                </div>
                <div class="diagram-bar">
                    ${rollBlocks}
                    ${trimBlock}
                </div>
                <div class="knife-line-row num">
                    <span>ตำแหน่งมีดกรีด: ${knifeMarks.join(' → ')} มม.</span>
                    <span>เศษริม: ${trimMm} มม.</span>
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

    tbody.innerHTML = evaluatedPlans.map((p, idx) => {
        const isChosen = idx === selectedPlanIndex;
        return `
            <tr class="${isChosen ? 'chosen' : ''}" style="cursor: pointer;" data-plan-row="${idx}">
                <td>
                    <strong>${p.title}</strong>
                    ${idx === 0 && currentStrategy === 'recommended' ? '<span style="color: #b45309; font-size: .6875rem; margin-left: 6px;">[แนะนำ]</span>' : ''}
                </td>
                <td class="num">${p.activeCount} เครื่อง</td>
                <td class="num">${fmt(p.overallTrimPercent, 1)}%</td>
                <td class="num">${fmt(p.totalSets)} ม้วน</td>
                <td style="color: ${isChosen ? 'var(--blue)' : 'var(--muted)'};">
                    ${isChosen ? 'กำลังดูผังนี้' : 'คลิกเพื่อดู'}
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

    tbody.innerHTML = plan.patterns.map((pat, idx) => {
        const cutsStr = pat.cuts.map(c => `${c.width} มม.`).join(' + ');
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
                <td class="num"><strong>${fmt(pat.deckleSetting)} มม.</strong></td>
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
        showToast('เพิ่มรายการออเดอร์ใหม่แล้ว');
    });

    // Sample Order Presets
    document.querySelectorAll('[data-sample]').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.sample;
            if (SAMPLE_ORDERS[key]) {
                currentOrders = JSON.parse(JSON.stringify(SAMPLE_ORDERS[key]));
                renderAll();
                showToast(`โหลดตัวอย่าง: ${btn.textContent}`);
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
                recommended: 'วิเคราะห์จุดสมดุลที่ดีที่สุดระหว่างการประหยัดค่าเดินเครื่องหลายเครื่องพร้อมกันกับมูลค่าเศษกระดาษ Trim Loss',
                'min-machines': 'รวบรวมคำสั่งผลิตทั้งหมดให้อยู่ในเครื่องจักรจำนวนน้อยที่สุด (เช่น 1 เครื่อง) เพื่อลดค่าพลังงานและทีมงานเดินเครื่อง',
                'min-waste': 'จัดสรรหน้ากว้างของแม่ม้วนให้สอดรับกับขนาดออเดอร์ เพื่อลดเศษกระดาษริม (Trim Loss %) ต่ำที่สุด'
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
            showToast(`นำเข้าสำเร็จ ${imported.length} รายการ`);
            $('paste-textarea').value = '';
            $('paste-details').open = false;
        } else {
            alert('ไม่พบข้อมูลที่ตรงรูปแบบ (ต้องมีเกรด KT/CA, หน้ากว้าง มม. และจำนวนม้วน)');
        }
    });

    // Header Actions
    const copyHandler = () => {
        if (!evaluatedPlans || evaluatedPlans.length === 0) return;
        const plan = evaluatedPlans[selectedPlanIndex];

        let text = `RollPack Pro · สรุปแผนการผลิตและชุดตัดม้วนกระดาษ\n`;
        text += `=========================================\n`;
        text += `เครื่องจักรที่แนะนำ: ${plan.usedMachines.map(id => machines[id].name).join(' + ')} (${plan.activeCount} เครื่อง)\n`;
        text += `อัตราการใช้หน้ากระดาษ: ${fmt(plan.overallUtilization, 1)}% | เศษ Trim: ${fmt(plan.overallTrimPercent, 1)}%\n`;
        text += `จำนวนรอบผลิต (Sets): ${fmt(plan.totalSets)} เซ็ต | ม้วนที่ได้: ${fmt(plan.totalSlitRolls)} ม้วน\n\n`;
        text += `ผังชุดตัด:\n`;

        plan.patterns.forEach((pat, idx) => {
            const cuts = pat.cuts.map(c => `${c.width}มม.`).join(' + ');
            text += `${idx + 1}. [${pat.machineName} · ${pat.grade}] หน้ากว้าง ${pat.deckleSetting} มม. -> ${cuts} | ${pat.sets} เซ็ต (เศษ ${pat.trimMm} มม.)\n`;
        });

        navigator.clipboard.writeText(text).then(() => {
            showToast('คัดลอกรายละเอียดแผนลงคลิปบอร์ดแล้ว');
        });
    };

    $('copy-spec-btn')?.addEventListener('click', copyHandler);
    $('copy-spec-btn-header')?.addEventListener('click', copyHandler);

    $('print-btn')?.addEventListener('click', () => window.print());
    $('print-btn-header')?.addEventListener('click', () => window.print());

    $('reset-button')?.addEventListener('click', () => {
        if (confirm('ต้องการรีเซ็ตข้อมูลทั้งหมดกลับสู่ค่าเริ่มต้นหรือไม่?')) {
            machines = JSON.parse(JSON.stringify(DEFAULT_MACHINES));
            currentOrders = JSON.parse(JSON.stringify(SAMPLE_ORDERS.mix));
            currentStrategy = 'recommended';
            renderAll();
            showToast('รีเซ็ตข้อมูลเริ่มต้นเรียบร้อยแล้ว');
        }
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
