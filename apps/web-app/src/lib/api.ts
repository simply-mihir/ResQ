const getUrl = (url: string | undefined, defaultUrl: string) => {
  const raw = url || defaultUrl;
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
};

const EMERGENCY_SERVICE_URL = getUrl(process.env.NEXT_PUBLIC_EMERGENCY_API_URL, 'http://localhost:4001');
const DISPATCH_SERVICE_URL = getUrl(process.env.NEXT_PUBLIC_DISPATCH_API_URL, 'http://localhost:4003');

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
  },
  dispatch: {
    dispatchAmbulance: async (caseId: string) => {
      const res = await fetch(`${DISPATCH_SERVICE_URL}/api/v1/dispatch/ambulance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId }),
      });
      if (!res.ok) throw new Error('Failed to dispatch ambulance');
      return res.json();
    }
  },
  hospitals: {
    match: async (caseId: string) => {
      const res = await fetch(`${DISPATCH_SERVICE_URL}/api/v1/hospitals/match?caseId=${caseId}`);
      if (!res.ok) throw new Error('Failed to get hospital matches');
      return res.json();
    }
  },
  responder: {
    logQrScan: async (token: string, location: { lat: number, lng: number }) => {
      // Fixed: Removed /api/v1/ to match @Controller('emergency') in backend
      const res = await fetch(`${EMERGENCY_SERVICE_URL}/emergency/scan/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location }),
      });
      if (!res.ok) throw new Error('Failed to log QR scan');
      return res.json();
    }
  }
};
