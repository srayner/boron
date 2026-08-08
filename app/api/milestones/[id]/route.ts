import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { withAuth } from "@/lib/api/with-auth";
import {
  getMilestone,
  deleteMilestone,
  updateMilestone,
} from "@/services/milestones";
import { AppError } from "@/lib/api/error";

export const GET = withErrorHandling(
  withAuth(
    async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
      const { id: milestoneId } = await params;
      const milestone = await getMilestone(milestoneId);

      if (!milestone) {
        throw new AppError(`Milestone with id ${milestoneId} not found`, 404);
      }

      return { milestone };
    }
  )
);

export const DELETE = withErrorHandling(
  withAuth(
    async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
      const { id: milestoneId } = await params;
      const deletedMilestone = await deleteMilestone(milestoneId);

      return { milestone: deletedMilestone };
    }
  )
);

export const PUT = withErrorHandling(
  withAuth(
    async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
      const { id: milestoneId } = await params;
      const data = await req.json();

      const updatedMilestone = await updateMilestone(milestoneId, data);

      return { milestone: updatedMilestone };
    }
  )
);
