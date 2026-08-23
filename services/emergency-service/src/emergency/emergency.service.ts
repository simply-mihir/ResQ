import { Injectable } from '@nestjs/common';
import { SeverityTier } from '@prisma/client';

export interface ConditionAnswers {
  unconscious?: boolean;
  severeBleeding?: boolean;
  trapped?: boolean;
  breathingProblem?: boolean;
}

@Injectable()
export class EmergencyService {
  computeSeverityTier(situationType: string, conditionAnswers: ConditionAnswers): SeverityTier {
    const { unconscious, severeBleeding, trapped, breathingProblem } = conditionAnswers;

    if (
      unconscious === true ||
      severeBleeding === true ||
      situationType === 'cardiac' ||
      (situationType === 'accident' && trapped === true)
    ) {
      return 'CRITICAL';
    }

    if (breathingProblem === true || situationType === 'accident') {
      return 'HIGH';
    }

    // Since we don't have enough data to differentiate MEDIUM/LOW, let's default to MEDIUM if anything else
    if (Object.values(conditionAnswers).some(Boolean)) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  deriveRequiredSpecialty(situationType: string): string | null {
    switch (situationType) {
      case 'cardiac':
        return 'cardiology';
      case 'accident':
        return 'trauma_surgery';
      case 'stroke':
        return 'neurology';
      default:
        return 'general';
    }
  }
}
