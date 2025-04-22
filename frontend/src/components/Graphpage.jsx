import React from 'react';
import { ForceGraph2D } from 'react-force-graph';

function GraphPage({ data }) {
  const nodes = [];
  const links = [];

  data.forEach((empresa) => {
    nodes.push({ id: empresa.razon_social, type: 'razon_social' });
    empresa.fundadores.forEach((fundador) => {
      if (!nodes.find((node) => node.id === fundador)) {
        nodes.push({ id: fundador, type: 'fundador' });
      }
      links.push({ source: fundador, target: empresa.razon_social });
    });
  });

  const graphData = { nodes, links };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ForceGraph2D
        graphData={graphData}
        nodeAutoColorBy="type"
        nodeLabel={(node) => `${node.id} (${node.type})`}
        linkDirectionalArrowLength={5}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.25}
      />
    </div>
  );
}

export default GraphPage;