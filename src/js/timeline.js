import { todayForCalculations } from './utils.js';

function renderTimeline(milestones, filter = 'all') {
    const timelineEl = document.getElementById('timeline');
    if (!timelineEl) return;

    const visibleMilestones = milestones.filter(m => filter === 'all' || m.phase === filter);
    const lastCompletedIndex = visibleMilestones.findLastIndex(m => new Date(m.date + "T00:00:00") <= todayForCalculations);
    const progressPercent = lastCompletedIndex >= 0 ? ((lastCompletedIndex + 1) / visibleMilestones.length) * 100 : 0;

    timelineEl.innerHTML = `<div id="timeline-progress-fill" style="height: ${progressPercent}%"></div>` + visibleMilestones.map(m => {
        const milestoneDate = new Date(m.date + "T00:00:00");
        const isCompleted = milestoneDate <= todayForCalculations;
        const displayDate = milestoneDate.toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Australia/Perth' });
        return `
            <div class="milestone" data-phase="${m.phase}">
                <div class="milestone-header" data-id="${m.id}">
                    <div class="milestone-icon ${isCompleted ? 'completed' : 'future'}">
                        <i class="fas fa-${isCompleted ? 'check' : 'hourglass-start'}"></i>
                    </div>
                    <div class="milestone-content">
                        <div class="milestone-title">${m.title}</div>
                        <div class="milestone-date">${displayDate}</div>
                    </div>
                </div>
                <div class="milestone-details" id="details_${m.id}"><p>${m.details}</p></div>
            </div>`;
    }).join('');

    document.querySelectorAll('.milestone-header').forEach(header => {
        header.addEventListener('click', (e) => {
            const detailsEl = document.getElementById(`details_${e.currentTarget.dataset.id}`);
            detailsEl.classList.toggle('visible');
            if (detailsEl.classList.contains('visible')) {
                e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    });
}

export function initializeTimeline(milestones) {
    renderTimeline(milestones);
    const toggleBtnGroup = document.querySelector('.toggle-btn-group');
    if (toggleBtnGroup) {
        toggleBtnGroup.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                renderTimeline(milestones, e.target.dataset.phase);
            }
        });
    }
}