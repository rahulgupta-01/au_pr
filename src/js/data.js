export async function loadJourneyData(config) {
  const version = (config && config.dataVersion) ? String(config.dataVersion) : '1';
  const LS_KEY = `journeyData_v${version}`;

  try {
    const cached = localStorage.getItem(LS_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.milestones && parsed.costData) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn(`Ignoring corrupt cache for key: ${LS_KEY}`, e);
  }

  try {
    const [milestonesResponse, costDataResponse] = await Promise.all([
      fetch('data/milestones.json', { credentials: 'same-origin' }),
      fetch('data/costData.json', { credentials: 'same-origin' })
    ]);

    if (!milestonesResponse.ok || !costDataResponse.ok) {
      throw new Error('Network response was not ok.');
    }

    const milestonesData = await milestonesResponse.json();
    const costData = await costDataResponse.json();

    // Sort milestones by date after fetching
    const milestones = milestonesData.sort((a, b) => new Date(a.date) - new Date(b.date));

    const payload = { milestones, costData };
    try { localStorage.setItem(LS_KEY, JSON.stringify(payload)); } catch {}
    return payload;
  } catch (error) {
    console.error('Failed to load journey data:', error);
    return { milestones: [], costData: [] };
  }
}