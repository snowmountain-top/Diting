import { groupBy, isEmpty, isNull, keyBy, uniq } from 'lodash'

/**
 * 工作流节点类型定义
 * @property id - 节点唯一标识符
 * @property type - 节点类型，如BEGIN_NODE、SQL_NODE、JS_NODE、END_NODE等
 */
type WorkflowNode = {
  id: string
  type: string
}

/**
 * 工作流节点关系类型定义
 * @property source - 源节点ID
 * @property target - 目标节点ID
 */
type WorkflowRelation = {
  source: string
  target: string
}

const nodes = [
  {
    id: 'begin',
    type: 'BEGIN_NODE',
  },
  {
    id: 'A1',
    type: 'SQL_NODE',
    attributes: {
      sql: 'select 1 as a;',
    },
  },
  {
    id: 'A2',
    type: 'SQL_NODE',
    attributes: {
      sql: 'select 2 as b;',
    },
  },
  {
    id: 'B1',
    type: 'JS_NODE',
    attributes: {
      code: 'return data',
    },
  },
  {
    id: 'C1',
    type: 'SQL_NODE',
    attributes: {
      sql: 'select 3 as c;',
    },
  },
  {
    id: 'C2',
    type: 'SQL_NODE',
    attributes: {
      sql: 'select 4 as d;',
    },
  },
  {
    id: 'D1',
    type: 'JS_NODE',
    attributes: {
      code: 'return data',
    },
  },
  {
    id: 'end',
    type: 'END_NODE',
  },
]

const nodesRelations = [
  {
    source: 'begin',
    target: 'A1',
  },
  {
    source: 'A1',
    target: 'A2',
  },
  {
    source: 'A2',
    target: 'B1',
  },
  {
    source: 'A1',
    target: 'B1',
  },
  {
    source: 'B1',
    target: 'C1',
  },
  {
    source: 'B1',
    target: 'C2',
  },
  {
    source: 'C1',
    target: 'D1',
  },
  {
    source: 'C2',
    target: 'D1',
  },
  {
    source: 'D1',
    target: 'end',
  },
]

/**
 * 工作流类
 * 用于管理和执行有向无环图(DAG)形式的工作流，支持节点间的依赖关系和并行执行
 */
class Workflow {
  /**
   * 节点映射表，用于通过ID快速查找节点
   * @private
   */
  private _nodeMap: Record<string, WorkflowNode>

  /**
   * 正向关系映射表，按source分组，用于查找某节点的所有下游节点
   * @private
   */
  private _positiveRelationMap: Record<string, WorkflowRelation[]>

  /**
   * 反向关系映射表，按target分组，用于查找某节点的所有上游节点
   * @private
   */
  private _negativeRelationMap: Record<string, WorkflowRelation[]>

  /**
   * 当前正在执行的节点列表
   * @private
   */
  private _currentNodes: WorkflowNode[]

  /**
   * 已执行完成的节点ID集合
   * @private
   */
  private _executedNodeIds: Set<string>

  /**
   * 构造函数
   * @param nodes - 工作流节点列表
   * @param relations - 工作流节点间的关系列表
   */
  constructor(
    readonly nodes: WorkflowNode[],
    readonly relations: WorkflowRelation[],
  ) {
    // 将节点列表转换为以ID为键的映射表，便于快速查找
    this._nodeMap = keyBy(nodes, 'id')
    // 按source分组，用于查找某节点的所有下游节点
    this._positiveRelationMap = groupBy(relations, 'source')
    // 按target分组，用于查找某节点的所有上游节点
    this._negativeRelationMap = groupBy(relations, 'target')
    // 初始化当前节点列表为空
    this._currentNodes = []
    // 初始化已执行节点ID集合为空
    this._executedNodeIds = new Set<string>()
  }

  /**
   * 获取节点映射表
   * @returns 以节点ID为键的节点映射表
   */
  get nodeMap() {
    return this._nodeMap
  }

  /**
   * 获取正向关系映射表
   * @returns 以源节点ID为键的关系数组映射表
   */
  get positiveRelationMap() {
    return this._positiveRelationMap
  }

  /**
   * 获取反向关系映射表
   * @returns 以目标节点ID为键的关系数组映射表
   */
  get negativeRelationMap() {
    return this._negativeRelationMap
  }

  /**
   * 获取当前正在执行的节点列表
   * @returns 当前节点列表
   */
  get currentNodes() {
    return this._currentNodes
  }

  /**
   * 判断指定节点是否已准备好执行
   * 当节点的所有上游节点都已执行完成时，该节点才准备好执行
   * @param nodeId - 要检查的节点ID
   * @returns 如果节点已准备好执行则返回true，否则返回false
   */
  isNodePrepared(nodeId: string) {
    // 获取指向该节点的所有关系（即该节点的所有上游节点）
    const prevNodeIds = this.negativeRelationMap[nodeId]
    // 检查所有上游节点是否都已执行完成
    return prevNodeIds.every((node) => this._executedNodeIds.has(node.source))
  }

  /**
   * 获取下一批可执行的节点
   * 如果当前没有执行中的节点，则返回起始节点的下游节点
   * 否则返回当前节点的所有下游节点中已准备好执行的节点
   * @returns 下一批可执行的节点数组
   */
  getNextNodes(): WorkflowNode[] {
    // 如果当前没有执行中的节点，说明是工作流的起始阶段
    if (isEmpty(this._currentNodes)) {
      // 获取begin节点的所有下游节点关系
      const nextNodeIds = this.positiveRelationMap.begin
      // 返回这些下游节点
      return nextNodeIds.map((node) => this.nodeMap[node.target])
    }

    // 从当前执行中的节点获取所有可能的下游节点ID
    const nextNodeIds = this._currentNodes.reduce((acc, cur) => {
      // 获取当前节点的所有下游节点关系
      const nextNodeIds = this.positiveRelationMap[cur.id]
      // 如果没有下游节点，则返回当前累积的结果
      if (isEmpty(nextNodeIds)) {
        return acc
      }
      // 将当前节点的下游节点ID添加到累积结果中
      return acc.concat(nextNodeIds.map((node) => node.target))
    }, [])

    // 从所有可能的下游节点中，筛选出已准备好执行的节点（所有上游依赖都已完成）
    // 并去除重复节点
    return uniq(
      nextNodeIds
        .map((nodeId) => this.nodeMap[nodeId])
        .filter((node) => this.isNodePrepared(node.id)),
    )
  }

  /**
   * 执行下一批节点任务
   * 获取下一批可执行的节点，执行它们，并更新工作流状态
   * @returns 执行的节点数组，如果没有可执行的节点则返回null
   */
  async runNextNodes() {
    // 获取下一批可执行的节点
    const nextNodes = this.getNextNodes()
    // 如果没有可执行的节点，说明工作流已结束，返回null
    if (isEmpty(nextNodes)) {
      return null
    }

    // TODO 执行节点任务，这里应该根据节点类型执行不同的操作

    // 执行完后，更新当前节点为刚执行的节点
    this._currentNodes = nextNodes
    // 将刚执行的节点添加到已执行节点集合中
    nextNodes.forEach((node) => {
      this._executedNodeIds.add(node.id)
    })
    // 返回执行的节点
    return nextNodes
  }
}

;(async () => {
  const workflow = new Workflow(nodes, nodesRelations)
  while (true) {
    const nodes = await workflow.runNextNodes()
    if (isNull(nodes)) {
      break
    }
    console.info(JSON.stringify(nodes, null, 2))
  }
})()
