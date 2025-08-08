import { todayForCalculations, calcDays } from './utils.js';

export function initializeDashboard(milestones, costData, config) {
    const dashboardContainer = document.querySelector('.main-content');
    if (!dashboardContainer) return;

    let state = { points: {}, costs: {} };
    const D = (id) => dashboardContainer.querySelector(`#${id}`);

    const elements = {
        currentPoints: D('currentPoints'), pointsProgress: D('pointsProgress'), pointsBreakdown: D('points-breakdown'),
        currentTotalPoints: D('currentTotalPoints'), costTracker: D('cost-tracker'), totalCostSpent: D('total_cost_spent'),
        totalSpentDisplay: D('totalSpentDisplay'), totalBudgetDisplay: D('totalBudgetDisplay'), investmentProgress: D('investmentProgress'),
        daysRemaining: D('daysRemaining'), visaStatus: D('visaStatus'), visaTimeProgress: D('visaTimeProgress'),
        nextMilestoneCountdown: D('nextMilestoneCountdown'), nextMilestoneTitle: D('nextMilestoneTitle'), milestoneProgress: D('milestoneProgress'),
        alertsContainer: D('alertsContainer'),
    };

    function saveState() { localStorage.setItem('prDashboardState', JSON.stringify(state)); }
    function loadState() {
        const savedState = localStorage.getItem('prDashboardState');
        if (savedState) return JSON.parse(savedState);
        const defaultState = { points: {}, costs: {} };
        getPointsData().forEach(p => { defaultState.points[p.id] = p.initial || (p.achievedDate && new Date(p.achievedDate) <= todayForCalculations); });
        costData.forEach(c => defaultState.costs[c.id] = c.paid);
        return defaultState;
    }
    const formatCurrency = (val) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0 }).format(val);
    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        let age = todayForCalculations.getFullYear() - birthDate.getFullYear();
        const m = todayForCalculations.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && todayForCalculations.getDate() < birthDate.getDate())) age--;
        return age;
    };
    function getPointsData() {
        const age = calculateAge(config.userDOB);
        const birthday25 = new Date(config.userDOB);
        birthday25.setFullYear(birthday25.getFullYear() + 25);

        const jrpCompletionMilestone = milestones.find(m => m.id === 'jrp_complete');
        const workExpAchievedDate = jrpCompletionMilestone ? jrpCompletionMilestone.date : null;

        return [
            { id: 'age', label: 'Age', points: 30, currentPoints: 25, achievedDate: birthday25.toISOString().split('T')[0], tooltip: `You are currently ${age}. You get 25 points for age 18-24, and 30 points for 25-32. You will turn 25 on ${birthday25.toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })} and get the extra 5 points.` },
            { id: 'english', label: 'Superior English', points: 20, currentPoints: 10, initial: false, tooltip: 'Targeting 20 points for a superior score (e.g., PTE 79+), up from the current 10 points for proficient English.' },
            { id: 'work_exp', label: '1 Year Aus Work Exp', points: 5, achievedDate: workExpAchievedDate, initial: false, tooltip: 'Achieved after completing the 12-month Job Ready Program.' },
            { id: 'degree', label: 'Bachelor Degree', points: 15, initial: true, tooltip: 'Points for your Bachelor of IT degree from Griffith University.' },
            { id: 'study_req', label: 'Australian Study Req', points: 5, initial: true, tooltip: 'Points for completing a 2-year course in Australia.' },
            { id: 'naati', label: 'Community Language', points: 5, initial: false, tooltip: '5 points to be gained by passing the NAATI CCL (Hindi) test.' },
            { id: 'regional', label: 'Regional Study', points: 5, initial: true, tooltip: 'Points for studying your degree in a designated regional area.' },
            { id: 'single', label: 'Single Applicant', points: 10, initial: true, tooltip: '10 points for applying as a single applicant.' },
        ];
    }
    function renderPoints() {
        const pointsData = getPointsData();
        let currentTotal = 0;
        elements.pointsBreakdown.innerHTML = pointsData.map(p => {
            const isAchievedByDate = p.achievedDate && new Date(p.achievedDate) <= todayForCalculations;
            const isChecked = state.points[p.id] || isAchievedByDate;
            const displayPoints = isChecked ? p.points : (p.currentPoints || 0);
            currentTotal += displayPoints;
            // --- FINAL HTML STRUCTURE FIX ---
            return `<div class="points-item">
                        <input type="checkbox" class="interactive-checkbox" id="check_${p.id}" data-id="${p.id}" ${isChecked ? 'checked' : ''} ${isAchievedByDate ? 'disabled' : ''}>
                        <label for="check_${p.id}" class="item-label">${p.label}</label>
                        <div class="tooltip-wrapper">
                            <span class="tooltip">(i)</span>
                            <div class="tooltiptext">${p.tooltip}</div>
                        </div>
                        <span class="points-value ${isChecked ? 'points-achieved' : 'points-pending'}">${displayPoints}</span>
                    </div>`;
        }).join('');
        elements.currentTotalPoints.textContent = currentTotal;
        elements.currentPoints.textContent = currentTotal;
        elements.pointsProgress.style.width = `${(currentTotal / config.pointsTarget) * 100}%`;
        D('points-breakdown').querySelectorAll('.interactive-checkbox:not(:disabled)').forEach(box => {
            box.addEventListener('change', (e) => { state.points[e.target.dataset.id] = e.target.checked; saveState(); renderPoints(); });
        });
    }
    function renderCosts() {
        const totalBudget = costData.reduce((acc, c) => acc + c.amount, 0);
        let totalSpent = 0;
        elements.costTracker.innerHTML = costData.map(c => {
            if (state.costs[c.id]) totalSpent += c.amount;
            return `<div class="cost-item"><input type="checkbox" class="interactive-checkbox" id="check_cost_${c.id}" data-id="${c.id}" ${state.costs[c.id] ? 'checked' : ''}><label for="check_cost_${c.id}" class="item-label">${c.label}</label><span>${formatCurrency(c.amount)}</span></div>`;
        }).join('');
        elements.totalCostSpent.textContent = formatCurrency(totalSpent);
        elements.totalSpentDisplay.textContent = formatCurrency(totalSpent);
        elements.totalBudgetDisplay.textContent = `Budget: ${formatCurrency(totalBudget)}`;
        elements.investmentProgress.style.width = totalBudget > 0 ? `${(totalSpent / totalBudget) * 100}%` : '0%';
        D('cost-tracker').querySelectorAll('.interactive-checkbox').forEach(box => {
            box.addEventListener('change', (e) => { state.costs[e.target.dataset.id] = e.target.checked; saveState(); renderCosts(); });
        });
    }
    function updateMetrics() {
        const extensionMilestone = milestones.find(m => m.id === 'visa_extend');
        const extensionApplied = extensionMilestone && new Date(extensionMilestone.date) <= todayForCalculations;
        const activeExpiryDate = extensionApplied ? config.finalVisaExpiryDate : config.initialVisaExpiryDate;
        const daysLeft = calcDays(todayForCalculations, activeExpiryDate);
        elements.daysRemaining.textContent = daysLeft > 0 ? daysLeft : 'BVA';
        elements.visaStatus.textContent = extensionApplied ? 'Expires Feb 2028 (Ext. Active)' : 'Expires Feb 2027 (Ext. Pending)';
        const totalVisaDuration = calcDays(config.journeyStartDate, activeExpiryDate);
        const visaTimeUsed = calcDays(config.journeyStartDate, todayForCalculations);
        elements.visaTimeProgress.style.width = `${(visaTimeUsed / totalVisaDuration) * 100}%`;
        const futureMilestones = milestones.filter(m => new Date(m.date) > todayForCalculations);
        if (futureMilestones.length > 0) {
            const nextM = futureMilestones[0];
            elements.nextMilestoneCountdown.textContent = calcDays(todayForCalculations, nextM.date);
            elements.nextMilestoneTitle.textContent = nextM.title.replace(/[^\w\s]/gi, '').trim();
            const prevMIndex = milestones.findIndex(m => m.id === nextM.id) - 1;
            const prevMDate = prevMIndex >= 0 ? new Date(milestones[prevMIndex].date) : new Date(config.journeyStartDate);
            const totalDaysBetween = calcDays(prevMDate, nextM.date);
            const daysPassed = calcDays(prevMDate, todayForCalculations);
            elements.milestoneProgress.style.width = totalDaysBetween > 0 ? `${Math.min(100, (daysPassed / totalDaysBetween * 100))}%` : '0%';
        } else {
            elements.nextMilestoneCountdown.textContent = '✓';
            elements.nextMilestoneTitle.textContent = 'Journey Complete!';
            elements.milestoneProgress.style.width = '100%';
        }
    }
    function updateAlerts() {
        const extensionMilestone = milestones.find(m => m.id === 'visa_extend');
        const extensionApplied = extensionMilestone && new Date(extensionMilestone.date) <= todayForCalculations;
        const activeExpiryDate = extensionApplied ? config.finalVisaExpiryDate : config.initialVisaExpiryDate;
        const daysLeft = calcDays(todayForCalculations, activeExpiryDate);
        let alerts = [];
        const currentM = milestones.find(m => { const mDate = new Date(m.date); return mDate >= todayForCalculations && calcDays(todayForCalculations, mDate) <= 14; });
        if (currentM) alerts.push({ type: 'info', msg: `<strong>Current Focus:</strong> ${currentM.title}. This is happening now or in the next two weeks!` });
        if (daysLeft < 90 && daysLeft > 0) alerts.push({ type: 'error', msg: `<strong>CRITICAL:</strong> Less than 90 days remaining on your current visa. Ensure next steps are taken!` });
        else if (daysLeft < 365 && daysLeft > 0) alerts.push({ type: 'warning', msg: `<strong>Attention:</strong> Less than one year remaining on your current visa.` });
        if (alerts.length === 0) alerts.push({ type: 'success', msg: 'All systems are green. You are on track!' });
        elements.alertsContainer.innerHTML = alerts.map(a => `<div class="alert alert-${a.type}"><i class="fas fa-info-circle"></i>${a.msg}</div>`).join('');
    }
    function initializeResetButtons() {
        const handleReset = () => { if (confirm("Are you sure you want to reset all calculators to their default values? This action cannot be undone.")) { localStorage.removeItem('prDashboardState'); location.reload(); } };
        const resetBtn1 = D('resetDataBtn');
        const resetBtn2 = D('resetDataBtn2');
        if (resetBtn1) resetBtn1.addEventListener('click', handleReset);
        if (resetBtn2) resetBtn2.addEventListener('click', handleReset);
    }
    state = loadState(); renderPoints(); renderCosts(); updateMetrics(); updateAlerts(); initializeResetButtons();
}