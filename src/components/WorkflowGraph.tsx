import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { WorkflowData } from '../types/workflow';

interface WorkflowGraphProps {
    workflow: WorkflowData;
}

const WorkflowGraph: React.FC<WorkflowGraphProps> = ({ workflow }) => {
    const { nodes, edges } = useMemo(() => {
        const rfNodes: Node[] = (workflow.nodes || []).map((n, idx) => ({
            id: n.id || String(idx),
            data: { label: n.name },
            position: { x: (n.position?.[0] ?? 100) + idx * 10, y: (n.position?.[1] ?? 100) + idx * 10 },
            type: 'default',
        }));

        const rfEdges: Edge[] = [];
        const conns = workflow.connections || {};
        Object.entries(conns).forEach(([fromId, outputs]) => {
            const mains = (outputs as any).main as Array<Array<{ node: string }>> | undefined;
            if (Array.isArray(mains)) {
                mains.forEach((arr) => {
                    arr.forEach((c, i) => {
                        if (c?.node) {
                            rfEdges.push({ id: `${fromId}-${c.node}-${i}`, source: fromId, target: c.node });
                        }
                    });
                });
            }
        });

        return { nodes: rfNodes, edges: rfEdges };
    }, [workflow]);

    return (
        <div style={{ height: 400, border: '1px solid var(--mui-palette-divider)', borderRadius: 8 }}>
            <ReactFlow nodes={nodes} edges={edges} fitView>
                <Background />
                <MiniMap />
                <Controls />
            </ReactFlow>
        </div>
    );
};

export default WorkflowGraph;



