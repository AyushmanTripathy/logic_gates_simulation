import { Connector } from "./core/Connection"
import Simulation from "./core/Simulation"

interface ConnectionExport {
  hash: string
  to: string
  from: string
}

interface GateExport {
  offsetX: number
  offsetY: number
  name: string

  inputDots: string[]
  outputDots: string[]
}

interface DimensionExport {
  windowHeight: number
  windowWidth: number
}

interface SimulationExport {
  connections: ConnectionExport[]
  gates: GateExport[]
  dimensions: DimensionExport
}

export function exportSimulation(exportName: string, sim: Simulation) {
  const gates: GateExport[] = []
  for (const box of sim.boxes) {
    gates.push({
      offsetX: box.x,
      offsetY: box.y,
      inputDots: box.inputContainer?.dots?.map(x => x.hashId) ?? [],
      outputDots: box.outputContainer?.dots?.map(x => x.hashId) ?? [],
      name: box.gate.name,
    })
  }

  const connections: ConnectionExport[] = []
  for (const conHash of Object.keys(Connector.instance.connections)) {
    const conn = Connector.instance.connections[conHash]
    connections.push({
      hash: conHash,
      from: conn.from.hashId,
      to: conn.to.hashId,
    })
  }

  const exp: SimulationExport = {
    connections,
    gates,
    dimensions: {
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth,
    }
  }

  const expString = JSON.stringify(exp, null, 2)
  const fileName = exportName.replaceAll(/[^a-zA-Z1-9]/g, '_')
  downloadAsFile(`${fileName}.json`, expString)
}

function downloadAsFile(fileName: string, str: string) {
  const a = document.createElement("a")
  a.setAttribute("href", "data:text/plain;charest=utf-8," + encodeURIComponent(str))
  a.setAttribute("download", fileName)
  a.style.display = "none"
  a.click()
}
