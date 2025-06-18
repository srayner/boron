import React from "react";
import { translate } from "@/lib/utils";

const RADIAN = Math.PI / 180;

function renderCustomizedLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  name,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  percent: number;
  name: string;
}) {
  const startOffset = 6; // how far beyond outerRadius to start
  const labelOffset = 20; // distance beyond outer radius for bend point
  const bendLength = 10; // horizontal bend length
  const labelSpacing = 6; // space between connector end and label text

  const angleInRadians = -midAngle * RADIAN;

  // Start of connector: on outer radius circle
  const connectorStartX =
    cx + (outerRadius + startOffset) * Math.cos(angleInRadians);
  const connectorStartY =
    cy + (outerRadius + startOffset) * Math.sin(angleInRadians);

  // Bend point: further out on same angle
  const connectorBendX =
    cx + (outerRadius + labelOffset) * Math.cos(angleInRadians);
  const connectorBendY =
    cy + (outerRadius + labelOffset) * Math.sin(angleInRadians);

  // End of connector: horizontal line from bend point
  const connectorEndX =
    connectorBendX > cx
      ? connectorBendX + bendLength
      : connectorBendX - bendLength;
  const connectorEndY = connectorBendY;

  // Label position: slight offset beyond connector end for spacing
  const labelX =
    connectorEndX > cx
      ? connectorEndX + labelSpacing
      : connectorEndX - labelSpacing;
  const labelY = connectorEndY;

  const textAnchor = labelX > cx ? "start" : "end";
  const connectorColor = "#666";

  if (percent < 0.05) return null;

  return (
    <g>
      <polyline
        points={`${connectorStartX},${connectorStartY} ${connectorBendX},${connectorBendY} ${connectorEndX},${connectorEndY}`}
        stroke={connectorColor}
        fill="none"
      />
      <text
        x={labelX}
        y={labelY}
        textAnchor={textAnchor}
        dominantBaseline="middle"
        fontSize={12}
        fill={connectorColor}
      >
        {translate(name)}
      </text>
    </g>
  );
}

export default renderCustomizedLabel;
