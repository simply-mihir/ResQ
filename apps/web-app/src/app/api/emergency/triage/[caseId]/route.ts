import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Compute severity from triage answers
function computeSeverity(triage: { conscious: boolean; breathing: boolean; bleeding: boolean }) {
  const { conscious, breathing, bleeding } = triage;

  // CRITICAL: unconscious OR not breathing
  if (!conscious || !breathing) {
    return { tier: 'CRITICAL' as const, score: 95 };
  }
  // HIGH: severe bleeding
  if (bleeding) {
    return { tier: 'HIGH' as const, score: 75 };
  }
  // MEDIUM: conscious, breathing, no severe bleeding but still an emergency
  return { tier: 'MEDIUM' as const, score: 50 };
}

export async function PATCH(req: Request, { params }: { params: { caseId: string } }) {
  try {
    const { caseId } = params;
    const body = await req.json();
    const { conscious, breathing, bleeding } = body;

    if (conscious == null || breathing == null || bleeding == null) {
      return NextResponse.json({ error: 'All triage fields required' }, { status: 400 });
    }

    // Check case exists
    const existingCase = await prisma.emergencyCase.findUnique({ where: { id: caseId } });
    if (!existingCase) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const triageData = { conscious, breathing, bleeding };
    const { tier, score } = computeSeverity(triageData);

    const updated = await prisma.emergencyCase.update({
      where: { id: caseId },
      data: {
        triageData,
        severityTier: tier,
        severityScore: score,
        status: 'TRIAGE_COMPLETE',
      },
    });

    // Record status change
    await prisma.caseStatusHistory.create({
      data: {
        caseId,
        fromStatus: existingCase.status,
        toStatus: 'TRIAGE_COMPLETE',
        changedBy: 'system',
        notes: `Severity: ${tier} (score ${score})`,
      },
    });

    return NextResponse.json({
      caseId: updated.id,
      status: updated.status,
      severityTier: tier,
      severityScore: score,
    });
  } catch (error) {
    console.error('[emergency/triage] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
