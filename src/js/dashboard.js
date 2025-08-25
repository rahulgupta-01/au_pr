// src/js/dashboard.js
import { todayForCalculations, calcDays, escapeHTML } from './utils.js';
// Import from the new centralized store
import { state, setState, subscribe } from './store.js';

// New: Milestone Notification Function
function checkUpcomingMilestones(milestones) {
  const upcoming = milestones.filter(m => {
    const daysUntil = calcDays(todayForCalculations, new Date(m.date));
    return daysUntil > 0 && daysUntil <= 7;
  });

  if (upcoming.length > 0 && 'Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        upcoming.forEach(m => {
          const days = calcDays(todayForCalculations, new Date(m.date));
          new Notification('Upcoming PR Milestone', {
            body: `${m.title} is in ${days} day(s).`,
            icon: '/assets/android-chrome-192x192.png'
          });
        });
      }
    });
  }
}

export function initializeDashboard(milestones, costData, pointsData, config) {
  const dashboardContainer = document.querySelector('.main-content');
  if (!dashboardContainer) return;

  const elements = {
    currentPoints: dashboardContainer.querySelector('#currentPoints'),
    pointsProgress: dashboardContainer.querySelector('#pointsProgress'),
    pointsBreakdown: dashboardContainer.querySelector('#points-breakdown'),
    currentTotalPoints: dashboardContainer.querySelector('#currentTotalPoints'),
    costTracker: dashboardContainer.querySelector('#cost-tracker'),
    totalCostSpent: dashboardContainer.querySelector('#total_cost_spent'),
    totalSpentDisplay: dashboardContainer.querySelector('#totalSpentDisplay'),
    totalBudgetDisplay: dashboardContainer.querySelector('#totalBudgetDisplay'),
    investmentProgress: dashboardContainer.querySelector('#investmentProgress'),
    daysRemaining: dashboardContainer.querySelector('#daysRemaining'),
    visaStatus: dashboardContainer.querySelector('#visaStatus'),
    visaTimeProgress: dashboardContainer.querySelector('#visaTimeProgress'),
    nextMilestoneCountdown: dashboardContainer.querySelector('#nextMilestoneCountdown'),
    nextMilestoneTitle: dashboardContainer.querySelector('#nextMilestoneTitle'),
    milestoneProgress: dashboardContainer.querySelector('#milestoneProgress'),
    alertsContainer: dashboardContainer.querySelector('#alertsContainer'),
    pointsTargetDisplay: dashboardContainer.querySelector('#pointsTargetDisplay'),
    resetDataBtn: dashboardContainer.querySelector('#resetDataBtn'),
    resetDataBtn2: dashboardContainer.querySelector('#resetDataBtn2')
  };

  // Helper function to handle checkbox interactions
  function addCheckboxListeners(container, stateKey) {
    container.querySelectorAll('.interactive-checkbox:not(:disabled)').forEach(box => {
      box.addEventListener('change', (e) => {
        const id = e.target.dataset.id;
        // Create a new state object based on the current state
        const updatedStateSlice = { ...state[stateKey], [id]: !!e.target.checked };
        // Use the centralized setState function to update the specific part of the state
        setState({ [stateKey]: updatedStateSlice });
      });
    });
  }

  const formatCurrency = (val) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0 }).format(val);

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    let age = todayForCalculations.getFullYear() - birthDate.getFullYear();
    const m = todayForCalculations.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && todayForCalculations.getDate() < birthDate.getDate())) age--;
    return age;
  };

  function getProcessedPointsData() {
    const age = calculateAge(config.userDOB);
    const dob = new Date(config.userDOB);
    const jrpCompletionMilestone = milestones.find(m => m.id === 'jrp_complete');

    return pointsData.map(p => {
        const processedPoint = {...p};
        if (p.achievedDate === 'BIRTHDAY_25') {
            const year25 = dob.getFullYear() + 25;
            const month = dob.getMonth();
            const day = dob.getDate();
            processedPoint.achievedDate = new Date(year25, month, day).toISOString().slice(0, 10);
            processedPoint.currentPoints = age < 25 ? 25 : 30;
        }
        if (p.achievedDate === 'JRP_COMPLETE') {
            processedPoint.achievedDate = jrpCompletionMilestone ? jrpCompletionMilestone.date : null;
        }
        return processedPoint;
    });
  }

  function renderPoints() {
    const processedPointsData = getProcessedPointsData();
    let currentTotal = 0;
    elements.pointsBreakdown.innerHTML = processedPointsData.map(p => {
      const isAchievedByDate = p.achievedDate && new Date(p.achievedDate) <= todayForCalculations;
      const isChecked = !!state.points[p.id] || isAchievedByDate || !!p.initial;
      const displayPoints = isChecked ? p.points : (p.currentPoints || 0);
      currentTotal += displayPoints;
      return `<div class="points-item">
        <input type="checkbox" class="interactive-checkbox" id="check_${escapeHTML(p.id)}" data-id="${escapeHTML(p.id)}" ${isChecked ? 'checked' : ''} ${isAchievedByDate ? 'disabled' : ''}>
        <label for="check_${escapeHTML(p.id)}" class="item-label">${escapeHTML(p.label)}</label>
        <div class="tooltip-wrapper">
          <span class="tooltip" aria-label="More info">(i)</span>
          <div class="tooltiptext">${escapeHTML(p.tooltip)}</div>
        </div>
        <span class="points-value ${isChecked ? 'points-achieved' : 'points-pending'}">${displayPoints}</span>
      </div>`;
    }).join('');

    elements.currentTotalPoints.textContent = currentTotal;
    elements.currentPoints.textContent = currentTotal;
    elements.pointsProgress.style.width = `${Math.min(100, (currentTotal / config.pointsTarget) * 100)}%`;

    if (elements.pointsBreakdown) {
      addCheckboxListeners(elements.pointsBreakdown, 'points');
      elements.pointsBreakdown.querySelectorAll('.tooltip-wrapper').forEach(wrapper => {
        wrapper.addEventListener('click', (e) => {
          document.querySelectorAll('.tooltip-wrapper.is-active').forEach(w => {
            if (w !== wrapper) w.classList.remove('is-active');
          });
          wrapper.classList.toggle('is-active');
        });
      });
    }
  }

  function renderCosts() {
    const totalBudget = costData.reduce((acc, item) => acc + item.amount, 0);
    let totalSpent = 0;

    elements.costTracker.innerHTML = costData.map(c => {
      const isPaid = c.paid === true;
      const isChecked = isPaid || !!state.costs[c.id];
      if (isChecked) {
        totalSpent += c.amount;
      }
      return `<div class="cost-item">
          <input type="checkbox" class="interactive-checkbox" id="cost_${escapeHTML(c.id)}" data-id="${escapeHTML(c.id)}" ${isChecked ? 'checked' : ''} ${isPaid ? 'disabled' : ''}>
          <label for="cost_${escapeHTML(c.id)}">${escapeHTML(c.label)}</label>
          <span>${formatCurrency(c.amount)}</span>
        </div>`;
    }).join('');

    elements.totalCostSpent.textContent = formatCurrency(totalSpent);
    elements.totalSpentDisplay.textContent = formatCurrency(totalSpent);
    elements.totalBudgetDisplay.textContent = `Budget: ${formatCurrency(totalBudget)}`;
    elements.investmentProgress.style.width = totalBudget > 0 ? `${Math.min(100, (totalSpent / totalBudget) * 100)}%` : '0%';

    if (elements.costTracker) {
      addCheckboxListeners(elements.costTracker, 'costs');
    }
  }

  function updateMetrics() {
    const extensionMilestone = milestones.find(m => m.id === 'visa_extend');
    const extensionApplied = extensionMilestone && new Date(extensionMilestone.date) <= todayForCalculations;
    const activeExpiryDate = extensionApplied ? config.finalVisaExpiryDate : config.initialVisaExpiryDate;

    const daysLeft = calcDays(todayForCalculations, activeExpiryDate);
    elements.daysRemaining.textContent = daysLeft > 0 ? daysLeft : 'BVA';
    elements.visaStatus.textContent = extensionApplied ? 'Expires Feb 2028 (Ext. Active)' : 'Expires Feb 2027 (Ext. Pending)';

    const totalVisaDuration = Math.max(1, calcDays(config.journeyStartDate, activeExpiryDate));
    const visaTimeUsed = Math.max(0, calcDays(config.journeyStartDate, todayForCalculations));
    elements.visaTimeProgress.style.width = `${Math.min(100, (visaTimeUsed / totalVisaDuration) * 100)}%`;

    if (elements.pointsTargetDisplay) {
      elements.pointsTargetDisplay.textContent = `Target: ${config.pointsTarget}`;
    }

    const futureMilestones = milestones.filter(m => new Date(m.date) > todayForCalculations);
    if (futureMilestones.length > 0) {
      const nextM = futureMilestones[0];
      elements.nextMilestoneCountdown.textContent = calcDays(todayForCalculations, nextM.date);
      elements.nextMilestoneTitle.textContent = escapeHTML((nextM.title || '').replace(/[^\w\s]/gi, '').trim());

      const prevIndex = Math.max(0, milestones.findIndex(m => m.id === nextM.id) - 1);
      const prevMDate = prevIndex >= 0 ? new Date(milestones[prevIndex].date) : new Date(config.journeyStartDate);
      const totalDaysBetween = Math.max(1, calcDays(prevMDate, nextM.date));
      const daysElapsed = Math.max(0, calcDays(prevMDate, todayForCalculations));
      elements.milestoneProgress.style.width = `${Math.min(100, (daysElapsed / totalDaysBetween) * 100)}%`;
    } else {
      elements.nextMilestoneCountdown.textContent = '—';
      elements.nextMilestoneTitle.textContent = 'All milestones completed';
      elements.milestoneProgress.style.width = '100%';
    }
  }

  function updateAlerts() {
    const extensionMilestone = milestones.find(m => m.id === 'visa_extend');
    const extensionApplied = extensionMilestone && new Date(extensionMilestone.date) <= todayForCalculations;
    const activeExpiryDate = extensionApplied ? config.finalVisaExpiryDate : config.initialVisaExpiryDate;
    const daysLeft = calcDays(todayForCalculations, activeExpiryDate);

    let alerts = [];

    const currentM = milestones.find(m => {
      const mDate = new Date(m.date);
      return mDate >= todayForCalculations && calcDays(todayForCalculations, mDate) <= 14;
    });
    if (currentM) alerts.push({ type: 'info', msg: `<strong>Upcoming:</strong> ${escapeHTML(currentM.title)}. This is happening now or in the next two weeks!` });

    if (daysLeft < 90 && daysLeft > 0) alerts.push({ type: 'warning', msg: '<strong>Visa alert:</strong> Less than 90 days remaining on your current visa. Ensure next steps are taken!' });
    else if (daysLeft < 365 && daysLeft > 0) alerts.push({ type: 'info', msg: '<strong>Visa alert:</strong> Less than one year remaining on your current visa.' });

    if (alerts.length === 0) alerts.push({ type: 'success', msg: 'All systems are green. You are on track!' });

    elements.alertsContainer.innerHTML = alerts.map(a => {
      const cls = a.type === 'success' ? 'alert-success' :
                  a.type === 'warning' ? 'alert-warning' :
                  a.type === 'error'   ? 'alert-error'   : 'alert-info';
      return `<div class="alert ${cls}"><i class="fas fa-info-circle" aria-hidden="true"></i>${a.msg}</div>`;
    }).join('');
  }

  function initializeResetButtons() {
    const handleReset = (type) => {
      const message = `Are you sure you want to reset the ${type} tracker?`;
      if (confirm(message)) {
        setState({ [type]: {} });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    if (elements.resetDataBtn) {
      elements.resetDataBtn.addEventListener('click', () => handleReset('points'));
      elements.resetDataBtn.title = 'Reset Points Calculator';
    }
    if (elements.resetDataBtn2) {
      elements.resetDataBtn2.addEventListener('click', () => handleReset('costs'));
      elements.resetDataBtn2.title = 'Reset Investment Tracker';
    }
  }

  // Subscribe to state changes to re-render the dynamic parts of the UI
  subscribe(() => {
    renderPoints();
    renderCosts();
  });

  // Initial setup
  renderPoints();
  renderCosts();
  updateMetrics();
  updateAlerts();
  initializeResetButtons();
  checkUpcomingMilestones(milestones);

  // Remove skeletons and show content after initialization
  dashboardContainer.querySelectorAll('.skeleton-item').forEach(el => el.remove());
  dashboardContainer.querySelectorAll('.metric-item, #points-breakdown > *, #cost-tracker > *').forEach(el => {
    if(el.style.display === 'none') el.style.display = '';
  });
}