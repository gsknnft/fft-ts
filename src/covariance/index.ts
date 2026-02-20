// If using covarience -> 
import { Matrix, covariance } from "ml-matrix";

// Covariance example
// const agents = new Matrix([
//   [
//     /* agent 1 signal history */
//   ],
//   [
//     /* agent 2 signal history */
//   ],
//   // ...
// ]);

export class AgentManager {
  public instanceId: string = "AgentManagerInstance";
  private static instance: AgentManager;
  private agents: Matrix = new Matrix([]);

  constructor(agentsData: Matrix | number[][]) {
    this.agents = agentsData instanceof Matrix ? agentsData : new Matrix(agentsData);
  }

  static getInstance(agentsData: number[][]): AgentManager {
    if (!AgentManager.instance) {
      AgentManager.instance = new AgentManager(agentsData);
    }
    return AgentManager.instance;
  }

  getCovarianceMatrix(): Matrix {
    return covariance(this.agents.transpose());
  }

  setAgentData(agentIndex: number, data: number[]) {
    this.agents.setRow(agentIndex, data);
  }

  getAgentData(agentIndex: number): number[] {
    return this.agents.getRow(agentIndex);
  }

  getAllAgentsData(): number[][] {
    return this.agents.to2DArray();
  }

  streamlineAgentAnalysis(): Matrix {
    return this.getCovarianceMatrix();
  }

  // Additional methods for agent management can be added here 
  addAgent(data: number[]): void {
    this.agents.addRow(data);
  }

  removeAgent(agentIndex: number): void {
    this.agents.removeRow(agentIndex);
  }

  getAgentCount(): number {
    return this.agents.rows;
  }

  getAgentMean(agentIndex: number): number {
    const row = this.agents.getRow(agentIndex);
    return row.reduce((sum, val) => sum + val, 0) / row.length;
  }

  getAgentVariance(agentIndex: number): number {
    const row = this.agents.getRow(agentIndex);
    const mean = this.getAgentMean(agentIndex);
    return row.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / row.length;
  }

  getCorrelationMatrix(): Matrix {
    const n = this.agents.rows;
    const corr = Matrix.zeros(n, n);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const xi = this.agents.getRow(i);
        const xj = this.agents.getRow(j);
        const meanI = this.getAgentMean(i);
        const meanJ = this.getAgentMean(j);
        const numerator = xi.reduce((sum, val, idx) => sum + (val - meanI) * (xj[idx] - meanJ), 0);
        const denominator = Math.sqrt(
          xi.reduce((sum, val) => sum + Math.pow(val - meanI, 2), 0) *
          xj.reduce((sum, val) => sum + Math.pow(val - meanJ, 2), 0)
        );
        corr.set(i, j, denominator === 0 ? 0 : numerator / denominator);
      }
    }
    return corr;
  }

}


