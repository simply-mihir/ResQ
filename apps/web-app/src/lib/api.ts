const EMERGENCY_SERVICE_URL = process.env.NEXT_PUBLIC_EMERGENCY_API_URL || 'http://localhost:4001';

export const api = {
  emergency: {
    trigger: async (lat: number, lng: number) => {
      const res = await fetch(`${EMERGENCY_SERVICE_URL}/emergency/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationLat: lat, locationLng: lng }),
      });
      if (!res.ok) throw new Error('Failed to trigger emergency');
      return res.json();
    },
    submitTriage: async (caseId: string, data: { conscious: boolean; breathing: boolean; bleeding: boolean }) => {
      const res = await fetch(`${EMERGENCY_SERVICE_URL}/emergency/triage/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to submit triage');
      return res.json();
    }
  }
};
