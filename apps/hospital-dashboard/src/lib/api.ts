const EMERGENCY_SERVICE_URL = process.env.NEXT_PUBLIC_EMERGENCY_API_URL || 'http://localhost:4001';

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
      const DISPATCH_SERVICE_URL = process.env.NEXT_PUBLIC_DISPATCH_API_URL || 'http://localhost:4003';
      const res = await fetch(`${DISPATCH_SERVICE_URL}/api/v1/hospitals/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, hospitalId }),
      });
      if (!res.ok) throw new Error('Failed to accept case');
      return res.json();
    }
  }
};
