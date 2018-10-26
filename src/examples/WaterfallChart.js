import React from "react"
import DocumentFrame from "../DocumentFrame"
import { OrdinalFrame } from "semiotic"

const frameProps = {
  size: [700, 400],
  rExtent: [0, 65000],
  rAccessor: "value",
  oAccessor: "name",
  axis: { tickFormat: d => `$${d / 1000}k` },
  style: d => ({
    fill: d.value > 0 ? "green" : "red",
    stroke: "darkgray",
    strokeWidth: 1
  }),
  type: waterfall,
  oLabel: d => <text transform="rotate(45)">{d}</text>,
  margin: { left: 60, top: 20, bottom: 100, right: 20 },
  oPadding: 40,
  data: [
    { name: "Product Revenue", value: 42000 },
    { name: "Services Revenue", value: 21000 },
    { name: "Fixed Costs", value: -17000 },
    { name: "Variable Costs", value: -14000 },
    { name: "Other Costs", value: -10000 },
    { name: "Ransoms", value: 10000 },
    { name: "Cat Rental", value: 10000 },
    { name: "Total" }
  ]
}

function waterfall({ data, rScale, adjustedSize }) {
  const renderedPieces = []
  let currentY = 0
  let currentValue = 0
  const zeroValue = rScale(0)

  const formatLabel = (name, value) => {
    let label = `${(name === "Total" ? Math.abs(value) : value) / 1000}k`

    if (label[0] === "-") {
      label = label[0] + "$" + label.slice(1)
    } else {
      label = "$" + label
    }
    return label
  }
  const fillRule = d =>
    d.name === "Total" ? "#00a2ce" : d.value > 0 ? "#4d430c" : "#b3331d"

  const keys = Object.keys(data)

  keys.forEach(key => {
    //assume only one per column though...
    const thisPiece = data[key].pieceData[0]
    let value = thisPiece.value
    const name = thisPiece.data.name
    if (name === "Total") {
      value = -currentValue
    } else {
      currentValue += value
    }
    const thisColumn = data[name]

    const { x, width } = thisColumn
    const height = rScale(value) - zeroValue
    const margin = frameProps.margin
    let y = adjustedSize[1] - margin.top - height
    if (height < 0) {
      y = adjustedSize[1] - margin.top
    }
    y += margin.top + currentY

    const markObject = {
      o: key,
      piece: thisPiece,
      renderElement: {
        markType: "g",
        children: []
      },
      xy: {
        x: x + width / 2,
        y: y
      }
    }

    renderedPieces.push(markObject)

    markObject.renderElement.children.push(
      <rect
        height={Math.abs(height)}
        x={x}
        y={y}
        width={width}
        style={{ fill: fillRule(thisPiece) }}
      />
    )
    const lineY = name === "Total" || value > 0 ? y : y + Math.abs(height)

    if (name !== "Total") {
      markObject.renderElement.children.push(
        <line
          x1={x + width}
          x2={x + width + frameProps.oPadding}
          y1={lineY}
          y2={lineY}
          style={{ stroke: "gray", strokeDasharray: "5 5" }}
        />
      )
    }
    const textOffset = name === "Total" || value > 0 ? 15 : -5
    markObject.renderElement.children.push(
      <text
        x={x + width / 2}
        y={lineY + textOffset}
        style={{ fontSize: "10px", textAnchor: "middle", fill: "white" }}
      >
        {formatLabel(name, value)}
      </text>
    )

    currentY -= height
  })

  return renderedPieces
}

const WaterfallChart = () => {
  return (
    <div>
      <h2>Waterfall Chart</h2>

      <DocumentFrame
        frameProps={frameProps}
        overrideProps={{
          oLabel: `d => <text transform="rotate(45)">{d}</text>`
        }}
        functions={{
          type: waterfall
        }}
        type={OrdinalFrame}
      />
    </div>
  )
}

export default WaterfallChart