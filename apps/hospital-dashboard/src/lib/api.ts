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
  }
};
