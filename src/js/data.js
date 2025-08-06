export async function loadJourneyData() {
    try {
        const [milestonesResponse, costDataResponse] = await Promise.all([
            fetch('/data/milestones.json'),
            fetch('/data/costData.json')
        ]);

        if (!milestonesResponse.ok || !costDataResponse.ok) {
            throw new Error('Network response was not ok.');
        }

        const milestonesData = await milestonesResponse.json();
        const costData = await costDataResponse.json();

        // Sort milestones by date after fetching
        const milestones = milestonesData.sort((a, b) => new Date(a.date) - new Date(b.date));

        return { milestones, costData };
    } catch (error) {
        console.error("Failed to load journey data:", error);
        // Return empty arrays as a fallback
        return { milestones: [], costData: [] };
    }
}