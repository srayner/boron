import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { getCost, deleteCost, updateCost } from "@/services/costs";
import { AppError } from "@/lib/api/error";

export const GET = withErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id: costId } = await params;
    const cost = await getCost(costId);

    if (!cost) {
      throw new AppError(`Cost with id ${costId} not found`, 404);
    }

    return { cost };
  }
);

export const DELETE = withErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id: costId } = await params;
    const deletedCost = await deleteCost(costId);

    return { cost: deletedCost };
  }
);

export const PUT = withErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id: costId } = await params;
    const data = await req.json();

    const updatedCost = await updateCost(costId, data);

    return { cost: updatedCost };
  }
);
