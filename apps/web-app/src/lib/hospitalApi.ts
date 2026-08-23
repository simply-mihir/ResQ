const EMERGENCY_SERVICE_URL = '/api/proxy/emergency';
const DISPATCH_SERVICE_URL = '/api/proxy/dispatch';
export const api = {
  emergency: {
    getActive: async () => {
      const res = await fetch(`${EMERGENCY_SERVICE_URL}/emergency/active`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch active emergencies');
      return res.json();
    },
  },
  dispatch: {
    acceptCase: async (caseId: string, hospitalId: string) => {
      const res = await fetch(`${DISPATCH_SERVICE_URL}/api/v1/hospitals/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, hospitalId }),
      });
      if (!res.ok) throw new Error('Failed to accept case');
      return res.json();
    },
    dispatchAmbulance: async (caseId: string) => {
      const res = await fetch(`${DISPATCH_SERVICE_URL}/api/v1/dispatch/ambulance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId }),
      });
      if (!res.ok) throw new Error('Failed to dispatch ambulance');
      return res.json();
    }
  }
};
